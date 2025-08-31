class BoneManipulator {
    constructor(builder) {
        this.builder = builder;
        this.lastUpdate = 0;
        this.selectedBone = null;
        
        // Performance settings
        this.updateThrottle = 33; // 30fps target
        this.selectionThreshold = 15; // pixels
        
        console.log('BoneManipulator initialized');
    }
    
    // Individual bone selection using point-to-line distance
    selectBone(mouseX, mouseY) {
        const startTime = performance.now();
        
        for (let chainIndex = 0; chainIndex < this.builder.chains.length; chainIndex++) {
            const chain = this.builder.chains[chainIndex];
            
            for (let boneIndex = 0; boneIndex < chain.numBones; boneIndex++) {
                const bone = chain.bones[boneIndex];
                const start = bone.start;
                const end = bone.end;
                
                // Use point-to-line distance for accurate selection
                const distance = this.pointToLineDistance(
                    mouseX, mouseY,
                    start.x, start.y,
                    end.x, end.y
                );
                
                if (distance < this.selectionThreshold) {
                    const result = {
                        chainIndex: chainIndex,
                        boneIndex: boneIndex,
                        bone: bone,
                        distance: distance
                    };
                    
                    this.selectedBone = result;
                    
                    // Performance monitoring
                    const selectionTime = performance.now() - startTime;
                    if (selectionTime > 50) {
                        console.warn(`Bone selection took ${selectionTime.toFixed(1)}ms`);
                    }
                    
                    console.log(`Selected bone ${boneIndex} in chain ${chainIndex}`);
                    return result;
                }
            }
        }
        
        this.selectedBone = null;
        return null;
    }
    
    // Point-to-line distance calculation (same as EditorMode but localized)
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
    
    // Draw bone highlighting with distinct visual from chain highlighting
    drawBoneHighlight(selectedBone) {
        if (!selectedBone || !selectedBone.bone) return;
        
        const bone = selectedBone.bone;
        const start = bone.start;
        const end = bone.end;
        
        push();
        // Distinct blue highlight for individual bones (vs yellow for chains)
        stroke(100, 150, 255);
        strokeWeight(6);
        noFill();
        
        // Draw highlighted bone
        line(start.x, start.y, end.x, end.y);
        
        // Draw bone endpoints as circles
        fill(100, 150, 255, 150);
        noStroke();
        circle(start.x, start.y, 8);
        circle(end.x, end.y, 8);
        
        // Draw bone index label
        fill(255);
        stroke(0);
        strokeWeight(1);
        textAlign(CENTER);
        textSize(12);
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        text(`B${selectedBone.boneIndex}`, midX, midY - 10);
        
        pop();
    }
    
    // Handle bone dragging for real-time manipulation
    handleBoneDrag(selectedBone, mouseX, mouseY, manipulationType) {
        if (!selectedBone || !selectedBone.bone) return false;
        
        // Throttle updates for performance
        const now = performance.now();
        if (now - this.lastUpdate < this.updateThrottle) return false;
        
        const bone = selectedBone.bone;
        const chain = this.builder.chains[selectedBone.chainIndex];
        
        try {
            switch (manipulationType) {
                case 'move':
                    return this.handleBoneMove(selectedBone, mouseX, mouseY);
                    
                case 'rotate':
                    return this.handleBoneRotate(selectedBone, mouseX, mouseY);
                    
                case 'scale':
                    return this.handleBoneScale(selectedBone, mouseX, mouseY);
                    
                case 'select':
                default:
                    // Default to end-effector manipulation for intuitive editing
                    return this.handleEndEffectorMove(selectedBone, mouseX, mouseY);
            }
        } catch (error) {
            console.error('Bone manipulation error:', error);
            return false;
        } finally {
            this.lastUpdate = now;
        }
    }
    
    // Move bone endpoint (most intuitive manipulation)
    handleEndEffectorMove(selectedBone, mouseX, mouseY) {
        const bone = selectedBone.bone;
        const newEndPos = new FIK.V2(mouseX, mouseY);
        
        // Calculate new length and validate
        const start = bone.start;
        const newLength = start.distanceTo(newEndPos);
        
        if (!this.validateBoneManipulation(selectedBone, newLength, 0)) {
            return false;
        }
        
        // Update bone endpoint
        bone.setEndLocation(newEndPos);
        
        // Solve chain if this affects other bones
        const chain = this.builder.chains[selectedBone.chainIndex];
        if (selectedBone.boneIndex === chain.numBones - 1) {
            // This is the end effector - solve IK for the chain
            this.solveChainWithOptimization(chain, newEndPos);
        }
        
        console.log(`Moved bone ${selectedBone.boneIndex} endpoint to (${mouseX.toFixed(1)}, ${mouseY.toFixed(1)})`);
        return true;
    }
    
    // Rotate bone around its start point
    handleBoneRotate(selectedBone, mouseX, mouseY) {
        const bone = selectedBone.bone;
        const start = bone.start;
        const length = bone.getLength();
        
        // Calculate new angle from start point to mouse
        const dx = mouseX - start.x;
        const dy = mouseY - start.y;
        const newAngle = Math.atan2(dy, dx);
        const newAngleDeg = newAngle * 180 / Math.PI;
        
        if (!this.validateBoneManipulation(selectedBone, length, newAngleDeg)) {
            return false;
        }
        
        // Calculate new end position
        const newEndX = start.x + Math.cos(newAngle) * length;
        const newEndY = start.y + Math.sin(newAngle) * length;
        
        bone.setEndLocation(new FIK.V2(newEndX, newEndY));
        
        console.log(`Rotated bone ${selectedBone.boneIndex} to ${newAngleDeg.toFixed(1)}°`);
        return true;
    }
    
    // Scale bone length
    handleBoneScale(selectedBone, mouseX, mouseY) {
        const bone = selectedBone.bone;
        const start = bone.start;
        const currentEnd = bone.end;
        
        // Calculate new length based on mouse distance from start
        const newLength = start.distanceTo(new FIK.V2(mouseX, mouseY));
        
        if (!this.validateBoneManipulation(selectedBone, newLength, 0)) {
            return false;
        }
        
        // Maintain current direction but change length
        const direction = currentEnd.minus(start).normalised();
        const newEndPos = start.plus(direction.multiplyBy(newLength));
        
        bone.setEndLocation(newEndPos);
        
        console.log(`Scaled bone ${selectedBone.boneIndex} to length ${newLength.toFixed(1)}px`);
        return true;
    }
    
    // Move entire bone (both start and end)
    handleBoneMove(selectedBone, mouseX, mouseY) {
        const bone = selectedBone.bone;
        const start = bone.start;
        const end = bone.end;
        
        // Calculate offset from current position to mouse
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const offsetX = mouseX - midX;
        const offsetY = mouseY - midY;
        
        // Apply offset to both start and end points
        const newStart = new FIK.V2(start.x + offsetX, start.y + offsetY);
        const newEnd = new FIK.V2(end.x + offsetX, end.y + offsetY);
        
        // Note: Moving individual bones requires careful chain management
        // For now, only move the end point to maintain chain integrity
        bone.setEndLocation(newEnd);
        
        console.log(`Moved bone ${selectedBone.boneIndex} by offset (${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);
        return true;
    }
    
    // Optimized IK solving for real-time manipulation
    solveChainWithOptimization(chain, target) {
        // Apply performance optimizations for real-time editing
        const originalAttempts = chain.maxIterationAttempts || 15;
        const originalThreshold = chain.solveDistanceThreshold || 1.0;
        const originalMinChange = chain.minIterationChange || 0.01;
        
        // Temporarily reduce precision for speed
        if (chain.setMaxIterationAttempts) {
            chain.setMaxIterationAttempts(6);
        }
        if (chain.setSolveDistanceThreshold) {
            chain.setSolveDistanceThreshold(2.5);
        }
        if (chain.setMinIterationChange) {
            chain.setMinIterationChange(0.08);
        }
        
        try {
            chain.solveForTarget(target);
        } catch (error) {
            console.warn('IK solve failed during bone manipulation:', error);
        }
        
        // Restore original settings
        if (chain.setMaxIterationAttempts) {
            chain.setMaxIterationAttempts(originalAttempts);
        }
        if (chain.setSolveDistanceThreshold) {
            chain.setSolveDistanceThreshold(originalThreshold);
        }
        if (chain.setMinIterationChange) {
            chain.setMinIterationChange(originalMinChange);
        }
    }
    
    // Add/remove bones from chains
    addBoneToChain(chainIndex, insertIndex = -1) {
        if (chainIndex >= this.builder.chains.length) return false;
        
        const chain = this.builder.chains[chainIndex];
        const config = this.builder.chainConfigs[chainIndex];
        
        try {
            if (insertIndex === -1 || insertIndex >= chain.numBones) {
                // Add to end of chain
                const lastBone = chain.bones[chain.numBones - 1];
                const direction = lastBone.getDirectionUV();
                const newLength = lastBone.getLength();
                
                chain.addConsecutiveBone(direction, newLength, 45, 45);
                console.log(`Added bone to end of chain ${chainIndex}`);
            } else {
                // Insert at specific position - requires chain reconstruction
                console.warn('Bone insertion at specific index not yet implemented');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error adding bone to chain:', error);
            return false;
        }
    }
    
    removeBoneFromChain(chainIndex, boneIndex) {
        if (chainIndex >= this.builder.chains.length) return false;
        
        const chain = this.builder.chains[chainIndex];
        
        if (chain.numBones <= 1) {
            console.warn('Cannot remove last bone from chain');
            return false;
        }
        
        if (boneIndex >= chain.numBones) {
            console.warn('Invalid bone index for removal');
            return false;
        }
        
        try {
            // FIK.js doesn't have direct bone removal - would need chain reconstruction
            // For now, log the intention
            console.warn('Bone removal requires chain reconstruction - not yet implemented');
            return false;
        } catch (error) {
            console.error('Error removing bone from chain:', error);
            return false;
        }
    }
    
    // Get bone properties for UI display
    getBoneProperties(selectedBone) {
        if (!selectedBone || !selectedBone.bone) return null;
        
        const bone = selectedBone.bone;
        const start = bone.start;
        const end = bone.end;
        
        // Calculate bone angle
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        return {
            length: bone.getLength().toFixed(1),
            angle: angle.toFixed(1),
            startX: start.x.toFixed(1),
            startY: start.y.toFixed(1),
            endX: end.x.toFixed(1),
            endY: end.y.toFixed(1),
            constraints: {
                clockwise: bone.joint ? bone.joint.clockwiseConstraintDegs || 0 : 0,
                anticlockwise: bone.joint ? bone.joint.anticlockwiseConstraintDegs || 0 : 0
            }
        };
    }
    
    // Validate bone manipulation (prevent invalid states)
    validateBoneManipulation(selectedBone, newLength, newAngle) {
        if (!selectedBone || !selectedBone.bone) return false;
        
        // Check minimum length constraint
        if (newLength < 5) {
            console.warn('Bone length too small (minimum: 5px)');
            return false;
        }
        
        // Check maximum length constraint  
        if (newLength > 300) {
            console.warn('Bone length too large (maximum: 300px)');
            return false;
        }
        
        // Check angle constraints if joint exists
        const bone = selectedBone.bone;
        if (bone.joint) {
            const clockwiseLimit = bone.joint.clockwiseConstraintDegs || 180;
            const anticlockwiseLimit = bone.joint.anticlockwiseConstraintDegs || 180;
            
            if (newAngle > clockwiseLimit || newAngle < -anticlockwiseLimit) {
                console.warn(`Angle ${newAngle.toFixed(1)}° violates joint constraints`);
                return false;
            }
        }
        
        return true;
    }
    
    // Clear selection
    clearSelection() {
        this.selectedBone = null;
    }
    
    // Check if bone manipulator is ready
    isReady() {
        return this.builder && this.builder.chains && this.builder.chains.length > 0;
    }
}