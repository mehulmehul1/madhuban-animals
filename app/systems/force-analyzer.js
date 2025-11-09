/**
 * Force Analyzer System
 * ====================
 * Calculates muscle force metrics (ratio, twist angle) from skeleton state.
 * 
 * Input: Skeleton bones with positions, muscle with restLength
 * Output: {ratio, twistAngle, compression, forceVector}
 * 
 * This is the first component of the deformation pipeline.
 */

/**
 * ForceAnalyzer class
 * Converts skeleton state into force metrics that drive deformation
 */
class ForceAnalyzer {
    constructor() {
        this.lastForces = new Map(); // Cache for performance
    }

    /**
     * Calculate force metrics for a single muscle
     * @param {Object} muscle - Muscle object with {id, startJoint, endJoint, restLength, width, type, ...}
     * @param {Object} skeleton - Skeleton object with bones array and getBoneById method
     * @returns {Object} Force metrics {ratio, twistAngle, compression, forceVector}
     */
    calculateMuscleForce(muscle, skeleton) {
        // Validate inputs
        if (!muscle || !skeleton) {
            return this.getSafeDefaults();
        }

        try {
            // Get start and end bones
            const startBone = this.getBoneFromSkeleton(skeleton, muscle.startJoint);
            const endBone = this.getBoneFromSkeleton(skeleton, muscle.endJoint);

            if (!startBone || !endBone) {
                console.warn(`Force analyzer: missing bone for muscle ${muscle.id}`);
                return this.getSafeDefaults();
            }

            // Calculate ratio (stretch vs compress)
            const currentDistance = this.calculateBoneDistance(startBone, endBone);
            const ratio = currentDistance / Math.max(muscle.restLength, 0.1); // Avoid division by zero

            // Calculate twist angle from joint rotation
            const twistAngle = this.calculateTwistAngle(startBone, endBone, muscle);

            // Determine compression state
            const compression = ratio < 1.0;

            // Calculate force vector (direction of force along muscle)
            const forceVector = this.calculateForceVector(startBone, endBone);

            return {
                ratio: Math.max(0.3, Math.min(2.0, ratio)), // Clamp to reasonable range
                twistAngle: twistAngle,
                compression: compression,
                forceVector: forceVector,
                isExtended: ratio > 1.0,
                isCompressed: ratio < 1.0,
                intensity: Math.abs(ratio - 1.0) // How much deformation (0 = rest, >1 = strong)
            };
        } catch (error) {
            console.error(`Force analyzer error for muscle ${muscle.id}:`, error);
            return this.getSafeDefaults();
        }
    }

    /**
     * Calculate force for all muscles in a creature
     * @param {Object} creature - Creature object with skeleton and muscles
     * @returns {Map} Map of muscleId -> forceMetrics
     */
    calculateAllMuscleForcesForCreature(creature) {
        if (!creature || !creature.muscles || !creature.skeleton) {
            return new Map();
        }

        const forces = new Map();
        for (const muscle of creature.muscles) {
            forces.set(muscle.id, this.calculateMuscleForce(muscle, creature.skeleton));
        }
        return forces;
    }

    /**
     * Get bone from skeleton by ID, handling various skeleton structures
     * @param {Object} skeleton - Skeleton object
     * @param {string} boneId - Bone ID to find
     * @returns {Object|null} Bone object or null
     */
    getBoneFromSkeleton(skeleton, boneId) {
        if (!skeleton) return null;

        // Try getBoneById method first (FIK.Bone interface)
        if (typeof skeleton.getBoneById === 'function') {
            return skeleton.getBoneById(boneId);
        }

        // Try bones array
        if (Array.isArray(skeleton.bones)) {
            return skeleton.bones.find(b => b.id === boneId || b.name === boneId);
        }

        // Try direct property access
        if (skeleton[boneId]) {
            return skeleton[boneId];
        }

        return null;
    }

    /**
     * Calculate distance between two bones' positions
     * @param {Object} bone1 - Bone object with position
     * @param {Object} bone2 - Bone object with position
     * @returns {number} Distance between bones
     */
    calculateBoneDistance(bone1, bone2) {
        if (!bone1 || !bone2) return 0;

        // Extract position - handle various formats
        const pos1 = bone1.pos || { x: bone1.x || 0, y: bone1.y || 0 };
        const pos2 = bone2.pos || { x: bone2.x || 0, y: bone2.y || 0 };

        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;

        // Use hypot for precision and performance
        return Math.hypot(dx, dy);
    }

    /**
     * Calculate twist angle from bone rotation
     * Represents how much the bone has twisted along its length
     * @param {Object} startBone - Start bone of muscle
     * @param {Object} endBone - End bone of muscle
     * @param {Object} muscle - Muscle object for shape type info
     * @returns {number} Twist angle in radians
     */
    calculateTwistAngle(startBone, endBone, muscle) {
        let twistAngle = 0;

        try {
            // Try to extract rotation from FIK.Bone structure
            // FIK bones have various ways to store rotation
            if (endBone.angle !== undefined) {
                twistAngle = endBone.angle;
            } else if (endBone.rotation !== undefined) {
                twistAngle = endBone.rotation;
            } else if (endBone.getGlobalRotation && typeof endBone.getGlobalRotation === 'function') {
                twistAngle = endBone.getGlobalRotation();
            } else if (startBone && startBone.angle !== undefined && endBone.angle !== undefined) {
                // Relative angle between start and end
                twistAngle = endBone.angle - startBone.angle;
            }

            // Normalize to -PI to PI range
            while (twistAngle > Math.PI) twistAngle -= 2 * Math.PI;
            while (twistAngle < -Math.PI) twistAngle += 2 * Math.PI;
        } catch (error) {
            console.debug('Could not extract twist angle:', error);
            twistAngle = 0;
        }

        return twistAngle;
    }

    /**
     * Calculate force direction vector along muscle
     * Direction from start bone to end bone
     * @param {Object} startBone - Start bone
     * @param {Object} endBone - End bone
     * @returns {Object} Force vector {x, y, magnitude}
     */
    calculateForceVector(startBone, endBone) {
        if (!startBone || !endBone) {
            return { x: 0, y: 0, magnitude: 0 };
        }

        const pos1 = startBone.pos || { x: startBone.x || 0, y: startBone.y || 0 };
        const pos2 = endBone.pos || { x: endBone.x || 0, y: endBone.y || 0 };

        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const magnitude = Math.hypot(dx, dy);

        if (magnitude === 0) {
            return { x: 0, y: 0, magnitude: 0 };
        }

        // Normalize to unit vector
        return {
            x: dx / magnitude,
            y: dy / magnitude,
            magnitude: magnitude
        };
    }

    /**
     * Safe default force metrics for error cases
     * @returns {Object} Safe default metrics
     */
    getSafeDefaults() {
        return {
            ratio: 1.0,           // Rest state
            twistAngle: 0,        // No twist
            compression: false,   // Not compressed
            forceVector: { x: 0, y: 0, magnitude: 0 },
            isExtended: false,
            isCompressed: false,
            intensity: 0
        };
    }

    /**
     * Clear cache (call once per frame before recalculating)
     */
    clearCache() {
        this.lastForces.clear();
    }
}

// Export for use in other systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForceAnalyzer;
}
