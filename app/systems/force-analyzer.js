/**
 * Force Analyzer System
 * =====================
 * The "Physics Sensor" of the muscle engine.
 * Calculates deformation metrics (stretch ratio, twist angle) from the current skeleton state.
 * Pure math, no visual logic.
 */

class ForceAnalyzer {
    constructor() {
        // Cache for previous frame values to calculate velocity/changes if needed
        this.previousState = new Map();
    }

    /**
     * Calculate force metrics for a single muscle
     * @param {Object} muscle - The muscle object (from muscle-generator.js)
     * @param {Object} skeleton - The creature's skeleton object
     * @returns {Object} Force metrics { ratio, twistAngle, state, compression }
     */
    calculateMuscleForce(muscle, skeleton) {
        if (!muscle || !skeleton) return null;

        // 1. Get current bone positions
        const startBone = this._getBoneById(skeleton, muscle.startJoint);
        const endBone = this._getBoneById(skeleton, muscle.endJoint);

        if (!startBone || !endBone) {
            // console.warn(`ForceAnalyzer: Bones not found for muscle ${muscle.id}`);
            return this._getDefaultMetrics();
        }

        // 2. Calculate current length
        // Handle both FIK.Bone2D objects (which have start/end points) and simple point objects
        const startPos = this._getBonePosition(startBone, 'start'); // Usually attachment is at start or end of bone
        const endPos = this._getBonePosition(endBone, 'start'); 
        
        // For sequential bones, the muscle spans from startBone.start to endBone.start? 
        // Or startBone.end to endBone.start?
        // In muscle-generator, we used bone positions directly. 
        // Let's assume the 'pos' property or the bone's start point is the anchor.
        
        const currentLength = this._calculateDistance(startPos, endPos);

        // 3. Calculate Stretch/Compression Ratio
        // ratio > 1.0 = stretch, ratio < 1.0 = compress
        const ratio = currentLength / muscle.restLength;

        // 4. Calculate Twist Angle
        // Difference between current relative angle and rest angle
        const currentAngle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x) * 180 / Math.PI;
        let twistAngle = currentAngle - muscle.restAngle;
        
        // Normalize twist to -180 to 180
        while (twistAngle > 180) twistAngle -= 360;
        while (twistAngle < -180) twistAngle += 360;

        // 5. Determine State
        let state = 'rest';
        if (ratio > 1.05) state = 'stretch';
        else if (ratio < 0.95) state = 'compress';

        return {
            ratio: ratio,
            twistAngle: twistAngle, // Degrees
            state: state,
            currentLength: currentLength,
            // Helper boolean for easy logic
            isCompressed: ratio < 1.0,
            isStretched: ratio > 1.0
        };
    }

    /**
     * Helper: Get bone by ID from skeleton
     * @private
     */
    _getBoneById(skeleton, id) {
        // Assuming skeleton.bones is a flat array or we need to traverse chains
        // Based on creature-builder, bones might be in chains.
        // But muscle-generator used a flat list or search.
        // Let's try to find it in the flat list if available, or search chains.
        
        if (skeleton.bones) {
            return skeleton.bones.find(b => b.id === id);
        }
        
        // Fallback: Search in chains if skeleton is the creature object containing chains
        if (skeleton.chains) {
            for (const chain of skeleton.chains) {
                if (chain.bones) {
                    const bone = chain.bones.find(b => b.id === id);
                    if (bone) return bone;
                }
            }
        }
        
        return null;
    }

    /**
     * Helper: Get absolute position of a bone
     * @private
     */
    _getBonePosition(bone, pointType = 'start') {
        // If it's a FIK Bone2D
        if (bone.start && bone.end) {
            // FIK bones usually store absolute positions in .start and .end after update
            return pointType === 'end' ? bone.end : bone.start;
        }
        
        // If it's a simple object {x, y}
        if (bone.x !== undefined && bone.y !== undefined) {
            return bone;
        }
        
        // If it has a pos object
        if (bone.pos) {
            return bone.pos;
        }

        return { x: 0, y: 0 };
    }

    /**
     * Helper: Calculate distance between two points
     * @private
     */
    _calculateDistance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Helper: Default metrics if calculation fails
     * @private
     */
    _getDefaultMetrics() {
        return {
            ratio: 1.0,
            twistAngle: 0,
            state: 'rest',
            currentLength: 0,
            isCompressed: false,
            isStretched: false
        };
    }
}

// Export for module use
if (typeof module !== 'undefined') {
    module.exports = ForceAnalyzer;
}
