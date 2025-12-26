# Horse Muscular Anatomy Reference

## Overview

This document provides a concise reference of horse muscular anatomy specifically for implementing a 3D muscle system.

## Major Muscle Groups

### 1. Axial Muscles (Spine & Torso)

#### Longissimus Dorsi
- **Function**: Extends and supports spine, lateral flexion
- **Shape**: Flat, wide sheet along spine
- **Origin**: Thoracic vertebrae T1-T18
- **Insertion**: Lumbar vertebrae L1-L6, iliac tuber
- **SDF Type**: Sheet muscle with lateral undulation

#### Rectus Abdominis
- **Function**: Supports abdomen, flexes spine
- **Shape**: Wide, thin sheet
- **Origin**: Sternum, costal cartilages
- **Insertion**: Pubic bone
- **SDF Type**: Sheet with wave pattern

### 2. Neck Muscles

#### Splenius
- **Function**: Extends neck, lateral flexion
- **Shape**: Pennate, fan-like
- **Origin**: Nuchal ligament, thoracic vertebrae
- **Insertion**: Wing of atlas, cervical vertebrae
- **SDF Type**: Pennate with feather pattern

#### Brachiocephalicus
- **Function**: Flexes neck, protracts forelimb
- **Shape**: Fusiform, prominent ridge
- **Origin**: Wing of atlas, occipital bone
- **Insertion**: Humerus
- **SDF Type**: Fusiform with taper

### 3. Forelimb Muscles

#### Deltoid
- **Function**: Flexes and abducts shoulder
- **Shape**: Triangular, pennate
- **Origin**: Scapular spine
- **Insertion**: Humerus
- **SDF Type**: Pennate with angle control

#### Biceps Brachii
- **Function**: Flexes elbow, extends shoulder
- **Shape**: Fusiform, prominent belly
- **Origin**: Scapula
- **Insertion**: Radius and ulna
- **SDF Type**: Fusiform with bulge

#### Triceps Brachii
- **Function**: Extends elbow
- **Shape**: Three heads (long, lateral, medial)
- **Origin**: Scapula, humerus
- **Insertion**: Olecranon
- **SDF Type**: Complex with three bellies

#### Digital Extensors
- **Function**: Extend digit joints
- **Shape**: Long, thin tendons
- **Origin**: Distal humerus
- **Insertion**: Distal phalanges
- **SDF Type**: Tapered capsules

### 4. Hindlimb Muscles

#### Gluteus Medius
- **Function**: Extends hip, propulsive power
- **Shape**: Large, fan-shaped
- **Origin**: Ilium
- **Insertion**: Third trochanter
- **SDF Type**: Pennate, powerful

#### Biceps Femoris
- **Function**: Extends hip, flexes stifle
- **Shape**: Large, fusiform
- **Origin**: Ischial tuber
- **Insertion**: Patella, tibia
- **SDF Type**: Complex with multiple bellies

#### Semimembranosus
- **Function**: Extends hip, adducts limb
- **Shape**: Broad, flat
- **Origin**: Ischial tuber
- **Insertion**: Medial tibia
- **SDF Type**: Sheet muscle

#### Gastrocnemius
- **Function**: Extends hock, flexes stifle
- **Shape**: Bipennate, prominent
- **Origin**: Distal femur
- **Insertion**: Calcaneus
- **SDF Type**: Pennate with feather pattern

## Key Proportions

### Body Ratios (Average Horse)
- **Muscle mass**: 40-45% of body weight
- **Neck length**: ~1/3 of body length
- **Leg length**: ~45-50% of height
- **Wither height**: ~60% of total height

### Muscle Group Distribution
- **Gluteal muscles**: 15% of total muscle mass
- **Back muscles**: 10% of total muscle mass
- **Forelimb muscles**: 25% of total muscle mass
- **Hindlimb muscles**: 40% of total muscle mass

## Specialized Equine Features

### Stay Apparatus
System of tendons and ligaments allowing horses to stand with minimal muscle effort:
- Check ligaments
- Suspensory ligament
- Reciprocal apparatus

### Elastic Energy Storage
- **Tendons**: Store 50% of energy during locomotion
- **Key tendons**: Superficial digital flexor, deep digital flexor
- **Implication**: Muscles show less bulk in distal limbs

## SDF Implementation Guidelines

### Muscle Type → SDF Primitive Mapping
- **Fusiform** (biceps, digital extensors) → sdFusiform
- **Pennate** (deltoid, gluteal) → sdPennate
- **Sheet** (longissimus, abdominis) → sdSheetMuscle
- **Complex** (triceps, hamstrings) → sdComplexMuscle

### Deformation Parameters
```typescript
interface MuscleDeformation {
  stretch: number;    // 0-1, length change
  compression: number; // 0-1, volume change
  bulge: number;      // 0-1, perpendicular expansion
  twist: number;       // -1 to 1, rotation
}
```

### Force Calculation Points
1. **Origin**: Always on more proximal bone
2. **Insertion**: Always on more distal bone
3. **Via points**: For muscles with path changes
4. **Line of action**: Straight line between points

## References

- "Clinical Anatomy of the Horse" - Hilary M. Clayton
- "Equine Locomotion" - Hilary M. Clayton & William H. McGreevy
- "The Anatomy of the Horse" - George H. Goodfellow