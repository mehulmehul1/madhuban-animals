# Architecture Brownfield Creature Builder

\# Architecture Document — Creature Builder \& Animation Engine (Brownfield)



> Status: Draft v1.0 · Owner: Architect · Scope: Aligns with PRD “Modularization \& Extensibility of Creature Builder” epic



---



\## 1) Executive Summary \& Scope



This document captures the \*\*current system architecture\*\* and a \*\*target modular architecture\*\* for a browser-based creature construction and animation engine. It informs the brownfield refactor plan to improve maintainability, extensibility, and testability without breaking existing demos or behaviors.



\*\*In-scope:\*\* runtime architecture, key components, dependencies, configuration/data model, rendering pipeline, locomotion orchestration, debugging, and a stepwise migration plan.



\*\*Out of scope:\*\* visual design details beyond debug overlays, non-web runtimes.



---



\## 2) System Overview



The application runs in a browser (p5.js canvas) and composes multiple script modules:



\* \*\*Core Runtime:\*\* `FIK.js` (IK \& math), `creature-builder.js` (orchestrator)

\* \*\*Core Systems:\*\* anatomical data/configs, bone \& constraint systems, gait system, shape/profile systems, debug manager

\* \*\*Locomotion Systems:\*\* locomotion core + patterns for quadruped, bipedal, serpentine, undulation; gait transitions

\* \*\*Styling Systems:\*\* theme manager, border decorator, fillers, segmenter (for stylized rendering)

\* \*\*Test/Demos:\*\* HTML sketches that load the stack and instantiate creatures (horse, lizard, etc.)



\*\*Primary responsibilities distribution\*\*



\* \*\*Creature Builder\*\*: constructs anatomical structures from configuration, attaches constraint/bone templates, wires a locomotion strategy, updates + draws, and exposes rendering mode toggles.

\* \*\*Systems\*\*: provide reusable data and algorithms (templates, constraints, profiles, gait logic, debug, etc.).

\* \*\*Locomotion\*\*: encapsulates movement patterns and time-based foot/limb targets with transitions (e.g., walk→trot→gallop for quadrupeds).



---



\## 3) Runtime Architecture



```

\[ p5.js Sketch / Test HTML ]

&nbsp;         |

&nbsp;         v

&nbsp;\[ ModularCreatureBuilder ]  <-- orchestrator (builds, updates, draws)

&nbsp;   |         |         |

&nbsp;   |         |         |

&nbsp;   v         v         v

\[Anatomy]  \[Constraints] \[Locomotion]

&nbsp; data        IK rules      patterns/gaits

&nbsp;   |            |              |

&nbsp;   |            v              v

&nbsp;   |        \[FIK.js]      \[Locomotion System]

&nbsp;   v

\[Shape/Profiles + Styling]

&nbsp;         |

&nbsp;         v

&nbsp;     \[Canvas Render]

```



\### Key runtime flows



1\. \*\*Build\*\*: The builder processes an anatomical config → spawns chains/bones → applies templates and constraints → assigns a locomotion controller.

2\. \*\*Update loop\*\*: Each frame, locomotion computes targets (e.g., foot placements, spine flex) → constraints/IK solve → positions propagate through bones and chains → debug overlays optional.

3\. \*\*Draw\*\*: Rendering respects the current mode (e.g., skeleton vs current/skin) with optional themed borders/fillers/segments.



---



\## 4) Core Components \& Responsibilities



\### 4.1 ModularCreatureBuilder (orchestrator)



\* Public methods (observed via sketches/tests): `buildHorse()`, `buildLizard()`, `buildDeer()`, `buildElephant()`, `setRenderMode('skeleton'|'current')`, `update()`, `draw()`

\* State: `bodyPosition`, `mouseTarget`, `activeLocomotion`, `anatomicalConfig`, `showDebug`

\* Contracts:



&nbsp; \* \*\*Construction\*\*: builds a creature from a template/config and wires required systems

&nbsp; \* \*\*Locomotion\*\*: owns an active locomotion controller with optional \*\*gait transitions\*\* for quadrupeds (`walk`, `trot`, `gallop`)

&nbsp; \* \*\*Rendering\*\*: exposes render modes and debug toggles



\### 4.2 Anatomy \& Templates



\* \*\*Anatomical Data/Configs\*\*: Parameterize skeletal layout (e.g., spine segments, leg segment counts, spacing, offsets)

\* \*\*Bone Template System\*\*: Declares bone/chain templates for reuse across species

\* \*\*Constraint System\*\*: Enforces joint limits and IK constraints during update phase

\* \*\*Shape/Profile Systems\*\*: Provide geometry and visual profiles for drawing



\### 4.3 Locomotion System



\* Core locomotion orchestrator that hosts swappable \*\*patterns\*\*: quadruped, biped, serpentine, undulation

\* Exposes \*\*gait transitions\*\* for quadrupeds and manages per-limb target scheduling



\### 4.4 Styling \& Debug



\* \*\*Theme Manager\*\* \& decorators (border, fillers, segmenter) for visual style

\* \*\*Debug Manager\*\* provides overlays and status panels; `showDebug` toggle supported by builder/sketches



---



\## 5) Rendering Pipeline \& Modes



\* \*\*Modes\*\*: `skeleton` (structural view), `current` (normal/skin-like render)

\* \*\*Overlays\*\*: body height, ground lines, foot target markers, labels; controlled by debug

\* \*\*Canvas\*\*: p5.js draw loop drives `update()` then `draw()` per frame



---



\## 6) Configuration \& Data Model



To enable modularity and tooling, formalize configs as JSON with a schema (draft):



```json

{

&nbsp; "$schema": "https://example.com/creature.schema.json",

&nbsp; "type": "object",

&nbsp; "required": \["id", "anatomy", "locomotion"],

&nbsp; "properties": {

&nbsp;   "id": { "type": "string" },

&nbsp;   "anatomy": {

&nbsp;     "type": "object",

&nbsp;     "properties": {

&nbsp;       "spine": { "type": "object", "properties": { "segments": { "type": "integer" }, "flex": { "type": "number" } } },

&nbsp;       "legs": { "type": "array", "items": { "type": "object", "properties": { "segments": { "type": "integer" }, "attach": { "type": "string" } } } },

&nbsp;       "wings": { "type": "array" },

&nbsp;       "fins":  { "type": "array" },

&nbsp;       "tail":  { "type": "object", "properties": { "segments": { "type": "integer" } } }

&nbsp;     }

&nbsp;   },

&nbsp;   "locomotion": {

&nbsp;     "type": "object",

&nbsp;     "properties": {

&nbsp;       "pattern": { "enum": \["quadruped", "bipedal", "serpentine", "undulate"] },

&nbsp;       "gait": { "enum": \["walk", "trot", "gallop", null] },

&nbsp;       "speed": { "type": "number" }

&nbsp;     }

&nbsp;   },

&nbsp;   "render": { "type": "object", "properties": { "mode": { "enum": \["skeleton", "current"] }, "theme": { "type": "string" } } }

&nbsp; }

}

```



\*\*Authoring guidance\*\*



\* Define species in `creatures/<species>.json` referencing shared templates

\* Prefer data-driven attachment points (e.g., `attach: "spine:T3"`) over code constants



---



\## 7) Current Dependency Map (observed)



| Layer        | Modules                                                                                                                                          |

| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |

| Styling      | ThemeManager, border, fillers, segmenter                                                                                                         |

| Core Systems | shape-generation, anatomical-data, anatomical-configs, constraint-system, bone-template-system, gait-system, shape-profile-system, debug-manager |

| Locomotion   | locomotion-system, locomotion-pattern, quadruped-gait, bipedal-walk-pattern, serpentine-pattern, undulate-pattern                                |

| Core         | FIK.js, creature-builder.js                                                                                                                      |

| Tests/Demos  | various `tests/\*.html` sketches (horse, lizard, posture comparisons)                                                                             |



---



\## 8) Target Modular Architecture



\### 8.1 Package/Folder Layout



```

src/

&nbsp; core/

&nbsp;   creature-builder.ts

&nbsp;   types.ts

&nbsp; systems/

&nbsp;   anatomy/

&nbsp;     data/

&nbsp;     configs/

&nbsp;     bone-template-system.ts

&nbsp;     constraint-system.ts

&nbsp;     shape-profile-system.ts

&nbsp;   locomotion/

&nbsp;     locomotion-system.ts

&nbsp;     patterns/

&nbsp;       quadruped-gait.ts

&nbsp;       bipedal-walk.ts

&nbsp;       serpentine.ts

&nbsp;       undulate.ts

&nbsp; styling/

&nbsp;   theme-manager.ts

&nbsp;   border-decorator.ts

&nbsp;   fillers.ts

&nbsp;   segmenter.ts

&nbsp; debug/

&nbsp;   debug-manager.ts

&nbsp; creatures/

&nbsp;   horse.json

&nbsp;   lizard.json

&nbsp;   deer.json

&nbsp;   elephant.json

&nbsp; adapters/

&nbsp;   p5-renderer.ts

&nbsp;   fik-adapter.ts

&nbsp; demos/

&nbsp;   horse-vs-lizard.sketch.ts



index.html

```



\### 8.2 Public API (minimal)



```ts

class CreatureBuilder {

&nbsp; constructor(opts?: { renderer?: Renderer; ik?: IKAdapter })

&nbsp; load(speciesConfig: CreatureConfig): void

&nbsp; setRenderMode(mode: 'skeleton'|'current'): void

&nbsp; setLocomotion(pattern: Pattern, gait?: Gait): void

&nbsp; update(dt: number): void

&nbsp; draw(): void

}

```



\### 8.3 Boundaries \& Contracts



\* \*\*Builder ⇄ Locomotion\*\*: builder provides limb endpoints \& phase; locomotion provides per-frame targets and gait transitions

\* \*\*Builder ⇄ Constraint/IK\*\*: builder delegates joint solving to IK adapter (FIK)

\* \*\*Renderer\*\* isolated behind adapter (p5 today, open to Pixi/WebGL tomorrow)

\* \*\*Configs\*\* are validated at load time (JSON schema) and compiled into internal structures



---



\## 9) Migration Strategy (brownfield)



\*\*Principles:\*\* small, verifiable steps; zero behavior regressions; test safety net.



1\. \*\*Extract Locomotion\*\* (no behavior change)



&nbsp;  \* Create `systems/locomotion/` with `locomotion-system` + patterns, wire behind a stable interface

&nbsp;  \* Add unit tests for gait transitions and foot target scheduling

2\. \*\*Extract Constraints \& Bone Templates\*\*



&nbsp;  \* Move constraint logic \& bone templates into `systems/anatomy/`

&nbsp;  \* Make chain templates data-driven (JSON) and reference by ID

3\. \*\*Modularize Creature Definitions\*\*



&nbsp;  \* Move inline definitions to `creatures/\*.json`; update builder to `load()` by config

4\. \*\*Debug \& Editor Integration\*\*



&nbsp;  \* Centralize debug toggles, overlays, and keyboard shortcuts in `debug-manager`

5\. \*\*Docs + Examples\*\*



&nbsp;  \* Add `docs/architecture.md`, quickstarts, and a “create a new species” guide; keep posture tests green



\*\*Success metrics (KPIs)\*\*



\* New species added without touching builder source

\* 80%+ unit coverage of locomotion + constraints

\* ≤5% perf delta in update/draw baseline

\* Posture tests (horse erect vs lizard sprawling) continue to pass



---



\## 10) Quality \& Testing



\* \*\*Unit\*\*: locomotion phase logic, gait transitions, constraint solving contracts

\* \*\*Integration\*\*: builder + IK adapter + renderer; ensure render-mode toggles and debug overlays work

\* \*\*Scenario/E2E (p5)\*\*: posture comparison demos; keyboard-command behaviors (`s` skeleton, `c` current; gait hotkeys)

\* \*\*Performance\*\*: frame time budget \& GC churn monitoring at target canvas sizes (e.g., 800×600, 1200×600)



\*\*Test data/fixtures\*\*



\* Species configs (horse/lizard) with canonical measurements for stance, leg spacing, spine flexibility

\* Golden-frame image diffs for skeleton/current modes



---



\## 11) Non‑Functional Requirements (NFRs)



\* \*\*Maintainability\*\*: layered boundaries; typed interfaces; schema-validated configs

\* \*\*Extensibility\*\*: plug-in locomotion patterns \& species configs without builder edits

\* \*\*Performance\*\*: 60 FPS on mid‑tier laptop for standard demos

\* \*\*Portability\*\*: renderer/IK adapters decouple p5 and FIK from domain logic



---



\## 12) Risks \& Mitigations



\* \*\*Behavior drift during refactor\*\* → incrementally extract with posture \& gait tests as guardrails

\* \*\*Over‑modularization\*\* → favor pragmatic boundaries; stage extractions to retain velocity

\* \*\*Schema rigidity\*\* → allow optional fields + defaults; generate internal normalized model



---



\## 13) Glossary



\* \*\*FIK\*\*: Inverse-kinematics/math library used for joints and structures

\* \*\*Gait\*\*: Named locomotion modes for quadrupeds (walk, trot, gallop)

\* \*\*Skeleton mode\*\*: Render diagnostic view of bones/joints/segments

\* \*\*Profile\*\*: Shape definitions for visual rendering of segments



---



\## 14) Open Questions



1\. Should renderer remain p5.js, or migrate to Pixi/WebGL for advanced batching later?

2\. Any additional species required for MVP beyond horse, lizard, deer, elephant?

3\. Target JSON schema constraints (e.g., min/max segments per limb) to enforce at load time?



---



\## 15) Appendix — Proposed Coding Standards (TypeScript)



\* Enable `strict` TS; prefer interfaces for contracts

\* Pure functions for math/kinematics; classes only for stateful systems (builder, locomotion orchestrator)

\* Avoid singletons; inject adapters (renderer/IK)

\* Document public APIs with TSDoc; generate API docs



