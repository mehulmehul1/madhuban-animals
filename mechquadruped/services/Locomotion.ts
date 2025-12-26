import * as THREE from 'three';
import { QuadrupedSkeleton } from './Skeleton';
import { IKSolver } from './IKSolver';
import { Chain } from './Chain';
import { GaitType, GaitConfig } from './CreatureConfig';

interface FootState {
  target: THREE.Vector3;
  plantPos: THREE.Vector3;
  nextPos: THREE.Vector3;
  phaseOffset: number;
  isStance: boolean;
}

export class Locomotion {
  private skeleton: QuadrupedSkeleton;
  private solvers: { [key: string]: IKSolver } = {};
  
  public enabled: boolean = true;
  public speed: number = 0; 
  public turn: number = 0;  
  public treadmillMode: boolean = false;
  public gait: GaitType = 'Walk';

  private velocity = new THREE.Vector3();
  private directionAngle: number = Math.PI / 2; 
  private time: number = 0;
  private currentTurnBend: number = 0;

  private currentGaitConfig: GaitConfig | null = null;

  private feet: { [key: string]: FootState } = {};
  private legIds = ['fl', 'fr', 'hl', 'hr'];

  constructor(skeleton: QuadrupedSkeleton) {
    this.skeleton = skeleton;

    this.solvers['fl'] = new IKSolver(skeleton.flLeg);
    this.solvers['fr'] = new IKSolver(skeleton.frLeg);
    this.solvers['hl'] = new IKSolver(skeleton.hlLeg);
    this.solvers['hr'] = new IKSolver(skeleton.hrLeg);

    this.reset();
  }

  private getChain(id: string): Chain {
    switch(id) {
        case 'fl': return this.skeleton.flLeg;
        case 'fr': return this.skeleton.frLeg;
        case 'hl': return this.skeleton.hlLeg;
        case 'hr': return this.skeleton.hrLeg;
        default: return this.skeleton.flLeg;
    }
  }

  public reset() {
    this.speed = 0;
    this.turn = 0;
    this.velocity.set(0,0,0);
    this.directionAngle = Math.PI / 2;
    this.time = 0;
    this.currentTurnBend = 0;

    this.legIds.forEach(id => {
      this.feet[id] = {
        target: new THREE.Vector3(), 
        plantPos: new THREE.Vector3(),
        nextPos: new THREE.Vector3(),
        phaseOffset: 0,
        isStance: true
      };
    });
    
    this.setGait(this.gait);
  }

  public setGait(gait: GaitType) {
    this.gait = gait;
    const config = this.skeleton.config.locomotion.gaits[gait];
    this.currentGaitConfig = config;
    
    const offsets = config.phaseOffset;
    this.feet['fl'].phaseOffset = offsets.fl;
    this.feet['fr'].phaseOffset = offsets.fr;
    this.feet['hl'].phaseOffset = offsets.hl;
    this.feet['hr'].phaseOffset = offsets.hr;
  }

  public updateStructure() {
    this.legIds.forEach(id => {
        if(this.solvers[id]) this.solvers[id].updateStructure();
    });
  }

  public update(dt: number) {
    if (!this.enabled || !this.currentGaitConfig) return;

    const lConfig = this.skeleton.config.locomotion;
    const gConfig = this.currentGaitConfig;

    // 1. Physics
    const turnSpeed = lConfig.physics.turnSpeed + Math.abs(this.speed) * 0.5;
    this.directionAngle += this.turn * dt * turnSpeed;
    this.skeleton.group.rotation.y = this.directionAngle;

    const worldForward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.directionAngle - Math.PI/2);
    const worldRight = new THREE.Vector3().crossVectors(worldForward, new THREE.Vector3(0, 1, 0)).normalize().negate();
    
    const actualSpeed = this.speed * gConfig.velocityScale;
    this.velocity.copy(worldForward).multiplyScalar(actualSpeed);

    if (!this.treadmillMode) {
        this.skeleton.group.position.add(this.velocity.clone().multiplyScalar(dt));
    }

    if (Math.abs(this.speed) > 0.05) {
        this.time += dt;
    }

    this.skeleton.group.updateMatrixWorld(true);

    this.updateSpine(dt, actualSpeed);
    this.updateBodyTransform(actualSpeed);

    // 2. Feet Logic
    const cycleDuration = gConfig.cycleDuration;
    const stanceDurationRatio = gConfig.stanceDurationRatio;
    const cycle = (this.time % cycleDuration) / cycleDuration;

    this.legIds.forEach(id => {
        const isFront = id.includes('f');
        const chain = this.getChain(id);

        // --- OSTRICH WING FLAP ---
        if (lConfig.legs.style === 'Biped' && isFront) {
            const flapSpeed = Math.abs(this.speed) > 0.1 ? 10 : 2;
            const flapAmp = Math.abs(this.speed) * 0.2;
            const baseRot = Math.PI / 1.5; 
            const flap = Math.sin(this.time * flapSpeed) * flapAmp;
            const turnLift = this.turn * (id.includes('l') ? -0.5 : 0.5);
            chain.root.rotation.z = THREE.MathUtils.lerp(chain.root.rotation.z, baseRot + flap + turnLift, dt * 5.0);
            return; 
        }

        // --- STANDARD IK UPDATE ---
        const foot = this.feet[id];
        const phase = (cycle - foot.phaseOffset + 1.0) % 1.0;
        const isStance = phase < stanceDurationRatio;

        const hipPos = new THREE.Vector3();
        chain.root.getWorldPosition(hipPos);

        const neutralGroundPos = hipPos.clone();
        neutralGroundPos.y = 0;
        
        const isRight = id.includes('r');
        const stanceOffset = isRight ? 1 : -1;
        
        let currentStanceWidth = lConfig.stanceWidth;
        if (this.gait === 'Gallop' && lConfig.legs.style === 'Erect') currentStanceWidth += 0.15;

        neutralGroundPos.add(worldRight.clone().multiplyScalar(stanceOffset * currentStanceWidth));

        if (isStance) {
            if (!foot.isStance) {
                foot.isStance = true;
                foot.plantPos.copy(foot.target);
            }
            if (this.treadmillMode) {
                const slide = this.velocity.clone().multiplyScalar(-dt);
                foot.target.add(slide);
            }
        } else {
            if (foot.isStance) {
                foot.isStance = false;
                foot.plantPos.copy(foot.target);

                const swingTime = (1.0 - stanceDurationRatio) * cycleDuration;
                const futureTime = swingTime + (stanceDurationRatio * cycleDuration) * 0.5;
                const leadVec = this.velocity.clone().multiplyScalar(futureTime);
                const turnVec = worldRight.clone().multiplyScalar(-this.turn * futureTime * 2.0);
                leadVec.add(turnVec);

                foot.nextPos.copy(neutralGroundPos).add(leadVec);
            }

            const swingProgress = (phase - stanceDurationRatio) / (1.0 - stanceDurationRatio);
            foot.target.lerpVectors(foot.plantPos, foot.nextPos, swingProgress);
            
            const lift = Math.sin(swingProgress * Math.PI) * lConfig.stepHeight;
            foot.target.y = lift;
        }

        // IK
        const poleOffset = new THREE.Vector3(0, 0, 0);
        const up = new THREE.Vector3(0, 1, 0);
        const sideBias = isRight ? 1.0 : -1.0;

        if (lConfig.legs.style === 'Erect' || lConfig.legs.style === 'Biped') {
            if (id.includes('f')) { // Quadruped Front
                // Front/Arms (Elbow Back)
                poleOffset.add(up.clone().multiplyScalar(0.5)); 
                poleOffset.add(worldForward.clone().multiplyScalar(-1.0)); 
            } else {
                // Hind/Legs OR Human Legs (Knee Forward)
                poleOffset.add(up.clone().multiplyScalar(0.5)); 
                poleOffset.add(worldForward.clone().multiplyScalar(1.0)); 
            }
            poleOffset.add(worldRight.clone().multiplyScalar(sideBias * 0.05)); 
        } 
        else {
            // Sprawling
            if (id.includes('f')) {
                poleOffset.add(worldForward.clone().multiplyScalar(-0.5)); 
            } else {
                poleOffset.add(worldForward.clone().multiplyScalar(0.5)); 
            }
            poleOffset.add(worldRight.clone().multiplyScalar(sideBias * 2.0));
            poleOffset.add(up.clone().multiplyScalar(1.0));
        }

        const polePos = hipPos.clone().add(poleOffset);
        this.solvers[id].solve(foot.target, polePos);
    });
  }

  private updateBodyTransform(actualSpeed: number) {
    const lConfig = this.skeleton.config.locomotion;
    const gConfig = this.currentGaitConfig!;
    const cycle = (this.time % gConfig.cycleDuration) / gConfig.cycleDuration;
    
    const bobMult = lConfig.legs.style === 'Biped' ? 1.5 : 1.0;
    const bobY = Math.sin(cycle * Math.PI * 4) * lConfig.physics.bobAmount * (Math.abs(this.speed) * bobMult + 0.1);
    
    // Direct read from current config to support MorphRig
    const baseHeight = this.skeleton.config.skeleton.baseHeight;
    this.skeleton.group.position.y = baseHeight + bobY;

    const targetBank = -this.turn * lConfig.physics.bankAmount;
    this.skeleton.group.rotation.z = THREE.MathUtils.lerp(this.skeleton.group.rotation.z, targetBank, 0.1);
  }

  private updateSpine(dt: number, actualSpeed: number) {
    const lConfig = this.skeleton.config.locomotion;
    const gConfig = this.currentGaitConfig!;
    const cycle = (this.time % gConfig.cycleDuration) / gConfig.cycleDuration;
    
    const maxBend = 0.3; 
    this.currentTurnBend = THREE.MathUtils.lerp(this.currentTurnBend, this.turn * maxBend, dt * 3.0);

    // SPINE
    const spineWeights = [1.0, 0.8, 0.4, 0.2, 0.4, 0.8, 1.0]; 

    this.skeleton.spine.bones.forEach((bone, i) => {
        const currentRot = bone.pivot.rotation;
        let targetY = currentRot.y;
        let targetX = currentRot.x; 
        let targetZ = currentRot.z; 

        if (lConfig.spine.mode === 'Lateral') {
            const waveFreq = 1.0; 
            const lag = i * 0.3;
            const amp = lConfig.spine.waveAmp * Math.min(Math.abs(this.speed) * 1.5, 1.0);
            const weight = spineWeights[i] || 0.5;
            
            const wave = Math.sin((cycle * Math.PI * 2 * waveFreq) - lag);
            targetY = this.currentTurnBend + (wave * amp * weight);
            targetX = 0; 
            targetZ = 0;
        } else {
            targetY = this.currentTurnBend;
            if (lConfig.spine.mode === 'Vertical' && this.gait === 'Gallop' && Math.abs(this.speed) > 0.1) {
                const archWeight = Math.sin((i / 6) * Math.PI); 
                const gallopCycle = Math.sin(cycle * Math.PI * 2);
                targetX = gallopCycle * 0.1 * archWeight; 
            } else {
                targetX = 0;
            }
            targetZ = this.skeleton.config.skeleton.restPose.spineZ; 
        }

        bone.setRotation(
            THREE.MathUtils.lerp(currentRot.x, targetX, dt * lConfig.spine.stiffness),
            THREE.MathUtils.lerp(currentRot.y, targetY, dt * lConfig.spine.stiffness),
            targetZ
        );
    });

    // HEAD & NECK
    const headLook = this.turn * 0.6;
    const neck = this.skeleton.neck.root;
    neck.rotation.y = THREE.MathUtils.lerp(neck.rotation.y, headLook, dt * 5.0);
    
    const isBiped = lConfig.legs.style === 'Biped';
    if (isBiped) {
        const headBob = Math.sin(cycle * Math.PI * 4 + Math.PI) * 0.1 * Math.abs(this.speed);
        if(this.skeleton.neck.bones.length > 0)
            this.skeleton.neck.bones[0].setRotation(headBob, 0, 0); 
    }

    const head = this.skeleton.head.root;
    head.rotation.y = -neck.rotation.y * 0.5; 

    // TAIL
    if (this.skeleton.tail.bones.length === 0) return;

    const isErect = lConfig.legs.style === 'Erect' || lConfig.legs.style === 'Biped';
    const restPose = this.skeleton.config.skeleton.restPose;

    let rootTargetZ = restPose.tailRootZ;
    if (isErect && Math.abs(this.speed) > 0.5) {
        rootTargetZ += 0.5 + Math.sin(cycle * Math.PI * 2) * 0.1;
    }
    this.skeleton.tail.root.rotation.z = THREE.MathUtils.lerp(
        this.skeleton.tail.root.rotation.z, 
        rootTargetZ, 
        dt * 5.0
    );

    this.skeleton.tail.bones.forEach((bone, i) => {
        const currentRot = bone.pivot.rotation;
        const lag = (i + 2) * 0.3; 
        const decay = Math.max(0.2, 1.0 - (i * 0.1));
        
        const maxWaveAmp = 0.6; 
        const rawAmp = lConfig.spine.tailWaveAmp * decay * Math.abs(this.speed) * 2.0;
        const amp = Math.min(rawAmp, maxWaveAmp);
        
        const wave = Math.sin((cycle * Math.PI * 2) - lag) * amp;
        const trail = -this.turn * 0.2;

        let targetY = wave + trail;
        targetY = THREE.MathUtils.clamp(targetY, -0.8, 0.8);

        let targetZ = restPose.tailSegmentZ;
        const tailDamp = isErect ? 8.0 : 5.0;

        bone.setRotation(
            currentRot.x,
            THREE.MathUtils.lerp(currentRot.y, targetY, dt * tailDamp), 
            THREE.MathUtils.lerp(currentRot.z, targetZ, dt * tailDamp)
        );
    });
  }
}