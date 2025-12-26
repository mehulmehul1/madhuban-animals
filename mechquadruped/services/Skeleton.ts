import * as THREE from 'three';
import { Bone } from './Bone';
import { Chain } from './Chain';
import { CreatureConfig } from './CreatureConfig';

export class QuadrupedSkeleton {
  public group: THREE.Group;
  public config: CreatureConfig;
  public type: string; // Changed from getter to public property
  
  // Chains
  public spine: Chain;
  public neck: Chain;
  public head: Chain;
  public tail: Chain;
  
  // Girdles
  public shoulderGirdleL: Chain;
  public shoulderGirdleR: Chain;
  public pelvicGirdleL: Chain;
  public pelvicGirdleR: Chain;
  
  public flLeg: Chain; 
  public frLeg: Chain; 
  public hlLeg: Chain; 
  public hrLeg: Chain; 

  private colors = {
    spine: 0x888888,
    neck: 0x999999,
    head: 0xaaaaaa,
    girdle: 0x555555,
    frontLeft: 0xff8888,
    frontRight: 0x880000,
    hindLeft: 0x8888ff,
    hindRight: 0x000088,
  };

  constructor(scene: THREE.Scene, config: CreatureConfig) {
    this.config = config;
    this.type = config.name; // Initialize from config
    this.group = new THREE.Group();
    scene.add(this.group);

    this.reset();

    // 1. Build Central Axis
    this.spine = this.buildSpine();

    // 2. Attach Extremities
    this.neck = this.buildNeck();
    this.head = this.buildHead();
    this.tail = this.buildTail();

    // 3. Build Girdles
    this.shoulderGirdleL = this.buildGirdle(true, true);
    this.shoulderGirdleR = this.buildGirdle(false, true);
    this.pelvicGirdleL = this.buildGirdle(true, false);
    this.pelvicGirdleR = this.buildGirdle(false, false);

    // 4. Attach Legs
    this.flLeg = this.buildFrontLeg(this.shoulderGirdleL, true);
    this.frLeg = this.buildFrontLeg(this.shoulderGirdleR, false);
    this.hlLeg = this.buildHindLeg(this.pelvicGirdleL, true);
    this.hrLeg = this.buildHindLeg(this.pelvicGirdleR, false);

    // 5. Apply "Rest Pose"
    this.applyRestPose();
  }

  public reset(): void {
    this.group.position.set(0, this.config.skeleton.baseHeight, 0);
    // ORIENTATION: -Z Forward
    this.group.rotation.set(0, Math.PI / 2, 0);
    
    if (this.spine) this.applyRestPose();
  }

  private buildSpine(): Chain {
    // Human Spine is Vertical (+Y)
    // const isHuman = this.config.name === 'Human';
    // const baseRot = isHuman ? new THREE.Euler(0, 0, Math.PI / 2) : undefined;
    const baseRot = undefined;

    return new Chain({
      name: 'Spine',
      origin: this.group,
      boneLengths: this.config.skeleton.spineLengths,
      color: this.colors.spine,
      baseRotation: baseRot
    });
  }

  private buildNeck(): Chain {
    const attachBone = this.spine.bones[0];
    const yOffset = this.config.name === 'Horse' ? 0.05 : 0.02;
    const xOffset = 0;

    return new Chain({
      name: 'Neck',
      origin: attachBone.pivot,
      originOffset: new THREE.Vector3(xOffset, yOffset, 0),
      boneLengths: this.config.skeleton.neckLengths,
      color: this.colors.neck
    });
  }

  private buildHead(): Chain {
    return new Chain({
      name: 'Head',
      origin: this.neck.lastBone!.pivot,
      originOffset: new THREE.Vector3(this.neck.lastBone!.length, 0, 0),
      boneLengths: [this.config.skeleton.headLength],
      color: this.colors.head
    });
  }

  private buildTail(): Chain {
    if (this.config.skeleton.tailLengths.length === 0) {
        const dummy = new Chain({
            name: 'Tail',
            origin: this.group,
            boneLengths: [],
            color: 0x000000
        });
        dummy.root.visible = false;
        return dummy;
    }

    const attachBone = this.spine.lastBone!;
    const xOffset = attachBone.length;

    return new Chain({
      name: 'Tail',
      origin: attachBone.pivot,
      originOffset: new THREE.Vector3(xOffset, 0, 0),
      boneLengths: this.config.skeleton.tailLengths,
      color: this.colors.spine
    });
  }

  private buildGirdle(isLeft: boolean, isFront: boolean): Chain {
    const name = `${isFront ? 'Shoulder' : 'Pelvis'}_Girdle_${isLeft ? 'L' : 'R'}`;
    const gConfig = this.config.skeleton.girdle;

    let attachBone: Bone;
    attachBone = isFront ? this.spine.bones[0] : this.spine.lastBone!;
    
    const yOffset = isFront ? gConfig.yOffsetFront : gConfig.yOffsetHind;
    const xOffset = isFront ? gConfig.xOffset : (this.config.name === 'Lizard' ? -gConfig.xOffset : 0);

    // Orientation logic
    let rotEuler: THREE.Euler;
    rotEuler = new THREE.Euler(0, isLeft ? -Math.PI / 2 : Math.PI / 2, 0);

    return new Chain({
      name: name,
      origin: attachBone.pivot,
      originOffset: new THREE.Vector3(xOffset, yOffset, 0),
      boneLengths: [gConfig.width],
      color: this.colors.girdle,
      baseRotation: rotEuler
    });
  }

  private buildFrontLeg(girdle: Chain, isLeft: boolean): Chain {
    return new Chain({
      name: isLeft ? 'FL_Leg' : 'FR_Leg',
      origin: girdle.lastBone!.pivot,
      originOffset: new THREE.Vector3(girdle.lastBone!.length, 0, 0),
      boneLengths: this.config.skeleton.legs.frontLengths,
      color: isLeft ? this.colors.frontLeft : this.colors.frontRight
    });
  }

  private buildHindLeg(girdle: Chain, isLeft: boolean): Chain {
    return new Chain({
      name: isLeft ? 'HL_Leg' : 'HR_Leg',
      origin: girdle.lastBone!.pivot,
      originOffset: new THREE.Vector3(girdle.lastBone!.length, 0, 0),
      boneLengths: this.config.skeleton.legs.hindLengths,
      color: isLeft ? this.colors.hindLeft : this.colors.hindRight
    });
  }

  public applyRestPose(): void {
    const pose = this.config.skeleton.restPose;
    const legStyle = this.config.locomotion.legs.style;

    // Spine
    this.spine.bones.forEach((b, i) => {
        const zAngle = legStyle === 'Sprawling' ? 0 : pose.spineZ;
        b.setRotation(0, 0, zAngle);
    });
    
    // Neck/Head
    this.neck.root.rotation.z = pose.neckZ; 
    this.head.root.rotation.z = pose.headZ; 
    
    // Tail
    if (this.tail.bones.length > 0) {
        this.tail.root.rotation.z = pose.tailRootZ;
        this.tail.bones.forEach(b => b.setRotation(0, 0, pose.tailSegmentZ));
    }

    // Legs 
    const setLegPose = (chain: Chain, isLeft: boolean, isFront: boolean) => {
      const sign = isLeft ? -1 : 1;

      if (legStyle === 'Biped' && isFront) {
          // OSTRICH WINGS: Fold Back
          chain.root.rotation.z = Math.PI / 1.5; 
          chain.root.rotation.y = sign * 0.2;
          chain.bones.forEach((b, i) => {
              if (i === 0) b.setRotation(0, 0, 0.5);
              if (i === 1) b.setRotation(0, 0, -2.0);
          });
      } 
      else if (legStyle === 'Sprawling') {
          // LIZARD
          chain.root.rotation.z = 0; 
          chain.root.rotation.y = 0;
          chain.bones[0].setRotation(0, 0, 0.2); 
          if(chain.bones[1]) chain.bones[1].setRotation(0, 0, 0.5);
      } 
      else {
          // ERECT / HUMAN LEGS
          chain.root.rotation.z = -Math.PI / 2; 
          chain.bones.forEach((b, i) => {
              if(i < pose.legFoldAngles.length) {
                  b.setRotation(0, pose.legFoldAngles[i] * sign, 0);
              }
          });
      }
    };

    setLegPose(this.flLeg, true, true);
    setLegPose(this.frLeg, false, true);
    setLegPose(this.hlLeg, true, false);
    setLegPose(this.hrLeg, false, false);
  }
}