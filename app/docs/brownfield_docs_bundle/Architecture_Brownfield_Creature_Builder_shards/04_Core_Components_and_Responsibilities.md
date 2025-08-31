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
