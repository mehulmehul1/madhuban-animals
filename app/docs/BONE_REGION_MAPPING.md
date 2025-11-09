# Bone Region Mapping for Existing Creatures

This document maps the actual skeleton bones to body regions for each creature, enabling muscle auto-generation.

---

## Horse (Erect Quadruped)

**Skeleton Structure:**
```
spine0 ─ spine1 ─ spine2 ─ spine3
  │                          │
  └─ frontLeftShoulder      └─ hindLeftHip
     │                          │
     ├─ frontLeftForearm       ├─ hindLeftFemur
     │  │                      │  │
     │  └─ frontLeftHoof       │  └─ hindLeftTibia
     │
     └─ (mirror for right side)
```

**Region Mappings:**

| Region | Bones | Muscle Type | Count | Group |
|--------|-------|---|---|---|
| **front_left_limb** | shoulder→forearm, forearm→hoof | extending_limb_muscle | 2 | front_left_limb |
| **front_left_limb** | hoof (static) | propulsion_foot | 1 | front_left_limb |
| **front_right_limb** | shoulder→forearm, forearm→hoof | extending_limb_muscle | 2 | front_right_limb |
| **front_right_limb** | hoof | propulsion_foot | 1 | front_right_limb |
| **hind_left_limb** | femur→tibia | extending_limb_muscle | 1 | hind_left_limb |
| **hind_left_limb** | spine2→femur | compression_mass | 1 | hind_left_limb |
| **hind_left_limb** | hoof | propulsion_foot | 1 | hind_left_limb |
| **hind_right_limb** | femur→tibia | extending_limb_muscle | 1 | hind_right_limb |
| **hind_right_limb** | spine2→femur | compression_mass | 1 | hind_right_limb |
| **hind_right_limb** | hoof | propulsion_foot | 1 | hind_right_limb |
| **spine** | spine0→1, spine1→2, spine2→3 | rotation_joint | 3 | spine |
| **neck** | spine0→neckBase (if exists) | rotation_joint | 1 | neck |
| **tail** | spine3→tail1, tail1→tail2 (if exists) | balance_tail | 2 | tail |

**Total Auto-Generated Muscles:** 17-19 (depending on tail segments)

**Locomotion Type:** `erect_quadruped`

---

## Lizard (Sprawling Quadruped)

**Skeleton Structure:**
```
spine0 ─ spine1 ─ spine2 ─ spine3 ─ tail1 ─ tail2 ─ tail3
  │       │       │       │
  │       │       │       └─ hindLeftFemur
  │       │       │          │
  │       │       │          └─ hindLeftTibia
  │       │
  │       └─ frontLeftFemur
  │          │
  │          └─ frontLeftTibia
  │
  (mirror for right side)
```

**Region Mappings:**

| Region | Bones | Muscle Type | Count | Group |
|--------|-------|---|---|---|
| **front_left_limb** | spine1→femur, femur→tibia | extending_limb_muscle | 2 | front_left_limb |
| **front_right_limb** | spine1→femur, femur→tibia | extending_limb_muscle | 2 | front_right_limb |
| **hind_left_limb** | spine2→femur, femur→tibia | extending_limb_muscle | 2 | hind_left_limb |
| **hind_right_limb** | spine2→femur, femur→tibia | extending_limb_muscle | 2 | hind_right_limb |
| **spine** | spine0→1, spine1→2, spine2→3 | undulation_segment | 3 | spine |
| **tail** | spine3→tail1, tail1→tail2, tail2→tail3 | undulation_segment | 3 | tail |

**Total Auto-Generated Muscles:** 16

**Locomotion Type:** `sprawling_quadruped`

---

## Crane (Erect Bipedal-like)

**Skeleton Structure:**
```
spine0 ─ spine1 ─ spine2 ─ spine3
  │                          │
  ├─ neckBase              └─ hindLeftHip
  │  │                        │
  │  └─ head                  ├─ hindLeftTibia
  │                           │
  │                           └─ hindLeftFoot
  │
  (mirror for right side)
```

**Region Mappings:**

| Region | Bones | Muscle Type | Count | Group |
|--------|-------|---|---|---|
| **hind_left_limb** | hip→tibia, tibia→foot | extending_limb_muscle | 2 | hind_left_limb |
| **hind_left_limb** | foot (static) | propulsion_foot | 1 | hind_left_limb |
| **hind_right_limb** | hip→tibia, tibia→foot | extending_limb_muscle | 2 | hind_right_limb |
| **hind_right_limb** | foot | propulsion_foot | 1 | hind_right_limb |
| **spine** | spine0→1, spine1→2, spine2→3 | rotation_joint | 3 | spine |
| **neck** | neckBase→head | rotation_joint | 1 | neck |

**Total Auto-Generated Muscles:** 11

**Locomotion Type:** `bipedal` (or specialized variant)

---

## Snake (Serpentine)

**Skeleton Structure:**
```
spine0 ─ spine1 ─ spine2 ─ spine3 ─ ... ─ spine25
  │       │       │       │              │
  (no limbs, entire body is spine)       └─ tail continues if separate
```

**Region Mappings:**

| Region | Bones | Muscle Type | Count | Group |
|--------|-------|---|---|---|
| **spine** | spine0→1, spine1→2, ... spine24→25 | undulation_segment | 25 | spine |

**Total Auto-Generated Muscles:** 25

**Locomotion Type:** `serpentine`

---

## Fish (Aquatic)

**Skeleton Structure:**
```
head ─ body0 ─ body1 ─ body2 ─ ... ─ tail
```

**Region Mappings:**

| Region | Bones | Muscle Type | Count | Group |
|--------|-------|---|---|---|
| **body** | head→body0, body0→1, body1→2, ... | undulation_segment | N | body |
| **tail** | body_N→tail | undulation_segment | 1 | tail |

**Total Auto-Generated Muscles:** N+1

**Locomotion Type:** `aquatic`

---

## Implementation Requirements

### 1. Bone Identification in Skeleton
Each bone needs a consistent `id` that matches the mapping:
- `spine0`, `spine1`, `spine2`, `spine3`
- `frontLeftShoulder`, `frontLeftForearm`, `frontLeftHoof` (or `frontLeftTibia`)
- `hindLeftFemur`, `hindLeftTibia`, etc.
- `tail1`, `tail2`, etc. (or continuous from spine)

### 2. Region Detection Algorithm
```javascript
function findBonesByRegion(skeleton, regionName) {
  // Example: 'front_left_limb' → find all bones matching pattern
  // 'frontLeft*' in their IDs
  
  // Patterns:
  // 'front_left_limb' → /^frontLeft/
  // 'hind_right_limb' → /^hindRight/
  // 'spine' → /^spine\d+$/
  // 'tail' → /^tail\d+$|^spine.*tail.*/
  // 'neck' → /^neck|neckBase/
}
```

### 3. Rest Length Calculation
For auto-generation, use creature's **current skeleton pose** as rest state:
```javascript
function calculateRestLength(bone1, bone2) {
  const pos1 = bone1.position; // from skeleton in T-pose
  const pos2 = bone2.position;
  return dist(pos1, pos2);
}
```

### 4. Rest Angle Calculation
```javascript
function calculateRestAngle(bone1, bone2) {
  const vec = subtract(bone2.position, bone1.position);
  return atan2(vec.y, vec.x); // angle in degrees/radians
}
```

---

## Open Question: Bone Region Tags

**Option A: Use ID patterns**
- Bone IDs encode region: `frontLeftShoulder` = front+left+limb
- Pro: No extra data needed
- Con: Fragile regex matching

**Option B: Add region tags to bones**
```javascript
horse: {
  bones: {
    frontLeftShoulder: { x: -22, y: 60, region: 'front_left_limb', segment: 'shoulder' },
    frontLeftForearm: { x: -22, y: 40, region: 'front_left_limb', segment: 'forearm' },
    // ...
  }
}
```
- Pro: Explicit, flexible
- Con: More config data

**Recommendation:** Start with **Option A (ID patterns)**, upgrade to **Option B** if patterns become too complex.

---

## Summary Table: All Creatures

| Creature | Locomotion Type | Limbs | Spine Segments | Tail | Total Muscles |
|---|---|---|---|---|---|
| Horse | erect_quadruped | 4 | 3-4 | 2-3 | 17-19 |
| Lizard | sprawling_quadruped | 4 | 3 | 3 | 16 |
| Crane | bipedal | 2 | 3 | 0 | 11 |
| Snake | serpentine | 0 | 25 | 0 | 25 |
| Fish | aquatic | 0 | ~6 | 1 | ~7 |

---

Ready to implement muscle auto-generation. All mappings defined.
