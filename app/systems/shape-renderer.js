/**
 * Muscle Shape Renderer
 * ====================
 * Converts deformation rules into 2D muscle geometry and renders via p5.js.
 * 
 * Input: Muscle object + deformation parameters from DeformationEngine
 * Output: p5.js rendered shapes (bulged, thinned, twisted muscles)
 * 
 * This is the third and final component of the deformation pipeline.
 */

/**
 * MuscleShapeRenderer class
 * Renders deformed muscle shapes using p5.js
 */
class MuscleShapeRenderer {
    constructor(options = {}) {
        this.baseColors = {
            extending_limb_muscle: { r: 200, g: 50, b: 50 },       // Red
            compression_mass: { r: 220, g: 30, b: 30 },            // Dark red
            rotation_joint: { r: 150, g: 100, b: 200 },            // Purple
            undulation_segment: { r: 100, g: 200, b: 100 },        // Green
            propulsion_foot: { r: 180, g: 80, b: 20 },             // Orange
            balance_tail: { r: 100, g: 150, b: 200 },              // Blue
            flight_wing: { r: 200, g: 100, b: 50 },                // Orange-brown
            neck_flexor: { r: 150, g: 120, b: 180 },               // Light purple
            stabilizer_muscle: { r: 100, g: 100, b: 100 }          // Gray
        };

        this.strokeWeight = options.strokeWeight || 1.5;
        this.debugMode = options.debugMode || false;
        this.colorIntensity = options.colorIntensity || 1.0;
        this.striationSpacing = options.striationSpacing || 3;
    }

    /**
     * Render a single muscle with deformation
     * @param {Object} p5 - p5.js context
     * @param {Object} muscle - Muscle object {id, type, width, startJoint, endJoint, ...}
     * @param {Object} deformation - Deformation parameters {width, bulgeFactor, thinFactor, spiralOffset, ...}
     * @param {Object} startPos - Start position {x, y}
     * @param {Object} endPos - End position {x, y}
     */
    renderMuscle(p5, muscle, deformation, startPos, endPos) {
        if (!p5 || !muscle || !deformation || !startPos || !endPos) {
            return;
        }

        try {
            // Calculate muscle properties
            const baseWidth = muscle.width || 10;
            const deformedWidth = baseWidth * (deformation.width || 1.0);
            
            // Get color for muscle type
            const color = this.getColorForType(muscle.type);
            
            // Calculate direction and perpendicular
            const dx = endPos.x - startPos.x;
            const dy = endPos.y - startPos.y;
            const length = Math.hypot(dx, dy);
            
            if (length < 0.1) return; // Skip degenerate muscles

            const dirX = dx / length;
            const dirY = dy / length;
            const perpX = -dirY;
            const perpY = dirX;

            // Render based on deformation type
            if (Math.abs(deformation.bulgeFactor - 1.0) > 0.01) {
                this.renderBulgedMuscle(p5, startPos, endPos, deformedWidth, deformation.bulgeFactor, color, dirX, dirY, perpX, perpY);
            } else if (Math.abs(deformation.thinFactor - 1.0) > 0.01) {
                this.renderTinnedMuscle(p5, startPos, endPos, deformedWidth, deformation.thinFactor, color, dirX, dirY, perpX, perpY);
            } else if (Math.abs(deformation.spiralOffset) > 0.1) {
                this.renderSpiralMuscle(p5, startPos, endPos, deformedWidth, deformation.spiralOffset, color, dirX, dirY, perpX, perpY);
            } else {
                this.renderStandardMuscle(p5, startPos, endPos, deformedWidth, color, dirX, dirY, perpX, perpY);
            }

            // Add striations if enabled
            if (deformation.striations && deformation.deformationIntensity > 0.3) {
                this.drawStriations(p5, startPos, endPos, deformedWidth, deformation.deformationIntensity, color);
            }

            // Debug overlay if enabled
            if (this.debugMode) {
                this.drawDebugOverlay(p5, muscle, deformation, startPos, endPos);
            }
        } catch (error) {
            console.error(`Error rendering muscle ${muscle.id}:`, error);
        }
    }

    /**
     * Render standard muscle shape (capsule with no deformation)
     * @private
     */
    renderStandardMuscle(p5, startPos, endPos, width, color, dirX, dirY, perpX, perpY) {
        const halfWidth = width / 2;

        // Set styling
        p5.fill(color.r, color.g, color.b, 200);
        p5.stroke(0);
        p5.strokeWeight(this.strokeWeight);

        // Create capsule shape (rounded rectangle)
        p5.beginShape();
        
        // Calculate endpoints with rounded ends
        const startLeft = {
            x: startPos.x + perpX * halfWidth,
            y: startPos.y + perpY * halfWidth
        };
        const startRight = {
            x: startPos.x - perpX * halfWidth,
            y: startPos.y - perpY * halfWidth
        };
        const endLeft = {
            x: endPos.x + perpX * halfWidth,
            y: endPos.y + perpY * halfWidth
        };
        const endRight = {
            x: endPos.x - perpX * halfWidth,
            y: endPos.y - perpY * halfWidth
        };

        // Draw sides
        p5.vertex(startLeft.x, startLeft.y);
        p5.vertex(endLeft.x, endLeft.y);
        
        // Arc at end
        this.drawArcSegment(p5, endPos, perpX, perpY, width, Math.PI * 0.5, Math.PI * 1.5);
        
        // Other side back
        p5.vertex(endRight.x, endRight.y);
        p5.vertex(startRight.x, startRight.y);
        
        // Arc at start
        this.drawArcSegment(p5, startPos, perpX, perpY, width, -Math.PI * 0.5, Math.PI * 0.5);
        
        p5.endShape(p5.CLOSE);
    }

    /**
     * Render bulged muscle (compressed state)
     * @private
     */
    renderBulgedMuscle(p5, startPos, endPos, width, bulgeFactor, color, dirX, dirY, perpX, perpY) {
        const halfWidth = width / 2;
        const bulgeAmount = halfWidth * (bulgeFactor - 1.0);
        const midX = (startPos.x + endPos.x) / 2;
        const midY = (startPos.y + endPos.y) / 2;

        // Set styling with darker color for bulge
        const bulgeCo = {
            r: Math.max(0, color.r - 30),
            g: Math.max(0, color.g - 30),
            b: Math.max(0, color.b - 30)
        };
        p5.fill(bulgeCo.r, bulgeCo.g, bulgeCo.b, 200);
        p5.stroke(0);
        p5.strokeWeight(this.strokeWeight);

        p5.beginShape();

        // Left side with bulge
        p5.vertex(startPos.x + perpX * halfWidth, startPos.y + perpY * halfWidth);
        
        // Bezier curve for bulge on left side
        const bulgeLeftMid = {
            x: midX + perpX * (halfWidth + bulgeAmount),
            y: midY + perpY * (halfWidth + bulgeAmount)
        };
        p5.curveVertex(midX + perpX * (halfWidth + bulgeAmount * 0.7), 
                       midY + perpY * (halfWidth + bulgeAmount * 0.7));
        p5.curveVertex(bulgeLeftMid.x, bulgeLeftMid.y);
        p5.curveVertex(midX + perpX * (halfWidth + bulgeAmount * 0.7), 
                       midY + perpY * (halfWidth + bulgeAmount * 0.7));
        
        p5.vertex(endPos.x + perpX * halfWidth, endPos.y + perpY * halfWidth);

        // Right side (return)
        p5.vertex(endPos.x - perpX * halfWidth, endPos.y - perpY * halfWidth);
        
        // Bulge on right side
        p5.curveVertex(midX - perpX * (halfWidth + bulgeAmount * 0.7), 
                       midY - perpY * (halfWidth + bulgeAmount * 0.7));
        p5.curveVertex(midX - perpX * (halfWidth + bulgeAmount), 
                       midY - perpY * (halfWidth + bulgeAmount));
        p5.curveVertex(midX - perpX * (halfWidth + bulgeAmount * 0.7), 
                       midY - perpY * (halfWidth + bulgeAmount * 0.7));
        
        p5.vertex(startPos.x - perpX * halfWidth, startPos.y - perpY * halfWidth);

        p5.endShape(p5.CLOSE);
    }

    /**
     * Render thinned muscle (extended state)
     * @private
     */
    renderTinnedMuscle(p5, startPos, endPos, width, thinFactor, color, dirX, dirY, perpX, perpY) {
        const halfWidth = width / 2;
        const thinAmount = halfWidth * (1.0 - thinFactor);

        // Set styling with lighter color for thin
        const thinColor = {
            r: Math.min(255, color.r + 20),
            g: Math.min(255, color.g + 20),
            b: Math.min(255, color.b + 20)
        };
        p5.fill(thinColor.r, thinColor.g, thinColor.b, 180);
        p5.stroke(0);
        p5.strokeWeight(this.strokeWeight);

        const midX = (startPos.x + endPos.x) / 2;
        const midY = (startPos.y + endPos.y) / 2;

        p5.beginShape();

        // Tapered left side
        p5.vertex(startPos.x + perpX * halfWidth, startPos.y + perpY * halfWidth);
        p5.curveVertex(midX + perpX * (halfWidth - thinAmount * 0.5), 
                       midY + perpY * (halfWidth - thinAmount * 0.5));
        p5.vertex(endPos.x + perpX * (halfWidth - thinAmount), endPos.y + perpY * (halfWidth - thinAmount));

        // Right side back
        p5.vertex(endPos.x - perpX * (halfWidth - thinAmount), endPos.y - perpY * (halfWidth - thinAmount));
        p5.curveVertex(midX - perpX * (halfWidth - thinAmount * 0.5), 
                       midY - perpY * (halfWidth - thinAmount * 0.5));
        p5.vertex(startPos.x - perpX * halfWidth, startPos.y - perpY * halfWidth);

        p5.endShape(p5.CLOSE);
    }

    /**
     * Render spiraled muscle (twist-driven deformation)
     * @private
     */
    renderSpiralMuscle(p5, startPos, endPos, width, spiralOffset, color, dirX, dirY, perpX, perpY) {
        const halfWidth = width / 2;
        const spiralRadians = spiralOffset * Math.PI / 180; // Convert degrees to radians
        const length = Math.hypot(endPos.x - startPos.x, endPos.y - startPos.y);

        // Set styling
        p5.fill(color.r, color.g, color.b, 190);
        p5.stroke(0);
        p5.strokeWeight(this.strokeWeight);

        p5.beginShape();

        const segments = Math.ceil(length / 4);
        const halfSegments = Math.floor(segments / 2);

        // Draw first half of spiral (one side)
        for (let i = 0; i <= halfSegments; i++) {
            const t = i / segments;
            const x = startPos.x + (endPos.x - startPos.x) * t;
            const y = startPos.y + (endPos.y - startPos.y) * t;
            
            // Spiral offset increases with t
            const currentOffset = spiralRadians * t;
            const offsetDirX = perpX * Math.cos(currentOffset) - dirX * Math.sin(currentOffset);
            const offsetDirY = perpY * Math.cos(currentOffset) - dirY * Math.sin(currentOffset);
            
            p5.vertex(x + offsetDirX * halfWidth, y + offsetDirY * halfWidth);
        }

        // Return on other side (opposite spiral)
        for (let i = halfSegments; i >= 0; i--) {
            const t = i / segments;
            const x = startPos.x + (endPos.x - startPos.x) * t;
            const y = startPos.y + (endPos.y - startPos.y) * t;
            
            const currentOffset = spiralRadians * t;
            const offsetDirX = perpX * Math.cos(currentOffset) - dirX * Math.sin(currentOffset);
            const offsetDirY = perpY * Math.cos(currentOffset) - dirY * Math.sin(currentOffset);
            
            p5.vertex(x - offsetDirX * halfWidth, y - offsetDirY * halfWidth);
        }

        p5.endShape(p5.CLOSE);
    }

    /**
     * Draw striations (muscle fiber lines) on the muscle
     * @private
     */
    drawStriations(p5, startPos, endPos, width, intensity, color) {
        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        const length = Math.hypot(dx, dy);

        if (length < 1) return;

        const dirX = dx / length;
        const dirY = dy / length;
        const perpX = -dirY;
        const perpY = dirX;

        // Set striation styling
        const striationColor = {
            r: Math.max(0, color.r - 50),
            g: Math.max(0, color.g - 50),
            b: Math.max(0, color.b - 50)
        };

        p5.stroke(striationColor.r, striationColor.g, striationColor.b, 100 * intensity);
        p5.strokeWeight(0.5);

        const spacing = this.striationSpacing;
        const halfWidth = width / 2;

        // Draw lines perpendicular to muscle along its length
        for (let i = 0; i < length; i += spacing) {
            const t = i / length;
            const x = startPos.x + dx * t;
            const y = startPos.y + dy * t;

            const x1 = x + perpX * halfWidth;
            const y1 = y + perpY * halfWidth;
            const x2 = x - perpX * halfWidth;
            const y2 = y - perpY * halfWidth;

            p5.line(x1, y1, x2, y2);
        }
    }

    /**
     * Draw debug overlay (centerline, force vectors, metrics)
     * @private
     */
    drawDebugOverlay(p5, muscle, deformation, startPos, endPos) {
        // Draw centerline
        p5.stroke(255, 0, 0, 128);
        p5.strokeWeight(1);
        p5.line(startPos.x, startPos.y, endPos.x, endPos.y);

        // Draw force vector
        const forceScale = 20;
        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        const midX = (startPos.x + endPos.x) / 2;
        const midY = (startPos.y + endPos.y) / 2;

        p5.stroke(0, 255, 0, 200);
        p5.strokeWeight(2);
        const arrowLength = Math.abs(deformation.width - 1.0) * forceScale;
        p5.line(midX, midY, midX + arrowLength, midY);

        // Draw metrics text
        p5.fill(0);
        p5.textSize(10);
        p5.textAlign(p5.LEFT);
        const metrics = `W:${deformation.width.toFixed(2)} B:${deformation.bulgeFactor.toFixed(2)}`;
        p5.text(metrics, startPos.x + 5, startPos.y - 5);
    }

    /**
     * Get color for muscle type
     * @private
     */
    getColorForType(muscleType) {
        return this.baseColors[muscleType] || { r: 150, g: 150, b: 150 };
    }

    /**
     * Helper: Draw arc segment for capsule ends
     * @private
     */
    drawArcSegment(p5, center, perpX, perpY, width, startAngle, endAngle) {
        const radius = width / 2;
        const steps = 8;

        for (let i = 0; i <= steps; i++) {
            const angle = startAngle + (endAngle - startAngle) * (i / steps);
            const x = center.x + Math.cos(angle) * perpX * radius + Math.sin(angle) * radius;
            const y = center.y + Math.cos(angle) * perpY * radius + Math.sin(angle) * radius;
            p5.vertex(x, y);
        }
    }

    /**
     * Render all muscles in a creature with their deformations
     * @param {Object} p5 - p5.js context
     * @param {Object} creature - Creature object with muscles and skeleton
     * @param {Map} deformationsMap - Map of muscleId -> deformation parameters
     * @param {Map} forceMetricsMap - Map of muscleId -> force metrics (for debug)
     */
    renderAllMuscles(p5, creature, deformationsMap, forceMetricsMap = null) {
        if (!creature || !creature.muscles || !deformationsMap) {
            return;
        }

        for (const muscle of creature.muscles) {
            const deformation = deformationsMap.get(muscle.id);
            if (!deformation) continue;

            // Get bone positions
            const startBone = creature.skeleton && creature.skeleton.getBoneById 
                ? creature.skeleton.getBoneById(muscle.startJoint)
                : null;
            const endBone = creature.skeleton && creature.skeleton.getBoneById
                ? creature.skeleton.getBoneById(muscle.endJoint)
                : null;

            if (!startBone || !endBone) continue;

            const startPos = { x: startBone.posX || startBone.pos?.x || 0, 
                             y: startBone.posY || startBone.pos?.y || 0 };
            const endPos = { x: endBone.posX || endBone.pos?.x || 0, 
                           y: endBone.posY || endBone.pos?.y || 0 };

            this.renderMuscle(p5, muscle, deformation, startPos, endPos);
        }
    }

    /**
     * Set debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    /**
     * Set color for muscle type
     */
    setColorForType(muscleType, color) {
        this.baseColors[muscleType] = color;
    }
}

// Export for use in other systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MuscleShapeRenderer;
}
