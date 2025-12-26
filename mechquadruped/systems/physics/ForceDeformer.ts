import * as THREE from 'three';
import { QuadrupedSkeleton } from '../../services/Skeleton';
import { Locomotion } from '../../services/Locomotion';
import { MuscleGroup, MuscleTemplate } from '../muscle/MuscleTemplate';

// REF: hill_muscle_model.md - implementation
export interface MuscleForce {
  stretch: number;        // 0-1, normalized from rest length
  compression: number;    // 0-1, perpendicular compression
  twist: number;         // -1 to 1, rotation around axis
  activation: number;    // 0-1, neural activation
  velocity: number;      // Current contraction velocity
}

export class ForceDeformer {
  private forces: Map<string, MuscleForce> = new Map();
  private previousLengths: Map<string, number> = new Map();
  private previousTime: number = 0;

  // REF: hill_muscle_model.md - GPU-friendly parameters
  private readonly HILL_PARAMS = {
    V_MAX: 10.0,           // Maximum shortening velocity
    K_SHORT: 0.25,         // Shortening shape constant
    K_LONG: 1.5,          // Lengthening shape constant
    SIGMA_L: 0.5,         // Force-length shape parameter
    EXP_RATE: 10.0         // Passive force exponential rate
  };

  private muscleMap: Map<string, MuscleTemplate> = new Map();

  constructor(muscleGroups: MuscleGroup[]) {
    this.initializeForces(muscleGroups);
  }

  private initializeForces(muscleGroups: MuscleGroup[]): void {
    for (const group of muscleGroups) {
      for (const muscle of group.muscles) {
        const key = `${group.name}_${muscle.name}`;
        this.muscleMap.set(key, muscle); // Store template for lookup

        this.forces.set(key, {
          stretch: 0,
          compression: 0,
          twist: 0,
          activation: 0.6, // Higher rest activation for visibility
          velocity: 0
        });
        this.previousLengths.set(key, muscle.restLength);
      }
    }
  }

  update(skeleton: QuadrupedSkeleton, locomotion: Locomotion, deltaTime: number): void {
    // SIMPLIFIED: Just set activation based on speed, don't recalculate lengths
    // The skeleton already knows bone positions - we just use them directly
    const speed = Math.abs(locomotion.speed);

    for (const [key, force] of this.forces) {
      // Simple activation based on speed and muscle type
      let activation = 0.3; // Base activation for visibility

      if (speed > 0.01) {
        activation += speed * 0.7; // Scale with speed

        // Muscle-specific activation
        if (key.includes('Gastrocnemius') || key.includes('Gluteus')) {
          activation *= 1.2; // Propulsion muscles
        }
      }

      force.activation = Math.min(activation, 1.0);
      force.stretch = 0; // No stretch calculation needed for rendering
      force.compression = 0;
      force.velocity = speed;
    }
  }

  private calculateMuscleLength(muscleKey: string, skeleton: QuadrupedSkeleton): number {
    // Get the muscle template from our stored map
    const muscle = this.muscleMap.get(muscleKey);
    if (!muscle) {
      console.warn(`Muscle not found in map: ${muscleKey}`);
      return 1.0;
    }

    // Get origin position (end of origin region)
    const originPos = this.getBonePosition(
      muscle.originChain,
      muscle.originRegion.endBone,
      skeleton
    );

    // Get insertion position (start of insertion region)
    const insertPos = this.getBonePosition(
      muscle.insertionChain,
      muscle.insertionRegion.startBone,
      skeleton
    );

    // Calculate and return distance
    const length = originPos.distanceTo(insertPos);
    return length > 0.001 ? length : 0.001; // Prevent zero division
  }

  private getBonePosition(chainName: string, boneIndex: number, skeleton: QuadrupedSkeleton): THREE.Vector3 {
    // FIX: skeleton does NOT have a chains Map - it has direct properties
    // Use bracket notation to access chains like: skeleton.spine, skeleton.flLeg, etc.
    const chain = (skeleton as any)[chainName];
    if (!chain || !chain.bones || chain.bones.length === 0) {
      return new THREE.Vector3();
    }

    // Handle index overflow - clamp to valid range
    const index = Math.max(0, Math.min(boneIndex, chain.bones.length - 1));
    const bone = chain.bones[index];
    if (!bone) {
      return new THREE.Vector3();
    }

    // Use the Bone's getWorldPosition method
    return bone.pivot.getWorldPosition(new THREE.Vector3());
  }

  private getRestLength(muscleKey: string): number {
    return this.previousLengths.get(muscleKey) || 1.0;
  }

  // REF: hill_muscle_model.md - simplified GPU version
  private calculateForceLength(stretch: number): number {
    // Parabolic approximation
    return Math.max(0, 1 - 4 * Math.pow(stretch / 0.5, 2));
  }

  private calculateForceVelocity(velocity: number): number {
    const vNorm = velocity / this.HILL_PARAMS.V_MAX;

    if (velocity < 0) { // Shortening
      return (this.HILL_PARAMS.V_MAX - velocity) /
        (this.HILL_PARAMS.V_MAX + velocity / this.HILL_PARAMS.K_SHORT);
    } else { // Lengthening
      return (this.HILL_PARAMS.V_MAX + this.HILL_PARAMS.K_LONG * velocity) /
        (this.HILL_PARAMS.V_MAX - velocity);
    }
  }

  private calculatePassiveForce(stretch: number): number {
    if (stretch <= 0) return 0;
    return Math.exp(this.HILL_PARAMS.EXP_RATE * stretch) - 1;
  }

  private calculateActivation(muscleKey: string, locomotion: Locomotion,
    forceLength: number, forceVelocity: number): number {
    // Base activation from gait and speed
    const speedActivation = Math.min(locomotion.speed * 2, 1.0);

    // Muscle-specific activation based on function
    if (muscleKey.includes('Gastrocnemius') || muscleKey.includes('Gluteus')) {
      // Propulsion muscles - activate during stance phase
      return speedActivation * (locomotion.gait === 'Gallop' ? 1.2 : 0.8);
    } else if (muscleKey.includes('Biceps') || muscleKey.includes('Triceps')) {
      // Limb muscles - cyclic activation
      return speedActivation * 0.7;
    } else if (muscleKey.includes('Longissimus')) {
      // Core muscles - always partially active
      return 0.3 + speedActivation * 0.3;
    }

    return speedActivation * 0.5;
  }

  private calculateCompression(stretch: number, forceLength: number): number {
    // Volume preservation approximation
    if (stretch < 0) {
      return Math.min(1, Math.abs(stretch) * 2);
    }
    return 0;
  }

  private calculateTwist(muscleKey: string, skeleton: QuadrupedSkeleton): number {
    // Simplified twist calculation
    // Would calculate based on bone rotations
    return 0;
  }

  getForce(muscleKey: string): MuscleForce {
    return this.forces.get(muscleKey) || {
      stretch: 0,
      compression: 0,
      twist: 0,
      activation: 0.3,
      velocity: 0
    };
  }

  getUniformArrays(muscleGroups: MuscleGroup[]): {
    params: Float32Array;
    deforms: Float32Array;
  } {
    const params = new Float32Array(50 * 4);
    const deforms = new Float32Array(50 * 4);
    let index = 0;

    for (const group of muscleGroups) {
      for (const muscle of group.muscles) {
        const key = `${group.name}_${muscle.name}`;
        const force = this.forces.get(key);

        if (force && index < 50) {
          // Parameters: width, thickness, bulge, activation
          params[index * 4] = muscle.shapeParams.widthRatio;
          params[index * 4 + 1] = muscle.shapeParams.thicknessRatio;
          params[index * 4 + 2] = muscle.shapeParams.bulgeAmount;
          params[index * 4 + 3] = force.activation;

          // Deformations: stretch, compression, twist, velocity
          deforms[index * 4] = force.stretch;
          deforms[index * 4 + 1] = force.compression;
          deforms[index * 4 + 2] = force.twist;
          deforms[index * 4 + 3] = Math.abs(force.velocity);

          index++;
        }
      }
    }

    return { params, deforms };
  }
}