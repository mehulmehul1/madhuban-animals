class ConstraintSystem {
    constructor() {
        this.constraints = new Map();
        this.jointProfiles = new Map();
        this.initializeConstraints();
        this.initializeJointProfiles();
    }

    initializeConstraints() {
        // Default constraints
        this.constraints.set('default', {
            clockwise: 180,
            anticlockwise: 180
        });

        this.constraints.set('vertebra', {
            clockwise: 25,
            anticlockwise: 25
        });

        this.constraints.set('neck', {
            clockwise: 45,
            anticlockwise: 45
        });

        this.constraints.set('leg', {
            clockwise: 60,
            anticlockwise: 10
        });

        this.constraints.set('finBase', {
            clockwise: 45,
            anticlockwise: 45
        });

        this.constraints.set('wing', {
            clockwise: 90,
            anticlockwise: 90
        });
    }

    initializeJointProfiles() {
        // Fish joint profiles
        this.jointProfiles.set('fish', {
            vertebra: {
                type: 'hinge',
                primaryAxis: 'lateral',
                range: AnatomicalData.FISH.constraints.spinalSegment.lateralFlexion,
                secondaryRange: AnatomicalData.FISH.constraints.spinalSegment.dorsalFlexion
            },
            fin: {
                type: 'hinge',
                primaryAxis: 'rotational',
                range: AnatomicalData.FISH.constraints.fins.pectoralRange
            }
        });

        // Crane joint profiles  
        this.jointProfiles.set('crane', {
            hip: {
                type: 'ball-socket',
                flexion: AnatomicalData.CRANE.constraints.hip.flexion,
                abduction: AnatomicalData.CRANE.constraints.hip.abduction,
                rotation: AnatomicalData.CRANE.constraints.hip.rotation
            },
            knee: {
                type: 'hinge',
                flexion: AnatomicalData.CRANE.constraints.knee.flexion
            },
            ankle: {
                type: 'hinge',
                flexion: AnatomicalData.CRANE.constraints.ankle.flexion
            },
            neckSegment: {
                type: 'hinge',
                flexion: AnatomicalData.CRANE.constraints.neckSegment.flexion,
                lateralBend: AnatomicalData.CRANE.constraints.neckSegment.lateralBend
            }
        });

        // Horse joint profiles
        this.jointProfiles.set('horse', {
            shoulder: {
                type: 'ball-socket',
                flexion: AnatomicalData.HORSE.constraints.shoulder.flexion,
                abduction: AnatomicalData.HORSE.constraints.shoulder.abduction
            },
            hip: {
                type: 'ball-socket',
                flexion: AnatomicalData.HORSE.constraints.hip.flexion,
                abduction: AnatomicalData.HORSE.constraints.hip.abduction
            },
            elbow: {
                type: 'hinge',
                flexion: AnatomicalData.HORSE.constraints.elbow.flexion
            },
            stifle: {
                type: 'hinge',
                flexion: AnatomicalData.HORSE.constraints.stifle.flexion
            },
            hock: {
                type: 'hinge',
                flexion: AnatomicalData.HORSE.constraints.hock.flexion
            },
            fetlock: {
                type: 'hinge',
                flexion: AnatomicalData.HORSE.constraints.fetlock.flexion
            }
        });

        // Lizard joint profiles
        this.jointProfiles.set('lizard', {
            shoulder: {
                type: 'ball-socket',
                flexion: AnatomicalData.LIZARD.constraints.shoulder.flexion,
                abduction: AnatomicalData.LIZARD.constraints.shoulder.abduction,
                rotation: AnatomicalData.LIZARD.constraints.shoulder.rotation
            },
            hip: {
                type: 'ball-socket',
                flexion: AnatomicalData.LIZARD.constraints.hip.flexion,
                abduction: AnatomicalData.LIZARD.constraints.hip.abduction,
                rotation: AnatomicalData.LIZARD.constraints.hip.rotation
            },
            elbow: {
                type: 'hinge',
                flexion: AnatomicalData.LIZARD.constraints.elbow.flexion
            },
            knee: {
                type: 'hinge',
                flexion: AnatomicalData.LIZARD.constraints.knee.flexion
            },
            spinalSegment: {
                type: 'hinge',
                lateralFlexion: AnatomicalData.LIZARD.constraints.spinalSegment.lateralFlexion,
                dorsalFlexion: AnatomicalData.LIZARD.constraints.spinalSegment.dorsalFlexion
            },
            tailSegment: {
                type: 'hinge',
                lateralFlexion: AnatomicalData.LIZARD.constraints.tailSegment.lateralFlexion,
                dorsalFlexion: AnatomicalData.LIZARD.constraints.tailSegment.dorsalFlexion
            }
        });
    }

    /**
     * Get constraints based on creature type and anatomical role
     */
    getAnatomicalConstraints(creatureType, anatomicalRole, boneConfig = {}) {
        const creatureProfile = this.jointProfiles.get(creatureType.toLowerCase());
        
        if (!creatureProfile || !creatureProfile[anatomicalRole]) {
            return this.getConstraints('default', boneConfig.constraints);
        }

        const joint = creatureProfile[anatomicalRole];
        
        if (joint.type === 'hinge') {
            return this.getHingeConstraints(joint, boneConfig);
        } else if (joint.type === 'ball-socket') {
            return this.getBallSocketConstraints(joint, boneConfig);
        }

        return this.getConstraints('default', boneConfig.constraints);
    }

    /**
     * Calculate hinge joint constraints
     */
    getHingeConstraints(joint, boneConfig) {
        let clockwise = 45, anticlockwise = 45;

        if (joint.flexion) {
            const [min, max] = joint.flexion;
            clockwise = Math.abs(max);
            anticlockwise = Math.abs(min);
        } else if (joint.lateralFlexion !== undefined) {
            clockwise = anticlockwise = joint.lateralFlexion;
        } else if (joint.range !== undefined) {
            clockwise = anticlockwise = joint.range;
        }

        // Apply any bone-specific overrides
        if (boneConfig.constraints) {
            clockwise = boneConfig.constraints.clockwise || clockwise;
            anticlockwise = boneConfig.constraints.anticlockwise || anticlockwise;
        }

        return { clockwise, anticlockwise };
    }

    /**
     * Calculate ball-and-socket joint constraints (simplified to primary flexion)
     */
    getBallSocketConstraints(joint, boneConfig) {
        let clockwise = 90, anticlockwise = 90;

        if (joint.flexion) {
            const [min, max] = joint.flexion;
            clockwise = Math.abs(max);
            anticlockwise = Math.abs(min);
        }

        // Ball-and-socket joints typically have larger range
        clockwise = Math.min(clockwise, 120);
        anticlockwise = Math.min(anticlockwise, 120);

        // Apply any bone-specific overrides
        if (boneConfig.constraints) {
            clockwise = boneConfig.constraints.clockwise || clockwise;
            anticlockwise = boneConfig.constraints.anticlockwise || anticlockwise;
        }

        return { clockwise, anticlockwise };
    }

    /**
     * Legacy method for backward compatibility
     */
    getConstraints(templateName, overrides = {}) {
        const defaults = this.constraints.get(templateName) || this.constraints.get('default');
        return { ...defaults, ...overrides };
    }

    /**
     * Get joint type information
     */
    getJointType(creatureType, anatomicalRole) {
        const creatureProfile = this.jointProfiles.get(creatureType.toLowerCase());
        if (creatureProfile && creatureProfile[anatomicalRole]) {
            return creatureProfile[anatomicalRole].type;
        }
        return 'hinge'; // Default
    }
}
