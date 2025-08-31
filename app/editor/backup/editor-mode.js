class EditorMode {
    constructor(builder) {
        this.builder = builder;
        this.active = false;
        this.currentLayer = 'skeleton';
        this.selectedChain = null;
        
        // SKELETON EDITING EXTENSIONS - Multi-level selection system
        this.selectionMode = 'chain'; // 'chain', 'bone', 'joint'
        this.selectedBone = null; // { chainIndex, boneIndex, bone }
        this.selectedJoint = null; // { chainIndex, boneIndex, joint }
        
        // SKELETON EDITING EXTENSIONS - Editing modes and states  
        this.editingMode = 'select'; // 'select', 'move', 'rotate', 'scale', 'add', 'delete'
        this.ikTestMode = false;
        this.dragState = null; // { type, startPos, currentPos, target }
        
        // UI containers - create but hide initially
        this.ui = {
            sidebar: null,
            toolbar: null,
            modal: null
        };
        
        // State management
        this.savedBuilderState = null;
        this.performanceMonitor = {
            lastToggle: 0,
            frameSkips: 0,
            ikSolveRate: 30, // target fps for IK solving
            selectionResponseMax: 50, // max ms for selection response
            lastIKUpdate: 0
        };
        
        // SKELETON EDITING EXTENSIONS - Operation history for undo/redo
        this.operationHistory = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        this.initializeSkeletonEditing();
        this.setupUI();
    }
    
    // SKELETON EDITING EXTENSIONS - Initialize skeleton editing components
    initializeSkeletonEditing() {
        // Initialize BoneManipulator for individual bone selection and manipulation
        this.boneManipulator = new BoneManipulator(this.builder);
        
        // TASK 4: Initialize Template Palette System
        this.templatePalette = new TemplatePalette(this.builder, this);
        
        // TASK 5: Initialize Advanced UI Controls
        this.skeletonControls = new SkeletonControls(this.builder, this);
        
        // TASK 6: Initialize Joint Constraint Editor
        this.constraintEditor = new ConstraintEditor(this.builder, this);
        
        // TASK 7: Initialize ConfigManager for save/load functionality
        this.configManager = new ConfigManager(this.builder, this);
        
        // TASK 9: Initialize OperationHistory for undo/redo functionality
        this.operationHistory = new OperationHistory(this.builder, this);
        
        // TASK 4: Initialize SidebarUI for modular component system
        console.log('📋 Creating SidebarUI...');
        console.log('📋 SidebarUI class available:', typeof SidebarUI);
        
        if (typeof SidebarUI !== 'undefined') {
            this.sidebarUI = new SidebarUI(this.builder, this);
            console.log('📋 SidebarUI created:', this.sidebarUI);
        } else {
            console.error('❌ SidebarUI class is not defined, using fallback');
            this.sidebarUI = {
                initialize: () => console.log('📋 SidebarUI fallback initialize'),
                show: () => console.log('📋 SidebarUI fallback show'),
                hide: () => console.log('📋 SidebarUI fallback hide'),
                updateAll: () => console.log('📋 SidebarUI fallback updateAll'),
                cleanup: () => console.log('📋 SidebarUI fallback cleanup')
            };
        }
        
        console.log('Skeleton editing foundation initialized with BoneManipulator, TemplatePalette, SkeletonControls, ConstraintEditor, OperationHistory, and SidebarUI');
    }
    
    setupUI() {
        // Initialize the new modular SidebarUI
        console.log('🔧 Setting up UI, SidebarUI is:', this.sidebarUI);
        if (this.sidebarUI) {
            this.sidebarUI.initialize();
        } else {
            console.error('❌ SidebarUI is not initialized!');
        }
        
        // Create toolbar container (keeping existing toolbar for now)
        if (!this.ui.toolbar) {
            this.ui.toolbar = createDiv();
            this.ui.toolbar.id('editor-toolbar');
            this.ui.toolbar.position(250, 0);
            this.ui.toolbar.style(`
                width: calc(100vw - 250px); 
                height: 60px; 
                background: #e8e8e8; 
                position: fixed; 
                z-index: 1000; 
                border-bottom: 2px solid #ddd;
                display: none;
                padding: 10px;
                font-family: Arial, sans-serif;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            `);
            
            // Add basic toolbar content
            this.ui.toolbar.html(`
                <h3 style="margin: 0; display: inline-block; color: #333;">Madhuban Creature Editor</h3>
                <span style="float: right; margin-top: 5px; color: #666; font-size: 14px;">Layer: Skeleton | Press E to exit</span>
            `);
        }
    }
    
    show() {
        console.time('editor-show');
        this.active = true;
        this.performanceMonitor.lastToggle = Date.now();
        
        // Save builder state
        this.savedBuilderState = {
            locomotion: this.builder.activeLocomotion,
            renderMode: this.builder.renderMode,
            mouseTarget: new FIK.V2(this.builder.mouseTarget.x, this.builder.mouseTarget.y)
        };
        
        // CRITICAL: Enable editor mode in builder to freeze creature movement
        this.builder.editorActive = true;
        
        // Pause locomotion and set render mode
        this.builder.activeLocomotion = null;
        this.builder.renderMode = 'skeleton';
        
        // Show UI
        this.sidebarUI.show();
        if (this.ui.toolbar) this.ui.toolbar.style('display: block;');
        
        console.log('✅ Editor mode activated - creature movement frozen for selection');
        console.timeEnd('editor-show');
    }
    
    hide() {
        console.time('editor-hide');
        this.active = false;
        
        // CRITICAL: Disable editor mode in builder to restore creature movement
        this.builder.editorActive = false;
        
        // Restore builder state
        if (this.savedBuilderState) {
            this.builder.activeLocomotion = this.savedBuilderState.locomotion;
            this.builder.renderMode = this.savedBuilderState.renderMode;
            // Restore mouse target if needed
            if (this.savedBuilderState.mouseTarget) {
                this.builder.mouseTarget.set(
                    this.savedBuilderState.mouseTarget.x, 
                    this.savedBuilderState.mouseTarget.y
                );
            }
        }
        
        // Hide UI
        this.sidebarUI.hide();
        if (this.ui.toolbar) this.ui.toolbar.style('display: none;');
        
        // Clear selection
        this.selectedChain = null;
        this.clearSelection();
        
        console.log('✅ Editor mode deactivated - creature movement restored');
        console.timeEnd('editor-hide');
    }
    
    update() {
        if (!this.active) return;
        
        // Throttle expensive operations to maintain performance
        if (frameCount % 2 === 0) {
            this.updateUI();
        }
        
        // Performance monitoring
        if (frameCount % 60 === 0) { // Check once per second
            this.monitorPerformance();
        }
    }
    
    updateUI() {
        // Update sidebar content using the new SidebarUI
        this.sidebarUI.updateAll();
    }
    
    updateSidebar() {
        if (!this.ui.sidebar) return;
        
        let content = `
            <div style="padding: 15px;">
                <h4 style="margin-top: 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px;">Creature Editor</h4>
        `;
        
        if (this.builder.creatureType) {
            content += `
                <div style="margin-bottom: 15px; padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd;">
                    <h5 style="margin: 0 0 5px 0; color: #666;">Current Creature</h5>
                    <p style="margin: 0; font-weight: bold; text-transform: capitalize;">${this.builder.creatureType}</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">${this.builder.chains.length} chains</p>
                </div>
            `;
        }
        
        // SKELETON EDITING EXTENSIONS - Enhanced selection display
        if (this.selectedBone && this.boneManipulator) {
            const boneProps = this.boneManipulator.getBoneProperties(this.selectedBone);
            if (boneProps) {
                content += `
                    <div style="margin-bottom: 15px; padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd;">
                        <h5 style="margin: 0 0 10px 0; color: #666;">Selected Bone</h5>
                        <p style="margin: 5px 0;"><strong>Chain:</strong> ${this.selectedBone.chainIndex}</p>
                        <p style="margin: 5px 0;"><strong>Bone:</strong> ${this.selectedBone.boneIndex}</p>
                        <p style="margin: 5px 0;"><strong>Length:</strong> ${boneProps.length}px</p>
                        <p style="margin: 5px 0;"><strong>Angle:</strong> ${boneProps.angle}°</p>
                        <p style="margin: 5px 0;"><strong>Start:</strong> (${boneProps.startX}, ${boneProps.startY})</p>
                        <p style="margin: 5px 0;"><strong>End:</strong> (${boneProps.endX}, ${boneProps.endY})</p>
                        <p style="margin: 5px 0;"><strong>Constraints:</strong> +${boneProps.constraints.clockwise}° / -${boneProps.constraints.anticlockwise}°</p>
                    </div>
                `;
            }
        } else if (this.selectedChain !== null && this.builder.chainConfigs[this.selectedChain]) {
            const config = this.builder.chainConfigs[this.selectedChain];
            content += `
                <div style="margin-bottom: 15px; padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd;">
                    <h5 style="margin: 0 0 10px 0; color: #666;">Selected Chain</h5>
                    <p style="margin: 5px 0;"><strong>Role:</strong> ${config.role}</p>
                    <p style="margin: 5px 0;"><strong>Type:</strong> ${config.type}</p>
                    <p style="margin: 5px 0;"><strong>Attachment:</strong> ${config.attachment}</p>
                    <p style="margin: 5px 0;"><strong>Bones:</strong> ${config.bones.length}</p>
                    <p style="margin: 5px 0;"><strong>Locomotion:</strong> ${config.locomotionRole || 'none'}</p>
                </div>
            `;
        } else {
            content += `
                <div style="margin-bottom: 15px; padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd;">
                    <h5 style="margin: 0 0 10px 0; color: #666;">Selection</h5>
                    <p style="margin: 0; color: #888; font-style: italic;">
                        ${this.selectionMode === 'bone' ? 'Click on a bone to select it' : 'Click on a chain to select it'}
                    </p>
                </div>
            `;
        }
        
        content += `
            <div style="margin-bottom: 15px; padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd;">
                <h5 style="margin: 0 0 10px 0; color: #666;">Available Templates</h5>
                <button style="width: 100%; padding: 8px; margin: 2px 0; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;" onclick="builder.buildFish(); editor.updateSidebar();">Fish</button>
                <button style="width: 100%; padding: 8px; margin: 2px 0; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;" onclick="builder.buildBipedalCrane(); editor.updateSidebar();">Crane</button>
                <button style="width: 100%; padding: 8px; margin: 2px 0; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;" onclick="builder.buildHorse(); editor.updateSidebar();">Horse</button>
                <button style="width: 100%; padding: 8px; margin: 2px 0; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;" onclick="builder.buildLizard(); editor.updateSidebar();">Lizard</button>
            </div>
            
            <div style="margin-bottom: 15px; padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd;">
                <h5 style="margin: 0 0 10px 0; color: #666;">Layer Controls</h5>
                <p style="margin: 0; color: #888; font-size: 12px;">Current Layer: ${this.currentLayer}</p>
                <button style="width: 100%; padding: 6px; margin: 2px 0; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;" onclick="editor.setLayer('skeleton');">Skeleton</button>
                <button style="width: 100%; padding: 6px; margin: 2px 0; background: #ffc107; color: black; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;" onclick="editor.setLayer('muscle');">Muscle (Coming Soon)</button>
                <button style="width: 100%; padding: 6px; margin: 2px 0; background: #17a2b8; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;" onclick="editor.setLayer('styling');">Styling (Coming Soon)</button>
            </div>
            
            <div style="margin-bottom: 15px; padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd;">
                <h5 style="margin: 0 0 10px 0; color: #666;">Skeleton Editing</h5>
                <div style="margin-bottom: 8px;">
                    <label style="font-size: 12px; color: #555;">Selection Mode:</label>
                    <select style="width: 100%; padding: 4px; margin: 2px 0; font-size: 12px;" onchange="editor.setSelectionMode(this.value);">
                        <option value="chain" ${this.selectionMode === 'chain' ? 'selected' : ''}>Chain</option>
                        <option value="bone" ${this.selectionMode === 'bone' ? 'selected' : ''}>Bone</option>
                        <option value="joint" ${this.selectionMode === 'joint' ? 'selected' : ''}>Joint</option>
                    </select>
                </div>
                <div style="margin-bottom: 8px;">
                    <label style="font-size: 12px; color: #555;">Editing Mode:</label>
                    <select style="width: 100%; padding: 4px; margin: 2px 0; font-size: 12px;" onchange="editor.setEditingMode(this.value);">
                        <option value="select" ${this.editingMode === 'select' ? 'selected' : ''}>Select</option>
                        <option value="move" ${this.editingMode === 'move' ? 'selected' : ''}>Move</option>
                        <option value="rotate" ${this.editingMode === 'rotate' ? 'selected' : ''}>Rotate</option>
                        <option value="scale" ${this.editingMode === 'scale' ? 'selected' : ''}>Scale</option>
                    </select>
                </div>
                <button style="width: 100%; padding: 6px; margin: 2px 0; background: ${this.ikTestMode ? '#dc3545' : '#007bff'}; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;" onclick="editor.toggleIKTestMode();">
                    ${this.ikTestMode ? 'Exit IK Test' : 'IK Test Mode'}
                </button>
            </div>
            
            <div style="margin-bottom: 15px; padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd;">
                <h5 style="margin: 0 0 10px 0; color: #666; border-bottom: 1px solid #eee; padding-bottom: 5px;">↩️ Undo / Redo</h5>
                <div style="margin-bottom: 8px;">
                    <button style="width: 48%; padding: 6px; margin-right: 4%; background: ${this.operationHistory && this.operationHistory.canUndo() ? '#6c757d' : '#ccc'}; color: white; border: none; border-radius: 3px; cursor: ${this.operationHistory && this.operationHistory.canUndo() ? 'pointer' : 'not-allowed'}; font-size: 11px;" onclick="editor.undoOperation();" ${this.operationHistory && this.operationHistory.canUndo() ? '' : 'disabled'}>
                        Undo
                    </button>
                    <button style="width: 48%; padding: 6px; background: ${this.operationHistory && this.operationHistory.canRedo() ? '#6c757d' : '#ccc'}; color: white; border: none; border-radius: 3px; cursor: ${this.operationHistory && this.operationHistory.canRedo() ? 'pointer' : 'not-allowed'}; font-size: 11px;" onclick="editor.redoOperation();" ${this.operationHistory && this.operationHistory.canRedo() ? '' : 'disabled'}>
                        Redo
                    </button>
                </div>
                <div style="font-size: 10px; color: #666; text-align: center;">
                    ${this.operationHistory ? this.operationHistory.operations.length : 0} operations in history
                </div>
                <div style="font-size: 9px; color: #888; text-align: center; margin-top: 2px;">
                    Ctrl+Z: Undo | Ctrl+Y: Redo
                </div>
            </div>
            
            <div style="margin-bottom: 15px; padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd;">
                <h5 style="margin: 0 0 10px 0; color: #666; border-bottom: 1px solid #eee; padding-bottom: 5px;">💾 Save / Load</h5>
                <div style="margin-bottom: 8px;">
                    <button style="width: 48%; padding: 6px; margin-right: 4%; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;" onclick="editor.saveCreatureConfig();">
                        Save
                    </button>
                    <button style="width: 48%; padding: 6px; background: #17a2b8; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;" onclick="editor.loadCreatureConfig();">
                        Load
                    </button>
                </div>
                <div style="margin-bottom: 8px;">
                    <select id="editor-export-format" style="width: 100%; padding: 4px; font-size: 11px; margin-bottom: 4px;">
                        <option value="complete">Complete (with modifications)</option>
                        <option value="skeleton">Skeleton only</option>
                        <option value="base">Base template</option>
                    </select>
                </div>
                <button style="width: 100%; padding: 6px; background: #ffc107; color: #333; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;" onclick="editor.exportCreatureConfig();">
                    Export JSON
                </button>
                <input type="file" id="editor-config-upload" accept=".json" style="display: none;" onchange="editor.handleConfigUpload(this);">
            </div>
        `;
        
        content += `</div>`;
        
        this.ui.sidebar.html(content);
    }
    
    setLayer(layerName) {
        this.currentLayer = layerName;
        this.sidebarUI.updateAll();
        console.log(`Editor layer changed to: ${layerName}`);
    }
    
    draw() {
        if (!this.active) return;
        
        // Draw selection highlighting
        this.drawSelectionHighlight();
        
        // Draw IK test mode visualization
        if (this.ikTestMode) {
            this.drawIKTestMode();
        }
        
        // Draw editor-specific overlays
        this.drawEditingOverlay();
    }
    
    // SKELETON EDITING EXTENSIONS - Enhanced selection highlighting
    drawSelectionHighlight() {
        // Draw chain highlighting if one is selected
        if (this.selectedChain !== null) {
            this.drawChainHighlight();
        }
        
        // Draw bone highlighting if one is selected (will be implemented in Task 2)
        if (this.selectedBone && this.boneManipulator) {
            this.boneManipulator.drawBoneHighlight(this.selectedBone);
        }
        
        // TASK 6: Draw joint highlighting and constraint visualization
        if (this.selectedJoint && this.constraintEditor) {
            this.constraintEditor.drawJointHighlight(this.selectedJoint);
        }
        
        // TASK 6: Draw constraint visualization for selected bone with joint
        if (this.selectedBone && this.selectedBone.bone && this.selectedBone.bone.joint && this.constraintEditor) {
            this.constraintEditor.drawJointConstraints(this.selectedBone);
        }
    }
    
    // SKELETON EDITING EXTENSIONS - Enhanced IK Test Mode visualization
    drawIKTestMode() {
        if (!this.ikTestMode) return;
        
        // Draw enhanced reachable areas and end-effector targets
        this.builder.chains.forEach((chain, index) => {
            if (chain.numBones === 0) return;
            
            const base = chain.bones[0].start;
            const effector = chain.bones[chain.numBones - 1].end;
            
            // Calculate chain length for reachable area
            let chainLength = 0;
            for (let i = 0; i < chain.numBones; i++) {
                chainLength += chain.bones[i].getLength();
            }
            
            push();
            
            // Enhanced reachable area visualization
            const isSelected = this.selectedChain === index;
            
            // Draw outer reachable area (full extension)
            noFill();
            stroke(100, 255, 100, isSelected ? 150 : 80);
            strokeWeight(isSelected ? 2 : 1);
            circle(base.x, base.y, chainLength * 2);
            
            // Draw inner dead zone (minimum reach)
            if (chain.numBones > 1) {
                const minReach = Math.abs(chainLength - chain.bones[0].getLength() * 2);
                stroke(255, 100, 100, isSelected ? 100 : 50);
                strokeWeight(1);
                circle(base.x, base.y, minReach * 2);
            }
            
            // Draw chain base indicator
            fill(isSelected ? 255 : 200, isSelected ? 255 : 200, 100, 200);
            noStroke();
            circle(base.x, base.y, 6);
            
            // Enhanced end-effector visualization
            const hoverDistance = dist(mouseX, mouseY, effector.x, effector.y);
            const isHovered = hoverDistance < 15;
            
            // End-effector with hover feedback
            fill(255, 100, 100, isSelected || isHovered ? 255 : 180);
            noStroke();
            circle(effector.x, effector.y, isSelected || isHovered ? 12 : 8);
            
            // Add selection ring for selected chain
            if (isSelected) {
                noFill();
                stroke(255, 255, 0, 200);
                strokeWeight(2);
                circle(effector.x, effector.y, 18);
            }
            
            // Hover ring for interactive feedback
            if (isHovered && !isSelected) {
                noFill();
                stroke(255, 255, 255, 150);
                strokeWeight(1);
                circle(effector.x, effector.y, 15);
            }
            
            // Chain information label with enhanced styling
            fill(255, 255, 255, 200);
            stroke(0, 0, 0, 100);
            strokeWeight(1);
            textAlign(CENTER);
            textSize(10);
            textStyle(BOLD);
            text(`Chain ${index}`, effector.x, effector.y + 25);
            
            // Add bone count for detailed info
            if (isSelected || isHovered) {
                textSize(8);
                textStyle(NORMAL);
                fill(200, 200, 200, 180);
                text(`${chain.numBones} bones`, effector.x, effector.y + 35);
                text(`${chainLength.toFixed(0)}px reach`, effector.x, effector.y + 45);
            }
            
            // Draw constraint visualization for selected chain
            if (isSelected) {
                this.drawChainConstraints(chain, index);
            }
            
            pop();
        });
        
        // Draw IK target feedback if dragging
        this.drawIKTargetFeedback();
        
        // Enhanced IK test mode indicator with status
        push();
        fill(255, 100, 100, 200);
        stroke(0, 0, 0, 100);
        strokeWeight(1);
        textAlign(LEFT);
        textSize(16);
        textStyle(BOLD);
        text('🎯 IK TEST MODE', 260, 30);
        
        // Performance indicator
        textSize(12);
        textStyle(NORMAL);
        fill(200, 200, 200, 180);
        text(`FPS: ${frameRate().toFixed(1)} | Drag end-effectors to test poses`, 260, 45);
        
        // Selected chain info
        if (this.selectedChain !== null && this.selectedChain < this.builder.chains.length) {
            const chainConfig = this.builder.chainConfigs[this.selectedChain];
            textSize(11);
            fill(255, 255, 100, 200);
            text(`Selected: ${chainConfig.role} (Chain ${this.selectedChain})`, 260, 60);
        }
        
        pop();
    }
    
    // SKELETON EDITING EXTENSIONS - Draw constraint visualization for chain
    drawChainConstraints(chain, chainIndex) {
        if (!chain || chain.numBones === 0) return;
        
        // Draw constraint arcs for joints
        for (let i = 1; i < chain.numBones; i++) {
            const bone = chain.bones[i];
            const prevBone = chain.bones[i - 1];
            
            if (bone.joint) {
                const jointPos = prevBone.end;
                const constraintRadius = 30;
                
                push();
                translate(jointPos.x, jointPos.y);
                
                // Get bone direction for constraint arc positioning
                const boneAngle = atan2(bone.end.y - bone.start.y, bone.end.x - bone.start.x);
                
                // Draw constraint arc
                noFill();
                stroke(255, 200, 100, 120);
                strokeWeight(2);
                
                const clockwiseLimit = radians(bone.joint.clockwiseConstraintDegs || 45);
                const anticlockwiseLimit = radians(bone.joint.anticlockwiseConstraintDegs || 45);
                
                arc(0, 0, constraintRadius, constraintRadius, 
                    boneAngle - anticlockwiseLimit, 
                    boneAngle + clockwiseLimit);
                
                // Draw constraint limit lines
                stroke(255, 150, 100, 80);
                strokeWeight(1);
                const limitLength = constraintRadius / 2;
                
                // Clockwise limit
                line(0, 0, 
                     cos(boneAngle + clockwiseLimit) * limitLength,
                     sin(boneAngle + clockwiseLimit) * limitLength);
                
                // Anticlockwise limit
                line(0, 0,
                     cos(boneAngle - anticlockwiseLimit) * limitLength,
                     sin(boneAngle - anticlockwiseLimit) * limitLength);
                
                pop();
            }
        }
    }
    
    // SKELETON EDITING EXTENSIONS - Draw IK target feedback during dragging
    drawIKTargetFeedback() {
        if (!this.ikTargetState || !this.ikTestMode) return;
        
        // Draw target feedback for each chain being manipulated
        Object.keys(this.ikTargetState).forEach(chainIndex => {
            const state = this.ikTargetState[chainIndex];
            if (!state || !state.target) return;
            
            const target = state.target;
            
            push();
            
            // Target indicator with status coloring
            let targetColor, targetSize;
            if (state.inDeadZone) {
                targetColor = [255, 100, 255]; // Magenta for dead zone
                targetSize = 16;
            } else if (!state.reachable) {
                targetColor = [255, 50, 50]; // Red for unreachable
                targetSize = 12;
            } else {
                targetColor = [100, 255, 100]; // Green for reachable
                targetSize = 10;
            }
            
            // Draw target with pulsing effect
            const pulse = sin(frameCount * 0.2) * 0.3 + 0.7;
            fill(targetColor[0], targetColor[1], targetColor[2], 200 * pulse);
            noStroke();
            circle(target.x, target.y, targetSize);
            
            // Draw crosshair for precise targeting
            stroke(targetColor[0], targetColor[1], targetColor[2], 150);
            strokeWeight(2);
            line(target.x - 8, target.y, target.x + 8, target.y);
            line(target.x, target.y - 8, target.x, target.y + 8);
            
            // Status text near target
            fill(255, 255, 255, 200);
            stroke(0, 0, 0, 100);
            strokeWeight(1);
            textAlign(CENTER);
            textSize(9);
            textStyle(NORMAL);
            
            let statusText = '';
            if (state.inDeadZone) {
                statusText = 'DEAD ZONE';
            } else if (!state.reachable) {
                statusText = `OUT OF REACH (+${(state.distance - state.maxReach).toFixed(0)}px)`;
            } else {
                statusText = `${(state.maxReach - state.distance).toFixed(0)}px available`;
            }
            
            text(statusText, target.x, target.y - 20);
            
            pop();
        });
    }
    
    drawChainHighlight() {
        if (this.selectedChain >= this.builder.chains.length) return;
        
        const chain = this.builder.chains[this.selectedChain];
        push();
        stroke(255, 255, 0); // Yellow highlight
        strokeWeight(4);
        noFill();
        
        // Draw outline around chain
        for (let i = 0; i < chain.numBones; i++) {
            const bone = chain.bones[i];
            const start = bone.start;
            const end = bone.end;
            line(start.x, start.y, end.x, end.y);
        }
        pop();
    }
    
    drawEditingOverlay() {
        // Draw grid in background for reference
        push();
        stroke(200, 200, 200, 100);
        strokeWeight(1);
        
        const gridSize = 20;
        for (let x = 250; x < width; x += gridSize) { // Start after sidebar
            line(x, 60, x, height); // Start below toolbar
        }
        for (let y = 60; y < height; y += gridSize) {
            line(250, y, width, y);
        }
        pop();
        
        // Draw canvas boundaries
        push();
        stroke(100, 100, 100, 150);
        strokeWeight(2);
        noFill();
        rect(250, 60, width - 250, height - 60);
        pop();
    }
    
    handleMouseClick() {
        if (!this.active) return false;
        
        // Check if click is in canvas area (not on UI)
        if (mouseX < 250 || mouseY < 60) return false;
        
        // SKELETON EDITING EXTENSIONS - Multi-level selection handling
        const selectionResult = this.handleSkeletonSelection(mouseX, mouseY);
        if (selectionResult) {
            this.sidebarUI.updateAll();
            // TASK 5: Update controls when selection changes
            if (this.skeletonControls) {
                this.skeletonControls.updateControls();
            }
            return true;
        }
        
        // Click on empty space deselects all
        this.clearSelection();
        this.sidebarUI.updateAll();
        // TASK 5: Hide controls when nothing is selected
        if (this.skeletonControls) {
            this.skeletonControls.hideControls();
        }
        return true;
    }
    
    // SKELETON EDITING EXTENSIONS - Multi-level selection system
    handleSkeletonSelection(mouseX, mouseY) {
        const startTime = performance.now();
        
        // First try bone-level selection if in bone mode
        if (this.selectionMode === 'bone' && this.boneManipulator) {
            const boneResult = this.boneManipulator.selectBone(mouseX, mouseY);
            if (boneResult) {
                this.selectedBone = boneResult;
                this.selectedChain = boneResult.chainIndex;
                this.selectedJoint = null;
                
                // Record selection performance
                const selectionTime = performance.now() - startTime;
                if (selectionTime > this.performanceMonitor.selectionResponseMax) {
                    console.warn(`Bone selection took ${selectionTime.toFixed(1)}ms`);
                }
                return true;
            }
        }
        
        // Try chain-level selection (existing logic)
        for (let i = 0; i < this.builder.chains.length; i++) {
            if (this.isPointNearChain(mouseX, mouseY, this.builder.chains[i])) {
                this.selectedChain = i;
                this.selectedBone = null;
                this.selectedJoint = null;
                return true;
            }
        }
        
        return false;
    }
    
    // SKELETON EDITING EXTENSIONS - Clear all selections
    clearSelection() {
        this.selectedChain = null;
        this.selectedBone = null;
        this.selectedJoint = null;
    }
    
    // SKELETON EDITING EXTENSIONS - Toggle IK Test Mode
    toggleIKTestMode() {
        this.ikTestMode = !this.ikTestMode;
        
        if (this.ikTestMode) {
            console.log('IK Test Mode: ENABLED - Drag end-effectors to test poses');
            // Optimize all chains for real-time IK solving
            this.optimizeChainsForIK();
        } else {
            console.log('IK Test Mode: DISABLED');
            // Restore normal precision settings
            this.restoreNormalChainPrecision();
        }
        
        this.sidebarUI.updateAll();
        return this.ikTestMode;
    }
    
    // SKELETON EDITING EXTENSIONS - Optimize chains for real-time IK
    optimizeChainsForIK() {
        this.builder.chains.forEach(chain => {
            if (chain.setMaxIterationAttempts) {
                chain.setMaxIterationAttempts(6); // vs default 15
            }
            if (chain.setSolveDistanceThreshold) {
                chain.setSolveDistanceThreshold(2.5); // vs default 1.0
            }
            if (chain.setMinIterationChange) {
                chain.setMinIterationChange(0.08); // vs default 0.01
            }
        });
    }
    
    // SKELETON EDITING EXTENSIONS - Restore normal chain precision
    restoreNormalChainPrecision() {
        this.builder.chains.forEach(chain => {
            if (chain.setMaxIterationAttempts) {
                chain.setMaxIterationAttempts(15); // default
            }
            if (chain.setSolveDistanceThreshold) {
                chain.setSolveDistanceThreshold(1.0); // default
            }
            if (chain.setMinIterationChange) {
                chain.setMinIterationChange(0.01); // default
            }
        });
    }
    
    // SKELETON EDITING EXTENSIONS - Handle mouse dragging for bone manipulation
    handleMouseDrag() {
        if (!this.active) return false;
        
        // IK Test Mode end-effector dragging
        if (this.ikTestMode && this.selectedChain !== null) {
            return this.handleIKDrag(this.selectedChain, mouseX, mouseY);
        }
        
        // Bone manipulation dragging (will be implemented in Task 3)
        if (this.selectedBone && this.boneManipulator) {
            return this.boneManipulator.handleBoneDrag(this.selectedBone, mouseX, mouseY, this.editingMode);
        }
        
        return false;
    }
    
    // SKELETON EDITING EXTENSIONS - Enhanced IK dragging with constraint validation
    handleIKDrag(chainIndex, targetX, targetY) {
        if (chainIndex >= this.builder.chains.length) return false;
        
        // Performance optimization - throttle IK updates
        const now = performance.now();
        if (now - this.performanceMonitor.lastIKUpdate < (1000 / this.performanceMonitor.ikSolveRate)) {
            return false;
        }
        
        const chain = this.builder.chains[chainIndex];
        const target = new FIK.V2(targetX, targetY);
        const base = chain.bones[0].start;
        
        // Calculate distance to validate reachability
        const distanceToTarget = base.distanceTo(target);
        let chainLength = 0;
        for (let i = 0; i < chain.numBones; i++) {
            chainLength += chain.bones[i].getLength();
        }
        
        // Visual feedback for reachability
        const isReachable = distanceToTarget <= chainLength;
        const isInDeadZone = chain.numBones > 1 && 
            distanceToTarget < Math.abs(chainLength - chain.bones[0].getLength() * 2);
        
        // Store target state for visual feedback
        if (!this.ikTargetState) this.ikTargetState = {};
        this.ikTargetState[chainIndex] = {
            target: target,
            reachable: isReachable,
            inDeadZone: isInDeadZone,
            distance: distanceToTarget,
            maxReach: chainLength
        };
        
        try {
            // Attempt IK solve with performance monitoring
            const solveStart = performance.now();
            
            if (isReachable && !isInDeadZone) {
                chain.solveForTarget(target);
            } else if (isReachable) {
                // Target in dead zone - solve to closest valid position
                const direction = target.minus(base).normalize();
                const minReach = Math.abs(chainLength - chain.bones[0].getLength() * 2);
                const adjustedTarget = base.plus(direction.multiply(minReach + 5));
                chain.solveForTarget(adjustedTarget);
            } else {
                // Target unreachable - solve to maximum reach in target direction
                const direction = target.minus(base).normalize();
                const maxTarget = base.plus(direction.multiply(chainLength - 1));
                chain.solveForTarget(maxTarget);
            }
            
            // Performance monitoring
            const solveTime = performance.now() - solveStart;
            if (solveTime > 16.67) { // More than one frame at 60fps
                console.warn(`IK solve took ${solveTime.toFixed(1)}ms for chain ${chainIndex}`);
            }
            
            this.performanceMonitor.lastIKUpdate = now;
            return true;
            
        } catch (error) {
            console.error(`IK solve error for chain ${chainIndex}:`, error);
            return false;
        }
    }
    
    // SKELETON EDITING EXTENSIONS - Switch selection mode
    setSelectionMode(mode) {
        if (['chain', 'bone', 'joint'].includes(mode)) {
            this.selectionMode = mode;
            this.clearSelection();
            this.sidebarUI.updateAll();
            console.log(`Selection mode: ${mode}`);
        }
    }
    
    // SKELETON EDITING EXTENSIONS - Switch editing mode  
    setEditingMode(mode) {
        if (['select', 'move', 'rotate', 'scale', 'add', 'delete'].includes(mode)) {
            this.editingMode = mode;
            console.log(`Editing mode: ${mode}`);
        }
    }
    
    isPointNearChain(px, py, chain) {
        const threshold = 15; // Generous click threshold
        
        for (let i = 0; i < chain.numBones; i++) {
            const bone = chain.bones[i];
            const start = bone.start;
            const end = bone.end;
            
            // Calculate distance from point to line segment
            const dist = this.pointToLineDistance(px, py, start.x, start.y, end.x, end.y);
            if (dist < threshold) return true;
        }
        return false;
    }
    
    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) return dist(px, py, x1, y1);
        
        let param = dot / lenSq;
        param = constrain(param, 0, 1);
        
        const xx = x1 + param * C;
        const yy = y1 + param * D;
        
        return dist(px, py, xx, yy);
    }
    
    monitorPerformance() {
        // Simple performance monitoring
        const currentTime = Date.now();
        if (this.performanceMonitor.lastToggle > 0) {
            const timeSinceToggle = currentTime - this.performanceMonitor.lastToggle;
            if (frameRate() < 50) {
                this.performanceMonitor.frameSkips++;
                console.warn(`Editor performance warning: ${frameRate().toFixed(1)}fps`);
            }
        }
    }
    
    // SAVE/LOAD FUNCTIONALITY (PRP1-7)
    saveCreatureConfig() {
        try {
            const format = document.getElementById('editor-export-format')?.value || 'complete';
            const filename = `${this.builder.creatureType}-${format}-${Date.now()}.json`;
            
            console.log(`💾 Saving creature configuration as ${format}...`);
            this.configManager.downloadConfig(filename, format);
            
            // Show success message temporarily
            this.showTemporaryMessage('Configuration saved successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Failed to save configuration:', error);
            this.showTemporaryMessage('Failed to save configuration. Check console for details.', 'error');
        }
    }
    
    loadCreatureConfig() {
        // Trigger file upload dialog
        const fileInput = document.getElementById('editor-config-upload');
        if (fileInput) {
            fileInput.click();
        }
    }
    
    async handleConfigUpload(fileInput) {
        try {
            console.log('📁 Loading creature configuration...');
            const success = await this.configManager.uploadConfig(fileInput);
            
            if (success) {
                this.showTemporaryMessage('Configuration loaded successfully!', 'success');
                
                // Clear file input for future uploads
                fileInput.value = '';
            }
            
        } catch (error) {
            console.error('❌ Failed to load configuration:', error);
            this.showTemporaryMessage(`Failed to load configuration: ${error.message}`, 'error');
            
            // Clear file input
            fileInput.value = '';
        }
    }
    
    exportCreatureConfig() {
        try {
            const format = document.getElementById('editor-export-format')?.value || 'complete';
            const config = this.configManager.exportConfig(format);
            
            console.log('📋 Configuration exported to console:');
            console.log(JSON.stringify(config, null, 2));
            
            // Copy to clipboard if possible
            if (navigator.clipboard) {
                navigator.clipboard.writeText(JSON.stringify(config, null, 2))
                    .then(() => {
                        this.showTemporaryMessage('Configuration copied to clipboard!', 'success');
                    })
                    .catch(() => {
                        this.showTemporaryMessage('Configuration exported to console.', 'info');
                    });
            } else {
                this.showTemporaryMessage('Configuration exported to console.', 'info');
            }
            
        } catch (error) {
            console.error('❌ Failed to export configuration:', error);
            this.showTemporaryMessage('Failed to export configuration. Check console for details.', 'error');
        }
    }
    
    // Show temporary message to user
    showTemporaryMessage(message, type = 'info') {
        // Create temporary message div
        const messageDiv = createDiv();
        messageDiv.style(`
            position: fixed;
            top: 70px;
            left: 260px;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: bold;
            z-index: 1001;
            ${type === 'success' ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : ''}
            ${type === 'error' ? 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;' : ''}
            ${type === 'info' ? 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;' : ''}
        `);
        messageDiv.html(message);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.elt && messageDiv.elt.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
    
    // UNDO/REDO FUNCTIONALITY (PRP2-9)
    undoOperation() {
        if (!this.operationHistory || !this.operationHistory.canUndo()) {
            console.warn('⚠️ Cannot undo: no operations available');
            return false;
        }
        
        try {
            const success = this.operationHistory.undo();
            if (success) {
                this.showTemporaryMessage('Operation undone successfully', 'info');
                console.log('↩️ Undo completed');
            } else {
                this.showTemporaryMessage('Failed to undo operation', 'error');
            }
            return success;
        } catch (error) {
            console.error('❌ Error during undo:', error);
            this.showTemporaryMessage('Error during undo operation', 'error');
            return false;
        }
    }
    
    redoOperation() {
        if (!this.operationHistory || !this.operationHistory.canRedo()) {
            console.warn('⚠️ Cannot redo: no operations available');
            return false;
        }
        
        try {
            const success = this.operationHistory.redo();
            if (success) {
                this.showTemporaryMessage('Operation redone successfully', 'info');
                console.log('↪️ Redo completed');
            } else {
                this.showTemporaryMessage('Failed to redo operation', 'error');
            }
            return success;
        } catch (error) {
            console.error('❌ Error during redo:', error);
            this.showTemporaryMessage('Error during redo operation', 'error');
            return false;
        }
    }
    
    // Record operation for undo/redo system
    recordOperation(type, description, beforeState, afterState) {
        if (!this.operationHistory) return null;
        
        return this.operationHistory.recordOperation(type, {
            description: description,
            timestamp: Date.now()
        }, beforeState, afterState);
    }
    
    // Keyboard shortcuts for undo/redo
    handleKeyboardShortcuts(event) {
        if (!this.active) return false;
        
        // Ctrl+Z for undo
        if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            this.undoOperation();
            return true;
        }
        
        // Ctrl+Y or Ctrl+Shift+Z for redo
        if (event.ctrlKey && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
            event.preventDefault();
            this.redoOperation();
            return true;
        }
        
        return false;
    }

    cleanup() {
        // Cleanup ConfigManager
        if (this.configManager) {
            this.configManager = null;
        }
        
        // Cleanup OperationHistory
        if (this.operationHistory) {
            this.operationHistory.cleanup();
            this.operationHistory = null;
        }
        
        // Cleanup SidebarUI
        if (this.sidebarUI) {
            this.sidebarUI.cleanup();
            this.sidebarUI = null;
        }
        
        // Cleanup template palette
        if (this.templatePalette) {
            this.templatePalette.cleanup();
            this.templatePalette = null;
        }
        
        // Cleanup skeleton controls
        if (this.skeletonControls) {
            this.skeletonControls.cleanup();
            this.skeletonControls = null;
        }
        
        // Cleanup constraint editor
        if (this.constraintEditor) {
            this.constraintEditor.cleanup();
            this.constraintEditor = null;
        }
        
        // Remove DOM elements
        if (this.ui.sidebar) {
            this.ui.sidebar.remove();
            this.ui.sidebar = null;
        }
        if (this.ui.toolbar) {
            this.ui.toolbar.remove();
            this.ui.toolbar = null;
        }
        if (this.ui.modal) {
            this.ui.modal.remove();
            this.ui.modal = null;
        }
        
        this.active = false;
        this.selectedChain = null;
        this.clearSelection();
    }
}