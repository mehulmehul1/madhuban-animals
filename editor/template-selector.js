/**
 * Template Selector for Madhuban Creature Editor
 * Simple template selection interface with visual previews
 */

class TemplateSelector {
    constructor(editorSystem, builder) {
        this.editorSystem = editorSystem;
        this.builder = builder;
        this.container = null;
        this.selectedTemplate = null;
        
        // Template definitions with FORCE parameters
        this.templates = {
            'horse': {
                name: 'Horse',
                preview: '🐎',
                description: 'Erect quadruped with rigid spine',
                buildMethod: 'buildHorse',
                forceParams: {
                    rhythm: 'gallop',
                    asymmetry: 0.8,
                    thirds: [0.33, 0.66],
                    posture: 'erect'
                }
            },
            'fish': {
                name: 'Fish',
                preview: '🐟',
                description: 'Undulating spine with fluid motion',
                buildMethod: 'buildFish',
                forceParams: {
                    rhythm: 'undulate',
                    asymmetry: 0.9,
                    thirds: [0.25, 0.75],
                    posture: 'fluid'
                }
            },
            'lizard': {
                name: 'Lizard',
                preview: '🦎',
                description: 'Sprawling quadruped with lateral sway',
                buildMethod: 'buildLizard',
                forceParams: {
                    rhythm: 'crawl',
                    asymmetry: 0.7,
                    thirds: [0.4, 0.8],
                    posture: 'sprawling'
                }
            },
            'biped': {
                name: 'Biped',
                preview: '🚶',
                description: 'Bipedal crane with erect posture',
                buildMethod: 'buildBipedalCrane',
                forceParams: {
                    rhythm: 'walk',
                    asymmetry: 0.6,
                    thirds: [0.3, 0.7],
                    posture: 'upright'
                }
            }
        };
        
        this.currentPreview = null;
    }
    
    setupUI(parent) {
        // Create main container
        this.container = createDiv();
        this.container.parent(parent);
        this.container.class('template-selector');
        this.container.style(`
            padding: 12px;
            border-radius: 6px;
            background: #f9f9f9;
            border: 1px solid #ddd;
        `);
        
        // Create header
        const header = createDiv('Template Selection');
        header.parent(this.container);
        header.style(`
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 12px;
            color: #333;
        `);
        
        // Create template grid
        this.templateGrid = createDiv();
        this.templateGrid.parent(this.container);
        this.templateGrid.class('template-grid');
        this.templateGrid.style(`
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 12px;
        `);
        
        // Create template buttons
        Object.keys(this.templates).forEach(templateKey => {
            this.createTemplateButton(templateKey, this.templates[templateKey]);
        });
        
        // Create preview section
        this.previewSection = new CollapsibleSection(this.container, 'Template Preview', false);
        this.updatePreview(null);
        
        // Create custom import section
        this.createCustomImportSection();
    }
    
    createTemplateButton(templateKey, template) {
        const button = createDiv();
        button.parent(this.templateGrid);
        button.class('template-button');
        button.style(`
            padding: 12px 8px;
            border: 2px solid #ddd;
            border-radius: 6px;
            background: #fff;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s ease;
            position: relative;
        `);
        
        // Add preview icon
        const icon = createDiv(template.preview);
        icon.parent(button);
        icon.style(`
            font-size: 24px;
            margin-bottom: 4px;
        `);
        
        // Add template name
        const name = createDiv(template.name);
        name.parent(button);
        name.style(`
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 2px;
        `);
        
        // Add description
        const desc = createDiv(template.description);
        desc.parent(button);
        desc.style(`
            font-size: 9px;
            color: #666;
            line-height: 1.2;
        `);
        
        // Add click handler
        button.mousePressed(() => {
            this.selectTemplate(templateKey);
        });
        
        // Add hover effects
        button.mouseOver(() => {
            button.style('border-color', '#999');
            button.style('background', '#f5f5f5');
            this.updatePreview(templateKey);
        });
        
        button.mouseOut(() => {
            if (this.selectedTemplate !== templateKey) {
                button.style('border-color', '#ddd');
                button.style('background', '#fff');
            }
        });
        
        // Store reference for selection highlighting
        template.buttonElement = button;
    }
    
    createCustomImportSection() {
        createSpacer(this.container, 8);
        createDivider(this.container);
        
        const customSection = createDiv();
        customSection.parent(this.container);
        
        const customHeader = createDiv('Custom Templates');
        customHeader.parent(customSection);
        customHeader.style(`
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 8px;
            color: #333;
        `);
        
        // Import button
        const importButton = new IconButton(
            customSection,
            'Import JSON',
            () => this.importCustomTemplate(),
            '📁'
        );
        
        // Save current as template button
        const saveButton = new IconButton(
            customSection,
            'Save Current',
            () => this.saveCurrentAsTemplate(),
            '💾'
        );
        
        this.importButton = importButton;
        this.saveButton = saveButton;
    }
    
    selectTemplate(templateKey) {
        if (!this.templates[templateKey]) return;
        
        console.time('template-load');
        
        // Update visual selection
        this.clearSelection();
        this.selectedTemplate = templateKey;
        const template = this.templates[templateKey];
        
        // Highlight selected button
        if (template.buttonElement) {
            template.buttonElement.style('border-color', '#007acc');
            template.buttonElement.style('background', '#e6f3ff');
            template.buttonElement.style('border-width', '3px');
        }
        
        // Load template in builder
        this.loadTemplate(templateKey);
        
        // Update preview
        this.updatePreview(templateKey);
        
        console.timeEnd('template-load');
    }
    
    loadTemplate(templateKey) {
        const template = this.templates[templateKey];
        if (!template || !this.builder[template.buildMethod]) {
            console.error(`Template ${templateKey} or build method ${template.buildMethod} not found`);
            return false;
        }
        
        try {
            // Call the builder method
            this.builder[template.buildMethod]();
            
            // Notify editor system of template change
            if (this.editorSystem.onTemplateLoaded) {
                this.editorSystem.onTemplateLoaded(templateKey, template);
            }
            
            console.log(`✅ Template ${templateKey} loaded successfully`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to load template ${templateKey}:`, error);
            return false;
        }
    }
    
    clearSelection() {
        // Clear all button selections
        Object.values(this.templates).forEach(template => {
            if (template.buttonElement) {
                template.buttonElement.style('border-color', '#ddd');
                template.buttonElement.style('background', '#fff');
                template.buttonElement.style('border-width', '2px');
            }
        });
        this.selectedTemplate = null;
    }
    
    updatePreview(templateKey) {
        if (!templateKey || !this.templates[templateKey]) {
            this.previewSection.setContent(`
                <div style="text-align: center; padding: 20px; color: #666;">
                    Hover over a template to see preview
                </div>
            `);
            return;
        }
        
        const template = this.templates[templateKey];
        const forceParams = template.forceParams;
        
        const previewContent = `
            <div style="font-size: 12px;">
                <div style="margin-bottom: 8px;">
                    <strong>${template.name}</strong>
                    <span style="float: right; font-size: 18px;">${template.preview}</span>
                </div>
                <div style="margin-bottom: 8px; color: #666;">
                    ${template.description}
                </div>
                <div style="background: #f0f0f0; padding: 8px; border-radius: 4px;">
                    <div><strong>FORCE Parameters:</strong></div>
                    <div style="margin-left: 8px; font-family: monospace; font-size: 11px;">
                        <div>Rhythm: ${forceParams.rhythm}</div>
                        <div>Asymmetry: ${(forceParams.asymmetry * 100).toFixed(0)}%</div>
                        <div>Thirds: [${forceParams.thirds.join(', ')}]</div>
                        <div>Posture: ${forceParams.posture}</div>
                    </div>
                </div>
            </div>
        `;
        
        this.previewSection.setContent(previewContent);
    }
    
    importCustomTemplate() {
        // Create file input
        const input = createFileInput((file) => {
            if (file.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const config = JSON.parse(e.target.result);
                        this.loadCustomTemplate(config);
                    } catch (error) {
                        console.error('Invalid JSON file:', error);
                        alert('Invalid JSON file format');
                    }
                };
                reader.readAsText(file.file);
            } else {
                alert('Please select a JSON file');
            }
        });
        
        input.style('display', 'none');
        input.elt.click();
    }
    
    loadCustomTemplate(config) {
        try {
            // Use config manager if available
            if (this.editorSystem.configManager) {
                this.editorSystem.configManager.loadFromConfig(config);
                console.log('✅ Custom template loaded successfully');
            } else {
                console.error('Config manager not available');
            }
        } catch (error) {
            console.error('❌ Failed to load custom template:', error);
            alert('Failed to load template: ' + error.message);
        }
    }
    
    saveCurrentAsTemplate() {
        try {
            // Use config manager if available
            if (this.editorSystem.configManager) {
                const config = this.editorSystem.configManager.exportConfig();
                const templateName = prompt('Enter template name:', 'Custom Template');
                
                if (templateName) {
                    // Save to local storage
                    const customTemplates = JSON.parse(localStorage.getItem('madhuban_custom_templates') || '{}');
                    customTemplates[templateName] = config;
                    localStorage.setItem('madhuban_custom_templates', JSON.stringify(customTemplates));
                    
                    console.log(`✅ Template "${templateName}" saved`);
                    alert(`Template "${templateName}" saved successfully`);
                }
            } else {
                console.error('Config manager not available');
            }
        } catch (error) {
            console.error('❌ Failed to save template:', error);
            alert('Failed to save template: ' + error.message);
        }
    }
    
    getSelectedTemplate() {
        return this.selectedTemplate;
    }
    
    getTemplateInfo(templateKey) {
        return this.templates[templateKey] || null;
    }
    
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
    
    destroy() {
        if (this.previewSection) {
            this.previewSection.destroy();
            this.previewSection = null;
        }
        
        if (this.importButton) {
            this.importButton.destroy();
            this.importButton = null;
        }
        
        if (this.saveButton) {
            this.saveButton.destroy();
            this.saveButton = null;
        }
        
        if (this.container) {
            this.container.remove();
            this.container = null;
            this.templateGrid = null;
        }
        
        // Clear template button references
        Object.values(this.templates).forEach(template => {
            template.buttonElement = null;
        });
    }
}