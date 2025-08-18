/**
 * Skeleton Editor for Madhuban Creature Editor
 * Core skeleton editing with simplified click-to-select interaction
 */

class SkeletonEditor {
    constructor(editorSystem, builder) {
        this.editorSystem = editorSystem;
        this.builder = builder;
        
        // Selection state
        this.selectedChain = null;
        this.selectedBone = null;
        this.selectionMode = 'chain'; // 'chain' or 'bone'
        
        // Visual highlighting
        this.highlighter = new SelectionHighlight();
        
        // IK test mode
        this.ikTestMode = false;
        this.ikTestPose = null;
        
        // Performance settings
        this.updateThrottle = 33; // 30fps target for expensive operations
        this.selectionThreshold = 15; // pixels
        this.lastUpdate = 0;
        this.lastIKUpdate = 0;
        
        // Interaction state
        this.dragging = false;
        this.dragStartPos = null;
        this.dragTarget = null;
        
        console.log('SkeletonEditor initialized');
    }
    
    /**
     * Handle mouse click for chain/bone selection
     * @param {number} mouseX - Mouse X coordinate
     * @param {number} mouseY - Mouse Y coordinate
     * @returns {boolean} - True if click was handled
     */
    handleMouseClick(mouseX, mouseY) {
        const startTime = performance.now();
        
        // Check if click is in canvas area (not on UI)
        if (mouseX < 250 || mouseY < 60) {
            return false;
        }
        
        let bestMatch = null;
        let bestDistance = Infinity;
        
        // Find closest chain/bone to click
        for (let chainIndex = 0; chainIndex < this.builder.chains.length; chainIndex++) {
            const chain = this.builder.chains[chainIndex];
            
            for (let boneIndex = 0; boneIndex < chain.bones.length; boneIndex++) {
                const bone = chain.bones(boneIndex);
                const start = bone.getStartLocation();
                const end = bone.getEndLocation();
                
                // Calculate distance from click to bone
                const distance = this.pointToLineDistance(
                    mouseX, mouseY,
                    start.x, start.y,
                    end.x, end.y
                );
                
                if (distance < this.selectionThreshold && distance < bestDistance) {
                    bestMatch = {
                        chainIndex: chainIndex,
                        boneIndex: boneIndex,
                        bone: bone,
                        distance: distance
                    };
                    bestDistance = distance;
                }
            }
        }
        
        // Update selection based on best match
        if (bestMatch) {
            this.selectElement(bestMatch.chainIndex, bestMatch.boneIndex);
            
            // Notify property panel of selection change
            if (this.editorSystem.propertyPanel) {
                if (this.selectionMode === 'bone') {
                    this.editorSystem.propertyPanel.updateContext('bone', {
                        chainIndex: bestMatch.chainIndex,
                        boneIndex: bestMatch.boneIndex,
                        bone: bestMatch.bone
                    });
                } else {
                    this.editorSystem.propertyPanel.updateContext('chain', {
                        chainIndex: bestMatch.chainIndex,
                        chain: this.builder.chains[bestMatch.chainIndex]
                    });
                }
            }
        } else {
            this.clearSelection();
            
            // Notify property panel of cleared selection
            if (this.editorSystem.propertyPanel) {
                this.editorSystem.propertyPanel.updateContext('none', {});
            }
        }
        
        // Performance monitoring
        const selectionTime = performance.now() - startTime;
        if (selectionTime > 50) {
            console.warn(`Skeleton selection took ${selectionTime.toFixed(1)}ms`);
        }
        
        return bestMatch !== null;
    }
    
    /**
     * Select a chain or bone element
     * @param {number} chainIndex - Index of the chain
     * @param {number} boneIndex - Index of the bone (optional)
     */
    selectElement(chainIndex, boneIndex = null) {
        // Determine selection mode based on modifier keys
        this.selectionMode = (keyIsDown(SHIFT) || boneIndex === null) ? 'chain' : 'bone';
        
        this.selectedChain = chainIndex;
        this.selectedBone = boneIndex;
        
        // Update visual highlighting
        if (this.selectionMode === 'bone' && boneIndex !== null) {
            this.highlighter.highlightBone(chainIndex, boneIndex);
            console.log(`Selected bone ${boneIndex} in chain ${chainIndex}`);
        } else {
            this.highlighter.highlightChain(chainIndex);
            this.selectedBone = null; // Clear bone selection when selecting chain
            console.log(`Selected chain ${chainIndex}`);
        }
    }
    
    /**
     * Clear current selection
     */
    clearSelection() {
        this.selectedChain = null;
        this.selectedBone = null;
        this.highlighter.clear();
        console.log('Selection cleared');
    }
    
    /**
     * Toggle IK test mode
     */
    toggleIKTestMode() {
        this.ikTestMode = !this.ikTestMode;
        
        if (this.ikTestMode) {
            console.log('🎯 IK Test Mode: ON - Click and drag to test poses');
            this.ikTestPose = this.saveCurrentPose();
        } else {
            console.log('🎯 IK Test Mode: OFF');
            if (this.ikTestPose) {
                this.restorePose(this.ikTestPose);
                this.ikTestPose = null;
            }
        }
    }
    
    /**
     * Handle mouse dragging for bone manipulation
     * @param {number} mouseX - Current mouse X
     * @param {number} mouseY - Current mouse Y
     * @returns {boolean} - True if drag was handled
     */
    handleMouseDrag(mouseX, mouseY) {
        if (!this.dragging || !this.dragTarget) {
            return false;
        }
        
        // Throttle drag updates for performance
        const now = performance.now();
        if (now - this.lastUpdate < this.updateThrottle) {
            return true;
        }
        this.lastUpdate = now;
        
        // Calculate drag delta
        const deltaX = mouseX - this.dragStartPos.x;
        const deltaY = mouseY - this.dragStartPos.y;
        
        // Apply drag based on target type
        if (this.dragTarget.type === 'bone_end') {
            this.dragBoneEnd(this.dragTarget.chainIndex, this.dragTarget.boneIndex, deltaX, deltaY);
        } else if (this.dragTarget.type === 'chain_tip') {
            this.dragChainTip(this.dragTarget.chainIndex, deltaX, deltaY);
        }
        
        return true;
    }
    
    /**
     * Start dragging interaction
     */
    startDrag(mouseX, mouseY) {
        if (this.selectedChain === null) return false;
        
        this.dragging = true;
        this.dragStartPos = { x: mouseX, y: mouseY };
        
        // Determine drag target based on selection
        if (this.selectedBone !== null) {
            this.dragTarget = {
                type: 'bone_end',
                chainIndex: this.selectedChain,
                boneIndex: this.selectedBone
            };
        } else {
            this.dragTarget = {
                type: 'chain_tip',
                chainIndex: this.selectedChain
            };
        }
        
        return true;
    }
    
    /**
     * Stop dragging interaction
     */
    stopDrag() {
        this.dragging = false;
        this.dragStartPos = null;
        this.dragTarget = null;
    }
    
    /**
     * Drag individual bone end
     */
    dragBoneEnd(chainIndex, boneIndex, deltaX, deltaY) {
        // This would modify bone length/angle based on drag
        // Implementation depends on FIK.js bone structure
        console.log(`Dragging bone ${boneIndex} in chain ${chainIndex}: ${deltaX}, ${deltaY}`);
    }
    
    /**
     * Drag chain tip (for IK solving)
     */
    dragChainTip(chainIndex, deltaX, deltaY) {
        if (chainIndex >= this.builder.chains.length) return;
        
        const chain = this.builder.chains[chainIndex];
        const currentTarget = this.builder.mouseTarget;
        
        // Update IK target based on drag
        this.builder.mouseTarget.x = currentTarget.x + deltaX;
        this.builder.mouseTarget.y = currentTarget.y + deltaY;
        
        // Solve IK if in test mode
        if (this.ikTestMode) {
            this.solveIKForChain(chainIndex);
        }
    }
    
    /**
     * Solve IK for specific chain
     */
    solveIKForChain(chainIndex) {
        // Throttle IK solving for performance
        const now = performance.now();
        if (now - this.lastIKUpdate < this.updateThrottle) {
            return;
        }
        this.lastIKUpdate = now;
        
        if (chainIndex >= this.builder.chains.length) return;
        
        const chain = this.builder.chains[chainIndex];
        try {
            chain.solveForTarget(this.builder.mouseTarget);
        } catch (error) {
            console.warn('IK solve failed:', error);
        }
    }
    
    /**
     * Save current pose for IK testing
     */
    saveCurrentPose() {
        const pose = {};
        this.builder.chains.forEach((chain, index) => {
            const chainPose = [];
            for (let i = 0; i < chain.bones.length(); i++) {
                const bone = chain.bones(i);
                const start = bone.getStartLocation();
                const end = bone.getEndLocation();
                chainPose.push({
                    start: { x: start.x, y: start.y },
                    end: { x: end.x, y: end.y }
                });
            }
            pose[index] = chainPose;
        });
        return pose;
    }
    
    /**
     * Restore saved pose
     */
    restorePose(pose) {
        // This would restore the saved pose
        // Implementation depends on FIK.js chain structure
        console.log('Restoring pose:', pose);
    }
    
    /**
     * Calculate point-to-line distance for selection
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
        param = Math.max(0, Math.min(1, param)); // Constrain to line segment
        
        const xx = x1 + param * C;
        const yy = y1 + param * D;
        
        return Math.sqrt((px - xx) * (px - xx) + (py - yy) * (py - yy));
    }
    
    /**
     * Update skeleton editor (called from main update loop)
     */
    update() {
        // Throttle expensive operations
        const now = performance.now();
        if (now - this.lastUpdate < this.updateThrottle) {
            return;
        }
        this.lastUpdate = now;
        
        // Update IK test mode if active
        if (this.ikTestMode && this.selectedChain !== null) {
            this.solveIKForChain(this.selectedChain);
        }
    }
    
    /**
     * Draw skeleton editor overlay
     */
    draw() {
        if (!this.builder.chains || this.builder.chains.length === 0) {
            return;
        }
        
        // Draw selection highlighting
        this.highlighter.draw(this.builder.chains);
        
        // Draw IK test mode indicators
        if (this.ikTestMode) {
            this.drawIKTestIndicators();
        }
        
        // Draw editing grid
        this.drawEditingGrid();
    }
    
    /**
     * Draw IK test mode visual indicators
     */
    drawIKTestIndicators() {
        push();
        
        // Draw IK target
        fill(255, 100, 100, 150);
        noStroke();
        circle(this.builder.mouseTarget.x, this.builder.mouseTarget.y, 12);
        
        // Draw target crosshairs
        stroke(255, 100, 100);
        strokeWeight(2);
        const size = 8;
        line(this.builder.mouseTarget.x - size, this.builder.mouseTarget.y, 
             this.builder.mouseTarget.x + size, this.builder.mouseTarget.y);
        line(this.builder.mouseTarget.x, this.builder.mouseTarget.y - size, 
             this.builder.mouseTarget.x, this.builder.mouseTarget.y + size);
        
        // Draw mode indicator
        fill(255, 100, 100);
        noStroke();
        textAlign(RIGHT, TOP);
        textSize(12);
        text('IK TEST MODE', width - 10, 70);
        
        pop();
    }
    
    /**
     * Draw editing grid for positioning
     */
    drawEditingGrid() {
        push();
        stroke(200, 200, 200, 50);
        strokeWeight(1);
        
        const gridSize = 20;
        const startX = 250; // After sidebar
        const startY = 60;  // After toolbar
        
        // Vertical lines
        for (let x = startX; x < width; x += gridSize) {
            line(x, startY, x, height);
        }
        
        // Horizontal lines
        for (let y = startY; y < height; y += gridSize) {
            line(startX, y, width, y);
        }
        
        pop();
    }
    
    /**
     * Get current selection info
     */
    getSelection() {
        return {
            mode: this.selectionMode,
            chainIndex: this.selectedChain,
            boneIndex: this.selectedBone,
            ikTestMode: this.ikTestMode
        };
    }
    
    /**
     * Set selection programmatically
     */
    setSelection(chainIndex, boneIndex = null) {
        this.selectElement(chainIndex, boneIndex);
    }
    
    /**
     * Get chain/bone count for validation
     */
    getChainCount() {
        return this.builder.chains ? this.builder.chains.length : 0;
    }
    
    getBoneCount(chainIndex) {
        if (!this.builder.chains || chainIndex >= this.builder.chains.length) {
            return 0;
        }
        return this.builder.chains[chainIndex].bones.length;
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        this.clearSelection();
        this.highlighter = null;
        this.ikTestPose = null;
        this.dragTarget = null;
        console.log('SkeletonEditor destroyed');
    }
}