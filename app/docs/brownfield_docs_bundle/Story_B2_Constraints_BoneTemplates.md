# Story B2 — Constraints \& Bone Templates

\# Story B2 — Extract Constraints \& Bone Templates



\*\*Epic Link:\*\* Architecture Modularization (Brownfield)



\*\*Owner:\*\* Dev · \*\*Partners:\*\* Architect (Winston), QA, PM



---



\## Why



Constraint logic (joint angle limits, stiffness) and bone templates (standard chain structures) are currently defined inline in the builder. This makes it difficult to reuse anatomical rules across creatures, and increases the risk of inconsistencies. Extracting them into dedicated modules makes anatomy data‑driven, reusable, and editor‑ready.



---



\## Deliverables



\* `systems/anatomy/constraint-system.js` — reusable constraint library

\* `systems/anatomy/bone-templates.js` — common templates (spine, leg, wing, tail, fin)

\* `systems/anatomy/shape-profiles.js` — basic shape/profile system (for later muscle/skin use)

\* Interfaces connected via `types/anatomy.d.ts`

\* Builder updated to consume constraints/templates via IDs rather than inline code



---



\## Acceptance Criteria



1\. Five roles templated: hip, knee, ankle, shoulder, elbow/wrist.

2\. Templates referenced by ID from configs, not re‑declared in builder.

3\. Constraints enforce joint limits consistently across all creatures.

4\. Adding a new template (e.g., bird wing) requires no edits to builder.



---



\## Integration Verification (IV Gates)



\* \*\*IV-B2.1 Regression:\*\* Golden-frame tests for horse/lizard skeletons pass unchanged.

\* \*\*IV-B2.2 Integrity:\*\* Validation confirms correct joint counts per chain (hindleg 3 segments, etc.).

\* \*\*IV-B2.3 Extensibility:\*\* A new template (dummy fin) added and loaded without builder modifications.



---



\## Dependencies



\* Story B0 (Interfaces \& Shims) complete.

\* Golden-frame + validation harness available.



---



\## Definition of Done



\* Constraint and bone template systems extracted under `systems/anatomy/`.

\* Builder references only via template IDs.

\* Regression/perf IV gates pass in CI.

\* QA validates anatomical roles and symmetry preserved.



