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



---
