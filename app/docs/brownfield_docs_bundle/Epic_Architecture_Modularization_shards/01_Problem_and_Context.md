\## 1) Problem \& Context



The current runtime blends builder logic, IK specifics, locomotion patterns, constraint rules, and rendering hooks. This creates a high coupling surface that slows change, makes testing hard, and increases risk of behavior drift. We need architectural seams that preserve current behavior while enabling a data-driven pipeline and a small, fast editor.



---
