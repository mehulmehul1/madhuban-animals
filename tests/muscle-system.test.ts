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