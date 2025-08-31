# Story B4 — Centralize Debug \& Overlays

\# Story B4 — Centralize Debug \& Overlays



\*\*Epic Link:\*\* Architecture Modularization (Brownfield)



\*\*Owner:\*\* Dev · \*\*Partners:\*\* Architect (Winston), QA, PM, UX



---



\## Why



Debug features (skeleton overlays, perf logs, constraint markers) are scattered across builder code and test harnesses. This creates inconsistency and complicates QA validation. Centralizing these into a `debug-manager` ensures consistent overlays and toggles across all creatures and modes.



---



\## Deliverables



\* `debug/debug-manager.js` — central toggle + overlay rendering

\* Unified API: `toggleSkeleton()`, `toggleConstraints()`, `togglePerf()`, etc.

\* Builder updated to route all debug calls through manager

\* Hotkey integration (`S` = skeleton, `C` = current, etc.)



---



\## Acceptance Criteria



1\. All debug overlays routed through `debug-manager`.

2\. Toggles work consistently across horse, lizard, and all templates.

3\. Debug mode has no side‑effects on locomotion or perf.



---



\## Integration Verification (IV Gates)



\* \*\*IV-B4.1 Regression:\*\* Golden-frame tests in non‑debug mode unchanged.

\* \*\*IV-B4.2 Consistency:\*\* QA toggles overlays across all creatures without breakage.

\* \*\*IV-B4.3 Perf:\*\* Perf probe confirms debug off = baseline; debug on = overhead ≤10%.



---



\## Dependencies



\* Story B0 (Interfaces \& Shims) complete.

\* Stories B1–B3 do not need to be fully done, but centralizing after extraction is safer.



---



\## Definition of Done



\* All debug overlays centralized.

\* Builder calls only into `debug-manager` for debug features.

\* Regression/perf IV gates pass.

\* QA + UX sign‑off on overlay consistency.



