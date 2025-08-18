# TASK PRP: Complete Editor Rewrite Implementation

> Execute complete transformation from complex dual-editor architecture to unified, intuitive system

## Critical Context

```yaml
context:
  docs:
    - file: PRPs/SPEC_PRP/complete-editor-rewrite.md
      focus: UX wireframe, component architecture, performance requirements
    - file: creature-builder.js
      focus: Lines 1-100 constructor, editorActive integration, renderMode system
    - file: sketch.js
      focus: Current editor integration pattern, keyPressed handler

  patterns:
    - file: creature-builder.js
      copy: Class constructor pattern, system initialization approach
    - file: styling/ThemeManager.js
      copy: Component lifecycle (constructor → setup → cleanup)
    - file: editor/config-manager.js
      copy: Save/load architecture (preserve this component)
    - file: editor/operation-history.js
      copy: Undo/redo system pattern (preserve this component)

  gotchas:
    - issue: "p5.js DOM elements persist between sketch runs"
      fix: "Always check if element exists before creating, call .remove() on cleanup"
    - issue: "Multiple editor script loads cause class redefinition"
      fix: "Delete old scripts before adding new ones to index.html"
    - issue: "Builder locomotion system conflicts with editor state"
      fix: "Use pauseForEditor()/resumeFromEditor() pattern for clean state management"
    - issue: "Canvas coordinate system vs DOM positioning"
      fix: "Use absolute positioning for UI, keep canvas coordinates separate"
    - issue: "FIK.js performance degrades with complex UI updates"
      fix: "Throttle expensive operations using frameCount % N pattern"
```

## Setup Tasks

```
READ creature-builder.js:
  - UNDERSTAND: Constructor pattern lines 1-70, editorActive integration line 53
  - FIND: System initialization approach (locomotionSystem, gaitSystem, etc.)
  - NOTE: renderMode system, DOM cleanup patterns
  - VALIDATE: node -c creature-builder.js
  - IF_FAIL: Fix syntax errors before proceeding

READ sketch.js:
  - UNDERSTAND: Global variable declarations, editor integration lines 2,11,15,28,40
  - FIND: keyPressed handler pattern, draw loop structure
  - NOTE: Current editorSystem initialization and toggle logic
  - VALIDATE: node -c sketch.js
  - IF_FAIL: Check for missing dependencies or syntax errors

READ index.html:
  - UNDERSTAND: Current script loading order for editor components
  - FIND: All editor/*.js script tags between creature-builder.js and sketch.js
  - NOTE: Dependencies and loading sequence
  - VALIDATE: Open in browser, check for console errors
  - IF_FAIL: Verify all script paths exist and are accessible
```

## Phase 1: Clean Removal

```
DELETE editor/anatomy-editor.js:
  - REMOVE: 850-line complex dual-architecture file
  - BACKUP: Copy to editor/backup/ if needed for reference
  - VALIDATE: File no longer exists
  - IF_FAIL: Check file permissions

DELETE editor/editor-mode.js:
  - REMOVE: 650-line overlapping functionality file
  - BACKUP: Copy core bone manipulation logic if needed
  - VALIDATE: File no longer exists
  - IF_FAIL: Check file permissions

DELETE editor/editor-ui.js:
  - REMOVE: 400-line inconsistent DOM patterns file
  - VALIDATE: File no longer exists
  - IF_FAIL: Check file permissions

DELETE editor/editor-ui-backup.js:
  - REMOVE: Backup file no longer needed
  - VALIDATE: File no longer exists
  - IF_FAIL: Check file permissions

DELETE editor/bone-manipulator.js:
  - PRESERVE: Copy core manipulation logic to notes for reuse
  - REMOVE: 300-line file with good core logic
  - VALIDATE: File no longer exists
  - IF_FAIL: Save important functions before deletion

DELETE editor/constraint-editor.js:
  - PRESERVE: Copy constraint visualization patterns for reuse
  - REMOVE: 250-line constraint visualization file
  - VALIDATE: File no longer exists
  - IF_FAIL: Save visualization logic before deletion

DELETE editor/template-gallery.js:
  - REMOVE: 180-line overly complex UI file
  - VALIDATE: File no longer exists
  - IF_FAIL: Check file permissions

DELETE editor/template-palette.js:
  - REMOVE: 120-line drag-drop system file
  - VALIDATE: File no longer exists
  - IF_FAIL: Check file permissions

DELETE editor/chain-hierarchy.js:
  - REMOVE: 100-line selection management file
  - VALIDATE: File no longer exists
  - IF_FAIL: Check file permissions

DELETE editor/chain-properties.js:
  - REMOVE: 80-line property editing file
  - VALIDATE: File no longer exists
  - IF_FAIL: Check file permissions
```

## Phase 2: Foundation Components

```
CREATE editor/ui-components.js:
  - IMPLEMENT: Foundational UI component system
  - COPY_PATTERN: styling/ThemeManager.js component lifecycle
  - INCLUDE:
    ```javascript
    // CollapsibleSection for expandable content
    class CollapsibleSection {
        constructor(parent, title, expanded = false)
        show() / hide()
        setContent(htmlString)
        destroy()
    }
    
    // PropertySlider for numeric inputs with live feedback
    class PropertySlider {
        constructor(parent, label, min, max, value, callback)
        setValue(value)
        getValue()
        destroy()
    }
    
    // IconButton for consistent button styling
    class IconButton {
        constructor(parent, text, callback, icon = null)
        setEnabled(enabled)
        destroy()
    }
    
    // SelectionHighlight for visual element highlighting
    class SelectionHighlight {
        constructor()
        highlightChain(chainIndex, color = [255, 255, 0])
        highlightBone(chainIndex, boneIndex, color = [255, 100, 100])
        clear()
        draw()
    }
    ```
  - VALIDATE: node -c editor/ui-components.js
  - IF_FAIL: Check for syntax errors, verify p5.js DOM methods available

CREATE editor/template-selector.js:
  - IMPLEMENT: Simple template selection interface
  - COPY_PATTERN: creature-builder.js template loading approach
  - INCLUDE:
    ```javascript
    class TemplateSelector {
        constructor(editorSystem, builder) {
            this.editorSystem = editorSystem;
            this.builder = builder;
            this.container = null;
            this.templates = {
                'horse': { name: 'Horse', preview: '🐎', config: 'buildHorse' },
                'fish': { name: 'Fish', preview: '🐟', config: 'buildFish' },
                'lizard': { name: 'Lizard', preview: '🦎', config: 'buildLizard' },
                'biped': { name: 'Biped', preview: '🚶', config: 'buildBird' }
            };
        }
        
        setupUI(parent)
        loadTemplate(templateName)
        showTemplatePreview(config)
        destroy()
    }
    ```
  - VALIDATE: node -c editor/template-selector.js
  - IF_FAIL: Check template names match builder methods

CREATE editor/skeleton-editor.js:
  - IMPLEMENT: Core skeleton editing with simplified interaction
  - COPY_PATTERN: Deleted bone-manipulator.js core logic
  - INCLUDE:
    ```javascript
    class SkeletonEditor {
        constructor(editorSystem, builder) {
            this.editorSystem = editorSystem;
            this.builder = builder;
            this.selectedChain = null;
            this.selectedBone = null;
            this.highlighter = new SelectionHighlight();
            this.ikTestMode = false;
        }
        
        handleMouseClick(mouseX, mouseY)
        selectChain(chainIndex)
        selectBone(chainIndex, boneIndex)
        clearSelection()
        updateBoneProperties(chainIndex, boneIndex, properties)
        toggleIKTest()
        draw()
        destroy()
    }
    ```
  - VALIDATE: node -c editor/skeleton-editor.js
  - IF_FAIL: Check FIK.js integration and chain access methods

CREATE editor/property-panel.js:
  - IMPLEMENT: Context-sensitive property editing interface
  - COPY_PATTERN: Deleted chain-properties.js structure
  - INCLUDE:
    ```javascript
    class PropertyPanel {
        constructor(editorSystem, builder) {
            this.editorSystem = editorSystem;
            this.builder = builder;
            this.container = null;
            this.currentContext = 'none'; // 'none', 'chain', 'bone'
            this.components = {};
        }
        
        setupUI(parent)
        updateContext(type, data)
        showChainProperties(chainIndex)
        showBoneProperties(chainIndex, boneIndex)
        showTemplateOptions()
        clearProperties()
        destroy()
    }
    ```
  - VALIDATE: node -c editor/property-panel.js
  - IF_FAIL: Check PropertySlider and UI component dependencies
```

## Phase 3: Main Editor System

```
CREATE editor/editor-system.js:
  - IMPLEMENT: Main orchestrator replacing dual editor architecture
  - COPY_PATTERN: creature-builder.js constructor and system management
  - INCLUDE:
    ```javascript
    class EditorSystem {
        constructor(builder) {
            this.builder = builder;
            this.active = false;
            
            // Sub-components
            this.templateSelector = new TemplateSelector(this, builder);
            this.skeletonEditor = new SkeletonEditor(this, builder);
            this.propertyPanel = new PropertyPanel(this, builder);
            this.configManager = new ConfigManager(builder); // Preserve existing
            this.operationHistory = new OperationHistory(); // Preserve existing
            
            // UI containers
            this.ui = { toolbar: null, sidebar: null };
            
            // State management
            this.savedBuilderState = null;
            this.performanceMonitor = { lastToggle: 0, frameSkips: 0 };
            
            this.setupUI();
        }
        
        setupUI()
        show()      // <100ms performance target
        hide()      // Restore builder state
        update()    // Throttled update cycle
        draw()      // Editor overlay rendering
        handleMouseClick(mouseX, mouseY)
        handleKeyboard(key, keyCode)
        cleanup()   // Proper DOM/event cleanup
    }
    ```
  - VALIDATE: node -c editor/editor-system.js
  - IF_FAIL: Check all sub-component dependencies exist and are properly imported
```

## Phase 4: Integration Updates

```
UPDATE creature-builder.js:
  - FIND: this.editorActive = false; (around line 53)
  - REPLACE: 
    ```javascript
    // Editor integration - simplified
    this.editorActive = false;
    this.savedLocomotion = null;
    ```
  - ADD_AFTER_constructor:
    ```javascript
    // Editor state management methods
    pauseForEditor() {
        this.savedLocomotion = this.activeLocomotion;
        this.activeLocomotion = null;
        this.renderMode = 'skeleton';
    }
    
    resumeFromEditor() {
        this.activeLocomotion = this.savedLocomotion;
        this.renderMode = 'current';
        this.savedLocomotion = null;
    }
    ```
  - VALIDATE: node -c creature-builder.js
  - IF_FAIL: Check method placement doesn't conflict with existing methods

UPDATE sketch.js:
  - FIND: let editor; (line 2)
  - REPLACE: let editorSystem;
  - FIND: editor = new EditorMode(builder); (line 11)
  - REPLACE: editorSystem = new EditorSystem(builder);
  - FIND: editor.update(); editor.draw(); (lines 15-19)
  - REPLACE:
    ```javascript
    if (editorSystem.active) {
        editorSystem.update();
        builder.update(); // Update builder but locomotion paused
        builder.draw();
        editorSystem.draw(); // Draw editor overlay
    } else {
        builder.update();
        builder.draw();
    }
    ```
  - FIND: keyPressed() editor toggle (around line 40)
  - REPLACE:
    ```javascript
    if (key === 'E' || key === 'e') {
        console.time('editor-toggle');
        
        if (editorSystem.active) {
            editorSystem.hide();
            builder.resumeFromEditor();
        } else {
            builder.pauseForEditor();
            editorSystem.show();
        }
        
        console.timeEnd('editor-toggle');
        return;
    }
    ```
  - VALIDATE: node -c sketch.js
  - IF_FAIL: Check global variable references and method calls

UPDATE index.html:
  - FIND: All editor script tags (between creature-builder.js and sketch.js)
  - REMOVE: All old editor/*.js script tags except config-manager.js and operation-history.js
  - ADD: New script tags in correct order:
    ```html
    <script src="editor/config-manager.js"></script>
    <script src="editor/operation-history.js"></script>
    <script src="editor/ui-components.js"></script>
    <script src="editor/template-selector.js"></script>
    <script src="editor/skeleton-editor.js"></script>
    <script src="editor/property-panel.js"></script>
    <script src="editor/editor-system.js"></script>
    ```
  - VALIDATE: Open index.html in browser, check console for errors
  - IF_FAIL: Verify script paths exist and loading order is correct
```

## Phase 5: Validation Checkpoints

```
CHECKPOINT syntax:
  - RUN: node -c editor/ui-components.js && node -c editor/template-selector.js && node -c editor/skeleton-editor.js && node -c editor/property-panel.js && node -c editor/editor-system.js && node -c creature-builder.js && node -c sketch.js
  - REQUIRE: All files parse without syntax errors
  - IF_FAIL: Fix syntax errors one file at a time, check for missing dependencies
  - CONTINUE: Only when all files compile successfully

CHECKPOINT basic_integration:
  - OPEN: index.html in browser
  - CHECK: No console errors on page load
  - TEST: Press '3' to load horse, verify normal animation
  - TEST: Press 'E', verify editor appears with toolbar and sidebar
  - TEST: Template selection shows 4 templates (Horse, Fish, Lizard, Biped)
  - TEST: Click on skeleton chains, verify selection highlighting
  - TEST: Press 'E' again, verify return to normal animation
  - REQUIRE: All tests pass without errors
  - IF_FAIL: Check browser console for specific errors, verify DOM element creation

CHECKPOINT performance:
  - OPEN: Browser DevTools > Performance tab
  - RECORD: Toggle editor mode 5 times (E key)
  - MEASURE: Each toggle should complete in <100ms (check console.time output)
  - CHECK: No memory leaks in heap snapshots
  - TEST: Editor maintains 60fps during skeleton selection and highlighting
  - REQUIRE: Performance targets met
  - IF_FAIL: Profile slow operations, add throttling where needed

CHECKPOINT functionality:
  - ACTIVATE: Editor mode (press 'E')
  - TEST: Click different templates, verify they load correctly
  - TEST: Click on horse skeleton chains, verify highlighting appears
  - TEST: Sidebar shows relevant properties for selected chains
  - TEST: Property sliders update and respond to input
  - TEST: Save/export functionality works (ConfigManager integration)
  - REQUIRE: All core functionality operational
  - IF_FAIL: Debug specific failing feature, check component integration

CHECKPOINT memory_management:
  - TEST: Toggle editor on/off 10 times
  - CHECK: Browser memory usage remains stable
  - VERIFY: No DOM elements leak (inspect element count)
  - VERIFY: Event listeners properly cleaned up
  - REQUIRE: No memory leaks detected
  - IF_FAIL: Add .remove() calls to destroy() methods, check event listener cleanup
```

## Debug Patterns

```
DEBUG editor_not_showing:
  - CHECK: Console for "Cannot find variable: EditorSystem"
  - VERIFY: Script tag order in index.html
  - TEST: typeof EditorSystem in browser console
  - RUN: EditorSystem.prototype in console to verify class loaded
  - FIX: Ensure editor-system.js loads after all dependencies

DEBUG ui_elements_missing:
  - CHECK: Console for DOM creation errors
  - RUN: editorSystem.ui.sidebar in browser console
  - VERIFY: Elements exist but may have display:none
  - CHECK: CSS positioning and z-index conflicts
  - ADD: console.log in setupUI() methods to track creation
  - FIX: Verify p5.js DOM methods (createDiv, createButton) work correctly

DEBUG template_loading_fails:
  - CHECK: Browser console for builder method errors
  - TEST: builder.buildHorse() manually in console
  - VERIFY: Template names match builder methods exactly
  - ADD: console.log in loadTemplate() method
  - FIX: Correct template name mismatches or missing builder methods

DEBUG selection_not_working:
  - CHECK: Mouse coordinates in console (mouseX, mouseY)
  - VERIFY: Builder has chains loaded (builder.chains.length > 0)
  - TEST: builder.chains in browser console
  - ADD: console.log in handleMouseClick() method
  - FIX: Adjust coordinate calculations or selection threshold distance

DEBUG performance_issues:
  - CHECK: Browser performance tab for long tasks >100ms
  - ADD: console.time() around expensive operations
  - VERIFY: Each editor toggle completes in <100ms
  - PROFILE: Update loops for redundant calculations
  - FIX: Add throttling (frameCount % N) for expensive operations

DEBUG save_load_broken:
  - CHECK: ConfigManager integration errors
  - TEST: configManager.saveConfig() manually
  - VERIFY: JSON structure matches expected format
  - CHECK: File permissions for local storage or downloads
  - FIX: Update ConfigManager integration with new editor structure
```

## Rollback Strategy

```
ROLLBACK complete:
  - RESTORE: All deleted editor files from backup
  - REVERT: All changes to creature-builder.js, sketch.js, index.html
  - TEST: Original functionality works (press '3' for horse, 'E' for old editor)
  - VERIFY: No console errors in original state

ROLLBACK partial (if new editor works but has issues):
  - KEEP: New editor files for debugging
  - DISABLE: Editor toggle in keyPressed (comment out editor activation)
  - ISOLATE: Test new components separately in standalone HTML file
  - DEBUG: Fix issues without affecting main application

ROLLBACK emergency (if application broken):
  - IMMEDIATE: Revert index.html script tags to original state
  - RESTORE: Original sketch.js from backup
  - VERIFY: Basic creature animation works
  - INVESTIGATE: Root cause before attempting fixes
```

## Success Criteria

### Functional Requirements
- [ ] EditorSystem class created and integrated successfully
- [ ] Template selection loads creatures without errors
- [ ] Chain/bone selection and highlighting works smoothly
- [ ] Property panel shows contextual controls
- [ ] Save/load functionality preserved and working
- [ ] Editor toggle works reliably with 'E' key

### Performance Requirements
- [ ] Editor toggle completes in <100ms (verified by console.time)
- [ ] Skeleton editing maintains 60fps performance
- [ ] No memory leaks after 10 editor cycles
- [ ] DOM element count remains stable

### Quality Requirements
- [ ] No console errors during normal operation
- [ ] All new files pass syntax validation
- [ ] UI elements positioned correctly without canvas overlap
- [ ] State preservation across mode switches
- [ ] Graceful error handling and recovery

### Code Quality Requirements
- [ ] Unified architecture replaces dual-editor system
- [ ] Clean component separation and lifecycle management
- [ ] Consistent p5.js DOM usage throughout
- [ ] Proper event listener cleanup in destroy() methods
- [ ] JSDoc documentation for public methods

## Risk Assessment

### High Risk Areas
- **Builder Integration**: Changes to core creature-builder.js could break animation
  - *Mitigation*: Minimal changes, preserve existing patterns, comprehensive testing
- **Performance Regression**: New architecture might be slower than optimized old code
  - *Mitigation*: Performance monitoring, throttling, immediate rollback if >100ms toggle

### Medium Risk Areas  
- **Template Loading**: Integration between new selector and existing builder methods
  - *Mitigation*: Test each template individually, verify method names match
- **DOM Management**: p5.js DOM element lifecycle and cleanup
  - *Mitigation*: Consistent destroy() patterns, memory profiling

### Low Risk Areas
- **UI Styling**: Visual appearance and layout issues
  - *Mitigation*: CSS can be adjusted without affecting functionality
- **Feature Extensions**: Adding new editing capabilities
  - *Mitigation*: Core architecture supports extensions, low impact changes