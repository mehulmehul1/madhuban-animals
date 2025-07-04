# Product Requirements Document: Project Madhuban MVP

**Version:** 2.1 (Advanced Creature Animation Integration)
**Date:** 2025-07-02

## 1. Introduction & Vision

This document outlines the product requirements for the Minimum Viable Product (MVP) of **Project Madhuban**. The MVP now includes a robust, modular, and executable system for generating procedurally animated animals and foliage with intricate Madhubani-style decorations, and a flexible, extensible skeleton/animation system.

The goal of the MVP is to create a single application that showcases four distinct, anatomically correct, procedurally animated, and fully decorated creatures: a **Fish**, a **Crane** (bipedal), a **Horse** (erect quadruped), and a **Lizard** (sprawling quadruped). The user will be able to switch between these creatures at runtime, demonstrating the power and flexibility of the underlying engine.

The core of the MVP is to build a system that can:
1.  Generate procedural shapes for animals and foliage.
2.  Decorate these shapes with complex, multi-layered borders and patterns.
3.  Segment the shapes into distinct areas, each with its own styling.
4.  Place these decorated elements within a simple scene.
5.  Manage all styling and composition through a flexible and theme-based system.
6.  **[UPDATED]** Support multi-chain, hierarchical skeletons for creatures, with each part (spine, fins, tail, etc.) as a separate IK chain, each with its own width profile and animation logic, adhering to biomechanically plausible joint constraints and proportions.
7.  **[UPDATED]** Animate all parts of a creature in a physically plausible, hierarchical way (e.g., fins and tail follow the body, follow-through effects), driven by procedural gait controllers and foot placement systems.
8.  **[UPDATED]** Allow for easy extension to arbitrary creatures and recursive skeletons in the future, leveraging a data-driven approach for anatomical and locomotion parameters.

This MVP will lay the foundation for the full vision of Project Madhuban, which includes advanced semantic storytelling.

## 2. Core MVP Modules

### 2.1. Procedural Shape Generation (`PathEngine`)

*   **Requirement:** The system must leverage the existing `FIK.js` (`fullik`) library to drive a procedural animation engine. The focus is on building a sophisticated control layer on top of this library to produce anatomically correct and biomechanically plausible creature movement.

*   **Details:**
    *   **`FIK.js` Integration:** The system will use `FIK.Structure3D` and `FIK.Chain3D` as the foundational components for all skeletal definitions and IK solving.
    *   **`ConstraintManager` & Profiles:** A data-driven `ConstraintManager` will apply anatomically correct joint limits to the `FIK.js` chains. These limits (e.g., cone constraints for ball-and-socket joints, rotor constraints for hinges) will be defined in swappable `ConstraintProfile` assets for different creature types, based on the principles in the `Advanced Creature Animation Systems` guide and the detailed anatomical research (see Section 5).
    *   **`GaitController`:** A high-level state machine will manage procedural locomotion. It will control gait patterns (e.g., walk, trot), footfall timing, and phase relationships between limbs to generate realistic movement cycles, incorporating Froude number scaling for realistic gait transitions.
    *   **`FootPlacement` System:** An algorithm will manage the swing and stance phases of each foot, calculating step targets and using sinusoidal trajectories for the swing arc to create natural-looking steps. This system will be robust enough to handle various terrains and maintain center of mass stability.
    *   **Multi-Chain Skeletons:** The system now supports multiple named IK chains (e.g., 'body', 'tailFin', 'pectoralFin'), each with its own width profile and animation logic. Chains can be hierarchically animated, with parent chains influencing the base and motion of child chains (e.g., fins follow the animated body).
    *   **Recursive Skeletons:** The architecture is being extended to support fully recursive, tree-based skeletons, enabling arbitrary creatures with complex, branching structures (not just linear chains).
    *   **Parameterization:** Chain properties (segment counts, lengths, widths) are being parameterized relative to parent or global proportions, allowing for flexible and reusable creature templates.
    *   **Robust Leg Animation:** The system must include robust, physically plausible foot planting and stepping logic for creatures with legs (e.g., lizard), using FABRIK or similar IK methods. The logic must be adaptable to the recursive skeleton system.
    *   **MVP Focus:** For the MVP, the animation system will be used to animate four distinct creatures (Fish, Crane, Horse, Lizard), each with its own unique skeleton, constraints, and locomotion model. This will demonstrate the engine's data-driven, general-purpose nature.

### 2.2. Procedural Animation System (FABRIK-based)

*   **Requirement:** The system must leverage the existing `FIK.js` (`fullik`) library to drive a procedural animation engine. The focus is on building a sophisticated control layer on top of this library to produce anatomically correct and biomechanically plausible creature movement.
*   **Details:**
    *   **`FIK.js` Integration:** The system will use `FIK.Structure3D` and `FIK.Chain3D` as the foundational components for all skeletal definitions and IK solving.
    *   **`ConstraintManager` & Profiles:** A data-driven `ConstraintManager` will apply anatomically correct joint limits to the `FIK.js` chains. These limits (e.g., cone constraints for ball-and-socket joints, rotor constraints for hinges) will be defined in swappable `ConstraintProfile` assets for different creature types, based on the principles in the `Advanced Creature Animation Systems` guide and the detailed anatomical research (see Section 5).
    *   **`GaitController`:** A high-level state machine will manage procedural locomotion. It will control gait patterns (e.g., walk, trot), footfall timing, and phase relationships between limbs to generate realistic movement cycles, incorporating Froude number scaling for realistic gait transitions.
    *   **`FootPlacement` System:** An algorithm will manage the swing and stance phases of each foot, calculating step targets and using sinusoidal trajectories for the swing arc to create natural-looking steps. This system will be robust enough to handle various terrains and maintain center of mass stability.
    *   **Multi-Chain Skeletons:** The system now supports multiple named IK chains (e.g., 'body', 'tailFin', 'pectoralFin'), each with its own width profile and animation logic. Chains can be hierarchically animated, with parent chains influencing the base and motion of child chains (e.g., fins follow the animated body).
    *   **Recursive Skeletons:** The architecture is being extended to support fully recursive, tree-based skeletons, enabling arbitrary creatures with complex, branching structures (not just linear chains).
    *   **Parameterization:** Chain properties (segment counts, lengths, widths) are being parameterized relative to parent or global proportions, allowing for flexible and reusable creature templates.
    *   **Robust Leg Animation:** The system must include robust, physically plausible foot planting and stepping logic for creatures with legs (e.g., lizard), using FABRIK or similar IK methods. The logic must be adaptable to the recursive skeleton system.
    *   **MVP Focus:** For the MVP, the animation system will be used to animate four distinct creatures (Fish, Crane, Horse, Lizard), each with its own unique skeleton, constraints, and locomotion model. This will demonstrate the engine's data-driven, general-purpose nature.

### 2.3. Shape Segmentation (`Segmenter`)

*   **Requirement:** Any generated shape must be divisible into multiple, distinct segments, each of which can be styled independently.
*   **Details:**
    *   **Segmentation Algorithm:** A `Segmenter` module will take a shape's path and divide it into a specified number of bands or segments. The width of these segments can be uniform or variable.
    *   **Separators:** The lines separating segments can be made visible or invisible, with customizable stroke styles.
    *   **Output:** The `Segmenter` will output a collection of sub-paths, each representing a segment of the original shape.

### 2.4. Decoration System

The decoration system is composed of two main parts: `BorderDecorator` and `Filler`.

#### 2.4.1. `BorderDecorator`

*   **Requirement:** The system must be able to apply complex, multi-layered borders to any given path (either the main shape outline or the segment separators).
*   **Details:**
    *   **Multi-Line Borders:** The `BorderDecorator` will be able to draw multiple parallel lines with controllable `stroke_width`, `stroke_gap`, and `border_width`.
    *   **Bead System:** A sophisticated bead system will allow for placing decorative elements along the border.
        *   **Bead Shapes:** Beads can be simple geometric shapes (circles, squares) or more complex, pre-defined shapes (e.g., small flowers, leaves).
        *   **Bead Styling:** Each bead can have its own `fill`, `stroke`, `hatch`, and even a `small_border`.
        *   **Bead Placement:** Beads can be placed at regular intervals or in custom patterns.

#### 2.4.2. `Filler`

*   **Requirement:** The system must be able to fill any enclosed area (a shape segment or the area within a border) with a variety of patterns.
*   **Details:**
    *   **Pattern Library:** A library of Madhubani-inspired patterns will be available, including:
        *   Hatching (various angles and densities)
        *   Dots
        *   Circles
        *   Overlapping semi-circles
        *   Small geometric motifs
    *   **`p5.brush.js` Integration:** All filling operations will be performed using `p5.brush.js` to ensure a consistent, hand-drawn aesthetic.

### 2.5. Scene and Composition (`ScenePlacementManager`)

*   **Requirement:** A simple `ScenePlacementManager` will be responsible for placing the procedurally generated and decorated elements onto the canvas.
*   **Details:**
    *   **Placement:** The manager will be able to place elements at specific positions, in simple patterns (e.g., a grid, a circle), or in a simple composition.
    *   **Composition:** For the MVP, the focus will be on composing a single, detailed element or a small group of elements to showcase the decoration system.

### 2.6. Theming and Styling (`ThemeManager`)

*   **Requirement:** All visual properties (colors, patterns, border styles) must be managed by a central `ThemeManager`.
*   **Details:**
    *   **Color Palettes:** The `ThemeManager` will define and apply color palettes. A theme with a set of colors will be able to map those colors to different parts of the artwork (e.g., segment fills, borders, bead colors).
    *   **Style Rules:** The `ThemeManager` will also define rules for how styles are applied. For example, a theme could specify that all fish have a border of a certain width and a specific set of patterns for their segments.

## 3. MVP Execution Plan

The development of the MVP will proceed in the following phases:

1.  **Foundation:**
    *   Set up the basic p5.js sketch.
    *   Implement the `PathEngine` with a single procedural fish shape.

2.  **Animation:**
    *   **[DONE]** Integrate the `FIK.js` library as the core IK solver.
    *   **[DONE]** Create the `IKChain` and `CreatureController` for the fish.
    *   **[IN-PROGRESS]** Implement the `ConstraintManager` and `GaitController` for a quadruped.
    *   **[NEW]** Refactor to multi-chain Creature and hierarchical animation (body, tailFin, pectoralFin, etc.).

3.  **Decoration:**
    *   Implement the `BorderDecorator` with multi-line and basic bead functionality.
    *   Implement the `Filler` with a small set of initial patterns.

4.  **Segmentation:**
    *   Implement the `Segmenter` module to divide the fish shape into bands.
    *   Integrate the `Filler` to apply different patterns to each segment.

5.  **Composition and Theming:**
    *   Implement the `ThemeManager` with a single color palette and basic style rules.
    *   Implement the `ScenePlacementManager` to place a single, fully decorated fish on the canvas.

6.  **Refinement and Expansion:**
    *   Expand the pattern library for the `Filler`.
    *   Enhance the `BeadSystem` with more complex shapes and styling.
    *   Add a simple foliage element to the `PathEngine`.
    *   Refine the `ThemeManager` to handle more complex style mappings.
    *   **Generalize for Arbitrary Creatures:** Complete the recursive skeleton generator and parameterization to support arbitrary, tree-based creatures (not just fish). Ensure all decoration modules work for any skeleton.
    *   **Scene Composition:** Expand the `ScenePlacementManager` to support multiple creatures, foliage, and more complex scene layouts.
    *   **Theme & Pattern Expansion:** Add support for multiple themes, advanced color rules, and a broader set of Madhubani patterns and motifs.
    *   **Future Directions:**
        *   Procedural generation of new creature templates (beyond fish and foliage).
        *   Procedural generation of new creature templates (beyond fish and foliage).
        *   Interactive scene editing and theme switching.
        *   Integration of semantic storytelling and generative scene logic.

## 4. MVP Success Criteria

The MVP will be considered successful when the system can:

*   On command (e.g., pressing keys '1', '2', '3', '4'), generate, animate, and render one of the four target creatures in the center of the canvas.
*   Each creature must be animated using a distinct, anatomically appropriate locomotion model:
    *   **Fish:** Serpentine, 


 "knee" (actually the ankle) joint positioned high.
    *   **Spine/Torso:** Compact, providing a stable base for leg attachment and head/neck movement.
    *   **Neck:** Long and flexible, composed of multiple small segments, allowing for a wide range of head movements.
    *   **Wings:** Present in a folded, resting pose. If flight is considered in future iterations, a multi-bone hierarchy for wing folding and flapping would be required.
*   **Joint Constraints:**
    *   **Hip (Ball-and-Socket):** Allows forward/backward swing and some lateral movement, with constraints to prevent unnatural poses.
    *   **Knee (Hinge):** Primarily flexion in one direction.
    *   **Ankle (Hinge):** Between tibiotarsus and tarsometatarsus, allowing flexion.
    *   **Neck Segments:** Multiple hinge joints along the neck for graceful curves and head orientation.
*   **Locomotion Pattern (Bipedal Walk):**
    *   **Alternating Leg Gait:** An alternating movement of the two legs, with one in stance phase while the other is in swing phase, prioritizing stability.
    *   **Center of Mass (CoM) Control:** Slight shifts in torso or head position to maintain balance during walking.
    *   **Foot Placement:** Precise foot placement to ensure stability, with the foot landing flat on the ground.

### 5.3. Horse (Erect Quadruped)

*   **Skeletal Structure & Proportions:**
    *   **Legs:** Four strong legs, each with distinct segments:
        *   **Forelimbs:** Scapula, humerus, radius/ulna (forearm), carpus (knee-like joint), metacarpus (cannon bone), and phalanges (hoof).
        *   **Hindlimbs:** Pelvis, femur, tibia/fibula, tarsus (hock), metatarsus, and phalanges.
    *   **Proportions:** Equine-specific proportions will be researched for anatomical accuracy (e.g., cannon bone length relative to forearm/tibia). The guide's human baseline proportions will be adapted as a starting point.
    *   **Spine:** Relatively rigid, with some flexibility for canter/gallop, but primarily acting as a stable base for leg attachment.
    *   **Neck and Head:** Strong neck connecting to the torso, with an independently movable head.
*   **Joint Constraints:**
    *   **Shoulder/Hip (Ball-and-Socket):** Allow for significant forward/backward swing and some abduction/adduction. Constraints will prevent extreme rotations.
    *   **Elbow/Stifle (Hinge):** Primary flexion/extension.
    *   **Knee/Hock (Hinge):** Primary flexion/extension.
    *   **Fetlock/Pastern (Hinge-like):** Allow for shock absorption and slight flexion.
*   **Locomotion Pattern (Erect Quadrupedal Gait):**
    *   **Walk/Trot:** Implementation of four-beat walk and two-beat diagonal trot, adhering to specific phase relationships and duty factors.
    *   **Froude Number Transitions:** Incorporation of Froude number scaling for realistic gait transitions (e.g., walk→trot when Froude > 0.4-0.6).
    *   **Foot Planting:** Robust foot planting logic ensuring realistic hoof landing and lifting, with appropriate ground contact and swing arcs.

### 5.4. Lizard (Sprawling Quadruped)

*   **Skeletal Structure & Proportions:**
    *   **Legs:** Four limbs, typically shorter and more splayed than an erect quadruped. Segments include humerus, radius/ulna, carpus, metacarpals, and phalanges for forelimbs; and femur, tibia/fibula, tarsus, metatarsals, and phalanges for hindlimbs.
    *   **Proportions:** Limb segments will be relatively short compared to body length, resulting in a low-to-the-ground posture.
    *   **Spine:** Highly flexible, contributing significantly to locomotion through lateral undulation. This will be a primary IK chain.
    *   **Tail:** Long, often tapering, capable of undulation and contributing to balance and propulsion.
*   **Joint Constraints:**
    *   **Shoulder/Hip (Ball-and-Socket):** Wide range of motion, particularly for lateral abduction, to accommodate the sprawling posture. Constraints will be set to reflect the typical splayed limb angles.
    *   **Elbow/Knee (Hinge):** Flexion will occur primarily in a horizontal plane, allowing the limbs to push outwards and backwards.
    *   **Spine & Tail:** Multiple hinge joints along the spine and tail for significant lateral flexion and undulation.
*   **Locomotion Pattern (Sprawling Quadrupedal Gait with Lateral Spine Undulation):**
    *   **Lateral Undulation:** Application of a serpentine pattern to the spine and tail, with the limbs acting as pivots or pushing points. The body will snake from side to side, and the limbs will move in coordination with this undulation.
    *   **Alternating Limb Movement:** Limbs will move in an alternating pattern, with primary forward motion driven by the body's lateral thrust.
    *   **Foot Drag/Placement:** Depending on the gait, feet might drag or be lifted minimally, with emphasis on pushing off the ground for propulsion.




### 5.3. Horse (Erect Quadruped)

*   **Skeletal Structure & Proportions:**
    *   **Legs:** Four strong legs, each with distinct segments:
        *   **Forelimbs:** Scapula, humerus, radius/ulna (forearm), carpus (knee-like joint), metacarpus (cannon bone), and phalanges (hoof).
        *   **Hindlimbs:** Pelvis, femur, tibia/fibula, tarsus (hock), metatarsus, and phalanges.
    *   **Proportions:** Equine-specific proportions will be researched for anatomical accuracy (e.g., cannon bone length relative to forearm/tibia). The guide's human baseline proportions will be adapted as a starting point.
    *   **Spine:** Relatively rigid, with some flexibility for canter/gallop, but primarily acting as a stable base for leg attachment.
    *   **Neck and Head:** Strong neck connecting to the torso, with an independently movable head.
*   **Joint Constraints:**
    *   **Shoulder/Hip (Ball-and-Socket):** Allow for significant forward/backward swing and some abduction/adduction. Constraints will prevent extreme rotations.
    *   **Elbow/Stifle (Hinge):** Primary flexion/extension.
    *   **Knee/Hock (Hinge):** Primary flexion/extension.
    *   **Fetlock/Pastern (Hinge-like):** Allow for shock absorption and slight flexion.
*   **Locomotion Pattern (Erect Quadrupedal Gait):**
    *   **Walk/Trot:** Implementation of four-beat walk and two-beat diagonal trot, adhering to specific phase relationships and duty factors.
    *   **Froude Number Transitions:** Incorporation of Froude number scaling for realistic gait transitions (e.g., walk→trot when Froude > 0.4-0.6).
    *   **Foot Planting:** Robust foot planting logic ensuring realistic hoof landing and lifting, with appropriate ground contact and swing arcs.

### 5.4. Lizard (Sprawling Quadruped)

*   **Skeletal Structure & Proportions:**
    *   **Legs:** Four limbs, typically shorter and more splayed than an erect quadruped. Segments include humerus, radius/ulna, carpus, metacarpals, and phalanges for forelimbs; and femur, tibia/fibula, tarsus, metatarsals, and phalanges for hindlimbs.
    *   **Proportions:** Limb segments will be relatively short compared to body length, resulting in a low-to-the-ground posture.
    *   **Spine:** Highly flexible, contributing significantly to locomotion through lateral undulation. This will be a primary IK chain.
    *   **Tail:** Long, often tapering, capable of undulation and contributing to balance and propulsion.
*   **Joint Constraints:**
    *   **Shoulder/Hip (Ball-and-Socket):** Wide range of motion, particularly for lateral abduction, to accommodate the sprawling posture. Constraints will be set to reflect the typical splayed limb angles.
    *   **Elbow/Knee (Hinge):** Flexion will occur primarily in a horizontal plane, allowing the limbs to push outwards and backwards.
    *   **Spine & Tail:** Multiple hinge joints along the spine and tail for significant lateral flexion and undulation.
*   **Locomotion Pattern (Sprawling Quadrupedal Gait with Lateral Spine Undulation):**
    *   **Lateral Undulation:** Application of a serpentine pattern to the spine and tail, with the limbs acting as pivots or pushing points. The body will snake from side to side, and the limbs will move in coordination with this undulation.
    *   **Alternating Limb Movement:** Limbs will move in an alternating pattern, with primary forward motion driven by the body's lateral thrust.
    *   **Foot Drag/Placement:** Depending on the gait, feet might drag or be lifted minimally, with emphasis on pushing off the ground for propulsion.





