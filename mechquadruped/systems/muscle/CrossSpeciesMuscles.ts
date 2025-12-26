import * as THREE from 'three';
import { MuscleGroup, CreatureMuscleConfig } from './MuscleTemplate';

export interface SpeciesMuscleConfig {
  name: string;
  baseConfig: CreatureMuscleConfig;
  muscleGroups: MuscleGroup[];
  scalingFactors: {
    legLength: number;
    bodyLength: number;
    neckLength: number;
    tailLength: number;
  };
}

export class CrossSpeciesMuscles {
  private configs: Map<string, SpeciesMuscleConfig> = new Map();

  constructor() {
    this.initializeConfigs();
  }

  private initializeConfigs(): void {
    // Horse configuration (base)
    this.configs.set('Horse', {
      name: 'Horse',
      baseConfig: {
        overallScale: 1.0,
        bodyType: 'muscular',
        muscleGroups: {
          axial: { mass: 1.5, definition: 0.8 },
          limbs: { mass: 1.2, definition: 0.9 },
          neck: { mass: 1.0, length: 0.8 },
          tail: { mass: 0.5, thickness: 0.3 }
        }
      },
      muscleGroups: [], // Would load from HorseMuscles.ts
      scalingFactors: {
        legLength: 1.0,
        bodyLength: 1.0,
        neckLength: 1.0,
        tailLength: 1.0
      }
    });

    // Lizard configuration
    this.configs.set('Lizard', {
      name: 'Lizard',
      baseConfig: {
        overallScale: 0.6,
        bodyType: 'slender',
        muscleGroups: {
          axial: { mass: 0.8, definition: 0.5 },
          limbs: { mass: 0.6, definition: 0.4 },
          neck: { mass: 0.4, length: 0.5 },
          tail: { mass: 1.2, thickness: 0.8 }
        }
      },
      muscleGroups: this.scaleMuscleGroups('Horse', {
        bodyLength: 0.8,
        legLength: 0.6,
        neckLength: 0.4,
        tailLength: 1.5
      }),
      scalingFactors: {
        legLength: 0.6,
        bodyLength: 0.8,
        neckLength: 0.4,
        tailLength: 1.5
      }
    });

    // Ostrich configuration
    this.configs.set('Ostrich', {
      name: 'Ostrich',
      baseConfig: {
        overallScale: 1.2,
        bodyType: 'slender',
        muscleGroups: {
          axial: { mass: 0.7, definition: 0.6 },
          limbs: { mass: 1.8, definition: 1.0 },
          neck: { mass: 0.3, length: 1.2 },
          tail: { mass: 0.2, thickness: 0.2 }
        }
      },
      muscleGroups: this.scaleMuscleGroups('Horse', {
        bodyLength: 0.7,
        legLength: 1.3,
        neckLength: 1.5,
        tailLength: 0.3
      }),
      scalingFactors: {
        legLength: 1.3,
        bodyLength: 0.7,
        neckLength: 1.5,
        tailLength: 0.3
      }
    });
  }

  private scaleMuscleGroups(baseSpecies: string, scaling: any): MuscleGroup[] {
    // Would load base species and scale appropriately
    // For now, return empty
    return [];
  }

  getMuscleConfig(species: string): SpeciesMuscleConfig | null {
    return this.configs.get(species) || null;
  }

  addSpecies(config: SpeciesMuscleConfig): void {
    this.configs.set(config.name, config);
  }

  getAllSpecies(): string[] {
    return Array.from(this.configs.keys());
  }

  // Morph between two species
  morphMuscleConfig(fromSpecies: string, toSpecies: string, t: number): SpeciesMuscleConfig | null {
    const from = this.configs.get(fromSpecies);
    const to = this.configs.get(toSpecies);

    if (!from || !to) return null;

    // Interpolate configurations
    const morphedConfig: SpeciesMuscleConfig = {
      name: `${fromSpecies}_${toSpecies}_morph`,
      baseConfig: {
        overallScale: THREE.MathUtils.lerp(from.baseConfig.overallScale, to.baseConfig.overallScale, t),
        bodyType: t < 0.5 ? from.baseConfig.bodyType : to.baseConfig.bodyType,
        muscleGroups: {
          axial: {
            mass: THREE.MathUtils.lerp(from.baseConfig.muscleGroups.axial.mass,
                                       to.baseConfig.muscleGroups.axial.mass, t),
            definition: THREE.MathUtils.lerp(from.baseConfig.muscleGroups.axial.definition,
                                           to.baseConfig.muscleGroups.axial.definition, t)
          },
          limbs: {
            mass: THREE.MathUtils.lerp(from.baseConfig.muscleGroups.limbs.mass,
                                       to.baseConfig.muscleGroups.limbs.mass, t),
            definition: THREE.MathUtils.lerp(from.baseConfig.muscleGroups.limbs.definition,
                                           to.baseConfig.muscleGroups.limbs.definition, t)
          },
          neck: {
            mass: THREE.MathUtils.lerp(from.baseConfig.muscleGroups.neck.mass,
                                       to.baseConfig.muscleGroups.neck.mass, t),
            length: THREE.MathUtils.lerp(from.baseConfig.muscleGroups.neck.length,
                                        to.baseConfig.muscleGroups.neck.length, t)
          },
          tail: {
            mass: THREE.MathUtils.lerp(from.baseConfig.muscleGroups.tail.mass,
                                       to.baseConfig.muscleGroups.tail.mass, t),
            thickness: THREE.MathUtils.lerp(from.baseConfig.muscleGroups.tail.thickness,
                                           to.baseConfig.muscleGroups.tail.thickness, t)
          }
        }
      },
      muscleGroups: [], // Would morph actual muscle groups
      scalingFactors: {
        legLength: THREE.MathUtils.lerp(from.scalingFactors.legLength,
                                       to.scalingFactors.legLength, t),
        bodyLength: THREE.MathUtils.lerp(from.scalingFactors.bodyLength,
                                        to.scalingFactors.bodyLength, t),
        neckLength: THREE.MathUtils.lerp(from.scalingFactors.neckLength,
                                        to.scalingFactors.neckLength, t),
        tailLength: THREE.MathUtils.lerp(from.scalingFactors.tailLength,
                                        to.scalingFactors.tailLength, t)
      }
    };

    return morphedConfig;
  }
}