# WebGL2 Performance Limits & Constraints

## Shader Instruction Limits

### Minimum Requirements (WebGL2 Spec)
- Fragment shader: 1,024 execution instructions
- Vertex shader: 1,024 execution instructions
- Varying variables: 16 vec4 (64 floats)

### Real-world Hardware Limits (2025)

#### Desktop GPUs
- **Integrated Intel**: 64,000 - 256,000 instructions
- **NVIDIA GTX/RTX**: 256,000 - 2,048,000+ instructions
- **AMD Radeon**: 128,000 - 1,024,000 instructions

#### Mobile GPUs
- **Apple A-series**: 128,000 - 512,000 instructions
- **Qualcomm Adreno**: 32,000 - 256,000 instructions
- **ARM Mali**: 64,000 - 256,000 instructions

### Performance Impact
- **50 instructions**: Excellent performance, all devices
- **100 instructions**: Good performance, mid-range+
- **200 instructions**: May struggle on mobile
- **500+ instructions**: Desktop only

## Uniform Limits

### WebGL2 Minimum
- Vertex shader uniforms: 256 vec4 components
- Fragment shader uniforms: 224 vec4 components
- Combined: 512 vec4 components

### Typical Implementation
- Use uniform buffers for large arrays
- Texture data for >16 values
- Structured layout for organization

## Texture Constraints

### Maximum Texture Size
- Minimum: 2048×2048 pixels
- Typical: 4096×4096 pixels
- High-end: 8192×8192+ pixels

### Format Support
- Always available: RGBA8, RGB8, RG8, R8
- Float textures: RGBA32F, RGBA16F (check `OES_texture_float`)
- Half-float: RGBA16F (check `OES_texture_half_float`)

## Best Practices for Muscle System

### Instruction Budgeting
```glsl
// Budget allocation (target: ~100 instructions)
float sdFusiform(...)      // ~15 instructions
float sdPennate(...)       // ~20 instructions
float sdSheet(...)         // ~15 instructions
float map(...)             // ~10 instructions (loop)
float normal(...)          // ~5 instructions
float lighting(...)        // ~10 instructions
// Total: ~75 instructions + margin
```

### Uniform Optimization
```glsl
// GOOD: Structured uniforms
uniform MuscleData {
    vec4 positions[50];    // 50 muscles
    vec4 parameters[50];   // width, thickness, activation, deformation
};

// AVOID: Too many individual uniforms
uniform float muscleWidth1;
uniform float muscleWidth2; // ... inefficient for many muscles
```

### Performance Strategies

#### 1. Adaptive Quality
```glsl
// Early exit for distant muscles
if (distance > qualityThreshold) {
    return sdSphere(p, radius); // Simple approximation
}
```

#### 2. Branch Optimization
```glsl
// GOOD: Minimize dynamic branches
float sdf = muscleType == FUSIFORM ? sdFusiform(...) :
           muscleType == PENNATE ? sdPennate(...) : sdSheet(...);

// AVOID: Complex conditional logic in loops
for (int i = 0; i < MAX_MUSCLES; i++) {
    if (muscles[i].active && muscles[i].distance < threshold) {
        // Expensive branch prediction issues
    }
}
```

#### 3. Precision Optimization
```glsl
// Use mediump for non-critical calculations
mediump float deformStrength = 0.5;
highp float distance = length(position); // Keep precision for distance

// Avoid expensive functions where possible
// BAD: pow(x, 2.0) -> use x*x
// BAD: exp(log(x)) -> use x directly
```

## Mobile-Specific Considerations

### Memory Bandwidth
- Limit: ~10-20 GB/s on mobile vs 100+ GB/s desktop
- Strategy: Minimize texture sampling, use packed formats

### Thermal Throttling
- Sustained GPU load reduces performance
- Strategy: Adaptive frame rate, quality settings

### Power Management
- Complex shaders drain battery quickly
- Strategy: LOD system, user-selectable quality

## Debugging Tools

### Browser Console
```javascript
// Check shader compilation info
const gl = renderer.getContext();
const program = renderer.properties(material).program;
const info = gl.getProgramInfoLog(program);
console.log('Shader info:', info);

// Check uniform locations
const uniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
console.log('Active uniforms:', uniforms);
```

### Performance Monitoring
```javascript
// Frame time tracking
const frameTime = () => {
    const start = performance.now();
    render();
    const end = performance.now();
    return end - start;
};

// GPU memory usage
if (renderer.info.memory) {
    console.log('GPU memory:', renderer.info.memory.textures);
}
```

## Testing Strategy

### Device Matrix
- Test on: Low-end mobile, Mid-range mobile, High-end mobile, Integrated desktop, Discrete desktop
- Target: Maintain 30fps on mobile, 60fps on desktop

### Stress Tests
```javascript
// Progressive muscle count test
for (let muscles = 10; muscles <= 100; muscles += 10) {
    testPerformance(muscles);
}

// Complexity test
testShaderComplexity([
    { complexity: 'simple', targetFps: 60 },
    { complexity: 'medium', targetFps: 45 },
    { complexity: 'complex', targetFps: 30 }
]);
```

## References

- [WebGL2 Specification](https://www.khronos.org/registry/webgl/specs/latest/2.0/)
- [OpenGL ES 3.0 Reference](https://www.khronos.org/registry/OpenGL/specs/es/3.0/es_spec_3.0.pdf)
- [Mobile GPU Performance Guide](https://developer.arm.com/documentation)