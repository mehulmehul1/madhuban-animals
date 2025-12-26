
export const sdfCommon = `
precision highp float;

uniform float uTime;
uniform vec3 uCameraPos;
uniform mat4 uInvProjectionMatrix;
uniform mat4 uInvViewMatrix;

// Skeleton Uniforms
uniform vec3 uBoneStart[24];
uniform vec3 uBoneEnd[24];
uniform float uBoneThick[24];

// Muscle System Uniforms
uniform bool uUseMuscles;
uniform float uQuality;
uniform vec3 uBonePositions[50];
uniform vec4 uMuscleParams[50];
uniform vec4 uMuscleDeforms[50];
uniform bool uBlendEnabled;

varying vec2 vUv;

#define MAX_STEPS 16  // Minimal steps for performance - sphere only needs ~8-16
#define MAX_DIST 200.0
#define SURF_DIST 0.01  // Reduced from 0.5 - muscles are ~0.05-0.2 units thick

// Smooth Min
float smin(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0 - h);
}

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

// Capsule SDF
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

// Ellipsoid SDF
float sdEllipsoid(vec3 p, vec3 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / k1;
}

// Tapered Capsule (cylinder with different radii at ends)
float sdTaperedCapsule(vec3 p, vec3 a, vec3 b, float r1, float r2) {
    vec3 pa = p - a;
    vec3 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float r = mix(r1, r2, h);  // Interpolate radius
    return length(pa - ba * h) - r;
}
`;

// Helper to get bone positions (needed for legacy map)
export const legacyHelpers = `
// Helper to get bone positions
vec3 getBonePosition(int boneIndex) {
    return uBonePositions[boneIndex];
}

// Polynomial smooth minimum for natural muscle blending
float psmin(float a, float b, float k) {
    float h = clamp(k/(a-b), 0.0, 1.0);
    return mix(a, b, h) - h*(1.0-h)*k/(a-b);
}

// Fusiform muscle - spindle-shaped like biceps
float sdFusiform(vec3 p, vec3 a, vec3 b, float r1, float r2, float bulge) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);

    // Add bulge in middle of muscle (Hill model effect)
    float midBulge = sin(h * 3.14159) * bulge;
    float r = mix(r1, r2, h) + midBulge * min(r1, r2);

    return length(pa - ba * h) - r;
}
`;

export const legacyMap = `
// Scene SDF - Anatomical Horse
float map(vec3 p) {
    float d = MAX_DIST;

    if (uUseMuscles) {
        // DEBUG: Render test muscles at fixed positions
        vec3 testPos1 = vec3(0.0, 1.0, 0.0);
        vec3 testPos2 = vec3(0.5, 1.0, 0.0);
        float testMuscle = sdFusiform(p, testPos1, testPos2, 0.05, 0.03, 0.1);
        d = psmin(d, testMuscle, 0.05);

        // Render muscles if bone positions are available
        for(int i = 0; i < 10; i++) {
            // Skip check for activation to ensure visibility
            if(i >= 5) break; // Limit to 5 muscles for testing

            // Simple muscle representation between bone positions
            vec3 a = getBonePosition(i * 2);
            vec3 b = getBonePosition(i * 2 + 1);

            // Check if bone positions are valid (not zero)
            if(length(a) < 0.001 || length(b) < 0.001) continue;

            // Get muscle parameters
            float width = uMuscleParams[i].x;
            float thickness = uMuscleParams[i].y;
            float bulge = uMuscleParams[i].z;
            float activation = uMuscleParams[i].w;

            // Ensure minimum visibility
            if(thickness < 0.01) thickness = 0.02;
            if(activation < 0.1) activation = 0.5;

            // Scale by activation for visual feedback
            width *= (0.5 + activation);
            thickness *= (0.5 + activation);

            float muscleDist = sdFusiform(p, a, b, thickness, thickness * 0.7, bulge);

            d = psmin(d, muscleDist, 0.05);
        }
    } else {
        // Render bones with variable tapering based on bone index
        for(int i = 0; i < 24; i++) {
            if(uBoneThick[i] < 0.01) continue;

            // Determine taper based on bone type (approximate)
            float r1 = uBoneThick[i];  // Start radius
            float r2 = uBoneThick[i];  // End radius

            // Legs should taper (thicker at top, thinner at bottom)
            if(i >= 9) {
                r1 = uBoneThick[i] * 1.5;
                r2 = uBoneThick[i] * 0.6;
            }

            // Neck should taper slightly
            if(i >= 6 && i < 9) {
                r1 = uBoneThick[i] * 1.2;
                r2 = uBoneThick[i] * 0.8;
            }

            float boneDist = sdTaperedCapsule(p, uBoneStart[i], uBoneEnd[i], r1, r2);

            if (uBlendEnabled) {
                d = smin(d, boneDist, 0.03);  // Smooth blending
            } else {
                d = min(d, boneDist);         // Sharp union (hard form)
            }
        }
    }

    return d;
}
`;

export const sdfMain = `
void main() {
    // Convert UV to NDC (-1 to 1)
    vec2 ndc = vUv * 2.0 - 1.0;
    
    // Ray origin is camera position
    vec3 ro = uCameraPos;
    
    // Calculate ray direction from camera through this pixel
    vec4 clipSpace = vec4(ndc, -1.0, 1.0); // Near plane
    vec4 viewSpace = uInvProjectionMatrix * clipSpace;
    viewSpace.xyz /= viewSpace.w;
    vec4 worldSpace = uInvViewMatrix * vec4(viewSpace.xyz, 1.0);
    
    vec3 rd = normalize(worldSpace.xyz - ro);
    
    // Raymarching - start from camera
    float t = 0.01;
    bool hit = false;
    
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        
        if(d < SURF_DIST) {
            hit = true;
            break;
        }
        
        if(t > MAX_DIST) break;
        t += d;
    }
    
    if(hit) {
        // Calculate Normal
        vec3 p = ro + rd * t;
        vec2 e = vec2(0.01, 0.0);
        vec3 n = normalize(vec3(
            map(p + e.xyy) - map(p - e.xyy),
            map(p + e.yxy) - map(p - e.yxy),
            map(p + e.yyx) - map(p - e.yyx)
        ));

        // Simple lighting
        vec3 light = normalize(vec3(1.0, 2.0, 3.0));
        float diff = max(dot(n, light), 0.3);

        // Color based on mode
        vec3 color;

        // Check if hit the reference sphere
        if (length(p - vec3(0.0, 1.0, 0.0)) < 0.1) {
            color = vec3(1.0, 0.0, 0.0) * diff; // RED - Debug sphere
        } else if (uUseMuscles) {
            // Muscular red-orange with warm lighting
            color = vec3(0.85, 0.35, 0.25) * diff;
            // Add subtle subsurface scattering glow
            color += vec3(0.1, 0.05, 0.05);
        } else {
            // Legacy bones - golden
            color = vec3(1.0, 0.8, 0.0) * diff;
        }

        gl_FragColor = vec4(color, 1.0);
    } else {
        // DEBUG: Red border at edges to check coverage
        float borderWidth = 0.02;
        if (vUv.x < borderWidth || vUv.x > 1.0 - borderWidth || 
            vUv.y < borderWidth || vUv.y > 1.0 - borderWidth) {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red border
        } else {
            discard; // Transparent background
        }
    }
}
`;

// Assemble the default shader
export const fragmentShader = sdfCommon + legacyHelpers + legacyMap + sdfMain;

export const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0); // Fullscreen quad in NDC
}
`;
