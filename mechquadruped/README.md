# Mechanical Erect Quadruped & Sprawling Creature Simulator

A sophisticated 3D procedural animation system built with Three.js and React. This project simulates anatomically correct skeletal structures and physics-based locomotion for both Erect (Horse-like) and Sprawling (Lizard-like) quadrupeds.

## Key Features

*   **Procedural Skeleton**: Generates bones, joints, and girdles dynamically based on configuration.
*   **Robust FABRIK IK**: Custom Inverse Kinematics solver with pole vector constraints for realistic limb bending (knees forward, elbows back).
*   **Gait Engine**: Supports Walk and Gallop gaits with correct phase offsets (Lateral vs Rotary sequences).
*   **Physics-Based Animation**:
    *   **Spine Undulation**: Simulates lateral (Lizard) or vertical (Horse) flexibility.
    *   **Tail Dynamics**: Implements drag and wave propagation for natural follow-through.
    *   **Banking & Bobbing**: Body reacts to speed and turning forces.
*   **Modular Architecture**: Switch between different creature types seamlessly via config.

## Architecture

### 1. Services

The core logic is decoupled from the UI (React) and the Rendering (Three.js scene graph).

*   **`Skeleton.ts`**: The factory class. It reads a `CreatureConfig` and builds the Three.js `Group` hierarchy. It constructs `Chains` (Spine, Neck, Legs) and manages the "Rest Pose".
*   **`Chain.ts`**: Represents a linear sequence of bones. Handles the hierarchical attachment of `Bone` objects.
*   **`Bone.ts`**: Wrapper around Three.js meshes. Visualizes the "Bone Shaft" (Cylinder) and "Joint Pivot" (Sphere).
*   **`IKSolver.ts`**: The math engine. Implements the **FABRIK** (Forward And Backward Reaching Inverse Kinematics) algorithm. It solves the joint angles required to place a foot at a target position while respecting anatomical constraints (Pole Vectors).
*   **`Locomotion.ts`**: The brain. It runs the update loop:
    1.  **Physics**: Updates velocity, direction, and world position.
    2.  **Spine/Body**: Procedurally animates the spine wave and body tilt based on speed/turn.
    3.  **Gait Logic**: Calculates foot target positions (World Space) based on the current gait phase (Stance/Swing).
    4.  **IK Dispatch**: Feeds the foot targets and calculated pole vectors to the IK Solvers.
*   **`CreatureConfig.ts`**: The data source. Defines the blueprint for "Horse", "Lizard", etc.

### 2. Components

*   **`Scene.tsx`**: The React entry point.
    *   Initializes the Three.js scene, camera, and lights.
    *   Instantiates `Skeleton` and `Locomotion`.
    *   Handles User Input (WASD) and UI State (Creature/Gait toggles).
    *   Runs the `requestAnimationFrame` loop.

## Configuration System (`CreatureConfig.ts`)

The system is designed to be data-driven. You can create entirely new creatures by adding a config object.

### Config Structure

```typescript
export interface CreatureConfig {
  name: string; // Display name
  
  skeleton: {
    baseHeight: number; // Height of hips from ground
    spineLengths: number[]; // Array of bone lengths
    girdle: {
        width: number; // Width of shoulders/hips
        yOffsetFront: number; // Height of shoulders relative to spine
        // ...
    };
    legs: {
        frontLengths: number[]; // Bone lengths for legs
        hindLengths: number[];
    };
    restPose: {
        tailRootZ: number; // Base angle of tail
        tailSegmentZ: number; // Curvature of tail
        // ...
    };
  };

  locomotion: {
    spine: {
        mode: 'Lateral' | 'Vertical'; // Wiggle side-to-side or up-and-down?
        stiffness: number; // How rigid is the spine?
    };
    legs: {
        style: 'Erect' | 'Sprawling'; // Legs under body or to the side?
    };
    gaits: {
        Walk: GaitConfig;
        Gallop: GaitConfig;
    };
  };
}

```


## Adding a New Creature
* 1. Open services/CreatureConfig.ts.
* 2. Duplicate HORSE_CONFIG or LIZARD_CONFIG.
* 3. Modify the parameters (e.g., change spineLengths for a longer body, adjust girdle.width for a wider stance).
* 4. Export the new constant (e.g., DOG_CONFIG).
* 5. Import it in components/Scene.tsx and add a button to the UI state setter.

## Controls
- W / S: Move Forward / Backward.
- A / D: Turn Left / Right.

## UI Panel:
- Creature Type: Switch between Horse and Lizard.
- Enable IK: Toggle the physics engine on/off.
- Gait Type: Switch between Walk and Gallop.
- Treadmill Mode: Keeps the creature at (0,0,0) while the feet move relative to it (great for inspecting gait cycles).

## Key Biomechanical Concepts Implemented
- Pole Vectors:
  - Erect (Horse): Knees point forward, Elbows point backward.
  - Sprawling (Lizard): Knees and Elbows point Outwards and Upwards.

- Girdles:
  - Shoulders and Hips are implemented as horizontal "struts" (Girdle Chains) connecting the spine to the legs. This prevents the "monorail" look where legs attach directly to the center of the spine.

- Tail Drag:
  - The tail uses a physics-based drag simulation combined with a damped sine wave to create natural follow-through motion that reacts to turns.


  