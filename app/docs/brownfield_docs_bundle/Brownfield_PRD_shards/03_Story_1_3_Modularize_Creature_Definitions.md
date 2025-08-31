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
