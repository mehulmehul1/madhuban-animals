import * as THREE from 'three';
import { createBone, BoneResult } from './utils';

export interface BoneOptions {
  radius?: number;
  color?: number;
  name?: string;
}

export class Bone {
  public length: number;
  public pivot: THREE.Group;
  public mesh: THREE.Mesh; // The shaft mesh
  public name: string;
  
  // Hierarchy
  public parent: Bone | null = null;
  public children: Bone[] = [];

  constructor(length: number, opts: BoneOptions = {}) {
    this.length = length;
    this.name = opts.name || 'Bone';
    
    const color = opts.color || 0xeeeeee;
    const radius = opts.radius || 0.04;

    const { pivot, mesh }: BoneResult = createBone(length, radius, color);
    this.pivot = pivot;
    this.mesh = mesh;
    
    // Metadata for debugging
    this.pivot.userData = { type: 'bone', length: this.length, name: this.name };
  }

  add(child: Bone): void {
    this.children.push(child);
    child.parent = this;
    this.pivot.add(child.pivot);
    child.pivot.position.set(this.length, 0, 0);
  }

  /**
   * Dynamically updates the length of the bone.
   * Scales the mesh and updates child positions.
   */
  setLength(newLength: number): void {
    if (Math.abs(this.length - newLength) < 0.0001) return;

    this.length = newLength;
    
    // Update Mesh Scale (X-axis is length in our utils)
    // Note: The mesh created in utils has length 'L', positioned at L/2.
    // To scale it, we need to scale X and adjust position.
    // However, createBone sets up geometry with specific length. 
    // Scaling the mesh object is easier than rebuilding geometry.
    // Original geometry length was the initial 'length'.
    // We track initial length in userData to normalize scale.
    const initialLen = this.pivot.userData.length || this.length;
    const scale = newLength / initialLen;
    
    this.mesh.scale.set(scale, 1, 1);
    this.mesh.position.set(newLength / 2, 0, 0);

    // Update Children Positions
    this.children.forEach(child => {
        child.pivot.position.set(this.length, 0, 0);
    });
  }

  setRotation(x: number, y: number, z: number): void {
    this.pivot.rotation.set(x, y, z);
  }
  
  getWorldPosition(): THREE.Vector3 {
    const vec = new THREE.Vector3();
    this.pivot.getWorldPosition(vec);
    return vec;
  }

  getEndPosition(): THREE.Vector3 {
    const vec = new THREE.Vector3(this.length, 0, 0);
    vec.applyMatrix4(this.pivot.matrixWorld);
    return vec;
  }
}