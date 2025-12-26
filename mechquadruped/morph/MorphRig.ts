import * as THREE from 'three';
import { QuadrupedSkeleton } from '../services/Skeleton';
import { Locomotion } from '../services/Locomotion';
import { HORSE_CONFIG, LIZARD_CONFIG, CreatureConfig } from '../services/CreatureConfig';

export class MorphRig {
  skeleton: QuadrupedSkeleton;
  locomotion: Locomotion;
  
  t: number = 0;            
  targetT: number = 0;
  speed: number = 1.0; 

  private src: CreatureConfig = HORSE_CONFIG;
  private tgt: CreatureConfig = LIZARD_CONFIG;

  constructor(skeleton: QuadrupedSkeleton, locomotion: Locomotion) {
    this.skeleton = skeleton;
    this.locomotion = locomotion;
    this.t = 0;
  }

  setTarget(t: number) {
    this.targetT = THREE.MathUtils.clamp(t, 0, 1);
  }

  update(dt: number) {
    if (Math.abs(this.t - this.targetT) > 1e-4) {
      const dir = (this.targetT > this.t) ? 1 : -1;
      this.t += dir * this.speed * dt;
      this.t = THREE.MathUtils.clamp(this.t, 0, 1);
      
      this.applyMorph(this.t);
    }
  }

  private applyMorph(t: number) {
    const lerp = THREE.MathUtils.lerp;
    const lerpArr = (a: number[], b: number[], t: number): number[] => {
        const count = Math.max(a.length, b.length);
        const res = [];
        for(let i=0; i<count; i++) {
            res.push(lerp(a[i]||0, b[i]||0, t));
        }
        return res;
    };

    // 1. SKELETON MORPH
    
    // Base Height
    const baseHeight = lerp(this.src.skeleton.baseHeight, this.tgt.skeleton.baseHeight, t);
    // FORCE UPDATE CONFIG
    this.skeleton.config.skeleton.baseHeight = baseHeight;
    // FORCE UPDATE MESH
    this.skeleton.group.position.y = baseHeight;

    // Bone Lengths
    this.skeleton.spine.updateLengths(lerpArr(this.src.skeleton.spineLengths, this.tgt.skeleton.spineLengths, t));
    this.skeleton.neck.updateLengths(lerpArr(this.src.skeleton.neckLengths, this.tgt.skeleton.neckLengths, t));
    this.skeleton.tail.updateLengths(lerpArr(this.src.skeleton.tailLengths, this.tgt.skeleton.tailLengths, t));
    
    // Legs & Girdles
    const legChains = [
        { chain: this.skeleton.flLeg, lens: lerpArr(this.src.skeleton.legs.frontLengths, this.tgt.skeleton.legs.frontLengths, t) },
        { chain: this.skeleton.frLeg, lens: lerpArr(this.src.skeleton.legs.frontLengths, this.tgt.skeleton.legs.frontLengths, t) },
        { chain: this.skeleton.hlLeg, lens: lerpArr(this.src.skeleton.legs.hindLengths, this.tgt.skeleton.legs.hindLengths, t) },
        { chain: this.skeleton.hrLeg, lens: lerpArr(this.src.skeleton.legs.hindLengths, this.tgt.skeleton.legs.hindLengths, t) }
    ];

    legChains.forEach(item => item.chain.updateLengths(item.lens));

    // Girdle Geometry
    const gSrc = this.src.skeleton.girdle;
    const gTgt = this.tgt.skeleton.girdle;
    
    const gWidth = lerp(gSrc.width, gTgt.width, t);
    const gYFront = lerp(gSrc.yOffsetFront, gTgt.yOffsetFront, t);
    const gYHind = lerp(gSrc.yOffsetHind, gTgt.yOffsetHind, t);
    const gX = lerp(gSrc.xOffset, gTgt.xOffset, t); 
    
    this.skeleton.shoulderGirdleL.updateLengths([gWidth]);
    this.skeleton.shoulderGirdleR.updateLengths([gWidth]);
    this.skeleton.pelvicGirdleL.updateLengths([gWidth]);
    this.skeleton.pelvicGirdleR.updateLengths([gWidth]);

    // Update Girdle Positions
    this.skeleton.shoulderGirdleL.root.position.set(gX, gYFront, 0);
    this.skeleton.shoulderGirdleR.root.position.set(gX, gYFront, 0);
    
    // Fix: Lizard hips are often wider/differently placed.
    // Ensure we interpolate to the negative X offset for hind if needed
    const xHindSrc = 0; // Horse hind offset (relative to last bone)
    const xHindTgt = -gTgt.xOffset; // Lizard hind offset
    const xHind = lerp(xHindSrc, xHindTgt, t); 
    
    this.skeleton.pelvicGirdleL.root.position.set(xHind, gYHind, 0);
    this.skeleton.pelvicGirdleR.root.position.set(xHind, gYHind, 0);

    // 2. REST POSE (Angles)
    const pSrc = this.src.skeleton.restPose;
    const pTgt = this.tgt.skeleton.restPose;

    const spineZ = lerp(pSrc.spineZ, pTgt.spineZ, t);
    const neckZ = lerp(pSrc.neckZ, pTgt.neckZ, t);
    const headZ = lerp(pSrc.headZ, pTgt.headZ, t);
    const tailRootZ = lerp(pSrc.tailRootZ, pTgt.tailRootZ, t);

    // IMPORTANT: Reset spine rotation before Locomotion applies its own
    this.skeleton.spine.bones.forEach(b => {
        // We only set Z. Locomotion sets X/Y.
        b.pivot.rotation.z = spineZ;
    });
    this.skeleton.config.skeleton.restPose.spineZ = spineZ;

    this.skeleton.neck.root.rotation.z = neckZ;
    this.skeleton.head.root.rotation.z = headZ;
    this.skeleton.tail.root.rotation.z = tailRootZ;
    this.skeleton.config.skeleton.restPose.tailRootZ = tailRootZ;

    // Leg Splay (Erect vs Sprawling)
    // Horse: -PI/2 (Down). Lizard: 0 (Out).
    const legRootZ = lerp(-Math.PI / 2, 0, t);
    [this.skeleton.flLeg, this.skeleton.frLeg, this.skeleton.hlLeg, this.skeleton.hrLeg].forEach(l => {
        l.root.rotation.z = legRootZ;
        l.root.rotation.y = 0; 
        l.root.rotation.x = 0;
    });

    // 3. LOCOMOTION CONFIG (Blending Physics)
    const lSrc = this.src.locomotion;
    const lTgt = this.tgt.locomotion;

    const mixedConfig = this.skeleton.config.locomotion;
    
    mixedConfig.stanceWidth = lerp(lSrc.stanceWidth, lTgt.stanceWidth, t);
    mixedConfig.stepHeight = lerp(lSrc.stepHeight, lTgt.stepHeight, t);
    
    // Physics
    mixedConfig.physics.bobAmount = lerp(lSrc.physics.bobAmount, lTgt.physics.bobAmount, t);
    mixedConfig.physics.bankAmount = lerp(lSrc.physics.bankAmount, lTgt.physics.bankAmount, t);
    mixedConfig.physics.turnSpeed = lerp(lSrc.physics.turnSpeed, lTgt.physics.turnSpeed, t);

    // Spine
    mixedConfig.spine.waveAmp = lerp(lSrc.spine.waveAmp, lTgt.spine.waveAmp, t);
    mixedConfig.spine.tailWaveAmp = lerp(lSrc.spine.tailWaveAmp, lTgt.spine.tailWaveAmp, t);
    mixedConfig.spine.stiffness = lerp(lSrc.spine.stiffness, lTgt.spine.stiffness, t);
    
    if (t > 0.5) {
        mixedConfig.spine.mode = 'Lateral';
        mixedConfig.legs.style = 'Sprawling';
        this.skeleton.type = 'Lizard'; 
    } else {
        mixedConfig.spine.mode = 'Vertical';
        mixedConfig.legs.style = 'Erect';
        this.skeleton.type = 'Horse';
    }

    // 4. REFRESH SOLVERS
    this.locomotion.updateStructure();
  }
}