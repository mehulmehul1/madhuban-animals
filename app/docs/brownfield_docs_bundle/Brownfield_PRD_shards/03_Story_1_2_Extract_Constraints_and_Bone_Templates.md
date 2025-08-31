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
