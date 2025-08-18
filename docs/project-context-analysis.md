# Project Madhuban – Comprehensive Context Analysis (2025-08-09)

This document consolidates the current state, architecture, key modules, runtime behavior, and active directions across the repository. It is designed as a single point of truth for continuing development and onboarding.

## Vision and Scope

- Blend a procedural IK-driven creature animation engine with Madhubani-style visual decoration.
- Showcase multiple anatomically-plausible creatures (Fish, Crane, Horse, Lizard; Octopus in progress), each with its own skeleton, constraints, and locomotion model.
- Render “skins” over IK chains; segment and decorate shapes with borders, fillers, and themes.
- Provide an in-canvas Editor to author, tweak, and export/import creature configurations.

Primary product references:
- `docs/Project_Madhuban_Architecture.md` – High-level pipeline and bridge from bones→renderable shape→decorations
- `docs/Madhuban_PRD_MVP.md` – MVP requirements across animation, constraints, gait controllers, segmentation, theming
- `docs/Advanced Creature Animation Systems_Complete Implementation Guide.md` – Background guide (curated)
- Ongoing design/dev log: `docs/Madhuban.md`

## How to Run

- No build system. Open `index.html` in a browser (VS Code Live Server recommended). See `AGENT.md` → Build/Test Commands.
- Entry point: `sketch.js` (p5.js setup/draw). All scripts are added via `<script>` tags in `index.html` (order is important; FIK.js first, then systems, styling, locomotion, builder, editor, and finally `sketch.js`).

Keyboard controls (from `sketch.js`):
- Creature: `1` Fish, `2` Crane, `3` Horse, `4` Lizard, `5` Octopus
- Editor: `E` toggle; `I` IK Test Mode (when editor active)
- Render modes: `s` skeleton, `m` muscle, `f` skin, `c` current, `Space` cycle
- Quadruped gaits (Horse/Lizard): `w` Walk, `t` Trot, `g` Gallop, `p` Pace, `x` Toggle auto-gait, `a` Adaptive ground, `q` Simple mode toggle
- Debug: `d`

## High-Level Architecture

- Core IK: `FIK.js` (FullIK) – V2, V3, M3, 2D/3D chains, joints, solvers
- Main controller: `ModularCreatureBuilder` (in `creature-builder.js`) – orchestrates chain creation, templates, constraints, locomotion, draw
- Systems (under `systems/`):
  - Anatomy data/configs: `anatomical-data.js`, `anatomical-configs.js`
  - Bone templates: `bone-template-system.js`, `quadruped-template-system.js`
  - Constraints: `constraint-system.js`
  - Gait catalogue: `gait-system.js`
  - Shape generation and profiles: `shape-generation.js`, `shape-profile-system.js`
  - Debug: `debug-manager.js`
- Locomotion (under `locomotion/`):
  - Registry and base: `locomotion-system.js`, `locomotion-pattern.js`
  - Patterns: `quadruped-gait.js`, `bipedal-walk-pattern.js`, `serpentine-pattern.js`, `undulate-pattern.js`, `octopus-crawl-pattern.js`
- Styling (under `styling/`):
  - `ThemeManager.js`, `border.js`, `filler.js`, `segmenter.js`
- Editor (under `editor/`):
  - `editor-system.js`, `skeleton-editor.js`, `config-manager.js`, `ui-components.js`, `template-selector.js`, `property-panel.js`, `operation-history.js`
- Tests: `/tests` HTML harnesses and utilities (manual-run via browser)

Data flow (from Architecture doc):
1) Input (mouse) → 2) IK solve (chains in `FIK.js`) → 3) Shape generation (outline from chain) → 4) Decoration (segmenter/filler/border via theme) → 5) Render

## Anatomy and Templates

- `systems/anatomical-data.js`
  - Species-specific segment counts, joint constraints, proportions, width profiles, locomotion parameters for Fish, Crane, Horse, Lizard.
  - Utility: `AnatomicalData.getWidthAtPosition(type, part, t)` for width profiles.
- `systems/anatomical-configs.js`
  - Posture-level configs (erect quadruped vs. sprawling); high-level gait defaults; visual profiles; helper `getAnatomicalConfig()`/`getCreatureProperty()`.
  - Includes `ANATOMICAL_PROPORTIONS` for horses and lizards.
- `systems/bone-template-system.js`
  - Templates generating bone arrays per role: fish spine, vertebrate spine/neck/tail, crane leg, horse legs (5 segments incl. hoof), lizard leg, serpentine spine, fin/wing.
  - Integrates `QuadrupedTemplateSystem` for species variants.
- `systems/quadruped-template-system.js`
  - Base templates: `erect-quadruped` and `sprawling-quadruped` with proportions and constraints.
  - Presets: HORSE, LIZARD, plus DEER/COW/DOG examples via modifications.
- `systems/constraint-system.js`
  - Maps anatomical roles to joint profiles (hinge/ball-socket) using `AnatomicalData` constraints.
  - Provides `getAnatomicalConstraints()` for a creature’s role-based joints; hinge/ball-socket helpers.

Implication: New species are assembled as data + template choice + constraints profile → chains built by templates → IK joint limits supplied by `ConstraintSystem`.

## Locomotion

- `locomotion/locomotion-system.js`
  - Registry for patterns; `LocomotionPattern` base with cycle/frequency.
- `locomotion/quadruped-gait.js`
  - `QuadrupedWalkPattern`: 
    - Body heading smoothing; fixed chassis/wheelbase concept; anatomically-scaled foot spacing (`shoulderHipDistance`, `legSpacing`).
    - Proper walk sequence (LH→LF→RH→RF) via `walkPhaseOffsets` and `walkDutyFactor`.
    - Debug simple mode (crane-like behavior) and moving chassis variant.
  - `BiomechanicalQuadrupedGait`:
    - Walk, Trot, Pace, Gallop parameters; diagonal pairs for trot; suspension phase; adaptive ground.
    - Automatic gait switching using Froude number thresholds; manual override and cooldown.
- Other patterns:
  - `bipedal-walk-pattern.js` – crane-style step logic
  - `serpentine-pattern.js` and `undulate-pattern.js` – body wave locomotion
  - `octopus-crawl-pattern.js` – draft class for multi-limb crawl

Takeaway: Gait controllers produce foot targets/phase timing; the body position and heading are smoothed toward input, while feet animate with stance/swing phases, respecting anatomical spacing. Quadruped gait includes research-backed transitions.

## Styling, Segmentation, Shape Generation

- `styling/segmenter.js` – divides generated shapes into bands/segments for independent styling.
- `styling/border.js`, `styling/filler.js`, `styling/ThemeManager.js` – Madhubani decoration primitives (multi-line borders, beads, patterns; color palettes and style rules).
- `systems/shape-generation.js`, `systems/shape-profile-system.js` – bridge from bones to procedural outlines and width profiles. The Architecture doc frames this as the critical “bones→outline→decorations” pipeline.

From the dev log (`docs/Madhuban.md`):
- Active research on robust polygon offsetting for clean parallel borders on sharp corners; exploration of Clipper/cavaliercontours/WASM.
- “String/Path/Border/Bead” model for borders/beads along splines, with collision/overlap preferences.
- Longer-term: recursive frame composition, semantic/logic rule engines, knowledge graphs for story-driven compositions, p5.brush integration for hatch aesthetics.

## Editor System

- `editor/editor-system.js` – Orchestrates toolbar/sidebar overlay; manages builder pause/resume, mode indicator, notifications; wires components (TemplateSelector, SkeletonEditor, PropertyPanel, ConfigManager, OperationHistory).
- `editor/skeleton-editor.js` – Selection (chain/bone), highlight overlay, IK Test Mode (drag tip; solve throttled), grid, click-to-select with point-to-line distance; drag interactions scaffolding.
- `editor/config-manager.js` – Export/import creature configurations (versioned), including chain states (bone endpoints, constraints), locomotion parameters/state, editor metadata (operation history, selection, mode). Supports download/upload.
- `editor/ui-components.js` – Collapsible sections, sliders, icon buttons, selection highlighting.

Goal: In-canvas editing with live IK testing, exportable configs, and path to a fuller authoring tool for anatomical templates, chain attachments, constraints, and locomotion roles.

## Entry Points and Controls

- `index.html` – Script order is critical; `FIK.js` first; systems, locomotion, styling before `creature-builder.js`; editor files; finally `sketch.js`.
- `sketch.js` – Sets up canvas, initializes `ModularCreatureBuilder`, toggles editor, switches creatures, render modes, gait controls, simple/adaptive toggles; routes mouse events to editor when active.

Example references:

```1:20:index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FullIK Incremental Skeleton Builder</title>  
    <script src="FIK.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.js"></script>
    
    <!-- Styling Systems -->
    <script src="styling/ThemeManager.js"></script>
    <script src="styling/border.js"></script>
    <script src="styling/filler.js"></script>
    <script src="styling/segmenter.js"></script>
    
    <!-- Core Systems (load before creature-builder) -->
    <script src="systems/shape-generation.js"></script>
    <script src="systems/anatomical-data.js"></script>
```

```28:87:sketch.js
function keyPressed() {
    // Editor toggle
    if (key === 'E' || key === 'e') {
        editorActive = !editorActive;
        builder.editorActive = editorActive;
        if (editorActive) { builder.pauseForEditor(); editorSystem.show(); }
        else { editorSystem.hide(); builder.resumeFromEditor(); }
        return;
    }
    // Creature switching
    switch (key.toLowerCase()) {
        case '1': builder.buildFish(); break;
        case '2': builder.buildBipedalCrane(); break;
        case '3': builder.buildHorse(); break;
        case '4': builder.buildLizard(); break;
        case '5': builder.buildOctopus(); break;
    }
    // Render modes and gait controls omitted for brevity...
}
```

## Tests

- Manual-run HTML pages under `/tests`, organized via `tests/README.md`:
  - Debug system loading; gait sequences (trot/walk); movement fixes; chassis system; biped tests; anatomical and organization verifications; hybrid gaits; simplified mode.
- Usage: open the desired test HTML in a browser; follow on-screen instructions; console logs indicate pass/fail and diagnostics.

## PRP (Product Requirement Prompt) Framework

- `PRPs/` contains task/spec templates, planning documents, curated agent docs (`PRPs/ai_docs/*`), and multi-step plans (e.g., editor rewrite, octopus tasks).
- `CLAUDE.md` and `AGENT.md` describe command-driven workflows, validation loops, and development patterns.

## Current Strengths

- Robust IK foundation (`FIK.js`) with 2D/3D chain types and solvers.
- Data-driven, extensible anatomy and template systems (per-species proportions, constraints, roles).
- Locomotion layer with research-grounded quadruped gaits, including automatic trot transitions via Froude thresholds.
- Clear bones→shape→decoration pipeline with segmentation/fillers/borders and theming.
- In-canvas Editor with live selection/highlighting and IK Test Mode; JSON config export/import.
- Well-organized manual tests and controls for fast iteration.

## Gaps and Active Work

- Border/offset robustness: clean parallel borders around sharp/complex paths; integration of polygon offsetting libs (not yet finalized).
- Full skinning strategy: transitioning from static width profiles to circle-tangent outlines along chains for organic, animated silhouettes (see log around July entries).
- Editor capabilities: richer chain/bone editing (length, constraints), attachment editing, per-chain locomotion roles; visualizing joint limits.
- Octopus template/pattern: files scaffolded; integration pending into builder and editor flows.
- p5.brush integration: hatch rendering within bounded regions and decorated elements.
- Story/semantic composition: knowledge-graph-driven rule engine for frames/elements; WFC/model synthesis exploration (longer-term).

## Immediate Next Steps (suggested)

1) Close the “shape bridge” loop end-to-end for at least one creature:
   - Pick Horse or Fish; generate outline from chain per-frame; segment; decorate; ensure performance.
2) Border offset correctness:
   - Prototype a minimal offset kernel for polylines with bevel/miter joins; evaluate Clipper/cavaliercontours integration; add a `styling/offset-geometry.js` utility.
3) Editor “MVP complete”:
   - Chain selection → bone length sliders + constraint sliders; visualize hinge ranges; export updated chain config; import round-trip.
4) Locomotion polish:
   - Promote `BiomechanicalQuadrupedGait` to default for quadrupeds with clear manual vs. automatic switching; unify gait UI in editor.
5) Test hardening:
   - Add small sanity tests for config import/export and gait state transitions (HTML harness with visible PASS/FAIL).

## Risks/Assumptions

- Script loading order is brittle (no module bundler). Any reordering may break runtime.
- `ModularCreatureBuilder` is central but not yet fully documented here; ensure its interfaces remain stable for Editor/ConfigManager.
- Performance considerations: per-frame shape generation + decoration must remain lightweight (optimize allocation/garbage and math hot paths).
- Geometry libraries (WASM) add build/hosting complexity; prefer pure JS minimal offset first if possible.

## Glossary

- Chain/Bone: IK structure elements solved by `FIK.js`.
- Constraint Profile: Per-joint ranges (hinge/ball-socket) derived from `AnatomicalData`.
- Width Profile: Function/curve describing thickness along a chain;
- Gait: Temporal pattern of foot contacts and phases for locomotion.
- Chassis/Wheelbase: Fixed body frame for quadruped feet placement.
- Decoration: Borders, fillers, beads, and patterns applied over outlines with theming.

---

Maintained file: `docs/project-context-analysis.md`. Update this as architecture stabilizes, editor features land, and border/offset strategy is finalized.
