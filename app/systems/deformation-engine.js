/**
 * Deformation Rules Engine
 * ========================
 * The "Translator" of the muscle engine.
 * Converts physics data (from ForceAnalyzer) into visual deformation parameters
 * based on the muscle's Shape Type definitions.
 */

class DeformationEngine {
    constructor() {
        // Smoothing factor (0.0 = no smoothing, 1.0 = no change)
        // Lower = smoother but more lag
        this.smoothing = 0.3;
        
        // Store previous states for smoothing
        this.previousDeformations = new Map();
    }

    /**
     * Calculate deformation parameters for a muscle
     * @param {Object} muscle - The muscle object
     * @param {Object} forceMetrics - Output from ForceAnalyzer { ratio, twistAngle, state }
     * @returns {Object} Deformation parameters { width, bulge, offset, ... }
     */
    getDeformation(muscle, forceMetrics) {
        if (!muscle || !forceMetrics) return this._getDefaultDeformation();

        // 1. Get Shape Type Rules
        // The muscle object should already have deformationRules merged from the generator
        // If not, we might need to look it up, but let's assume the generator did its job.
        const rules = muscle.deformationRules;
        if (!rules) {
            console.warn(`DeformationEngine: No rules found for muscle ${muscle.id}`);
            return this._getDefaultDeformation();
        }

        // 2. Determine State Rules
        let stateRules = rules.rest || {}; // Default to empty if rest not defined
        
        if (forceMetrics.state === 'stretch' && rules.stretch) {
            stateRules = rules.stretch;
        } else if (forceMetrics.state === 'compress' && rules.compress) {
            stateRules = rules.compress;
        }

        // 3. Calculate Target Values
        
        // Width: Base width * multiplier
        // If stateRules has widthMultiplier, use it. Otherwise 1.0.
        const widthMult = stateRules.widthMultiplier !== undefined ? stateRules.widthMultiplier : 1.0;
        const targetWidth = muscle.width * widthMult;

        // Bulge Factor: How much it curves outward
        // Default 1.0 (straight/slight curve), >1.0 = bulge, <1.0 = thin/concave
        const targetBulge = stateRules.bulgeFactor !== undefined ? stateRules.bulgeFactor : 1.0;

        // Twist Offset: Shift the bulge peak along the length
        // Based on twist angle and sensitivity
        // twistAngle is in degrees. 
        // sensitivity: 1.0 means 45deg twist -> 0.25 shift (approx)
        // Let's normalize: 90 degrees = 0.5 shift (max safe shift)
        const twistEffect = (forceMetrics.twistAngle / 180) * (muscle.twistSensitivity || 1.0);
        
        // Apply offset factor from rules if present (e.g. some muscles twist more visually)
        const offsetMult = stateRules.offsetFactor !== undefined ? stateRules.offsetFactor : 0.0;
        
        // Final offset: 0.5 is center. Range 0.1 to 0.9.
        // We add the twist effect to the center.
        let targetOffset = 0.5 + (twistEffect * 0.5); // Simple mapping
        
        // Clamp offset
        targetOffset = Math.max(0.2, Math.min(0.8, targetOffset));

        // Striations: Boolean flag
        const showStriations = !!stateRules.addStriations;

        // 4. Smoothing (LERP)
        const prev = this.previousDeformations.get(muscle.id) || {
            width: targetWidth,
            bulge: targetBulge,
            offset: targetOffset
        };

        const current = {
            width: this._lerp(prev.width, targetWidth, this.smoothing),
            bulge: this._lerp(prev.bulge, targetBulge, this.smoothing),
            offset: this._lerp(prev.offset, targetOffset, this.smoothing),
            showStriations: showStriations // No smoothing for booleans
        };

        // Update cache
        this.previousDeformations.set(muscle.id, current);

        return current;
    }

    _lerp(start, end, amt) {
        return (1 - amt) * end + amt * start; // This is actually weighted average towards start?
        // Standard lerp: start + (end - start) * amt
        // If amt is "smoothing factor" (0.9 = heavy smoothing, keep 90% old), then:
        // return prev * smoothing + target * (1 - smoothing)
        // My constructor says 0.3. Let's assume 0.3 means "move 30% towards target"
        // return start + (end - start) * 0.3;
        
        // Let's use standard "move towards" logic
        const speed = 0.2; // Move 20% of the way per frame
        return start + (end - start) * speed;
    }

    /**
     * Calculate forces and deformation for all muscles in a creature
     * @param {Object} creature - The creature object containing muscles and skeleton
     * @returns {Object} Map of muscle ID to deformation parameters
     */
    calculateAllMuscleForcesForCreature(creature) {
        const deformations = {};
        
        if (!creature || !creature.muscles) return deformations;
        
        // Ensure we have a force analyzer
        if (!this.forceAnalyzer) {
            this.forceAnalyzer = new ForceAnalyzer();
        }
        
        for (const muscle of creature.muscles) {
            // 1. Calculate physical forces (stretch, twist)
            const forceMetrics = this.forceAnalyzer.calculateMuscleForce(muscle, creature);
            
            // 2. Translate forces to visual deformation
            const deformation = this.getDeformation(muscle, forceMetrics);
            
            deformations[muscle.id] = deformation;
        }
        
        return deformations;
    }

    _getDefaultDeformation() {
        return {
            width: 10,
            bulge: 1.0,
            offset: 0.5,
            showStriations: false
        };
    }
}

// Export
if (typeof module !== 'undefined') {
    module.exports = DeformationEngine;
}
