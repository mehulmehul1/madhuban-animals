# Madhuban-Animals Creature Editor - Planning PRD

1. Executive Summary  
   The Madhuban-Animals Creature Editor is a toggleable visual design tool integrated into the existing p5.js/FIK.js codebase, enabling users to create, edit, and animate modular 2D creatures inspired by Madhubani art and FORCE drawing principles. It supports template-based skeletons, deformable muscles, FORCE hull skinning, procedural Madhubani styling, hybrid gaits, and JSON exports. Development chains 8 PRPs for phased implementation, targeting production-ready status with high test coverage. Estimated timeline: 4-6 weeks (sequential, 3-5 days/PRP). Key metrics: 90% test coverage, <100ms layer switches, seamless hybrid animation at 60fps, and intuitive UX for creative iteration across layers.

2. Problem & Solution  
   **Problem**: Current codebase is code-driven (hardcoded builds like buildHorse), limiting creative iteration; lacks visual editing for skeletons/muscles/skin, deformable Madhubani styling, and hybrid gaits, making FORCE/Madhubani-inspired designs tedious.  
   **Solution**: Browser editor with layered UX (toggle 'E'; phases: template select → edit skeleton/muscles → hull gen → style/segment → preview/save). Solves via modularity (extend builder), dynamic features (IK deforms with FORCE rhythm), and persistence (JSON with gaits/styles). Aligns with vision: Algorithmic yet artistic tool for rhythmic, patterned creatures, emphasizing FORCE asymmetry/thirds and Madhubani no-empty-space/deformable patterns.

3. User Stories (with diagrams)  
   Stories grouped by phases, with acceptance criteria for validation. Prioritized as MVP (core for basic editing) or Extended (advanced features). These follow the standard format: **As a [user role], I want [feature], so that [benefit]**.

   #### Phase 1: Entering Editor and Template Selection (MVP)
   - **As a Creature Designer**, I want to toggle into Editor Mode from the main animation view (e.g., via key 'E'), so that I can seamlessly switch between previewing animated creatures and designing new ones without losing the current builder state.  
     *Acceptance Criteria*: Mode switches in <100ms; locomotion pauses for static pose; sidebar/toolbar appears with layer tabs; existing creature (e.g., horse) persists on toggle back. No UI glitches; keyboard-accessible toggle.

   - **As a Creature Designer**, I want a template selection panel (thumbnails or dropdown) with base types like Fish (undulating), Biped (crane/bird with erect posture), Sprawling Quadruped (lizard with lateral sway), Erect Quadruped (horse with rigid spine), and Arthropod (insect with segmented limbs), so that I can start with anatomically accurate, FORCE-inspired skeletons pre-configured for rhythm and asymmetry.  
     *Acceptance Criteria*: Thumbnails display color-coded FORCE lines (e.g., spine in blue for S-curve, limbs in red for asymmetry); selecting a template loads it into the editor in <200ms; includes import option for existing JSON configs.

   #### Phase 2: Skeleton Layer Editing (MVP)
   - **As a Creature Designer**, I want to click a skeleton chain on the canvas to select it, so that I can focus on editing a specific part of the creature.  
     *Acceptance Criteria*: Selected chain highlights (e.g., yellow outline); deselection via canvas click; keyboard navigation (Tab cycles chains); updates in <100ms.

   - **As a Creature Designer**, I want to see the selected chain’s properties in a sidebar (e.g., attachment points, rotation limits), so that I can review its current setup.  
     *Acceptance Criteria*: Sidebar shows color-coded bones/joints (e.g., spine blue, legs red); includes constraints (e.g., 0-60° clockwise); updates dynamically on selection.

   - **As a Creature Designer**, I want to adjust the selected chain’s properties (e.g., rotation limits via sliders), so that I can customize its behavior while preserving FORCE rhythm.  
     *Acceptance Criteria*: Real-time preview of changes; FORCE warnings (e.g., "Symmetry detected—add curve?"); undo/redo support; 60fps updates.

   - **As a Creature Designer**, I want to add a bone to a chain when viewing it individually, so that I can extend structures like a crane’s neck.  
     *Acceptance Criteria*: Bone inserts between adjacent joints; maintains IK integrity; warns if chain exceeds limit (e.g., "Max 10 bones"); undo/redo.

   - **As a Creature Designer**, I want to remove a bone from a chain, so that I can simplify structures as needed.  
     *Acceptance Criteria*: Removes selected bone; warns if chain becomes disconnected; undo/redo; updates locomotion role.

   - **As a Creature Designer**, I want to save custom chains as named templates (e.g., ‘crane-neck’), so that I can reuse them in other creatures.  
     *Acceptance Criteria*: Saves to local database; retrievable via template selection; includes FORCE pose preview.

   #### Phase 3: Muscle Layer Editing (MVP)
   - **As a Creature Designer**, I want to switch to the Muscle Layer tab to overlay editable shapes on the skeleton, adding ellipses/polygons that snap to bone anchors (ends for joints, centers for bulges), so that I can add volumetric form following FORCE applied shapes (e.g., compressed ovals for energy storage).  
     *Acceptance Criteria*: Limit 2-4 muscles/chain; auto-merge overlaps; shapes deform in IK previews (squash on compression); FORCE suggestions (e.g., "Add stretch for rhythm?").

   - **As a Creature Designer**, I want drag handles and sliders on selected muscles to transform (position along bone/scale/rotate) and adjust deform intensity, so that I can exaggerate forms like bulkier shoulders for FORCE power curves.  
     *Acceptance Criteria*: Real-time previews; intensity slider (0-100% squash/stretch); maintains attachment during drags; undo/redo.

   #### Phase 4: Skinning Layer and FORCE Hull Generation (Extended)
   - **As a Creature Designer**, I want to switch to the Skinning Layer to auto-generate a dynamic hull outline around skeleton/muscles, applying FORCE rules (alternate straight/curve segments, thirds proportions, asymmetry), so that I can create natural, rhythmic silhouettes without manual drawing.  
     *Acceptance Criteria*: Hull alternates straight and curved Bezier segments; adheres to thirds proportions (e.g., head:body:legs ratio); warns if symmetry exceeds 90% (e.g., 'Adjust for asymmetry?'); deforms smoothly at 60fps in previews.

   #### Phase 5: Styling Layer and Madhubani Application (Extended)
   - **As a Creature Designer**, I want to apply Madhubani borders via dropdown (auto-generate around hull), so that the creature gets bold, folk-art outlines that deform with motion.  
     *Acceptance Criteria*: Styles from `border.js`; previews in IK/locomotion; no breaks on extreme poses.

   - **As a Creature Designer**, I want segmentation tools to divide the hull (auto by body parts or muscle-based skin groups, manual bands/lasso), finetuning shapes via drag, so that I can create regions for varied Madhubani patterns (e.g., wavy fish spirals).  
     *Acceptance Criteria*: Segments from `segmenter.js`; maintains FORCE flow; deforms independently.

   - **As a Creature Designer**, I want to randomize/select patterns per segment via `filler.js` (e.g., dots/cross-hatch/florals; sliders for color/density), so that I can generate Madhubani motifs that fill all space and deform rhythmically.  
     *Acceptance Criteria*: Procedural yet editable; real-time previews; no empty space (auto-fill); saves as reusable templates.

   #### Phase 6: Preview, Save, and Compatibility (MVP)
   - **As a Creature Designer**, I want full-layer previews with locomotion (all elements deform via FORCE/Madhubani rules), so that I can iterate on rhythmic, artistic designs.  
     *Acceptance Criteria*: 60fps; hybrid gaits blend (e.g., lizard sway + horse trot); performance warnings.

   - **As a Creature Designer**, I want to save/export configs as JSON (skeleton + muscles + hull params + styling + gaits), so that creatures load/animate in the main app or editor.  
     *Acceptance Criteria*: Compatible with builder (e.g., `buildFromJson()`); optional PNG/SVG/GIF exports; validates before save (e.g., no unattached chains).

   **User Flow Diagram** (Mermaid):
   ```mermaid
   flowchart TD
       A[Start: Toggle Editor 'E'] --> B[Phase 1: Select Template/Load Config]
       B --> C[Phase 2: Edit Skeleton (Chains/Bones/Joints, IK Test)]
       C --> D[Phase 3: Add/Edit Muscles (Snap/Deform)]
       D --> E[Phase 4: Generate Hull/Skin]
       E --> F[Phase 5: Apply Styling (Segments/Fillers)]
       F --> G[Preview Locomotion/Gaits (Dynamic Deforms)]
       G --> H[Phase 6: Save/Export JSON (Configs/Styles), Exit to Main App]
       H --> I[Animate in Main View]
   ```

4. Technical Architecture (with diagrams)  
   **High-Level Architecture**: p5.js canvas with EditorMode class extending ModularCreatureBuilder; layers modular (SkeletonEditor, MuscleEditor, etc.); FIK.js for IK/gaits; styling via ThemeManager/border/segmenter/filler. The architecture supports layered editing with real-time deformation previews, ensuring FORCE hulls and Madhubani patterns integrate seamlessly into the builder's update/draw loops.

   **Component Diagram** (Mermaid):
   ```mermaid
   graph TD
       A[sketch.js (p5 Loop)] --> B[EditorMode (Toggle/UI: Sidebar/Toolbar/Canvas)]
       B --> C[SkeletonEditor (PRP2: Chains/Bones/Drag/Select/IK Test)]
       B --> D[MuscleEditor (PRP3: Shapes/Deform/Snap/Intensity Sliders)]
       B --> E[SkinningEditor (PRP4: Hull Gen/Bezier Controls/FORCE Rules)]
       B --> F[StylingEditor (PRP5: Border/Segments/Fillers/Randomize)]
       B --> G[GaitAdapter (PRP7: Hybrids/Phases/Blending)]
       B --> H[ConfigSaver (PRP6: JSON Save/Load/Export PNG/GIF)]
       C & D & E --> I[ModularCreatureBuilder (Core Chains/Configs/Deforms)]
       I --> J[FIK.js (IK Solving/Constraints)]
       I --> K[LocomotionSystem (Gaits/Phases/Previews)]
       F --> L[ThemeManager (Patterns/Colors/Deformable Fills)]
   ```

   **Data Flow** (Mermaid):
   ```mermaid
   sequenceDiagram
       User->>EditorMode: Toggle/Edit (Select Chain/Drag Muscle)
       EditorMode->>Builder: Update Chains/Muscles/Hull Params
       Builder->>FIK: Solve IK/Deform Shapes
       Builder->>HullGen: Compute FORCE Outline (Thirds/Asymmetry)
       HullGen->>Styling: Apply Border/Segments/Fillers (Deform Patterns)
       Styling->>Builder: Render Layered (60fps Preview)
       User->>ConfigSaver: Save JSON
       ConfigSaver->>Builder: Export Extended Config (With Gaits/Styles)
   ```

5. API Specifications  
   No external APIs; internal JS methods:  
   - `EditorMode.toggle()`: Bool active; success if UI shows and layers load.  
   - `saveConfig()`: Return JSON {chains: [...extended...], muscles: [...], hullParams: {...}, styling: {...}, gaits: {...}}; example: { "chains": [{role: 'spine', muscles: [...], styling: {...}] }  
   - `loadConfig(json)`: Parse/apply; error if invalid (e.g., missing phases or FORCE params).  
   - `applyGait(template)`: Set phases; response: {success: true, phases: [0,90,...]}.  
   - `generateHull()`: Returns Bezier path with FORCE rules; params: {asymmetryThreshold: 0.75, thirds: [0.33,0.66]}.

6. Data Models  
   **Entity Relationships** (Mermaid ER):
   ```mermaid
   erDiagram
       CreatureConfig ||--o{ ChainConfig : contains
       ChainConfig ||--o{ Bone : has
       ChainConfig ||--o{ Muscle : has
       ChainConfig ||--o{ Styling : has
       Styling ||--o{ Segment : divides
       Segment ||--o{ Filler : applies
       GaitTemplate ||--o{ ChainConfig : mapsTo
       HullParams }|--|| ChainConfig : generatesFrom
       Muscle ||--o{ DeformParams : has
   ```

   **Schema** (JSON Example):
   ```json
   {
     "creatureType": "horse",
     "chains": [
       {
         "role": "spine",
         "bones": [{"length": 25, "direction": {"x":1,"y":0}, "constraints": {"cw":45,"acw":45}}],
         "muscles": [{"type": "ellipse", "anchors": [0,1], "scale": {"x":1,"y":1}, "deformIntensity": 0.7}],
         "styling": {"segments": [[{"x":100,"y":100},...]], "fillers": [{"pattern": "dots", "color": "#FF0000", "density": 0.5}]},
         "hullParams": {"curveIntensity": 0.5, "thirds": [0.33,0.66], "asymmetry": 0.8},
         "gaitRole": "primary"
       }
     ],
     "gaitTemplate": "unguligrade-walk"
   }
   ```

   **State Machine** (Mermaid):
   ```mermaid
   stateDiagram-v2
       [*] --> Idle: Main App
       Idle --> Editing: Toggle 'E'
       Editing --> Skeleton: Layer Switch
       Skeleton --> Muscle: Next Layer
       Muscle --> Skinning: Next
       Skinning --> Styling: Next
       Styling --> Preview: Test Locomotion
       Preview --> Save: Export JSON
       Save --> Idle: Toggle Back
   ```

7. Implementation Phases  
   - **Phase 1 (1 week)**: PRP1 (Core Toggle/UI) + PRP2 (Skeleton Layer)—Foundation with template selection and basic editing. Deps: None.  
   - **Phase 2 (1 week)**: PRP3 (Muscle Layer)—Deformable shapes and snaps. Deps: Phase 1.  
   - **Phase 3 (1 week)**: PRP4 (Skinning Layer)—FORCE hull generation. Deps: Phase 2.  
   - **Phase 4 (1 week)**: PRP5 (Styling Layer)—Madhubani borders/segments/fillers. Deps: Phase 3.  
   - **Phase 5 (1 week)**: PRP6 (Save/Export) + PRP7 (Gaits/Previews)—Persistence and hybrid animation. Deps: Phase 4.  
   - **Phase 6 (1 week)**: PRP8 (Tests/Polish)—Validation, performance, and accessibility. Deps: All. MVP: Phases 1-3 + basic Phase 6.

8. Risks & Mitigations  
   - Risk: IK perf lag in hybrids—Mitigate: Throttle solves (PRP7 tests); optimize for 60fps previews.  
   - Risk: Config bloat on save—Mitigate: Compress JSON and validate size (PRP6).  
   - Risk: Pattern deform artifacts—Mitigate: Regen on frame with FORCE checks (PRP5/PRP8).  
   - Risk: Hybrid gait mismatches—Mitigate: Fallback blending and phase validation (PRP7).  
   - Risk: UI clutter violating FORCE simplicity—Mitigate: Minimalist design with collapsible panels; user testing in PRP8.

9. Success Metrics  
   - Quantitative: 90% test coverage (PRP8); <100ms layer switch; 60fps animation; <200ms template load.  
   - Qualitative: User flow completion (e.g., create hybrid, style, animate in <5min); FORCE/Madhubani fidelity scores (e.g., asymmetry >75% in previews).  
   - Business: Editor enables 10x faster design vs. code; hybrids animate realistically; accessibility compliance (e.g., WCAG AA).

10. Appendices  
   - **Research Summary**: p5.js UI patterns (drag/select from Spine/DragonBones tools); FORCE rhythms for gaits (e.g., thirds in hulls); Madhubani procedural gen examples (e.g., filler.js motifs). Added: Skeletal editor inspirations (Spine UI for canvas/sidebar).  
   - **Dependencies**: p5.js v1.9+, FIK.js (existing); optional: Bezier.js for hulls.  
   - **Assumptions**: Browser-only; no server for exports; keyboard/touch support for accessibility.