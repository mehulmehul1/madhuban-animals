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
        // FRONT LEGS
        front_left_limb: {
            shapeType: 'mass_cylinder',
            baseWidth: 14,
            sensitivity: 1.2,
            description: 'Upper leg mass'
        },
        front_left_flexor: {
            shapeType: 'mass_ovoid',
            baseWidth: 12,
            sensitivity: 1.0,
            description: 'Shoulder/Chest mass'
        },
        front_right_limb: {
            shapeType: 'mass_cylinder',
            baseWidth: 14,
            sensitivity: 1.2
        },
        front_right_flexor: {
            shapeType: 'mass_ovoid',
            baseWidth: 12,
            sensitivity: 1.0
        },
        // HIND LEGS
        hind_left_limb: {
            shapeType: 'mass_cylinder',
            baseWidth: 16,
            sensitivity: 1.3,
            description: 'Hind leg mass'
        },
        hind_left_compression: {
            shapeType: 'mass_ovoid',
            baseWidth: 20,
            sensitivity: 1.0,
            attachmentPattern: 'spine_to_femur',
            description: 'Gluteal mass'
        },
        hind_right_limb: {
            shapeType: 'mass_cylinder',
            baseWidth: 16,
            sensitivity: 1.3
        },
        hind_right_compression: {
            shapeType: 'mass_ovoid',
            baseWidth: 20,
            sensitivity: 1.0,
            attachmentPattern: 'spine_to_femur'
        },
        // NEW: Main Torso Coverage (was missing!)
        chest: {
            shapeType: 'mass_ovoid',
            baseWidth: 35,
            sensitivity: 0.9,
            description: 'Chest and ribcage mass'
        },
        ribcage: {
            shapeType: 'mass_ovoid',
            baseWidth: 30,
            sensitivity: 0.7,
            description: 'Ribcage and organ cavity'
        },
        thorax: {
            shapeType: 'mass_sausage',
            baseWidth: 28,
            sensitivity: 0.8,
            description: 'Thoracic spine mass'
        },
        abdomen: {
            shapeType: 'mass_sausage',
            baseWidth: 26,
            sensitivity: 0.9,
            description: 'Abdominal cavity'
        },
        // ORIGINAL REGIONS
        spine: {
            shapeType: 'mass_sausage',
            baseWidth: 22,
            sensitivity: 0.8,
            description: 'Main torso mass'
        },
        neck: {
            shapeType: 'mass_cylinder',
            baseWidth: 12,
            sensitivity: 0.9,
            description: 'Neck cylinder'
        },
        tail: {
            shapeType: 'mass_sausage',
            baseWidth: 14,
            sensitivity: 1.2,
            description: 'Tail taper'
        }
    },

    // ========================================
    // SPRAWLING QUADRUPED (Lizard, Crocodile, etc.)
    // ========================================
    // Legs splayed outward, lateral undulation, low stance
    sprawling_quadruped: {
        // FRONT LEGS
        front_left_limb: {
            shapeType: 'mass_cylinder',
            baseWidth: 10,
            sensitivity: 1.1,
            description: 'Limb cylinder'
        },
        front_left_lateral: {
            shapeType: 'mass_ovoid',
            baseWidth: 12,
            sensitivity: 1.2,
            description: 'Shoulder mass'
        },
        front_right_limb: {
            shapeType: 'mass_cylinder',
            baseWidth: 10,
            sensitivity: 1.1
        },
        front_right_lateral: {
            shapeType: 'mass_ovoid',
            baseWidth: 12,
            sensitivity: 1.2
        },
        // HIND LEGS
        hind_left_limb: {
            shapeType: 'mass_cylinder',
            baseWidth: 11,
            sensitivity: 1.15
        },
        hind_left_lateral: {
            shapeType: 'mass_ovoid',
            baseWidth: 14,
            sensitivity: 1.3,
            description: 'Hip mass'
        },
        hind_right_limb: {
            shapeType: 'mass_cylinder',
            baseWidth: 11,
            sensitivity: 1.15
        },
        hind_right_lateral: {
            shapeType: 'mass_ovoid',
            baseWidth: 14,
            sensitivity: 1.3
        },
        // NEW: Full Body Coverage (was missing!)
        torso: {
            shapeType: 'mass_sausage',
            baseWidth: 24,
            sensitivity: 1.1,
            description: 'Main body mass'
        },
        thorax: {
            shapeType: 'mass_sausage',
            baseWidth: 20,
            sensitivity: 1.0,
            description: 'Chest cavity'
        },
        abdomen: {
            shapeType: 'mass_sausage',
            baseWidth: 22,
            sensitivity: 1.2,
            description: 'Abdominal cavity'
        },
        pelvis: {
            shapeType: 'mass_ovoid',
            baseWidth: 18,
            sensitivity: 1.1,
            description: 'Pelvic region'
        },
        // ORIGINAL REGIONS
        spine: {
            shapeType: 'mass_sausage',
            baseWidth: 16,
            sensitivity: 1.3,
            description: 'Flexible torso'
        },
        tail: {
            shapeType: 'mass_sausage',
            baseWidth: 12,
            sensitivity: 1.4,
            description: 'Tail taper'
        }
    },

    // ========================================
    // BIPEDAL (Crane, Ostrich, etc.)
    // ========================================
    // Two legs under body, powerful tail for balance, vertical spine
    bipedal: {
        left_limb: {
            shapeType: 'mass_cylinder',
            baseWidth: 14,
            sensitivity: 1.3,
            description: 'Leg cylinder'
        },
        left_flexor: {
            shapeType: 'mass_ovoid',
            baseWidth: 16,
            sensitivity: 1.1,
            description: 'Thigh mass'
        },
        right_limb: {
            shapeType: 'mass_cylinder',
            baseWidth: 14,
            sensitivity: 1.3
        },
        right_flexor: {
            shapeType: 'mass_ovoid',
            baseWidth: 16,
            sensitivity: 1.1
        },
        spine: {
            shapeType: 'mass_ovoid',
            baseWidth: 24,
            sensitivity: 0.7,
            description: 'Main body mass'
        },
        tail: {
            shapeType: 'mass_sausage',
            baseWidth: 18,
            sensitivity: 1.3,
            description: 'Tail mass'
        },
        neck: {
            shapeType: 'mass_cylinder',
            baseWidth: 10,
            sensitivity: 1.0
        }
    },

    // ========================================
    // SERPENTINE (Snake, Eel, etc.)
    // ========================================
    // No limbs, pure lateral undulation
    serpentine: {
        spine: {
            shapeType: 'mass_sausage',
            baseWidth: 16,
            sensitivity: 1.4,
            description: 'Body segment'
        },
        spine_deep: {
            shapeType: 'mass_cylinder',
            baseWidth: 12,
            sensitivity: 0.8,
            description: 'Inner core'
        },
        head: {
            shapeType: 'mass_sphere',
            baseWidth: 14,
            sensitivity: 1.2,
            description: 'Head mass'
        }
    },

    // ========================================
    // AQUATIC (Fish, Whale, etc.)
    // ========================================
    // Flexible spine, tail-driven locomotion
    aquatic: {
        spine: {
            shapeType: 'mass_sausage',
            baseWidth: 18,
            sensitivity: 1.3,
            description: 'Body mass'
        },
        tail: {
            shapeType: 'mass_sausage',
            baseWidth: 16,
            sensitivity: 1.4,
            description: 'Tail mass'
        },
        pectoral_fins: {
            shapeType: 'mass_ovoid',
            baseWidth: 8,
            sensitivity: 0.9,
            description: 'Fin base'
        },
        dorsal_fin: {
            shapeType: 'mass_ovoid',
            baseWidth: 6,
            sensitivity: 0.6,
            description: 'Fin base'
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

/**
 * Muscle Generation Strategies Configuration
 * Maps anatomical roles to generation strategies with meaningful parameters.
 */
window.MUSCLE_STRATEGIES = {
  'spine': { 
    type: 'mass', 
    mergeCount: 4, 
    shape: 'mass_sausage',  // Changed from 'circle-chain'
    baseWidth: 22,
    taper: 0.7,
    bulgeSensitivity: 0.8
  },
  'body': { 
    type: 'mass', 
    mergeCount: 3, 
    shape: 'mass_sausage',  // Changed from 'circle-chain'
    baseWidth: 22,
    taper: 0.6,
    bulgeSensitivity: 0.8
  },
  'mantle': { 
    type: 'mass', 
    mergeCount: 2, 
    shape: 'mass_ovoid',  // Changed from 'circle-chain'
    baseWidth: 16,
    taper: 0.8,
    bulgeSensitivity: 1.1
  },
  'neck': { 
    type: 'mass', 
    mergeCount: 2, 
    shape: 'mass_cylinder',  // Changed from 'circle-chain'
    baseWidth: 12,
    taper: 0.9,
    bulgeSensitivity: 0.9
  },
  'leg': { 
    type: 'limb', 
    shape: 'mass_cylinder',  // Changed from 'spindle'
    baseWidth: 14,
    bulgeSensitivity: 1.2
  },
  'arm': { 
    type: 'segment', 
    shape: 'mass_sausage',  // Changed from 'circle-segment'
    baseWidth: 10,
    overlapFactor: 0.7,
    bulgeSensitivity: 0.7
  },
  'tentacle': { 
    type: 'segment', 
    shape: 'mass_sausage',  // Changed from 'circle-segment'
    baseWidth: 8,
    overlapFactor: 0.8,
    bulgeSensitivity: 0.6
  },
  'tail': { 
    type: 'segment', 
    shape: 'mass_sausage',  // Changed from 'circle-segment'
    baseWidth: 14,
    overlapFactor: 0.7,
    bulgeSensitivity: 1.2
  },
  'default': { 
    type: 'segment', 
    shape: 'mass_cylinder',  // Changed from 'circle-segment'
    baseWidth: 10,
    overlapFactor: 0.7,
    bulgeSensitivity: 0.7
  }
};

