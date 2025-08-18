# FORCE Creature Template-Based Editor Design

## Overview

This design document outlines the architecture for a clean, modular creature editor built on p5.js DOM elements. The editor replaces the current cluttered 3000+ line implementation with a focused four-layer system (Skeleton, Muscle, Skinning, Styling) that follows FORCE principles and integrates seamlessly with the existing FIK.js animation system.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    p5.js Main Canvas                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Creature Animation Layer                  │   │
│  │         (FIK.js + ModularCreatureBuilder)          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Editor Overlay System                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Layer Tabs    │  │   Tool Panels   │  │  Properties │ │
│  │   🦴💪🎨✨      │  │   (Dynamic)     │  │   Sidebar   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Layer-Specific Managers                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────┐ │
│  │  Skeleton   │ │   Muscle    │ │   Skinning  │ │Styling│ │
│  │  Manager    │ │   Manager   │ │   Manager   │ │Manager│ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. EditorCore (Main Controller)
- **Responsibility**: Orchestrate editor lifecycle, layer switching, and state management
- **p5.js Integration**: Uses `createDiv()` for main container, manages DOM element lifecycle
- **State Management**: Maintains current layer, selection state, and undo/redo history

#### 2. LayerManager (Abstract Base)
- **Responsibility**: Define common interface for all four layers
- **FORCE Integration**: Provides base FORCE principle validation and suggestions
- **UI Pattern**: Standard show/hide/update lifecycle for consistent behavior

#### 3. TemplateGallery (Entry Point)
- **Responsibility**: Display and load creature templates with FORCE-aware previews
- **p5.js Implementation**: Uses `createImg()` for thumbnails, `createButton()` for selection
- **FORCE Visualization**: Color-coded anatomical lines (spine blue, limbs red)

## Components and Interfaces

### EditorCore Interface

```javascript
class EditorCore {
    constructor(builder, canvasElement) {
        this.builder = builder;           // ModularCreatureBuilder reference
        this.canvas = canvasElement;      // p5.js canvas for positioning
        this.currentLayer = 'skeleton';   // Active layer
        this.isActive = false;           // Editor state
        this.ui = {
            container: null,             // Main p5.createDiv()
            layerTabs: null,            // Tab navigation
            toolPanel: null,            // Dynamic tool area
            propertiesSidebar: null     // Properties panel
        };
        this.layers = {
            skeleton: new SkeletonManager(builder, this),
            muscle: new MuscleManager(builder, this),
            skinning: new SkinningManager(builder, this),
            styling: new StylingManager(builder, this)
        };
        this.history = new EditorHistory();
    }
    
    // Core lifecycle methods
    toggle() { /* Toggle editor on/off */ }
    switchLayer(layerName) { /* Change active layer */ }
    updateUI() { /* Refresh all UI elements */ }
    cleanup() { /* Remove all DOM elements */ }
}
```

### LayerManager Abstract Interface

```javascript
class LayerManager {
    constructor(builder, editorCore) {
        this.builder = builder;
        this.editor = editorCore;
        this.isActive = false;
        this.selection = null;
        this.tools = [];
        this.ui = {
            toolPanel: null,
            propertiesPanel: null
        };
    }
    
    // Abstract methods (must implement)
    show() { /* Show layer-specific UI */ }
    hide() { /* Hide layer-specific UI */ }
    update() { /* Update layer state */ }
    handleCanvasClick(x, y) { /* Handle canvas interactions */ }
    drawOverlay() { /* Draw layer-specific canvas overlays */ }
    
    // FORCE principle helpers
    validateFORCE(element) { /* Check FORCE compliance */ }
    suggestFORCE(element) { /* Provide FORCE suggestions */ }
    
    // Common UI patterns
    createToolPanel() { /* Create layer-specific tools */ }
    createPropertiesPanel() { /* Create properties sidebar */ }
}
```

### p5.js DOM Integration Pattern

```javascript
class UIComponent {
    constructor(parent) {
        this.parent = parent;
        this.container = null;
        this.elements = new Map();
    }
    
    create() {
        // Use p5.js DOM creation
        this.container = createDiv();
        this.container.parent(this.parent);
        this.container.position(0, 0);
        this.container.style(`
            position: absolute;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `);
        
        return this.container;
    }
    
    addButton(id, text, callback) {
        const btn = createButton(text);
        btn.parent(this.container);
        btn.mousePressed(callback);
        btn.style(`
            padding: 8px 16px;
            margin: 4px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.2s;
        `);
        this.elements.set(id, btn);
        return btn;
    }
    
    addSlider(id, min, max, value, callback) {
        const slider = createSlider(min, max, value);
        slider.parent(this.container);
        slider.input(callback);
        slider.style('width: 200px; margin: 8px;');
        this.elements.set(id, slider);
        return slider;
    }
    
    cleanup() {
        this.elements.forEach(element => element.remove());
        this.elements.clear();
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}
```

## Data Models

### EditorState Model

```javascript
const EditorState = {
    isActive: false,
    currentLayer: 'skeleton', // 'skeleton' | 'muscle' | 'skinning' | 'styling'
    selection: {
        type: null,           // 'chain' | 'bone' | 'muscle' | 'segment'
        id: null,            // Selected element ID
        data: null           // Element-specific data
    },
    layers: {
        skeleton: {
            chains: [],       // Chain configurations
            constraints: [],  // Joint constraints
            ikTargets: []    // IK test targets
        },
        muscle: {
            shapes: [],       // Muscle shape definitions
            deformSettings: {}// Deformation parameters
        },
        skinning: {
            hull: null,       // Generated hull data
            forceSettings: {} // FORCE rule parameters
        },
        styling: {
            borders: [],      // Border configurations
            segments: [],     // Segmentation data
            patterns: []      // Pattern assignments
        }
    },
    history: {
        operations: [],      // Undo/redo stack
        currentIndex: -1     // Current position in history
    }
};
```

### FORCE Validation Model

```javascript
const FORCEValidator = {
    // Rhythm validation
    checkRhythm(elements) {
        // Analyze spacing, alternation, flow
        return {
            score: 0.8,      // 0-1 rhythm score
            suggestions: ['Add curve variation', 'Adjust spacing']
        };
    },
    
    // Asymmetry validation
    checkAsymmetry(shape) {
        // Calculate symmetry percentage
        const symmetryPercent = calculateSymmetry(shape);
        return {
            isValid: symmetryPercent < 0.9,
            symmetryPercent: symmetryPercent,
            suggestions: symmetryPercent > 0.9 ? ['Add asymmetric elements'] : []
        };
    },
    
    // Thirds proportion validation
    checkProportions(creature) {
        // Validate head:body:legs ratios
        const ratios = calculateProportions(creature);
        return {
            isValid: isWithinThirdsRule(ratios),
            ratios: ratios,
            suggestions: ['Adjust head size', 'Extend leg proportions']
        };
    }
};
```

## Error Handling

### Graceful Degradation Strategy

```javascript
class ErrorHandler {
    static handleLayerError(layer, error) {
        console.error(`Layer ${layer} error:`, error);
        
        // Show user-friendly message
        const errorDiv = createDiv(`Layer temporarily unavailable: ${error.message}`);
        errorDiv.style('color: red; padding: 10px; background: #ffe6e6;');
        
        // Fallback to skeleton layer
        if (layer !== 'skeleton') {
            editorCore.switchLayer('skeleton');
        }
        
        // Log for debugging
        this.logError(layer, error);
    }
    
    static handleUIError(component, error) {
        console.warn(`UI component ${component} failed:`, error);
        
        // Remove problematic element
        try {
            const element = select(`#${component}`);
            if (element) element.remove();
        } catch (e) {
            console.warn('Could not remove failed UI element');
        }
        
        // Continue with reduced functionality
        return null;
    }
    
    static handlePerformanceIssue(operation, duration) {
        if (duration > 100) { // 100ms threshold
            console.warn(`Slow operation detected: ${operation} took ${duration}ms`);
            
            // Reduce quality for next operations
            this.enablePerformanceMode();
        }
    }
}
```

### Validation System

```javascript
class ValidationSystem {
    static validateCreatureConfig(config) {
        const errors = [];
        const warnings = [];
        
        // Check required fields
        if (!config.chains || config.chains.length === 0) {
            errors.push('Creature must have at least one chain');
        }
        
        // Validate chain connections
        config.chains.forEach((chain, index) => {
            if (chain.attachment === 'parent' && !chain.parentRole) {
                errors.push(`Chain ${index} has parent attachment but no parent role`);
            }
        });
        
        // FORCE principle validation
        const forceValidation = FORCEValidator.checkAsymmetry(config);
        if (!forceValidation.isValid) {
            warnings.push(`High symmetry detected (${forceValidation.symmetryPercent * 100}%)`);
        }
        
        return { errors, warnings, isValid: errors.length === 0 };
    }
    
    static validateUIState(editorState) {
        // Ensure UI state consistency
        if (editorState.currentLayer && !editorState.layers[editorState.currentLayer]) {
            console.warn('Invalid layer state, resetting to skeleton');
            editorState.currentLayer = 'skeleton';
        }
        
        // Validate selection
        if (editorState.selection.id && !this.selectionExists(editorState.selection)) {
            console.warn('Invalid selection, clearing');
            editorState.selection = { type: null, id: null, data: null };
        }
    }
}
```

## Testing Strategy

### Unit Testing Approach

```javascript
// Test layer managers independently
describe('SkeletonManager', () => {
    let skeletonManager;
    let mockBuilder;
    
    beforeEach(() => {
        mockBuilder = new MockCreatureBuilder();
        skeletonManager = new SkeletonManager(mockBuilder, null);
    });
    
    test('should select chain on canvas click', () => {
        const chain = mockBuilder.addTestChain();
        const result = skeletonManager.handleCanvasClick(100, 100);
        expect(result.selectedChain).toBe(chain.id);
    });
    
    test('should validate FORCE principles', () => {
        const chain = mockBuilder.addSymmetricChain();
        const validation = skeletonManager.validateFORCE(chain);
        expect(validation.warnings).toContain('High symmetry detected');
    });
});

// Test UI component lifecycle
describe('UIComponent', () => {
    test('should create and cleanup DOM elements', () => {
        const component = new UIComponent(document.body);
        component.create();
        
        expect(component.container).toBeTruthy();
        
        component.cleanup();
        expect(component.container).toBeNull();
    });
});
```

### Integration Testing

```javascript
// Test full editor workflow
describe('Editor Integration', () => {
    test('should complete full editing workflow', async () => {
        // 1. Toggle editor on
        const editor = new EditorCore(builder, canvas);
        editor.toggle();
        expect(editor.isActive).toBe(true);
        
        // 2. Load template
        await editor.layers.skeleton.loadTemplate('horse');
        expect(builder.creatureType).toBe('horse');
        
        // 3. Switch layers
        editor.switchLayer('muscle');
        expect(editor.currentLayer).toBe('muscle');
        
        // 4. Make modifications
        const muscle = editor.layers.muscle.addMuscle('torso', { size: 1.2 });
        expect(muscle).toBeTruthy();
        
        // 5. Save configuration
        const config = editor.exportConfig();
        expect(config.layers.muscle.shapes).toHaveLength(1);
        
        // 6. Toggle editor off
        editor.toggle();
        expect(editor.isActive).toBe(false);
    });
});
```

This design provides a clean, modular architecture that leverages p5.js DOM elements effectively while maintaining separation of concerns and supporting the FORCE creature editing workflow across all four layers.