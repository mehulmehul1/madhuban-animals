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
