/**
 * Anatomical Data for Madhuban Creatures
 * Research-based proportions, joint constraints, and body measurements
 * Based on "Anatomical Values for Madhuban Creatures.md"
 */

class AnatomicalData {
    static get FISH() {
        return {
            // Skeletal Structure
            spine: {
                segments: 20,           // 15-25 optimal for visual appeal
                segmentLength: 15,      // Base segment length
                flexibility: 'high'
            },
            
            // Joint Constraints (degrees)
            constraints: {
                spinalSegment: {
                    lateralFlexion: 8,   // ±5-10 degrees per segment
                    dorsalFlexion: 3     // Minimal vertical flexion
                },
                fins: {
                    pectoralRange: 45,   // Steering fins
                    caudalRange: 30      // Tail fin follow-through
                }
            },
            
            // Body Proportions
            proportions: {
                headToBody: 0.2,        // Head 20% of total length
                bodyToTail: 0.6,        // Body 60% of total length  
                tailToFin: 0.2,         // Tail + fins 20%
                maxBodyWidth: 1.0,      // Widest point (normalized)
                tailTaper: 0.3          // Tail width at end
            },
            
            // Width Profile Points (normalized 0-1 along spine)
            widthProfile: [
                {t: 0.0, width: 0.4},   // Head start
                {t: 0.15, width: 1.0},  // Maximum body width
                {t: 0.6, width: 0.8},   // Body to tail transition
                {t: 0.9, width: 0.4},   // Tail narrowing
                {t: 1.0, width: 0.1}    // Tail tip
            ],
            
            // Locomotion Parameters
            locomotion: {
                undulationAmplitude: 25,
                undulationFrequency: 1.5,
                wavelength: 0.8,        // Wave length relative to body
                phaseDelay: 0.1         // Fin follow-through delay
            }
        };
    }
    
    static get CRANE() {
        return {
            // Skeletal Structure - Bipedal Bird
            legs: {
                segments: 4,
                // Proportions relative to total leg length
                femur: 0.25,           // Short, held close to body
                tibiotarsus: 0.45,     // Long, main visible leg
                tarsometatarsus: 0.7, // Very long "foot"
                toes: 0.05
            },
            
            spine: {
                segments: 6,
                flexibility: 'medium'
            },
            
            neck: {
                segments: 10,
                length: 60,             // Long flexible neck
                flexibility: 'high'
            },
            
            // Joint Constraints (degrees)
            constraints: {
                hip: {
                    flexion: [0, 120],      // Forward/backward swing
                    abduction: [-30, 30],   // Limited lateral movement
                    rotation: [-15, 15]
                },
                knee: {
                    flexion: [0, 140]       // Hinge joint
                },
                ankle: {
                    flexion: [-45, 45]      // Ankle flexion
                },
                neckSegment: {
                    flexion: [-30, 30],     // Each neck segment
                    lateralBend: [-45, 45]
                }
            },
            
            // Body Proportions
            proportions: {
                legToBody: 2.0,         // Legs 2x body height
                neckToBody: 1.2,        // Neck 1.2x body length
                torsoWidth: 0.6,        // Compact torso
                legWidth: 0.15          // Slender legs
            },
            
            // Width Profile for different body parts
            widthProfiles: {
                torso: [
                    {t: 0.0, width: 0.6},   // Chest
                    {t: 0.5, width: 0.8},   // Mid-body
                    {t: 1.0, width: 0.4}    // Hip
                ],
                neck: [
                    {t: 0.0, width: 0.3},   // Base
                    {t: 0.8, width: 0.25},  // Constant width
                    {t: 1.0, width: 0.4}    // Head
                ],
                leg: [
                    {t: 0.0, width: 0.2},   // Hip attachment
                    {t: 0.3, width: 0.15},  // Thigh
                    {t: 0.7, width: 0.12},  // Lower leg
                    {t: 1.0, width: 0.08}   // Foot
                ]
            },
            
            // Locomotion Parameters
            locomotion: {
                stepLength: 35,
                stepHeight: 25,
                frequency: 1.2,
                dutyCycle: 0.6         // 60% stance, 40% swing
            }
        };
    }
    
    static get HORSE() {
        return {
            // Skeletal Structure - Erect Quadruped
            legs: {
                segments: 4,
                // Front leg proportions
                front: {
                    scapula: 0.6,       // Hidden in body
                    humerus: 0.5,      
                    radius: 0.6,        // Forearm
                    cannon: 0.26        // Metacarpus to hoof
                },
                // Hind leg proportions  
                hind: {
                    femur: 0.6,
                    tibia: 0.6,        // Main lower leg
                    cannon: 0.26,       // Metatarsus
                    hoof: 0.05
                }
            },
            
            spine: {
                segments: 8,
                flexibility: 'low'      // Rigid for stability
            },
            
            neck: {
                segments: 6,
                flexibility: 'medium'
            },
            
            // Joint Constraints (degrees) - Erect posture
            constraints: {
                shoulder: {
                    flexion: [-30, 45],     // Forward/back swing
                    abduction: [-10, 10]    // Limited lateral
                },
                hip: {
                    flexion: [-20, 50],
                    abduction: [-5, 15]
                },
                elbow: {
                    flexion: [0, 150]       // Strong flexion
                },
                stifle: {                   // Horse knee
                    flexion: [0, 140]
                },
                hock: {                     // Horse ankle
                    flexion: [-30, 60]
                },
                fetlock: {                  // Pastern joint
                    flexion: [-15, 45]
                }
            },
            
            // Body Proportions - Equine anatomy
            proportions: {
                legToBody: 1.1,         // Legs slightly taller than body
                neckToBody: 0.8,        // Proportional neck
                bodyWidth: 1.0,         // Barrel chest
                legWidth: 0.25,         // Muscular legs
                cannonRatio: 0.3        // Cannon bone relative to forearm
            },
            
            // Width Profiles
            widthProfiles: {
                torso: [
                    {t: 0.0, width: 0.7},   // Chest
                    {t: 0.3, width: 1.0},   // Barrel (widest)
                    {t: 0.7, width: 0.9},   // Back
                    {t: 1.0, width: 0.6}    // Hip
                ],
                neck: [
                    {t: 0.0, width: 0.5},   // Base
                    {t: 0.6, width: 0.4},   // Mid-neck
                    {t: 1.0, width: 0.45}   // Head
                ],
                leg: [
                    {t: 0.0, width: 0.35},  // Shoulder/hip
                    {t: 0.4, width: 0.25},  // Upper leg
                    {t: 0.7, width: 0.15},  // Cannon bone
                    {t: 1.0, width: 0.12}   // Hoof
                ]
            },
            
            // Locomotion Parameters
            locomotion: {
                walk: {
                    frequency: 1.0,
                    dutyCycle: 0.75,    // 75% stance
                    phaseShift: 0.25    // 4-beat gait
                },
                trot: {
                    frequency: 2.0,
                    dutyCycle: 0.5,     // 50% stance
                    phaseShift: 0.5     // Diagonal pairs
                },
                gallop: {
                    frequency: 3.0,
                    dutyCycle: 0.25,    // 25% stance
                    phaseShift: 0.1     // Grouped beats
                }
            }
        };
    }
    
    static get LIZARD() {
        return {
            // Skeletal Structure - Sprawling Quadruped
            legs: {
                segments: 4,
                // Sprawling posture proportions
                humerus: 0.35,          // Relatively short
                radius: 0.35,           // Short forearm
                carpus: 0.15,           // Wrist
                digits: 0.15            // Toes/claws
            },
            
            spine: {
                segments: 15,           // Highly flexible
                flexibility: 'very-high'
            },
            
            tail: {
                segments: 12,           // Long undulating tail
                flexibility: 'very-high',
                taper: true
            },
            
            // Joint Constraints (degrees) - Sprawling posture
            constraints: {
                shoulder: {
                    flexion: [-45, 90],     // Wide range
                    abduction: [-60, 60],   // Sprawling angle
                    rotation: [-30, 30]
                },
                hip: {
                    flexion: [-30, 80],
                    abduction: [-70, 70],   // Very splayed
                    rotation: [-45, 45]
                },
                elbow: {
                    flexion: [0, 120]       // Horizontal flexion
                },
                knee: {
                    flexion: [0, 110]
                },
                spinalSegment: {
                    lateralFlexion: 15,     // High lateral flexibility
                    dorsalFlexion: 5
                },
                tailSegment: {
                    lateralFlexion: 20,     // Very flexible tail
                    dorsalFlexion: 10
                }
            },
            
            // Body Proportions - Low, elongated
            proportions: {
                legToBody: 0.4,         // Short legs relative to body
                tailToBody: 1.2,        // Long tail
                bodyWidth: 0.6,         // Relatively wide, low body
                legWidth: 0.12,         // Thin limbs
                sprawlAngle: 45         // Leg splay angle
            },
            
            // Width Profiles
            widthProfiles: {
                torso: [
                    {t: 0.0, width: 0.5},   // Head/neck
                    {t: 0.2, width: 0.8},   // Shoulders
                    {t: 0.6, width: 0.9},   // Mid-body (widest)
                    {t: 1.0, width: 0.7}    // Hip
                ],
                tail: [
                    {t: 0.0, width: 0.6},   // Base
                    {t: 0.5, width: 0.4},   // Mid-tail
                    {t: 0.8, width: 0.2},   // Tapering
                    {t: 1.0, width: 0.05}   // Tip
                ],
                leg: [
                    {t: 0.0, width: 0.15},  // Shoulder/hip
                    {t: 0.5, width: 0.12},  // Mid-limb
                    {t: 0.8, width: 0.08},  // Lower limb
                    {t: 1.0, width: 0.06}   // Foot/claws
                ]
            },
            
            // Locomotion Parameters
            locomotion: {
                lateralUndulation: {
                    amplitude: 35,
                    frequency: 1.8,
                    wavelength: 1.2
                },
                limbCoordination: {
                    frequency: 1.0,
                    phaseShift: 0.25,   // Alternating pattern
                    sprawlCompensation: 0.3
                }
            }
        };
    }
    
    // Utility function to get width at specific point along creature
    static getWidthAtPosition(creatureType, bodyPart, t) {
        const data = this[creatureType.toUpperCase()];
        const profile = data.widthProfiles[bodyPart];
        
        if (!profile) return 1.0;
        
        // Linear interpolation between profile points
        for (let i = 0; i < profile.length - 1; i++) {
            if (t >= profile[i].t && t <= profile[i + 1].t) {
                const ratio = (t - profile[i].t) / (profile[i + 1].t - profile[i].t);
                return profile[i].width + ratio * (profile[i + 1].width - profile[i].width);
            }
        }
        
        return profile[profile.length - 1].width;
    }
}
