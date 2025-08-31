/**
 * Property Panel for Madhuban Creature Editor
 * Context-sensitive property editing interface with progressive disclosure
 */

class PropertyPanel {
    constructor(editorSystem, builder) {
        this.editorSystem = editorSystem;
        this.builder = builder;
        this.container = null;
        
        // Current context and data
        this.currentContext = 'none'; // 'none', 'chain', 'bone', 'template'
        this.currentData = null;
        
        // UI component references
        this.sections = {};
        this.controls = {};
        
        // Update throttling
        this.updateThrottle = 50; // 20fps for property updates
        this.lastUpdate = 0;
        
        console.log('PropertyPanel initialized');
    }
    
    /**
     * Setup the property panel UI
     * @param {p5.Element} parent - Parent container
     */
    setupUI(parent) {
        // Create main container
        this.container = createDiv();
        this.container.parent(parent);
        this.container.class('property-panel');
        this.container.style(`
            padding: 12px;
            background: #f9f9f9;
            border-radius: 6px;
            border: 1px solid #ddd;
            max-height: calc(100vh - 200px);
            overflow-y: auto;
        `);
        
        // Create header
        this.header = createDiv('Properties');
        this.header.parent(this.container);
        this.header.style(`
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 12px;
            color: #333;
        `);
        
        // Create content area
        this.contentArea = createDiv();
        this.contentArea.parent(this.container);
        this.contentArea.class('property-content');
        
        // Initialize with default content
        this.updateContext('none', {});
    }
    
    /**
     * Update the property panel context based on current selection
     * @param {string} type - Context type: 'none', 'chain', 'bone', 'template'
     * @param {Object} data - Context-specific data
     */
    updateContext(type, data) {
        // Throttle updates for performance
        const now = performance.now();
        if (now - this.lastUpdate < this.updateThrottle) {
            return;
        }
        this.lastUpdate = now;
        
        // Clear previous content
        this.clearContent();
        
        // Store current context
        this.currentContext = type;
        this.currentData = data;
        
        // Create context-specific content
        switch (type) {
            case 'template':
                this.showTemplateProperties();
                break;
            case 'chain':
                this.showChainProperties(data);
                break;
            case 'bone':
                this.showBoneProperties(data);
                break;
            case 'none':
            default:
                this.showDefaultProperties();
                break;
        }
    }
    
    /**
     * Clear all property content
     */
    clearContent() {
        // Destroy existing sections and controls
        Object.values(this.sections).forEach(section => {
            if (section && section.destroy) {
                section.destroy();
            }
        });
        
        Object.values(this.controls).forEach(control => {
            if (control && control.destroy) {
                control.destroy();
            }
        });
        
        this.sections = {};
        this.controls = {};
        
        // Clear content area
        if (this.contentArea) {
            this.contentArea.html('');
        }
    }
    
    /**
     * Show default properties when nothing is selected
     */
    showDefaultProperties() {
        // Template selection section
        this.sections.templates = new CollapsibleSection(this.contentArea, 'Templates', true);
        
        const templateContent = `
            <div style="text-align: center; padding: 16px;">
                <div style="font-size: 12px; color: #666; margin-bottom: 12px;">
                    Select a template or click on skeleton elements to edit properties
                </div>
            </div>
        `;
        this.sections.templates.setContent(templateContent);
        
        // General settings section
        this.sections.general = new CollapsibleSection(this.contentArea, 'General Settings', false);
        this.createGeneralSettings();
        
        // Help section
        this.sections.help = new CollapsibleSection(this.contentArea, 'Help', false);
        this.createHelpContent();
    }
    
    /**
     * Show template-specific properties
     */
    showTemplateProperties() {
        // Template info section
        this.sections.templateInfo = new CollapsibleSection(this.contentArea, 'Template Info', true);
        
        const selectedTemplate = this.editorSystem.templateSelector?.getSelectedTemplate();
        if (selectedTemplate) {
            const templateInfo = this.editorSystem.templateSelector.getTemplateInfo(selectedTemplate);
            const content = `
                <div style="font-size: 12px;">
                    <div style="margin-bottom: 8px;">
                        <strong>${templateInfo.name}</strong>
                        <span style="float: right; font-size: 18px;">${templateInfo.preview}</span>
                    </div>
                    <div style="color: #666; margin-bottom: 8px;">${templateInfo.description}</div>
                    <div style="background: #f0f0f0; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 10px;">
                        <div><strong>FORCE Parameters:</strong></div>
                        ${Object.entries(templateInfo.forceParams).map(([key, value]) => 
                            `<div>${key}: ${value}</div>`
                        ).join('')}
                    </div>
                </div>
            `;
            this.sections.templateInfo.setContent(content);
        }
        
        // Template actions
        this.sections.templateActions = new CollapsibleSection(this.contentArea, 'Template Actions', true);
        this.createTemplateActions();
    }
    
    /**
     * Show chain-specific properties
     * @param {Object} data - Chain data {chainIndex, chain}
     */
    showChainProperties(data) {
        if (!data.chain || data.chainIndex === undefined) return;
        
        const chainConfig = this.builder.chainConfigs[data.chainIndex];
        const chain = data.chain;
        
        // Chain info section
        this.sections.chainInfo = new CollapsibleSection(this.contentArea, 'Chain Information', true);
        const chainInfoContent = `
            <div style="font-size: 12px;">
                <div><strong>Chain Index:</strong> ${data.chainIndex}</div>
                <div><strong>Role:</strong> ${chainConfig?.role || 'unknown'}</div>
                <div><strong>Type:</strong> ${chainConfig?.type || 'unknown'}</div>
                <div><strong>Bones:</strong> ${chain.getNumBones()}</div>
                <div><strong>Attachment:</strong> ${chainConfig?.attachment || 'unknown'}</div>
            </div>
        `;
        this.sections.chainInfo.setContent(chainInfoContent);
        
        // Chain properties section
        this.sections.chainProps = new CollapsibleSection(this.contentArea, 'Chain Properties', true);
        this.createChainControls(data.chainIndex, chainConfig);
        
        // IK controls section
        this.sections.ikControls = new CollapsibleSection(this.contentArea, 'IK Controls', false);
        this.createIKControls(data.chainIndex);
    }
    
    /**
     * Show bone-specific properties
     * @param {Object} data - Bone data {chainIndex, boneIndex, bone}
     */
    showBoneProperties(data) {
        if (!data.bone || data.chainIndex === undefined || data.boneIndex === undefined) return;
        
        const bone = data.bone;
        const start = bone.getStartLocation();
        const end = bone.getEndLocation();
        const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
        
        // Bone info section
        this.sections.boneInfo = new CollapsibleSection(this.contentArea, 'Bone Information', true);
        const boneInfoContent = `
            <div style="font-size: 12px;">
                <div><strong>Chain:</strong> ${data.chainIndex}</div>
                <div><strong>Bone:</strong> ${data.boneIndex}</div>
                <div><strong>Length:</strong> ${length.toFixed(1)}px</div>
                <div><strong>Angle:</strong> ${angle.toFixed(1)}°</div>
                <div><strong>Start:</strong> (${start.x.toFixed(1)}, ${start.y.toFixed(1)})</div>
                <div><strong>End:</strong> (${end.x.toFixed(1)}, ${end.y.toFixed(1)})</div>
            </div>
        `;
        this.sections.boneInfo.setContent(boneInfoContent);
        
        // Bone properties section
        this.sections.boneProps = new CollapsibleSection(this.contentArea, 'Bone Properties', true);
        this.createBoneControls(data.chainIndex, data.boneIndex, bone);
        
        // Constraints section
        this.sections.constraints = new CollapsibleSection(this.contentArea, 'Constraints', false);
        this.createConstraintControls(data.chainIndex, data.boneIndex);
    }
    
    /**
     * Create general settings controls
     */
    createGeneralSettings() {
        const settingsContainer = createDiv();
        settingsContainer.parent(this.sections.general.contentDiv);
        
        // Render mode controls
        this.controls.renderMode = new IconButton(
            settingsContainer,
            'Toggle Render Mode',
            () => this.builder.switchRenderMode(),
            '👁️'
        );
        
        // Debug toggle
        this.controls.debugToggle = new IconButton(
            settingsContainer,
            'Toggle Debug',
            () => {
                this.builder.showDebug = !this.builder.showDebug;
                this.controls.debugToggle.setText(`Debug: ${this.builder.showDebug ? 'ON' : 'OFF'}`);
            },
            '🔧'
        );
        
        // Performance info
        const perfInfo = createDiv('Performance: 60fps target');
        perfInfo.parent(settingsContainer);
        perfInfo.style('font-size: 10px; color: #666; margin-top: 8px;');
    }
    
    /**
     * Create template action controls
     */
    createTemplateActions() {
        const actionsContainer = createDiv();
        actionsContainer.parent(this.sections.templateActions.contentDiv);
        
        // Save template
        this.controls.saveTemplate = new IconButton(
            actionsContainer,
            'Save Current',
            () => {
                if (this.editorSystem.templateSelector) {
                    this.editorSystem.templateSelector.saveCurrentAsTemplate();
                }
            },
            '💾'
        );
        
        // Export config
        this.controls.exportConfig = new IconButton(
            actionsContainer,
            'Export JSON',
            () => {
                if (this.editorSystem.configManager) {
                    this.editorSystem.configManager.exportToFile();
                }
            },
            '📤'
        );
    }
    
    /**
     * Create chain control sliders and buttons
     */
    createChainControls(chainIndex, chainConfig) {
        const controlsContainer = createDiv();
        controlsContainer.parent(this.sections.chainProps.contentDiv);
        
        // Chain color picker (simplified)
        const colorInfo = createDiv(`Color: ${this.getChainColorName(chainConfig?.role)}`);
        colorInfo.parent(controlsContainer);
        colorInfo.style('font-size: 12px; margin-bottom: 8px;');
        
        // IK Test button
        this.controls.ikTest = new IconButton(
            controlsContainer,
            'IK Test Mode',
            () => {
                if (this.editorSystem.skeletonEditor) {
                    this.editorSystem.skeletonEditor.toggleIKTestMode();
                    const isActive = this.editorSystem.skeletonEditor.ikTestMode;
                    this.controls.ikTest.setText(`IK Test: ${isActive ? 'ON' : 'OFF'}`);
                }
            },
            '🎯'
        );
        
        // Chain manipulation buttons
        this.controls.addBone = new IconButton(
            controlsContainer,
            'Add Bone',
            () => this.addBoneToChain(chainIndex),
            '➕'
        );
        
        this.controls.removeBone = new IconButton(
            controlsContainer,
            'Remove Bone',
            () => this.removeBoneFromChain(chainIndex),
            '➖'
        );
    }
    
    /**
     * Create bone control sliders
     */
    createBoneControls(chainIndex, boneIndex, bone) {
        const controlsContainer = createDiv();
        controlsContainer.parent(this.sections.boneProps.contentDiv);
        
        const start = bone.getStartLocation();
        const end = bone.getEndLocation();
        const currentLength = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        const currentAngle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
        
        // Length slider
        this.controls.lengthSlider = new PropertySlider(
            controlsContainer,
            'Length',
            10, 100,
            currentLength,
            (value) => this.updateBoneLength(chainIndex, boneIndex, value)
        );
        
        // Angle slider
        this.controls.angleSlider = new PropertySlider(
            controlsContainer,
            'Angle',
            -180, 180,
            currentAngle,
            (value) => this.updateBoneAngle(chainIndex, boneIndex, value)
        );
    }
    
    /**
     * Create IK control buttons
     */
    createIKControls(chainIndex) {
        const ikContainer = createDiv();
        ikContainer.parent(this.sections.ikControls.contentDiv);
        
        // Solve IK button
        this.controls.solveIK = new IconButton(
            ikContainer,
            'Solve IK',
            () => this.solveIKForChain(chainIndex),
            '🎯'
        );
        
        // Reset pose button
        this.controls.resetPose = new IconButton(
            ikContainer,
            'Reset Pose',
            () => this.resetChainPose(chainIndex),
            '🔄'
        );
    }
    
    /**
     * Create constraint control sliders
     */
    createConstraintControls(chainIndex, boneIndex) {
        const constraintContainer = createDiv();
        constraintContainer.parent(this.sections.constraints.contentDiv);
        
        // Constraint info
        const info = createDiv('Constraint controls would go here');
        info.parent(constraintContainer);
        info.style('font-size: 11px; color: #666; text-align: center; padding: 16px;');
    }
    
    /**
     * Create help content
     */
    createHelpContent() {
        const helpContent = `
            <div style="font-size: 11px; color: #666;">
                <div style="margin-bottom: 8px;"><strong>Keyboard Shortcuts:</strong></div>
                <div>E - Toggle Editor</div>
                <div>I - IK Test Mode</div>
                <div>Shift+Click - Select Chain</div>
                <div>Click - Select Bone</div>
                <div style="margin-top: 8px;"><strong>Mouse:</strong></div>
                <div>Click - Select element</div>
                <div>Drag - Manipulate (IK mode)</div>
            </div>
        `;
        this.sections.help.setContent(helpContent);
    }
    
    // Property manipulation methods
    
    updateBoneLength(chainIndex, boneIndex, newLength) {
        console.log(`Updating bone ${boneIndex} in chain ${chainIndex} length to ${newLength}`);
        // Implementation would depend on FIK.js bone structure
    }
    
    updateBoneAngle(chainIndex, boneIndex, newAngle) {
        console.log(`Updating bone ${boneIndex} in chain ${chainIndex} angle to ${newAngle}°`);
        // Implementation would depend on FIK.js bone structure
    }
    
    addBoneToChain(chainIndex) {
        console.log(`Adding bone to chain ${chainIndex}`);
        // Implementation would add bone to FIK.js chain
    }
    
    removeBoneFromChain(chainIndex) {
        console.log(`Removing bone from chain ${chainIndex}`);
        // Implementation would remove bone from FIK.js chain
    }
    
    solveIKForChain(chainIndex) {
        if (this.editorSystem.skeletonEditor) {
            this.editorSystem.skeletonEditor.solveIKForChain(chainIndex);
        }
    }
    
    resetChainPose(chainIndex) {
        console.log(`Resetting pose for chain ${chainIndex}`);
        // Implementation would reset chain to default pose
    }
    
    getChainColorName(role) {
        const colorMap = {
            'spine': 'Blue',
            'leg': 'Red',
            'neck': 'Green',
            'tail': 'Yellow',
            'fin': 'Magenta',
            'wing': 'Orange'
        };
        return colorMap[role] || 'Gray';
    }
    
    /**
     * Get current context information
     */
    getCurrentContext() {
        return {
            type: this.currentContext,
            data: this.currentData
        };
    }
    
    /**
     * Show/hide the property panel
     */
    show() {
        if (this.container) {
            this.container.style('display', 'block');
        }
    }
    
    hide() {
        if (this.container) {
            this.container.style('display', 'none');
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        this.clearContent();
        
        if (this.container) {
            this.container.remove();
            this.container = null;
            this.contentArea = null;
            this.header = null;
        }
        
        console.log('PropertyPanel destroyed');
    }
}