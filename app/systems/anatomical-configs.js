/**
 * Anatomical Configuration System for Madhuban Creatures
 * Centralizes all posture-specific and anatomical parameters
 * Defines the key differences between erect and sprawling postures
 */

/**
 * Anatomical configuration data for different creature types.
 * Each creature type has a nested object containing configuration data.
 *
 * @type {Object.<string, {
 *   postureType: string,
 *   bodyHeight: number,
 *   bodyLength: number,
 *   legPositioning: {
 *     spacing: number,
 *     angle: number,
 *     attachment: string,
 *     shoulderHipDistance: number,
 *     groundClearance: number
 *   },
 *   spineCharacteristics: {
 *     flexibility: number,
 *     segments: number,
 *     undulationEnabled: boolean,
 *     verticalFlex: number,
 *     lateralFlex: number,
 *     undulationAmplitude: number,
 *     undulationFrequency: number
 *   },
 *   jointOverrides: {
 *     [jointName: string]: {
 *       abductionLimit: number,
 *       verticalBias: number
 *     }
 *   },
 *   gaitParameters: {
 *     defaultGait: string,
 *     stepHeight: number,
 *     strideLength: number,
 *     bodyRoll: number,
 *     bodyPitch: number,
 *     powerfulHindquarters: boolean,
 *     hoofStrike: boolean,
 *     lateralThrust: boolean,
 *     dragStep: boolean,
 *     tailAssist: boolean
 *   },
 *   visualProfile: {
 *     legThickness: number,
 *     bodyMassDistribution: string,
 *     shoulderBulk: number,
 *     hindquarterBulk: number,
 *     tailThickness: number
 *   }
 * }>}
 */
const ANATOMICAL_CONFIGS = {
    horse: {
        // ERECT QUADRUPED CONFIGURATION
        postureType: 'erect',
        
        // Body positioning
        bodyHeight: 120,              // High off ground
        bodyLength: 200,
        
        // Leg positioning - legs positioned under the body
        legPositioning: {
            spacing: 40,              // Distance from body centerline (narrow)
            angle: 0,                 // Vertical alignment (0 degrees from vertical)
            attachment: 'under',      // Attachment point relative to body
            shoulderHipDistance: 80,  // Front-to-back spacing
            groundClearance: 120      // Height from ground to body
        },
        
        // Spine characteristics
        spineCharacteristics: {
            flexibility: 0.1,         // Very rigid spine (0.0 = rigid, 1.0 = very flexible)
            segments: 8,
            undulationEnabled: false,
            verticalFlex: 0.2,        // Limited vertical flexibility for gallop
            lateralFlex: 0.05         // Minimal lateral flexibility
        },
        
        // Joint constraints override
        jointOverrides: {
            shoulder: {
                abductionLimit: 30,   // Limited outward movement
                verticalBias: 0.1     // Strong preference for vertical plane
            },
            hip: {
                abductionLimit: 25,
                verticalBias: 0.9
            }
        },
        
        // Gait parameters
        gaitParameters: {
            defaultGait: 'walk',
            stepHeight: 30,           // High step clearance
            strideLength: 80,
            bodyRoll: 0.1,           // Minimal body roll
            bodyPitch: 0.2,          // Some forward/back tilt
            powerfulHindquarters: true,
            hoofStrike: true         // Distinct hoof impact
        },
        
        // Visual characteristics
        visualProfile: {
            legThickness: 1.0,       // Normal thickness
            bodyMassDistribution: 'balanced',
            shoulderBulk: 1.2,       // Powerful shoulders
            hindquarterBulk: 1.3     // Strong hindquarters
        }
    },
    
    lizard: {
        // SPRAWLING QUADRUPED CONFIGURATION
        postureType: 'sprawling',
        
        // Body positioning
        bodyHeight: 60,              // Low to ground
        bodyLength: 180,
        
        // Leg positioning - legs splayed outward from body
        legPositioning: {
            spacing: 80,             // Distance from body centerline (wide)
            angle: 45,               // Splayed outward at 45 degrees
            attachment: 'side',      // Attachment point on side of body
            shoulderHipDistance: 100, // Longer body relative to leg spacing
            groundClearance: 60      // Low ground clearance
        },
        
        // Spine characteristics
        spineCharacteristics: {
            flexibility: 0.8,        // Highly flexible spine
            segments: 15,            // More segments for flexibility
            undulationEnabled: true, // Lateral undulation for locomotion
            verticalFlex: 0.3,       // Moderate vertical flexibility
            lateralFlex: 0.9,        // High lateral flexibility
            undulationAmplitude: 15, // Lateral wave amplitude
            undulationFrequency: 1.5 // Wave frequency
        },
        
        // Joint constraints override
        jointOverrides: {
            shoulder: {
                abductionLimit: 90,  // Wide lateral movement
                verticalBias: 0.2    // Mostly horizontal plane movement
            },
            hip: {
                abductionLimit: 85,
                verticalBias: 0.2
            }
        },
        
        // Gait parameters
        gaitParameters: {
            defaultGait: 'sprawling-walk',
            stepHeight: 10,          // Minimal ground clearance
            strideLength: 50,        // Shorter strides
            bodyRoll: 0.4,          // Significant side-to-side roll
            bodyPitch: 0.1,         // Minimal forward/back tilt
            lateralThrust: true,    // Push with body sides
            dragStep: true,         // Feet may drag
            tailAssist: true        // Tail helps with balance/propulsion
        },
        
        // Visual characteristics
        visualProfile: {
            legThickness: 0.7,      // Thinner legs
            bodyMassDistribution: 'elongated',
            shoulderBulk: 0.8,      // Less shoulder mass
            tailThickness: 0.9      // Substantial tail
        }
    },
    
    // Default configs for other creatures
    fish: {
        postureType: 'aquatic',
        spineCharacteristics: {
            flexibility: 0.9,
            segments: 8,
            undulationEnabled: true
        }
    },
    
    crane: {
        postureType: 'bipedal', 
        legPositioning: {
            spacing: 30,
            shoulderHipDistance: 60
        },
        spineCharacteristics: {
            flexibility: 0.4,
            segments: 5
        },
        gaitParameters: {
            stepHeight: 30
        }
    },
    
    snake: {
        postureType: 'serpentine',
        spineCharacteristics: {
            flexibility: 1.0,
            segments: 25,
            undulationEnabled: true
        }
    }
};

// Helper functions for accessing configurations

/**
 * Retrieves the full anatomical configuration for a given creature type.
 * @param {string} creatureType - The type of creature (e.g., 'horse', 'lizard').
 * @returns {object|null} The configuration object or null if not found.
 */
function getAnatomicalConfig(creatureType) {
    return ANATOMICAL_CONFIGS[creatureType] || null;
}

/**
 * Retrieves a specific property from a creature's anatomical configuration.
 * This function replaces the need for multiple specific getter functions.
 *
 * @param {string} creatureType - The type of creature (e.g., 'horse', 'lizard').
 * @param {string} propertyKey - The key of the property to retrieve (e.g., 'postureType', 'legPositioning').
 * @returns {any|null} The value of the property, or null if the creature or property doesn't exist.
 */
function getCreatureProperty(creatureType, propertyKey) {
    // Optional chaining (?.) safely accesses nested properties.
    // The nullish coalescing operator (??) then converts undefined to null for consistency.
    return ANATOMICAL_CONFIGS[creatureType]?.[propertyKey] ?? null;
}

// Export for use in other modules (if using modules)
// You would now export getCreatureProperty instead of the individual getters.
// export { ANATOMICAL_CONFIGS, getAnatomicalConfig, getCreatureProperty };

const ANATOMICAL_PROPORTIONS = {
    horse: {
        // Based on real equine anatomy
        legSegments: {
            femur: 0.30,        // 30% of total leg
            tibia: 0.35,        // 35% of total leg  
            cannon: 0.25,       // 25% of total leg (cannon bone)
            hoof: 0.10          // 10% of total leg
        },
        spineSegments: {
            neck: 0.25,         // 25% of spine
            thorax: 0.45,       // 45% of spine (rigid)
            lumbar: 0.20,       // 20% of spine
            pelvis: 0.10        // 10% of spine
        }
    },
    lizard: {
        // Based on real reptilian anatomy
        legSegments: {
            femur: 0.35,        // Shorter, more robust
            tibia: 0.40,
            foot: 0.25          // Full foot contact
        },
        spineSegments: {
            cervical: 0.15,     // 15% of spine
            thorax: 0.35,       // 35% of spine (flexible)
            lumbar: 0.30,       // 30% of spine (very flexible)
            tail: 0.20          // 20% of spine (long tail)
        }
    }
};

/**
 * DEPRECATED: MUSCLE LAYER - Legacy Hardcoded System
 * ===================================================
 * 
 * PHASE 1 v2 REFACTORING:
 * This section is DEPRECATED as of Phase 1 v2 refactoring.
 * Muscles are now AUTO-GENERATED using:
 * - muscle-shape-types.js (behavioral definitions)
 * - muscle-mappings.js (region assignments)
 * - muscle-generator.js (auto-generation algorithm)
 * 
 * Legacy MUSCLE_TEMPLATES below are kept for reference only.
 * New creatures should use generateMusclesTours(creatureName, skeleton, locomotionType)
 * 
 * TODO: Archive this file section after full migration to auto-generation.
 * 
 * @deprecated Use generateMusclesTours() from muscle-generator.js instead
 */

const MUSCLE_TEMPLATES_LEGACY = {
    horse: {
        muscle_templates: [
            // FRONT LEGS - Left
            {
                id: 'frontLeftQuadriceps',
                name: 'Front Left Quadriceps',
                startJoint: 'frontLeftShoulder',
                endJoint: 'frontLeftTibia',
                restLength: 110,
                restAngle: -75,
                width: 18,
                sensitivity: 1.2,
                group: 'frontLeftLeg'
            },
            {
                id: 'frontLeftBiceps',
                name: 'Front Left Biceps',
                startJoint: 'frontLeftShoulder',
                endJoint: 'frontLeftForearm',
                restLength: 85,
                restAngle: -70,
                width: 14,
                sensitivity: 1.1,
                group: 'frontLeftLeg'
            },
            // FRONT LEGS - Right
            {
                id: 'frontRightQuadriceps',
                name: 'Front Right Quadriceps',
                startJoint: 'frontRightShoulder',
                endJoint: 'frontRightTibia',
                restLength: 110,
                restAngle: -75,
                width: 18,
                sensitivity: 1.2,
                group: 'frontRightLeg'
            },
            {
                id: 'frontRightBiceps',
                name: 'Front Right Biceps',
                startJoint: 'frontRightShoulder',
                endJoint: 'frontRightForearm',
                restLength: 85,
                restAngle: -70,
                width: 14,
                sensitivity: 1.1,
                group: 'frontRightLeg'
            },
            // HIND LEGS - Left
            {
                id: 'hindLeftGluteus',
                name: 'Hind Left Gluteus Maximus',
                startJoint: 'spine2',
                endJoint: 'hindLeftFemur',
                restLength: 120,
                restAngle: -60,
                width: 20,
                sensitivity: 1.4,
                group: 'hindLeftLeg'
            },
            {
                id: 'hindLeftHamstring',
                name: 'Hind Left Hamstring',
                startJoint: 'hindLeftFemur',
                endJoint: 'hindLeftTibia',
                restLength: 95,
                restAngle: -80,
                width: 16,
                sensitivity: 1.3,
                group: 'hindLeftLeg'
            },
            // HIND LEGS - Right
            {
                id: 'hindRightGluteus',
                name: 'Hind Right Gluteus Maximus',
                startJoint: 'spine2',
                endJoint: 'hindRightFemur',
                restLength: 120,
                restAngle: -60,
                width: 20,
                sensitivity: 1.4,
                group: 'hindRightLeg'
            },
            {
                id: 'hindRightHamstring',
                name: 'Hind Right Hamstring',
                startJoint: 'hindRightFemur',
                endJoint: 'hindRightTibia',
                restLength: 95,
                restAngle: -80,
                width: 16,
                sensitivity: 1.3,
                group: 'hindRightLeg'
            },
            // SPINE & CORE
            {
                id: 'spineErector',
                name: 'Spine Erector Muscles',
                startJoint: 'spine0',
                endJoint: 'spine3',
                restLength: 140,
                restAngle: 0,
                width: 22,
                sensitivity: 0.8,
                group: 'spine'
            },
            {
                id: 'abdominals',
                name: 'Abdominal Muscles',
                startJoint: 'spine1',
                endJoint: 'spine3',
                restLength: 130,
                restAngle: 0,
                width: 20,
                sensitivity: 0.9,
                group: 'spine'
            },
            // NECK
            {
                id: 'neckFlexor',
                name: 'Neck Flexor',
                startJoint: 'spine0',
                endJoint: 'neckBase',
                restLength: 60,
                restAngle: -45,
                width: 12,
                sensitivity: 1.0,
                group: 'neck'
            }
        ]
    },
    
    lizard: {
        muscle_templates: [
            // FRONT LEGS - Left
            {
                id: 'frontLeftLateralFlexor',
                name: 'Front Left Lateral Flexor',
                startJoint: 'spine1',
                endJoint: 'frontLeftFemur',
                restLength: 95,
                restAngle: 0,
                width: 14,
                sensitivity: 1.1,
                group: 'frontLeftLeg'
            },
            {
                id: 'frontLeftExtensor',
                name: 'Front Left Extensor',
                startJoint: 'frontLeftFemur',
                endJoint: 'frontLeftTibia',
                restLength: 80,
                restAngle: 45,
                width: 12,
                sensitivity: 1.0,
                group: 'frontLeftLeg'
            },
            // FRONT LEGS - Right
            {
                id: 'frontRightLateralFlexor',
                name: 'Front Right Lateral Flexor',
                startJoint: 'spine1',
                endJoint: 'frontRightFemur',
                restLength: 95,
                restAngle: 180,
                width: 14,
                sensitivity: 1.1,
                group: 'frontRightLeg'
            },
            {
                id: 'frontRightExtensor',
                name: 'Front Right Extensor',
                startJoint: 'frontRightFemur',
                endJoint: 'frontRightTibia',
                restLength: 80,
                restAngle: 135,
                width: 12,
                sensitivity: 1.0,
                group: 'frontRightLeg'
            },
            // HIND LEGS - Left
            {
                id: 'hindLeftLateralFlexor',
                name: 'Hind Left Lateral Flexor',
                startJoint: 'spine2',
                endJoint: 'hindLeftFemur',
                restLength: 100,
                restAngle: 0,
                width: 15,
                sensitivity: 1.2,
                group: 'hindLeftLeg'
            },
            {
                id: 'hindLeftExtensor',
                name: 'Hind Left Extensor',
                startJoint: 'hindLeftFemur',
                endJoint: 'hindLeftTibia',
                restLength: 85,
                restAngle: 45,
                width: 13,
                sensitivity: 1.1,
                group: 'hindLeftLeg'
            },
            // HIND LEGS - Right
            {
                id: 'hindRightLateralFlexor',
                name: 'Hind Right Lateral Flexor',
                startJoint: 'spine2',
                endJoint: 'hindRightFemur',
                restLength: 100,
                restAngle: 180,
                width: 15,
                sensitivity: 1.2,
                group: 'hindRightLeg'
            },
            {
                id: 'hindRightExtensor',
                name: 'Hind Right Extensor',
                startJoint: 'hindRightFemur',
                endJoint: 'hindRightTibia',
                restLength: 85,
                restAngle: 135,
                width: 13,
                sensitivity: 1.1,
                group: 'hindRightLeg'
            },
            // SPINE - Lateral undulation muscles
            {
                id: 'spineUndulator',
                name: 'Spine Undulator (Lateral)',
                startJoint: 'spine0',
                endJoint: 'spine3',
                restLength: 160,
                restAngle: 0,
                width: 18,
                sensitivity: 1.3,
                group: 'spine'
            },
            // TAIL
            {
                id: 'tailBase',
                name: 'Tail Base Muscles',
                startJoint: 'spine3',
                endJoint: 'tailSegment1',
                restLength: 75,
                restAngle: 0,
                width: 16,
                sensitivity: 1.4,
                group: 'tail'
            }
        ]
    }
};

// ============================================
// MUSCLE ACCESSOR API - PHASE 1 v2 REFACTORED
// ============================================

/**
 * Initialize creature musculature using auto-generation
 * This is the NEW Phase 1 v2 approach (replaces hardcoded muscles)
 * 
 * @param {string} creatureName - Name of the creature
 * @param {Object} skeleton - Skeleton object with bones
 * @param {string} locomotionType - Locomotion type (e.g., 'erect_quadruped')
 * @returns {Array} Auto-generated muscle array
 */
function initializeCreatureMusculature(creatureName, skeleton, locomotionType) {
    try {
        const muscles = generateMusclesTours(creatureName, skeleton, locomotionType);
        console.log(`✓ Auto-generated ${muscles.length} muscles for ${creatureName} (${locomotionType})`);
        return muscles;
    } catch (error) {
        console.error(`Failed to auto-generate muscles for ${creatureName}:`, error);
        return [];
    }
}

/**
 * LEGACY: Retrieves all muscle templates for a given creature type.
 * @deprecated Use initializeCreatureMusculature() instead
 * @param {string} creatureType - The type of creature (e.g., 'horse', 'lizard').
 * @returns {Array|null} Array of muscle template objects, or null if creature not found.
 */
function getAllMuscles(creatureType) {
    return MUSCLE_TEMPLATES_LEGACY[creatureType]?.muscle_templates ?? null;
}

/**
 * LEGACY: Retrieves a specific muscle template by muscle ID.
 * @deprecated Use initializeCreatureMusculature() instead
 * @param {string} creatureType - The type of creature.
 * @param {string} muscleId - The muscle ID (e.g., 'frontLeftQuadriceps').
 * @returns {Object|null} The muscle template object, or null if not found.
 */
function getMuscleTemplate(creatureType, muscleId) {
    const muscles = MUSCLE_TEMPLATES_LEGACY[creatureType]?.muscle_templates ?? [];
    return muscles.find(m => m.id === muscleId) ?? null;
}

/**
 * LEGACY: Retrieves all muscles in a given group (e.g., 'frontLeftLeg', 'spine').
 * @deprecated Use initializeCreatureMusculature() instead
 * @param {string} creatureType - The type of creature.
 * @param {string} groupName - The muscle group name.
 * @returns {Array} Array of muscle templates in the group, or empty array if not found.
 */
function getMusclesByGroup(creatureType, groupName) {
    const muscles = MUSCLE_TEMPLATES_LEGACY[creatureType]?.muscle_templates ?? [];
    return muscles.filter(m => m.group === groupName);
}

/**
 * Validates that all referenced joints in muscle templates exist in the creature's skeleton.
 * Works with both auto-generated and legacy muscles.
 * 
 * @param {string} creatureType - The type of creature.
 * @param {Object} skeleton - The skeleton object with bones/joints.
 * @param {Array} muscles - Array of muscle objects to validate
 * @returns {Object} Validation report { valid: bool, missingJoints: Array, muscleCount: number }
 */
function validateMuscleConfig(creatureType, skeleton, muscles) {
    const muscleArray = muscles || MUSCLE_TEMPLATES_LEGACY[creatureType]?.muscle_templates ?? [];
    const missingJoints = new Set();
    
    muscleArray.forEach(muscle => {
        if (!skeleton.getBoneById(muscle.startJoint)) {
            missingJoints.add(muscle.startJoint);
        }
        if (!skeleton.getBoneById(muscle.endJoint)) {
            missingJoints.add(muscle.endJoint);
        }
    });
    
    return {
        valid: missingJoints.size === 0,
        missingJoints: Array.from(missingJoints),
        muscleCount: muscleArray.length
    };
}
