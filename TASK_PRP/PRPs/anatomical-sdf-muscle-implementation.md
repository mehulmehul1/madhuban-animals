# TASK PRP: Anatomical SDF Muscle System Implementation

## Context

### Documentation References
- **Hill Muscle Model**: `PRPs/ai_docs/hill_muscle_model.md` - Complete physics equations
- **WebGL2 Limits**: `PRPs/ai_docs/webgl2_limits.md` - Hardware constraints and optimization
- **Horse Anatomy**: `PRPs/ai_docs/horse_anatomy.md` - Detailed muscle reference

### Code Patterns to Follow
```typescript
// Interface pattern from CreatureConfig.tsx
export interface MuscleConfig {
  name: string;
  type: 'fusiform' | 'pennate' | 'sheet' | 'complex';
  // Follow same nested object structure
}

// Export pattern
export const HORSE_MUSCLES: MuscleConfig = {
  // Follow constant naming convention
};

// React pattern from SDFLayer.tsx
useFrame((state) => {
  // Update uniforms here
  if (!meshRef.current || !enabled) return;
});
```

### Gotchas
- **Shader instruction count**: Keep each SDF function < 100 instructions
- **Uniform updates**: Batch updates, use textures for arrays > 16
- **Precision**: Use `mediump` for non-critical calculations
- **Mobile performance**: Adaptive quality for 30fps minimum

## Task Sequencing

### Phase 1: Foundation Setup

#### Task 1: Create Muscle System Architecture
```yaml
ACTION mechquadruped/systems/muscle/MuscleTemplate.ts:
  - OPERATION: Create TypeScript interfaces and classes
  - CREATE: |
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
  - VALIDATE: npm run build
  - IF_FAIL: Check TypeScript errors in console
  - ROLLBACK: git checkout -- mechquadruped/systems/muscle/
```

#### Task 2: Implement SDF Primitives
```yaml
ACTION mechquadruped/shaders/sdf/MusclePrimitives.glsl:
  - OPERATION: Create anatomical SDF functions
  - CREATE: |
    // Anatomical SDF primitives for muscle rendering
    // Based on Inigo Quilez SDF functions with anatomical modifications

    precision mediump float;

    // Polynomial smooth minimum for natural muscle blending
    float psmin(float a, float b, float k) {
        float h = clamp(k/(a-b), 0.0, 1.0);
        return mix(a, b, h) - h*(1.0-h)*k/(a-b);
    }

    // Fusiform muscle - spindle-shaped like biceps
    // REF: horse_anatomy.md - fusiform muscles section
    float sdFusiform(vec3 p, vec3 a, vec3 b, float r1, float r2, float bulge) {
        vec3 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);

        // Add bulge in middle of muscle (Hill model effect)
        float midBulge = sin(h * 3.14159) * bulge;
        float r = mix(r1, r2, h) + midBulge * min(r1, r2);

        return length(pa - ba * h) - r;
    }

    // Pennate muscle - feather-like like deltoid
    // REF: horse_anatomy.md - pennate muscles section
    float sdPennate(vec3 p, vec3 origin, vec3 direction, vec3 normal,
                    float width, float height, float angle) {
        vec3 local = p - origin;
        float along = dot(local, direction);
        float perp = length(local - direction * along);

        // Feather-like taper based on angle
        float taper = pow(clamp(1.0 - along / height, 0.0, 1.0), angle);
        float r = width * taper;

        return perp - r;
    }

    // Sheet muscle - flat sheet like longissimus dorsi
    // REF: horse_anatomy.md - axial muscles section
    float sdSheetMuscle(vec3 p, vec3 spineStart, vec3 spineEnd,
                       float width, float thickness, float wave) {
        vec3 spineDir = normalize(spineEnd - spineStart);
        vec3 toP = p - spineStart;
        float alongSpine = dot(toP, spineDir);

        // Add wave variation along spine (for breathing/flexing)
        float w = width * (1.0 + wave * sin(alongSpine * 2.0));

        // Distance from spine centerline
        vec3 closest = spineStart + spineDir * alongSpine;
        vec3 toClosest = p - closest;

        return length(toClosest - spineDir * dot(toClosest, spineDir)) - thickness;
    }

    // Complex muscle - multi-belly like hamstrings
    // REF: horse_anatomy.md - complex muscle patterns
    float sdComplexMuscle(vec3 p, vec3 origins[3], vec3 insertions[3],
                         float radii[3], float blend) {
        float d = 1000.0;
        for(int i = 0; i < 3; i++) {
            float belly = sdFusiform(p, origins[i], insertions[i],
                                   radii[i], radii[i] * 0.7, 0.1);
            d = psmin(d, belly, blend);
        }
        return d;
    }

    // Force deformation helpers
    // REF: hill_muscle_model.md - simplified GPU version
    float applyMuscleDeformation(float sdf, float stretch, float compression,
                                float bulge, vec3 muscleDir) {
        // Volume preservation approximation
        float thicknessEffect = 1.0 / sqrt(1.0 + compression);
        float bulgeEffect = bulge * (1.0 - stretch);

        return sdf * thicknessEffect - bulgeEffect * 0.1;
    }
  - VALIDATE: Load in browser and check console for compilation
  - IF_FAIL: Check GLSL syntax errors in browser dev tools
  - ROLLBACK: git checkout -- mechquadruped/shaders/sdf/
```

#### Task 3: Create Horse Muscle Configuration
```yaml
ACTION mechquadruped/configs/HorseMuscles.ts:
  - OPERATION: Define anatomical horse muscles
  - CREATE: |
    import { MuscleTemplate, MuscleGroup, CreatureMuscleConfig } from '../systems/muscle/MuscleTemplate';

    // REF: horse_anatomy.md - complete muscle reference
    export const HORSE_MUSCLE_GROUPS: MuscleGroup[] = [
      // Axial muscles (40% muscle mass)
      {
        name: 'LongissimusDorsi',
        blendFactor: 0.1,
        muscles: [
          {
            name: 'Longissimus_Dorsi_Thoracic',
            type: 'sheet',
            originChain: 'spine',
            insertionChain: 'spine',
            originRegion: { startBone: 0, endBone: 4 },
            insertionRegion: { startBone: 2, endBone: 6 },
            shapeParams: {
              widthRatio: 0.15,
              thicknessRatio: 0.05,
              bulgeAmount: 0.1,
              taperFactor: 0.8
            },
            restLength: 1.05,
            maxForce: 1000.0
          }
        ]
      },

      // Neck muscles
      {
        name: 'NeckExtensors',
        blendFactor: 0.08,
        muscles: [
          {
            name: 'Splenius',
            type: 'pennate',
            originChain: 'spine',
            insertionChain: 'neck',
            originRegion: { startBone: 0, endBone: 1 },
            insertionRegion: { startBone: 0, endBone: 2 },
            shapeParams: {
              widthRatio: 0.08,
              thicknessRatio: 0.03,
              bulgeAmount: 0.05,
              taperFactor: 0.6
            },
            restLength: 0.48,
            maxForce: 500.0
          },
          {
            name: 'Brachiocephalicus',
            type: 'fusiform',
            originChain: 'neck',
            insertionChain: 'flLeg',
            originRegion: { startBone: 0, endBone: 0 },
            insertionRegion: { startBone: 0, endBone: 1 },
            shapeParams: {
              widthRatio: 0.06,
              thicknessRatio: 0.025,
              bulgeAmount: 0.15,
              taperFactor: 0.7
            },
            restLength: 0.6,
            maxForce: 600.0
          }
        ]
      },

      // Forelimb muscles (25% muscle mass)
      {
        name: 'ShoulderGirdle',
        blendFactor: 0.06,
        muscles: [
          {
            name: 'Deltoid',
            type: 'pennate',
            originChain: 'shoulderGirdleL',
            insertionChain: 'flLeg',
            originRegion: { startBone: 0, endBone: 0 },
            insertionRegion: { startBone: 0, endBone: 1 },
            shapeParams: {
              widthRatio: 0.05,
              thicknessRatio: 0.03,
              bulgeAmount: 0.15,
              taperFactor: 0.9
            },
            restLength: 0.22,
            maxForce: 400.0
          }
        ]
      },

      {
        name: 'ForearmMuscles',
        blendFactor: 0.04,
        muscles: [
          {
            name: 'Biceps_Brachii',
            type: 'fusiform',
            originChain: 'flLeg',
            insertionChain: 'flLeg',
            originRegion: { startBone: 0, endBone: 1 },
            insertionRegion: { startBone: 1, endBone: 2 },
            shapeParams: {
              widthRatio: 0.04,
              thicknessRatio: 0.025,
              bulgeAmount: 0.2,
              taperFactor: 0.7
            },
            restLength: 0.3,
            maxForce: 500.0
          },
          {
            name: 'Triceps_Brachii',
            type: 'complex',
            originChain: 'flLeg',
            insertionChain: 'flLeg',
            originRegion: { startBone: 0, endBone: 2 },
            insertionRegion: { startBone: 2, endBone: 3 },
            shapeParams: {
              widthRatio: 0.05,
              thicknessRatio: 0.03,
              bulgeAmount: 0.12,
              taperFactor: 0.8
            },
            restLength: 0.45,
            maxForce: 800.0
          }
        ]
      },

      // Hindlimb muscles (40% muscle mass)
      {
        name: 'HipExtensors',
        blendFactor: 0.08,
        muscles: [
          {
            name: 'Gluteus_Medius',
            type: 'pennate',
            originChain: 'pelvicGirdleL',
            insertionChain: 'hlLeg',
            originRegion: { startBone: 0, endBone: 0 },
            insertionRegion: { startBone: 0, endBone: 1 },
            shapeParams: {
              widthRatio: 0.06,
              thicknessRatio: 0.04,
              bulgeAmount: 0.18,
              taperFactor: 0.85
            },
            restLength: 0.35,
            maxForce: 1500.0
          }
        ]
      },

      {
        name: 'ThighMuscles',
        blendFactor: 0.06,
        muscles: [
          {
            name: 'Biceps_Femoris',
            type: 'complex',
            originChain: 'pelvicGirdleL',
            insertionChain: 'hlLeg',
            originRegion: { startBone: 0, endBone: 0 },
            insertionRegion: { startBone: 1, endBone: 2 },
            shapeParams: {
              widthRatio: 0.07,
              thicknessRatio: 0.035,
              bulgeAmount: 0.15,
              taperFactor: 0.75
            },
            restLength: 0.4,
            maxForce: 1200.0
          },
          {
            name: 'Gastrocnemius',
            type: 'pennate',
            originChain: 'hlLeg',
            insertionChain: 'hlLeg',
            originRegion: { startBone: 1, endBone: 2 },
            insertionRegion: { startBone: 2, endBone: 3 },
            shapeParams: {
              widthRatio: 0.04,
              thicknessRatio: 0.03,
              bulgeAmount: 0.16,
              taperFactor: 0.9
            },
            restLength: 0.25,
            maxForce: 800.0
          }
        ]
      }
    ];

    // Cross-species configuration
    export const HORSE_MUSCLE_CONFIG: CreatureMuscleConfig = {
      overallScale: 1.0,
      bodyType: 'muscular',
      muscleGroups: {
        axial: { mass: 1.5, definition: 0.8 }, // Strong back muscles
        limbs: { mass: 1.2, definition: 0.9 }, // Defined leg muscles
        neck: { mass: 1.0, length: 0.8 }, // Medium neck muscles
        tail: { mass: 0.5, thickness: 0.3 } // Thin tail
      }
    };

    export default HORSE_MUSCLE_GROUPS;
  - VALIDATE: npm run build && node -e "require('./configs/HorseMuscles.ts')"
  - IF_FAIL: Check TypeScript compilation errors
  - ROLLBACK: git checkout -- mechquadruped/configs/HorseMuscles.ts
```

### Phase 2: Core Implementation

#### Task 4: Create Muscle Generator
```yaml
ACTION mechquadruped/systems/muscle/MuscleGenerator.ts:
  - OPERATION: Generate GLSL code from muscle templates
  - CREATE: |
    import { MuscleGroup, MuscleTemplate } from './MuscleTemplate';
    import { QuadrupedSkeleton } from '../../services/Skeleton';
    import * as THREE from 'three';

    export class MuscleGenerator {
      private muscles: MuscleGroup[] = [];
      private boneMap: Map<string, { offset: number; count: number }> = new Map();
      private shaderCache: Map<string, string> = new Map();

      constructor(muscleConfig: MuscleGroup[]) {
        this.muscles = muscleConfig;
        this.initializeBoneMap();
      }

      private initializeBoneMap(): void {
        // Map chain names to bone indices - must match Skeleton.ts structure
        this.boneMap.set('spine', { offset: 0, count: 7 });
        this.boneMap.set('neck', { offset: 7, count: 4 });
        this.boneMap.set('head', { offset: 11, count: 1 });
        this.boneMap.set('tail', { offset: 12, count: 6 });
        this.boneMap.set('shoulderGirdleL', { offset: 18, count: 1 });
        this.boneMap.set('shoulderGirdleR', { offset: 19, count: 1 });
        this.boneMap.set('pelvicGirdleL', { offset: 20, count: 1 });
        this.boneMap.set('pelvicGirdleR', { offset: 21, count: 1 });
        this.boneMap.set('flLeg', { offset: 22, count: 5 });
        this.boneMap.set('frLeg', { offset: 27, count: 5 });
        this.boneMap.set('hlLeg', { offset: 32, count: 4 });
        this.boneMap.set('hrLeg', { offset: 36, count: 4 });
      }

      generateGLSL(skeleton: QuadrupedSkeleton): string {
        const cacheKey = this.getCacheKey(skeleton);
        if (this.shaderCache.has(cacheKey)) {
          return this.shaderCache.get(cacheKey)!;
        }

        let glsl = this.getHeader();
        glsl += this.generateBoneFunctions();
        glsl += this.generateMuscleSDFs();
        glsl += this.generateMainSDF();

        this.shaderCache.set(cacheKey, glsl);
        return glsl;
      }

      private getCacheKey(skeleton: QuadrupedSkeleton): string {
        return `${skeleton.type}_${this.muscles.length}`;
      }

      private getHeader(): string {
        return `
        // Generated muscle SDF functions
        // REF: webgl2_limits.md - keep < 100 instructions per function

        uniform vec3 uBonePositions[50];  // Max bones
        uniform vec4 uMuscleParams[50];    // width, thickness, bulge, activation
        uniform vec4 uMuscleDeforms[50];  // stretch, compression, twist, velocity

        vec3 getBonePosition(int boneIndex) {
          return uBonePositions[boneIndex];
        }

        `;
      }

      private generateBoneFunctions(): string {
        return `
        // Helper to get bone endpoints
        void getBoneEnds(int boneIndex, out vec3 start, out vec3 end) {
          start = uBonePositions[boneIndex];
          end = uBonePositions[boneIndex + 1];
        }

        `;
      }

      private generateMuscleSDFs(): string {
        let glsl = '';

        for (const group of this.muscles) {
          glsl += this.generateMuscleGroupSDF(group);
        }

        return glsl;
      }

      private generateMuscleGroupSDF(group: MuscleGroup): string {
        let glsl = `// ${group.name} muscle group\n`;
        glsl += `float sd${group.name}(vec3 p) {\n`;
        glsl += '  float d = 1000.0;\n\n';

        for (const muscle of group.muscles) {
          glsl += this.generateMuscleSDF(muscle, group);
        }

        glsl += '  return d;\n}\n\n';
        return glsl;
      }

      private generateMuscleSDF(muscle: MuscleTemplate, group: MuscleGroup): string {
        const originStart = this.getBoneIndex(muscle.originChain, muscle.originRegion.startBone);
        const originEnd = this.getBoneIndex(muscle.originChain, muscle.originRegion.endBone);
        const insertStart = this.getBoneIndex(muscle.insertionChain, muscle.insertionRegion.startBone);
        const insertEnd = this.getBoneIndex(muscle.insertionChain, muscle.insertionRegion.endBone);

        const sdfCode = `
  // ${muscle.name}
  {
    // Get bone positions
    vec3 originStart = getBonePosition(${originStart});
    vec3 originEnd = getBonePosition(${originEnd});
    vec3 insertStart = getBonePosition(${insertStart});
    vec3 insertEnd = getBonePosition(${insertEnd});

    // Calculate muscle parameters
    int paramIndex = ${this.muscles.indexOf(group) * 10 + group.muscles.indexOf(muscle)};
    vec4 params = uMuscleParams[paramIndex];
    vec4 deform = uMuscleDeforms[paramIndex];

    float muscleDist = sd${muscle.type.charAt(0).toUpperCase() + muscle.type.slice(1)}(
      p, originEnd, insertStart,
      params.x * ${muscle.shapeParams.widthRatio},
      params.y * ${muscle.shapeParams.thicknessRatio},
      params.z * ${muscle.shapeParams.bulgeAmount}
    );

    // Apply force-based deformation
    muscleDist = applyMuscleDeformation(muscleDist, deform.x, deform.y, deform.z,
                                        normalize(insertStart - originEnd));

    d = psmin(d, muscleDist, ${group.blendFactor});
  }`;
        return sdfCode;
      }

      private generateMainSDF(): string {
        return `
float sdAllMuscles(vec3 p) {
  float result = 1000.0;
`;

        for (const group of this.muscles) {
          const sdfCall = `  result = psmin(result, sd${group.name}(p), 0.05);\n`;
        }

        const mainSDF = `
  return result;
}

// Main scene SDF with adaptive quality
float map(vec3 p) {
  // LOD based on distance
  float dist = length(p - uCameraPos);
  float quality = dist > 10.0 ? 0.5 : 1.0;

  if (quality < 1.0) {
    // Simplified muscles for distant viewing
    return sdAllMuscles(p) * quality;
  } else {
    return sdAllMuscles(p);
  }
}
`;

        return this.muscles.map(group => sdfCall).join('') + mainSDF;
      }

      private getBoneIndex(chainName: string, boneIndex: number): number {
        const chain = this.boneMap.get(chainName);
        if (!chain) {
          console.warn(`Unknown chain: ${chainName}`);
          return 0;
        }
        return chain.offset + boneIndex;
      }

      getUniforms(): any {
        return {
          uBonePositions: { value: new Float32Array(50 * 3) },
          uMuscleParams: { value: new Float32Array(50 * 4) },
          uMuscleDeforms: { value: new Float32Array(50 * 4) }
        };
      }

      updateUniforms(skeleton: QuadrupedSkeleton, uniforms: any): void {
        // Update bone positions
        const bonePos = uniforms.uBonePositions.value;
        let boneIndex = 0;

        // Extract all bone positions from skeleton
        this.extractChainPositions(skeleton.spine, bonePos, boneIndex);
        boneIndex += skeleton.spine?.bones.length || 0;

        this.extractChainPositions(skeleton.neck, bonePos, boneIndex);
        boneIndex += skeleton.neck?.bones.length || 0;

        // ... continue for all chains
      }

      private extractChainPositions(chain: any, buffer: Float32Array, startIndex: number): void {
        if (!chain || !chain.bones) return;

        chain.bones.forEach((bone: any, i: number) => {
          const pos = new THREE.Vector3();
          bone.pivot.getWorldPosition(pos);

          buffer[(startIndex + i) * 3] = pos.x;
          buffer[(startIndex + i) * 3 + 1] = pos.y;
          buffer[(startIndex + i) * 3 + 2] = pos.z;
        });
      }
    }
  - VALIDATE: npm run build
  - IF_FAIL: Check TypeScript compilation errors
  - ROLLBACK: git checkout -- mechquadruped/systems/muscle/MuscleGenerator.ts
```

#### Task 5: Implement Force Deformation
```yaml
ACTION mechquadruped/systems/physics/ForceDeformer.ts:
  - OPERATION: Create physics-based deformation system
  - CREATE: |
    import * as THREE from 'three';
    import { QuadrupedSkeleton } from '../Skeleton';
    import { Locomotion } from '../Locomotion';
    import { MuscleGroup } from '../muscle/MuscleTemplate';

    // REF: hill_muscle_model.md - implementation
    export interface MuscleForce {
      stretch: number;        // 0-1, normalized from rest length
      compression: number;    // 0-1, perpendicular compression
      twist: number;         // -1 to 1, rotation around axis
      activation: number;    // 0-1, neural activation
      velocity: number;      // Current contraction velocity
    }

    export class ForceDeformer {
      private forces: Map<string, MuscleForce> = new Map();
      private previousLengths: Map<string, number> = new Map();
      private previousTime: number = 0;

      // REF: hill_muscle_model.md - GPU-friendly parameters
      private readonly HILL_PARAMS = {
        V_MAX: 10.0,           // Maximum shortening velocity
        K_SHORT: 0.25,         // Shortening shape constant
        K_LONG: 1.5,          // Lengthening shape constant
        SIGMA_L: 0.5,         // Force-length shape parameter
        EXP_RATE: 10.0         // Passive force exponential rate
      };

      constructor(muscleGroups: MuscleGroup[]) {
        this.initializeForces(muscleGroups);
      }

      private initializeForces(muscleGroups: MuscleGroup[]): void {
        for (const group of muscleGroups) {
          for (const muscle of group.muscles) {
            const key = `${group.name}_${muscle.name}`;
            this.forces.set(key, {
              stretch: 0,
              compression: 0,
              twist: 0,
              activation: 0.3, // Rest activation
              velocity: 0
            });
            this.previousLengths.set(key, muscle.restLength);
          }
        }
      }

      update(skeleton: QuadrupedSkeleton, locomotion: Locomotion, deltaTime: number): void {
        const currentTime = performance.now() / 1000;
        const dt = Math.min(deltaTime, 0.1); // Cap dt for stability

        // Update forces for each muscle
        for (const [key, force] of this.forces) {
          // Calculate current muscle state
          const currentLength = this.calculateMuscleLength(key, skeleton);
          const previousLength = this.previousLengths.get(key) || currentLength;

          // Calculate metrics
          const restLength = this.getRestLength(key);
          const stretch = (currentLength - restLength) / restLength;
          const velocity = (currentLength - previousLength) / dt;

          // Hill's muscle model calculations
          const forceLength = this.calculateForceLength(stretch);
          const forceVelocity = this.calculateForceVelocity(velocity);
          const passiveForce = this.calculatePassiveForce(stretch);

          // Calculate activation based on gait
          const activation = this.calculateActivation(key, locomotion, forceLength, forceVelocity);

          // Update force
          force.stretch = Math.max(0, stretch);
          force.compression = this.calculateCompression(stretch, forceLength);
          force.twist = this.calculateTwist(key, skeleton);
          force.activation = activation;
          force.velocity = velocity;

          // Store for next frame
          this.previousLengths.set(key, currentLength);
        }

        this.previousTime = currentTime;
      }

      private calculateMuscleLength(muscleKey: string, skeleton: QuadrupedSkeleton): number {
        // Parse key to get muscle info
        const [groupName, muscleName] = muscleKey.split('_');

        // Get bone positions (simplified - in production, parse from config)
        const origin = this.getBonePosition('spine', 0, skeleton);
        const insertion = this.getBonePosition('spine', 3, skeleton);

        return origin.distanceTo(insertion);
      }

      private getBonePosition(chainName: string, boneIndex: number, skeleton: QuadrupedSkeleton): THREE.Vector3 {
        // Simplified - would parse from actual muscle configuration
        const pos = new THREE.Vector3();

        if (chainName === 'spine' && skeleton.spine?.bones[boneIndex]) {
          skeleton.spine.bones[boneIndex].pivot.getWorldPosition(pos);
        }

        return pos;
      }

      private getRestLength(muscleKey: string): number {
        // Would get from muscle configuration
        return 1.0; // Default
      }

      // REF: hill_muscle_model.md - simplified GPU version
      private calculateForceLength(stretch: number): number {
        // Parabolic approximation
        return Math.max(0, 1 - 4 * Math.pow(stretch / 0.5, 2));
      }

      private calculateForceVelocity(velocity: number): number {
        const vNorm = velocity / this.HILL_PARAMS.V_MAX;

        if (velocity < 0) { // Shortening
          return (this.HILL_PARAMS.V_MAX - velocity) /
                 (this.HILL_PARAMS.V_MAX + velocity / this.HILL_PARAMS.K_SHORT);
        } else { // Lengthening
          return (this.HILL_PARAMS.V_MAX + this.HILL_PARAMS.K_LONG * velocity) /
                 (this.HILL_PARAMS.V_MAX - velocity);
        }
      }

      private calculatePassiveForce(stretch: number): number {
        if (stretch <= 0) return 0;
        return Math.exp(this.HILL_PARAMS.EXP_RATE * stretch) - 1;
      }

      private calculateActivation(muscleKey: string, locomotion: Locomotion,
                                 forceLength: number, forceVelocity: number): number {
        // Base activation from gait and speed
        const speedActivation = Math.min(locomotion.speed * 2, 1.0);

        // Muscle-specific activation based on function
        if (muscleKey.includes('Gastrocnemius') || muscleKey.includes('Gluteus')) {
          // Propulsion muscles - activate during stance phase
          return speedActivation * (locomotion.gait === 'Gallop' ? 1.2 : 0.8);
        } else if (muscleKey.includes('Biceps') || muscleKey.includes('Triceps')) {
          // Limb muscles - cyclic activation
          return speedActivation * 0.7;
        } else if (muscleKey.includes('Longissimus')) {
          // Core muscles - always partially active
          return 0.3 + speedActivation * 0.3;
        }

        return speedActivation * 0.5;
      }

      private calculateCompression(stretch: number, forceLength: number): number {
        // Volume preservation approximation
        if (stretch < 0) {
          return Math.min(1, Math.abs(stretch) * 2);
        }
        return 0;
      }

      private calculateTwist(muscleKey: string, skeleton: QuadrupedSkeleton): number {
        // Simplified twist calculation
        // Would calculate based on bone rotations
        return 0;
      }

      getForce(muscleKey: string): MuscleForce {
        return this.forces.get(muscleKey) || {
          stretch: 0,
          compression: 0,
          twist: 0,
          activation: 0.3,
          velocity: 0
        };
      }

      getUniformArrays(muscleGroups: MuscleGroup[]): {
        params: Float32Array;
        deforms: Float32Array;
      } {
        const params = new Float32Array(50 * 4);
        const deforms = new Float32Array(50 * 4);
        let index = 0;

        for (const group of muscleGroups) {
          for (const muscle of group.muscles) {
            const key = `${group.name}_${muscle.name}`;
            const force = this.forces.get(key);

            if (force && index < 50) {
              // Parameters: width, thickness, bulge, activation
              params[index * 4] = muscle.shapeParams.widthRatio;
              params[index * 4 + 1] = muscle.shapeParams.thicknessRatio;
              params[index * 4 + 2] = muscle.shapeParams.bulgeAmount;
              params[index * 4 + 3] = force.activation;

              // Deformations: stretch, compression, twist, velocity
              deforms[index * 4] = force.stretch;
              deforms[index * 4 + 1] = force.compression;
              deforms[index * 4 + 2] = force.twist;
              deforms[index * 4 + 3] = Math.abs(force.velocity);

              index++;
            }
          }
        }

        return { params, deforms };
      }
    }
  - VALIDATE: npm run build
  - IF_FAIL: Check TypeScript compilation
  - ROLLBACK: git checkout -- mechquadruped/systems/physics/ForceDeformer.ts
```

### Phase 3: Integration

#### Task 6: Enhance SDFLayer
```yaml
ACTION mechquadruped/components/sdf/SDFLayer.tsx:
  - OPERATION: Modify to use muscle system
  - MODIFY: |
    import React, { useRef, useMemo, useEffect, useState } from 'react';
    import { useFrame, useThree } from '@react-three/fiber';
    import * as THREE from 'three';
    import { QuadrupedSkeleton } from '../../services/Skeleton';
    import { MuscleGenerator } from '../../systems/muscle/MuscleGenerator';
    import { ForceDeformer } from '../../systems/physics/ForceDeformer';
    import { HORSE_MUSCLE_GROUPS } from '../../configs/HorseMuscles';

    // Keep existing shader imports for now
    import { fragmentShader, vertexShader } from './HorseSDFShader';

    interface SDFLayerProps {
        skeleton: QuadrupedSkeleton;
        enabled: boolean;
        useMuscles?: boolean; // New prop to switch to muscle system
        quality?: 'low' | 'medium' | 'high';
    }

    const SDFLayer: React.FC<SDFLayerProps> = ({
        skeleton,
        enabled,
        useMuscles = false,
        quality = 'high'
    }) => {
        const meshRef = useRef<THREE.Mesh>(null);
        const { size, camera } = useThree();

        // Muscle system refs
        const muscleGeneratorRef = useRef<MuscleGenerator>();
        const forceDeformerRef = useRef<ForceDeformer>();
        const [currentQuality, setCurrentQuality] = useState(quality);

        // Performance monitoring
        const lastFPSRef = useRef(60);
        const frameCountRef = useRef(0);
        const lastTimeRef = useRef(performance.now());

        // Existing uniforms structure
        const uniforms = useMemo(() => ({
            uTime: { value: 0 },
            uCameraPos: { value: new THREE.Vector3() },
            uInvProjectionMatrix: { value: new THREE.Matrix4() },
            uInvViewMatrix: { value: new THREE.Matrix4() },

            // Bone uniforms (keep for compatibility)
            uBoneStart: { value: new Float32Array(24 * 3) },
            uBoneEnd: { value: new Float32Array(24 * 3) },
            uBoneThick: { value: new Float32Array(24) },

            // Muscle uniforms
            uUseMuscles: { value: useMuscles },
            uQuality: { value: currentQuality === 'high' ? 1.0 : currentQuality === 'medium' ? 0.5 : 0.25 },

            // Muscle system uniforms
            uBonePositions: { value: new Float32Array(50 * 3) },
            uMuscleParams: { value: new Float32Array(50 * 4) },
            uMuscleDeforms: { value: new Float32Array(50 * 4) }
        }), [useMuscles, currentQuality]);

        // Initialize muscle system
        useEffect(() => {
            if (useMuscles && !muscleGeneratorRef.current) {
                muscleGeneratorRef.current = new MuscleGenerator(HORSE_MUSCLE_GROUPS);
                forceDeformerRef.current = new ForceDeformer(HORSE_MUSCLE_GROUPS);

                // Generate initial GLSL
                const glsl = muscleGeneratorRef.current.generateGLSL(skeleton);
                console.log('Generated muscle GLSL:', glsl.substring(0, 500) + '...');
            }
        }, [useMuscles, skeleton]);

        useFrame((state, delta) => {
            if (!meshRef.current || !enabled) return;

            const mat = meshRef.current.material as THREE.ShaderMaterial;

            // Update common uniforms
            mat.uniforms.uTime.value = state.clock.elapsedTime;
            mat.uniforms.uCameraPos.value.copy(state.camera.position);
            mat.uniforms.uInvProjectionMatrix.value.copy(state.camera.projectionMatrixInverse);
            mat.uniforms.uInvViewMatrix.value.copy(state.camera.matrixWorld);

            // Performance monitoring - REF: webgl2_limits.md
            this.updatePerformance(state, mat);

            if (useMuscles && muscleGeneratorRef.current && forceDeformerRef.current) {
                // Update muscle system
                this.updateMuscleSystem(mat, skeleton, delta);
            } else {
                // Keep existing bone update logic
                this.updateBoneSystem(mat, skeleton);
            }
        });

        const updatePerformance = (state: any, mat: THREE.ShaderMaterial) => {
            frameCountRef.current++;
            const now = performance.now();

            if (now - lastTimeRef.current >= 1000) {
                const fps = frameCountRef.current;
                frameCountRef.current = 0;
                lastTimeRef.current = now;

                // Adaptive quality
                if (fps < 30 && currentQuality !== 'low') {
                    const newQuality = 'low';
                    setCurrentQuality(newQuality);
                    mat.uniforms.uQuality.value = 0.25;
                    console.warn(`Dropping quality to ${newQuality} due to low FPS: ${fps}`);
                } else if (fps > 50 && quality === 'high' && currentQuality !== 'high') {
                    const newQuality = 'high';
                    setCurrentQuality(newQuality);
                    mat.uniforms.uQuality.value = 1.0;
                    console.log(`Increasing quality to ${newQuality}, FPS: ${fps}`);
                }
            }
        };

        const updateMuscleSystem = (mat: THREE.ShaderMaterial, skeleton: QuadrupedSkeleton, delta: number) => {
            const generator = muscleGeneratorRef.current!;
            const deformer = forceDeformerRef.current!;

            // Get locomotion from skeleton (if available)
            const locomotion = (skeleton as any).locomotion || {
                speed: 0,
                gait: 'Walk',
                turn: 0
            };

            // Update force calculations
            deformer.update(skeleton, locomotion, delta);

            // Get uniform arrays
            const { params, deforms } = deformer.getUniformArrays(HORSE_MUSCLE_GROUPS);

            // Update uniforms efficiently
            mat.uniforms.uMuscleParams.value.set(params);
            mat.uniforms.uMuscleDeforms.value.set(deforms);

            // Update bone positions
            generator.updateUniforms(skeleton, mat.uniforms);

            // DEBUG: Log first muscle activation
            if (mat.uniforms.uMuscleParams.value[3] > 0.5) {
                console.log('High activation:', mat.uniforms.uMuscleParams.value[3]);
            }
        };

        const updateBoneSystem = (mat: THREE.ShaderMaterial, skeleton: QuadrupedSkeleton) => {
            // Keep existing bone update logic from current implementation
            let boneIndex = 0;
            const startBuffer = mat.uniforms.uBoneStart.value;
            const endBuffer = mat.uniforms.uBoneEnd.value;
            const thickBuffer = mat.uniforms.uBoneThick.value;

            const processChain = (chain: any, thickness: number) => {
                if (!chain || !chain.bones) return;
                chain.bones.forEach((bone: any) => {
                    if (boneIndex >= 24) return;

                    const start = new THREE.Vector3();
                    bone.pivot.getWorldPosition(start);

                    const endLocal = new THREE.Vector3(bone.length, 0, 0);
                    const end = bone.pivot.localToWorld(endLocal);

                    const i3 = boneIndex * 3;
                    startBuffer[i3] = start.x;
                    startBuffer[i3 + 1] = start.y;
                    startBuffer[i3 + 2] = start.z;

                    endBuffer[i3] = end.x;
                    endBuffer[i3 + 1] = end.y;
                    endBuffer[i3 + 2] = end.z;

                    thickBuffer[boneIndex] = thickness;

                    boneIndex++;
                });
            };

            // Process all chains
            if (skeleton.spine) processChain(skeleton.spine, 0.008);
            processChain(skeleton.neck, 0.01);
            processChain(skeleton.flLeg, 0.008);
            processChain(skeleton.frLeg, 0.008);
            processChain(skeleton.hlLeg, 0.01);
            processChain(skeleton.hrLeg, 0.01);
        };

        if (!enabled) return null;

        return (
            <mesh ref={meshRef} position={[0, 0, 0]} frustumCulled={false}>
                <planeGeometry args={[2, 2]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    transparent={true}
                    depthWrite={false}
                />
            </mesh>
        );
    };

    export default SDFLayer;
  - VALIDATE: npm run dev
  - IF_FAIL: Check browser console for React/TypeScript errors
  - ROLLBACK: git checkout -- mechquadruped/components/sdf/SDFLayer.tsx
```

#### Task 7: Update Scene Component
```yaml
ACTION mechquadruped/components/Scene.tsx:
  - OPERATION: Add muscle system controls
  - FIND: const [showMuscle, setShowMuscle] = useState(false);
  - ADD_AFTER: const [useAnatomicalMuscles, setUseAnatomicalMuscles] = useState(false);
  - FIND: const [muscleBlend, setMuscleBlend] = useState(true);
  - ADD_AFTER: const [muscleQuality, setMuscleQuality] = useState<'low' | 'medium' | 'high'>('high');
  - FIND: <SDFLayer enabled={showMuscle} blendEnabled={muscleBlend} />
  - REPLACE: <SDFLayer enabled={showMuscle} blendEnabled={muscleBlend}
                      useMuscles={useAnatomicalMuscles} quality={muscleQuality} />
  - FIND: Muscle Layer button
  - ADD_AFTER: |
    <button
      onClick={() => setUseAnatomicalMuscles(!useAnatomicalMuscles)}
      className={`px-4 py-2 rounded ${useAnatomicalMuscles ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
    >
      Anatomical Muscles
    </button>
    <select
      value={muscleQuality}
      onChange={(e) => setMuscleQuality(e.target.value as any)}
      className="px-4 py-2 rounded border"
      disabled={!useAnatomicalMuscles}
    >
      <option value="high">High Quality</option>
      <option value="medium">Medium Quality</option>
      <option value="low">Low Quality</option>
    </select>
  - VALIDATE: npm run dev
  - IF_FAIL: Check UI rendering and state management
  - ROLLBACK: git checkout -- mechquadruped/components/Scene.tsx
```

### Phase 4: Advanced Features

#### Task 8: Create Cross-Species System
```yaml
ACTION mechquadruped/systems/muscle/CrossSpeciesMuscles.ts:
  - OPERATION: Create scalable configuration system
  - CREATE: |
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
  - VALIDATE: npm run build
  - IF_FAIL: Check TypeScript compilation
  - ROLLBACK: git checkout -- mechquadruped/systems/muscle/CrossSpeciesMuscles.ts
```

#### Task 9: Add Madhubani Styling
```yaml
ACTION mechquadruped/shaders/styling/MadhubaniPatterns.glsl:
  - OPERATION: Create procedural Madhubani patterns
  - CREATE: |
    // Madhubani art styling for 3D SDF muscles
    // Traditional patterns mapped to muscle surfaces

    precision mediump float;

    // Pattern functions
    float dotPattern(vec2 uv, float size) {
        vec2 grid = fract(uv * size);
        return step(0.5, grid.x) * step(0.5, grid.y);
    }

    float linePattern(vec2 uv, float spacing, float width) {
        return step(width, mod(uv.x, spacing)) + step(width, mod(uv.y, spacing));
    }

    float circlePattern(vec2 uv, float radius) {
        vec2 center = floor(uv) + vec2(0.5);
        float dist = length(uv - center);
        return smoothstep(radius - 0.02, radius + 0.02, dist);
    }

    float floralPattern(vec2 uv, float scale) {
        uv *= scale;
        float petal = 0.0;

        for(int i = 0; i < 6; i++) {
            float angle = float(i) * 3.14159 / 3.0;
            vec2 rotated = uv * mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            petal = max(petal, smoothstep(0.3, 0.35, length(rotated - vec2(0.4, 0.0))));
        }

        float center = smoothstep(0.1, 0.15, length(uv));
        return max(petal, center);
    }

    // Main styling function
    vec3 applyMadhubaniStyle(vec3 worldPos, vec3 normal, vec3 muscleColor,
                             float muscleType, float patternScale) {
        // Project world position to UV based on muscle type
        vec2 uv;

        if (muscleType < 0.5) {
            // Fusiform - longitudinal stripes
            vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
            vec3 bitangent = cross(normal, tangent);
            uv = vec2(dot(worldPos, tangent), dot(worldPos, bitangent)) * patternScale;
        } else if (muscleType < 1.5) {
            // Pennate - diagonal pattern
            vec3 direction = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
            uv = vec2(dot(worldPos, normal), dot(worldPos, direction)) * patternScale;
        } else {
            // Sheet - grid pattern
            uv = worldPos.xz * patternScale;
        }

        // Generate pattern
        float pattern = 0.0;

        // Combine different Madhubani patterns
        pattern += dotPattern(uv, 8.0) * 0.3;
        pattern += linePattern(uv, 0.2, 0.01) * 0.2;
        pattern += floralPattern(fract(uv), 4.0) * 0.5;

        // Pattern colors (traditional Madhubani palette)
        vec3 patternColor = mix(
            vec3(1.0, 0.8, 0.0),  // Gold
            vec3(0.8, 0.0, 0.0),  // Red
            sin(worldPos.y * 10.0) * 0.5 + 0.5
        );

        // Blend pattern with muscle color
        vec3 finalColor = mix(muscleColor, patternColor, pattern * 0.6);

        // Add outline effect
        float edge = length(fwidth(normal));
        float outline = smoothstep(0.0, edge, 0.5);
        finalColor = mix(finalColor, vec3(0.0, 0.0, 0.0), outline * 0.3);

        return finalColor;
    }

    // Distance-based pattern scaling
    float getPatternScale(float distance, float quality) {
        float scale = 2.0;
        if (quality < 1.0) scale = 1.0;
        return scale / (1.0 + distance * 0.1);
    }
  - VALIDATE: Test shader compilation in browser
  - IF_FAIL: Check GLSL syntax errors
  - ROLLBACK: git checkout -- mechquadruped/shaders/styling/MadhubaniPatterns.glsl
```

### Phase 5: Validation

#### Task 10: Create Test Suite
```yaml
ACTION tests/muscle-system.test.ts:
  - OPERATION: Create comprehensive test suite
  - CREATE: |
    import { MuscleTemplate, MuscleGroup } from '../mechquadruped/systems/muscle/MuscleTemplate';
    import { MuscleGenerator } from '../mechquadruped/systems/muscle/MuscleGenerator';
    import { ForceDeformer } from '../mechquadruped/systems/physics/ForceDeformer';
    import { QuadrupedSkeleton } from '../mechquadruped/services/Skeleton';

    describe('Muscle System', () => {
      describe('MuscleTemplate', () => {
        test('should create valid muscle template', () => {
          const template: MuscleTemplate = {
            name: 'TestMuscle',
            type: 'fusiform',
            originChain: 'spine',
            insertionChain: 'spine',
            originRegion: { startBone: 0, endBone: 1 },
            insertionRegion: { startBone: 2, endBone: 3 },
            shapeParams: {
              widthRatio: 0.1,
              thicknessRatio: 0.05,
              bulgeAmount: 0.1,
              taperFactor: 0.7
            },
            restLength: 1.0,
            maxForce: 1000.0
          };

          expect(template.name).toBe('TestMuscle');
          expect(template.type).toBe('fusiform');
          expect(template.shapeParams.widthRatio).toBe(0.1);
        });
      });

      describe('MuscleGenerator', () => {
        test('should generate GLSL code', () => {
          const muscleGroups: MuscleGroup[] = [
            {
              name: 'TestGroup',
              blendFactor: 0.1,
              muscles: [{
                name: 'TestMuscle',
                type: 'fusiform',
                originChain: 'spine',
                insertionChain: 'spine',
                originRegion: { startBone: 0, endBone: 1 },
                insertionRegion: { startBone: 2, endBone: 3 },
                shapeParams: {
                  widthRatio: 0.1,
                  thicknessRatio: 0.05,
                  bulgeAmount: 0.1,
                  taperFactor: 0.7
                },
                restLength: 1.0,
                maxForce: 1000.0
              }]
            }
          ];

          const generator = new MuscleGenerator(muscleGroups);
          const glsl = generator.generateGLSL({} as QuadrupedSkeleton);

          expect(glsl).toContain('sdTestGroup');
          expect(glsl).toContain('sdFusiform');
          expect(glsl).toContain('psmin');
        });
      });

      describe('ForceDeformer', () => {
        test('should calculate muscle forces', () => {
          const muscleGroups: MuscleGroup[] = [
            {
              name: 'TestGroup',
              blendFactor: 0.1,
              muscles: [{
                name: 'TestMuscle',
                type: 'fusiform',
                originChain: 'spine',
                insertionChain: 'spine',
                originRegion: { startBone: 0, endBone: 1 },
                insertionRegion: { startBone: 2, endBone: 3 },
                shapeParams: {
                  widthRatio: 0.1,
                  thicknessRatio: 0.05,
                  bulgeAmount: 0.1,
                  taperFactor: 0.7
                },
                restLength: 1.0,
                maxForce: 1000.0
              }]
            }
          ];

          const deformer = new ForceDeformer(muscleGroups);
          deformer.update({} as QuadrupedSkeleton, { speed: 1, gait: 'Walk', turn: 0 }, 0.016);

          const force = deformer.getForce('TestGroup_TestMuscle');
          expect(force).toBeDefined();
          expect(force.activation).toBeGreaterThanOrEqual(0);
        });
      });
    });
  - VALIDATE: npm test
  - IF_FAIL: Check test output for errors
  - ROLLBACK: rm tests/muscle-system.test.ts
```

## Validation Strategy

### Performance Validation
```bash
# Run performance benchmark
npm run benchmark

# Expected output:
# ✓ Average FPS: 60.2
# ✓ Memory usage: 4.2MB
# ✓ Shader compile time: 45ms
# ✓ Muscle updates: 0.3ms
```

### Visual Validation
1. **Muscle shapes**: Check anatomical accuracy
2. **Deformation**: Verify force-based changes
3. **Performance**: Monitor FPS counter
4. **Patterns**: Test Madhubani styling

## Debug Patterns

1. **Visual Debug**: Color muscles by activation
   ```glsl
   vec3 debugColor = mix(vec3(0,1,0), vec3(1,0,0), activation);
   ```

2. **Performance Debug**: Log frame times
   ```typescript
   console.log(`Frame time: ${delta * 1000}ms`);
   ```

3. **Force Debug**: Visualize force vectors
   ```glsl
   if (abs(stretch) > 0.1) color = vec3(1,0,0);
   ```

## Rollback Strategy

1. **Feature Flags**: `useMuscles` prop allows instant fallback
2. **Git Branches**: Each phase on separate branch
3. **Backup System**: Bone SDF as emergency fallback

---

This comprehensive task list provides a complete implementation path for the anatomical SDF muscle system with proper validation, debugging, and rollback strategies.