/**
 * Anatomy Editor - Main editor for modular creature manipulation
 * 
 * This is a complete redesign based on understanding the actual system:
 * - Template-driven creature creation with FORCE variations
 * - Chain hierarchy manipulation with parent-child relationships  
 * - Anatomical constraint editing with biological limits
 * - Attachment point system for intuitive chain reattachment
 * - IK-aware editing that preserves structural integrity
 */

class AnatomyEditor {
    constructor(builder) {
        this.builder = builder;
        this.active = false;
        
        // UI Components
        this.templateGallery = null;
        this.chainHierarchy = null;
        this.chainProperties = null;
        this.zoomViewer = null;
        this.attachmentSystem = null;
        
        // State Management
        this.selectedChain = null;
        this.selectedBone = null;
        this.selectedJoint = null;
        this.draggedChain = null;
        this.showAttachmentPoints = false;
        
        // Visual State
        this.zoomViewOpen = false;
        this.attachmentMode = false;
        
        // Performance & UX
        this.updateThrottle = 16; // 60fps
        this.lastUpdate = 0;
        
        console.log('🦴 AnatomyEditor initialized - Template-driven creature editing');
    }
    
    /**
     * Initialize the anatomy editor UI
     */
    initialize() {
        this.createMainLayout();
        this.initializeComponents();
        this.setupEventHandlers();
        
        console.log('✅ AnatomyEditor UI ready');
    }
    
    /**
     * Create main editor layout
     */
    createMainLayout() {
        // Main editor container
        this.container = createDiv();
        this.container.id('anatomy-editor');
        this.container.position(0, 0);
        this.container.style(`
            width: 100vw;
            height: 100vh;
            position: fixed;
            z-index: 1000;
            background: rgba(0,0,0,0.1);
            display: none;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `);
        
        // Left sidebar for controls
        this.sidebar = createDiv();
        this.sidebar.parent(this.container);
        this.sidebar.style(`
            width: 300px;
            height: 100vh;
            background: #f8f9fa;
            border-right: 2px solid #dee2e6;
            overflow-y: auto;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        `);
        
        // Main canvas area (existing p5 canvas will show here)
        this.canvasArea = createDiv();
        this.canvasArea.parent(this.container);
        this.canvasArea.style(`
            position: absolute;
            left: 300px;
            top: 0;
            width: calc(100vw - 300px);
            height: 100vh;
            background: #ffffff;
        `);
        
        // Overlay for attachment point visualization
        this.attachmentOverlay = createDiv();
        this.attachmentOverlay.parent(this.canvasArea);
        this.attachmentOverlay.style(`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10;
        `);
    }
    
    /**
     * Initialize all editor components
     */
    initializeComponents() {
        // Template Gallery - creature selection with FORCE variations
        this.templateGallery = new TemplateGallery(this.builder, this);
        this.templateGallery.initialize(this.sidebar);
        
        // Chain Hierarchy Tree - visual chain relationships
        this.chainHierarchy = new ChainHierarchy(this.builder, this);
        this.chainHierarchy.initialize(this.sidebar);
        
        // Chain Properties Panel - selected chain details
        this.chainProperties = new ChainProperties(this.builder, this);
        this.chainProperties.initialize(this.sidebar);
        
        // Attachment Point System - drag-drop reattachment
        this.attachmentSystem = new AttachmentPointSystem(this.builder, this);
        this.attachmentSystem.initialize(this.attachmentOverlay);
        
        // Zoom Viewer - detailed chain editing (modal)
        this.zoomViewer = new ZoomChainViewer(this.builder, this);
        this.zoomViewer.initialize(this.container);
        
        console.log('🏗️ All editor components initialized');
    }
    
    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Canvas click handling for chain selection
        this.canvasArea.mousePressed(() => {
            if (!this.active) return;
            this.handleCanvasClick(mouseX, mouseY);
        });
        
        // Key shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.active) return;
            this.handleKeyPress(e);
        });
    }
    
    /**
     * Show the anatomy editor
     */
    show() {
        this.active = true;
        this.container.style('display: block');
        
        // Pause creature locomotion for editing
        this.builder.editorActive = true;
        if (this.builder.activeLocomotion) {
            this.savedLocomotion = this.builder.activeLocomotion;
            this.builder.activeLocomotion = null;
        }
        
        // Switch to skeleton render mode
        this.savedRenderMode = this.builder.renderMode;
        this.builder.renderMode = 'skeleton';
        
        // Update all components
        this.updateAll();
        
        console.log('👁️ AnatomyEditor activated');
    }
    
    /**
     * Hide the anatomy editor
     */
    hide() {
        this.active = false;
        this.container.style('display: none');
        
        // Restore creature state
        this.builder.editorActive = false;
        if (this.savedLocomotion) {
            this.builder.activeLocomotion = this.savedLocomotion;
        }
        if (this.savedRenderMode) {
            this.builder.renderMode = this.savedRenderMode;
        }
        
        // Clear selections
        this.clearSelections();
        
        console.log('👁️ AnatomyEditor deactivated');
    }
    
    /**
     * Main update loop
     */
    update() {
        if (!this.active) return;
        
        // Throttle updates for performance
        const now = performance.now();
        if (now - this.lastUpdate < this.updateThrottle) return;
        
        this.updateAll();
        this.lastUpdate = now;
    }
    
    /**
     * Update all components
     */
    updateAll() {
        if (this.templateGallery) this.templateGallery.update();
        if (this.chainHierarchy) this.chainHierarchy.update();
        if (this.chainProperties) this.chainProperties.update();
        if (this.attachmentSystem) this.attachmentSystem.update();
        if (this.zoomViewer && this.zoomViewOpen) this.zoomViewer.update();
    }
    
    /**
     * Handle canvas clicks for chain selection
     */
    handleCanvasClick(x, y) {
        // Adjust coordinates for canvas area offset
        const canvasX = x - 300;
        const canvasY = y;
        
        // Find clicked chain
        const clickedChain = this.findChainAtPoint(canvasX, canvasY);
        
        if (clickedChain !== null) {
            this.selectChain(clickedChain);
        } else {
            this.clearSelections();
        }
    }
    
    /**
     * Find chain at given point
     */
    findChainAtPoint(x, y) {
        const threshold = 15;
        
        for (let i = 0; i < this.builder.chains.length; i++) {
            const chain = this.builder.chains[i];
            
            for (let j = 0; j < chain.numBones; j++) {
                const bone = chain.bones[j];
                const dist = this.pointToLineDistance(
                    x, y,
                    bone.start.x, bone.start.y,
                    bone.end.x, bone.end.y
                );
                
                if (dist < threshold) {
                    return i;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Point to line distance calculation
     */
    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) return Math.sqrt(A * A + B * B);
        
        let param = dot / lenSq;
        param = Math.max(0, Math.min(1, param));
        
        const xx = x1 + param * C;
        const yy = y1 + param * D;
        
        return Math.sqrt((px - xx) * (px - xx) + (py - yy) * (py - yy));
    }
    
    /**
     * Select a chain
     */
    selectChain(chainIndex) {
        this.selectedChain = chainIndex;
        this.selectedBone = null;
        this.selectedJoint = null;
        
        // Update components
        this.chainHierarchy.setSelectedChain(chainIndex);
        this.chainProperties.setSelectedChain(chainIndex);
        
        // Show attachment points if in attachment mode
        if (this.attachmentMode) {
            this.attachmentSystem.showAttachmentPoints(chainIndex);
        }
        
        console.log(`🎯 Selected chain ${chainIndex}: ${this.builder.chainConfigs[chainIndex]?.role}`);
    }
    
    /**
     * Clear all selections
     */
    clearSelections() {
        this.selectedChain = null;
        this.selectedBone = null;
        this.selectedJoint = null;
        
        this.chainHierarchy.clearSelection();
        this.chainProperties.clearSelection();
        this.attachmentSystem.hideAttachmentPoints();
    }
    
    /**
     * Open zoom viewer for selected chain
     */
    openZoomViewer() {
        if (this.selectedChain === null) return;
        
        this.zoomViewOpen = true;
        this.zoomViewer.show(this.selectedChain);
    }
    
    /**
     * Close zoom viewer
     */
    closeZoomViewer() {
        this.zoomViewOpen = false;
        this.zoomViewer.hide();
    }
    
    /**
     * Enter attachment mode for chain reattachment
     */
    enterAttachmentMode() {
        if (this.selectedChain === null) return;
        
        this.attachmentMode = true;
        this.attachmentSystem.enterAttachmentMode(this.selectedChain);
        
        console.log('🔗 Entered attachment mode');
    }
    
    /**
     * Exit attachment mode
     */
    exitAttachmentMode() {
        this.attachmentMode = false;
        this.attachmentSystem.exitAttachmentMode();
        
        console.log('🔗 Exited attachment mode');
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyPress(event) {
        switch (event.key.toLowerCase()) {
            case 'escape':
                if (this.zoomViewOpen) {
                    this.closeZoomViewer();
                } else if (this.attachmentMode) {
                    this.exitAttachmentMode();
                } else {
                    this.hide();
                }
                break;
                
            case 'z':
                if (this.selectedChain !== null) {
                    this.openZoomViewer();
                }
                break;
                
            case 'a':
                if (this.selectedChain !== null) {
                    this.toggleAttachmentMode();
                }
                break;
                
            case 'i':
                // Toggle IK test mode (existing functionality)
                this.builder.debugManager?.handleKeyPress('i');
                break;
        }
    }
    
    /**
     * Toggle attachment mode
     */
    toggleAttachmentMode() {
        if (this.attachmentMode) {
            this.exitAttachmentMode();
        } else {
            this.enterAttachmentMode();
        }
    }
    
    /**
     * Load a creature template
     */
    loadTemplate(templateName, forceVariations = {}) {
        console.log(`🎨 Loading template: ${templateName}`, forceVariations);
        
        // Apply FORCE variations to builder config
        if (forceVariations.anatomicalScale) {
            this.builder.anatomicalScale = forceVariations.anatomicalScale;
        }
        if (forceVariations.rhythmIntensity) {
            this.builder.rhythmIntensity = forceVariations.rhythmIntensity;
        }
        if (forceVariations.curveVariation) {
            this.builder.curveVariation = forceVariations.curveVariation;
        }
        
        // Load the template
        switch (templateName) {
            case 'fish':
                this.builder.buildFish();
                break;
            case 'crane':
                this.builder.buildBipedalCrane();
                break;
            case 'horse':
                this.builder.buildHorse();
                break;
            case 'lizard':
                this.builder.buildLizard();
                break;
            default:
                console.warn(`Unknown template: ${templateName}`);
                return;
        }
        
        // Clear selections and update UI
        this.clearSelections();
        this.updateAll();
        
        console.log(`✅ Template ${templateName} loaded successfully`);
    }
    
    /**
     * Draw editor overlays
     */
    draw() {
        if (!this.active) return;
        
        // Draw selection highlight
        this.drawSelectionHighlight();
        
        // Draw attachment points if in attachment mode
        if (this.attachmentMode && this.attachmentSystem) {
            this.attachmentSystem.draw();
        }
    }
    
    /**
     * Draw selection highlight
     */
    drawSelectionHighlight() {
        if (this.selectedChain === null) return;
        
        const chain = this.builder.chains[this.selectedChain];
        if (!chain) return;
        
        push();
        
        // Highlight selected chain
        stroke(255, 215, 0); // Gold
        strokeWeight(6);
        noFill();
        
        for (let i = 0; i < chain.numBones; i++) {
            const bone = chain.bones[i];
            line(bone.start.x, bone.start.y, bone.end.x, bone.end.y);
        }
        
        // Draw chain info
        if (chain.numBones > 0) {
            const firstBone = chain.bones[0];
            const config = this.builder.chainConfigs[this.selectedChain];
            
            fill(255, 215, 0);
            noStroke();
            textAlign(CENTER);
            textSize(12);
            textStyle(BOLD);
            text(config?.role || 'Unknown', firstBone.start.x, firstBone.start.y - 15);
        }
        
        pop();
    }
    
    /**
     * Cleanup editor resources
     */
    cleanup() {
        if (this.container) {
            this.container.remove();
        }
        
        // Cleanup components
        if (this.templateGallery) this.templateGallery.cleanup();
        if (this.chainHierarchy) this.chainHierarchy.cleanup();
        if (this.chainProperties) this.chainProperties.cleanup();
        if (this.zoomViewer) this.zoomViewer.cleanup();
        if (this.attachmentSystem) this.attachmentSystem.cleanup();
        
        console.log('🧹 AnatomyEditor cleaned up');
    }
}

// Export for global access
window.AnatomyEditor = AnatomyEditor;