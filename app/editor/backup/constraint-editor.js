/**
 * Joint Constraint Editor for Skeleton Editing (PRP2 Task 6)
 * 
 * Provides visual constraint arc rendering, real-time constraint editing,
 * and anatomical validation for joint constraints in skeleton editing.
 */

class ConstraintEditor {
    constructor(builder, editorMode) {
        this.builder = builder;
        this.editor = editorMode;
        
        // Visual constraint settings
        this.constraintVisualization = {
            arcRadius: 25,
            arcStrokeWeight: 2,
            validColor: [100, 255, 100],      // Green for valid
            warningColor: [255, 200, 100],    // Orange for warning
            violationColor: [255, 100, 100],  // Red for violation
            constraintArcColor: [150, 150, 255, 150] // Blue for constraint arcs
        };
        
        // Constraint validation thresholds
        this.validationThresholds = {
            anatomicalWarning: 0.8,  // Warn when approaching anatomical limits
            anatomicalMax: 1.0       // Maximum anatomical constraint factor
        };
        
        // Active constraint editing state
        this.activeConstraintEdit = null;
        this.constraintDragState = null;
        
        this.initializeConstraintEditor();
        console.log('Joint Constraint Editor initialized with anatomical validation');
    }
    
    initializeConstraintEditor() {
        // Initialize integration with existing constraint system
        if (this.builder.constraintSystem) {
            console.log('✅ Integrated with existing ConstraintSystem');
        } else {
            console.warn('⚠️ ConstraintSystem not available - using basic constraints');
        }
        
        // Initialize integration with anatomical data
        if (this.builder.anatomicalData || (this.builder.systems && this.builder.systems.anatomicalData)) {
            console.log('✅ Integrated with AnatomicalData system');
        } else {
            console.warn('⚠️ AnatomicalData not available - using generic constraints');
        }
    }
    
    // Draw constraint visualization for selected joint
    drawJointConstraints(selectedBone) {
        if (!selectedBone || !selectedBone.bone || !selectedBone.bone.joint) {
            return;
        }
        
        const bone = selectedBone.bone;
        const joint = bone.joint;
        const start = bone.start;
        
        // Draw constraint arcs
        this.drawConstraintArcs(start, joint, selectedBone);
        
        // Draw current bone angle indicator
        this.drawCurrentAngleIndicator(selectedBone);
        
        // Draw constraint violation warnings if any
        this.drawConstraintViolations(selectedBone);
    }
    
    // Draw constraint arcs showing joint limits
    drawConstraintArcs(position, joint, selectedBone) {
        if (!joint) return;
        
        const clockwiseLimit = joint.clockwiseConstraintDegs || 45;
        const anticlockwiseLimit = joint.anticlockwiseConstraintDegs || 45;
        
        push();
        
        // Set up arc drawing
        translate(position.x, position.y);
        noFill();
        strokeWeight(this.constraintVisualization.arcStrokeWeight);
        
        // Draw constraint arc background (full range)
        stroke(...this.constraintVisualization.constraintArcColor);
        const fullRangeStart = -anticlockwiseLimit * Math.PI / 180;
        const fullRangeEnd = clockwiseLimit * Math.PI / 180;
        arc(0, 0, this.constraintVisualization.arcRadius * 2, this.constraintVisualization.arcRadius * 2, 
            fullRangeStart, fullRangeEnd);
        
        // Draw constraint limit indicators
        this.drawConstraintLimitIndicators(clockwiseLimit, anticlockwiseLimit);
        
        // Draw anatomical validation if available
        this.drawAnatomicalValidation(selectedBone, clockwiseLimit, anticlockwiseLimit);
        
        pop();
    }
    
    // Draw current bone angle indicator
    drawCurrentAngleIndicator(selectedBone) {
        const bone = selectedBone.bone;
        const start = bone.start;
        const end = bone.end;
        
        // Calculate current angle
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const currentAngle = Math.atan2(dy, dx);
        
        push();
        translate(start.x, start.y);
        
        // Draw current angle line
        stroke(255, 255, 255);
        strokeWeight(3);
        const indicatorLength = this.constraintVisualization.arcRadius * 1.2;
        line(0, 0, 
             Math.cos(currentAngle) * indicatorLength, 
             Math.sin(currentAngle) * indicatorLength);
        
        // Draw angle value text
        fill(255);
        stroke(0);
        strokeWeight(1);
        textAlign(CENTER);
        textSize(10);
        const angleDeg = currentAngle * 180 / Math.PI;
        text(`${angleDeg.toFixed(1)}°`, 
             Math.cos(currentAngle) * (indicatorLength + 15), 
             Math.sin(currentAngle) * (indicatorLength + 15));
        
        pop();
    }
    
    // Draw constraint limit indicators (lines at constraint boundaries)
    drawConstraintLimitIndicators(clockwiseLimit, anticlockwiseLimit) {
        const radius = this.constraintVisualization.arcRadius;
        
        // Clockwise limit
        stroke(255, 100, 100); // Red
        strokeWeight(2);
        const clockwiseAngle = clockwiseLimit * Math.PI / 180;
        line(0, 0, 
             Math.cos(clockwiseAngle) * radius, 
             Math.sin(clockwiseAngle) * radius);
        
        // Anticlockwise limit
        const anticlockwiseAngle = -anticlockwiseLimit * Math.PI / 180;
        line(0, 0, 
             Math.cos(anticlockwiseAngle) * radius, 
             Math.sin(anticlockwiseAngle) * radius);
        
        // Draw limit labels
        fill(255, 100, 100);
        stroke(0);
        strokeWeight(1);
        textAlign(CENTER);
        textSize(8);
        
        // Clockwise label
        text(`+${clockwiseLimit}°`, 
             Math.cos(clockwiseAngle) * (radius + 20), 
             Math.sin(clockwiseAngle) * (radius + 20));
        
        // Anticlockwise label
        text(`-${anticlockwiseLimit}°`, 
             Math.cos(anticlockwiseAngle) * (radius + 20), 
             Math.sin(anticlockwiseAngle) * (radius + 20));
    }
    
    // Draw anatomical validation indicators
    drawAnatomicalValidation(selectedBone, clockwiseLimit, anticlockwiseLimit) {
        if (!this.builder.constraintSystem) return;
        
        try {
            // Get anatomical constraints for this bone/joint type
            const anatomicalConstraints = this.getAnatomicalConstraints(selectedBone);
            
            if (anatomicalConstraints) {
                const maxClockwise = anatomicalConstraints.maxClockwise || 180;
                const maxAnticlockwise = anatomicalConstraints.maxAnticlockwise || 180;
                
                // Check if current constraints exceed anatomical limits
                const clockwiseViolation = clockwiseLimit > maxClockwise;
                const anticlockwiseViolation = anticlockwiseLimit > maxAnticlockwise;
                
                if (clockwiseViolation || anticlockwiseViolation) {
                    this.drawAnatomicalViolationWarning(clockwiseViolation, anticlockwiseViolation);
                }
                
                // Draw anatomical limit references
                this.drawAnatomicalLimitReferences(maxClockwise, maxAnticlockwise);
            }
            
        } catch (error) {
            console.warn('Could not validate anatomical constraints:', error);
        }
    }
    
    // Get anatomical constraints for selected bone
    getAnatomicalConstraints(selectedBone) {
        if (!this.builder.constraintSystem || !this.builder.constraintSystem.getAnatomicalConstraints) {
            return null;
        }
        
        try {
            const chainConfig = this.builder.chainConfigs[selectedBone.chainIndex];
            const boneRole = this.determineBoneRole(selectedBone, chainConfig);
            
            return this.builder.constraintSystem.getAnatomicalConstraints(
                this.builder.creatureType,
                chainConfig.type,
                boneRole
            );
            
        } catch (error) {
            console.warn('Failed to get anatomical constraints:', error);
            return null;
        }
    }
    
    // Determine bone role within chain for anatomical lookup
    determineBoneRole(selectedBone, chainConfig) {
        const totalBones = this.builder.chains[selectedBone.chainIndex].numBones;
        const boneIndex = selectedBone.boneIndex;
        
        // Simple role determination based on position in chain
        if (boneIndex === 0) return 'proximal';
        if (boneIndex === totalBones - 1) return 'distal';
        return 'middle';
    }
    
    // Draw anatomical violation warning
    drawAnatomicalViolationWarning(clockwiseViolation, anticlockwiseViolation) {
        const radius = this.constraintVisualization.arcRadius;
        
        // Draw warning background
        fill(255, 0, 0, 50);
        noStroke();
        circle(0, 0, radius * 3);
        
        // Draw warning text
        fill(255, 0, 0);
        stroke(255);
        strokeWeight(1);
        textAlign(CENTER);
        textSize(10);
        textStyle(BOLD);
        text('⚠️ ANATOMICAL\nLIMIT EXCEEDED', 0, -radius * 1.8);
    }
    
    // Draw anatomical limit references
    drawAnatomicalLimitReferences(maxClockwise, maxAnticlockwise) {
        const radius = this.constraintVisualization.arcRadius * 0.8;
        
        stroke(100, 100, 100, 150);
        strokeWeight(1);
        setLineDash([2, 2]);
        
        // Anatomical clockwise limit
        const anatomicalClockwiseAngle = maxClockwise * Math.PI / 180;
        line(0, 0, 
             Math.cos(anatomicalClockwiseAngle) * radius, 
             Math.sin(anatomicalClockwiseAngle) * radius);
        
        // Anatomical anticlockwise limit
        const anatomicalAnticlockwiseAngle = -maxAnticlockwise * Math.PI / 180;
        line(0, 0, 
             Math.cos(anatomicalAnticlockwiseAngle) * radius, 
             Math.sin(anatomicalAnticlockwiseAngle) * radius);
        
        setLineDash([]); // Reset line dash
    }
    
    // Check if current bone angle violates constraints
    validateCurrentConstraints(selectedBone) {
        if (!selectedBone || !selectedBone.bone || !selectedBone.bone.joint) {
            return { valid: true, violations: [] };
        }
        
        const bone = selectedBone.bone;
        const joint = bone.joint;
        const start = bone.start;
        const end = bone.end;
        
        // Calculate current angle
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const currentAngle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Check against joint constraints
        const clockwiseLimit = joint.clockwiseConstraintDegs || 45;
        const anticlockwiseLimit = joint.anticlockwiseConstraintDegs || 45;
        
        const violations = [];
        
        if (currentAngle > clockwiseLimit) {
            violations.push({
                type: 'clockwise',
                current: currentAngle,
                limit: clockwiseLimit,
                severity: 'constraint'
            });
        }
        
        if (currentAngle < -anticlockwiseLimit) {
            violations.push({
                type: 'anticlockwise',
                current: currentAngle,
                limit: -anticlockwiseLimit,
                severity: 'constraint'
            });
        }
        
        // Check against anatomical constraints if available
        const anatomicalConstraints = this.getAnatomicalConstraints(selectedBone);
        if (anatomicalConstraints) {
            const maxClockwise = anatomicalConstraints.maxClockwise || 180;
            const maxAnticlockwise = anatomicalConstraints.maxAnticlockwise || 180;
            
            if (currentAngle > maxClockwise) {
                violations.push({
                    type: 'anatomical-clockwise',
                    current: currentAngle,
                    limit: maxClockwise,
                    severity: 'anatomical'
                });
            }
            
            if (currentAngle < -maxAnticlockwise) {
                violations.push({
                    type: 'anatomical-anticlockwise',
                    current: currentAngle,
                    limit: -maxAnticlockwise,
                    severity: 'anatomical'
                });
            }
        }
        
        return {
            valid: violations.length === 0,
            violations: violations,
            currentAngle: currentAngle
        };
    }
    
    // Draw constraint violations as visual feedback
    drawConstraintViolations(selectedBone) {
        const validation = this.validateCurrentConstraints(selectedBone);
        
        if (!validation.valid) {
            const bone = selectedBone.bone;
            const start = bone.start;
            
            push();
            translate(start.x, start.y);
            
            // Draw violation indicators
            validation.violations.forEach((violation, index) => {
                const color = violation.severity === 'anatomical' 
                    ? this.constraintVisualization.violationColor 
                    : this.constraintVisualization.warningColor;
                
                stroke(...color);
                fill(...color, 100);
                strokeWeight(2);
                
                // Draw violation arc or indicator
                const offset = index * 15;
                circle(0, -40 - offset, 8);
                
                // Draw violation text
                fill(...color);
                stroke(255);
                strokeWeight(1);
                textAlign(CENTER);
                textSize(8);
                text(violation.type.replace('-', ' '), 0, -35 - offset);
            });
            
            pop();
        }
    }
    
    // Interactive constraint editing
    startConstraintEdit(selectedBone, constraintType, mouseX, mouseY) {
        if (!selectedBone || !selectedBone.bone || !selectedBone.bone.joint) {
            return false;
        }
        
        this.activeConstraintEdit = {
            bone: selectedBone,
            type: constraintType, // 'clockwise' or 'anticlockwise'
            startAngle: this.calculateAngleFromPosition(selectedBone.bone.getStartLocation(), mouseX, mouseY),
            startValue: constraintType === 'clockwise' 
                ? selectedBone.bone.joint.clockwiseConstraintDegs
                : selectedBone.bone.joint.anticlockwiseConstraintDegs
        };
        
        console.log(`Started constraint editing: ${constraintType}`);
        return true;
    }
    
    // Update constraint during drag
    updateConstraintEdit(mouseX, mouseY) {
        if (!this.activeConstraintEdit) return false;
        
        const bone = this.activeConstraintEdit.bone.bone;
        const start = bone.start;
        const currentAngle = this.calculateAngleFromPosition(start, mouseX, mouseY);
        const angleDelta = currentAngle - this.activeConstraintEdit.startAngle;
        
        // Calculate new constraint value
        let newValue = this.activeConstraintEdit.startValue + angleDelta * 180 / Math.PI;
        newValue = Math.max(0, Math.min(180, newValue)); // Clamp to reasonable range
        
        // Apply constraint
        if (this.activeConstraintEdit.type === 'clockwise') {
            bone.joint.clockwiseConstraintDegs = newValue;
        } else {
            bone.joint.anticlockwiseConstraintDegs = newValue;
        }
        
        // Update UI controls if they exist
        if (this.editor.skeletonControls) {
            this.editor.skeletonControls.updateControls();
        }
        
        return true;
    }
    
    // End constraint editing
    endConstraintEdit() {
        if (this.activeConstraintEdit) {
            // Record operation for undo
            if (this.editor.recordOperation) {
                this.editor.recordOperation('CONSTRAINT_MODIFY', {
                    chainIndex: this.activeConstraintEdit.bone.chainIndex,
                    boneIndex: this.activeConstraintEdit.bone.boneIndex,
                    constraintType: this.activeConstraintEdit.type,
                    newValue: this.activeConstraintEdit.type === 'clockwise'
                        ? this.activeConstraintEdit.bone.bone.joint.clockwiseConstraintDegs
                        : this.activeConstraintEdit.bone.bone.joint.anticlockwiseConstraintDegs
                });
            }
            
            console.log(`Finished constraint editing: ${this.activeConstraintEdit.type}`);
            this.activeConstraintEdit = null;
        }
    }
    
    // Calculate angle from position relative to point
    calculateAngleFromPosition(centerPoint, x, y) {
        const dx = x - centerPoint.x;
        const dy = y - centerPoint.y;
        return Math.atan2(dy, dx);
    }
    
    // Apply anatomical constraint presets
    applyAnatomicalPreset(selectedBone, presetName) {
        if (!selectedBone || !selectedBone.bone || !selectedBone.bone.joint) {
            return false;
        }
        
        const anatomicalConstraints = this.getAnatomicalConstraints(selectedBone);
        if (!anatomicalConstraints) {
            console.warn('No anatomical constraints available for preset application');
            return false;
        }
        
        const joint = selectedBone.bone.joint;
        
        switch (presetName) {
            case 'anatomical-max':
                joint.clockwiseConstraintDegs = anatomicalConstraints.maxClockwise || 90;
                joint.anticlockwiseConstraintDegs = anatomicalConstraints.maxAnticlockwise || 90;
                break;
                
            case 'conservative':
                joint.clockwiseConstraintDegs = (anatomicalConstraints.maxClockwise || 90) * 0.7;
                joint.anticlockwiseConstraintDegs = (anatomicalConstraints.maxAnticlockwise || 90) * 0.7;
                break;
                
            case 'rigid':
                joint.clockwiseConstraintDegs = 15;
                joint.anticlockwiseConstraintDegs = 15;
                break;
                
            case 'flexible':
                joint.clockwiseConstraintDegs = Math.min(120, anatomicalConstraints.maxClockwise || 120);
                joint.anticlockwiseConstraintDegs = Math.min(120, anatomicalConstraints.maxAnticlockwise || 120);
                break;
                
            default:
                console.warn(`Unknown constraint preset: ${presetName}`);
                return false;
        }
        
        console.log(`Applied anatomical preset: ${presetName}`);
        return true;
    }
    
    // Highlight selected joint for constraint editing
    drawJointHighlight(selectedJoint) {
        if (!selectedJoint || !selectedJoint.joint) return;
        
        // This would be similar to bone highlighting but specific to joints
        // Implementation depends on how joints are represented in the FIK.js system
        console.log('Drawing joint highlight for constraint editing');
    }
    
    // Get constraint editing status
    getConstraintEditingStatus() {
        return {
            active: this.activeConstraintEdit !== null,
            type: this.activeConstraintEdit?.type || null,
            bone: this.activeConstraintEdit?.bone || null
        };
    }
    
    // Cleanup
    cleanup() {
        this.endConstraintEdit();
        this.activeConstraintEdit = null;
        this.constraintDragState = null;
    }
}