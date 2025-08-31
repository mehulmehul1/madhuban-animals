# Project Madhuban: Consolidated Technical Architecture

## 1. Overview

This document outlines the technical architecture for the consolidated Madhuban project. The goal is to merge the robust Inverse Kinematics (IK) and procedural animation system from `madhuban-animals` with the sophisticated Madhubani-style theming and decoration engine from `madhuban-dayone`.

The core principle is to use the `madhuban-animals` codebase as the foundational framework for creature generation and animation, and to integrate the styling components from `madhuban-dayone` as the rendering and decoration layer.

## 2. Core Systems

The consolidated project will be built around the following core systems:

### 2.1. `FIK.js` (Forward/Inverse Kinematics)

*   **Source:** `madhuban-animals`
*   **Role:** This library remains the heart of the project, responsible for all IK calculations. It takes a chain of bones and a target, and it solves for the positions of the bones.

### 2.2. `ModularCreatureBuilder.js`

*   **Source:** `madhuban-animals`
*   **Role:** This is the primary interface for creating, configuring, and managing creatures. It will be extended to handle not just the skeleton, but also the styling and decoration of each creature.

### 2.3. `ThemeManager.js`

*   **Source:** `madhuban-dayone`
*   **Role:** This system will be integrated to manage all visual aspects of the creatures. It will control colors, stroke weights, filler patterns, border styles, and more.

### 2.4. Decoration Components (`BorderDecorator.js`, `Filler.js`, `Segmenter.js`)

*   **Source:** `madhuban-dayone`
*   **Role:** These components will be used to apply the Madhubani-style decorations to the creature shapes.

## 3. The Integration: From Bones to Art

The key to the successful integration of these two systems is the "bridge" between the raw output of the IK solver and the input required by the decoration components. This bridge will be a new module responsible for generating a renderable shape from a chain of bones.

### 3.1. The "Shape Generation" Bridge

For each chain of bones in a creature's skeleton, we will perform the following steps during the `draw` cycle:

1.  **Get Bone Positions:** After the `FIK.js` solver has run, we will have the start and end positions of each bone in the chain.
2.  **Generate Outline:** We will use a "width profile" to generate a smooth outline around the chain of bones. This width profile will be a function that defines the thickness of the shape at any point along the chain. This will allow us to create a variety of organic shapes, from slender limbs to thick bodies.
3.  **Apply Decorations:** The generated outline (a path of p5.Vector points) will then be passed to the decoration components:
    *   The `Segmenter` will divide the shape into sections.
    *   The `Filler` will apply themed patterns to each section.
    *   The `BorderDecorator` will add borders and beads to the outline.
4.  **Themed Rendering:** The `ThemeManager` will provide the colors and styles for all decorations.

## 4. Data Flow

The data flow for a single frame will be as follows:

1.  **Input:** The user provides input (e.g., mouse position) which defines the target for the IK system.
2.  **IK Solve:** The `ModularCreatureBuilder` updates the IK chains and the `FIK.js` solver calculates the new positions of all bones in the skeleton.
3.  **Shape Generation:** For each chain of bones, the "Shape Generation" bridge creates a procedural outline.
4.  **Decoration:** The decoration components (`Segmenter`, `Filler`, `BorderDecorator`) are applied to the outline.
5.  **Rendering:** The final, styled shape is drawn to the canvas, with all colors and styles provided by the `ThemeManager`.

## 5. Project Structure (Proposed)

The `madhuban-animals` project structure will be adapted to include the new components:

```
/
├─── locomotion/
├─── systems/
│    ├─── chain.js
│    └─── skeleton.js
├─── styling/
│    ├─── ThemeManager.js
│    ├─── BorderDecorator.js
│    ├─── Filler.js
│    └─── Segmenter.js
├─── creature-builder.js
├─── FIK.js
├─── sketch.js
└─── index.html
```

This structure maintains the separation of concerns between the IK/animation systems and the styling/decoration systems.
