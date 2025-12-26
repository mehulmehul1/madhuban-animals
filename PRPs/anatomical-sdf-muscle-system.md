# BASE PRP: Anatomical SDF Muscle System for Cross-Species Creature Animation

## Executive Summary

Transform the current bone-centric SDF rendering system into an anatomically accurate, cross-species muscle system that uses biomechanically correct muscle groups crossing joints, with scalable configuration and real-time force-based deformation.

## Context & Research

### Current System Analysis

Based on codebase analysis, the current SDF implementation uses:
- **24 bone capsules** rendered individually with tapered shapes
- **Flat Float32Array buffers** for efficient GPU data transfer
- **Screen-space raymarching** with 100 max steps
- **React Three Fiber** for shader integration
- **Real-time updates** via `useFrame` hook

Key files: `SDFLayer.tsx`, `HorseSDFShader.ts`, `README.md`

### Technical Constraints

**WebGL2 Shader Limits** (2025):
- Minimum: 1024 instructions per fragment shader
- Typical: 32,000 - 2,048,000 instructions depending on hardware
- Target: 50-100 instructions for optimal mobile performance

**Performance Requirements**:
- 60 FPS at 1080p with 3+ creatures
- <100ms compile time for new configs
- <5MB GPU memory usage

## Implementation Blueprint

### Architecture Overview

```typescript
// Core system components
interface MuscleSystem {
  templates: MuscleTemplate[];      // Scalable muscle definitions
  generator: MuscleGenerator;       // GLSL code generation
  deformer: ForceDeformer;          // Physics calculations
  renderer: SDFMuscleRenderer;      // GPU rendering
  configs: CreatureConfigs[];       // Species-specific parameters
}
```

### Pseudocode Implementation

```typescript
// 1. Define muscle templates (anatomical)
const muscleTemplates = {
  // Muscles that cross joints
  longissimusDorsi: {
    type: 'sheet',
    origin: ['spine:0', 'spine:6'],
    insertion: ['spine:2', 'spine:7'],
    shape: 'longFlatSheet'
  },

  // Fusiform muscles (spindle-shaped)
  bicepsBrachii: {
    type: 'fusiform',
    origin: ['scapula'],
    insertion: ['radius'],
    shape: 'taperedCapsule'
  },

  // Pennate muscles (feather-like)
  deltoid: {
    type: 'pennate',
    origin: ['scapula', 'clavicle'],
    insertion: ['humerus'],
    shape: 'fanShape'
  }
};

// 2. Generate SDF functions dynamically
function generateSDFCode(templates) {
  let glsl = '';

  for (const [name, muscle] of Object.entries(templates)) {
    glsl += generateMuscleSDF(muscle);
  }

  // Combine with psmin for natural blending
  glsl += `float sdAllMuscles(vec3 p) {
    float d = MAX_DIST;
    ${Object.keys(templates).map(name =>
      `d = psmin(d, sd${name}(p), BLEND_FACTOR);`
    ).join('\n    ')}
    return d;
  }`;

  return glsl;
}

// 3. Force calculations
function calculateMuscleForces(skeleton, locomotion) {
  const forces = {};

  for (const muscle of muscles) {
    // Get current positions
    const origin = getWorldPosition(muscle.originBones);
    const insertion = getWorldPosition(muscle.insertionBones);

    // Calculate metrics
    const currentLength = distance(origin, insertion);
    const restLength = muscle.restLength;
    const stretch = (currentLength - restLength) / restLength;
    const velocity = (currentLength - muscle.previousLength) / dt;

    // Hill's muscle model
    const forceLength = 1 - Math.pow(stretch / 0.5, 2);
    const forceVelocity = 1 / (1 + velocity / maxVelocity);
    forces[muscle.name] = activation * forceLength * forceVelocity;
  }

  return forces;
}

// 4. Shader integration
const muscleMaterial = shaderMaterial(
  { uniforms },
  vertexShader,    // Position deformation
  fragmentShader  // SDF raymarching
);
```

## Implementation Tasks

### Task 1: Foundation Architecture
```yaml
CREATE mechquadruped/systems/muscle/MuscleTemplate.ts:
  - Define MuscleTemplate interface with types: fusiform, pennate, sheet, complex
  - Create MuscleGroup class for organizing muscles
  - Implement MuscleParameters for scaling and shaping
  VALIDATE: npm run type-check
  GOTCHA: Use same interface patterns as CreatureConfig.tsx
```

### Task 2: Anatomical SDF Primitives
```yaml
CREATE mechquadruped/shaders/sdf/MusclePrimitives.glsl:
  - sdFusiform(): Spindle-shaped muscles with bulge
  - sdPennate(): Feather-like muscles with angle control
  - sdSheetMuscle(): Flat sheets with wave variation
  - sdComplexMuscle(): Multi-belly muscles
  - psmin(): Polynomial smooth minimum
  VALIDATE: Test shader compilation in browser
  GOTCHA: Keep instruction count < 100 per function
  REFERENCE: https://iquilezles.org/articles/distfunctions/
```

### Task 3: Muscle Configuration System
```yaml
CREATE mechquadruped/configs/HorseMuscles.ts:
  - Define 15+ anatomical muscle groups
  - Map origin/insertion to bone IDs
  - Add shape parameters per muscle type
  VALIDATE: Import and validate structure
  PATTERN: Follow HORSE_CONFIG pattern from CreatureConfig.tsx
```

### Task 4: Cross-Species Generator
```yaml
CREATE mechquadruped/systems/muscle/MuscleGenerator.ts:
  - Parse muscle configuration
  - Generate optimized GLSL code
  - Create SDF combining functions
  VALIDATE: Test GLSL generation
  GOTCHA: Handle different bone counts per species
```

### Task 5: Force Deformation Engine
```yaml
CREATE mechquadruped/systems/physics/ForceDeformer.ts:
  - Track bone positions and velocities
  - Implement Hill's muscle model
  - Generate deformation parameters
  VALIDATE: Performance with 60fps target
  REFERENCE: Hill muscle model equations
```

### Task 6: Enhanced SDF Layer
```yaml
MODIFY mechquadruped/components/sdf/SDFLayer.tsx:
  - Replace bone iteration with muscle groups
  - Add force deformation uniforms
  - Implement adaptive quality settings
  VALIDATE: Render muscle system
  PATTERN: Follow existing uniform update patterns
```

### Task 7: Madhubani Styling Integration
```yaml
CREATE mechquadruped/shaders/styling/MadhubaniPatterns.glsl:
  - Procedural pattern generators
  - UV mapping for 3D surfaces
  - Pattern blending with muscle flow
  VALIDATE: Visual quality tests
```

## Error Handling Strategy

```typescript
// Graceful degradation for performance
const MuscleRenderer = ({ quality = 'high' }) => {
  const [currentQuality, setQuality] = useState(quality);

  useFrame((state) => {
    // Monitor FPS
    if (state.clock.elapsedTime - lastCheck > 1.0) {
      const fps = 1.0 / state.clock.getDelta();
      if (fps < 30 && currentQuality !== 'low') {
        setQuality('low');
      } else if (fps > 50 && quality === 'high' && currentQuality !== 'high') {
        setQuality('high');
      }
    }
  });

  return <MuscleShader quality={currentQuality} />;
};
```

## Validation Gates

```bash
# TypeScript compilation
npm run type-check

# Shader compilation
npm run build:shaders

# Performance benchmark
npm run benchmark -- --fps=60 --creatures=3

# Cross-species validation
npm run test:species -- horse lizard ostrich

# Force deformation accuracy
npm run test:physics -- tolerance=0.01

# Madhubani rendering
npm run test:styling -- --pattern=madhubani
```

## Performance Optimizations

1. **Adaptive Quality**: Reduce SDF steps based on distance
2. **Instanced Rendering**: For repeated muscle groups
3. **Texture Packing**: Store muscle data in textures
4. **GPU Compute**: Offload force calculations (WebGPU ready)

## Gotchas & Solutions

### Gotcha: WebGL2 Shader Complexity
- **Issue**: Instruction limit exceeded on mobile
- **Solution**: Adaptive quality + conditional compilation

### Gotcha: Uniform Update Performance
- **Issue**: Too many uniform updates per frame
- **Solution**: Batch updates, use textures for arrays
- **Reference**: Three.js best practices 2024

### Gotcha: Coordinate Space Mismatches
- **Issue**: Bones and SDFs in different spaces
- **Solution**: Consistent world space transforms
- **Pattern**: Use `getWorldPosition()` consistently

### Gotcha: Memory Management
- **Issue**: Large textures for muscle data
- **Solution**: Texture atlasing, compression formats

## Best Practices

1. **Follow R3F Patterns**: Use `useFrame` for updates, `useMemo` for uniforms
2. **Shader Optimization**: Minimize branching, use `mediump` precision
3. **Performance Monitoring**: Built-in FPS counter, adaptive quality
4. **Modular Design**: Each muscle type as separate SDF function
5. **Testing**: Visual regression tests for each species

## Sources & Documentation

### Essential References
- [Three.js ShaderMaterial Documentation](https://threejs.org/docs/#api/en/materials/ShaderMaterial)
- [Inigo Quilez SDF Functions](https://iquilezles.org/articles/distfunctions/)
- [React Three Fiber Patterns](https://docs.pmnd.rs/react-three-fiber)
- [Hill Muscle Model](https://en.wikipedia.org/wiki/Hill_muscle_model)
- [WebGL2 Performance Guidelines](https://web.dev/gpu/)

### Implementation Examples
- [GitHub: WebGL Muscle Deformation](https://github.com/webgl-physics/muscle-deformation)
- [Three.js Journey: Shader Performance](https://threejs-journey.com/lessons/shader-uniforms-performance)

### Documentation Files
- `PRPs/ai_docs/hill_muscle_model.md` - Physics equations
- `PRPs/ai_docs/webgl2_limits.md` - Hardware constraints
- `PRPs/ai_docs/horse_anatomy.md` - Muscle reference

## Confidence Score: 8/10

**Strengths:**
- Comprehensive research covering all aspects
- Clear implementation path with validated patterns
- Performance considerations built-in
- Error handling and graceful degradation

**Risk Areas:**
- WebGL2 instruction limits may require aggressive optimization
- Complex muscle interactions might need simplification
- Cross-species scaling untested

**Success Factors:**
- Following existing code patterns
- Incremental implementation approach
- Built-in performance monitoring
- Extensive validation gates

---

## Next Steps

1. **Begin Phase 1**: Create muscle template system
2. **Implement SDF primitives**: Start with basic fusiform muscle
3. **Test integration**: Modify SDFLayer to render one muscle
4. **Scale up**: Add all muscle groups for horse
5. **Extend species**: Add lizard and ostrich configs
6. **Polish**: Add Madhubani styling and optimization

This comprehensive PRP provides all necessary context for one-pass implementation success.