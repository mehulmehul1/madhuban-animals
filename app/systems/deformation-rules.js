/**
 * Deformation Rules Engine
 * =======================
 * Applies shape-type-specific visual transformations based on force metrics.
 * 
 * Input: Muscle object + force metrics from ForceAnalyzer
 * Output: Deformation parameters {width, bulgeFactor, thinFactor, spiralOffset, ...}
 * 
 * This is the second component of the deformation pipeline.
 */

/**
 * DeformationEngine class
 * Converts force metrics into shape deformation parameters
 */
class DeformationEngine {
    constructor() {
        this.interpolationMode = 'cubic'; // 'linear', 'cubic', 'smoothstep'
    }

    /**
     * Apply deformation rules to a muscle based on force metrics
     * @param {Object} muscle - Muscle object with {id, type, width, deformationRules, ...}
     * @param {Object} forceMetrics - Force metrics from ForceAnalyzer {ratio, twistAngle, compression, ...}
     * @returns {Object} Deformation parameters
     */
    applyDeformationRules(muscle, forceMetrics) {
        if (!muscle || !forceMetrics) {
            return this.getSafeDefaults();
        }

        try {
            // Get shape type and deformation rules
            const shapeType = muscle.type;
            if (!shapeType) {
                return this.getSafeDefaults();
            }

            // Look up rules from muscle (set by muscle-generator)
            const rules = muscle.deformationRules;
            if (!rules) {
                return this.getDeformationFromShapeType(shapeType, forceMetrics, muscle);
            }

            // Apply rules based on force state
            return this.applyShapeTypeRules(shapeType, rules, forceMetrics, muscle);
        } catch (error) {
            console.error(`Deformation rules error for muscle ${muscle.id}:`, error);
            return this.getSafeDefaults();
        }
    }

    /**
     * Apply shape-type-specific deformation rules
     * @private
     */
    applyShapeTypeRules(shapeType, rules, forceMetrics, muscle) {
        const ratio = forceMetrics.ratio;
        const twistAngle = forceMetrics.twistAngle;
        const compression = forceMetrics.compression; // true if ratio < 1.0
        const intensity = forceMetrics.intensity || Math.abs(ratio - 1.0);

        // Initialize deformation with width as multiplier (1.0 = rest state)
        const deformation = {
            width: 1.0,  // Width multiplier, not absolute width
            bulgeFactor: 1.0,
            thinFactor: 1.0,
            spiralOffset: 0,
            striations: false,
            deformationIntensity: intensity,
            shapeType: shapeType
        };

        // Get twist sensitivity from muscle or use defaults
        const twistSensitivity = muscle.twistSensitivity || this.getTwistSensitivityForType(shapeType);

        // Apply width multiplier based on compression state
        if (compression && rules.compress && rules.compress.widthMultiplier) {
            // Compress: use compress widthMultiplier
            deformation.width = rules.compress.widthMultiplier;
            deformation.bulgeFactor = rules.compress.bulgeFactor || 1.2;
            if (rules.compress.roundness !== undefined) {
                deformation.roundness = rules.compress.roundness;
            }
        } else if (!compression && rules.stretch && rules.stretch.widthMultiplier) {
            // Extend: use stretch widthMultiplier
            deformation.width = rules.stretch.widthMultiplier;
            deformation.thinFactor = rules.stretch.widthMultiplier;
            if (rules.stretch.addStriations) {
                deformation.striations = true;
            }
        } else if (ratio === 1.0) {
            // At rest: keep rest width, no deformation
            deformation.width = 1.0;
            deformation.bulgeFactor = 1.0;
            deformation.thinFactor = 1.0;
            deformation.striations = false;
        }

        // Apply twist-driven deformation
        if (Math.abs(twistAngle) > 0.01) {
            // Apply twist sensitivity multiplier
            const twistEffect = Math.abs(twistAngle) * twistSensitivity;
            deformation.spiralOffset = twistEffect * (180 / Math.PI); // Convert to degrees
            
            // High twist sensitivity types get more pronounced spiral
            if (twistSensitivity > 1.0) {
                deformation.spiralIntensity = Math.min(1.0, twistEffect / Math.PI);
            }
        }

        // Clamp deformation values to valid ranges
        deformation.width = Math.max(0.5, Math.min(2.0, deformation.width));
        deformation.bulgeFactor = Math.max(1.0, Math.min(2.0, deformation.bulgeFactor));
        deformation.thinFactor = Math.max(0.5, Math.min(1.0, deformation.thinFactor));
        deformation.spiralOffset = Math.max(-45, Math.min(45, deformation.spiralOffset));

        return deformation;
    }

    /**
     * Get deformation parameters based on shape type when rules not available
     * @private
     */
    getDeformationFromShapeType(shapeType, forceMetrics, muscle) {
        const ratio = forceMetrics.ratio;
        const twistAngle = forceMetrics.twistAngle;
        const compression = forceMetrics.compression;

        // Initialize with width as multiplier (1.0 = rest)
        const deformation = {
            width: 1.0,
            bulgeFactor: 1.0,
            thinFactor: 1.0,
            spiralOffset: 0,
            striations: false,
            deformationIntensity: Math.abs(ratio - 1.0),
            shapeType: shapeType
        };

        const twistSensitivity = this.getTwistSensitivityForType(shapeType);

        switch (shapeType) {
            case 'extending_limb_muscle':
                if (compression) {
                    deformation.width = 1.2;  // Bulge on compress
                    deformation.bulgeFactor = 1.2;
                } else {
                    deformation.width = 0.7;  // Thin on extend
                    deformation.thinFactor = 0.7;
                    deformation.striations = true;
                }
                break;

            case 'compression_mass':
                if (compression) {
                    deformation.width = 1.4;  // Maximum bulge
                    deformation.bulgeFactor = 1.5;
                } else {
                    deformation.width = 0.85;
                    deformation.thinFactor = 0.85;
                }
                break;

            case 'rotation_joint':
                if (compression) {
                    deformation.width = 1.25;
                    deformation.bulgeFactor = 1.25;
                } else {
                    deformation.width = 0.75;
                    deformation.thinFactor = 0.75;
                }
                // High twist sensitivity
                deformation.spiralOffset = Math.abs(twistAngle) * twistSensitivity * (180 / Math.PI);
                break;

            case 'undulation_segment':
                if (compression) {
                    deformation.width = 1.3;
                    deformation.bulgeFactor = 1.3;
                } else {
                    deformation.width = 0.8;
                    deformation.thinFactor = 0.8;
                }
                // Very high twist sensitivity
                deformation.spiralOffset = Math.abs(twistAngle) * twistSensitivity * (180 / Math.PI);
                deformation.spiralIntensity = Math.min(1.0, Math.abs(twistAngle) / Math.PI);
                break;

            case 'propulsion_foot':
                if (compression) {
                    deformation.width = 1.5;  // Extreme bulge
                    deformation.bulgeFactor = 1.5;
                } else {
                    deformation.width = 0.6;
                    deformation.thinFactor = 0.6;
                }
                // Low twist sensitivity (mostly linear)
                break;

            case 'balance_tail':
                if (compression) {
                    deformation.width = 1.3;
                    deformation.bulgeFactor = 1.3;
                } else {
                    deformation.width = 0.75;
                    deformation.thinFactor = 0.75;
                }
                // High twist sensitivity for tail undulation
                deformation.spiralOffset = Math.abs(twistAngle) * twistSensitivity * (180 / Math.PI);
                break;

            case 'flight_wing':
                if (compression) {
                    deformation.width = 1.2;
                    deformation.bulgeFactor = 1.2;
                } else {
                    deformation.width = 0.7;
                    deformation.thinFactor = 0.7;
                    deformation.striations = true;
                }
                // Very high twist sensitivity for directional control
                deformation.spiralOffset = Math.abs(twistAngle) * twistSensitivity * (180 / Math.PI);
                break;

            default:
                // Unknown type - use conservative deformation
                if (compression) {
                    deformation.width = 1.1;
                    deformation.bulgeFactor = 1.1;
                } else {
                    deformation.width = 0.9;
                    deformation.thinFactor = 0.9;
                }
        }

        // Clamp values
        deformation.width = Math.max(0.5, Math.min(2.0, deformation.width));
        deformation.bulgeFactor = Math.max(1.0, Math.min(2.0, deformation.bulgeFactor));
        deformation.thinFactor = Math.max(0.5, Math.min(1.0, deformation.thinFactor));
        deformation.spiralOffset = Math.max(-45, Math.min(45, deformation.spiralOffset));

        return deformation;
    }

    /**
     * Get twist sensitivity value for a shape type
     * @private
     */
    getTwistSensitivityForType(shapeType) {
        const sensitivities = {
            'extending_limb_muscle': 0.8,
            'compression_mass': 0.5,
            'rotation_joint': 1.2,
            'undulation_segment': 1.4,
            'propulsion_foot': 0.3,
            'balance_tail': 1.3,
            'flight_wing': 1.4
        };
        return sensitivities[shapeType] || 0.8;
    }

    /**
     * Interpolate between two values using specified mode
     * @private
     */
    interpolate(start, end, t, mode = 'cubic') {
        // Clamp t to 0-1
        t = Math.max(0, Math.min(1, t));

        switch (mode) {
            case 'linear':
                return start + (end - start) * t;
            
            case 'cubic':
                // Smootherstep: 6t^5 - 15t^4 + 10t^3
                const t3 = t * t * t;
                const t4 = t3 * t;
                const t5 = t4 * t;
                const smoothStep = 6 * t5 - 15 * t4 + 10 * t3;
                return start + (end - start) * smoothStep;
            
            case 'smoothstep':
                // Classic smoothstep: 3t^2 - 2t^3
                const u = t * t * (3 - 2 * t);
                return start + (end - start) * u;
            
            default:
                return start + (end - start) * t;
        }
    }

    /**
     * Apply deformation to all muscles in a creature
     * @param {Object} creature - Creature object with muscles and skeleton
     * @param {Map} forceMetricsMap - Map of muscleId -> forceMetrics (from ForceAnalyzer)
     * @returns {Map} Map of muscleId -> deformationParameters
     */
    applyAllDeformations(creature, forceMetricsMap) {
        if (!creature || !creature.muscles || !forceMetricsMap) {
            return new Map();
        }

        const deformations = new Map();
        for (const muscle of creature.muscles) {
            const forceMetrics = forceMetricsMap.get(muscle.id);
            if (!forceMetrics) continue;

            deformations.set(muscle.id, this.applyDeformationRules(muscle, forceMetrics));
        }
        return deformations;
    }

    /**
     * Safe default deformation parameters
     * @private
     */
    getSafeDefaults() {
        return {
            width: 1.0,          // Rest state
            bulgeFactor: 1.0,    // No bulge
            thinFactor: 1.0,     // No thinning
            spiralOffset: 0,     // No twist
            striations: false,   // No striations
            deformationIntensity: 0,
            shapeType: 'unknown'
        };
    }
}

// Export for use in other systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeformationEngine;
}
