import * as THREE from 'three';
import { Chain } from './Chain';
import { Bone } from './Bone';

export class IKSolver {
  private chain: Chain;
  private target: THREE.Vector3;
  private poleTarget: THREE.Vector3;
  private positions: THREE.Vector3[] = [];
  private lengths: number[] = [];
  private totalLength: number = 0;
  private tolerance: number = 0.001;
  private maxIterations: number = 15;

  constructor(chain: Chain) {
    this.chain = chain;
    this.target = new THREE.Vector3();
    this.poleTarget = new THREE.Vector3(0, 10, 0);

    this.updateStructure();
  }

  public updateStructure() {
    this.lengths = [];
    this.positions = [];
    this.totalLength = 0;

    this.chain.bones.forEach(b => {
      this.lengths.push(b.length);
      this.totalLength += b.length;
      this.positions.push(new THREE.Vector3());
    });
    // Tip position
    this.positions.push(new THREE.Vector3());
  }

  public solve(targetWorldPos: THREE.Vector3, polePosWorld: THREE.Vector3) {
    this.target.copy(targetWorldPos);
    this.poleTarget.copy(polePosWorld);

    const rootBone = this.chain.bones[0];
    const rootPos = rootBone.pivot.parent!.localToWorld(new THREE.Vector3(0, 0, 0));

    // 1. Warm Start
    const distToLastTip = this.positions[this.positions.length - 1].distanceTo(rootPos);
    if (distToLastTip > this.totalLength * 1.5 || distToLastTip < 0.01) {
        let current = rootPos.clone();
        this.positions[0].copy(current);
        for (let i = 0; i < this.lengths.length; i++) {
            current.y -= this.lengths[i];
            this.positions[i + 1].copy(current);
        }
    } else {
        const offset = new THREE.Vector3().subVectors(rootPos, this.positions[0]);
        for(let i=0; i<this.positions.length; i++) {
            this.positions[i].add(offset);
        }
    }

    // 2. FABRIK
    const targetDist = rootPos.distanceTo(targetWorldPos);
    if (targetDist > this.totalLength) {
        const dir = new THREE.Vector3().subVectors(targetWorldPos, rootPos).normalize();
        for (let i = 0; i < this.lengths.length; i++) {
            this.positions[i + 1].copy(this.positions[i]).add(dir.clone().multiplyScalar(this.lengths[i]));
        }
    } else {
        let iter = 0;
        const startPos = this.positions[0].clone();

        while (iter < this.maxIterations) {
            // Backward
            this.positions[this.positions.length - 1].copy(this.target);
            for (let i = this.positions.length - 2; i >= 0; i--) {
                const dir = new THREE.Vector3().subVectors(this.positions[i], this.positions[i + 1]).normalize();
                this.positions[i].copy(this.positions[i + 1]).add(dir.multiplyScalar(this.lengths[i]));
            }

            // Forward
            this.positions[0].copy(startPos);
            for (let i = 0; i < this.positions.length - 1; i++) {
                const dir = new THREE.Vector3().subVectors(this.positions[i + 1], this.positions[i]).normalize();
                this.positions[i + 1].copy(this.positions[i]).add(dir.multiplyScalar(this.lengths[i]));
            }
            
            for (let i = 1; i < this.positions.length - 1; i++) {
                this.applyPole(i);
            }

            if (this.positions[this.positions.length - 1].distanceTo(this.target) < this.tolerance) break;
            iter++;
        }
    }

    // 3. Update Bones
    this.updateBones();
  }

  private applyPole(index: number) {
      const prev = this.positions[index - 1];
      const curr = this.positions[index];
      const next = this.positions[index + 1];

      const limbAxis = new THREE.Vector3().subVectors(next, prev).normalize();
      const currProj = curr.clone().sub(prev).projectOnPlane(limbAxis);
      const poleProj = this.poleTarget.clone().sub(prev).projectOnPlane(limbAxis);

      if (currProj.lengthSq() < 0.0001 || poleProj.lengthSq() < 0.0001) return;

      const angle = currProj.angleTo(poleProj);
      const cross = new THREE.Vector3().crossVectors(currProj, poleProj);
      const dot = cross.dot(limbAxis);
      
      const q = new THREE.Quaternion().setFromAxisAngle(limbAxis, dot > 0 ? angle : -angle);
      
      const segment = curr.clone().sub(prev);
      segment.applyQuaternion(q);
      this.positions[index].copy(prev).add(segment);
  }

  private updateBones() {
      for (let i = 0; i < this.chain.bones.length; i++) {
          const bone = this.chain.bones[i];
          const curr = this.positions[i];
          const next = this.positions[i + 1];

          const xAxis = new THREE.Vector3().subVectors(next, curr).normalize();
          const poleDir = new THREE.Vector3().subVectors(this.poleTarget, curr).normalize();
          let zAxis = new THREE.Vector3().crossVectors(xAxis, poleDir).normalize();
          
          if (zAxis.lengthSq() < 0.01) {
              zAxis.set(0, 0, 1);
          }

          const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();
          const rotMatrix = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
          const targetQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

          const parentQuat = bone.pivot.parent!.getWorldQuaternion(new THREE.Quaternion());
          const localQuat = parentQuat.invert().multiply(targetQuat);

          bone.pivot.quaternion.copy(localQuat);
      }
  }
}