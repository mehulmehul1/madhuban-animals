# Story B3 — Modularize Creature Definitions (json)

\# Story B3 — Modularize Creature Definitions (JSON)



\*\*Epic Link:\*\* Architecture Modularization (Brownfield)



\*\*Owner:\*\* Dev · \*\*Partners:\*\* Architect (Winston), QA, PM



---



\## Why



Currently, creatures (horse, lizard, etc.) are hard‑coded inside the builder. This blocks rapid addition of new creatures and complicates the editor. By moving definitions into external JSON configs, we enable a data‑driven workflow: the builder simply loads configs, and the editor can save/export them.



---



\## Deliverables



\* `creatures/horse.json`, `creatures/lizard.json` — seed configs

\* `loaders/creature-config-loader.js` — runtime loader/validator

\* `schemas/creature-config.schema.json` — JSON Schema for validation

\* Validation errors surfaced clearly in console/logs

\* Builder updated to call loader instead of inline definitions



---



\## Acceptance Criteria



1\. Horse and lizard defined only in JSON, removed from builder.

2\. Loader validates JSON against schema before build.

3\. Runtime loads creatures from JSON seamlessly (no behavior change).

4\. Editor export files can be dropped into `creatures/` and loaded at runtime without code edits.



---



\## Integration Verification (IV Gates)



\* \*\*IV-B3.1 Regression:\*\* Golden-frame tests for JSON creatures match code‑era baselines.

\* \*\*IV-B3.2 Validation:\*\* Invalid configs produce clear, human‑readable error messages.

\* \*\*IV-B3.3 Editor Integration:\*\* Config exported from editor round‑trips into runtime and matches golden frames.



---



\## Dependencies



\* Story B2 (Constraints \& Bone Templates) for reference template IDs.

\* Golden-frame baseline images required.



---



\## Definition of Done



\* Seed creatures defined in JSON only.

\* Loader + schema validation complete.

\* Builder updated to load from configs exclusively.

\* Regression/perf IV gates pass in CI.

\* Editor export round‑trip validated.



