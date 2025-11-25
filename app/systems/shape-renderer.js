/**
 * Muscle Shape Renderer
 * =====================
 * The "Artist" of the muscle engine.
 * Draws the final 2D geometry using p5.js based on deformation parameters.
 * Handles bulging, tapering, and twist offsets.
 */

class MuscleShapeRenderer {
    constructor(config = {}) {
        this.debugMode = config.debugMode || false;
        this.colorIntensity = config.colorIntensity || 1.0;
    }

    /**
     * Render a single muscle - dispatches to appropriate renderer
     * @param {Object} p5 - The p5.js instance
     * @param {Object} muscle - The muscle object
     * @param {Object} deformation - Deformation parameters { width, bulge, offset }
     * @param {Object} startPos - Start position {x, y}
     * @param {Object} endPos - End position {x, y}
     * @param {Function} getBoneById - Function to get live bone by ID
     */
    renderMuscle(p5, muscle, deformation, startPos, endPos, getBoneById) {
        if (!p5 || !muscle || !deformation) return;



        switch(muscle.shapeType) {
            case 'spindle':
                this.renderSpindle(p5, muscle, deformation, startPos, endPos);
                break;
            case 'circle-chain':
                this.renderCircleChain(p5, muscle, deformation, startPos, endPos, getBoneById);
                break;
            case 'circle-segment':
                this.renderCircleSegment(p5, muscle, deformation, startPos, endPos);
                break;
            default:
                // Fallback to spindle

                this.renderSpindle(p5, muscle, deformation, startPos, endPos);
        }
    }

    /**
     * Render Circle-Chain muscle mass (torso, neck, etc.)
     * Creates organic volume using circles along the bone chain
     */
    renderCircleChain(p5, muscle, deformation, startPos, endPos, getBoneById) {

        
        // Check if muscle has bones array (from mass strategy)
        if (!muscle.bones || muscle.bones.length === 0) {
            console.warn(`[RENDER] Circle-chain muscle ${muscle.id} has no bones array, falling back to spindle`);
            this.renderSpindle(p5, muscle, deformation, startPos, endPos);
            return;
        }

        const bones = muscle.bones;

        const circles = [];
        
        // Generate circles along each bone in the span
        // IMPORTANT: Use getBoneById to get LIVE bone positions, not cached ones!
        for (let boneIdx = 0; boneIdx < bones.length; boneIdx++) {
            const cachedBone = bones[boneIdx];
            
            // Get the LIVE bone from the skeleton
            const liveBone = getBoneById ? getBoneById(cachedBone.id) : cachedBone;
            
            if (!liveBone) continue;
            
            const t = boneIdx / (bones.length - 1); // 0 to 1
            
            // Position at bone midpoint (using LIVE positions)
            const x = (liveBone.start.x + liveBone.end.x) / 2;
            const y = (liveBone.start.y + liveBone.end.y) / 2;
            
            // Base width from muscle config or deformation
            const baseRadius = (muscle.width || deformation.width || 10) / 2;
            
            // ANATOMICAL PROFILING based on role
            let profileScale = 1.0;
            const role = (muscle.role || 'default').toLowerCase();
            
            if (role.includes('neck')) {
                // Neck: Thick at base (t=0), thinner at head (t=1)
                profileScale = 1.2 - t * 0.5;
            } else if (role.includes('tail')) {
                // Tail: Thick at base, very thin at tip
                profileScale = 1.0 - t * 0.8;
            } else if (role.includes('spine') || role.includes('body') || role.includes('mantle')) {
                // Torso/Body: Thicker in middle (barrel), tapered slightly at ends
                // sin(t * PI) gives 0->1->0 hump
                profileScale = 0.9 + 0.3 * Math.sin(t * Math.PI);
            } else if (role.includes('tentacle') || role.includes('arm')) {
                // Tentacles: Linear taper
                profileScale = 1.0 - t * 0.6;
            }
            
            // Apply deformation (muscle contraction/extension)
            const bulgeFactor = deformation.bulgeFactor !== undefined ? deformation.bulgeFactor : 0;
            const deformedRadius = baseRadius * profileScale * (1 + bulgeFactor * (muscle.bulgeSensitivity || 1.0));
            
            circles.push({ x, y, radius: Math.max(2, deformedRadius) });
        }
        
        // Draw smooth organic hull
        p5.push();
        p5.noStroke();
        p5.fill(180, 90, 90, 200); // Darker red-brown for muscle masses
        
        this.drawOrganicHull(p5, circles);
        
        p5.pop();
    }

    /**
     * Draw filled outline from tangent points of circles
     */
    drawCircleChainOutline(p5, circles) {
        if (circles.length < 2) return;
        
        p5.push();
        p5.noStroke();
        p5.fill(180, 90, 90, 200); // Darker red-brown for muscle masses
        
        // Calculate tangent points for upper and lower outline
        const upperTangents = [];
        const lowerTangents = [];
        
        for (let i = 0; i < circles.length - 1; i++) {
            const c1 = circles[i];
            const c2 = circles[i + 1];
            
            // Vector from c1 to c2
            const dx = c2.x - c1.x;
            const dy = c2.y - c1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 0.1) continue;
            
            // Perpendicular vector (normalized)
            const perpX = -dy / dist;
            const perpY = dx / dist;
            
            // Average radius for tangent calculation
            const avgRadius = (c1.radius + c2.radius) / 2;
            
            // Upper tangent points
            upperTangents.push({
                x: c1.x + perpX * c1.radius,
                y: c1.y + perpY * c1.radius
            });
            
            // Lower tangent points
            lowerTangents.push({
                x: c1.x - perpX * c1.radius,
                y: c1.y - perpY * c1.radius
            });
        }
        
        // Add last circle's tangent points
        const lastCircle = circles[circles.length - 1];
        const secondLast = circles[circles.length - 2];
        const dx = lastCircle.x - secondLast.x;
        const dy = lastCircle.y - secondLast.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / dist;
        const perpY = dx / dist;
        
        upperTangents.push({
            x: lastCircle.x + perpX * lastCircle.radius,
            y: lastCircle.y + perpY * lastCircle.radius
        });
        
        lowerTangents.push({
            x: lastCircle.x - perpX * lastCircle.radius,
            y: lastCircle.y - perpY * lastCircle.radius
        });
        
        // Draw filled shape
        p5.beginShape();
        
        // Upper outline
        upperTangents.forEach(pt => p5.vertex(pt.x, pt.y));
        
        // Lower outline (reversed)
        for (let i = lowerTangents.length - 1; i >= 0; i--) {
            p5.vertex(lowerTangents[i].x, lowerTangents[i].y);
        }
        
        p5.endShape(p5.CLOSE);
        p5.pop();
    }

    /**
     * Render Circle-Segment muscle (tentacles, snake body, flexible parts)
     * Dense overlapping circles for continuous flexible appearance
     */
    renderCircleSegment(p5, muscle, deformation, startPos, endPos) {
        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length < 1) return;
        
        const baseRadius = (muscle.width || deformation.width || 6) / 2;
        const bulgeFactor = deformation.bulgeFactor !== undefined ? deformation.bulgeFactor : 0;
        const overlapFactor = muscle.overlapFactor || 0.5; // Less overlap needed with hull
        
        // Number of circles based on overlap
        // With hull, we can space them out more (radius * 1.0 instead of radius * 0.5)
        const spacing = Math.max(2, baseRadius * 1.0); 
        const circleCount = Math.max(2, Math.ceil(length / spacing));
        
        const circles = [];
        const role = (muscle.role || 'default').toLowerCase();

        for (let i = 0; i < circleCount; i++) {
            const t = i / (circleCount - 1);
            const x = startPos.x + dx * t;
            const y = startPos.y + dy * t;
            
            // Apply tapering profile
            let profileScale = 1.0;
            if (role.includes('tentacle') || role.includes('arm') || role.includes('tail')) {
                // Linear taper for appendages
                profileScale = 1.0 - t * 0.6;
            }
            
            const deformedRadius = baseRadius * profileScale * (1 + bulgeFactor * 0.6);
            circles.push({ x, y, radius: Math.max(1.5, deformedRadius) });
        }
        
        p5.push();
        p5.noStroke();
        p5.fill(200, 100, 100, 180); // Lighter red for flexible segments
        
        this.drawOrganicHull(p5, circles);
        
        p5.pop();
    }

    renderSpindle(p5, muscle, deformation, startPos, endPos) {
        // 1. Calculate Geometry Vectors
        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Perpendicular vector (normalized)
        const perpX = -Math.sin(angle);
        const perpY = Math.cos(angle);

        // 2. Calculate Control Points
        // We use a simplified "spindle" shape logic with Bezier curves.
        // The "peak" of the spindle is determined by the offset (0.0 - 1.0)
        // The "width" at the peak is determined by width * bulge

        const halfWidth = (deformation.width * deformation.bulge) / 2;
        
        // Offset position along the length
        const peakRatio = deformation.offset; // 0.5 is center
        const peakX = startPos.x + dx * peakRatio;
        const peakY = startPos.y + dy * peakRatio;

        // Peak points (top and bottom)
        const topX = peakX + perpX * halfWidth;
        const topY = peakY + perpY * halfWidth;
        const bottomX = peakX - perpX * halfWidth;
        const bottomY = peakY - perpY * halfWidth;

        // 3. Draw Shape
        p5.push();
        
        // Styling (Placeholder for Phase 3 integration)
        // For now, use a simple fill based on state
        if (this.debugMode) {
            p5.noFill();
            p5.stroke(0);
            p5.strokeWeight(1);
        } else {
            // Simple organic look
            p5.noStroke();
            // Color based on muscle group or type?
            // Let's use a reddish muscle color
            p5.fill(200, 100, 100, 200); 
        }

        p5.beginShape();
        
        // Start point
        p5.vertex(startPos.x, startPos.y);

        // Curve to Top Peak
        // Control point 1: Start -> Peak
        // We want a smooth curve. Control point should be tangent to the line?
        // Or just use curveVertex? Bezier gives more control.
        // Simple Quadratic Bezier: Start -> Control -> End
        // Control point is "out" from the midpoint of the segment?
        // Let's use bezierVertex(c1x, c1y, c2x, c2y, x, y)
        
        // Top Curve: Start -> Top Peak -> End
        // To make it round, control points should be parallel to the length vector
        const cpLen = length * 0.3; // Control point handle length
        
        // CP1: Out from start towards peak
        // Actually, for a spindle, we can just use the peak as the anchor?
        // Let's try drawing two curves: Start->Top->End and End->Bottom->Start
        
        // Simplified: just use curveVertex for organic shape
        // p5.curveVertex(startPos.x, startPos.y); // Start guide
        // p5.curveVertex(startPos.x, startPos.y); // Start point
        // p5.curveVertex(topX, topY);             // Peak
        // p5.curveVertex(endPos.x, endPos.y);     // End point
        // p5.curveVertex(endPos.x, endPos.y);     // End guide
        
        // Better: Bezier for precise bulge control
        // Start -> Top
        p5.bezierVertex(
            startPos.x + dx * (peakRatio * 0.5), startPos.y + dy * (peakRatio * 0.5), // CP1 (on line)
            topX - dx * 0.1, topY - dy * 0.1, // CP2 (near peak)
            topX, topY // Anchor (Peak)
        );
        
        // Top -> End
        p5.bezierVertex(
            topX + dx * 0.1, topY + dy * 0.1, // CP1 (near peak)
            endPos.x - dx * ((1-peakRatio) * 0.5), endPos.y - dy * ((1-peakRatio) * 0.5), // CP2 (on line)
            endPos.x, endPos.y // Anchor (End)
        );

        // End -> Bottom
        p5.bezierVertex(
            endPos.x - dx * ((1-peakRatio) * 0.5), endPos.y - dy * ((1-peakRatio) * 0.5),
            bottomX + dx * 0.1, bottomY + dy * 0.1,
            bottomX, bottomY
        );

        // Bottom -> Start
        p5.bezierVertex(
            bottomX - dx * 0.1, bottomY - dy * 0.1,
            startPos.x + dx * (peakRatio * 0.5), startPos.y + dy * (peakRatio * 0.5),
            startPos.x, startPos.y
        );

        p5.endShape(p5.CLOSE);
        p5.pop();

        // 4. Striations (Optional Debug/Visual)
        if (deformation.showStriations) {
            p5.stroke(255, 255, 255, 100);
            p5.strokeWeight(1);
            p5.noFill();
            // Draw lines along the length
            p5.line(startPos.x, startPos.y, endPos.x, endPos.y);
        }

        // 5. Debug Overlay
        if (this.debugMode) {
            this._drawDebug(p5, startPos, endPos, topX, topY, bottomX, bottomY, deformation);
        }
    }

    _drawDebug(p5, start, end, tx, ty, bx, by, def) {
        p5.push();
        p5.stroke(0, 255, 0);
        p5.line(start.x, start.y, end.x, end.y); // Centerline
        
        p5.stroke(255, 0, 0);
        p5.line(tx, ty, bx, by); // Width at peak
        
        p5.fill(0);
        p5.noStroke();
        // p5.text(`W:${def.width.toFixed(1)}`, tx, ty - 10);
        p5.pop();
    }

    /**
     * Draw a smooth organic hull around a chain of circles.
     * Uses external tangents to connect adjacent circles smoothly.
     */
    drawOrganicHull(p5, circles) {
        if (circles.length < 2) return;

        p5.push();
        p5.noStroke();
        // Use the current fill color set before calling this
        
        // 1. Draw all circles first (to fill the joints)
        circles.forEach(c => p5.circle(c.x, c.y, c.radius * 2));

        // 2. Draw connections between adjacent circles
        for (let i = 0; i < circles.length - 1; i++) {
            const c1 = circles[i];
            const c2 = circles[i + 1];
            
            const dx = c2.x - c1.x;
            const dy = c2.y - c1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Skip if circles are too close or completely contained
            if (dist < Math.abs(c1.radius - c2.radius) + 0.1) continue;

            const angle = Math.atan2(dy, dx);
            
            // Calculate spread angle for external tangents
            // cos(spread) = (r1 - r2) / dist
            let spread = 0;
            try {
                // Clamp input to acos to avoid NaN due to floating point errors
                const val = (c1.radius - c2.radius) / dist;
                if (val >= 1) spread = 0;
                else if (val <= -1) spread = Math.PI;
                else spread = Math.acos(val);
            } catch (e) { continue; }

            // Tangent points
            const ang1 = angle + spread;
            const ang2 = angle - spread;
            
            const x1a = c1.x + Math.cos(ang1) * c1.radius;
            const y1a = c1.y + Math.sin(ang1) * c1.radius;
            
            const x1b = c1.x + Math.cos(ang2) * c1.radius;
            const y1b = c1.y + Math.sin(ang2) * c1.radius;
            
            const x2a = c2.x + Math.cos(ang1) * c2.radius;
            const y2a = c2.y + Math.sin(ang1) * c2.radius;
            
            const x2b = c2.x + Math.cos(ang2) * c2.radius;
            const y2b = c2.y + Math.sin(ang2) * c2.radius;
            
            // Draw the trapezoid connecting the circles
            p5.beginShape();
            p5.vertex(x1a, y1a);
            p5.vertex(x2a, y2a);
            p5.vertex(x2b, y2b);
            p5.vertex(x1b, y1b);
            p5.endShape(p5.CLOSE);
        }
        
        p5.pop();
    }
}

// Export
if (typeof module !== 'undefined') {
    module.exports = MuscleShapeRenderer;
}
