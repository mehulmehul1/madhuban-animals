# Complete Editor Rewrite - SPEC PRP

> Ingest the information from this file, implement the Low-Level Tasks, and generate the code that will satisfy the High and Mid-Level Objectives.

## High-Level Objective

Transform the Madhuban Creature Editor from its current complex, multi-component architecture into a unified, intuitive visual design tool that enables seamless creation and editing of modular 2D creatures with FORCE-insfpired aesthetics and hybrid locomotion capabilities.

## Mid-Level Objectives

1. **REPLACE** the current dual-editor system (AnatomyEditor + EditorMode) with a single, coherent EditorSystem class
2. **CREATE** a simplified, progressive disclosure UI that reveals controls contextually based on user selection
3. **IMPLEMENT** a unified component architecture using p5.js DOM with consistent interaction patterns
4. **ESTABLISH** clear separation between editor UI and creature builder logic with clean integration points
5. **OPTIMIZE** performance by eliminating redundant operations and simplifying the update/render cycle
6. **DESIGN** an intuitive user flow: Toggle → Select Template → Edit Skeleton → Preview → Save

## Implementation Notes

### Technical Requirements
- **Framework**: Pure p5.js with createDiv/createButton DOM elements for consistency
- **Architecture**: Single EditorSystem class with modular sub-components (TemplateSelector, SkeletonEditor, PropertyPanel)
- **Integration**: Clean integration with existing ModularCreatureBuilder and FIK.js systems
- **Performance**: <100ms toggle time, 60fps preview, throttled expensive operations
- **Memory**: Proper DOM cleanup, event listener management, operation history limits

### UI Component Library Selection
Based on research, use **p5.touchgui** patterns for consistent touch/mouse interaction with custom components for specialized skeleton editing needs.

### UX Wireframe Structure
```
┌─────────────────────────────────────────────────────────────┐
│ [Madhuban Editor] [Template ▼] [Save] [Export] [E to Exit] │ ← Toolbar (60px)
├─────────────────────────────────────────────────────────────┤
│ TEMPLATES        │                                         │
│ [🐎 Horse]       │           CANVAS EDITING AREA           │ ← Sidebar (200px)
│ [🐟 Fish]        │                                         │   + Canvas
│ [🦎 Lizard]      │     Selected: Spine Chain               │
│ [+ Custom]       │     [■ ■ ■ ■] ← Bone visualization     │
│                  │                                         │
│ PROPERTIES       │     [Grid background for positioning]   │
│ Chain: Spine     │                                         │
│ Bones: 4         │                                         │
│ ┌─────────────┐  │                                         │
│ │Length: [25] │  │                                         │
│ │Angle:  [45] │  │                                         │
│ │[IK Test]    │  │                                         │
│ └─────────────┘  │                                         │
└─────────────────────────────────────────────────────────────┘
```

### Coding Standards
- **Class Organization**: Constructor → Setup → Event Handlers → Update/Draw → Cleanup
- **Naming**: camelCase for methods, PascalCase for classes, kebab-case for DOM IDs
- **Error Handling**: Comprehensive try-catch with graceful degradation
- **Documentation**: JSDoc comments for all public methods and complex logic
- **State Management**: Immutable state updates with clear before/after snapshots

## Context

### Beginning Context
**Current Files (TO BE DELETED):**
- `editor/anatomy-editor.js` - 850 lines, complex dual-architecture
- `editor/editor-mode.js` - 650 lines, overlapping functionality
- `editor/editor-ui.js` - 400 lines, inconsistent DOM patterns
- `editor/editor-ui-backup.js` - backup file
- `editor/bone-manipulator.js` - 300 lines, good core logic
- `editor/constraint-editor.js` - 250 lines, good constraint visualization
- `editor/config-manager.js` - 200 lines, solid save/load system
- `editor/operation-history.js` - 150 lines, good undo/redo
- `editor/template-gallery.js` - 180 lines, overly complex UI
- `editor/template-palette.js` - 120 lines, drag-drop system
- `editor/chain-hierarchy.js` - 100 lines, selection management
- `editor/chain-properties.js` - 80 lines, property editing

**Integration Files (TO BE UPDATED):**
- `creature-builder.js` - Line 53: `this.editorActive = false;`
- `sketch.js` - Lines 2,11,15,28,40: Editor integration points
- `index.html` - Script tags for editor components

### Ending Context
**New Files (TO BE CREATED):**
- `editor/editor-system.js` - Single unified editor (400-500 lines)
- `editor/template-selector.js` - Simple template selection (100 lines)
- `editor/skeleton-editor.js` - Core skeleton editing (200 lines)
- `editor/property-panel.js` - Contextual property editing (150 lines)
- `editor/ui-components.js` - Reusable UI components (100 lines)

**Updated Integration:**
- `creature-builder.js` - Simplified editor integration hooks
- `sketch.js` - Streamlined editor toggle and event handling
- `index.html` - Updated script tags

## Low-Level Tasks

> Ordered from start to finish for complete implementation

1. **DELETE existing editor implementation**

```yaml
action: DELETE
files: [
  "editor/anatomy-editor.js",
  "editor/editor-mode.js", 
  "editor/editor-ui.js",
  "editor/editor-ui-backup.js",
  "editor/bone-manipulator.js",
  "editor/constraint-editor.js",
  "editor/template-gallery.js",
  "editor/template-palette.js",
  "editor/chain-hierarchy.js",
  "editor/chain-properties.js"
]
preserve: ["editor/config-manager.js", "editor/operation-history.js"]
validation: "Verify no broken imports in index.html or sketch.js"
```

2. **CREATE reusable UI component system**

```yaml
action: CREATE
file: "editor/ui-components.js"
purpose: "Foundational UI components for consistent interface"
components:
  - CollapsibleSection: "Expandable content sections with headers"
  - PropertySlider: "Labeled sliders with live value display" 
  - IconButton: "Consistent button styling with hover effects"
  - SelectionHighlight: "Visual highlighting for selected elements"
details: |
  - Use p5.js createDiv/createButton for consistency
  - Implement clean show/hide methods with display:block/none
  - Add hover states and visual feedback
  - Include proper event listener cleanup in destroy() methods
validation: "node -c editor/ui-components.js"
```

3. **CREATE template selector component**

```yaml
action: CREATE
file: "editor/template-selector.js"
purpose: "Simple template selection interface"
features:
  - Template grid with thumbnails
  - FORCE parameter preview
  - One-click template loading
  - Custom template import
integration: |
  class TemplateSelector {
    constructor(editorSystem, builder)
    setupTemplateGrid()
    loadTemplate(templateName)
    showTemplatePreview(config)
  }
details: |
  - 4 default templates: Horse, Fish, Lizard, Biped
  - Visual previews using mini-canvas or SVG
  - Integration with existing creature configs
  - Simple click-to-load interaction
validation: "Template loads without errors and integrates with builder"
```

4. **CREATE skeleton editor component**

```yaml
action: CREATE  
file: "editor/skeleton-editor.js"
purpose: "Core skeleton editing with simplified interaction"
features:
  - Chain selection by clicking
  - Visual bone/joint highlighting
  - Basic bone manipulation (length, angle)
  - IK test mode with pose preview
interaction_model: |
  - Click chain to select (yellow highlight)
  - Properties appear in sidebar contextually
  - Drag bone ends to adjust length/angle
  - IK test button for pose validation
details: |
  - Reuse core logic from current bone-manipulator.js
  - Simplified interaction: click → highlight → edit
  - Visual feedback with consistent colors
  - Performance optimization: throttle expensive operations
validation: "Chain selection and basic manipulation work smoothly"
```

5. **CREATE contextual property panel**

```yaml
action: CREATE
file: "editor/property-panel.js" 
purpose: "Context-sensitive property editing interface"
behavior: |
  - Shows relevant properties based on current selection
  - No selection: Template options
  - Chain selected: Chain properties (role, type, constraints)
  - Bone selected: Bone properties (length, angle, attachment)
  - IK mode: Pose controls and constraint validation
ui_components: |
  - Use CollapsibleSection for organization
  - PropertySlider for numeric values
  - IconButton for actions (test, reset, etc.)
  - Real-time updates with throttling
details: |
  - Progressive disclosure: show only relevant controls
  - Live preview of changes
  - Undo/redo integration for all modifications
  - Input validation with visual feedback
validation: "Properties update correctly and persist through selection changes"
```

6. **CREATE unified editor system**

```yaml
action: CREATE
file: "editor/editor-system.js"
purpose: "Main orchestrator replacing dual editor architecture"
architecture: |
  class EditorSystem {
    constructor(builder)     // Initialize with builder reference
    setupUI()               // Create toolbar and sidebar containers
    show()                  // Enter editor mode (<100ms)
    hide()                  // Exit editor mode, restore state
    update()                // Throttled update cycle
    draw()                  // Editor overlay rendering
    handleInput()           // Unified input handling
    cleanup()               // Proper DOM/event cleanup
  }
components: |
  - this.templateSelector = new TemplateSelector(this, builder)
  - this.skeletonEditor = new SkeletonEditor(this, builder)  
  - this.propertyPanel = new PropertyPanel(this, builder)
  - this.configManager = new ConfigManager(builder)
  - this.operationHistory = new OperationHistory()
integration: |
  - Clean builder.editorActive flag management
  - State preservation across mode switches
  - Performance monitoring and optimization
  - Proper error handling and recovery
validation: "Editor toggle works smoothly with all components functional"
```

7. **UPDATE creature builder integration**

```yaml
action: MODIFY
file: "creature-builder.js"
changes: |
  - REPLACE complex editor integration with simple hooks
  - ADD pauseForEditor() method to cleanly pause locomotion
  - ADD resumeFromEditor() method to restore state  
  - SIMPLIFY editorActive flag usage
  - REMOVE unused editor-specific code
details: |
  // Replace existing editor integration around line 53
  this.editorActive = false;
  
  pauseForEditor() {
    this.savedLocomotion = this.activeLocomotion;
    this.activeLocomotion = null;
    this.renderMode = 'skeleton';
  }
  
  resumeFromEditor() {
    this.activeLocomotion = this.savedLocomotion;
    this.renderMode = 'current';
  }
validation: "Builder integration works without affecting core functionality"
```

8. **UPDATE main sketch integration**

```yaml
action: MODIFY
file: "sketch.js"
changes: |
  - SIMPLIFY editor initialization
  - STREAMLINE keyPressed handler
  - OPTIMIZE draw loop integration
  - REMOVE complex editor event handling
updated_code: |
  let builder;
  let editorSystem;

  function setup() {
    createCanvas(windowWidth, windowHeight);
    builder = new ModularCreatureBuilder();
    builder.buildHorse();
    editorSystem = new EditorSystem(builder);
  }

  function draw() {
    background(240);
    builder.update();
    builder.draw();
    if (editorSystem.active) {
      editorSystem.update();
      editorSystem.draw();
    }
  }

  function keyPressed() {
    if (key === 'E' || key === 'e') {
      if (editorSystem.active) {
        editorSystem.hide();
      } else {
        editorSystem.show();
      }
      return;
    }
    // Other key handlers...
  }
validation: "Main loop runs smoothly with editor toggle functional"
```

9. **UPDATE HTML script loading**

```yaml
action: MODIFY
file: "index.html"
changes: |
  - REMOVE old editor script tags
  - ADD new editor component scripts in correct order
  - ENSURE proper loading sequence
script_order: |
  <script src="editor/ui-components.js"></script>
  <script src="editor/config-manager.js"></script>
  <script src="editor/operation-history.js"></script>
  <script src="editor/template-selector.js"></script>
  <script src="editor/skeleton-editor.js"></script>
  <script src="editor/property-panel.js"></script>
  <script src="editor/editor-system.js"></script>
validation: "No console errors on page load, all components available"
```

10. **IMPLEMENT comprehensive validation and testing**

```yaml
action: CREATE
file: "tests/editor-rewrite-validation.js"
purpose: "Comprehensive testing of new editor system"
test_categories: |
  - Performance: Toggle time <100ms, 60fps preview
  - Functionality: Template loading, skeleton editing, save/load
  - Integration: Builder state management, locomotion pause/resume
  - UI: Progressive disclosure, contextual properties, visual feedback
  - Memory: DOM cleanup, event listener management
  - Error handling: Graceful degradation, recovery mechanisms
validation_commands: |
  - Open index.html in browser
  - Press 'E' to enter editor (time should be <100ms)
  - Load different templates (should work smoothly)
  - Select chains/bones (should highlight and show properties)
  - Edit properties (should update in real-time)
  - Toggle back to main app (should restore locomotion)
  - Repeat cycle 10 times (no memory leaks or performance degradation)
success_criteria: |
  - All template loading works without errors
  - Chain selection and editing is responsive and intuitive
  - Property panel shows relevant controls contextually
  - Performance remains smooth throughout usage
  - No console errors during any operation
  - Memory usage remains stable across multiple editor sessions
```

## Validation Gates

### **Syntax & Structure Validation**
```bash
# Verify all new files compile without syntax errors
node -c editor/ui-components.js
node -c editor/template-selector.js  
node -c editor/skeleton-editor.js
node -c editor/property-panel.js
node -c editor/editor-system.js
node -c creature-builder.js
node -c sketch.js
```

### **Integration Testing**
```bash
# Open in browser and verify:
# 1. No console errors on page load
# 2. Press 'E' - editor appears in <100ms
# 3. Template selection works
# 4. Chain selection and highlighting works
# 5. Property panel updates contextually
# 6. Press 'E' again - returns to normal mode
# 7. Repeat 5 times - no performance degradation
```

### **Performance Validation**
```bash
# Browser DevTools Performance tab:
# 1. Record editor toggle operations
# 2. Verify each toggle completes in <100ms
# 3. Check memory usage remains stable
# 4. Confirm 60fps during skeleton editing
```

### **User Experience Testing**
```bash
# Manual UX validation:
# 1. New user can understand interface within 30 seconds
# 2. Template selection is intuitive and immediate
# 3. Chain selection provides clear visual feedback
# 4. Property editing feels responsive and predictable
# 5. Overall workflow feels smooth and natural
```

## Success Metrics

### **Quantitative Targets**
- **Performance**: <100ms editor toggle, 60fps editing, <50ms property updates
- **Code Quality**: <500 lines main editor, <200 lines per component, 90%+ test coverage
- **Memory**: No leaks after 10 editor cycles, <10MB DOM overhead
- **Error Rate**: Zero console errors during normal operation

### **Qualitative Goals**
- **Simplicity**: Single, unified editor system vs. current dual architecture
- **Intuitiveness**: Progressive disclosure of relevant controls only
- **Consistency**: Unified interaction patterns throughout interface
- **Maintainability**: Clear separation of concerns, minimal coupling
- **Extensibility**: Easy to add new templates and editing features

## Risk Mitigation

### **High Risk: Integration Breakage**
- **Mitigation**: Implement in isolated branch, maintain existing integration points, comprehensive testing before merge
- **Rollback**: Keep current implementation in backup branch, clear rollback procedure

### **Medium Risk: Performance Regression**  
- **Mitigation**: Performance monitoring throughout development, throttling of expensive operations, memory profiling
- **Monitoring**: Browser DevTools validation at each checkpoint

### **Low Risk: UI/UX Issues**
- **Mitigation**: User testing with simple tasks, iterative refinement based on feedback
- **Validation**: Informal usability testing with development team

This specification provides a complete roadmap for transforming the editor from its current complex state into a unified, intuitive system that maintains the powerful features while dramatically improving usability and maintainability.