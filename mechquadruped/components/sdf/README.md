# SDF Muscle Layer Implementation

## Overview

Volumetric muscle rendering system using Signed Distance Fields (SDFs) and GPU raymarching to create a 3D "muscle layer" that wraps around the procedural skeleton.

## Current Status ✅

### What Works
- ✅ **Screen-space raymarching** - Fullscreen shader that follows camera
- ✅ **Skeleton data bridging** - Bone positions/orientations extracted from `QuadrupedSkeleton`
- ✅ **Real-time animation** - SDF updates every frame with locomotion
- ✅ **Basic capsule rendering** - Bones rendered as 3D capsules with smooth blending
- ✅ **Toggle functionality** - Can enable/disable muscle layer via UI
- ✅ **Lighting** - Simple diffuse shading with normals

## Architecture

### Files
```
components/sdf/
├── SDFLayer.tsx          # React component, data bridging
├── HorseSDFShader.ts     # GLSL vertex + fragment shaders
└── README.md             # This file
```

### Data Flow
```
QuadrupedSkeleton → SDFLayer.useFrame() → Float32Array uniforms → GPU → Shader
     (bones)           (extract positions)      (24 bones x 3)      (raymarch SDF)
```

### How It Works

1. **SDFLayer Component**
   - Renders fullscreen quad in NDC coordinates
   - Extracts bone world positions every frame
   - Passes data to shader as flat `Float32Array` buffers

2. **Vertex Shader**
   - Outputs fullscreen quad: `gl_Position = vec4(position.xy, 0.0, 1.0)`
   - Passes UV coordinates to fragment shader

3. **Fragment Shader**
   - Converts screen UV → world ray using camera matrices
   - Raymarches along ray, querying SDF at each step
   - SDF function: smooth blend of 24 bone capsules
   - Renders hit points with diffuse lighting

## Known Issues 🔧

### 1. **Alignment Offset**
- SDF capsules slightly offset from skeleton bones
- **Likely cause**: Coordinate space mismatch or bone pivot extraction error
- **Next step**: Debug bone `getWorldPosition()` vs actual bone mesh positions

### 2. **Crude Sphere Appearance**
- Currently renders as disconnected yellow spheres, not organic muscle form
- **Cause**: Capsule blending (`smin k=0.05`) too sharp, thickness values uniform
- **Improvements needed**:
  - Variable thickness along bone length
  - Additional SDF primitives (ellipsoids for joints, torso)
  - Better blending between muscle groups

### 3. **Missing Anatomical Detail**
- Lacks realistic muscle volume distribution
- No differentiation between muscle groups
- **Next**: Reference actual horse anatomy for volume placement

## Technical Details

### SDF Functions
```glsl
sdCapsule(p, a, b, r)  // Bone segments
smin(d1, d2, k)        // Smooth blending
```

### Uniforms (per frame)
- `uBoneStart[24]`: vec3 start positions (Float32Array, 72 floats)
- `uBoneEnd[24]`: vec3 end positions (Float32Array, 72 floats)
- `uBoneThick[24]`: float radii (Float32Array, 24 floats)
- `uCameraPos`: vec3 camera position
- `uInvProjectionMatrix`: mat4 for screen→world
- `uInvViewMatrix`: mat4 for view→world

### Current Thickness Values
```typescript
Spine: 0.015  // 1.5cm radius
Neck:  0.01   // 1cm
Legs:  0.008-0.01  // 0.8-1cm
```

## Next Steps

### Short-term (Refinement)
1. **Fix alignment**
   - Debug bone position extraction
   - Verify coordinate spaces match
   - Add visual debug aids (render bone start/end as spheres)

2. **Improve blending**
   - Increase `smin` k-value for smoother transitions
   - Add per-bone blend factors
   - Experiment with different SDF combinations

### Medium-term (Anatomy)
1. **Add muscle volumes**
   - Torso: Large ellipsoid for ribcage/belly
   - Shoulders/hips: Spheres at joints
   - Thighs: Tapered capsules (thicker at top)

2. **Madhubani styling**
   - Add procedural patterns (stripes, dots)
   - Color variation by muscle group
   - Outline/cel-shading effect

### Long-term (Polish)
1. **Performance optimization**
   - Reduce raymarch steps with distance field optimization
   - LOD system (simpler SDF when far away)
   - Shader compilation variants

2. **Art direction**
   - Consult reference material
   - Iterate on visual style
   - Add subtle animation (breathing, muscle flexing)

## Debugging Tips

### Enable visual debugging:
```typescript
// In HorseSDFShader.ts, replace `map()` with:
d = min(d, length(p - uBoneStart[0]) - 0.05); // Show bone 0 start
```

### Check bone data in console:
```typescript
// In SDFLayer.tsx, uncomment:
console.log("Bone[0]:", startBuffer[0], startBuffer[1], startBuffer[2]);
```

### Reduce complexity:
- Test with single bone: `if(i != 0) continue;`
- Use simple sphere instead of capsule: `d = length(p - uBoneStart[i]) - uBoneThick[i];`

## Resources

- [Inigo Quilez SDF Functions](https://iquilezles.org/articles/distfunctions/)
- [Raymarching Tutorial](https://www.shadertoy.com/view/4dSfRc)
- [Smooth Min](https://iquilezles.org/articles/smin/)

## Troubleshooting

**Q: SDF doesn't appear at all**
- Check `enabled` prop is true
- Verify shader compiles (check console)
- Check bone data is being sent (add console.log)

**Q: Massive scale / wrong position**
- Verify thickness values are small (< 0.1)
- Check camera position updates correctly
- Ensure `frustumCulled={false}` is set

**Q: Jittery / flickering**
- Reduce raymarch steps (`MAX_STEPS`)
- Increase surface threshold (`SURF_DIST`)
- Check for NaN in bone data
