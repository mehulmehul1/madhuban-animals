# Madhuban Animals - Agent Configuration

## Build/Test Commands
- **Run:** Open `app/index.html` in browser (no build system, uses VS Code Live Server)
- **Test:** Include test file in index.html `<script>` tags, open browser console
- **Debug:** Browser DevTools console + DebugManager visualization overlay
- **Single Test:** Edit `app/index.html` to enable single test file only (comment others in `<!-- Test files -->` section)

## Architecture
- **Core Engine:** FIK.js (Forward/Inverse Kinematics library)
- **Entry Point:** `sketch.js` (p5.js setup/draw) → `ModularCreatureBuilder` in `creature-builder.js`
- **Systems:** `/systems/` (anatomical-data, constraint-system, gait-system, bone-template-system, shape-generation)
- **Editor:** `/editor/` (config-manager, editor-system, skeleton-editor, operation-history, property-panel)
- **Locomotion:** `/locomotion/` (locomotion-system, patterns for walk/trot/crawl/undulate)
- **Rendering:** `/adapters/` (FIK.js & p5.js adapters), `/styling/` (madhubani decorators)

## Code Style
- **Language:** ES6+ class-based, no modules (script tags in HTML)
- **Naming:** camelCase variables, PascalCase classes, ALL_CAPS constants
- **Formatting:** 4-space indent, JSDoc for public methods
- **Patterns:** Adapter pattern (FIK/p5.js), strategy pattern (gaits/decorators)
- **Error Handling:** Console.error/warn + try-catch in strategies, fallback behaviors
