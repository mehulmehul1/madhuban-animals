/**
 * Advanced UI Controls for Skeleton Editing (PRP2 Task 5)
 * 
 * Provides real-time parameter controls for bone manipulation,
 * constraint editing, and skeleton modification with visual feedback.
 */

class SkeletonControls {
    constructor(builder, editorMode) {
        this.builder = builder;
        this.editor = editorMode;
        this.controlContainer = null;
        
        // Control state
        this.activeControls = {};
        this.updateThrottle = 16; // ~60fps
        this.lastUpdate = 0;
        
        // Control types and their configurations
        this.controlTypes = {
            'bone-length': {
                type: 'slider',
                min: 5,
                max: 300,
                step: 1,
                suffix: 'px'
            },
            'joint-angle': {
                type: 'angle-slider',
                min: -180,
                max: 180,
                step: 5,
                suffix: '°'
            },
            'constraint-clockwise': {
                type: 'slider',
                min: 0,
                max: 180,
                step: 5,
                suffix: '°'
            },
            'constraint-anticlockwise': {
                type: 'slider',
                min: 0,
                max: 180,
                step: 5,
                suffix: '°'
            },
            'joint-type': {
                type: 'select',
                options: ['hinge', 'ball-socket', 'fixed']
            }
        };
        
        this.initializeControls();
        console.log('Advanced UI Controls initialized for skeleton editing');
    }
    
    initializeControls() {
        this.createControlContainer();
    }
    
    createControlContainer() {
        // Create controls section in sidebar
        this.controlContainer = createDiv();
        this.controlContainer.id('skeleton-controls');
        this.controlContainer.style(`
            width: 100%;
            margin-bottom: 15px;
            padding: 10px;
            background: #fff;
            border-radius: 5px;
            border: 1px solid #ddd;
            display: none;
        `);
        
        // Add to editor sidebar
        if (this.editor.ui.sidebar) {
            this.controlContainer.parent(this.editor.ui.sidebar);
        }
    }
    
    // Show controls for selected bone
    showBoneControls(selectedBone) {
        if (!selectedBone || !selectedBone.bone) {
            this.hideControls();
            return;
        }
        
        this.controlContainer.style('display: block;');
        
        const bone = selectedBone.bone;
        const boneProps = this.editor.boneManipulator.getBoneProperties(selectedBone);
        
        let content = `
            <h5 style="margin: 0 0 10px 0; color: #666; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                🎛️ Bone Controls
            </h5>
            
            <div style="margin-bottom: 8px;">
                <label style="font-size: 12px; color: #555; font-weight: bold;">Chain ${selectedBone.chainIndex}, Bone ${selectedBone.boneIndex}</label>
            </div>
        `;
        
        // Bone Length Control
        content += this.createSliderControl(
            'bone-length',
            'Length',
            parseFloat(boneProps.length),
            this.controlTypes['bone-length'],
            (value) => this.updateBoneLength(selectedBone, value)
        );
        
        // Bone Rotation Control
        content += this.createSliderControl(
            'bone-angle',
            'Angle',
            parseFloat(boneProps.angle),
            this.controlTypes['joint-angle'],
            (value) => this.updateBoneAngle(selectedBone, value)
        );
        
        // Joint Constraints (if bone has joint)
        if (bone.joint) {
            content += `<div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #eee;">`;
            content += `<h6 style="margin: 0 0 8px 0; color: #555; font-size: 11px;">Joint Constraints</h6>`;
            
            // Clockwise constraint
            const clockwiseConstraint = boneProps.constraints.clockwise || 45;
            content += this.createSliderControl(
                'constraint-clockwise',
                'Clockwise Limit',
                clockwiseConstraint,
                this.controlTypes['constraint-clockwise'],
                (value) => this.updateJointConstraint(selectedBone, 'clockwise', value)
            );
            
            // Anticlockwise constraint
            const anticlockwiseConstraint = boneProps.constraints.anticlockwise || 45;
            content += this.createSliderControl(
                'constraint-anticlockwise',
                'Anticlockwise Limit',
                anticlockwiseConstraint,
                this.controlTypes['constraint-anticlockwise'],
                (value) => this.updateJointConstraint(selectedBone, 'anticlockwise', value)
            );
            
            // Joint Type Selector
            content += this.createSelectControl(
                'joint-type',
                'Joint Type',
                'hinge', // Default value
                this.controlTypes['joint-type'],
                (value) => this.updateJointType(selectedBone, value)
            );
            
            content += `</div>`;
        }
        
        // Action buttons
        content += `
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
                <button 
                    onclick="skeletonControls.resetBoneToDefault('${selectedBone.chainIndex}', '${selectedBone.boneIndex}')"
                    style="width: 48%; padding: 6px; margin-right: 4%; background: #ffc107; color: #333; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;"
                >
                    Reset
                </button>
                <button 
                    onclick="skeletonControls.deleteBone('${selectedBone.chainIndex}', '${selectedBone.boneIndex}')"
                    style="width: 48%; padding: 6px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;"
                >
                    Delete
                </button>
            </div>
        `;
        
        this.controlContainer.html(content);
        
        // Store reference for global access
        window.skeletonControls = this;
    }
    
    // Show controls for selected chain
    showChainControls(selectedChainIndex) {
        if (selectedChainIndex === null || selectedChainIndex === undefined) {
            this.hideControls();
            return;
        }
        
        this.controlContainer.style('display: block;');
        
        const chainConfig = this.builder.chainConfigs[selectedChainIndex];
        const chain = this.builder.chains[selectedChainIndex];
        
        let content = `
            <h5 style="margin: 0 0 10px 0; color: #666; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                ⛓️ Chain Controls
            </h5>
            
            <div style="margin-bottom: 8px;">
                <label style="font-size: 12px; color: #555; font-weight: bold;">Chain ${selectedChainIndex}: ${chainConfig?.role || 'Unknown'}</label>
            </div>
        `;
        
        // Chain properties
        if (chainConfig) {
            content += `
                <div style="margin-bottom: 12px;">
                    <div style="margin-bottom: 4px;">
                        <span style="font-size: 11px; color: #666;">Type:</span>
                        <span style="font-size: 11px; font-weight: bold; margin-left: 5px;">${chainConfig.type}</span>
                    </div>
                    <div style="margin-bottom: 4px;">
                        <span style="font-size: 11px; color: #666;">Bones:</span>
                        <span style="font-size: 11px; font-weight: bold; margin-left: 5px;">${chain.numBones}</span>
                    </div>
                    <div style="margin-bottom: 4px;">
                        <span style="font-size: 11px; color: #666;">Role:</span>
                        <span style="font-size: 11px; font-weight: bold; margin-left: 5px;">${chainConfig.locomotionRole || 'none'}</span>
                    </div>
                </div>
            `;
        }
        
        // Chain action buttons
        content += `
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
                <button 
                    onclick="skeletonControls.addBoneToChain(${selectedChainIndex})"
                    style="width: 48%; padding: 6px; margin-right: 4%; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;"
                >
                    Add Bone
                </button>
                <button 
                    onclick="skeletonControls.duplicateChain(${selectedChainIndex})"
                    style="width: 48%; padding: 6px; background: #17a2b8; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;"
                >
                    Duplicate
                </button>
            </div>
            
            <div style="margin-top: 8px;">
                <button 
                    onclick="skeletonControls.deleteChain(${selectedChainIndex})"
                    style="width: 100%; padding: 6px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;"
                >
                    Delete Chain
                </button>
            </div>
        `;
        
        this.controlContainer.html(content);
        
        // Store reference for global access
        window.skeletonControls = this;
    }
    
    // Create slider control HTML
    createSliderControl(id, label, value, config, onChangeCallback) {
        const sliderId = `slider-${id}`;
        const valueId = `value-${id}`;
        
        // Store callback for later use
        this.activeControls[id] = {
            callback: onChangeCallback,
            config: config
        };
        
        return `
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <label for="${sliderId}" style="font-size: 11px; color: #555;">${label}:</label>
                    <span id="${valueId}" style="font-size: 11px; font-weight: bold; color: #333;">${value}${config.suffix || ''}</span>
                </div>
                <input 
                    type="range" 
                    id="${sliderId}"
                    min="${config.min}" 
                    max="${config.max}" 
                    step="${config.step}" 
                    value="${value}"
                    style="width: 100%; height: 4px; background: #ddd; outline: none; border-radius: 2px;"
                    oninput="skeletonControls.handleSliderChange('${id}', this.value)"
                />
            </div>
        `;
    }
    
    // Create select control HTML
    createSelectControl(id, label, value, config, onChangeCallback) {
        const selectId = `select-${id}`;
        
        // Store callback for later use
        this.activeControls[id] = {
            callback: onChangeCallback,
            config: config
        };
        
        let optionsHtml = '';
        config.options.forEach(option => {
            const selected = option === value ? 'selected' : '';
            optionsHtml += `<option value="${option}" ${selected}>${option}</option>`;
        });
        
        return `
            <div style="margin-bottom: 10px;">
                <label for="${selectId}" style="font-size: 11px; color: #555; display: block; margin-bottom: 4px;">${label}:</label>
                <select 
                    id="${selectId}"
                    style="width: 100%; padding: 4px; font-size: 11px; border: 1px solid #ddd; border-radius: 3px;"
                    onchange="skeletonControls.handleSelectChange('${id}', this.value)"
                >
                    ${optionsHtml}
                </select>
            </div>
        `;
    }
    
    // Handle slider value changes
    handleSliderChange(controlId, value) {
        const control = this.activeControls[controlId];
        if (!control) return;
        
        // Throttle updates for performance
        const now = performance.now();
        if (now - this.lastUpdate < this.updateThrottle) return;
        
        // Update display value
        const valueElement = document.getElementById(`value-${controlId}`);
        if (valueElement) {
            const suffix = control.config.suffix || '';
            valueElement.textContent = value + suffix;
        }
        
        // Execute callback
        if (control.callback) {
            control.callback(parseFloat(value));
        }
        
        this.lastUpdate = now;
    }
    
    // Handle select value changes
    handleSelectChange(controlId, value) {
        const control = this.activeControls[controlId];
        if (!control) return;
        
        // Execute callback
        if (control.callback) {
            control.callback(value);
        }
    }
    
    // Update bone length
    updateBoneLength(selectedBone, newLength) {
        if (!selectedBone || !selectedBone.bone) return;
        
        try {
            // Validate length
            if (newLength < 5 || newLength > 300) {
                console.warn(`Invalid bone length: ${newLength}px`);
                return;
            }
            
            const bone = selectedBone.bone;
            const start = bone.start;
            const currentEnd = bone.end;
            
            // Calculate new end position maintaining direction
            const direction = currentEnd.minus(start).normalised();
            const newEnd = start.plus(direction.multiplyBy(newLength));
            
            bone.setEndLocation(newEnd);
            
            // Record operation for undo
            if (this.editor.recordOperation) {
                this.editor.recordOperation('BONE_MODIFY', {
                    type: 'length',
                    chainIndex: selectedBone.chainIndex,
                    boneIndex: selectedBone.boneIndex,
                    oldLength: bone.getLength(),
                    newLength: newLength
                });
            }
            
        } catch (error) {
            console.error('Failed to update bone length:', error);
        }
    }
    
    // Update bone angle
    updateBoneAngle(selectedBone, newAngle) {
        if (!selectedBone || !selectedBone.bone) return;
        
        try {
            const bone = selectedBone.bone;
            const start = bone.start;
            const length = bone.getLength();
            
            // Convert angle to radians
            const angleRad = newAngle * Math.PI / 180;
            
            // Calculate new end position
            const newEnd = new FIK.V2(
                start.x + Math.cos(angleRad) * length,
                start.y + Math.sin(angleRad) * length
            );
            
            bone.setEndLocation(newEnd);
            
            // Record operation for undo
            if (this.editor.recordOperation) {
                this.editor.recordOperation('BONE_MODIFY', {
                    type: 'angle',
                    chainIndex: selectedBone.chainIndex,
                    boneIndex: selectedBone.boneIndex,
                    newAngle: newAngle
                });
            }
            
        } catch (error) {
            console.error('Failed to update bone angle:', error);
        }
    }
    
    // Update joint constraint
    updateJointConstraint(selectedBone, constraintType, value) {
        if (!selectedBone || !selectedBone.bone || !selectedBone.bone.joint) return;
        
        try {
            const joint = selectedBone.bone.joint;
            
            if (constraintType === 'clockwise') {
                joint.clockwiseConstraintDegs = value;
            } else if (constraintType === 'anticlockwise') {
                joint.anticlockwiseConstraintDegs = value;
            }
            
            console.log(`Updated ${constraintType} constraint to ${value}°`);
            
        } catch (error) {
            console.error('Failed to update joint constraint:', error);
        }
    }
    
    // Update joint type
    updateJointType(selectedBone, jointType) {
        if (!selectedBone || !selectedBone.bone) return;
        
        try {
            // This would require more complex FIK.js integration
            console.log(`Joint type change to ${jointType} - requires FIK.js extension`);
            
        } catch (error) {
            console.error('Failed to update joint type:', error);
        }
    }
    
    // Action button handlers
    resetBoneToDefault(chainIndex, boneIndex) {
        console.log(`Resetting bone ${boneIndex} in chain ${chainIndex} to default`);
        
        // Get original bone configuration
        const chainConfig = this.builder.chainConfigs[chainIndex];
        if (chainConfig && chainConfig.bones && chainConfig.bones[boneIndex]) {
            const originalConfig = chainConfig.bones[boneIndex];
            
            // Reset to original length
            if (this.editor.selectedBone) {
                this.updateBoneLength(this.editor.selectedBone, originalConfig.length);
                
                // Refresh controls
                this.showBoneControls(this.editor.selectedBone);
            }
        }
    }
    
    deleteBone(chainIndex, boneIndex) {
        console.log(`Deleting bone ${boneIndex} from chain ${chainIndex}`);
        
        if (this.editor.boneManipulator && this.editor.boneManipulator.removeBoneFromChain) {
            this.editor.boneManipulator.removeBoneFromChain(chainIndex, boneIndex);
            this.hideControls();
            this.editor.clearSelection();
            this.editor.updateSidebar();
        }
    }
    
    addBoneToChain(chainIndex) {
        console.log(`Adding bone to chain ${chainIndex}`);
        
        if (this.editor.boneManipulator && this.editor.boneManipulator.addBoneToChain) {
            this.editor.boneManipulator.addBoneToChain(chainIndex);
            this.editor.updateSidebar();
        }
    }
    
    duplicateChain(chainIndex) {
        console.log(`Duplicating chain ${chainIndex}`);
        
        try {
            const originalConfig = { ...this.builder.chainConfigs[chainIndex] };
            originalConfig.role = originalConfig.role + '-copy';
            
            // Offset position slightly
            if (originalConfig.basePosition) {
                originalConfig.basePosition.x += 50;
                originalConfig.basePosition.y += 20;
            }
            
            this.builder.chainConfigs.push(originalConfig);
            const newChain = this.builder.createChainFromConfig(originalConfig);
            this.builder.chains.push(newChain);
            
            this.editor.updateSidebar();
            
        } catch (error) {
            console.error('Failed to duplicate chain:', error);
        }
    }
    
    deleteChain(chainIndex) {
        console.log(`Deleting chain ${chainIndex}`);
        
        if (confirm('Are you sure you want to delete this chain?')) {
            this.builder.chains.splice(chainIndex, 1);
            this.builder.chainConfigs.splice(chainIndex, 1);
            
            this.hideControls();
            this.editor.clearSelection();
            this.editor.updateSidebar();
        }
    }
    
    // Hide controls
    hideControls() {
        if (this.controlContainer) {
            this.controlContainer.style('display: none;');
        }
        this.activeControls = {};
    }
    
    // Update controls when selection changes
    updateControls() {
        if (this.editor.selectedBone) {
            this.showBoneControls(this.editor.selectedBone);
        } else if (this.editor.selectedChain !== null) {
            this.showChainControls(this.editor.selectedChain);
        } else {
            this.hideControls();
        }
    }
    
    // Cleanup
    cleanup() {
        this.hideControls();
        
        if (this.controlContainer) {
            this.controlContainer.remove();
            this.controlContainer = null;
        }
        
        this.activeControls = {};
        
        // Remove global reference
        if (window.skeletonControls === this) {
            delete window.skeletonControls;
        }
    }
}