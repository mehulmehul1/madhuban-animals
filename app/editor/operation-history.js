/**
 * OperationHistory - Comprehensive undo/redo system for skeleton editing
 * 
 * Tracks all skeleton modifications and provides reliable state restoration
 * with memory management and performance optimization.
 */

class OperationHistory {
    constructor(builder, editor) {
        this.builder = builder;
        this.editor = editor;
        
        // History management
        this.operations = [];
        this.currentIndex = -1;
        this.maxHistorySize = 50;
        
        // Performance optimization
        this.batchingEnabled = false;
        this.batchedOperations = [];
        this.compressionThreshold = 10;
        
        // State management
        this.lastSaveIndex = -1;
        this.memoryUsage = 0;
        this.maxMemoryMB = 50; // 50MB limit for operation history
        
        console.log('🔄 OperationHistory initialized with max', this.maxHistorySize, 'operations');
    }
    
    /**
     * Record a new operation in the history
     * @param {string} type - Operation type (move, rotate, scale, add, delete, etc.)
     * @param {Object} data - Operation-specific data
     * @param {Object} beforeState - State before the operation
     * @param {Object} afterState - State after the operation
     */
    recordOperation(type, data, beforeState, afterState) {
        try {
            // Create operation record
            const operation = {
                id: this.generateOperationId(),
                type: type,
                timestamp: Date.now(),
                data: data,
                beforeState: this.compressState(beforeState),
                afterState: this.compressState(afterState),
                memorySize: this.calculateStateSize(beforeState) + this.calculateStateSize(afterState)
            };
            
            // Handle batching if enabled
            if (this.batchingEnabled) {
                this.batchedOperations.push(operation);
                return operation.id;
            }
            
            // Clear any operations after current index (when user made changes after undo)
            if (this.currentIndex < this.operations.length - 1) {
                this.operations.splice(this.currentIndex + 1);
            }
            
            // Add new operation
            this.operations.push(operation);
            this.currentIndex++;
            
            // Update memory usage
            this.memoryUsage += operation.memorySize;
            
            // Manage history size and memory
            this.manageHistorySize();
            
            console.log(`📝 Recorded ${type} operation:`, operation.id);
            return operation.id;
            
        } catch (error) {
            console.error('❌ Failed to record operation:', error);
            return null;
        }
    }
    
    /**
     * Undo the last operation
     */
    undo() {
        if (!this.canUndo()) {
            console.warn('⚠️ Cannot undo: no operations in history');
            return false;
        }
        
        try {
            const operation = this.operations[this.currentIndex];
            
            console.log(`↩️ Undoing ${operation.type} operation:`, operation.id);
            
            // Restore previous state
            this.restoreState(operation.beforeState);
            
            // Move index backwards
            this.currentIndex--;
            
            // Update UI
            this.updateUndoRedoUI();
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to undo operation:', error);
            return false;
        }
    }
    
    /**
     * Redo the next operation
     */
    redo() {
        if (!this.canRedo()) {
            console.warn('⚠️ Cannot redo: no forward operations available');
            return false;
        }
        
        try {
            // Move index forward first
            this.currentIndex++;
            const operation = this.operations[this.currentIndex];
            
            console.log(`↪️ Redoing ${operation.type} operation:`, operation.id);
            
            // Restore next state
            this.restoreState(operation.afterState);
            
            // Update UI
            this.updateUndoRedoUI();
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to redo operation:', error);
            this.currentIndex--; // Restore index on failure
            return false;
        }
    }
    
    /**
     * Check if undo is possible
     */
    canUndo() {
        return this.currentIndex >= 0;
    }
    
    /**
     * Check if redo is possible
     */
    canRedo() {
        return this.currentIndex < this.operations.length - 1;
    }
    
    /**
     * Start batching operations for compound actions
     */
    startBatch(batchName = 'Compound Operation') {
        this.batchingEnabled = true;
        this.batchedOperations = [];
        this.currentBatchName = batchName;
        console.log(`🔄 Started operation batch: ${batchName}`);
    }
    
    /**
     * End batching and record as single compound operation
     */
    endBatch() {
        if (!this.batchingEnabled || this.batchedOperations.length === 0) {
            this.batchingEnabled = false;
            return null;
        }
        
        try {
            // Create compound operation
            const compoundOperation = {
                id: this.generateOperationId(),
                type: 'compound',
                name: this.currentBatchName,
                timestamp: Date.now(),
                operations: [...this.batchedOperations],
                beforeState: this.batchedOperations[0].beforeState,
                afterState: this.batchedOperations[this.batchedOperations.length - 1].afterState,
                memorySize: this.batchedOperations.reduce((sum, op) => sum + op.memorySize, 0)
            };
            
            // Add to history
            if (this.currentIndex < this.operations.length - 1) {
                this.operations.splice(this.currentIndex + 1);
            }
            
            this.operations.push(compoundOperation);
            this.currentIndex++;
            this.memoryUsage += compoundOperation.memorySize;
            
            // Cleanup
            this.batchingEnabled = false;
            this.batchedOperations = [];
            this.currentBatchName = null;
            
            this.manageHistorySize();
            
            console.log(`📦 Recorded compound operation: ${compoundOperation.name}`, compoundOperation.id);
            return compoundOperation.id;
            
        } catch (error) {
            console.error('❌ Failed to create compound operation:', error);
            this.batchingEnabled = false;
            this.batchedOperations = [];
            return null;
        }
    }
    
    /**
     * Capture current state of the builder for restoration
     */
    captureState() {
        try {
            const state = {
                chains: [],
                chainConfigs: [...this.builder.chainConfigs],
                creatureType: this.builder.creatureType,
                bodyPosition: {
                    x: this.builder.bodyPosition.x,
                    y: this.builder.bodyPosition.y
                },
                renderMode: this.builder.renderMode
            };
            
            // Capture chain states with bone positions
            this.builder.chains.forEach((chain, index) => {
                const chainState = {
                    bones: [],
                    baseMode: chain.getFixedBaseMode ? chain.getFixedBaseMode() : 'fixed'
                };
                
                for (let i = 0; i < chain.numBones; i++) {
                    const bone = chain.bones[i];
                    chainState.bones.push({
                        startX: bone.start.x,
                        startY: bone.start.y,
                        endX: bone.end.x,
                        endY: bone.end.y,
                        length: bone.getLength(),
                        constraints: bone.joint ? {
                            clockwise: bone.joint.clockwiseConstraintDegs,
                            anticlockwise: bone.joint.anticlockwiseConstraintDegs
                        } : null
                    });
                }
                
                state.chains.push(chainState);
            });
            
            return state;
            
        } catch (error) {
            console.error('❌ Failed to capture state:', error);
            return null;
        }
    }
    
    /**
     * Restore builder state from captured data
     */
    restoreState(state) {
        if (!state) {
            console.error('❌ Cannot restore: invalid state data');
            return false;
        }
        
        try {
            // Restore basic properties
            this.builder.creatureType = state.creatureType;
            this.builder.renderMode = state.renderMode;
            this.builder.bodyPosition.set(state.bodyPosition.x, state.bodyPosition.y);
            
            // Clear current chains
            this.builder.chains = [];
            this.builder.chainConfigs = [...state.chainConfigs];
            
            // Restore chains
            state.chains.forEach((chainState, index) => {
                if (index < state.chainConfigs.length) {
                    const config = state.chainConfigs[index];
                    
                    // Recreate chain using builder
                    const newChain = this.builder.createChainFromConfig({
                        role: config.role,
                        type: config.type,
                        bones: chainState.bones.map(bone => ({
                            length: bone.length,
                            constraints: bone.constraints
                        })),
                        attachment: config.attachment,
                        parentChainIndex: config.parentChainIndex,
                        attachmentIndex: config.attachmentIndex
                    });
                    
                    // Restore bone positions
                    if (newChain && chainState.bones.length > 0) {
                        chainState.bones.forEach((boneState, boneIndex) => {
                            if (boneIndex < newChain.numBones) {
                                const bone = newChain.bones[boneIndex];
                                bone.start.set(boneState.startX, boneState.startY);
                                bone.end.set(boneState.endX, boneState.endY);
                            }
                        });
                    }
                }
            });
            
            // Clear editor selection
            this.editor.clearSelection();
            this.editor.updateSidebar();
            
            console.log('✅ State restored successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to restore state:', error);
            return false;
        }
    }
    
    /**
     * Compress state data to reduce memory usage
     */
    compressState(state) {
        if (!state) return null;
        
        // For now, just return the state as-is
        // Future enhancement: implement JSON compression
        return state;
    }
    
    /**
     * Calculate approximate memory size of state data
     */
    calculateStateSize(state) {
        if (!state) return 0;
        
        try {
            return JSON.stringify(state).length * 2; // Rough estimate in bytes
        } catch (error) {
            return 1000; // Default estimate
        }
    }
    
    /**
     * Manage history size to prevent memory overflow
     */
    manageHistorySize() {
        // Remove oldest operations if exceeding limits
        while (this.operations.length > this.maxHistorySize || 
               this.memoryUsage > this.maxMemoryMB * 1024 * 1024) {
            
            if (this.operations.length === 0) break;
            
            const removedOp = this.operations.shift();
            this.memoryUsage -= removedOp.memorySize;
            this.currentIndex--;
            
            if (this.lastSaveIndex >= 0) {
                this.lastSaveIndex--;
            }
        }
    }
    
    /**
     * Generate unique operation ID
     */
    generateOperationId() {
        return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Update undo/redo UI controls
     */
    updateUndoRedoUI() {
        // This will be called to update UI button states
        // Implementation depends on how UI is structured
        if (this.editor && this.editor.sidebarUI) {
            this.editor.sidebarUI.updateAll();
        }
    }
    
    /**
     * Clear all history
     */
    clearHistory() {
        this.operations = [];
        this.currentIndex = -1;
        this.memoryUsage = 0;
        this.lastSaveIndex = -1;
        
        console.log('🗑️ Operation history cleared');
    }
    
    /**
     * Get history status for debugging
     */
    getStatus() {
        return {
            operationCount: this.operations.length,
            currentIndex: this.currentIndex,
            memoryUsageMB: (this.memoryUsage / (1024 * 1024)).toFixed(2),
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            batchingEnabled: this.batchingEnabled
        };
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        this.clearHistory();
        this.builder = null;
        this.editor = null;
        
        console.log('🧹 OperationHistory cleaned up');
    }
}