/**
 * Configuration Manager for JSON Import/Export (PRP1-7)
 * 
 * Provides save/load functionality for creature configurations with editor metadata.
 * Compatible with existing ModularCreatureBuilder system and supports modified skeletons.
 */

class ConfigManager {
    constructor(builder, editor) {
        this.builder = builder;
        this.editor = editor;
        
        // Configuration version for backward compatibility
        this.configVersion = '1.0';
        
        // Supported export formats
        this.exportFormats = {
            'complete': 'Complete creature with editor modifications',
            'skeleton': 'Skeleton configuration only',
            'base': 'Base creature template without modifications'
        };
        
        console.log('ConfigManager initialized for JSON import/export');
    }
    
    /**
     * Export current creature configuration to JSON
     * @param {string} format - Export format ('complete', 'skeleton', 'base')
     * @param {Object} options - Export options
     * @returns {Object} Serializable configuration object
     */
    exportConfig(format = 'complete', options = {}) {
        console.time('config-export');
        
        try {
            const config = {
                // Metadata
                version: this.configVersion,
                exportDate: new Date().toISOString(),
                format: format,
                
                // Core creature data
                creatureType: this.builder.creatureType,
                creatureConfig: this.deepClone(this.builder.creatureConfig),
                
                // Chain configurations
                chainConfigs: this.serializeChainConfigs(),
                
                // Locomotion data
                locomotion: this.serializeLocomotion(),
                
                // Editor metadata
                editorMetadata: this.buildEditorMetadata(),
                
                // Export options
                options: options
            };
            
            // Apply format-specific filtering
            switch (format) {
                case 'skeleton':
                    delete config.locomotion;
                    config.chainConfigs = config.chainConfigs.map(chain => ({
                        ...chain,
                        locomotionRole: undefined
                    }));
                    break;
                    
                case 'base':
                    delete config.editorMetadata;
                    break;
            }
            
            console.timeEnd('config-export');
            console.log(`✅ Exported ${format} configuration for ${this.builder.creatureType}`);
            
            return config;
            
        } catch (error) {
            console.error('❌ Failed to export configuration:', error);
            throw new Error(`Configuration export failed: ${error.message}`);
        }
    }
    
    /**
     * Import creature configuration from JSON
     * @param {Object} config - Configuration object
     * @param {Object} options - Import options
     * @returns {boolean} Success status
     */
    importConfig(config, options = {}) {
        console.time('config-import');
        
        try {
            // Validate configuration
            if (!this.validateConfig(config)) {
                throw new Error('Invalid configuration format');
            }
            
            // Check version compatibility
            if (!this.isVersionCompatible(config.version)) {
                console.warn(`⚠️ Configuration version ${config.version} may not be fully compatible`);
            }
            
            // Clear current creature
            this.builder.clearCreature();
            
            // Set basic creature properties
            this.builder.creatureType = config.creatureType;
            this.builder.creatureConfig = this.deepClone(config.creatureConfig);
            
            // Import chains
            this.importChains(config.chainConfigs);
            
            // Import locomotion
            if (config.locomotion) {
                this.importLocomotion(config.locomotion);
            }
            
            // Apply editor metadata if present
            if (config.editorMetadata) {
                this.applyEditorMetadata(config.editorMetadata);
            }
            
            // Update editor UI if active
            if (this.editor && this.editor.active) {
                this.editor.updateSidebar();
            }
            
            console.timeEnd('config-import');
            console.log(`✅ Imported ${config.format || 'complete'} configuration for ${config.creatureType}`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to import configuration:', error);
            
            // Attempt to restore a basic creature
            this.restoreBasicCreature();
            
            throw new Error(`Configuration import failed: ${error.message}`);
        }
    }
    
    /**
     * Serialize chain configurations with current state
     */
    serializeChainConfigs() {
        return this.builder.chainConfigs.map((config, index) => {
            const chain = this.builder.chains[index];
            const serializedConfig = this.deepClone(config);
            
            // Add current chain state if editor is active
            if (this.editor && this.editor.active && chain) {
                serializedConfig.currentState = this.serializeChainState(chain);
            }
            
            return serializedConfig;
        });
    }
    
    /**
     * Serialize current chain state (bone positions, constraints)
     */
    serializeChainState(chain) {
        const bones = [];
        
        for (let i = 0; i < chain.numBones; i++) {
            const bone = chain.bones[i];
            const start = bone.start;
            const end = bone.end;
            
            bones.push({
                index: i,
                length: bone.getLength(),
                startX: start.x,
                startY: start.y,
                endX: end.x,
                endY: end.y,
                constraints: bone.joint ? {
                    clockwise: bone.joint.clockwiseConstraintDegs || 45,
                    anticlockwise: bone.joint.anticlockwiseConstraintDegs || 45
                } : null
            });
        }
        
        return {
            bones: bones,
            baseMode: chain.getFixedBaseMode(),
            maxIterations: chain.maxIterationAttempts || 15,
            solveThreshold: chain.solveDistanceThreshold || 1.0
        };
    }
    
    /**
     * Serialize locomotion configuration
     */
    serializeLocomotion() {
        if (!this.builder.activeLocomotion) return null;
        
        return {
            type: this.builder.activeLocomotion.type || 'unknown',
            parameters: this.builder.activeLocomotion.parameters || {},
            state: this.builder.activeLocomotion.getState ? 
                this.builder.activeLocomotion.getState() : {}
        };
    }
    
    /**
     * Build editor metadata for modified skeletons
     */
    buildEditorMetadata() {
        const metadata = {
            lastModified: new Date().toISOString(),
            editorVersion: '1.0',
            modifications: []
        };
        
        // Add operation history if available
        if (this.editor && this.editor.operationHistory) {
            metadata.operationHistory = this.editor.operationHistory.slice(-50); // Last 50 operations
        }
        
        // Add selection state
        if (this.editor) {
            metadata.editorState = {
                selectionMode: this.editor.selectionMode,
                editingMode: this.editor.editingMode,
                currentLayer: this.editor.currentLayer
            };
        }
        
        return metadata;
    }
    
    /**
     * Import chains from configuration
     */
    importChains(chainConfigs) {
        chainConfigs.forEach((config, index) => {
            try {
                // Create chain from configuration
                const chain = this.builder.createChainFromConfig(config);
                
                // Apply current state if available
                if (config.currentState) {
                    this.applyChainState(chain, config.currentState);
                }
                
            } catch (error) {
                console.warn(`⚠️ Failed to import chain ${index}: ${error.message}`);
            }
        });
    }
    
    /**
     * Import locomotion configuration
     */
    importLocomotion(locomotionConfig) {
        try {
            if (this.builder.locomotionSystem && locomotionConfig.type) {
                this.builder.activeLocomotion = this.builder.locomotionSystem.createPattern(
                    locomotionConfig.type,
                    locomotionConfig.parameters
                );
                
                // Apply saved state if available
                if (locomotionConfig.state && this.builder.activeLocomotion.setState) {
                    this.builder.activeLocomotion.setState(locomotionConfig.state);
                }
            }
        } catch (error) {
            console.warn(`⚠️ Failed to import locomotion: ${error.message}`);
        }
    }
    
    /**
     * Apply editor metadata to restore editor state
     */
    applyEditorMetadata(metadata) {
        if (!this.editor) return;
        
        try {
            // Restore editor state
            if (metadata.editorState) {
                this.editor.selectionMode = metadata.editorState.selectionMode || 'chain';
                this.editor.editingMode = metadata.editorState.editingMode || 'select';
                this.editor.currentLayer = metadata.editorState.currentLayer || 'skeleton';
            }
            
            // Restore operation history if available
            if (metadata.operationHistory && this.editor.operationHistory) {
                this.editor.operationHistory = metadata.operationHistory;
                this.editor.historyIndex = metadata.operationHistory.length - 1;
            }
            
        } catch (error) {
            console.warn(`⚠️ Failed to apply editor metadata: ${error.message}`);
        }
    }
    
    /**
     * Apply serialized chain state to chain
     */
    applyChainState(chain, state) {
        try {
            // Apply bone positions and constraints
            state.bones.forEach((boneState, index) => {
                if (index < chain.numBones) {
                    const bone = chain.bones[index];
                    
                    // Apply bone constraints
                    if (boneState.constraints && bone.joint) {
                        bone.joint.clockwiseConstraintDegs = boneState.constraints.clockwise;
                        bone.joint.anticlockwiseConstraintDegs = boneState.constraints.anticlockwise;
                    }
                }
            });
            
            // Apply chain settings
            if (state.maxIterations && chain.setMaxIterationAttempts) {
                chain.setMaxIterationAttempts(state.maxIterations);
            }
            
            if (state.solveThreshold && chain.setSolveDistanceThreshold) {
                chain.setSolveDistanceThreshold(state.solveThreshold);
            }
            
        } catch (error) {
            console.warn(`⚠️ Failed to apply chain state: ${error.message}`);
        }
    }
    
    /**
     * Validate configuration format
     */
    validateConfig(config) {
        if (!config || typeof config !== 'object') return false;
        
        // Required fields
        const requiredFields = ['version', 'creatureType', 'chainConfigs'];
        for (const field of requiredFields) {
            if (!(field in config)) {
                console.error(`❌ Missing required field: ${field}`);
                return false;
            }
        }
        
        // Validate chain configs
        if (!Array.isArray(config.chainConfigs)) {
            console.error(`❌ Invalid chainConfigs format`);
            return false;
        }
        
        // Validate creature type
        const validCreatureTypes = ['fish', 'crane', 'horse', 'lizard'];
        if (!validCreatureTypes.includes(config.creatureType)) {
            console.warn(`⚠️ Unknown creature type: ${config.creatureType}`);
        }
        
        return true;
    }
    
    /**
     * Check version compatibility
     */
    isVersionCompatible(version) {
        // Simple version compatibility check
        const major = parseFloat(version);
        const currentMajor = parseFloat(this.configVersion);
        
        return major <= currentMajor;
    }
    
    /**
     * Restore basic creature on import failure
     */
    restoreBasicCreature() {
        try {
            console.log('🔄 Restoring basic horse creature after import failure');
            this.builder.buildHorse();
        } catch (error) {
            console.error('❌ Failed to restore basic creature:', error);
        }
    }
    
    /**
     * Download configuration as JSON file
     */
    downloadConfig(filename, format = 'complete') {
        try {
            const config = this.exportConfig(format);
            const jsonString = JSON.stringify(config, null, 2);
            
            // Create download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `${config.creatureType}-${format}-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            console.log(`✅ Downloaded configuration: ${link.download}`);
            
        } catch (error) {
            console.error('❌ Failed to download configuration:', error);
            alert('Failed to download configuration. Check console for details.');
        }
    }
    
    /**
     * Upload configuration from JSON file
     */
    uploadConfig(fileInput) {
        return new Promise((resolve, reject) => {
            const file = fileInput.files[0];
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const config = JSON.parse(e.target.result);
                    const success = this.importConfig(config);
                    resolve(success);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
    
    /**
     * Deep clone object utility
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }
    
    /**
     * Get configuration summary for display
     */
    getConfigSummary(config) {
        if (!config) return 'No configuration';
        
        return {
            type: config.creatureType,
            format: config.format || 'complete',
            chains: config.chainConfigs ? config.chainConfigs.length : 0,
            hasEditor: !!config.editorMetadata,
            hasLocomotion: !!config.locomotion,
            exportDate: config.exportDate
        };
    }
}