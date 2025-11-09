/**
 * Muscle Mappings System
 * ======================
 * Maps anatomical body regions to muscle shape types for each locomotion type.
 * Defines which shape type is used in which body region for each creature locomotion pattern.
 */

/**
 * MUSCLE_MAPPINGS - Region-to-shape-type assignments per locomotion type
 * 
 * Structure: MUSCLE_MAPPINGS[locomotionType][regionName] = {
 *   shapeType: string (references MUSCLE_SHAPE_TYPES),
 *   baseWidth: number,
 *   sensitivity: number (0.5-2.0),
 *   attachmentPattern?: string (optional, for special attachments)
 * }
 * 
 * @type {Object.<string, Object.<string, {
 *   shapeType: string,
 *   baseWidth: number,
 *   sensitivity: number,
 *   attachmentPattern?: string
 * }>>}
 */
const MUSCLE_MAPPINGS = {
    // ========================================
    // ERECT QUADRUPED (Horse, Deer, etc.)
    // ========================================
    // Legs under body, powerful hindquarters, vertical-plane locomotion
    erect_quadruped: {
        front_left_limb: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 14,
            sensitivity: 1.2,
            description: 'Quadriceps-like extension'
        },
        front_left_flexor: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 12,
            sensitivity: 1.0,
            description: 'Biceps-like flexion'
        },
        front_right_limb: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 14,
            sensitivity: 1.2
        },
        front_right_flexor: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 12,
            sensitivity: 1.0
        },
        hind_left_limb: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 16,
            sensitivity: 1.3,
            description: 'Extensor (powerful push)'
        },
        hind_left_compression: {
            shapeType: 'compression_mass',
            baseWidth: 18,
            sensitivity: 1.0,
            attachmentPattern: 'spine_to_femur',
            description: 'Gluteus-like power muscle'
        },
        hind_right_limb: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 16,
            sensitivity: 1.3
        },
        hind_right_compression: {
            shapeType: 'compression_mass',
            baseWidth: 18,
            sensitivity: 1.0,
            attachmentPattern: 'spine_to_femur'
        },
        spine: {
            shapeType: 'rotation_joint',
            baseWidth: 20,
            sensitivity: 0.8,
            description: 'Spinal extensors (posture)'
        },
        neck: {
            shapeType: 'neck_flexor',
            baseWidth: 11,
            sensitivity: 0.9,
            description: 'Neck control'
        },
        tail: {
            shapeType: 'balance_tail',
            baseWidth: 16,
            sensitivity: 1.2,
            description: 'Tail balance'
        }
    },

    // ========================================
    // SPRAWLING QUADRUPED (Lizard, Crocodile, etc.)
    // ========================================
    // Legs splayed outward, lateral undulation, low stance
    sprawling_quadruped: {
        front_left_limb: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 12,
            sensitivity: 1.1,
            description: 'Extended outward'
        },
        front_left_lateral: {
            shapeType: 'undulation_segment',
            baseWidth: 13,
            sensitivity: 1.2,
            description: 'Lateral pull'
        },
        front_right_limb: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 12,
            sensitivity: 1.1
        },
        front_right_lateral: {
            shapeType: 'undulation_segment',
            baseWidth: 13,
            sensitivity: 1.2
        },
        hind_left_limb: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 13,
            sensitivity: 1.15
        },
        hind_left_lateral: {
            shapeType: 'undulation_segment',
            baseWidth: 14,
            sensitivity: 1.3,
            description: 'Powerful lateral push'
        },
        hind_right_limb: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 13,
            sensitivity: 1.15
        },
        hind_right_lateral: {
            shapeType: 'undulation_segment',
            baseWidth: 14,
            sensitivity: 1.3
        },
        spine: {
            shapeType: 'undulation_segment',
            baseWidth: 18,
            sensitivity: 1.3,
            description: 'Main undulation driver'
        },
        tail: {
            shapeType: 'undulation_segment',
            baseWidth: 16,
            sensitivity: 1.4,
            description: 'Tail wave (balance + propulsion)'
        }
    },

    // ========================================
    // BIPEDAL (Crane, Ostrich, etc.)
    // ========================================
    // Two legs under body, powerful tail for balance, vertical spine
    bipedal: {
        left_limb: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 18,
            sensitivity: 1.3,
            description: 'Powerful leg extension'
        },
        left_flexor: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 15,
            sensitivity: 1.1,
            description: 'Hip flexor (high step)'
        },
        right_limb: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 18,
            sensitivity: 1.3
        },
        right_flexor: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 15,
            sensitivity: 1.1
        },
        spine: {
            shapeType: 'rotation_joint',
            baseWidth: 22,
            sensitivity: 0.7,
            description: 'Vertical alignment'
        },
        tail: {
            shapeType: 'balance_tail',
            baseWidth: 20,
            sensitivity: 1.3,
            description: 'Critical balance organ'
        },
        neck: {
            shapeType: 'neck_flexor',
            baseWidth: 12,
            sensitivity: 1.0
        }
    },

    // ========================================
    // SERPENTINE (Snake, Eel, etc.)
    // ========================================
    // No limbs, pure lateral undulation
    serpentine: {
        spine: {
            shapeType: 'undulation_segment',
            baseWidth: 16,
            sensitivity: 1.4,
            description: 'Main locomotion driver'
        },
        spine_deep: {
            shapeType: 'stabilizer_muscle',
            baseWidth: 12,
            sensitivity: 0.8,
            description: 'Deep core stability'
        },
        head: {
            shapeType: 'neck_flexor',
            baseWidth: 10,
            sensitivity: 1.2,
            description: 'Head steering'
        }
    },

    // ========================================
    // AQUATIC (Fish, Whale, etc.)
    // ========================================
    // Flexible spine, tail-driven locomotion
    aquatic: {
        spine: {
            shapeType: 'undulation_segment',
            baseWidth: 17,
            sensitivity: 1.3,
            description: 'Wave propagation'
        },
        tail: {
            shapeType: 'undulation_segment',
            baseWidth: 18,
            sensitivity: 1.4,
            description: 'Primary thrust'
        },
        pectoral_fins: {
            shapeType: 'extending_limb_muscle',
            baseWidth: 8,
            sensitivity: 0.9,
            description: 'Steering/braking'
        },
        dorsal_fin: {
            shapeType: 'stabilizer_muscle',
            baseWidth: 6,
            sensitivity: 0.6,
            description: 'Stability'
        }
    }
};

/**
 * Helper: Get the mapping for a specific locomotion type
 * @param {string} locomotionType - Type of locomotion (e.g., 'erect_quadruped')
 * @returns {Object|null} The mapping object or null
 */
function getLocomotionMapping(locomotionType) {
    return MUSCLE_MAPPINGS[locomotionType] ?? null;
}

/**
 * Helper: Get the shape type for a region in a locomotion type
 * @param {string} locomotionType - Type of locomotion
 * @param {string} regionName - Region name (e.g., 'front_left_limb')
 * @returns {Object|null} The region config or null
 */
function getRegionConfig(locomotionType, regionName) {
    return MUSCLE_MAPPINGS[locomotionType]?.[regionName] ?? null;
}

/**
 * Helper: Get all regions for a locomotion type
 * @param {string} locomotionType - Type of locomotion
 * @returns {Array<string>} Array of region names
 */
function getRegionsForLocomotionType(locomotionType) {
    const mapping = MUSCLE_MAPPINGS[locomotionType];
    return mapping ? Object.keys(mapping) : [];
}

/**
 * Helper: Get all locomotion types
 * @returns {Array<string>} Array of locomotion type IDs
 */
function getAllLocomotionTypes() {
    return Object.keys(MUSCLE_MAPPINGS);
}

/**
 * Validates that all referenced shape types exist in MUSCLE_SHAPE_TYPES
 * @returns {Object} Validation report {valid: boolean, missingTypes: Array}
 */
function validateMuscleMapping() {
    const missingTypes = new Set();
    
    Object.entries(MUSCLE_MAPPINGS).forEach(([locomotionType, regions]) => {
        Object.entries(regions).forEach(([regionName, config]) => {
            if (!MUSCLE_SHAPE_TYPES[config.shapeType]) {
                missingTypes.add(config.shapeType);
            }
        });
    });
    
    return {
        valid: missingTypes.size === 0,
        missingTypes: Array.from(missingTypes),
        locomotionTypesCount: Object.keys(MUSCLE_MAPPINGS).length
    };
}
