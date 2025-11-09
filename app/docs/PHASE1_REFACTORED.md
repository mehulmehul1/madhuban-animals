# Phase 1 Refactored: Scalable Muscle Foundation

**Version 2.0 — Force-Behavioral Auto-Generation**

Instead of hardcoding muscles, Phase 1 now establishes the infrastructure for **skeleton-based auto-generation**.

---

## Phase 1 Revised: 5 Implementation Stories

### Story 1.1: Define Muscle Shape Types ✓ TODO
**File:** `systems/muscle-shape-types.js`

**Deliverable:** 7 shape type definitions with deformation rules.

Each shape type specifies:
- **id** — Unique identifier
- **name** — Display name
- **deformationRules** — How it responds to force (bulge, thin, twist)
- **widthRange** — [stretchWidth, restWidth, compressWidth]
- **twistSensitivity** — Multiplier for twist response

```javascript
const MUSCLE_SHAPE_TYPES = {
  extending_limb_muscle: {
    id: 'extending_limb_muscle',
    name: 'Extending Limb Muscle',
    deformationRules: {
      stretch: { widthMultiplier: 0.7, thinFactor: 0.8, addStriations: true },
      compress: { widthMultiplier: 1.2, bulgeFactor: 1.3, roundness: 0.6 },
      twist: { sensitivity: 0.8, offsetFactor: 0.4 }
    },
    widthRange: { stretch: 0.7, rest: 1.0, compress: 1.2 },
    twistSensitivity: 0.8
  },
  
  compression_mass: {
    id: 'compression_mass',
    name: 'Compression Mass',
    deformationRules: {
      stretch: { widthMultiplier: 0.85, thinFactor: 0.9, addStriations: false },
      compress: { widthMultiplier: 1.4, bulgeFactor: 1.5, roundness: 0.8 },
      twist: { sensitivity: 0.5, offsetFactor: 0.2 }
    },
    widthRange: { stretch: 0.85, rest: 1.0, compress: 1.4 },
    twistSensitivity: 0.5
  },
  
  // ... 5 more types
}
```

**Acceptance Criteria:**
- ✓ All 7 types defined with complete deformation rules
- ✓ Width ranges make sense (stretch < rest < compress)
- ✓ Twist sensitivity values in range 0.3-1.4
- ✓ JSDoc documented

**Time:** 1.5 hours

---

### Story 1.2: Define Locomotion Type Mappings ✓ TODO
**File:** `systems/muscle-mappings.js`

**Deliverable:** Region→shape type assignments per locomotion type.

```javascript
const MUSCLE_MAPPINGS = {
  erect_quadruped: {
    front_left_limb: {
      shapeType: 'extending_limb_muscle',
      baseWidth: 14,
      sensitivity: 1.2
    },
    hind_left_limb: {
      shapeType: 'extending_limb_muscle',
      baseWidth: 16,
      sensitivity: 1.3
    },
    hind_left_compression: {
      shapeType: 'compression_mass',
      baseWidth: 18,
      sensitivity: 1.0,
      attachmentPattern: 'spine_to_femur' // Special: not sequential bones
    },
    spine: {
      shapeType: 'rotation_joint',
      baseWidth: 20,
      sensitivity: 0.8
    },
    tail: {
      shapeType: 'balance_tail',
      baseWidth: 16,
      sensitivity: 1.2
    }
  },
  
  sprawling_quadruped: {
    front_left_limb: {
      shapeType: 'extending_limb_muscle',
      baseWidth: 12,
      sensitivity: 1.1
    },
    spine: {
      shapeType: 'undulation_segment',
      baseWidth: 18,
      sensitivity: 1.3
    },
    tail: {
      shapeType: 'undulation_segment',
      baseWidth: 16,
      sensitivity: 1.4
    }
  },
  
  // ... more locomotion types
}
```

**Acceptance Criteria:**
- ✓ All 5 locomotion types defined (erect, sprawling, bipedal, serpentine, aquatic)
- ✓ Each type has all required body regions
- ✓ Base widths appropriate for creature size
- ✓ Sensitivities match shape type ranges

**Time:** 1 hour

---

### Story 1.3: Implement Muscle Auto-Generation Algorithm ✓ TODO
**File:** `systems/muscle-generator.js`

**Deliverable:** `generateMusclesTours(creature)` function that:
- Takes skeleton + locomotion type
- Identifies body regions in skeleton (front_left_limb, spine, etc.)
- Attaches shape types per mapping
- Generates muscle array

```javascript
function generateMusclesTours(creatureName, skeleton, locomotionType) {
  const mapping = MUSCLE_MAPPINGS[locomotionType];
  const muscles = [];
  
  for (const [regionName, regionConfig] of Object.entries(mapping)) {
    const regionBones = findBonesByRegion(skeleton, regionName);
    
    // Generate muscle for each bone pair in region
    for (let i = 0; i < regionBones.length - 1; i++) {
      const muscle = {
        id: `${creatureName}_${regionName}_${i}`,
        type: regionConfig.shapeType,
        startJoint: regionBones[i].id,
        endJoint: regionBones[i + 1].id,
        restLength: distance(regionBones[i].pos, regionBones[i + 1].pos),
        restAngle: angle(regionBones[i].pos, regionBones[i + 1].pos),
        width: regionConfig.baseWidth,
        sensitivity: regionConfig.sensitivity,
        group: regionName,
        shapeType: regionConfig.shapeType,
        deformationRules: MUSCLE_SHAPE_TYPES[regionConfig.shapeType].deformationRules
      };
      muscles.push(muscle);
    }
  }
  
  return muscles;
}
```

**Acceptance Criteria:**
- ✓ Generates correct muscle count per creature
- ✓ Muscle IDs are unique and consistent
- ✓ Rest length calculated from actual skeleton position
- ✓ Rest angle calculated from skeleton geometry
- ✓ Each muscle includes deformationRules from shape type
- ✓ Groups match region names

**Time:** 2 hours

---

### Story 1.4: Implement Bone Region Detection ✓ TODO
**File:** `systems/muscle-generator.js` (helper function)

**Deliverable:** `findBonesByRegion(skeleton, regionName)` function.

Maps region names to bone ID patterns:

```javascript
function findBonesByRegion(skeleton, regionName) {
  const patterns = {
    front_left_limb: /^frontLeft/,
    front_right_limb: /^frontRight/,
    hind_left_limb: /^hindLeft/,
    hind_right_limb: /^hindRight/,
    spine: /^spine\d+$/,
    tail: /^tail\d+$|^tail/,
    neck: /^neck/,
    body: /^body\d+$/
  };
  
  const pattern = patterns[regionName];
  if (!pattern) return [];
  
  return skeleton.bones
    .filter(bone => pattern.test(bone.id))
    .sort(boneCompareFn); // Ensure correct order
}

function boneCompareFn(a, b) {
  // Sort by spine0→1→2, not arbitrary order
  const aNum = parseInt(a.id.match(/\d+/)?.[0] ?? -1);
  const bNum = parseInt(b.id.match(/\d+/)?.[0] ?? -1);
  return aNum - bNum;
}
```

**Acceptance Criteria:**
- ✓ All region patterns defined (front_left, spine, tail, etc.)
- ✓ Bones returned in correct anatomical order
- ✓ Handles missing regions gracefully (returns empty array)
- ✓ Pattern matching works for all existing creatures

**Time:** 1 hour

---

### Story 1.5: Refactor anatomical-configs.js + Testing ✓ TODO
**File:** `app/systems/anatomical-configs.js` (modified)

**Deliverable:** 
- Remove hardcoded muscle_templates
- Add call to `generateMusclesTours()` on creature initialization
- Verify generated muscles match expected structure

**Refactoring:**

```javascript
// OLD (Phase 1 v1 — hardcoded):
const MUSCLE_TEMPLATES = {
  horse: {
    muscle_templates: [
      { id: 'frontLeftQuadriceps', name: 'Front Left Quadriceps', ... },
      // 10 more hardcoded muscles
    ]
  }
}

// NEW (Phase 1 v2 — auto-generated):
function initializeCreatureMusculature(creature) {
  const locomotionType = creature.anatomicalConfig.postureType;
  const muscles = generateMusclesTours(creature.name, creature.skeleton, locomotionType);
  return muscles;
}

// Usage in creature-builder.js:
const horse = createCreature('horse');
horse.muscles = initializeCreatureMusculature(horse);
```

**Acceptance Criteria:**
- ✓ Remove 21 hardcoded muscle definitions from anatomical-configs.js
- ✓ Auto-generation produces same muscle count as old approach
- ✓ Auto-generated muscles have same required fields
- ✓ Creature initialization calls generateMusclesTours()
- ✓ Test: Horse generates 17-19 muscles, Lizard generates 16
- ✓ Backward compatible: creature.muscles accessible same way

**Test File:** `app/tests/test_muscle_phase1_v2.html`

```html
<!-- Test: Auto-generation produces correct muscles -->
<test name="Horse auto-generates 17-19 muscles">
  const horse = ANATOMICAL_CONFIGS.horse;
  const skeleton = createHorseSkeletonMock();
  const muscles = generateMusclesTours('horse', skeleton, horse.postureType);
  assert(muscles.length >= 17 && muscles.length <= 19);
</test>

<test name="Generated muscles have shape types">
  const muscles = generateMusclesTours('horse', skeleton, 'erect_quadruped');
  assert(muscles.every(m => m.type && m.deformationRules));
</test>

<test name="Muscle shape types reference correct deformation rules">
  const muscles = generateMusclesTours('horse', skeleton, 'erect_quadruped');
  const extending = muscles.find(m => m.type === 'extending_limb_muscle');
  assert(extending.deformationRules.stretch.widthMultiplier === 0.7);
</test>
```

**Time:** 2 hours (includes testing)

---

## Phase 1 v2 Summary

### Old Phase 1 (Hardcoded Anatomical)
- ✗ 21 muscles hardcoded per creature
- ✗ Not scalable (new creature = 20+ line addition)
- ✗ Doesn't align with Mattesi principles
- ✓ Simple to understand
- ✓ Works (all tests pass)

### New Phase 1 (Auto-Generated Behavioral)
- ✓ 7 shape types define behavior
- ✓ Locomotion mappings define placement
- ✓ Auto-generation algorithm creates muscles
- ✓ Scalable (new creature = skeleton only)
- ✓ Aligns with Mattesi force principles
- ✓ Foundation for Phase 2 force analysis

---

## Files to Create/Modify

### Create (New)
1. `systems/muscle-shape-types.js` — 7 shape type definitions
2. `systems/muscle-mappings.js` — Locomotion type mappings
3. `systems/muscle-generator.js` — Auto-generation algorithm
4. `tests/test_muscle_phase1_v2.html` — Auto-generation tests

### Modify
1. `systems/anatomical-configs.js` — Remove hardcoded muscles
2. `creature-builder.js` — Call auto-generation on init

### Archive
1. Keep old phase 1 for reference (test_muscle_phase1.html)

---

## Implementation Order

1. **Story 1.1** → Define shape types (1.5h)
2. **Story 1.2** → Define mappings (1h)
3. **Story 1.3** → Auto-generation algorithm (2h)
4. **Story 1.4** → Bone region detection (1h)
5. **Story 1.5** → Refactor + test (2h)

**Total: 7.5 hours**

---

## Success Criteria for Phase 1 v2

✅ **S1:** All 7 shape types defined with deformation rules  
✅ **S2:** All 5 locomotion types have mappings  
✅ **S3:** Auto-generation produces muscles with shape types  
✅ **S4:** Generated muscles match old phase 1 in structure (but auto-created)  
✅ **S5:** Horse generates 17-19 muscles, Lizard generates 16  
✅ **S6:** Muscles include deformationRules from shape type  
✅ **S7:** No breaking changes to muscle data structure  

---

## Phase 2 Becomes Simpler

With Phase 1 now providing:
- Shape types with deformation rules
- Auto-generated muscles with types
- Mappings for all locomotion types

Phase 2 only needs to:
1. Implement force analyzer (calculate ratios/twist)
2. Apply deformation rules (shape-type-specific)
3. Generate geometry (2D shapes)
4. Render to screen

Much cleaner separation of concerns.

---

Ready to refactor Phase 1?
