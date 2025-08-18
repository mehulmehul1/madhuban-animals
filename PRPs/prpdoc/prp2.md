#  **PRP 2: Skeleton Editing Functionality**

## Goal

Implement the Skeleton Editing Functionality in the Madhuban-Animals Creature Editor, enabling interactive chain, bone, and joint edits, template selection, and IK test mode, building directly on PRP1's EditorMode class, toggle logic in sketch.js, and UI foundations (sidebar/toolbar).

## Why

To empower creature designers with visual tools for customizing skeletons, creating hybrids, and testing poses, forming the core of the editor's building capabilities. This extends PRP1's setup by adding the first interactive layer, ensuring users can start from templates and iterate without code, while maintaining anatomical realism via FORCE-inspired visualization.

### Success Criteria

- [ ] Template selection loads pre-configured skeletons (e.g., horse chains) into canvas with color-coded visualization.
- [ ] Chain/bone/joint selection and edits (add/remove, drag-resize) update live without breaking IK.
- [ ] Template palette allows drag-replace/add chains with auto-snap to attachments.
- [ ] IK Test Mode enables end effector dragging with real-time solving and visual feedback (e.g., chain updates, constraint highlights).
- [ ] All edits preserve compatibility with ModularCreatureBuilder (e.g., live chainConfigs updates) and FIK.js (no solver errors).

## What

Interactive skeleton editing in EditorMode:
- Template selection via palette/modal, loading into static pose.
- Click/drag selection for chains/bones/joints with sidebar property edits.
- Tools for add/remove/replace chains/bones, with FORCE line visualization (directional/gesture arcs).
- IK Test Mode for dragging end effectors, mimicking Full-IK demo's 2D view (real-time chain solving, joint highlights).
- Previews tie to Madhubani vision (skeleton as gesture base for later styling).

## All Needed Context

### Documentation & References

- **Codebase Snippets**:
  - From `creature-builder.js` (for chain integration):
    ```javascript
    // MODULAR CHAIN CONFIGURATION SYSTEM
    createChainConfig(params) {
        return {
            role: params.role,
            type: params.type, // 'spine', 'leg', 'fin', 'neck', 'head'
            attachment: params.attachment, // 'free', 'body', 'parent'
            targetMode: params.targetMode, // 'mouse', 'foot', 'calculated', 'parent-relative'
            parentRole: params.parentRole || null,
            attachmentPoint: params.attachmentPoint || 'end', // 'start', 'end', 'middle', 'bone-index'
            attachmentIndex: params.attachmentIndex || 0,
            color: params.color || [100, 150, 255],
            constraints: params.constraints || { clockwise: 45, anticlockwise: 45 },
            bones: params.bones || [],
            // New modular properties
            locomotionRole: params.locomotionRole || null, // How this chain participates in locomotion
            footIndex: params.footIndex,
            constraintTemplate: params.constraintTemplate || 'default',
            behaviorController: params.behaviorController || null,
            shapeProfile: params.shapeProfile || null,
            scale: params.scale || 1.0
        };
    }

    addChain(config) {
        const chain = new FIK.Chain2D(this.rgbToHex(config.color));
        // ... (bone creation and addition logic)
        this.chains.push(chain);
        this.chainConfigs.push(config);
    }
    ```
    Why: Editor will extend createChainConfig/addChain for live edits (e.g., update params, rebuild chain); chainConfigs as central data for selection/properties.

  - From `bone-template-system.js` (for template loading):
    ```javascript
    // Assuming from codebase structure - generateBones method
    generateBones(template, length, options) {
        // ... logic to create bone array from template (e.g., 'horse-leg')
        return bones; // Array of bone objects
    }
    ```
    Why: Use for template palette—load predefined bone sets; integrate with drag-replace to swap chains.

- **FORCE Book Key Concepts on Gesture/Directional Lines for Chain Visualization**:
  - "Directional FORCE" (Preface, pp. xvii-xix): Single curved lines for energy flow—one idea per line; visualize chains as FORCE arcs (e.g., spine as primary gesture).
  - "Gesture Breakdowns" (pp. 3-6): Decompose into lines/rhythms for anatomy (human-to-animal); editor overlays directional lines on chains for visualization.
  - Why: Chains represent gesture—color-code/edit with FORCE lines to guide users toward simplified, rhythmic skeletons as base for Madhubani (e.g., flowing curves in fish images).

- **Madhubani Image Refs for Skeleton as Base Gesture**:
  - Spiraling fish: Curved spine gesture as base for segmented patterns—skeleton edits should preview as flowing lines.
  - Running monkey: Limb chains as directional rhythms—IK test drags to match dynamic poses.
  - Crane family: Long leg/neck chains for gesture—template selection starts with these as base.
  - Why: Skeleton as "gesture foundation" for later styling; ensures edits align with artistic, anatomical flow in refs.

- **Researched p5.js Drag-Resize/Select Examples** (from web search 'p5.js drag and drop interactive editor GitHub'):
  - GitHub processing/p5.js-web-editor (https://github.com/processing/p5.js-web-editor): Supports drag/drop for file UI; snippet: Use `mouseDragged()` for interactive resize, e.g., `function mouseDragged() { if (selected) { bone.length += mouseX - pmouseX; } }` for bone length.
  - GitHub L05/p5.touchgui (https://github.com/L05/p5.touchgui): Touch/drag for GUI elements like select/resize; snippet: `gui.addSlider('boneLength', 10, 100).onChange(updateBone);` for property edits, with drag handles.
  - GitHub AlttiRi/drag-select-demo (https://github.com/AlttiRi/drag-select-demo): JS drag-select for objects; snippet: `let dragStart; function mousePressed() { dragStart = mouseX; } function mouseReleased() { if (dragStart) selectChainsInBox(dragStart, mouseX); }` for multi-chain selection.
  - Why: Adapt for bone/chain manipulation—drag-resize bones, select for sidebar.

- **Full-IK Demo Research** (from https://lo-th.github.io/fullik/):
  - Implementation: JS library with 2D/3D IK solvers; demo uses canvas/WebGL for views. End effectors dragged via mouse (onClick select, drag moves target); real-time solve with `ik.solve(target)`. Visuals: Chains as lines, joints circles (color feedback on reach—green in range, red out); 2D view like p5.js (orthographic, simple render loop).
  - Key Snippets/Concepts: Class `Chain` with `addBone(length, angle)`; drag: `onMouseDown(selectEffector); onMouseMove(updateTarget(mousePos));` solver iterates constraints. For p5.js/FIK.js: Mirror by extending FIK.Chain2D with drag handler, visual confirm (draw target circle, line to end).
  - Why: IK test mode: Drag end like demo (select chain, move effector, see chain update with highlights).

### Known Gotchas
- CRITICAL: Live chainConfigs updates—rebuild chains on edit without full clearCreature() to avoid state loss.
- CRITICAL: FIK.js solving in drag—throttle to 30fps; handle out-of-reach (visual red highlight per demo).
- CRITICAL: Template load—ensure bone-template-system.js compatibility; validate attachments post-replace.
- AVOID: Clutter in canvas—use FORCE simplification (minimal overlays); limit to one selected chain.

## Implementation Blueprint

1. Research/Setup: Build on PRP1—assume EditorMode exists with toggle/UI; extend for skeleton layer.

2. Template Selection (Supports Phase 1 stories):
   - In EditorMode constructor: Add `this.templates = loadJSON('creature-templates.json');` for predefined (e.g., 'horse').
   - Toolbar: 'New Creature' button → Modal (p5 createSelect) lists templates; onSelect: `builder.buildFromTemplate(selected); this.renderSkeleton();`.
   - Pseudocode: `buildFromTemplate(type) { const config = templates[type]; config.chains.forEach(addChain); }`.

3. Chain/Bone/Joint Edits (Phase 2 stories):
   - Selection: In EditorMode.update: `if (mousePressed) { this.selectedChain = getChainAt(mouseX, mouseY); sidebar.updateParams(selectedChain); }` (raycast on bone positions).
   - Sidebar Edits: Use p5 createSlider/createSelect for params (e.g., 'length' slider → `bone.length = value; builder.rebuildChain();`).
   - Drag-Resize: From researched snippets—`mouseDragged() { if (selectedBone) { selectedBone.length += mouseX - pmouseX; } }`.
   - Add/Remove/Replace: Toolbar +/− for bones; palette drag (touchgui-inspired): `mouseReleased() { if (draggedTemplate) snapToAttachment(mousePos); builder.addChain(newConfig); }`.

4. IK Test Mode:
   - Toggle 'I': `this.ikTest = !this.ikTest; if (ikTest) selectEndEffector();`.
   - Drag: Like Full-IK—`mouseDragged() { if (selectedEffector) { chain.solveForTarget(new V2(mouseX, mouseY)); drawFeedback(chain); } }` (green line if in range, red if not).
   - Visual: Draw chains as lines, joints circles; highlight on drag.

5. Integration: Update builder.chainConfigs live; call builder.updateChains() on edits.

## Validation Loop

### Level 1: Syntax & Style
- ESLint: `eslint skeleton-editor.js` (fix issues).
- Console: No errors on load/select/drag.

### Level 2: Unit Tests
- Template load: Select 'horse'—verify  chains.length == expected (e.g., 7 for body+neck+legs+tail).
- Drag-resize: Simulate drag on bone—check length delta <1px error; no IK break (chain.solveForTarget succeeds).
- IK Test: Drag effector—verify position updates, feedback shows (console/frameRate >50).

### Level 3: Integration Test
- Load template, edit chain (e.g., add bone), preview locomotion—no crashes; toggle out/in preserves edits.
- Hybrid: Replace leg with 'crane-leg'—verify locomotion role updates, gaits compatible.