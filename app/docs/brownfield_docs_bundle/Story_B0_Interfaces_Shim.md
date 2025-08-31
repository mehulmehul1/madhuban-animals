# Story B0 — Interfaces \& Shims

\# Story B0 — Define Interfaces \& Shims



\*\*Epic Link:\*\* Architecture Modularization (Brownfield)



\*\*Owner:\*\* Dev · \*\*Partners:\*\* Architect (Winston), QA, PM



---



\## Why



The current runtime directly calls into \*\*FIK\*\* (IK solver) and \*\*p5.js\*\* rendering inside domain logic. This creates high coupling, blocks editor integration, and risks breaking behavior during future refactors. We need stable \*\*TypeScript interfaces\*\* and \*\*shim adapters\*\* so the domain layer only references contracts, not implementations.



---



\## Deliverables



\* `types/ik-adapter.ts` — interface for IK solvers

\* `types/renderer.ts` — interface for rendering layer

\* `types/locomotion.ts` — interface for locomotion patterns

\* `types/creature-config.ts` — interface/schema for configs

\* `adapters/fik-adapter.ts` — shim adapter binding FIK to `IKAdapter`

\* `adapters/p5-renderer.ts` — shim adapter binding p5 to `Renderer`



---



\## Acceptance Criteria



1\. Builder and runtime compile against interfaces only (no direct FIK or p5 calls in domain code).

2\. Shim adapters faithfully map existing calls to underlying libraries.

3\. No functional changes: horse/lizard baseline skeletons animate identically.

4\. Interfaces documented with inline comments and typed method signatures.



---



\## Integration Verification (IV Gates)



\* \*\*IV‑B0.1 Behavior:\*\* Golden-frame test suite passes for horse and lizard idle/walk poses.

\* \*\*IV‑B0.2 Perf:\*\* Frame-time delta ≤5% compared to baseline probes.

\* \*\*IV‑B0.3 Integration:\*\* Domain code imports only from `types/\*` (enforced via static analysis or lint rule).



---



\## Dependencies



\* Needs golden-frame baseline images and perf probe script from A0 (Skeleton Editor MVP pre-work).

\* None on other architecture stories.



---



\## Definition of Done



\* Interfaces created and in `types/` folder.

\* Shims implemented and in `adapters/` folder.

\* All domain references updated to use interfaces.

\* Golden-frame and perf IV gates passed in CI.

\* PM + QA sign-off on parity.



