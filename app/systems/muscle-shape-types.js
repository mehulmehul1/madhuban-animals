/**
 * Muscle Shape Types System
 * ========================
 * Defines 7 behavioral muscle types with deformation rules based on Mattesi force principles.
 * Each type specifies how muscles respond to stretch, compression, and twist forces.
 */

/**
 * MUSCLE_SHAPE_TYPES - Anatomically-informed muscle deformation behaviors
 * 
 * Each shape type defines:
 * - id: Unique identifier
 * - name: Display name
 * - deformationRules: How muscle responds to forces (bulge, thin, twist, striations)
 * - widthRange: [stretchWidth, restWidth, compressWidth] multipliers
 * - twistSensitivity: Multiplier for twist response (0.3-1.4 range)
 * 
 * @type {Object.<string, {
 *   id: string,
 *   name: string,
 *   deformationRules: {
 *     stretch: {widthMultiplier: number, thinFactor: number, addStriations: boolean},
 *     compress: {widthMultiplier: number, bulgeFactor: number, roundness: number},
 *     twist: {sensitivity: number, offsetFactor: number}
 *   },
 *   widthRange: {stretch: number, rest: number, compress: number},
 *   twistSensitivity: number
 * }>}
 */
const MUSCLE_SHAPE_TYPES = {
    // ========================================
    // TYPE 1: EXTENDING LIMB MUSCLE
    // ========================================
    // Muscles responsible for extending limbs (quadriceps, hamstrings, triceps)
    // Long, slender when stretched; bulges significantly when compressed
    extending_limb_muscle: {
        id: 'extending_limb_muscle',
        name: 'Extending Limb Muscle',
        deformationRules: {
            stretch: {
                widthMultiplier: 0.7,      // Becomes thin
                thinFactor: 0.8,            // Elongated appearance
                addStriations: true         // Visible muscle fibers under stretch
            },
            compress: {
                widthMultiplier: 1.2,       // Expands outward
                bulgeFactor: 1.3,           // Significant bulge at center
                roundness: 0.6              // Slightly rounded cross-section
            },
            twist: {
                sensitivity: 0.8,           // Moderate twist response
                offsetFactor: 0.4           // Offset along length
            }
        },
        widthRange: {
            stretch: 0.7,
            rest: 1.0,
            compress: 1.2
        },
        twistSensitivity: 0.8
    },

    // ========================================
    // TYPE 2: COMPRESSION MASS
    // ========================================
    // Muscles that provide power through compression (glutes, calves)
    // Thick, powerful; dramatically bulges when contracted
    compression_mass: {
        id: 'compression_mass',
        name: 'Compression Mass',
        deformationRules: {
            stretch: {
                widthMultiplier: 0.85,      // Somewhat thin
                thinFactor: 0.9,
                addStriations: false        // No striations in mass muscles
            },
            compress: {
                widthMultiplier: 1.4,       // Major expansion
                bulgeFactor: 1.5,           // Pronounced bulge
                roundness: 0.8              // Very rounded
            },
            twist: {
                sensitivity: 0.5,           // Lower twist response (massive)
                offsetFactor: 0.2           // Minimal offset
            }
        },
        widthRange: {
            stretch: 0.85,
            rest: 1.0,
            compress: 1.4
        },
        twistSensitivity: 0.5
    },

    // ========================================
    // TYPE 3: ROTATION JOINT MUSCLE
    // ========================================
    // Muscles that facilitate rotation (spinal rotators, shoulder stabilizers)
    // Twist significantly; moderate bulge
    rotation_joint: {
        id: 'rotation_joint',
        name: 'Rotation Joint Muscle',
        deformationRules: {
            stretch: {
                widthMultiplier: 0.75,
                thinFactor: 0.85,
                addStriations: true
            },
            compress: {
                widthMultiplier: 1.15,
                bulgeFactor: 1.2,
                roundness: 0.5
            },
            twist: {
                sensitivity: 1.4,           // HIGH twist response (rotator specialty)
                offsetFactor: 0.6           // Significant offset
            }
        },
        widthRange: {
            stretch: 0.75,
            rest: 1.0,
            compress: 1.15
        },
        twistSensitivity: 1.4
    },

    // ========================================
    // TYPE 4: BALANCE TAIL MUSCLE
    // ========================================
    // Muscles along tail for balance (tail stabilizers)
    // Flexible; distributes forces along length
    balance_tail: {
        id: 'balance_tail',
        name: 'Balance Tail Muscle',
        deformationRules: {
            stretch: {
                widthMultiplier: 0.8,
                thinFactor: 0.82,
                addStriations: false
            },
            compress: {
                widthMultiplier: 1.1,
                bulgeFactor: 1.15,
                roundness: 0.4
            },
            twist: {
                sensitivity: 1.0,           // Balanced twist
                offsetFactor: 0.5
            }
        },
        widthRange: {
            stretch: 0.8,
            rest: 1.0,
            compress: 1.1
        },
        twistSensitivity: 1.0
    },

    // ========================================
    // TYPE 5: UNDULATION SEGMENT
    // ========================================
    // Muscles that enable lateral undulation (serpentine/sprawling creatures)
    // Wave-like deformation; high twist sensitivity
    undulation_segment: {
        id: 'undulation_segment',
        name: 'Undulation Segment Muscle',
        deformationRules: {
            stretch: {
                widthMultiplier: 0.7,
                thinFactor: 0.75,
                addStriations: true
            },
            compress: {
                widthMultiplier: 1.25,
                bulgeFactor: 1.4,
                roundness: 0.7
            },
            twist: {
                sensitivity: 1.3,           // High for undulation
                offsetFactor: 0.7           // Large lateral offset
            }
        },
        widthRange: {
            stretch: 0.7,
            rest: 1.0,
            compress: 1.25
        },
        twistSensitivity: 1.3
    },

    // ========================================
    // TYPE 6: NECK FLEXOR MUSCLE
    // ========================================
    // Muscles for head/neck control (neck flexors, extensors)
    // Precise movement; moderate deformation
    neck_flexor: {
        id: 'neck_flexor',
        name: 'Neck Flexor Muscle',
        deformationRules: {
            stretch: {
                widthMultiplier: 0.72,
                thinFactor: 0.8,
                addStriations: true
            },
            compress: {
                widthMultiplier: 1.18,
                bulgeFactor: 1.25,
                roundness: 0.55
            },
            twist: {
                sensitivity: 1.1,           // Moderate twist
                offsetFactor: 0.45
            }
        },
        widthRange: {
            stretch: 0.72,
            rest: 1.0,
            compress: 1.18
        },
        twistSensitivity: 1.1
    },

    // ========================================
    // TYPE 7: STABILIZER MUSCLE
    // ========================================
    // Muscles for postural support and stability (deep core muscles)
    // Subtle deformation; very high precision
    stabilizer_muscle: {
        id: 'stabilizer_muscle',
        name: 'Stabilizer Muscle',
        deformationRules: {
            stretch: {
                widthMultiplier: 0.85,
                thinFactor: 0.9,
                addStriations: false
            },
            compress: {
                widthMultiplier: 1.08,      // Minimal bulge (deep muscle)
                bulgeFactor: 1.1,
                roundness: 0.3
            },
            twist: {
                sensitivity: 0.6,           // Low twist (stabilizers resist)
                offsetFactor: 0.15          // Minimal offset
            }
        },
        widthRange: {
            stretch: 0.85,
            rest: 1.0,
            compress: 1.08
        },
        twistSensitivity: 0.6
    },

    // ========================================
    // TYPE 8: PROPULSION FOOT MUSCLE
    // ========================================
    // Muscles at feet for ground contact and propulsion
    // Extreme compression response for power
    propulsion_foot: {
        id: 'propulsion_foot',
        name: 'Propulsion Foot Muscle',
        deformationRules: {
            stretch: {
                widthMultiplier: 0.6,
                thinFactor: 0.6,
                addStriations: false
            },
            compress: {
                widthMultiplier: 1.5,       // Extreme bulge on ground contact
                bulgeFactor: 1.5,
                roundness: 0.9
            },
            twist: {
                sensitivity: 0.3,           // Low twist sensitivity (linear motion)
                offsetFactor: 0.1
            }
        },
        widthRange: {
            stretch: 0.6,
            rest: 1.0,
            compress: 1.5
        },
        twistSensitivity: 0.3
    },

    // ========================================
    // TYPE 9: FLIGHT WING MUSCLE
    // ========================================
    // Muscles in wings for aerial locomotion
    // High twist for directional control, extreme stretch for aerodynamics
    flight_wing: {
        id: 'flight_wing',
        name: 'Flight Wing Muscle',
        deformationRules: {
            stretch: {
                widthMultiplier: 0.7,
                thinFactor: 0.7,
                addStriations: true         // Visible striations during flight
            },
            compress: {
                widthMultiplier: 1.2,
                bulgeFactor: 1.2,
                roundness: 0.5
            },
            twist: {
                sensitivity: 1.4,           // Very high for directional control
                offsetFactor: 0.8
            }
        },
        widthRange: {
            stretch: 0.7,
            rest: 1.0,
            compress: 1.2
        },
        twistSensitivity: 1.4
    },

    // ========================================
    // NEW MASS TYPES (Madhubani Style)
    // ========================================

    // SPHERE MASS (Joints, Cranium)
    mass_sphere: {
        id: 'mass_sphere',
        name: 'Sphere Mass',
        deformationRules: {
            stretch: { widthMultiplier: 0.9, thinFactor: 0.95, addStriations: false },
            compress: { widthMultiplier: 1.1, bulgeFactor: 1.1, roundness: 1.0 },
            twist: { sensitivity: 0.2, offsetFactor: 0.1 }
        },
        widthRange: { stretch: 0.9, rest: 1.0, compress: 1.1 },
        twistSensitivity: 0.2
    },

    // OVOID MASS (Torso, Pelvis)
    mass_ovoid: {
        id: 'mass_ovoid',
        name: 'Ovoid Mass',
        deformationRules: {
            stretch: { widthMultiplier: 0.8, thinFactor: 0.85, addStriations: false },
            compress: { widthMultiplier: 1.3, bulgeFactor: 1.4, roundness: 0.9 },
            twist: { sensitivity: 0.5, offsetFactor: 0.3 }
        },
        widthRange: { stretch: 0.8, rest: 1.0, compress: 1.3 },
        twistSensitivity: 0.5
    },

    // CYLINDER MASS (Limbs)
    mass_cylinder: {
        id: 'mass_cylinder',
        name: 'Cylinder Mass',
        deformationRules: {
            stretch: { widthMultiplier: 0.75, thinFactor: 0.8, addStriations: false },
            compress: { widthMultiplier: 1.2, bulgeFactor: 1.2, roundness: 0.7 },
            twist: { sensitivity: 0.8, offsetFactor: 0.5 }
        },
        widthRange: { stretch: 0.75, rest: 1.0, compress: 1.2 },
        twistSensitivity: 0.8
    },

    // SAUSAGE MASS (Flexible Torso, Tail)
    mass_sausage: {
        id: 'mass_sausage',
        name: 'Sausage Mass',
        deformationRules: {
            stretch: { widthMultiplier: 0.7, thinFactor: 0.75, addStriations: false },
            compress: { widthMultiplier: 1.25, bulgeFactor: 1.3, roundness: 0.8 },
            twist: { sensitivity: 1.2, offsetFactor: 0.6 }
        },
        widthRange: { stretch: 0.7, rest: 1.0, compress: 1.25 },
        twistSensitivity: 1.2
    }
};

/**
 * Helper: Get a shape type by ID
 * @param {string} shapeTypeId - The ID of the shape type
 * @returns {Object|null} The shape type definition or null
 */
function getShapeType(shapeTypeId) {
    return MUSCLE_SHAPE_TYPES[shapeTypeId] ?? null;
}

/**
 * Helper: Validate width range logic
 * Ensures stretch < rest < compress
 * @param {Object} shapeType - The shape type to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateShapeType(shapeType) {
    const w = shapeType.widthRange;
    return w.stretch < w.rest && w.rest < w.compress;
}

/**
 * Helper: Get all shape type IDs
 * @returns {Array<string>} Array of shape type IDs
 */
function getAllShapeTypeIds() {
    return Object.keys(MUSCLE_SHAPE_TYPES);
}
