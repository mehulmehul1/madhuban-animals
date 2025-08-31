// Interface: IKAdapter
// Exposes minimal constructors used by domain code without binding to FIK directly.
// Runtime note: This file documents the contract; implementations live under adapters/.
//
// Expected shape:
// {
//   V2: class { constructor(x:number, y:number); minus(v); plus(v); normalised(); normalize(); multiplyScalar(n); x:number; y:number },
//   Chain2D: class { constructor(colorHex:number); addBone(bone); addConsecutiveBone(dir,len,cw,ccw); setFixedBaseMode(bool); bones:Array },
//   Bone2D: class { constructor(startV2, endV2); setClockwiseConstraintDegs(n); setAnticlockwiseConstraintDegs(n) }
// }


