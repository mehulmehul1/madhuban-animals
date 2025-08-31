\### Story B3 — Modularize Creature Definitions (JSON)



\*\*Why:\*\* Editor/runtime interoperability; no builder edits for new species.

\*\*Deliverables:\*\*



\* `creatures/{horse.json,lizard.json}` seeds; `loaders/creature-config-loader.ts`

\* JSON schema + validation errors surfaced.

&nbsp; \*\*Acceptance Criteria\*\*

\* Runtime loads JSON-only species; round‑trip with editor export.

&nbsp; \*\*Integration Verification\*\*

\* IV‑B3.1 Golden frames for JSON species match code-era baselines.



---
