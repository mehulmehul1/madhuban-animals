import * as THREE from 'three';

export type SpineMode = 'Rigid' | 'Lateral' | 'Vertical'; 
export type LegStyle = 'Erect' | 'Sprawling' | 'Biped'; 

export interface GaitConfig {
  cycleDuration: number;      // Time for one full cycle (seconds)
  velocityScale: number;      // Speed multiplier (e.g. Gallop is faster)
  stanceDurationRatio: number; // 0.0 to 1.0 (Percentage of cycle foot is on ground)
  phaseOffset: { fl: number, fr: number, hl: number, hr: number };
}

export interface CreatureConfig {
  name: string;
  
  skeleton: {
    baseHeight: number;
    spineLengths: number[];
    neckLengths: number[];
    headLength: number;
    tailLengths: number[];
    
    girdle: {
      width: number;
      yOffsetFront: number;
      yOffsetHind: number;
      xOffset: number;
    };

    legs: {
      frontLengths: number[];
      hindLengths: number[];
    };

    restPose: {
      spineZ: number;
      neckZ: number;
      headZ: number;
      tailRootZ: number;    // Angle of the tail base relative to spine
      tailSegmentZ: number; // Curvature of individual tail bones
      legFoldAngles: number[];
    };
  };

  locomotion: {
    stepHeight: number;
    stanceWidth: number; 
    
    physics: {
      bobAmount: number;
      bankAmount: number;
      turnSpeed: number;
    };

    spine: {
      mode: SpineMode;
      waveAmp: number;
      tailWaveAmp: number;
      stiffness: number; 
    };

    legs: {
      style: LegStyle;
    };

    gaits: {
      Walk: GaitConfig;
      Gallop: GaitConfig;
    };
  };
}

export const HORSE_CONFIG: CreatureConfig = {
  name: 'Horse',
  skeleton: {
    baseHeight: 0.95,
    spineLengths: Array(7).fill(0.15),
    neckLengths: Array(4).fill(0.12),
    headLength: 0.25,
    tailLengths: [0.1, 0.1, 0.1, 0.1, 0.08, 0.08],
    girdle: { width: 0.22, yOffsetFront: 0.15, yOffsetHind: -0.05, xOffset: 0.05 },
    legs: {
      frontLengths: [0.25, 0.30, 0.35, 0.20, 0.10],
      hindLengths: [0.35, 0.35, 0.25, 0.10]
    },
    restPose: {
      spineZ: -0.02,
      neckZ: Math.PI - Math.PI / 3,
      headZ: Math.PI / 2,
      tailRootZ: -1.3, // Hangs down
      tailSegmentZ: 0.05, // Very slight curve
      legFoldAngles: [0.1, 0.1, 0.1, 0.1]
    }
  },
  locomotion: {
    stepHeight: 0.3,
    stanceWidth: 0.0,
    physics: { bobAmount: 0.03, bankAmount: 0.15, turnSpeed: 1.5 },
    spine: { mode: 'Vertical', waveAmp: 0.05, tailWaveAmp: 0.1, stiffness: 15.0 },
    legs: { style: 'Erect' },
    gaits: {
      Walk: {
        cycleDuration: 1.5,
        velocityScale: 2.0,
        stanceDurationRatio: 0.6,
        phaseOffset: { hl: 0.0, fl: 0.25, hr: 0.5, fr: 0.75 }
      },
      Gallop: {
        cycleDuration: 0.55, 
        velocityScale: 7.0,
        stanceDurationRatio: 0.3,
        phaseOffset: { hr: 0.0, hl: 0.15, fr: 0.5, fl: 0.65 }
      }
    }
  }
};

export const LIZARD_CONFIG: CreatureConfig = {
  name: 'Lizard',
  skeleton: {
    baseHeight: 0.25,
    spineLengths: Array(7).fill(0.12),
    neckLengths: Array(4).fill(0.08),
    headLength: 0.20,
    tailLengths: [0.12, 0.12, 0.11, 0.10, 0.09, 0.08, 0.07, 0.06],
    girdle: { width: 0.25, yOffsetFront: 0.0, yOffsetHind: 0.0, xOffset: 0.05 },
    legs: {
      frontLengths: [0.20, 0.18, 0.15],
      hindLengths: [0.22, 0.20, 0.18]
    },
    restPose: {
      spineZ: 0.0,
      neckZ: Math.PI,
      headZ: 0.0,
      tailRootZ: 0.0,    // Straight back
      tailSegmentZ: 0.0, // Straight
      legFoldAngles: [0.0, 0.0, 0.2]
    }
  },
  locomotion: {
    stepHeight: 0.15,
    stanceWidth: 0.3,
    physics: { bobAmount: 0.01, bankAmount: 0.05, turnSpeed: 2.0 },
    spine: { mode: 'Lateral', waveAmp: 0.15, tailWaveAmp: 0.25, stiffness: 8.0 },
    legs: { style: 'Sprawling' },
    gaits: {
      Walk: {
        cycleDuration: 1.0,
        velocityScale: 1.5,
        stanceDurationRatio: 0.6,
        phaseOffset: { hl: 0.0, fl: 0.25, hr: 0.5, fr: 0.75 }
      },
      Gallop: {
        cycleDuration: 0.6,
        velocityScale: 4.0,
        stanceDurationRatio: 0.3,
        phaseOffset: { hr: 0.0, hl: 0.15, fr: 0.5, fl: 0.65 }
      }
    }
  }
};

export const OSTRICH_CONFIG: CreatureConfig = {
  name: 'Ostrich',
  skeleton: {
    baseHeight: 1.3, // Tall
    spineLengths: Array(5).fill(0.12), // Short spine
    neckLengths: Array(6).fill(0.12), // Long neck
    headLength: 0.15, // Small head
    tailLengths: [0.15, 0.15, 0.15], // Short tail feathers
    girdle: { width: 0.25, yOffsetFront: 0.1, yOffsetHind: -0.05, xOffset: 0.0 },
    legs: {
      frontLengths: [0.2, 0.25, 0.2], // Wings
      hindLengths: [0.3, 0.45, 0.4, 0.1] // Femur, Tibia, Metatarsus, Toe
    },
    restPose: {
      spineZ: -0.1, // Slight arch
      neckZ: Math.PI / 2 + 0.2, // Vertical
      headZ: Math.PI / 2,
      tailRootZ: -0.5, // Drooping tail feathers
      tailSegmentZ: 0.1,
      legFoldAngles: [0.2, -0.4, 0.4, 0.1]
    }
  },
  locomotion: {
    stepHeight: 0.4,
    stanceWidth: 0.1,
    physics: { bobAmount: 0.08, bankAmount: 0.1, turnSpeed: 2.5 },
    spine: { mode: 'Rigid', waveAmp: 0.02, tailWaveAmp: 0.2, stiffness: 20.0 },
    legs: { style: 'Biped' },
    gaits: {
      Walk: {
        cycleDuration: 1.2,
        velocityScale: 2.5,
        stanceDurationRatio: 0.6,
        phaseOffset: { hl: 0.0, hr: 0.5, fl: 0.0, fr: 0.0 } // Front legs ignored
      },
      Gallop: { // Actually "Run"
        cycleDuration: 0.6,
        velocityScale: 8.0,
        stanceDurationRatio: 0.3, // Flight phase
        phaseOffset: { hl: 0.0, hr: 0.5, fl: 0.0, fr: 0.0 }
      }
    }
  }
};

/*
export const HUMAN_CONFIG: CreatureConfig = {
  name: 'Human',
  skeleton: {
    baseHeight: 0.95,
    // Increased spine length for better proportions (Torso approx 0.75)
    spineLengths: Array(5).fill(0.15),
    neckLengths: Array(2).fill(0.08),
    headLength: 0.2,
    tailLengths: [], 
    girdle: { width: 0.2, yOffsetFront: 0.0, yOffsetHind: 0.0, xOffset: 0.0 },
    legs: {
      frontLengths: [0.3, 0.25, 0.1], // Arms
      hindLengths: [0.45, 0.45, 0.15] // Legs
    },
    restPose: {
      spineZ: 0.05,
      neckZ: 0,
      headZ: Math.PI / 2,
      tailRootZ: 0,
      tailSegmentZ: 0,
      // Inverted Logic for Human Legs to ensure Knee Forward
      // Thigh (-0.2), Shin (+0.5), Foot (-0.2)
      // This "Zig-Zag" biases the IK to solve knees forward.
      legFoldAngles: [-0.2, 0.5, -0.2] 
    }
  },
  locomotion: {
    stepHeight: 0.2,
    stanceWidth: 0.15,
    physics: { bobAmount: 0.05, bankAmount: 0.02, turnSpeed: 3.0 },
    spine: { mode: 'Rigid', waveAmp: 0.05, tailWaveAmp: 0, stiffness: 15.0 },
    legs: { style: 'Biped' },
    gaits: {
      Walk: {
        cycleDuration: 1.2,
        velocityScale: 1.5,
        stanceDurationRatio: 0.6,
        phaseOffset: { hl: 0.0, hr: 0.5, fl: 0.5, fr: 0.0 } // Anti-phase arms
      },
      Gallop: { // Run
        cycleDuration: 0.7,
        velocityScale: 5.0,
        stanceDurationRatio: 0.4,
        phaseOffset: { hl: 0.0, hr: 0.5, fl: 0.5, fr: 0.0 }
      }
    }
  }
};
*/