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
