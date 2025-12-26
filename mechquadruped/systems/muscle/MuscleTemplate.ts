import * as THREE from 'three';

export type MuscleType = 'fusiform' | 'pennate' | 'sheet' | 'complex';

export interface MuscleTemplate {
  name: string;
  type: MuscleType;
  originChain: string;
  insertionChain: string;
  originRegion: { startBone: number; endBone: number };
  insertionRegion: { startBone: number; endBone: number };
  shapeParams: {
    widthRatio: number;
    thicknessRatio: number;
    bulgeAmount: number;
    taperFactor: number;
  };
  restLength: number;
  maxForce: number;
}

export interface MuscleGroup {
  name: string;
  muscles: MuscleTemplate[];
  blendFactor: number;
}

export class MuscleParameters {
  constructor(
    public width: number,
    public thickness: number,
    public bulge: number = 0.0,
    public activation: number = 0.0
  ) {}

  clone(): MuscleParameters {
    return new MuscleParameters(this.width, this.thickness, this.bulge, this.activation);
  }
}

// Cross-species configuration
export interface CreatureMuscleConfig {
  overallScale: number;
  bodyType: 'slender' | 'muscular' | 'stocky';
  muscleGroups: {
    axial: { mass: number; definition: number };
    limbs: { mass: number; definition: number };
    neck: { mass: number; length: number };
    tail: { mass: number; thickness: number };
  };
}