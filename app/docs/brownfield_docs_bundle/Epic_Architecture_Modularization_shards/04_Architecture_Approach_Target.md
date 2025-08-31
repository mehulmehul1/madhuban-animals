\## 4) Architecture Approach (Target)



\* \*\*Boundary-first:\*\* establish compile-time interfaces before moving code.

\* \*\*Adapter pattern:\*\* FIK and p5 integrated via thin adapters; domain code references interfaces only.

\* \*\*Data-first creatures:\*\* all species defined in `creatures/\*.json`, validated on load.

\* \*\*Gradual extraction:\*\* relocate logic one subsystem at a time with tests.



---
