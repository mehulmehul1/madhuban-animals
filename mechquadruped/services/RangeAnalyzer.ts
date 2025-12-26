import * as THREE from 'three';
import { QuadrupedSkeleton } from './Skeleton';
import { Locomotion } from './Locomotion';
import { Chain } from './Chain';

type Sample = {
  t: number;
  jointValues: { [jointName: string]: number }; // radians
};

type JointStats = {
  joint: string;
  min: number;
  max: number;
  range: number;
  maxVel: number;    // rad/s
  maxAcc: number;    // rad/s^2
  maxLeverArm: number; // meters
  estimatedTorqueNm: number; 
};

type AnalyzerOptions = {
  skeleton: QuadrupedSkeleton;      
  locomotion: Locomotion;    
  duration?: number;  
  dt?: number;        
  massKg?: number;    
};

export class RangeAnalyzer {
  skeleton: QuadrupedSkeleton;
  locomotion: Locomotion;
  duration: number;
  dt: number;
  massKg: number;

  constructor(opts: AnalyzerOptions) {
    this.skeleton = opts.skeleton;
    this.locomotion = opts.locomotion;
    this.duration = opts.duration ?? 3.0;
    this.dt = opts.dt ?? 1 / 60;
    this.massKg = opts.massKg ?? 50;
  }

  /**
   * Extracts all bones from known chains in the QuadrupedSkeleton.
   */
  extractJointRegistry(): { name: string; pivot: THREE.Object3D; axisWorld?: THREE.Vector3; chainName: string }[] {
    const reg: { name: string; pivot: THREE.Object3D; axisWorld?: THREE.Vector3; chainName: string }[] = [];

    const chainKeys: { key: keyof QuadrupedSkeleton; name: string }[] = [
      { key: 'spine', name: 'Spine' },
      { key: 'neck', name: 'Neck' },
      { key: 'tail', name: 'Tail' },
      { key: 'flLeg', name: 'FL' },
      { key: 'frLeg', name: 'FR' },
      { key: 'hlLeg', name: 'HL' },
      { key: 'hrLeg', name: 'HR' },
    ];

    for (const { key, name } of chainKeys) {
      const chain = this.skeleton[key] as Chain | undefined;
      if (!chain || !chain.bones) continue;
      
      chain.bones.forEach((bone, i) => {
        if (bone.pivot) {
          // In this skeleton, bones are built along the X-axis. 
          // Joints rotate around Z or Y depending on the limb logic.
          // However, for a general "hinge", we usually rotate around Z (knee bend) or Y (turn).
          // To be safe, we track the LOCAL Z axis as the primary hinge for legs in this specific IK implementation.
          // (See IKSolver.ts: zAxis is the Hinge Axis).
          
          // Get World Rotation of the bone
          const q = bone.pivot.getWorldQuaternion(new THREE.Quaternion());
          
          // Transform Local Z (0,0,1) to World Space to get the hinge axis
          const axisLocal = new THREE.Vector3(0, 0, 1);
          const axisWorld = axisLocal.clone().applyQuaternion(q).normalize();
          
          reg.push({
            name: `${name}_J${i}`,
            pivot: bone.pivot,
            axisWorld,
            chainName: name
          });
        }
      });
    }

    return reg;
  }

  /**
   * Gets the relative angle of the joint around its primary axis.
   */
  getJointAngle(pivot: THREE.Object3D, axisWorld?: THREE.Vector3): number {
    const parent = pivot.parent;
    if (!parent) return 0;

    // World quaternions
    const qParent = parent.getWorldQuaternion(new THREE.Quaternion());
    const qPivot  = pivot.getWorldQuaternion(new THREE.Quaternion());

    if (axisWorld) {
        // Project rotation onto the hinge axis
        // We want the angle between the Parent's "Forward" vector and the Child's "Forward" vector,
        // projected onto the plane perpendicular to the Hinge Axis.
        
        // Let's define "Forward" as Local X (along bone length)
        const refLocal = new THREE.Vector3(1, 0, 0); 
        
        const vParent = refLocal.clone().applyQuaternion(qParent).normalize();
        const vChild  = refLocal.clone().applyQuaternion(qPivot).normalize();

        const axis = axisWorld.clone().normalize();
        
        // Project vectors onto plane perpendicular to axis to measure rotation around it
        // vProj = v - (v . axis) * axis
        vParent.sub(axis.clone().multiplyScalar(vParent.dot(axis))).normalize();
        vChild.sub(axis.clone().multiplyScalar(vChild.dot(axis))).normalize();

        // Angle
        const cross = new THREE.Vector3().crossVectors(vParent, vChild);
        // Direction of rotation relative to axis
        const sign = cross.dot(axis) >= 0 ? 1 : -1;
        
        // Clamp dot product for acos stability
        const dot = Math.min(Math.max(vParent.dot(vChild), -1), 1);
        return Math.acos(dot) * sign;
    }

    // Fallback: Total deviation
    const qRel = qParent.clone().invert().multiply(qPivot);
    const angle = 2 * Math.acos(Math.min(Math.max(qRel.w, -1), 1));
    return ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
  }

  async run(): Promise<{ stats: JointStats[]; samples: Sample[] }> {
    const jointRegistry = this.extractJointRegistry();
    if (jointRegistry.length === 0) {
      throw new Error('RangeAnalyzer: No joints found. Check Skeleton structure.');
    }

    const samples: Sample[] = [];
    
    // Store initial state
    const initialSpeed = this.locomotion.speed;
    const initialTurn = this.locomotion.turn;
    const initialMode = this.locomotion.treadmillMode;

    // Simulation Settings - Force movement
    this.locomotion.speed = 1.0; 
    this.locomotion.turn = 0.0;  
    this.locomotion.treadmillMode = true; // Keep visible

    // Run Loop
    const steps = Math.floor(this.duration / this.dt);
    
    for (let i = 0; i < steps; i++) {
      // Drive Locomotion (which drives IK and Bone Transforms)
      this.locomotion.update(this.dt);
      
      // Force matrix update for correct world positions
      this.skeleton.group.updateMatrixWorld(true);

      // Sample
      const values: { [name: string]: number } = {};
      for (const j of jointRegistry) {
        // Update world axis for sampling based on current transform
        // Re-calculate axisWorld because the bone has moved!
        const q = j.pivot.getWorldQuaternion(new THREE.Quaternion());
        // Axis Z is our Hinge
        const axisLocal = new THREE.Vector3(0, 0, 1); 
        const axisWorld = axisLocal.clone().applyQuaternion(q).normalize();
        
        values[j.name] = this.getJointAngle(j.pivot, axisWorld);
      }
      
      samples.push({ t: i * this.dt, jointValues: values });
    }

    // Restore State
    this.locomotion.speed = initialSpeed;
    this.locomotion.turn = initialTurn;
    this.locomotion.treadmillMode = initialMode;

    // Compute Statistics
    const stats: JointStats[] = [];
    
    // Physics constants
    const loadForce = (this.massKg / 2) * 9.81; 

    for (const j of jointRegistry) {
      let min = Infinity;
      let max = -Infinity;
      let maxVel = 0;
      let maxAcc = 0;
      let prevVal = NaN;
      let prevVel = NaN;

      for (const s of samples) {
        const val = s.jointValues[j.name];
        if (val < min) min = val;
        if (val > max) max = val;

        if (!isNaN(prevVal)) {
          let diff = val - prevVal;
          
          // Angle Wrapping Fix: -PI to PI jump
          // If diff is huge (> PI), we wrapped around.
          if (diff > Math.PI) diff -= 2 * Math.PI;
          if (diff < -Math.PI) diff += 2 * Math.PI;

          const vel = diff / this.dt;
          if (Math.abs(vel) > maxVel) maxVel = Math.abs(vel);

          if (!isNaN(prevVel)) {
            const acc = (vel - prevVel) / this.dt;
            if (Math.abs(acc) > maxAcc) maxAcc = Math.abs(acc);
          }
          prevVel = vel;
        }
        prevVal = val;
      }

      // Torque Estimate
      let maxLeverArm = 0;
      if (['FL', 'FR', 'HL', 'HR'].includes(j.chainName)) {
        // Find corresponding chain manually
        let chain: Chain | undefined;
        if (j.chainName === 'FL') chain = this.skeleton.flLeg;
        else if (j.chainName === 'FR') chain = this.skeleton.frLeg;
        else if (j.chainName === 'HL') chain = this.skeleton.hlLeg;
        else if (j.chainName === 'HR') chain = this.skeleton.hrLeg;

        if (chain && chain.lastBone) {
            const footPos = chain.lastBone.getEndPosition();
            const pivotPos = new THREE.Vector3();
            j.pivot.getWorldPosition(pivotPos);
            maxLeverArm = pivotPos.distanceTo(footPos);
        }
      }

      stats.push({
        joint: j.name,
        min,
        max,
        range: max - min,
        maxVel,
        maxAcc,
        maxLeverArm,
        estimatedTorqueNm: maxLeverArm * loadForce
      });
    }

    this.downloadJSON({ 
      creature: this.skeleton.config.name,
      mass: this.massKg,
      stats 
    }, `mech_analysis_${this.skeleton.config.name}.json`);
    
    this.downloadCSV(stats, `mech_analysis_${this.skeleton.config.name}.csv`);

    return { stats, samples };
  }

  downloadJSON(obj: any, filename: string) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadCSV(stats: JointStats[], filename: string) {
    let csv = 'joint,min_rad,max_rad,range_rad,max_vel_rad_s,max_acc_rad_s2,lever_m,torque_nm\n';
    stats.forEach(s => {
        csv += `${s.joint},${s.min.toFixed(3)},${s.max.toFixed(3)},${s.range.toFixed(3)},${s.maxVel.toFixed(2)},${s.maxAcc.toFixed(2)},${s.maxLeverArm.toFixed(3)},${s.estimatedTorqueNm.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}