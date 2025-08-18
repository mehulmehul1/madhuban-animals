# PRP 1: Core Editor Setup and Mode Toggling**

Using the prompt above (simulated execution), here's the detailed updated PRP. I've edited the original to weave in the user stories (as subsections under Why/What for relevance) and UX flow (as a dedicated section with diagram). This makes it comprehensive for implementation.

## Goal

Implement the Core Editor Setup and Mode Toggling for the Madhuban-Animals Creature Editor, creating a foundational toggleable mode that integrates with the existing p5.js app and ModularCreatureBuilder, while supporting the full user story flow for creature design.

## Why

To provide a seamless switch between the main animation view and an interactive design mode, enabling users to visually edit creatures (skeleton, muscles, styling) without disrupting the core app. This sets up the infrastructure for all editor layers, ensuring the project shifts from code-driven to creative tool-based development, as outlined in the user stories.

### Success Criteria (Tied to User Stories)

- [ ] Editor mode toggles via key 'E' without errors or lag (<100ms switch), supporting stories like template selection and layer switching.
- [ ] Canvas clears and shows basic UI (sidebar, toolbar) in editor mode, enabling visual edits per phase (e.g., static skeleton load).
- [ ] Existing builder instance persists (e.g., load horse, toggle to editor, edits reflect on toggle back), ensuring compatibility for preview/locomotion stories.
- [ ] No conflicts with FIK.js IK solving or locomotion during mode switches, allowing IK test and preview stories.
- [ ] UX flow validated: Full walkthrough (enter → select template → edit layers → save) matches described sequence without glitches.

### User Stories Integration

The implementation must support these stories grouped by phases:

#### Phase 1: Template Selection and Initial Setup
- As a Creature Designer, I want to toggle into Editor Mode from the main app so that I can switch seamlessly between viewing animated creatures and designing new ones.
- As a Creature Designer, I want a template selection panel (e.g., dropdown or thumbnails) listing base types like Fish/Undulating, Biped (Crane/Bird), Sprawling Quadruped (Lizard), Erect Quadruped (Horse), and Arthropod (Insect) so that I can start with pre-configured skeletons and avoid building from scratch.
- As a Creature Designer, upon selecting a template, I want the canvas to load a static pose of the creature's skeleton (color-coded chains, e.g., spine blue, legs red) with locomotion paused so that I can immediately see and interact with the base structure.
- As a Creature Designer, I want an option to import an existing creature JSON config as a starting point so that I can iterate on saved designs.

#### Phase 2: Skeleton Editing
- As a Creature Designer, I want to click on any chain in the canvas to select it (highlighted outline) and view/edit its properties in a sidebar panel (e.g., attachment type/point, parent role, locomotion role, target mode, constraint template) so that I can customize the skeleton without code.
- As a Creature Designer, with a chain selected, I want tools to add/remove bones (e.g., +/− buttons) and drag-resize individual bone lengths/directions so that I can create variations (e.g., longer horse legs for a bear-like build).
- As a Creature Designer, I want a template palette (draggable icons) to replace a selected chain with another (e.g., swap lizard leg for horse leg) or add new chains by dragging to attachment points (auto-snap to start/end/middle/bone-index) so that I can build hybrids easily.
- As a Creature Designer, I want to select joints (via click) to toggle fixed/free and edit parameters (e.g., rotation limits via sliders) so that I can fine-tune poses and constraints for anatomical realism.
- As a Creature Designer, I want an "IK Test Mode" toggle (key 'I') to drag end effectors (e.g., foot/head) with the mouse, solving IK in real-time and showing constraint feedback (e.g., red highlight if out of range) so that I can verify poses and flexibility without locomotion.
- As a Creature Designer, I want undo/redo buttons for skeleton edits so that I can experiment safely.
- As a Creature Designer, I want a "Preview Locomotion" button to temporarily enable movement (e.g., follow mouse) on the edited skeleton so that I can test how changes affect gaits before saving.

#### Phase 3: Muscle Layer Addition and Editing
- As a Creature Designer, after skeleton setup, I want a "Switch to Muscle Layer" tab/button to overlay editable muscle shapes on the skeleton so that I can add volumetric form without cluttering the view.
- As a Creature Designer, I want to select a bone/chain and add muscle shapes (e.g., via "Add Ellipse/Polygon" button) that auto-snap to anchors (bone ends for joints, center for bulges) so that they attach intuitively and deform with poses.
- As a Creature Designer, with a muscle selected, I want drag handles to transform it (position, scale, rotate) and edit properties (e.g., deform intensity slider for squash/stretch sensitivity) so that I can exaggerate forms (e.g., bulkier shoulders for plantigrade strength).
- As a Creature Designer, I want muscles to auto-deform in IK Test Mode or locomotion preview (e.g., squash on compression, stretch on extension based on bone deltas) so that I can see dynamic rhythms without manual adjustment.
- As a Creature Designer, I want to limit muscles per chain (e.g., 2-4 max) with auto-merge if overlapping to prevent clutter, ensuring simplicity for Madhubani filling later.

#### Phase 4: Skinning and Madhubani Styling
- As a Creature Designer, after muscles, I want a "Switch to Styling Layer" tab to auto-generate the skin hull (dynamic outline transforming with poses) so that I can see the final shape without manual drawing.
- As a Creature Designer, I want the hull to apply FORCE rules (alternate straight/curve segments for balance; thirds proportions) and allow finetuning (e.g., drag Bezier controls) so that outlines feel natural and asymmetric.
- As a Creature Designer, I want to apply borders via `border.js` (select style from dropdown, auto-generate around hull path) so that the creature gets a Madhubani outline instantly.
- As a Creature Designer, I want segmentation tools (via `segmenter.js`) to divide the skin by body parts (auto-detect chains) or bands (horizontal/vertical sliders) so that I can create regions for varied patterns.
- As a Creature Designer, with a segment selected (click/lasso tool), I want to finetune its shape (drag boundaries like vector paths) so that I can customize for artistic flow (e.g., wavy segments on fish spirals).
- As a Creature Designer, for a selected segment, I want to randomize/choose patterns via `filler.js` (e.g., "Randomize" button for cross-hatch/dots/florals; sliders for color/density/element placement) so that I can experiment with Madhubani motifs procedurally.
- As a Creature Designer, I want styling previews to update in real-time during IK drags or locomotion tests so that patterns deform naturally with the hull.

#### Phase 5: Saving, Export, and Compatibility
- As a Creature Designer, I want a "Save as New Creature" button to export the full config (skeleton chains, muscles, styling params) as JSON so that I can reload it in the main app or editor.
- As a Creature Designer, I want the exported JSON to include hull computation params (e.g., FORCE curve settings) so that skin auto-regenerates on load, transforming with poses/locomotion.
- As a Creature Designer, I want exports compatible with existing locomotion (e.g., no changes to chain targets/roles; muscles as visual add-ons) so that saved creatures animate seamlessly in the main view.
- As a Creature Designer, I want optional exports like PNG/SVG of static poses (with styled skin) or animated GIFs (short locomotion loop) so that I can share designs outside the app.

## What

A browser-based editor mode in p5.js that:
- Toggles on/off, pausing locomotion and showing UI elements (sidebar for properties, toolbar for layers/save).
- Integrates with ModularCreatureBuilder for live edits (e.g., chain updates).
- Prepares hooks for layers (skeleton/muscle/styling) with a tab system.
- Ensures FORCE simplification (e.g., minimal UI to avoid clutter) and Madhubani end-vision (e.g., preview styled hulls).
- Follows the overall UX flow: Enter → Select Template → Edit Layers → Preview → Save/Exit, as visualized in the diagram below.

### UX Flow and Walkthrough
The editor is a full-screen p5.js interface with a left sidebar (tools/properties), top toolbar (layers/save), and central canvas. Flow is linear but iterative (switch layers freely). Walkthrough assumes starting from main app.

1. **Enter Editor (Toggle Mode)**:
   - Press 'E' in main app → Canvas clears; sidebar shows "New Creature" button.
   - Benefit: Seamless from viewing (animated horse) to editing.

2. **Select Template**:
   - Click "New Creature" → Modal with thumbnails (fish swirling, crane walking, etc.).
   - Select 'Erect Quadruped (Horse)' → Canvas loads static skeleton pose (chains drawn as lines, joints as circles); sidebar shows chain list.
   - UX: Hover thumbnails for preview animation snippet.

3. **Edit Skeleton**:
   - Click a chain (e.g., 'front-leg-left') → Highlighted; sidebar populates params (e.g., dropdowns/sliders).
   - Drag bone ends to resize; +/− buttons add/remove bones.
   - Drag from palette (e.g., 'fish-tail' icon) to attach new chain (snap glow on valid points).
   - Toggle 'IK Test' → Drag foot; chains solve, showing pose.
   - Add hybrid: Replace leg with 'crane-leg' → Auto-updates locomotion role to 'support'.
   - Preview: Click 'Play Locomotion' → Temp-animates (e.g., trot gait); pause to edit.

4. **Add/Edit Muscles**:
   - Switch tab to 'Muscle Layer' → Overlay semi-transparent shapes on skeleton.
   - Select bone → 'Add Ellipse' → Auto-snaps to center/ends; drag to reposition.
   - Edit: Sliders for scale; in IK Test, watch squash (compress on fold)/stretch (elongate on reach).
   - UX: Visual feedback—muscles pulse on deform; limit warning if >3 per chain.

5. **Skinning and Styling**:
   - Switch to 'Styling Layer' → Auto-hull generates (straight-curve outline around deformed muscles/skeleton).
   - Border: Select style → Applies via `border.js`.
   - Segment: Choose 'bands' (slider divides hull horizontally); or 'body-parts' (auto per chain); lasso tool to reshape (drag path points).
   - Per segment: Click → Sidebar: 'Randomize Filler' (calls `filler.js` procedural gen, e.g., dots in red); edit color/density.
   - Apply Style: Save current segments/fillers as template (JSON array); load on another creature (e.g., apply 'striped-monkey' to horse—randomizes patterns but keeps segments).
   - Preview: Patterns deform with hull in locomotion test.

6. **Save and Export**:
   - Click 'Save as New' → Exports JSON (e.g., {chains: [...], muscles: [...per chain], styling: {segments: [path arrays], fillers: [...]}}).
   - Exit Editor → Main app loads new creature; locomotion uses gait templates (e.g., hybrid legs inherit 'unguligrade' phases).
   - Compatibility: JSON parsed by extended `buildFromJson()`; gaits fallback to part types (e.g., crane-leg on horse uses biped phases for that limb).

**High-Level Flow Visualization** (Text Diagram):
```
[Enter Editor] → Select Template (e.g., Horse) → Canvas: Static Skeleton Pose
  ↓ (Edit Skeleton: Add/Drag Chains/Bones → IK Test Drag)
  ↓ Switch to Muscle: Add/Snap Shapes → Transform/Deform Preview
  ↓ Switch to Styling: Auto-Hull → Segment (Body/Bands/Lasso) → Fill/Randomize Patterns
  ↓ Preview Locomotion (Deforms All Layers)
  ↓ Save JSON → Exit Editor → Load in Main App (Animates with Locomotion)
```

**Edge Cases/UX Polish**:
- Validation: Warn on invalid (e.g., unattached chain); auto-fix hybrid gaits.
- Undo: Stack for all layers.
- Exports: JSON for app; PNG/SVG for static styled pose; GIF for animated loop.

## All Needed Context

### Documentation & References

- **Codebase Snippets**:
  - From `creature-builder.js` (core integration point):
    ```javascript
    class ModularCreatureBuilder {
        constructor() {
            // ... existing systems (locomotion, debug, etc.)
            this.renderMode = 'current'; // Existing mode system to extend for editor
        }
        update() {
            // Existing update loop - editor will hook here to pause locomotion if active
            if (this.activeLocomotion) {
                this.activeLocomotion.update(this, 1/60);
            }
            this.updateChains();
            this.debugManager.update(this);
        }
        draw() {
            // Existing draw - editor will override or extend for layers
            switch(this.renderMode) {
                case 'skeleton': this.drawSkeleton(); break;
                // ... other modes
            }
            this.debugManager.draw(this);
        }
    }
    ```
    Why: Extend constructor for editor state (e.g., `this.editorActive = false`); hook update/draw for mode-specific logic.

  - From `sketch.js` (p5 loop for toggle):
    ```javascript
    function setup() {
        createCanvas(800, 600);
        builder = new ModularCreatureBuilder();
        builder.buildHorse(); // Example load
    }
    function draw() {
        builder.update();
        builder.draw();
    }
    function keyPressed() {
        // Existing switches - add 'E' for editor toggle
        switch(key) {
            case '3': builder.buildHorse(); break;
            // ...
        }
    }
    ```
    Why: Add `if (editorActive) { editor.render(); }` in draw; handle 'E' in keyPressed to toggle.

- **FORCE Book Key Concepts on Simplification**:
  - "One idea per line" (Preface, pp. xiv-xv): Avoid clutter—editor UI should focus on one layer at a time, minimal controls.
  - "Straight-to-curve for asymmetry" (pp. xxi-xxiii): Hull/skin generation will use this; editor previews should highlight to prevent symmetric edits.
  - Why: Ensures editor designs stay elegant, aligning with Madhubani's bold, uncluttered patterns.

- **Madhubani Image Refs for End-Vision**:
  - Running monkey: Segmented striped body, patterned mane—editor should preview dynamic hulls with fills deforming like this.
  - Spiraling fish: Curved segments with dots/scales—styling layer must support procedural randomization for similar motifs.
  - Crane family: Layered feathers in thirds—use for hull proportion previews.
  - Why: Guides UI to show styled previews, ensuring final output matches these stylized, anatomically correct 2D animals.

- **Researched p5.js Editor UI Examples** (from web search 'p5.js canvas editor examples GitHub'):
  - GitHub processing/p5.js-web-editor (https://github.com/processing/p5.js-web-editor): Official editor with split view (code left, canvas right, console below). Snippet: Uses `createDiv` for panels; toggle via buttons. Adapt for sidebar: `let sidebar = createDiv(); sidebar.position(0,0); sidebar.style('width:200px');`.
  - GitHub L05/p5.touchgui (https://github.com/L05/p5.touchgui): Multi-touch GUI for drag/select; snippet: Handle `mouseDragged()` for interactive elements like chain selection.
  - GitHub AlttiRi/drag-select-demo (https://github.com/AlttiRi/drag-select-demo): Simple JS drag-select; snippet: `function mouseDragged() { // calculate bounding box for selection }` for bone/chain picking.
  - Why: These show lightweight UI (no external libs); use for drag-select/snaps in editor.

### Known Gotchas
- CRITICAL: p5.js canvas resize on toggle—use `resizeCanvas()` to avoid glitches.
- CRITICAL: FIK.js performance—limit IK solves in editor to 30fps; profile with console.time.
- CRITICAL: State persistence—serialize builder configs on toggle to prevent loss.
- AVOID: Overloading draw()—use conditional branches for modes to maintain 60fps.
- UX-Specific: Ensure sidebar doesn't obscure canvas (position fixed); handle mobile (touch for drag) if extended.

## Implementation Blueprint

1. Research/Setup: Clone repo if needed; ensure p5.js/FIK.js loaded. Use researched examples for UI (e.g., createDiv from p5.js-web-editor).

2. Extend sketch.js for Toggle (Supports Phase 1 stories):
   - Add global `let editorActive = false; let editor = new EditorMode(builder);`.
   - In keyPressed: `if (key === 'E') { editorActive = !editorActive; if (editorActive) builder.activeLocomotion = null; // Pause for static pose }`.
   - In draw: `if (editorActive) { editor.update(); editor.draw(); } else { builder.update(); builder.draw(); }`.
   - Pseudocode: Handle template select modal on first enter (user story: dropdown/thumbnails).

3. Create EditorMode class in new editor-mode.js (Core for all phases):
   - Constructor: `this.builder = builder; this.currentLayer = 'skeleton'; this.ui = {sidebar: createDiv(), toolbar: createDiv()}; // Setup panels`.
   - Build UI: Toolbar buttons ('Skeleton/Muscle/Styling/Save') with `createButton()`; sidebar for params (dynamic via user stories, e.g., chain list).
   - Update: Process inputs (mouse for drag/select per layer; key for toggles like 'I' for IK).
   - Draw: Background grid; call builder.drawSkeleton(); overlay UI; conditional per layer (placeholders for muscle/styling).

4. Integrate User Stories/UX: 
   - Template load: On 'New Creature', show modal (p5 createSelect with options); call builder.buildFromTemplate(selected).
   - Flow Hooks: Toolbar tabs switch `currentLayer`; preview button temp-enables locomotion.
   - Ensure FORCE simp: Minimal UI (hide non-active panels).

5. Compatibility: In builder, add `pauseForEditor()`/`resume()` for locomotion; extend configs for layers.

## Validation Loop

### Level 1: Syntax & Style
- Run ESLint on new files: `eslint editor-mode.js` (fix any issues).
- Browser console: No errors on load/toggle.

### Level 2: Unit Tests
- p5.js setup test: Open index.html; press 'E'—verify sidebar/toolbar appear, canvas shows skeleton (per user story).
- Toggle test: Press 'E' twice—back to main mode, horse animates (console: no lag if frameRate >50).
- UX Flow Test: Follow walkthrough—select template, see static pose; switch layers (placeholders OK).

### Level 3: Integration Test
- Load horse, toggle editor, select chain (sidebar populates), toggle back—verify persistence.
- Performance: Browser profiler—toggle <100ms, no leaks; test with IK drag (from researched snippets).
- Story Coverage: Manual check Phase 1 stories (e.g., import JSON via button—simulate load).