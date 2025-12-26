import { MuscleTemplate, MuscleGroup, CreatureMuscleConfig } from '../systems/muscle/MuscleTemplate';

// REF: horse_anatomy.md - complete muscle reference
export const HORSE_MUSCLE_GROUPS: MuscleGroup[] = [
  // NECK & HEAD
  {
    name: 'NeckMuscles',
    blendFactor: 0.12,
    muscles: [
      {
        name: 'Splenius',
        type: 'sheet',
        originChain: 'spine',
        insertionChain: 'neck',
        originRegion: { startBone: 0, endBone: 2 }, // Anterior thoracic vertebrae
        insertionRegion: { startBone: 1, endBone: 3 }, // Upper neck
        shapeParams: { widthRatio: 0.18, thicknessRatio: 0.08, bulgeAmount: 0.1, taperFactor: 0.7 },
        restLength: 0.6,
        maxForce: 600.0
      },
      {
        name: 'Brachiocephalicus',
        type: 'fusiform',
        originChain: 'head',
        insertionChain: 'flLeg',
        originRegion: { startBone: 0, endBone: 0 }, // Base of skull
        insertionRegion: { startBone: 1, endBone: 2 }, // Humerus
        shapeParams: { widthRatio: 0.12, thicknessRatio: 0.06, bulgeAmount: 0.1, taperFactor: 0.8 },
        restLength: 0.9,
        maxForce: 500.0
      },
      {
        name: 'Trapezius_Cervical',
        type: 'sheet',
        originChain: 'neck',
        insertionChain: 'shoulderGirdleL',
        originRegion: { startBone: 0, endBone: 3 },
        insertionRegion: { startBone: 0, endBone: 0 },
        shapeParams: { widthRatio: 0.25, thicknessRatio: 0.04, bulgeAmount: 0.05, taperFactor: 0.5 },
        restLength: 0.5,
        maxForce: 400.0
      }
    ]
  },

  // TRUNK & BACK
  {
    name: 'Topline',
    blendFactor: 0.15,
    muscles: [
      {
        name: 'Longissimus_Dorsi',
        type: 'sheet', // Major back muscle
        originChain: 'spine',
        insertionChain: 'spine',
        originRegion: { startBone: 0, endBone: 6 },
        insertionRegion: { startBone: 1, endBone: 6 }, // Runs full length
        shapeParams: { widthRatio: 0.35, thicknessRatio: 0.15, bulgeAmount: 0.1, taperFactor: 0.9 },
        restLength: 1.2,
        maxForce: 1500.0
      },
      {
        name: 'Latissimus_Dorsi',
        type: 'sheet',
        originChain: 'spine',
        insertionChain: 'flLeg',
        originRegion: { startBone: 2, endBone: 5 }, // Mid-back
        insertionRegion: { startBone: 0, endBone: 1 }, // Humerus (proximal)
        shapeParams: { widthRatio: 0.5, thicknessRatio: 0.05, bulgeAmount: 0.08, taperFactor: 0.6 },
        restLength: 0.8,
        maxForce: 900.0
      }
    ]
  },

  // CORE
  {
    name: 'Abdominals',
    blendFactor: 0.1,
    muscles: [
      {
        name: 'Rectus_Abdominis',
        type: 'sheet',
        originChain: 'spine', // Ribcage area
        insertionChain: 'pelvicGirdleL', // Pelvis
        originRegion: { startBone: 2, endBone: 4 },
        insertionRegion: { startBone: 0, endBone: 0 },
        shapeParams: { widthRatio: 0.4, thicknessRatio: 0.04, bulgeAmount: 0.02, taperFactor: 0.9 },
        restLength: 0.7,
        maxForce: 600.0
      },
      {
        name: 'Pectorals',
        type: 'complex',
        originChain: 'spine', // Sternum equivalent
        insertionChain: 'flLeg',
        originRegion: { startBone: 0, endBone: 2 },
        insertionRegion: { startBone: 1, endBone: 1 }, // Humerus
        shapeParams: { widthRatio: 0.25, thicknessRatio: 0.1, bulgeAmount: 0.2, taperFactor: 0.7 },
        restLength: 0.4,
        maxForce: 800.0
      }
    ]
  },

  // FOREQUARTER (Left only defined, simple mirror logic usually handles right if mirrored system exists, 
  // but current MuscleGenerator expects explicit definitions or one side? 
  // Wait, MuscleGenerator maps "shoulderGirdleL" AND "R". 
  // We need to define BOTH sides or assume the system mirrors. 
  // Looking at the legacy code, there was no auto-mirror. We must define R side.
  // FOR BREVITY in this step, I will define Left side fully, 
  // and we might need to duplicate for Right side if the system doesn't auto-mirror.
  // Actually, let's define both for fullness.

  // NOTE: For this iteration, I'll add a helper function or just define L/R pairs for major limbs.

  // FORELIMB (Left)
  {
    name: 'Forelimb_L',
    blendFactor: 0.08,
    muscles: [
      {
        name: 'Deltoid_L',
        type: 'pennate',
        originChain: 'shoulderGirdleL',
        insertionChain: 'flLeg',
        originRegion: { startBone: 0, endBone: 0 },
        insertionRegion: { startBone: 0, endBone: 1 }, // Humerus
        shapeParams: { widthRatio: 0.12, thicknessRatio: 0.06, bulgeAmount: 0.15, taperFactor: 0.8 },
        restLength: 0.3,
        maxForce: 500.0
      },
      {
        name: 'Triceps_L',
        type: 'complex',
        originChain: 'flLeg',
        insertionChain: 'flLeg',
        originRegion: { startBone: 0, endBone: 1 }, // Scapula/Humerus
        insertionRegion: { startBone: 1, endBone: 2 }, // Elbow (Ulna)
        shapeParams: { widthRatio: 0.15, thicknessRatio: 0.12, bulgeAmount: 0.25, taperFactor: 0.7 },
        restLength: 0.4,
        maxForce: 900.0
      },
      {
        name: 'Extensor_Carp_L',
        type: 'fusiform',
        originChain: 'flLeg',
        insertionChain: 'flLeg',
        originRegion: { startBone: 1, endBone: 2 }, // Radius
        insertionRegion: { startBone: 2, endBone: 3 }, // Metacarpus
        shapeParams: { widthRatio: 0.08, thicknessRatio: 0.04, bulgeAmount: 0.05, taperFactor: 0.6 },
        restLength: 0.35,
        maxForce: 300.0
      }
    ]
  },

  // FORELIMB (Right)
  {
    name: 'Forelimb_R',
    blendFactor: 0.08,
    muscles: [
      {
        name: 'Deltoid_R',
        type: 'pennate',
        originChain: 'shoulderGirdleR',
        insertionChain: 'frLeg',
        originRegion: { startBone: 0, endBone: 0 },
        insertionRegion: { startBone: 0, endBone: 1 },
        shapeParams: { widthRatio: 0.12, thicknessRatio: 0.06, bulgeAmount: 0.15, taperFactor: 0.8 },
        restLength: 0.3,
        maxForce: 500.0
      },
      {
        name: 'Triceps_R',
        type: 'complex',
        originChain: 'frLeg',
        insertionChain: 'frLeg',
        originRegion: { startBone: 0, endBone: 1 },
        insertionRegion: { startBone: 1, endBone: 2 },
        shapeParams: { widthRatio: 0.15, thicknessRatio: 0.12, bulgeAmount: 0.25, taperFactor: 0.7 },
        restLength: 0.4,
        maxForce: 900.0
      },
      {
        name: 'Extensor_Carp_R',
        type: 'fusiform',
        originChain: 'frLeg',
        insertionChain: 'frLeg',
        originRegion: { startBone: 1, endBone: 2 },
        insertionRegion: { startBone: 2, endBone: 3 },
        shapeParams: { widthRatio: 0.08, thicknessRatio: 0.04, bulgeAmount: 0.05, taperFactor: 0.6 },
        restLength: 0.35,
        maxForce: 300.0
      }
    ]
  },

  // HINDQUARTERS (Left)
  {
    name: 'Hindlimb_L',
    blendFactor: 0.1,
    muscles: [
      {
        name: 'Gluteus_Medius_L',
        type: 'complex', // Massive power muscle
        originChain: 'pelvicGirdleL',
        insertionChain: 'hlLeg',
        originRegion: { startBone: 0, endBone: 0 },
        insertionRegion: { startBone: 0, endBone: 1 }, // Femur
        shapeParams: { widthRatio: 0.25, thicknessRatio: 0.18, bulgeAmount: 0.3, taperFactor: 0.8 },
        restLength: 0.5,
        maxForce: 2000.0
      },
      {
        name: 'Biceps_Femoris_L',
        type: 'sheet', // Hamstring
        originChain: 'pelvicGirdleL',
        insertionChain: 'hlLeg',
        originRegion: { startBone: 0, endBone: 0 },
        insertionRegion: { startBone: 1, endBone: 2 }, // Tibia
        shapeParams: { widthRatio: 0.22, thicknessRatio: 0.1, bulgeAmount: 0.15, taperFactor: 0.8 },
        restLength: 0.6,
        maxForce: 1200.0
      },
      {
        name: 'Quadriceps_L',
        type: 'fusiform',
        originChain: 'hlLeg', // Femur
        insertionChain: 'hlLeg',
        originRegion: { startBone: 0, endBone: 1 },
        insertionRegion: { startBone: 1, endBone: 2 }, // Tibia (Patella)
        shapeParams: { widthRatio: 0.18, thicknessRatio: 0.12, bulgeAmount: 0.25, taperFactor: 0.7 },
        restLength: 0.45,
        maxForce: 1500.0
      },
      {
        name: 'Gastrocnemius_L',
        type: 'pennate', // Calf
        originChain: 'hlLeg',
        insertionChain: 'hlLeg',
        originRegion: { startBone: 1, endBone: 2 }, // Femur/Tibia junction
        insertionRegion: { startBone: 2, endBone: 3 }, // Hock
        shapeParams: { widthRatio: 0.12, thicknessRatio: 0.08, bulgeAmount: 0.2, taperFactor: 0.9 },
        restLength: 0.4,
        maxForce: 1000.0
      }
    ]
  },

  // HINDQUARTERS (Right)
  {
    name: 'Hindlimb_R',
    blendFactor: 0.1,
    muscles: [
      {
        name: 'Gluteus_Medius_R',
        type: 'complex',
        originChain: 'pelvicGirdleR',
        insertionChain: 'hrLeg',
        originRegion: { startBone: 0, endBone: 0 },
        insertionRegion: { startBone: 0, endBone: 1 },
        shapeParams: { widthRatio: 0.25, thicknessRatio: 0.18, bulgeAmount: 0.3, taperFactor: 0.8 },
        restLength: 0.5,
        maxForce: 2000.0
      },
      {
        name: 'Biceps_Femoris_R',
        type: 'sheet',
        originChain: 'pelvicGirdleR',
        insertionChain: 'hrLeg',
        originRegion: { startBone: 0, endBone: 0 },
        insertionRegion: { startBone: 1, endBone: 2 },
        shapeParams: { widthRatio: 0.22, thicknessRatio: 0.1, bulgeAmount: 0.15, taperFactor: 0.8 },
        restLength: 0.6,
        maxForce: 1200.0
      },
      {
        name: 'Quadriceps_R',
        type: 'fusiform',
        originChain: 'hrLeg',
        insertionChain: 'hrLeg',
        originRegion: { startBone: 0, endBone: 1 },
        insertionRegion: { startBone: 1, endBone: 2 },
        shapeParams: { widthRatio: 0.18, thicknessRatio: 0.12, bulgeAmount: 0.25, taperFactor: 0.7 },
        restLength: 0.45,
        maxForce: 1500.0
      },
      {
        name: 'Gastrocnemius_R',
        type: 'pennate',
        originChain: 'hrLeg',
        insertionChain: 'hrLeg',
        originRegion: { startBone: 1, endBone: 2 },
        insertionRegion: { startBone: 2, endBone: 3 },
        shapeParams: { widthRatio: 0.12, thicknessRatio: 0.08, bulgeAmount: 0.2, taperFactor: 0.9 },
        restLength: 0.4,
        maxForce: 1000.0
      }
    ]
  }
];

export const HORSE_MUSCLE_CONFIG: CreatureMuscleConfig = {
  overallScale: 1.0,
  bodyType: 'muscular',
  muscleGroups: {
    axial: { mass: 1.5, definition: 0.8 },
    limbs: { mass: 1.2, definition: 0.9 },
    neck: { mass: 1.0, length: 0.8 },
    tail: { mass: 0.5, thickness: 0.3 }
  }
};

export default HORSE_MUSCLE_GROUPS;