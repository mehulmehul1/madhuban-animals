import * as THREE from 'three';
import { Bone } from './Bone';

export interface ChainConfig {
  name: string;
  origin: THREE.Object3D; 
  originOffset?: THREE.Vector3; 
  boneLengths: number[]; 
  color?: number;
  baseRotation?: THREE.Euler; 
  flexibility?: number; 
}

export class Chain {
  public name: string;
  public root: THREE.Group; 
  public bones: Bone[] = [];
  public flexibility: number;

  constructor(config: ChainConfig) {
    this.name = config.name;
    this.flexibility = config.flexibility !== undefined ? config.flexibility : 0.1;
    this.root = new THREE.Group();
    
    config.origin.add(this.root);
    
    if (config.originOffset) {
      this.root.position.copy(config.originOffset);
    }

    if (config.baseRotation) {
      this.root.rotation.copy(config.baseRotation);
    }

    this.build(config.boneLengths, config.color);
  }

  private build(lengths: number[], color: number = 0xffffff) {
    let parentBone: Bone | null = null;

    lengths.forEach((len, index) => {
      const bone = new Bone(len, { 
        color: color, 
        name: `${this.name}_Bone_${index}`,
        radius: Math.max(0.02, 0.05 - (index * 0.005)) 
      });

      if (parentBone) {
        parentBone.add(bone);
      } else {
        this.root.add(bone.pivot);
      }

      this.bones.push(bone);
      parentBone = bone;
    });
  }

  /**
   * Updates the lengths of bones in this chain.
   * Handles mismatched array lengths gracefully.
   */
  updateLengths(newLengths: number[]) {
    for (let i = 0; i < this.bones.length; i++) {
        // If new config has fewer bones, scale excess to near-zero
        const len = i < newLengths.length ? newLengths[i] : 0.01;
        this.bones[i].setLength(len);
    }
  }

  get lastBone(): Bone | null {
    return this.bones.length > 0 ? this.bones[this.bones.length - 1] : null;
  }

  getBone(index: number): Bone | null {
    return this.bones[index] || null;
  }
}