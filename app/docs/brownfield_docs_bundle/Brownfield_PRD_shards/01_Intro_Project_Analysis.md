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
