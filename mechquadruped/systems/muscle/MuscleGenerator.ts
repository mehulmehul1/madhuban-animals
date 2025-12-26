import { MuscleGroup, MuscleTemplate } from './MuscleTemplate';
import { QuadrupedSkeleton } from '../../services/Skeleton';
import * as THREE from 'three';

export class MuscleGenerator {
  private muscles: MuscleGroup[] = [];
  private boneMap: Map<string, { offset: number; count: number }> = new Map();
  private shaderCache: Map<string, string> = new Map();
  private shaderVersion: number = 0;  // Increment to bust cache

  // O(1) muscle lookup by key (groupName_muscleName)
  private muscleKeyMap: Map<string, { muscle: MuscleTemplate; group: MuscleGroup; index: number }> = new Map();

  // DIRECT INJECTION of primitives to avoid import issues
  private musclePrimitives = `
// Anatomical SDF primitives for muscle rendering
// Based on Inigo Quilez SDF functions with anatomical modifications

precision mediump float;

// Polynomial smooth minimum for natural muscle blending
float psmin(float a, float b, float k) {
    float h = clamp(k/(a-b), 0.0, 1.0);
    return mix(a, b, h) - h*(1.0-h)*k/(a-b);
}

// Fusiform muscle - spindle-shaped like biceps
float sdFusiform(vec3 p, vec3 a, vec3 b, float r1, float r2, float bulge) {
    vec3 pa = p - a, ba = b - a;
    float ba2 = dot(ba, ba);
    float h = clamp(dot(pa, ba) / max(ba2, 0.0001), 0.0, 1.0);
    // Add bulge in middle of muscle (Hill model effect)
    float midBulge = sin(h * 3.14159) * bulge;
    float r = mix(r1, r2, h) + midBulge * min(r1, r2);

    return length(pa - ba * h) - r;
}

// Pennate muscle - feather-like (adapted to use endpoints)
// width = rad, height = not used (calculated from len), angle = feather param
float sdPennate(vec3 p, vec3 a, vec3 b, float width, float thickness, float angle) {
    vec3 pa = p - a;
    vec3 ba = b - a;
    float len = length(ba);
    vec3 dir = ba / max(0.001, len);
    
    float along = dot(pa, dir);
    float perp = length(pa - dir * along);
    
    // Taper effect
    float taper = pow(clamp(1.0 - along / max(0.001, len), 0.0, 1.0), 0.5 + angle); 
    return perp - width * taper;
}

// Sheet muscle (renamed from sdSheetMuscle)
float sdSheet(vec3 p, vec3 a, vec3 b, float width, float thickness, float wave) {
    vec3 dir = normalize(b - a);
    vec3 pa = p - a;
    float along = dot(pa, dir);
    
    // Width variation
    float w = width * (1.0 + wave * sin(along * 5.0)); 
    
    // Clamped projection
    vec3 closest = a + dir * clamp(along, 0.0, length(b-a));
    // Use width as the main radius for now to ensure visibility
    return length(p - closest) - w;
}

// ... (existing code)



// Complex muscle (simplified for compatibility)
// Formerly took arrays, now single segment with internal structure
float sdComplex(vec3 p, vec3 a, vec3 b, float width, float thickness, float blend) {
    // Treat as two blended fusiforms for now
    vec3 mid = mix(a, b, 0.5);
    float d1 = sdFusiform(p, a, mid, width, width*0.8, thickness);
    float d2 = sdFusiform(p, mid, b, width*0.8, width, thickness);
    return psmin(d1, d2, blend);
}

// Force deformation helpers
float applyMuscleDeformation(float sdf, float stretch, float compression,
                            float bulge, vec3 muscleDir) {
    // Volume preservation approximation
    float thicknessEffect = 1.0 / sqrt(max(0.1, 1.0 + compression));
    float bulgeEffect = bulge * (1.0 - stretch);

    return sdf * thicknessEffect - bulgeEffect * 0.1;
}
`;

  constructor(muscleConfig: MuscleGroup[]) {
    this.muscles = muscleConfig;
    // Build muscle key map for O(1) lookups
    this.buildMuscleKeyMap();
    // Force fresh cache on init
    this.invalidateCache();
  }

  // Call this to force complete cache flush
  forceRegenerate() {
    console.log("FORCE REGENERATE - Clearing all shader cache");
    this.shaderCache.clear();
    this.shaderVersion++;
  }

  private buildMuscleKeyMap(): void {
    let index = 0;
    for (const group of this.muscles) {
      for (const muscle of group.muscles) {
        const key = `${group.name}_${muscle.name}`;
        this.muscleKeyMap.set(key, { muscle, group, index });
        index++;
      }
    }
  }

  private buildBoneMap(skeleton: any): void {
    let offset = 0;
    const registerChain = (name: string, chain: any) => {
      if (!chain || !chain.bones) {
        console.warn(`Chain ${name} missing in skeleton!`);
        this.boneMap.set(name, { offset: 0, count: 0 }); // Safe fallback
        return;
      }
      const count = chain.bones.length;
      this.boneMap.set(name, { offset, count });
      console.log(`Mapped Chain ${name}: Offset ${offset}, Count ${count}`);
      offset += count;
    };

    // SEQUENCE MUST MATCH updateUniforms EXACTLY
    registerChain('spine', skeleton.spine);
    registerChain('neck', skeleton.neck);
    registerChain('head', skeleton.head);
    registerChain('tail', skeleton.tail);
    registerChain('shoulderGirdleL', skeleton.shoulderGirdleL);
    registerChain('shoulderGirdleR', skeleton.shoulderGirdleR);
    registerChain('pelvicGirdleL', skeleton.pelvicGirdleL);
    registerChain('pelvicGirdleR', skeleton.pelvicGirdleR);
    registerChain('flLeg', skeleton.flLeg);
    registerChain('frLeg', skeleton.frLeg);
    registerChain('hlLeg', skeleton.hlLeg);
    registerChain('hrLeg', skeleton.hrLeg);
  }

  generateGLSL(skeleton: QuadrupedSkeleton): string {
    // Rebuild map to ensure sync
    this.buildBoneMap(skeleton);

    const cacheKey = this.getCacheKey(skeleton);
    console.log("=== GENERATE GLSL === cacheKey:", cacheKey);

    if (this.shaderCache.has(cacheKey)) {
      console.log("CACHE HIT - returning cached shader");
      return this.shaderCache.get(cacheKey)!;
    }
    console.log("CACHE MISS - generating new shader");

    let glsl = this.getHeader();
    glsl += this.generateBoneFunctions();
    glsl += this.generateMuscleSDFs();
    glsl += this.generateMainSDF();

    console.log("=== FINAL SHADER LENGTH ===", glsl.length);
    console.log("=== MAP FUNCTION START ===");
    const mapStart = glsl.indexOf("float map(");
    console.log(glsl.substring(mapStart, mapStart + 800));
    console.log("=== MAP FUNCTION END ===");

    this.shaderCache.set(cacheKey, glsl);
    return glsl;
  }

  private getCacheKey(skeleton: QuadrupedSkeleton): string {
    // Include timestamp to bust cache on every generation request
    // This ensures we always get fresh shader code during development
    return `${skeleton.type}_${this.muscles.length}_v${this.shaderVersion}_${Date.now()}`;
  }

  private invalidateCache(): void {
    this.shaderVersion++;
    this.shaderCache.clear();
    console.log("Shader cache invalidated, new version:", this.shaderVersion);
  }

  private getHeader(): string {
    return `
    // Generated muscle SDF functions
    // REF: webgl2_limits.md - keep < 100 instructions per function
    
    // Inject Primitives
    ${this.musclePrimitives}

    // Uniforms provided by sdfCommon

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
      console.log("Generating SDF for group:", group.name, "with", group.muscles.length, "muscles");
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

  private getMuscleIndex(targetGroup: MuscleGroup, targetMuscle: MuscleTemplate): number {
    // O(1) lookup using the key map
    const key = `${targetGroup.name}_${targetMuscle.name}`;
    const entry = this.muscleKeyMap.get(key);
    return entry?.index ?? 0;
  }

  private generateMuscleSDF(muscle: MuscleTemplate, group: MuscleGroup): string {
    const originStart = this.getBoneIndex(muscle.originChain, muscle.originRegion.startBone);
    const originEnd = this.getBoneIndex(muscle.originChain, muscle.originRegion.endBone);
    const insertStart = this.getBoneIndex(muscle.insertionChain, muscle.insertionRegion.startBone);
    const insertEnd = this.getBoneIndex(muscle.insertionChain, muscle.insertionRegion.endBone);

    // DEBUG: Log muscle generation details
    console.log(`  📍 Muscle: ${muscle.name}`);
    console.log(`     Origin: ${muscle.originChain}[${muscle.originRegion.startBone}-${muscle.originRegion.endBone}] → boneIndex ${originStart}-${originEnd}`);
    console.log(`     Insert: ${muscle.insertionChain}[${muscle.insertionRegion.startBone}-${muscle.insertionRegion.endBone}] → boneIndex ${insertStart}-${insertEnd}`);

    // FIXED: Use originEnd and insertStart for muscle span
    // Add position validation in shader
    const width = 0.20;
    const thickness = 0.15;
    const bulge = 0.25;

    const sdfCode = `
  // ${muscle.name} (${originEnd} to ${insertStart})
  {
    vec3 originPos = uBonePositions[${originEnd}];
    vec3 insertPos = uBonePositions[${insertStart}];

    // Only render if both positions are valid (not zero)
    float originLen = length(originPos);
    float insertLen = length(insertPos);

    if (originLen > 0.01 && insertLen > 0.01) {
      float muscleDist = sdFusiform(
        p, originPos, insertPos,
        ${width.toFixed(3)},   // Width
        ${thickness.toFixed(3)}, // Thickness
        ${bulge.toFixed(3)}    // Bulge
      );
      d = psmin(d, muscleDist, ${group.blendFactor});
    }
  }`;
    return sdfCode;
  }

  private generateMainSDF(): string {
    console.log("generateMainSDF: muscles count =", this.muscles.length);

    // Generate all muscles directly inline - no separate group functions
    let inlineMuscles = '';
    for (const group of this.muscles) {
      for (const muscle of group.muscles) {
        const originEnd = this.getBoneIndex(muscle.originChain, muscle.originRegion.endBone);
        const insertStart = this.getBoneIndex(muscle.insertionChain, muscle.insertionRegion.startBone);
        const width = 0.18;
        const thickness = 0.12;
        const bulge = 0.2;

        inlineMuscles += `
  // ${muscle.name}: bone[${originEnd}] to bone[${insertStart}]
  {
    vec3 a = uBonePositions[${originEnd}];
    vec3 b = uBonePositions[${insertStart}];
    float m = sdFusiform(p, a, b, ${width.toFixed(2)}, ${thickness.toFixed(2)}, ${bulge.toFixed(2)});
    d = min(d, m);
  }
`;
      }
    }

    return `
// Bounding sphere for early exit
float sdBounds(vec3 p) {
  return length(p - vec3(0.0, 1.0, 0.0)) - 2.5;
}

// Main SDF - all muscles inline
float map(vec3 p) {
  float bounds = sdBounds(p);
  if(bounds > 1.0) return bounds;

  float d = 1000.0;

${inlineMuscles}

  return d;
}
`;
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

    // Extract all bone positions from skeleton in the same order as boneMap
    this.extractChainPositions(skeleton.spine, bonePos, boneIndex);
    boneIndex += skeleton.spine?.bones.length || 0;

    this.extractChainPositions(skeleton.neck, bonePos, boneIndex);
    boneIndex += skeleton.neck?.bones.length || 0;

    this.extractChainPositions(skeleton.head, bonePos, boneIndex);
    boneIndex += skeleton.head?.bones.length || 0;

    this.extractChainPositions(skeleton.tail, bonePos, boneIndex);
    boneIndex += skeleton.tail?.bones.length || 0;

    this.extractChainPositions(skeleton.shoulderGirdleL, bonePos, boneIndex);
    boneIndex += skeleton.shoulderGirdleL?.bones.length || 0;

    this.extractChainPositions(skeleton.shoulderGirdleR, bonePos, boneIndex);
    boneIndex += skeleton.shoulderGirdleR?.bones.length || 0;

    this.extractChainPositions(skeleton.pelvicGirdleL, bonePos, boneIndex);
    boneIndex += skeleton.pelvicGirdleL?.bones.length || 0;

    this.extractChainPositions(skeleton.pelvicGirdleR, bonePos, boneIndex);
    boneIndex += skeleton.pelvicGirdleR?.bones.length || 0;

    this.extractChainPositions(skeleton.flLeg, bonePos, boneIndex);
    boneIndex += skeleton.flLeg?.bones.length || 0;

    this.extractChainPositions(skeleton.frLeg, bonePos, boneIndex);
    boneIndex += skeleton.frLeg?.bones.length || 0;

    this.extractChainPositions(skeleton.hlLeg, bonePos, boneIndex);
    boneIndex += skeleton.hlLeg?.bones.length || 0;

    this.extractChainPositions(skeleton.hrLeg, bonePos, boneIndex);
    boneIndex += skeleton.hrLeg?.bones.length || 0;

    // DEBUG: Log bone positions to verify upload
    console.log("=== BONE POSITIONS DEBUG ===");
    console.log("Bone[0] (spine[0]):", bonePos[0], bonePos[1], bonePos[2]);
    console.log("Bone[5] (spine[5]):", bonePos[15], bonePos[16], bonePos[17]);
    console.log("Bone[8] (neck[1]):", bonePos[24], bonePos[25], bonePos[26]);
    console.log("Bone[11] (head[0]):", bonePos[33], bonePos[34], bonePos[35]);
    console.log("Bone[18] (shoulderL):", bonePos[54], bonePos[55], bonePos[56]);
    console.log("Bone[20] (pelvicL):", bonePos[60], bonePos[61], bonePos[62]);
    console.log("Bone[22] (flLeg[0]):", bonePos[66], bonePos[67], bonePos[68]);
    console.log("Bone[32] (hlLeg[0]):", bonePos[96], bonePos[97], bonePos[98]);
    console.log("==========================");
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