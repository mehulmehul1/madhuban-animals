# Madhuban Animals: Scalable Force-Driven Muscle System

**Version 2.0 — Skeleton-Based Auto-Generation Architecture**

This document describes a **scalable muscle system** where creature muscles are **auto-generated** from:
1. Skeleton structure (which bones exist)
2. Locomotion type (how the creature moves)
3. Body region mappings (where muscles attach)

Instead of hardcoding 21 muscles per creature, we define **reusable muscle shape types** and **locomotion-to-region mappings**. Adding a new creature requires only: skeleton definition + locomotion type.

---

## 1. Core Architecture: Gesture → Locomotion → Muscles

```
Skeleton Gesture (from locomotion system)
    ↓
Identify Locomotion Type (erect quadruped, sprawling, bipedal, serpentine, etc.)
    ↓
Apply Body Region Mapping (which regions exist: limbs, spine, tail, wings)
    ↓
Auto-generate Muscle Templates (attach shape types to bones)
    ↓
Deformation Engine calculates force vectors
    ↓
Visual Result: Gesture-driven dynamic deformation
```

---

## 2. Muscle Shape Types (Reusable Across All Creatures)

Each shape type defines a **deformation behavior** based on how forces act on it.

### 2.1 Core Muscle Shape Types

#### Type 1: `extending_limb_muscle`
**Purpose:** Limb segments that stretch when extended, compress when bent.  
**Force Behavior:**
- Extension (ratio > 1.0) → thin, elongate, show tension
- Flexion (ratio < 1.0) → bulge outward, appear powerful
- Twist → spiral offset along limb axis

**Used in:**
- Quadrupeds (front/hind limbs): horse, lizard, crane
- Bipeds (legs): kangaroo
- Digitigrades (all foot types)

**Example Attachments:**
- Horse: shoulder→tibia, femur→tibia
- Lizard: spine→femur, femur→tibia
- Crane: hip→tibia, tibia→foot

---

#### Type 2: `compression_mass`
**Purpose:** Body regions that primarily **bulge when compressed**, absorb landing forces.  
**Force Behavior:**
- Compression (ratio < 1.0) → maximum bulge (width increases 1.3-1.5x)
- Extension (ratio > 1.0) → slight thin (width decreases to 0.8x)
- Twist → asymmetrical bulge distribution

**Used in:**
- All creatures with shoulders/hindquarters
- Landing/impact moments (walking, galloping)

**Example Attachments:**
- Horse: spine→hindLeftFemur (gluteus mass)
- Quadrupeds: shoulder region during stance phase
- Birds: chest/rump during landing

---

#### Type 3: `rotation_joint`
**Purpose:** Spine/neck segments that rotate and twist, transferring force along body axis.  
**Force Behavior:**
- Lateral flex (high twist) → bulge perpendicular to bend, spiral pattern
- Vertical flex → bulge under compression
- Twist → dominant deformation (can exceed 30° offset)

**Used in:**
- All creatures with flexible spines
- Primary force-flow transmission (shoulder→hips)

**Example Attachments:**
- Horse: spine0→spine1, spine1→spine2, spine2→spine3
- Lizard: spine0→spine1, spine1→spine2
- Snake: every spine segment (each is rotation_joint)

---

#### Type 4: `undulation_segment`
**Purpose:** Body segments with **lateral undulation**; primary locomotion driver.  
**Force Behavior:**
- Lateral wave (high sensitivity to twist) → extreme bulge offset (30-50°)
- High frequency response (1-2 Hz undulation rhythm)
- Compression/extension secondary to lateral movement

**Used in:**
- Serpentine creatures (snake, eel, worm)
- Sprawling quadrupeds with lateral spine flex (lizard)
- Fish body segments
- Tail propulsion (all creatures with tails)

**Example Attachments:**
- Snake: spine0→spine1, spine1→spine2, ... (entire body)
- Lizard: spine0→spine1, spine1→spine2 (lateral emphasis)
- Fish: head→segment1, segment1→segment2, ..., tail
- Horse tail: spine3→tail1, tail1→tail2 (undulation-driven balance)

---

#### Type 5: `propulsion_foot`
**Purpose:** Feet/paws that **push off ground**; dynamic grip and propulsion.  
**Force Behavior:**
- During stance: bulge (foot compressed against ground)
- During push-off: rapid bulge→thin (explosive extension)
- Minimal twist (mostly linear deformation)
- High sensitivity (1.4-1.6) to capture ground contact dynamics

**Used in:**
- Digitigrades (dog, cat, lion feet)
- Unguligrades (horse hooves)
- Plantigrades (bear feet)
- Bird talons

**Example Attachments:**
- Horse: tibia→hoof (ungulate propulsion)
- Lizard: tibia→foot (plantigrade-like contact)
- Crane: tibia→foot (sharp talon dynamics)

---

#### Type 6: `balance_tail`
**Purpose:** Tails used for balance, counterweight, or steering; high-frequency rhythmic motion.  
**Force Behavior:**
- Undulation: lateral and vertical waves
- Counterbalance: opposite to spine rotation (compensatory bulge)
- High sensitivity to twist (1.2-1.4)

**Used in:**
- All creatures with tails: horses, lizards, cats, mice
- Kangaroos (major propulsion tail)
- Fish (caudal fin)

**Example Attachments:**
- Horse: spine3→tail1, tail1→tail2
- Lizard: spine3→tail1, tail1→tail2, tail2→tail3
- Cat: spine3→tail1, tail1→tail2, tail2→tail3, tail3→tail4

---

#### Type 7: `flight_wing`
**Purpose:** Wings for aerial locomotion; fold/extend dynamics.  
**Force Behavior:**
- Extension (ratio > 1.0) → thin, show feather tension
- Flexion (ratio < 1.0) → bulge muscle attachment points
- Twist → primary control input for directional flight
- High sensitivity (1.3-1.5) to rapid deformation

**Used in:**
- Birds: crane, eagle, owl
- Flying mammals: bat

**Example Attachments:**
- Crane: shoulder→wing_tip (wing fold/extend)
- Eagle: shoulder→wing_mid, wing_mid→wing_tip

---

### 2.2 Shape Type Properties Table

| Type | Stretch Behavior | Compress Behavior | Twist Sensitivity | Width Range | Used For |
|------|---|---|---|---|---|
| `extending_limb_muscle` | Thin, 0.7x width | Bulge, 1.2x width | Medium (0.8) | 0.7-1.2 | Limb segments (all creatures) |
| `compression_mass` | Slight thin, 0.85x | Maximum bulge, 1.4x | Low (0.5) | 0.85-1.4 | Shoulders, hindquarters, chest |
| `rotation_joint` | Thin, 0.75x | Bulge, 1.25x | High (1.2) | 0.75-1.25 | Spine, neck (all creatures) |
| `undulation_segment` | Thin, 0.8x | Bulge, 1.3x | Very High (1.4) | 0.8-1.3 | Spine (serpentine), tail, fish body |
| `propulsion_foot` | Thin, 0.6x | Extreme bulge, 1.5x | Very Low (0.3) | 0.6-1.5 | Feet, paws, hooves |
| `balance_tail` | Thin, 0.75x | Bulge, 1.3x | Very High (1.3) | 0.75-1.3 | Tails (all creatures) |
| `flight_wing` | Thin, 0.7x | Bulge, 1.2x | Very High (1.4) | 0.7-1.2 | Wings (flying creatures) |

---

## 3. Locomotion Types & Body Region Mappings

Each locomotion type defines which **body regions** exist and which **muscle shape types** to apply to them.

### 3.1 Erect Quadruped (Horse, Crane-like creatures)

**Locomotion Type:** `erect_quadruped`

**Body Regions:**
- `front_left_limb`: Shoulder → Tibia
- `front_right_limb`: Shoulder → Tibia
- `hind_left_limb`: Hip → Tibia
- `hind_right_limb`: Hip → Tibia
- `spine`: Spine segments 0-3
- `neck`: Neck base → head
- `tail`: Spine3 → TailEnd (optional)

**Muscle Shape Type Assignments:**

| Region | Muscle Type | Bones Spanned | Count |
|--------|---|---|---|
| front_left_limb | extending_limb_muscle | shoulder→forearm, forearm→hoof | 2 |
| front_left_limb | propulsion_foot | hoof (rest state) | 1 |
| hind_left_limb | compression_mass | spine2→femur (gluteus) | 1 |
| hind_left_limb | extending_limb_muscle | femur→tibia | 1 |
| hind_left_limb | propulsion_foot | hoof | 1 |
| spine | rotation_joint | spine0→1, spine1→2, spine2→3 | 3 |
| spine | compression_mass | (attached to spine during stance) | 1 |
| neck | rotation_joint | neck0→head | 1 |
| tail | balance_tail | tail0→1, tail1→2 (if exists) | 2 |

**Auto-Generation Logic:**
```
For each limb in creature.skeleton.limbs:
  if bone_pattern matches (shoulder/hip → tibia):
    attach extending_limb_muscle
    attach propulsion_foot to endpoint
    if adjacent to spine:
      attach compression_mass at origin

For each spine_segment in creature.skeleton.spine:
  attach rotation_joint
  
For tail in creature.skeleton.tail:
  attach balance_tail to each segment
```

---

### 3.2 Sprawling Quadruped (Lizard, Crocodile)

**Locomotion Type:** `sprawling_quadruped`

**Key Difference:** Lateral undulation + horizontal limb flex

**Body Regions:**
- `front_left_limb`: Spine1 → Tibia (angled outward)
- `front_right_limb`: Spine1 → Tibia
- `hind_left_limb`: Spine2 → Tibia
- `hind_right_limb`: Spine2 → Tibia
- `spine`: Spine segments 0-3 (high lateral flex)
- `tail`: Spine3 → TailEnd (major propulsion)

**Muscle Shape Type Assignments:**

| Region | Muscle Type | Bones Spanned | Count |
|--------|---|---|---|
| front_left_limb | extending_limb_muscle | spine1→femur, femur→tibia | 2 |
| hind_left_limb | extending_limb_muscle | spine2→femur, femur→tibia | 2 |
| spine | undulation_segment | spine0→1, spine1→2, spine2→3 | 3 |
| tail | undulation_segment | tail0→1, tail1→2, tail2→3 | 3 |

**Auto-Generation Logic:**
```
For each limb in creature.skeleton.limbs:
  if bone_pattern matches (spine_region → tibia):
    attach extending_limb_muscle (standard)

For each spine_segment in creature.skeleton.spine:
  attach undulation_segment (high twist sensitivity)
  
For tail in creature.skeleton.tail:
  attach undulation_segment (primary propulsion)
```

---

### 3.3 Bipedal (Kangaroo, Human-like)

**Locomotion Type:** `bipedal`

**Body Regions:**
- `hind_left_limb`: Hip → Foot
- `hind_right_limb`: Hip → Foot
- `spine`: Spine segments (moderate flex)
- `tail`: Spine3 → TailEnd (counterbalance)
- `chest`: Compression mass at shoulder region

**Muscle Shape Type Assignments:**

| Region | Muscle Type | Bones Spanned |
|--------|---|---|
| hind_left_limb | extending_limb_muscle | hip→knee, knee→foot |
| hind_left_limb | compression_mass | spine2→hip (gluteus) |
| spine | rotation_joint | spine segments |
| tail | balance_tail | tail segments (counterbalance) |

---

### 3.4 Serpentine (Snake, Eel, Worm)

**Locomotion Type:** `serpentine`

**Body Regions:**
- `spine`: Spine segments 0-N (entire body is spine)
- `tail`: Tail segments (spine continuation)

**Muscle Shape Type Assignments:**

| Region | Muscle Type | Bones Spanned | Count |
|--------|---|---|---|
| spine | undulation_segment | spine0→1, spine1→2, ... | N segments |
| tail | undulation_segment | tail0→1, tail1→2, ... | M segments |

**Special Rule:** EVERY spine segment gets `undulation_segment`. No limbs, no compression masses—pure lateral wave propagation.

---

### 3.5 Aquatic (Fish)

**Locomotion Type:** `aquatic`

**Body Regions:**
- `head`: Head segment
- `body`: Body segments (chain)
- `tail`: Caudal fin

**Muscle Shape Type Assignments:**

| Region | Muscle Type | Bones Spanned |
|--------|---|---|
| body | undulation_segment | body0→1, body1→2, ... |
| tail | undulation_segment | tail (vertical fin) |

---

## 4. Implementation: Auto-Generation Algorithm

### 4.1 High-Level Flow

```javascript
function generateMusclesTours(creature) {
  const locomotionType = creature.anatomicalConfig.postureType; // 'erect', 'sprawling', 'bipedal', etc.
  const mapping = MUSCLE_MAPPINGS[locomotionType]; // Get region→type mappings
  const muscles = [];
  
  // For each body region defined in the mapping
  for (const [regionName, regionConfig] of Object.entries(mapping)) {
    // Find bones matching this region in creature.skeleton
    const regionBones = findBonesByRegion(creature.skeleton, regionName);
    
    // For each consecutive bone pair, create muscle
    for (let i = 0; i < regionBones.length - 1; i++) {
      const muscle = {
        id: `${regionName}_${i}`,
        type: regionConfig.shapeType,
        startJoint: regionBones[i].id,
        endJoint: regionBones[i + 1].id,
        restLength: calculateRestLength(regionBones[i], regionBones[i + 1]),
        restAngle: calculateRestAngle(regionBones[i], regionBones[i + 1]),
        width: regionConfig.baseWidth,
        sensitivity: regionConfig.sensitivity,
        group: regionName,
        deformationRules: getDeformationRules(regionConfig.shapeType)
      };
      muscles.push(muscle);
    }
  }
  
  return muscles;
}
```

### 4.2 Muscle Mapping Definition Structure

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
    spine: {
      shapeType: 'rotation_joint',
      baseWidth: 20,
      sensitivity: 0.8
    },
    // ... more regions
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
  
  serpentine: {
    spine: {
      shapeType: 'undulation_segment',
      baseWidth: 12,
      sensitivity: 1.3
    }
  }
  // ... more locomotion types
};
```

---

## 5. Scalability: Adding a New Creature

### Example: Adding a Kangaroo

**Step 1:** Define skeleton in `anatomical-configs.js`
```javascript
kangaroo: {
  postureType: 'bipedal',  // ← Defines locomotion type
  // ... rest of config
}
```

**Step 2:** Define skeleton bones in bone-template-system.js
```javascript
// Kangaroo has: hind_left_leg, hind_right_leg, spine, tail
// System already knows what to do with 'bipedal' type
```

**Step 3:** ✅ **Muscles auto-generate**
- Kangaroo muscles = apply `bipedal` mapping
- Muscles attach to kangaroo's actual skeleton
- Done.

**No need to:**
- ✗ Define 15-20 muscles manually
- ✗ Calculate rest lengths by hand
- ✗ Name muscles anatomically
- ✗ Worry about missing muscle groups

---

## 6. Phase 2 Implementation Plan (Revised)

| Phase | Component | Description | Time |
|---|---|---|---|
| **2.1** | `muscle-shape-types.js` (NEW) | Define shape type deformation behaviors | 2h |
| **2.2** | `muscle-mappings.js` (NEW) | Define locomotion type → region → shape type mappings | 1h |
| **2.3** | `muscle-generator.js` (NEW) | Implement auto-generation algorithm | 2h |
| **2.4** | `force-analyzer.js` (NEW) | ForceAnalyzer class for deformation calculations | 2h |
| **2.5** | `deformation-rules.js` (NEW) | Deformation behavior rules per shape type | 2h |
| **2.6** | `shape-renderer.js` | Render deformed shapes (geometry generation) | 3h |
| **2.7** | Testing & Validation | Test with horse, lizard, new creature | 1h |

**Total: ~13 hours**

---

## 7. Mattesi Principles Applied

| Principle | Implementation |
|-----------|---|
| **Force drives form** | Shape types embody force behaviors (extending, rotating, undulating) |
| **Rhythm from gesture** | Locomotion type determines muscle rhythm (undulation freq, compression timing) |
| **Stretched vs. compressed** | Every shape type has stretch & compress visual rules |
| **Force flow** | Rotation_joint and undulation_segment transfer force along spine axis |
| **Silhouette clarity** | Muscle shapes create forceful silhouette (straight-to-curve principle) |
| **Species-specific design** | Locomotion type determines which shape types apply |

---

## 8. Success Criteria

✅ **S1:** Adding a new creature requires only skeleton definition + locomotion type  
✅ **S2:** Muscles auto-generate with correct shape types and parameters  
✅ **S3:** Deformation behavior matches Mattesi principles (stretch/compress/twist)  
✅ **S4:** All creatures (horse, lizard, snake, fish, crane, kangaroo) use same shape types  
✅ **S5:** 90%+ code reuse across different creatures

---

## 9. Open Questions for Implementation

1. **Bone Region Detection:** How does the system identify which bones belong to which region (e.g., "front_left_limb")? Should we add region tags to bones?
2. **Rest Length Calculation:** Measure from skeleton in T-pose, or use anatomical config values?
3. **Parameter Tuning:** Artist iteration on sensitivity/width per shape type?

---

This architecture enables **true scalability**: define skeleton → muscles auto-generate → visual results. Ready to proceed.
