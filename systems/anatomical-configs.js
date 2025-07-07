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
