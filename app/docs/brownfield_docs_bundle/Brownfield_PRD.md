# Brownfield Prd

\# Brownfield Enhancement PRD



\## 1. Intro Project Analysis and Context



The existing system is a \*\*creature builder and animation engine\*\* implemented in JavaScript (`creature-builder.js`). It leverages modular chains of bones and constraints (via the `FIK` system) to construct and animate diverse creatures (fish, crane, horse, lizard, octopus, snake). Each creature type is defined by a set of chain configurations (spine, legs, fins, wings, arms, tails, etc.) with locomotion controllers (bipedal walk, quadruped gait, serpentine motion, undulation).



Key elements:



\* \*\*Core modular system\*\* with chains, bones, constraints.

\* \*\*Creature definitions\*\*: fish, crane, horse, lizard, octopus, snake.

\* \*\*Locomotion systems\*\*: gait controllers for different anatomies.

\* \*\*Editor support\*\*: ability to pause, visualize, and configure creatures.

\* \*\*Styling layer\*\*: Madhubani-inspired theme, borders, fillers, segmenters.



\### Brownfield Complexity



This is a \*\*complex, monolithic JS file\*\* blending creature construction, locomotion logic, visualization, and debugging. Risks include:



\* High coupling of \*\*creature logic and rendering\*\*.

\* Limited modularity for adding new creatures.

\* Debugging complexity due to inlined logic.

\* Code maintainability concerns as multiple systems (locomotion, anatomy, styling) live in the same file.



\### Assumptions \& Guardrails



\* The project is actively used for \*\*procedural animation / creature simulation\*\*.

\* Enhancement should improve \*\*maintainability, extensibility, and modularity\*\* without breaking existing creatures.

\* Incremental migration is safer than a full rewrite.



---



\## 2. Epic Approach



This enhancement will be delivered as a \*\*single epic with multiple sequenced stories\*\*. The epic focuses on:



1\. Extracting and modularizing subsystems (locomotion, constraints, themes).

2\. Improving testability and debuggability.

3\. Documenting anatomy templates and story-driven epic evolution.



---



\## 3. Epic Details



\### Epic: Modularization \& Extensibility of Creature Builder



\*\*Goal:\*\* Improve maintainability, modularity, and extensibility while retaining all existing creature definitions and locomotion capabilities.



\#### Story 1.1: Extract Locomotion System



\*As a developer, I want locomotion patterns (gaits, undulation, serpentine) in a separate module so that they can evolve independently of creature definitions.\*



\*\*Acceptance Criteria:\*\*



1\. Locomotion system refactored into `locomotion/` folder with clear API.

2\. Unit tests cover gait initialization and update logic.

3\. Creature-builder imports locomotion patterns without behavior change.



\*\*Integration Verification:\*\*



\* IV1: Regression test confirms existing creatures animate as before.

\* IV2: Each locomotion module loads independently.

\* IV3: Performance baseline unchanged (<5% overhead).



---



\#### Story 1.2: Extract Constraint \& Bone Template Systems



\*As a developer, I want bone/constraint logic in standalone modules so constraints can be evolved without affecting creature configs.\*



\*\*Acceptance Criteria:\*\*



1\. `constraint-system.js` and `bone-templates.js` created.

2\. Constraints are data-driven (templates for leg, wing, spine, etc.).

3\. Creature configs reference shared templates.



\*\*Integration Verification:\*\*



\* IV1: No breakage in existing creature skeletons.

\* IV2: Developer can add a new bone template without touching core file.

\* IV3: Constraint coverage validated with at least 5 anatomical roles.



---



\#### Story 1.3: Modularize Creature Definitions



\*As a product owner, I want each creature (fish, crane, horse, lizard, snake, octopus) defined in its own file so that adding a new creature doesn’t require modifying a large monolithic file.\*



\*\*Acceptance Criteria:\*\*



1\. Each creature type (`creatures/fish.js`, `creatures/horse.js`, etc.)

2\. Shared builder utilities for attachment/chain config.

3\. `createCreature(type)` loads correct module.



\*\*Integration Verification:\*\*



\* IV1: Creature creation is consistent with existing outputs.

\* IV2: Documentation auto-generates available creatures.

\* IV3: Performance benchmark confirms no regressions.



---



\#### Story 1.4: Unified Debug \& Editor Support



\*As a developer, I want a unified debug manager and editor integration to toggle visualization without breaking simulation.\*



\*\*Acceptance Criteria:\*\*



1\. `debug-manager.js` provides consistent logging and visual overlays.

2\. Editor mode prevents mouse-based locomotion overrides.

3\. Toggle options available for skeleton, skin, muscle, etc.



\*\*Integration Verification:\*\*



\* IV1: Debug mode can be toggled without affecting simulation.

\* IV2: Editor integration tested for freeze/unfreeze states.

\* IV3: Overlay options confirmed across all creatures.



---



\#### Story 1.5: Documentation \& Developer Guide



\*As a developer, I want clear documentation of anatomy templates, locomotion APIs, and modular structure so onboarding is faster.\*



\*\*Acceptance Criteria:\*\*



1\. `docs/architecture.md` added.

2\. API references for locomotion, constraints, debug system.

3\. Examples of adding a new creature documented.



\*\*Integration Verification:\*\*



\* IV1: New developer can add a new “bird” creature in <2 hours using docs.

\* IV2: Docs match actual exported APIs.

\* IV3: Walkthrough demo passes QA.



---



\## 4. Risks \& Mitigation



\* \*\*Risk:\*\* Breaking existing creatures. → Mitigation: regression test suite for all 6 existing types.

\* \*\*Risk:\*\* Performance regression. → Mitigation: baseline performance testing before/after refactor.

\* \*\*Risk:\*\* Over-modularization slowing delivery. → Mitigation: small incremental merges, each with tests.



---



\## 5. Roadmap \& Sequencing



1\. Extract Locomotion (Story 1.1)

2\. Extract Constraints \& Bones (Story 1.2)

3\. Modularize Creatures (Story 1.3)

4\. Debug \& Editor Integration (Story 1.4)

5\. Documentation \& Developer Guide (Story 1.5)



---



\## 6. Appendices



\* Reference Codebase: `creature-builder.js` (monolithic).

\* Creatures supported: Fish, Crane, Horse, Lizard, Octopus, Snake.

\* Dependencies: `FIK` inverse kinematics engine, Madhubani styling modules.



