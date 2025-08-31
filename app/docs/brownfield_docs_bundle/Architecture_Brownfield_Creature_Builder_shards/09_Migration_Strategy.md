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
