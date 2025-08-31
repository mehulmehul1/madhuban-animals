# Epic — Architecture Modularization (brownfield)

\# Epic: Architecture Modularization (Brownfield)



\*\*Owner:\*\* PM (John) · \*\*Partners:\*\* Architect (Winston), Dev, QA, UX (for debug UX only)



\*\*Goal:\*\* Extract tightly-coupled runtime into clean modules and stable interfaces so we can add creatures via data/config and ship the Skeleton Editor MVP without regressions.



---



\## 1) Problem \& Context



The current runtime blends builder logic, IK specifics, locomotion patterns, constraint rules, and rendering hooks. This creates a high coupling surface that slows change, makes testing hard, and increases risk of behavior drift. We need architectural seams that preserve current behavior while enabling a data-driven pipeline and a small, fast editor.



---



\## 2) Objectives \& Success Criteria



\*\*Objectives\*\*



1\. Introduce stable TypeScript interfaces for IK, rendering, locomotion patterns, and config loading.

2\. Extract locomotion, constraints, and bone templates into dedicated modules.

3\. Move creature definitions to JSON configs consumable by both runtime and editor.

4\. Preserve behavior and performance for existing creatures during and after the refactor.



\*\*Epic-level Acceptance (Done = true when all hold):\*\*



\* Behavior parity: horse/lizard canonical poses and walk loops match golden frames within diff threshold.

\* Performance parity: ≤5% frame-time delta vs baseline at 800×600.

\* Extensibility: new chain/creature can be added without touching the builder source.

\* Editor-ready: runtime loads a `CreatureConfig` saved by the editor without adapter code changes.



\*\*Epic Integration Verification (IV gates):\*\*



\* \*\*IV‑E1 Regression:\*\* Golden-frame test suite passes per commit for skeleton mode.

\* \*\*IV‑E2 Integration:\*\* Runtime boots with modules loaded via interfaces only (no deep imports across boundaries).

\* \*\*IV‑E3 Performance:\*\* Perf probe passes (mean frame ms and p95 within target band).



---



\## 3) Scope \& Non‑Goals



\*\*In scope\*\*



\* Interface layer (`IKAdapter`, `Renderer`, `LocomotionPattern`, `CreatureConfigLoader`).

\* Module extraction for locomotion and anatomy constraints/templates.

\* JSON-based creature definitions and a loader.

\* Centralized debug/overlay toggles (light touch).



\*\*Out of scope (this epic)\*\*



\* Muscle/skin/decor layers (visual mass \& styling).

\* Full editor UX (handled by Skeleton Editor MVP epic).

\* Rendering engine migration (p5→Pixi/WebGL) beyond adapter seam.



---



\## 4) Architecture Approach (Target)



\* \*\*Boundary-first:\*\* establish compile-time interfaces before moving code.

\* \*\*Adapter pattern:\*\* FIK and p5 integrated via thin adapters; domain code references interfaces only.

\* \*\*Data-first creatures:\*\* all species defined in `creatures/\*.json`, validated on load.

\* \*\*Gradual extraction:\*\* relocate logic one subsystem at a time with tests.



---



\## 5) Work Breakdown (Stories)



\### Story B0 — Define Interfaces \& Shims



\*\*Why:\*\* Unblock parallel work; create safe seams.

\*\*Deliverables:\*\*



\* `types/ik-adapter.ts`, `types/renderer.ts`, `types/locomotion.ts`, `types/creature-config.ts`.

\* Shims: `adapters/fik-adapter.ts`, `adapters/p5-renderer.ts`.

&nbsp; \*\*Acceptance Criteria\*\*

\* Builder compiles using interfaces; direct FIK/p5 calls removed from domain code.

&nbsp; \*\*Integration Verification\*\*

\* IV‑B0.1 Behavior: poses match golden frames.

\* IV‑B0.2 Perf: ≤5% delta vs baseline.



\### Story B1 — Extract Locomotion System



\*\*Why:\*\* Isolate gait logic; enable plug-in patterns.

\*\*Deliverables:\*\*



\* `systems/locomotion/locomotion-system.ts`

\* `systems/locomotion/patterns/{quadruped,biped,serpentine,undulate}.ts`

&nbsp; \*\*Acceptance Criteria\*\*

\* Public API via `LocomotionPattern` only; transitions walk↔trot↔gallop validated.

&nbsp; \*\*Integration Verification\*\*

\* IV‑B1.1 Regression suite passes all creatures.

\* IV‑B1.2 Perf unchanged within threshold.



\### Story B2 — Extract Constraints \& Bone Templates



\*\*Why:\*\* Data-driven anatomy; reusable joint rules.

\*\*Deliverables:\*\*



\* `systems/anatomy/{constraint-system.ts,bone-templates.ts,shape-profiles.ts}`

&nbsp; \*\*Acceptance Criteria\*\*

\* Five roles templated (hip, knee, ankle, shoulder, elbow/wrist) and referenced by ID.

&nbsp; \*\*Integration Verification\*\*

\* IV‑B2.1 New chain added via template without builder edits.



\### Story B3 — Modularize Creature Definitions (JSON)



\*\*Why:\*\* Editor/runtime interoperability; no builder edits for new species.

\*\*Deliverables:\*\*



\* `creatures/{horse.json,lizard.json}` seeds; `loaders/creature-config-loader.ts`

\* JSON schema + validation errors surfaced.

&nbsp; \*\*Acceptance Criteria\*\*

\* Runtime loads JSON-only species; round‑trip with editor export.

&nbsp; \*\*Integration Verification\*\*

\* IV‑B3.1 Golden frames for JSON species match code-era baselines.



\### Story B4 — Centralize Debug \& Overlays (Light)



\*\*Why:\*\* Keep diagnostics stable through refactor.

\*\*Deliverables:\*\*



\* `debug/debug-manager.ts` with toggles and overlay hooks.

&nbsp; \*\*Acceptance Criteria\*\*

\* Toggling overlays doesn’t affect sim; consistent across species.



---



\## 6) Sequencing \& Dependencies



\*\*Recommended order:\*\* B0 → (B1 ∥ B2) → B3 → B4.



\* B0 is a hard prerequisite for editor and extractions.

\* B3 depends on B2’s data model for templates.



\*\*External dependencies:\*\* Skeleton Editor MVP will consume B0 immediately and B3 when ready.



---



\## 7) Quality, Testing \& Tooling



\* \*\*Golden-frame testing\*\* for skeleton mode (reference images for horse/lizard idle + walk).

\* \*\*Perf probe\*\* (mean frame ms, p95) recorded per build.

\* \*\*Schema validation\*\* on JSON load with human-friendly errors.

\* \*\*CI gates\*\*: block on golden-frame diff > threshold, perf regression >5%.



---



\## 8) Risks \& Mitigations



\* \*\*Behavior drift\*\* during extraction → incremental merges with golden-frame gates.

\* \*\*Over-segmentation\*\* creating complexity → smallest useful seams; keep APIs minimal.

\* \*\*Schema rigidity\*\* blocking creativity → optional fields + defaults, versioned schema.



---



\## 9) Definition of Done (Epic)



\* All stories B0–B4 closed with passing IV gates.

\* Existing species behavior/perf parity achieved.

\* New species added via JSON without builder edits.

\* Editor can export a valid config that the runtime loads directly.



---



\## 10) Reporting



\* Burn-up chart by stories; nightly CI report includes golden-frame diff % and perf stats.

\* Weekly summary: what extracted, any perf deltas, next story.



