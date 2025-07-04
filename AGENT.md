# Madhuban Animals - Agent Configuration

## Build/Test Commands
- **Run:** Open `index.html` in browser (no build system)
- **Debug:** Use browser DevTools console for debugging
- **Live Server:** Use VS Code Live Server extension for hot reload

## Architecture
- **Core Engine:** FIK.js (Forward/Inverse Kinematics library)
- **Main Controller:** `ModularCreatureBuilder` class in `creature-builder.js`
- **Entry Point:** `sketch.js` (p5.js setup/draw loop)
- **Systems:** Modular components in `/systems/` (constraints, gaits, bones, shapes)
- **Locomotion:** Pattern-based movement system in `/locomotion/`
- **Styling:** Madhubani-themed decorators in `/styling/`

## Code Style
- **JavaScript:** ES6+ class-based architecture
- **Variables:** camelCase naming convention
- **Classes:** PascalCase for class names
- **Constants:** ALL_CAPS for constants
- **Functions:** Descriptive verb-based names
- **Imports:** HTML script tags (no module system)
- **Comments:** JSDoc style for public methods

## Error Handling
- Console logging for debugging
- Try-catch blocks in strategy functions
- Fallback behaviors for missing locomotion patterns
