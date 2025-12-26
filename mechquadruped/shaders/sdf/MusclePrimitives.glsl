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