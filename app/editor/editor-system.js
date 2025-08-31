/**
 * Editor System for Madhuban Creature Editor
 * Main orchestrator replacing dual editor architecture
 * Provides unified, intuitive visual design interface
 */

class EditorSystem {
    constructor(builder) {
        this.builder = builder;
        this.active = false;
        
        // Performance monitoring
        this.performanceMonitor = {
            lastToggle: 0,
            frameSkips: 0,
            updateThrottle: 16, // ~60fps target
            lastUpdate: 0
        };
        
        // State management
        this.savedBuilderState = null;
        
        // UI containers
        this.ui = {
            toolbar: null,
            sidebar: null,
            overlay: null
        };
        
        // Sidebar tabs and panels
        this.sidebarTabs = {
            container: null,
            buttons: {},
            panels: {}
        };
        
        // Sub-components - initialize after UI setup
        this.templateSelector = null;
        this.skeletonEditor = null;
        this.propertyPanel = null;
        this.configManager = null;
        this.operationHistory = null;
        
        // Component initialization
        this.initializeComponents();
        this.setupUI();
        
        console.log('✅ EditorSystem initialized with unified architecture');
    }
    
    /**
     * Initialize all sub-components
     */
    initializeComponents() {
        try {
            // Initialize preserved components
            this.configManager = new ConfigManager(this.builder);
            this.operationHistory = new OperationHistory();
            
            // Initialize new components  
            this.templateSelector = new TemplateSelector(this, this.builder);
            this.skeletonEditor = new SkeletonEditor(this, this.builder);
            this.propertyPanel = new PropertyPanel(this, this.builder);
            
            // Set up component callbacks
            this.setupComponentCallbacks();
            
            console.log('✅ All editor components initialized');
        } catch (error) {
            console.error('❌ Failed to initialize editor components:', error);
            this.handleComponentError(error);
        }
    }
    
    /**
     * Setup inter-component communication
     */
    setupComponentCallbacks() {
        // Template selector callback
        if (this.templateSelector) {
            this.templateSelector.onTemplateLoaded = (templateKey, template) => {
                console.log(`🎯 Template ${templateKey} loaded`);
                this.propertyPanel.updateContext('template', { templateKey, template });
            };
        }
        
        // Skeleton editor callbacks would be set up here
        // Property panel callbacks would be set up here
    }
    
    /**
     * Create main UI containers
     */
    setupUI() {
        // Create toolbar (60px height as per spec)
        this.createToolbar();
        
        // Create sidebar (200px width as per spec)
        this.createSidebar();
        
        // Initially hidden
        this.hideUI();
        
        console.log('🎨 Editor UI containers created');
    }
    
    /**
     * Create top toolbar
     */
    createToolbar() {
        if (this.ui.toolbar) {
            this.ui.toolbar.remove();
        }
        
        this.ui.toolbar = createDiv();
        this.ui.toolbar.id('madhuban-editor-toolbar');
        this.ui.toolbar.position(0, 0);
        this.ui.toolbar.style(`
            width: 100vw;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: fixed;
            z-index: 1000;
            border-bottom: 2px solid #5a67d8;
            display: none;
            padding: 0 20px;
            box-sizing: border-box;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        `);
        
        // Toolbar content container
        const toolbarContent = createDiv();
        toolbarContent.parent(this.ui.toolbar);
        toolbarContent.style(`
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 100%;
            color: white;
        `);
        
        // Left side - Title and mode indicator
        const leftSection = createDiv();
        leftSection.parent(toolbarContent);
        leftSection.style('display: flex; align-items: center;');
        
        const title = createDiv('🎨 Madhuban Creature Editor');
        title.parent(leftSection);
        title.style(`
            font-size: 18px;
            font-weight: bold;
            margin-right: 20px;
        `);
        
        this.modeIndicator = createDiv('Skeleton Mode');
        this.modeIndicator.parent(leftSection);
        this.modeIndicator.style(`
            background: rgba(255,255,255,0.2);
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
        `);
        
        // Right side - Actions and exit
        const rightSection = createDiv();
        rightSection.parent(toolbarContent);
        rightSection.style('display: flex; align-items: center; gap: 10px;');

        // Sidebar toggle button (hide/show clutter)
        this.sidebarToggleButton = createButton('☰ Panels');
        this.sidebarToggleButton.parent(rightSection);
        this.sidebarToggleButton.style(`
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `);
        this.sidebarToggleButton.mousePressed(() => {
            const isVisible = this.ui.sidebar?.style('display') !== 'none';
            this.ui.sidebar?.style('display', isVisible ? 'none' : 'block');
        });
        
        // Save button
        this.saveButton = createButton('💾 Save');
        this.saveButton.parent(rightSection);
        this.saveButton.style(`
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `);
        this.saveButton.mousePressed(() => this.handleSave());
        
        // Export button
        this.exportButton = createButton('📤 Export');
        this.exportButton.parent(rightSection);
        this.exportButton.style(`
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `);
        this.exportButton.mousePressed(() => this.handleExport());
        
        // Exit button
        this.exitButton = createButton('❌ Exit (E)');
        this.exitButton.parent(rightSection);
        this.exitButton.style(`
            background: rgba(255,100,100,0.8);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
        `);
        this.exitButton.mousePressed(() => this.hide());
    }
    
    /**
     * Create left sidebar
     */
    createSidebar() {
        if (this.ui.sidebar) {
            this.ui.sidebar.remove();
        }
        
        this.ui.sidebar = createDiv();
        this.ui.sidebar.id('madhuban-editor-sidebar');
        this.ui.sidebar.position(0, 60); // Below toolbar
        this.ui.sidebar.style(`
            width: 200px;
            height: calc(100vh - 60px);
            background: #f8f9fa;
            position: fixed;
            z-index: 999;
            border-right: 2px solid #dee2e6;
            display: none;
            overflow-y: auto;
            padding: 0;
            box-sizing: border-box;
        `);
        
        // Tabs header
        this.sidebarTabs.container = createDiv();
        this.sidebarTabs.container.parent(this.ui.sidebar);
        this.sidebarTabs.container.style(`
            display: flex;
            position: sticky;
            top: 0;
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            z-index: 1;
        `);

        const templatesTabBtn = createButton('Templates');
        templatesTabBtn.parent(this.sidebarTabs.container);
        templatesTabBtn.style(`
            flex: 1;
            padding: 10px 8px;
            border: none;
            background: #ffffff;
            cursor: pointer;
            font-size: 12px;
            border-right: 1px solid #e2e8f0;
        `);
        const propertiesTabBtn = createButton('Properties');
        propertiesTabBtn.parent(this.sidebarTabs.container);
        propertiesTabBtn.style(`
            flex: 1;
            padding: 10px 8px;
            border: none;
            background: #f3f4f6;
            cursor: pointer;
            font-size: 12px;
        `);
        this.sidebarTabs.buttons = { templates: templatesTabBtn, properties: propertiesTabBtn };

        // Panels
        const templatesPanel = createDiv();
        templatesPanel.parent(this.ui.sidebar);
        templatesPanel.style('padding: 10px;');
        const propertiesPanel = createDiv();
        propertiesPanel.parent(this.ui.sidebar);
        propertiesPanel.style('padding: 10px; display: none;');
        this.sidebarTabs.panels = { templates: templatesPanel, properties: propertiesPanel };

        // Tab switching
        templatesTabBtn.mousePressed(() => this.switchSidebarTab('templates'));
        propertiesTabBtn.mousePressed(() => this.switchSidebarTab('properties'));

        // Initialize component UIs inside panels
        this.initializeComponentUIs();
    }
    
    /**
     * Initialize UI for all components
     */
    initializeComponentUIs() {
        if (!this.ui.sidebar) return;
        
        try {
            // Template selector in Templates panel
            if (this.templateSelector && this.sidebarTabs.panels.templates) {
                this.templateSelector.setupUI(this.sidebarTabs.panels.templates);
            }
            // Property panel in Properties panel
            if (this.propertyPanel && this.sidebarTabs.panels.properties) {
                this.propertyPanel.setupUI(this.sidebarTabs.panels.properties);
            }
            
            console.log('🎨 Component UIs initialized in sidebar');
        } catch (error) {
            console.error('❌ Failed to initialize component UIs:', error);
        }
    }

    /**
     * Switch sidebar tab between 'templates' and 'properties'
     */
    switchSidebarTab(tab) {
        const valid = ['templates', 'properties'];
        if (!valid.includes(tab)) return;
        const other = tab === 'templates' ? 'properties' : 'templates';
        
        // Panels visibility
        this.sidebarTabs.panels[tab]?.style('display', 'block');
        this.sidebarTabs.panels[other]?.style('display', 'none');
        
        // Button styles
        if (tab === 'templates') {
            this.sidebarTabs.buttons.templates?.style('background', '#ffffff');
            this.sidebarTabs.buttons.properties?.style('background', '#f3f4f6');
        } else {
            this.sidebarTabs.buttons.templates?.style('background', '#f3f4f6');
            this.sidebarTabs.buttons.properties?.style('background', '#ffffff');
        }
    }
    
    /**
     * Show editor (enter editor mode)
     * Performance target: <100ms
     */
    show() {
        const startTime = performance.now();
        console.time('editor-show');
        
        try {
            // Save builder state
            this.saveBuilderState();
            
            // Set editor active
            this.active = true;
            this.builder.editorActive = true;
            
            // Pause builder systems
            this.builder.pauseForEditor();
            
            // Show UI
            this.showUI();
            
            // Update mode indicator
            this.updateModeIndicator();
            
            // Initialize template selector with current creature
            this.initializeCurrentTemplate();
            
            // Record performance
            const showTime = performance.now() - startTime;
            this.performanceMonitor.lastToggle = showTime;
            
            console.timeEnd('editor-show');
            
            if (showTime > 100) {
                console.warn(`⚠️ Editor show took ${showTime.toFixed(1)}ms (target: <100ms)`);
            } else {
                console.log(`✅ Editor shown in ${showTime.toFixed(1)}ms`);
            }
            
        } catch (error) {
            console.error('❌ Failed to show editor:', error);
            this.handleShowError(error);
        }
    }
    
    /**
     * Hide editor (exit editor mode)
     */
    hide() {
        const startTime = performance.now();
        console.time('editor-hide');
        
        try {
            // Set editor inactive
            this.active = false;
            this.builder.editorActive = false;
            
            // Hide UI
            this.hideUI();
            
            // Restore builder state
            this.restoreBuilderState();
            
            // Resume builder systems
            this.builder.resumeFromEditor();
            
            // Clear selections
            if (this.skeletonEditor) {
                this.skeletonEditor.clearSelection();
            }
            
            const hideTime = performance.now() - startTime;
            console.timeEnd('editor-hide');
            console.log(`✅ Editor hidden in ${hideTime.toFixed(1)}ms`);
            
        } catch (error) {
            console.error('❌ Failed to hide editor:', error);
            this.handleHideError(error);
        }
    }
    
    /**
     * Save current builder state
     */
    saveBuilderState() {
        this.savedBuilderState = {
            locomotion: this.builder.activeLocomotion,
            renderMode: this.builder.renderMode,
            mouseTarget: {
                x: this.builder.mouseTarget.x,
                y: this.builder.mouseTarget.y
            }
        };
    }
    
    /**
     * Restore saved builder state
     */
    restoreBuilderState() {
        if (this.savedBuilderState) {
            this.builder.activeLocomotion = this.savedBuilderState.locomotion;
            this.builder.renderMode = this.savedBuilderState.renderMode;
            this.builder.mouseTarget.x = this.savedBuilderState.mouseTarget.x;
            this.builder.mouseTarget.y = this.savedBuilderState.mouseTarget.y;
        }
    }
    
    /**
     * Show all UI elements
     */
    showUI() {
        if (this.ui.toolbar) {
            this.ui.toolbar.style('display', 'block');
        }
        if (this.ui.sidebar) {
            this.ui.sidebar.style('display', 'block');
        }
    }
    
    /**
     * Hide all UI elements
     */
    hideUI() {
        if (this.ui.toolbar) {
            this.ui.toolbar.style('display', 'none');
        }
        if (this.ui.sidebar) {
            this.ui.sidebar.style('display', 'none');
        }
    }
    
    /**
     * Update mode indicator in toolbar
     */
    updateModeIndicator() {
        if (this.modeIndicator) {
            let mode = 'Skeleton Mode';
            if (this.skeletonEditor && this.skeletonEditor.ikTestMode) {
                mode = 'IK Test Mode';
            }
            this.modeIndicator.html(mode);
        }
    }
    
    /**
     * Initialize template selector with current creature
     */
    initializeCurrentTemplate() {
        if (this.templateSelector && this.builder.creatureType) {
            const templateMap = {
                'horse': 'horse',
                'fish': 'fish',
                'lizard': 'lizard',
                'crane': 'biped'
            };
            
            const templateKey = templateMap[this.builder.creatureType];
            if (templateKey) {
                this.templateSelector.selectTemplate(templateKey);
            }
        }
    }
    
    /**
     * Main update loop (called from sketch.js)
     */
    update() {
        if (!this.active) return;
        
        // Throttle expensive operations
        const now = performance.now();
        if (now - this.performanceMonitor.lastUpdate < this.performanceMonitor.updateThrottle) {
            return;
        }
        this.performanceMonitor.lastUpdate = now;
        
        try {
            // Update components
            if (this.skeletonEditor) {
                this.skeletonEditor.update();
            }
            
            // Update mode indicator
            this.updateModeIndicator();
            
        } catch (error) {
            console.error('❌ Editor update error:', error);
        }
    }
    
    /**
     * Main draw loop (called from sketch.js)
     */
    draw() {
        if (!this.active) return;
        
        try {
            // Draw skeleton editor overlay
            if (this.skeletonEditor) {
                this.skeletonEditor.draw();
            }
            
            // Draw canvas adjustment for UI
            this.drawCanvasAdjustment();
            
        } catch (error) {
            console.error('❌ Editor draw error:', error);
        }
    }
    
    /**
     * Draw canvas background adjustment for UI elements
     */
    drawCanvasAdjustment() {
        push();
        
        // Darken areas under UI elements
        fill(0, 0, 0, 20);
        noStroke();
        
        // Toolbar area
        rect(0, 0, width, 60);
        
        // Sidebar area
        rect(0, 60, 200, height - 60);
        
        pop();
    }
    
    /**
     * Handle mouse clicks (called from sketch.js)
     */
    handleMouseClick(mouseX, mouseY) {
        if (!this.active) return false;
        
        try {
            // Let skeleton editor handle canvas clicks
            if (this.skeletonEditor) {
                return this.skeletonEditor.handleMouseClick(mouseX, mouseY);
            }
            
        } catch (error) {
            console.error('❌ Editor mouse click error:', error);
        }
        
        return false;
    }
    
    /**
     * Handle mouse dragging (called from sketch.js if needed)
     */
    handleMouseDrag(mouseX, mouseY) {
        if (!this.active) return false;
        
        try {
            if (this.skeletonEditor) {
                return this.skeletonEditor.handleMouseDrag(mouseX, mouseY);
            }
            
        } catch (error) {
            console.error('❌ Editor mouse drag error:', error);
        }
        
        return false;
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(keyEvent) {
        if (!this.active) return false;
        
        try {
            const key = keyEvent.key ? keyEvent.key.toLowerCase() : '';
            
            // IK test mode toggle
            if (key === 'i' && this.skeletonEditor) {
                this.skeletonEditor.toggleIKTestMode();
                return true;
            }
            
            // Save shortcut
            if (keyEvent.ctrlKey && key === 's') {
                this.handleSave();
                return true;
            }
            
            // Export shortcut
            if (keyEvent.ctrlKey && key === 'e') {
                this.handleExport();
                return true;
            }
            
        } catch (error) {
            console.error('❌ Editor keyboard error:', error);
        }
        
        return false;
    }
    
    // Action handlers
    
    handleSave() {
        try {
            if (this.configManager) {
                const config = this.configManager.exportConfig();
                console.log('💾 Configuration saved:', config);
                
                // Visual feedback
                this.showNotification('Saved!', 2000);
            }
        } catch (error) {
            console.error('❌ Save failed:', error);
            this.showNotification('Save failed!', 3000, 'error');
        }
    }
    
    handleExport() {
        try {
            if (this.configManager) {
                this.configManager.exportToFile();
                this.showNotification('Exported!', 2000);
            }
        } catch (error) {
            console.error('❌ Export failed:', error);
            this.showNotification('Export failed!', 3000, 'error');
        }
    }
    
    /**
     * Show temporary notification
     */
    showNotification(message, duration = 2000, type = 'success') {
        // Simple notification system
        const notification = createDiv(message);
        notification.position(width - 200, 70);
        notification.style(`
            background: ${type === 'error' ? '#ff4757' : '#2ed573'};
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1001;
            position: fixed;
        `);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }
    
    // Error handling
    
    handleComponentError(error) {
        console.error('Component initialization error, using fallback:', error);
        // Could implement fallback components here
    }
    
    handleShowError(error) {
        console.error('Show error, attempting recovery:', error);
        this.active = false;
        this.hideUI();
    }
    
    handleHideError(error) {
        console.error('Hide error, forcing cleanup:', error);
        this.active = false;
        this.hideUI();
        this.restoreBuilderState();
    }
    
    /**
     * Get current editor state
     */
    getState() {
        return {
            active: this.active,
            selection: this.skeletonEditor ? this.skeletonEditor.getSelection() : null,
            template: this.templateSelector ? this.templateSelector.getSelectedTemplate() : null,
            performance: this.performanceMonitor
        };
    }
    
    /**
     * Clean up all resources
     */
    cleanup() {
        console.log('🧹 Cleaning up EditorSystem...');
        
        try {
            // Hide UI
            this.hideUI();
            
            // Cleanup components
            if (this.templateSelector) {
                this.templateSelector.destroy();
                this.templateSelector = null;
            }
            
            if (this.skeletonEditor) {
                this.skeletonEditor.destroy();
                this.skeletonEditor = null;
            }
            
            if (this.propertyPanel) {
                this.propertyPanel.destroy();
                this.propertyPanel = null;
            }
            
            // Remove UI elements
            if (this.ui.toolbar) {
                this.ui.toolbar.remove();
                this.ui.toolbar = null;
            }
            
            if (this.ui.sidebar) {
                this.ui.sidebar.remove();
                this.ui.sidebar = null;
            }
            
            // Reset builder state
            this.builder.editorActive = false;
            
            console.log('✅ EditorSystem cleanup complete');
            
        } catch (error) {
            console.error('❌ Cleanup error:', error);
        }
    }
    
    /**
     * Destroy the editor system
     */
    destroy() {
        this.cleanup();
    }
}