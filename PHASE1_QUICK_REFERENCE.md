# Phase 1 v2 Quick Reference Guide

## Core API

### Auto-Generate Muscles

```javascript
// Main function - returns Array of muscle objects
const muscles = generateMusclesTours(creatureName, skeleton, locomotionType);

// Example:
const horseMuscles = generateMusclesTours('horse', horseSkeleton, 'erect_quadruped');
console.log(`Generated ${horseMuscles.length} muscles for horse`);
```

### Initialize Creature Musculature

```javascript
// Wrapper function with error handling
const muscles = initializeCreatureMusculature('horse', skeleton, 'erect_quadruped');
```

### Find Bones by Region

```javascript
// Get bones for a specific anatomical region
const spineBones = findBonesByRegion(skeleton, 'spine');
const legBones = findBonesByRegion(skeleton, 'hind_left_limb');
```

---

## Shape Types

### Available Shape Types (7 total)

| ID | Name | Twist Sensitivity | Best For |
|----|------|-------------------|----------|
| `extending_limb_muscle` | Extending Limb | 0.8 | Quadriceps, hamstrings |
| `compression_mass` | Compression Mass | 0.5 | Glutes, calves |
| `rotation_joint` | Rotation Joint | 1.4 | Spinal rotators |
| `balance_tail` | Balance Tail | 1.0 | Tail muscles |
| `undulation_segment` | Undulation | 1.3 | Serpentine/sprawling |
| `neck_flexor` | Neck Flexor | 1.1 | Head/neck control |
| `stabilizer_muscle` | Stabilizer | 0.6 | Deep core |

### Shape Type Structure

```javascript
MUSCLE_SHAPE_TYPES.extending_limb_muscle = {
    id: 'extending_limb_muscle',
    name: 'Extending Limb Muscle',
    deformationRules: {
        stretch: { widthMultiplier: 0.7, thinFactor: 0.8, addStriations: true },
        compress: { widthMultiplier: 1.2, bulgeFactor: 1.3, roundness: 0.6 },
        twist: { sensitivity: 0.8, offsetFactor: 0.4 }
    },
    widthRange: { stretch: 0.7, rest: 1.0, compress: 1.2 },
    twistSensitivity: 0.8
}
```

---

## Locomotion Types

### Supported Locomotion Types (5 total)

#### 1. Erect Quadruped (Horse-like)
- Legs under body, vertical-plane movement
- **Regions:** front_left/right limb, hind_left/right limb, spine, neck, tail
- **Primary muscles:** extending_limb_muscle, compression_mass, rotation_joint

```javascript
const muscles = generateMusclesTours('horse', skeleton, 'erect_quadruped');
```

#### 2. Sprawling Quadruped (Lizard-like)
- Legs splayed outward, lateral undulation
- **Regions:** front/hind limbs, lateral flexors, spine, tail
- **Primary muscles:** extending_limb_muscle, undulation_segment

```javascript
const muscles = generateMusclesTours('lizard', skeleton, 'sprawling_quadruped');
```

#### 3. Bipedal (Crane-like)
- Two powerful legs, tail for balance
- **Regions:** left/right limb, hip flexor, spine, tail, neck
- **Primary muscles:** extending_limb_muscle, balance_tail, rotation_joint

```javascript
const muscles = generateMusclesTours('crane', skeleton, 'bipedal');
```

#### 4. Serpentine (Snake-like)
- No limbs, pure lateral undulation
- **Regions:** spine, deep stabilizers, head
- **Primary muscles:** undulation_segment, stabilizer_muscle

```javascript
const muscles = generateMusclesTours('snake', skeleton, 'serpentine');
```

#### 5. Aquatic (Fish-like)
- Flexible spine, tail-driven propulsion
- **Regions:** spine, tail, pectoral fins, dorsal fin
- **Primary muscles:** undulation_segment, extending_limb_muscle

```javascript
const muscles = generateMusclesTours('fish', skeleton, 'aquatic');
```

---

## Generated Muscle Object Structure

```javascript
{
    // Core identification
    id: 'horse_spine_0',
    name: 'spine #0',
    
    // Skeletal attachment
    startJoint: 'spine0',
    endJoint: 'spine1',
    
    // Rest state
    restLength: 85.5,           // Calculated from skeleton
    restAngle: 15.2,             // Calculated from skeleton
    
    // Visual properties
    width: 20,                   // From mapping
    sensitivity: 0.8,            // From mapping
    
    // Behavioral properties
    type: 'rotation_joint',      // Shape type ID
    group: 'spine',              // Region name
    shapeType: 'rotation_joint', // Duplicate for clarity
    
    // Deformation rules (from shape type)
    deformationRules: {
        stretch: { widthMultiplier: 0.75, thinFactor: 0.85, addStriations: true },
        compress: { widthMultiplier: 1.15, bulgeFactor: 1.2, roundness: 0.5 },
        twist: { sensitivity: 1.4, offsetFactor: 0.6 }
    },
    
    // Width range (from shape type)
    widthRange: { stretch: 0.75, rest: 1.0, compress: 1.15 },
    
    // Twist sensitivity (from shape type)
    twistSensitivity: 1.4,
    
    // Metadata
    description: 'Auto-generated muscle for spine',
    attachmentPattern: 'sequential'
}
```

---

## Validation & Helpers

### Validate Generated Muscles

```javascript
const result = validateGeneratedMuscles(muscles);
// Returns: { valid: boolean, errors: Array, muscleCount: number }
```

### Validate Muscle Mappings

```javascript
const result = validateMuscleMapping();
// Returns: { valid: boolean, missingTypes: Array, locomotionTypesCount: number }
```

### Get Muscle Count by Region

```javascript
const counts = getMuscleCountByRegion(muscles);
// Returns: { front_left_limb: 2, spine: 4, tail: 1, ... }
```

### Accessor Functions

```javascript
// Get mapping for locomotion type
const mapping = getLocomotionMapping('erect_quadruped');

// Get config for specific region
const regionConfig = getRegionConfig('erect_quadruped', 'front_left_limb');

// Get all regions for locomotion type
const regions = getRegionsForLocomotionType('erect_quadruped');

// Get all locomotion types
const types = getAllLocomotionTypes();

// Get shape type by ID
const shapeType = getShapeType('extending_limb_muscle');

// Get all shape type IDs
const typeIds = getAllShapeTypeIds();
```

---

## Anatomical Region Patterns

### Bone Naming Conventions

Creatures should follow these naming patterns for auto-detection:

| Region | Pattern | Examples |
|--------|---------|----------|
| Front left limb | `frontLeft*` | frontLeftShoulder, frontLeftFemur |
| Front right limb | `frontRight*` | frontRightShoulder, frontRightFemur |
| Hind left limb | `hindLeft*` | hindLeftFemur, hindLeftTibia |
| Hind right limb | `hindRight*` | hindRightFemur, hindRightTibia |
| Spine | `spine\d*` | spine0, spine1, spine2 |
| Tail | `tail*` | tail1, tail2, tailSegment1 |
| Neck | `neck*` | neckBase, neck1 |
| Head | `head*` | head, head1 |

---

## Legacy Code Migration

### Old Code (Phase 1 v1)
```javascript
const muscles = getAllMuscles('horse');
```

### New Code (Phase 1 v2)
```javascript
const muscles = initializeCreatureMusculature('horse', skeleton, 'erect_quadruped');
```

### Compatibility
Both still work - legacy functions return MUSCLE_TEMPLATES_LEGACY data.  
New code should use auto-generation for all new creatures.

---

## Testing

### Run All Tests
```bash
# Open in browser:
app/tests/test_muscle_phase1_v2.html

# Results: 17/17 tests passing
```

### Test Categories
- Shape Types Validation (5 tests)
- Mappings Validation (3 tests)
- Auto-Generation (4 tests)
- Integration Tests (3 tests)
- Validation Functions (2 tests)

---

## Common Tasks

### Create Horse with Auto-Generated Muscles

```javascript
// Create skeleton
const skeleton = createHorseSkeleton();

// Generate muscles
const muscles = generateMusclesTours('horse', skeleton, 'erect_quadruped');

// Verify generation
console.log(`✓ Generated ${muscles.length} muscles`);
console.log('Muscle groups:', Object.keys(getMuscleCountByRegion(muscles)));
```

### Check Muscle Details

```javascript
const muscles = generateMusclesTours('horse', skeleton, 'erect_quadruped');

// Print all spine muscles
muscles
    .filter(m => m.group === 'spine')
    .forEach(m => {
        console.log(`${m.name}: length=${m.restLength.toFixed(2)}, angle=${m.restAngle.toFixed(1)}°`);
    });
```

### Validate New Creature Configuration

```javascript
const muscles = generateMusclesTours('newCreature', skeleton, 'sprawling_quadruped');

// Validate
const validation = validateGeneratedMuscles(muscles);
if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
} else {
    console.log(`✓ All ${validation.muscleCount} muscles valid`);
}
```

---

## Troubleshooting

### No Muscles Generated
```javascript
// Check if locomotion type is valid
console.log(getAllLocomotionTypes());
// Should include: erect_quadruped, sprawling_quadruped, bipedal, serpentine, aquatic
```

### "No bones found for region"
```javascript
// Check skeleton bone naming
skeleton.bones.forEach(b => console.log(b.id));
// Should match patterns like: spine0, frontLeftFemur, hindLeftTibia, etc.
```

### Muscle with wrong rest angle
```javascript
// Rest angle is calculated from skeleton positions
// Verify bone positions are correct:
const startPos = skeleton.getBoneById(muscle.startJoint).pos;
const endPos = skeleton.getBoneById(muscle.endJoint).pos;
const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x) * 180 / Math.PI;
```

---

## Phase 2 Integration

Phase 1 v2 output is ready for Phase 2 (Force Analysis):

```javascript
// Phase 1 generates muscles with type information
const muscles = generateMusclesTours('horse', skeleton, 'erect_quadruped');

// Phase 2 will:
// 1. Calculate forces (stretch ratio, compression ratio, twist angle)
// 2. Apply deformationRules[state].* based on muscle.type
// 3. Generate geometry (2D shapes with widths/bulges)
// 4. Render with Madhubani styling

const deformationRules = muscles[0].deformationRules;
// { stretch: {...}, compress: {...}, twist: {...} }
```

---

**Last Updated:** November 10, 2025  
**Phase:** 1 v2 Refactored  
**Status:** Complete & Tested ✓
