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