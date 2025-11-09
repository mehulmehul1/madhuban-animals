# Phase 1 v2 Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREATURE INITIALIZATION                       │
│  ModularCreatureBuilder.createCreature(type, locomotionType)    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │   BUILD SKELETON                 │
        │  (bone template system)          │
        │                                  │
        │  Returns: Skeleton {             │
        │    bones: [...]                  │
        │  }                               │
        └──────────────┬───────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │  AUTO-GENERATE MUSCLES            │  ◄── PHASE 1 v2
        │  generateMusclesTours(            │
        │    creatureName,                  │
        │    skeleton,                      │
        │    locomotionType                 │
        │  )                                │
        │                                  │
        │  Returns: Muscles []              │
        └──────────────┬───────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │   USE MUSCLES IN ANIMATION        │
        │  (Phase 2 Force Analysis)         │
        │  (Phase 3 Rendering)              │
        └──────────────────────────────────┘
```

---

## Core Module Relationships

```
MUSCLE_SHAPE_TYPES.js
├─ 7 behavioral types
├─ Each with deformationRules
└─ Defines WHAT muscles can do

         ▲
         │ references
         │

MUSCLE_MAPPINGS.js
├─ 5 locomotion types
├─ Each with regions → shape types
└─ Defines WHICH shape type goes WHERE

         ▲
         │ uses
         │

MUSCLE_GENERATOR.js
├─ Main: generateMusclesTours()
├─ Helper: findBonesByRegion()
└─ Outputs: muscles[] with ALL properties filled in
   ├─ skeletal attachment (start/end joint)
   ├─ rest state (length, angle)
   ├─ visual properties (width, sensitivity)
   ├─ behavioral properties (type, deformationRules)
   └─ metadata (group, description)

         ▼
         │ consumed by
         │

creature.muscles = [...]
         │
         ├─ Phase 2: Force Analyzer
         │  (calc stretch/compression/twist)
         │
         ├─ Phase 3: Geometry Generator
         │  (create 2D shapes)
         │
         └─ Phase 4: Renderer
            (draw with Madhubani styling)
```

---

## Data Flow Diagram

### Skeleton → Muscles Generation

```
SKELETON INPUT:
{
  bones: [
    { id: 'spine0', pos: {x: 100, y: 150} },
    { id: 'spine1', pos: {x: 120, y: 160} },
    { id: 'spine2', pos: {x: 140, y: 170} },
    ...
  ]
}
         │
         ├─ findBonesByRegion('spine')
         │  → [spine0, spine1, spine2]
         │
         ├─ Find mapping for 'erect_quadruped' → 'spine'
         │  → { shapeType: 'rotation_joint', baseWidth: 20, ... }
         │
         ├─ Loop sequential bone pairs: (spine0, spine1), (spine1, spine2)
         │
         ├─ For each pair, create muscle:
         │    - restLength = distance(spine0, spine1) = 28.3
         │    - restAngle = atan2(dy, dx) = 19.4°
         │    - type = 'rotation_joint'
         │    - deformationRules = MUSCLE_SHAPE_TYPES['rotation_joint'].deformationRules
         │
         ▼

MUSCLE OUTPUT:
{
  id: 'horse_spine_0',
  startJoint: 'spine0',
  endJoint: 'spine1',
  restLength: 28.3,
  restAngle: 19.4,
  width: 20,
  type: 'rotation_joint',
  shapeType: 'rotation_joint',
  deformationRules: {
    stretch: { widthMultiplier: 0.75, ... },
    compress: { widthMultiplier: 1.15, ... },
    twist: { sensitivity: 1.4, ... }
  },
  twistSensitivity: 1.4,
  widthRange: { stretch: 0.75, rest: 1.0, compress: 1.15 },
  ...
}
```

---

## Generation Algorithm

### generateMusclesTours(creatureName, skeleton, locomotionType)

```javascript
1. VALIDATE INPUTS
   ├─ Check MUSCLE_MAPPINGS exists
   ├─ Check MUSCLE_SHAPE_TYPES exists
   └─ Check locomotionType is valid

2. GET MAPPING
   └─ const mapping = MUSCLE_MAPPINGS[locomotionType]
      └─ Contains all regions: front_left_limb, spine, tail, etc.

3. FOR EACH REGION IN MAPPING:
   ├─ Find matching bones: findBonesByRegion(skeleton, regionName)
   │
   ├─ IF special attachment pattern (e.g., spine_to_femur):
   │  └─ Create single muscle across non-sequential bones
   │
   └─ ELSE (sequential bones):
      └─ FOR EACH consecutive bone pair:
         └─ CREATE MUSCLE:
            ├─ Calculate restLength from skeleton
            ├─ Calculate restAngle from skeleton
            ├─ Get shape type from mapping
            ├─ Get deformationRules from MUSCLE_SHAPE_TYPES
            ├─ Assign width, sensitivity from region config
            └─ Add to muscles array

4. RETURN muscles array
```

---

## Bone Region Detection Strategy

### Pattern Matching Architecture

```
Region Name: 'front_left_limb'
         │
         ▼
Pattern: /^frontLeft(?!.*flexor)/i
         │ ├─ ^ = starts with
         │ ├─ frontLeft = literal
         │ ├─ (?!.*flexor) = negative lookahead (not flexor variant)
         │ └─ i = case insensitive
         │
         ▼
Filter bones: skeleton.bones.filter(bone => pattern.test(bone.id))
         │
         ├─ Matches: frontLeftShoulder, frontLeftFemur, frontLeftTibia
         └─ Excludes: frontLeftFlexor (if that pattern existed)
         │
         ▼
Sort by anatomical order: sortBonesByAnatomicalOrder()
         │
         ├─ If numeric indices: sort by number (spine0, spine1, spine2)
         ├─ Else if limb: sort by distance from origin
         └─ Else: keep order
         │
         ▼
Return: [frontLeftShoulder, frontLeftFemur, frontLeftTibia]
```

### Pattern Registry

```javascript
const patterns = {
    front_left_limb: /^frontLeft(?!.*flexor)/i,
    front_left_flexor: /^frontLeft/i,
    hind_left_limb: /^hindLeft(?!.*lateral|compression)/i,
    hind_left_lateral: /^hindLeft/i,
    hind_left_compression: /^(spine|hindLeft)/i,  // COMPOSITE!
    spine: /^spine(\d+)?$/i,
    tail: /^tail/i,
    neck: /^neck/i,
    ...
}
```

**Key Design:**
- Specificity through negative lookahead (avoid flexor variants)
- Composite patterns for non-sequential attachments
- Case-insensitive for robustness
- Numeric suffix optional (handles `spine` and `spine0`)

---

## Integration with Existing Systems

### creature-builder.js Integration

```javascript
// In ModularCreatureBuilder.createCreature()
const creature = {
    type: creatureType,
    skeleton: skeleton,
    
    // NEW: Auto-generated muscles
    muscles: initializeCreatureMusculature(
        creatureName,
        skeleton,
        getCreatureProperty(creatureType, 'postureType') // or use locomotionType
    ),
    
    // Existing systems
    chains: [...],
    locomotionSystem: locomotionSystem,
    gaitSystem: gaitSystem,
    ...
}
```

### Backward Compatibility

```javascript
// Old code using hardcoded muscles still works:
const legacyMuscles = getAllMuscles('horse');
// Returns MUSCLE_TEMPLATES_LEGACY['horse'].muscle_templates

// New code uses auto-generation:
const autoMuscles = initializeCreatureMusculature('horse', skeleton, 'erect_quadruped');
// Returns generated muscles with shape types

// They're compatible in Phase 2 because both have:
// - startJoint, endJoint, restLength, restAngle
// - width, sensitivity
// - deformationRules (auto-gen has them, legacy added on demand)
```

---

## Phase 2 Handoff

Phase 1 v2 outputs are directly consumable by Phase 2:

```javascript
// Phase 1 provides:
muscle = {
    startJoint, endJoint,           // For skeleton traversal
    restLength, restAngle,           // For rest state
    width, sensitivity,              // For visual sizing
    type, deformationRules,          // For behavior
    twistSensitivity,                // For rotation response
    group, description               // For organization
}

// Phase 2 (Force Analyzer) will:
// 1. Get current bone positions → calculate current length/angle
// 2. Compare to rest state → calculate stretch ratio, twist angle
// 3. Apply deformationRules[state].*
//    (state = 'stretch' | 'compress' | 'twist')
// 4. Generate muscle geometry
// 5. Render to screen

// Example:
const stretchRatio = currentLength / muscle.restLength;
if (stretchRatio > 1.0) {
    // Apply stretch rules
    const rules = muscle.deformationRules.stretch;
    newWidth = muscle.width * rules.widthMultiplier;
}
```

---

## Extensibility

### Adding New Shape Type

```javascript
// In muscle-shape-types.js:
MUSCLE_SHAPE_TYPES.my_custom_muscle = {
    id: 'my_custom_muscle',
    name: 'My Custom Muscle',
    deformationRules: {
        stretch: { widthMultiplier: 0.8, thinFactor: 0.85, addStriations: true },
        compress: { widthMultiplier: 1.3, bulgeFactor: 1.4, roundness: 0.7 },
        twist: { sensitivity: 1.2, offsetFactor: 0.5 }
    },
    widthRange: { stretch: 0.8, rest: 1.0, compress: 1.3 },
    twistSensitivity: 1.2
};

// Then use in muscle-mappings.js:
MUSCLE_MAPPINGS.new_locomotion_type.new_region = {
    shapeType: 'my_custom_muscle',
    baseWidth: 15,
    sensitivity: 1.0
};
```

### Adding New Locomotion Type

```javascript
// In muscle-mappings.js:
MUSCLE_MAPPINGS.flying_biped = {
    left_wing: {
        shapeType: 'extending_limb_muscle',
        baseWidth: 18,
        sensitivity: 1.3
    },
    right_wing: {
        shapeType: 'extending_limb_muscle',
        baseWidth: 18,
        sensitivity: 1.3
    },
    left_leg: {
        shapeType: 'rotation_joint',
        baseWidth: 12,
        sensitivity: 0.9
    },
    right_leg: {
        shapeType: 'rotation_joint',
        baseWidth: 12,
        sensitivity: 0.9
    },
    spine: {
        shapeType: 'stabilizer_muscle',
        baseWidth: 16,
        sensitivity: 0.7
    }
};

// Then use:
const muscles = generateMusclesTours('pterodactyl', skeleton, 'flying_biped');
```

---

## Summary

**Phase 1 v2 implements a 3-layer muscle system:**

1. **Behavioral Layer** (muscle-shape-types.js)
   - What muscles CAN do (deformation rules)
   - Independent of creature/anatomy

2. **Anatomical Layer** (muscle-mappings.js)
   - Where muscles GO (region assignments)
   - Organized by locomotion type

3. **Generation Layer** (muscle-generator.js)
   - HOW to create muscles (algorithm)
   - Combines behavioral + anatomical layers
   - Fills in skeletal details (rest length/angle)

**Result:** Scalable, reusable, maintainable muscle system ready for Phase 2 force analysis.

---

**Diagram Legend:**
- `─→` = data flow
- `┌─┐` = process/module
- `[]` = array
- `{}` = object

**Version:** Phase 1 v2 Refactored  
**Date:** November 10, 2025
