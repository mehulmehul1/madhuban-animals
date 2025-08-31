# Story B1 — Extract Locomotion System

\# Story B1 — Extract Locomotion System



\*\*Epic Link:\*\* Architecture Modularization (Brownfield)



\*\*Owner:\*\* Dev · \*\*Partners:\*\* Architect (Winston), QA, PM



---



\## Why



Locomotion logic (walk, trot, gallop, serpentine, undulate) is currently embedded in the builder and spread across monolithic files. This coupling makes it difficult to add new gait patterns or debug existing ones. Extracting locomotion into its own subsystem isolates movement logic and enables pluggable patterns without touching the core builder.



---



\## Deliverables



\* `systems/locomotion/locomotion-system.js` — orchestrator

\* `systems/locomotion/patterns/quadruped-gait.js`

\* `systems/locomotion/patterns/bipedal-walk.js`

\* `systems/locomotion/patterns/serpentine.js`

\* `systems/locomotion/patterns/undulate.js`

\* Interfaces connected via `types/locomotion.d.ts`

\* Updated builder to consume locomotion via `LocomotionPattern` interface only



---



\## Acceptance Criteria



1\. Each locomotion pattern is implemented as a class/object conforming to `LocomotionPattern` interface.

2\. Builder can switch active locomotion by ID (`quadruped`, `bipedal`, etc.).

3\. Quadruped gait supports transitions between walk/trot/gallop.

4\. No change in visible behavior: horse and lizard animations run identically to baseline.



---



\## Integration Verification (IV Gates)



\* \*\*IV-B1.1 Regression:\*\* Golden-frame test suite passes for horse/lizard walk cycles.

\* \*\*IV-B1.2 Transitions:\*\* Quadruped can toggle gaits at runtime without errors.

\* \*\*IV-B1.3 Perf:\*\* Frame-time delta ≤5% compared to baseline probes.



---



\## Dependencies



\* Story B0 (Interfaces \& Shims) must be complete, providing `LocomotionPattern` contract.

\* Golden-frame + perf probes from A0 available.



---



\## Definition of Done



\* Locomotion subsystem exists under `systems/locomotion/` with patterns extracted.

\* Builder references locomotion only through the interface.

\* All regression/perf IV gates pass in CI.

\* QA validates gait transitions visually and via tests.



