\### Story B0 — Define Interfaces \& Shims



\*\*Why:\*\* Unblock parallel work; create safe seams.

\*\*Deliverables:\*\*



\* `types/ik-adapter.ts`, `types/renderer.ts`, `types/locomotion.ts`, `types/creature-config.ts`.

\* Shims: `adapters/fik-adapter.ts`, `adapters/p5-renderer.ts`.

&nbsp; \*\*Acceptance Criteria\*\*

\* Builder compiles using interfaces; direct FIK/p5 calls removed from domain code.

&nbsp; \*\*Integration Verification\*\*

\* IV‑B0.1 Behavior: poses match golden frames.

\* IV‑B0.2 Perf: ≤5% delta vs baseline.



---
