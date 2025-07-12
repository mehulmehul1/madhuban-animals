/**
 * Quadruped Template System
 * Templating system to easily create different quadrupeds by changing proportions
 * Based on the improved horse implementation
 */

class QuadrupedTemplateSystem {
    constructor() {
        this.templates = new Map();
        this.initializeTemplates();
    }

    initializeTemplates() {
        // Base erect quadruped template (horse-like)
        this.templates.set('erect-quadruped', {
            posture: 'erect',
            legStyle: 'unguligrade',  // Walks on hooves/toes
            locomotion: 'quadruped-walk',
            
            // Basic anatomy structure
            anatomy: {
                legs: {
                    segments: 5,
                    front: {
                        scapula: 0.6,    // Hidden in body
                        humerus: 0.5,    // Upper arm
                        radius: 0.6,     // Forearm (main visible upper)
                        cannon: 0.26,    // Lower leg (main visible lower)
                        hoof: 0.05       // Ground contact
                    },
                    hind: {
                        femur: 0.6,      // Thigh (hidden in body)
                        tibia: 0.6,      // Lower leg (main visible)
                        cannon: 0.26,    // Cannon bone
                        hoof: 0.05       // Ground contact
                    }
                },
                spine: {
                    segments: 8,
                    flexibility: 'low'
                },
                neck: {
                    segments: 6,
                    flexibility: 'medium'
                }
            },

            // Joint constraint templates
            constraints: {
                shoulder: { flexion: [-25, 55], abduction: [-8, 12], rotation: [-5, 5] },
                hip: { flexion: [-15, 65], abduction: [-8, 18], rotation: [-10, 10] },
                elbow: { flexion: [0, 160] },
                stifle: { flexion: [0, 155] },
                carpus: { flexion: [-10, 75], deviation: [-5, 5] },
                hock: { flexion: [-20, 85], rotation: [-3, 3] },
                fetlock: { flexion: [-25, 65], hyperextension: 25, lateral: [-3, 3] },
                pastern: { flexion: [-15, 45], lateral: [-3, 3] },
                coffin: { flexion: [-8, 25], lateral: [-2, 2] }
            },

            // Body proportions
            proportions: {
                legToBody: 1.05,
                neckToBody: 0.75,
                bodyWidth: 0.95,
                legWidth: 0.22
            },

            // Locomotion parameters
            locomotion: {
                walk: { frequency: 0.8, dutyCycle: 0.78, phaseShift: 0.25 },
                trot: { frequency: 1.4, dutyCycle: 0.52, phaseShift: 0.5 },
                canter: { frequency: 1.8, dutyCycle: 0.35, phaseShift: 0.33 },
                gallop: { frequency: 2.5, dutyCycle: 0.25, phaseShift: 0.15 }
            }
        });

        // Sprawling quadruped template (lizard-like)
        this.templates.set('sprawling-quadruped', {
            posture: 'sprawling',
            legStyle: 'digitigrade',  // Walks on toes
            locomotion: 'sprawling-walk',
            
            anatomy: {
                legs: {
                    segments: 4,     // Simpler leg structure
                    front: {
                        humerus: 0.35,    // Short, splayed
                        radius: 0.35,     // Short forearm
                        carpus: 0.15,     // Wrist
                        digits: 0.15      // Toes/claws
                    },
                    hind: {
                        femur: 0.35,      // Short thigh
                        tibia: 0.35,      // Short lower leg
                        tarsus: 0.15,     // Ankle
                        digits: 0.15      // Toes/claws
                    }
                },
                spine: {
                    segments: 15,         // Highly flexible
                    flexibility: 'very-high'
                },
                tail: {
                    segments: 12,
                    flexibility: 'very-high'
                }
            },

            constraints: {
                shoulder: { flexion: [-45, 90], abduction: [-60, 60], rotation: [-30, 30] },
                hip: { flexion: [-30, 80], abduction: [-70, 70], rotation: [-45, 45] },
                elbow: { flexion: [0, 120] },
                knee: { flexion: [0, 110] },
                spinalSegment: { lateralFlexion: 15, dorsalFlexion: 5 }
            },

            proportions: {
                legToBody: 0.4,      // Short legs
                tailToBody: 1.2,     // Long tail
                bodyWidth: 0.6,      // Wide, low body
                sprawlAngle: 45      // Leg splay angle
            }
        });
    }

    /**
     * Create a new quadruped by modifying an existing template
     */
    createQuadruped(baseTemplate, modifications = {}) {
        const template = this.deepClone(this.templates.get(baseTemplate));
        if (!template) {
            throw new Error(`Template ${baseTemplate} not found`);
        }

        // Apply modifications recursively
        this.applyModifications(template, modifications);
        
        return template;
    }

    /**
     * Apply modifications to a template recursively
     */
    applyModifications(target, modifications) {
        for (const [key, value] of Object.entries(modifications)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                if (!target[key]) target[key] = {};
                this.applyModifications(target[key], value);
            } else {
                target[key] = value;
            }
        }
    }

    /**
     * Deep clone an object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const [key, value] of Object.entries(obj)) {
            cloned[key] = this.deepClone(value);
        }
        return cloned;
    }

    /**
     * Generate bone template for quadruped leg
     */
    generateQuadrupedLeg(template, legType, length, config = {}) {
        const legData = template.anatomy.legs[legType];
        const constraints = template.constraints;
        const bones = [];

        // Generate bones based on leg structure
        const boneNames = Object.keys(legData);
        
        for (let i = 0; i < boneNames.length; i++) {
            const boneName = boneNames[i];
            const proportion = legData[boneName];
            
            // Determine anatomical role and constraints
            const anatomicalRole = this.mapBoneToRole(boneName, i, boneNames.length);
            const jointConstraints = constraints[anatomicalRole] || { flexion: [0, 45] };
            
            // Calculate direction based on posture
            const direction = this.calculateBoneDirection(
                template.posture, 
                boneName, 
                i, 
                config.side
            );

            bones.push({
                length: length * proportion,
                direction: direction,
                constraints: {
                    clockwise: Math.abs(jointConstraints.flexion[1]),
                    anticlockwise: Math.abs(jointConstraints.flexion[0])
                },
                jointType: this.getJointType(anatomicalRole),
                anatomicalRole: anatomicalRole,
                groundContact: i === boneNames.length - 1  // Last bone touches ground
            });
        }

        return bones;
    }

    /**
     * Map bone name to anatomical role
     */
    mapBoneToRole(boneName, index, totalBones) {
        const roleMap = {
            'scapula': 'shoulder',
            'humerus': 'elbow', 
            'radius': 'carpus',
            'cannon': 'fetlock',
            'hoof': 'coffin',
            'femur': 'hip',
            'tibia': 'stifle',
            'tarsus': 'hock',
            'digits': 'digits'
        };
        
        return roleMap[boneName] || 'generic';
    }

    /**
     * Calculate bone direction based on posture
     */
    calculateBoneDirection(posture, boneName, boneIndex, side = 'left') {
        if (posture === 'erect') {
            // Erect posture - mostly vertical
            const angleOffsets = {
                'scapula': 0.3,
                'humerus': 0.0,
                'radius': 0.0,
                'cannon': 0.0,
                'hoof': 0.2
            };
            const offset = angleOffsets[boneName] || 0;
            return new FIK.V2(offset, 1);
            
        } else if (posture === 'sprawling') {
            // Sprawling posture - splayed legs
            const sideMultiplier = side === 'left' ? -1 : 1;
            const sprawlFactor = 0.8 - (boneIndex * 0.2); // Less splay toward ground
            return new FIK.V2(sideMultiplier * sprawlFactor, 0.6 + (boneIndex * 0.1));
        }
        
        return new FIK.V2(0, 1); // Default vertical
    }

    /**
     * Get joint type for anatomical role
     */
    getJointType(role) {
        const ballSocketJoints = ['shoulder', 'hip'];
        return ballSocketJoints.includes(role) ? 'ball-socket' : 'hinge';
    }

    /**
     * Preset quadruped configurations
     */
    static get PRESETS() {
        return {
            // Existing horse (already implemented)
            HORSE: 'erect-quadruped',
            
            // Future quadrupeds using the same system
            DEER: {
                base: 'erect-quadruped',
                modifications: {
                    anatomy: {
                        legs: {
                            front: { scapula: 0.4, humerus: 0.3, radius: 0.7, cannon: 0.3, hoof: 0.04 },
                            hind: { femur: 0.4, tibia: 0.7, cannon: 0.3, hoof: 0.04 }
                        },
                        neck: { segments: 8, flexibility: 'high' }
                    },
                    proportions: {
                        legToBody: 1.2,  // Longer legs
                        neckToBody: 0.9  // Longer neck
                    }
                }
            },

            COW: {
                base: 'erect-quadruped', 
                modifications: {
                    anatomy: {
                        legs: {
                            front: { scapula: 0.5, humerus: 0.4, radius: 0.5, cannon: 0.2, hoof: 0.06 },
                            hind: { femur: 0.5, tibia: 0.5, cannon: 0.2, hoof: 0.06 }
                        }
                    },
                    proportions: {
                        legToBody: 0.9,   // Shorter legs
                        bodyWidth: 1.2,   // Wider body
                        legWidth: 0.3     // Thicker legs
                    }
                }
            },

            DOG: {
                base: 'erect-quadruped',
                modifications: {
                    anatomy: {
                        legs: {
                            segments: 4,  // Simpler leg structure
                            front: { humerus: 0.4, radius: 0.4, carpus: 0.15, paw: 0.05 },
                            hind: { femur: 0.4, tibia: 0.4, tarsus: 0.15, paw: 0.05 }
                        },
                        spine: { flexibility: 'medium' }
                    },
                    proportions: {
                        legToBody: 0.8,
                        neckToBody: 0.4
                    }
                }
            },

            LIZARD: 'sprawling-quadruped'
        };
    }
}
