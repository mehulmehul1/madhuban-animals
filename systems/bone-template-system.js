class BoneTemplateSystem {
    constructor() {
        this.templates = new Map();
        this.initializeTemplates();
    }

    initializeTemplates() {
        // Fish templates - using anatomical data
        this.templates.set('fish-spine', (length, config) => {
            const fishData = AnatomicalData.FISH;
            const bones = [];
            const segments = config.segments || fishData.spine.segments;
            
            for (let i = 0; i < segments; i++) {
                const t = i / (segments - 1); // Position along spine (0-1)
                const flexionLimit = fishData.constraints.spinalSegment.lateralFlexion;
                
                bones.push({
                    length: length,
                    direction: new FIK.V2(-1, Math.sin(i * 0.3) * 0.1),
                    constraints: { 
                        clockwise: flexionLimit, 
                        anticlockwise: flexionLimit 
                    },
                    jointType: 'hinge',
                    anatomicalRole: 'vertebra'
                });
            }
            return bones;
        });

        // Vertebrate spine
        this.templates.set('vertebrate-spine', (length, config) => {
            const bones = [];
            for (let i = 0; i < config.segments; i++) {
                bones.push({
                    length: length,
                    direction: new FIK.V2(0, -1),
                    constraints: { 
                        clockwise: config.flexibility === 'high' ? 30 : 10, 
                        anticlockwise: config.flexibility === 'high' ? 30 : 20 
                    }
                });
            }
            return bones;
        });

        // Vertebrate neck
        this.templates.set('vertebrate-neck', (length, config) => {
            const bones = [];
            for (let i = 0; i < config.segments; i++) {
                bones.push({
                    length: length,
                    direction: new FIK.V2(0.2, -1).normalised(),
                    constraints: { 
                        clockwise: 60, 
                        anticlockwise: 60 
                    }
                });
            }
            return bones;
        });

        // Crane leg - anatomically accurate bipedal bird leg
        this.templates.set('crane-leg', (length, config) => {
            const craneData = AnatomicalData.CRANE;
            const legData = craneData.legs;
            const constraints = craneData.constraints;
            
            return [
                { // Femur (hip to knee) - short, held close to body
                    length: length * legData.femur,
                    direction: new FIK.V2(0.5, 1), // Slightly angled
                    constraints: { 
                        clockwise: constraints.hip.flexion[1] / 2, 
                        anticlockwise: constraints.hip.flexion[1] / 2 
                    },
                    jointType: 'ball-socket',
                    anatomicalRole: 'hip'
                },
                { // Tibiotarsus (knee to ankle) - long, main visible leg
                    length: length * legData.tibiotarsus,
                    direction: new FIK.V2(0, 1),
                    constraints: { 
                        clockwise: constraints.knee.flexion[1], 
                        anticlockwise: 0 
                    },
                    jointType: 'hinge',
                    anatomicalRole: 'knee'
                },
                { // Tarsometatarsus (ankle to toe) - very long "foot"
                    length: length * legData.tarsometatarsus,
                    direction: new FIK.V2(0, 1),
                    constraints: { 
                        clockwise: constraints.ankle.flexion[1], 
                        anticlockwise: Math.abs(constraints.ankle.flexion[0])
                    },
                    jointType: 'hinge',
                    anatomicalRole: 'ankle'
                },
                { // Toes
                    length: length * legData.toes,
                    direction: new FIK.V2(1, 0.2),
                    constraints: { clockwise: 30, anticlockwise: 15 },
                    jointType: 'hinge',
                    anatomicalRole: 'toe'
                }
            ];
        });

        // Horse front leg - erect quadruped with unguligrade stance
        this.templates.set('horse-front-leg', (length, config) => {
            const horseData = AnatomicalData.HORSE;
            const legData = horseData.legs.front;
            const constraints = horseData.constraints;
            
            return [
                { // Scapula/Shoulder - mostly hidden in body
                    length: length * legData.scapula,
                    direction: new FIK.V2(0.3, 1),
                    constraints: { 
                        clockwise: constraints.shoulder.flexion[1], 
                        anticlockwise: Math.abs(constraints.shoulder.flexion[0])
                    },
                    jointType: 'ball-socket',
                    anatomicalRole: 'shoulder'
                },
                { // Humerus
                    length: length * legData.humerus,
                    direction: new FIK.V2(0, 1),
                    constraints: { 
                        clockwise: constraints.elbow.flexion[1], 
                        anticlockwise: 0 
                    },
                    jointType: 'hinge',
                    anatomicalRole: 'elbow'
                },
                { // Radius/Forearm
                    length: length * legData.radius,
                    direction: new FIK.V2(0, 1),
                    constraints: { clockwise: 45, anticlockwise: 15 },
                    jointType: 'hinge',
                    anatomicalRole: 'carpus'
                },
                { // Cannon bone (Metacarpus)
                    length: length * legData.cannon,
                    direction: new FIK.V2(0, 1),
                    constraints: { 
                        clockwise: constraints.fetlock.flexion[1], 
                        anticlockwise: Math.abs(constraints.fetlock.flexion[0])
                    },
                    jointType: 'hinge',
                    anatomicalRole: 'fetlock'
                }
            ];
        });

        // Horse hind leg - powerful hindquarters
        this.templates.set('horse-hind-leg', (length, config) => {
            const horseData = AnatomicalData.HORSE;
            const legData = horseData.legs.hind;
            const constraints = horseData.constraints;
            
            return [
                { // Femur
                    length: length * legData.femur,
                    direction: new FIK.V2(-0.2, 1), // Angled back slightly
                    constraints: { 
                        clockwise: constraints.hip.flexion[1], 
                        anticlockwise: Math.abs(constraints.hip.flexion[0])
                    },
                    jointType: 'ball-socket',
                    anatomicalRole: 'hip'
                },
                { // Tibia
                    length: length * legData.tibia,
                    direction: new FIK.V2(0, 1),
                    constraints: { 
                        clockwise: constraints.stifle.flexion[1], 
                        anticlockwise: 0 
                    },
                    jointType: 'hinge',
                    anatomicalRole: 'stifle'
                },
                { // Cannon bone (Metatarsus)
                    length: length * legData.cannon,
                    direction: new FIK.V2(0, 1),
                    constraints: { 
                        clockwise: constraints.hock.flexion[1], 
                        anticlockwise: Math.abs(constraints.hock.flexion[0])
                    },
                    jointType: 'hinge',
                    anatomicalRole: 'hock'
                },
                { // Hoof
                    length: length * legData.hoof,
                    direction: new FIK.V2(0.2, 1),
                    constraints: { 
                        clockwise: constraints.fetlock.flexion[1], 
                        anticlockwise: Math.abs(constraints.fetlock.flexion[0])
                    },
                    jointType: 'hinge',
                    anatomicalRole: 'pastern'
                }
            ];
        });

        // Lizard leg - sprawling quadruped
        this.templates.set('lizard-leg', (length, config) => {
            const lizardData = AnatomicalData.LIZARD;
            const legData = lizardData.legs;
            const constraints = lizardData.constraints;
            const side = config.side || 'left';
            const sprawlAngle = lizardData.proportions.sprawlAngle;
            
            // Adjust direction based on sprawling posture
            const sprawlDir = side === 'left' ? -1 : 1;
            
            return [
                { // Humerus/Femur - splayed outward
                    length: length * legData.humerus,
                    direction: new FIK.V2(sprawlDir * 0.8, 0.6), // Sprawling angle
                    constraints: { 
                        clockwise: constraints.shoulder.flexion[1], 
                        anticlockwise: Math.abs(constraints.shoulder.flexion[0])
                    },
                    jointType: 'ball-socket',
                    anatomicalRole: 'shoulder',
                    sprawlAngle: sprawlAngle
                },
                { // Radius/Tibia
                    length: length * legData.radius,
                    direction: new FIK.V2(sprawlDir * 0.4, 1),
                    constraints: { 
                        clockwise: constraints.elbow.flexion[1], 
                        anticlockwise: 0 
                    },
                    jointType: 'hinge',
                    anatomicalRole: 'elbow'
                },
                { // Carpus/Tarsus
                    length: length * legData.carpus,
                    direction: new FIK.V2(sprawlDir * 0.2, 1),
                    constraints: { clockwise: 60, anticlockwise: 30 },
                    jointType: 'hinge',
                    anatomicalRole: 'wrist'
                },
                { // Digits (toes/claws)
                    length: length * legData.digits,
                    direction: new FIK.V2(sprawlDir * 0.1, 1),
                    constraints: { clockwise: 45, anticlockwise: 20 },
                    jointType: 'hinge',
                    anatomicalRole: 'digits'
                }
            ];
        });

        // Generic vertebrate leg (fallback)
        this.templates.set('vertebrate-leg', (length, config) => {
            return [
                { // Hip to knee
                    length: length*0.5,
                    direction: new FIK.V2(1, 1),
                    constraints: { clockwise: 30, anticlockwise: 30 }
                },
                { // Knee to ankle
                    length: length * 1,
                    direction: new FIK.V2(0, 1),
                    constraints: { clockwise: 90, anticlockwise: 0 }
                },
                { // Ankle to toe
                    length: length * 0.6,
                    direction: new FIK.V2(0, 1),
                    constraints: { clockwise: 90, anticlockwise: 0 }
                },
                { // Foot
                    length: length * 0.2,
                    direction: new FIK.V2(1, 0),
                    constraints: { clockwise: 45, anticlockwise: 0 }
                }
            ];
        });

        // Fin template
        this.templates.set('fin', (size, config) => {
            const rad = (config.angle || 0) * Math.PI / 180;
            return [
                {
                    length: size,
                    direction: new FIK.V2(Math.cos(rad), Math.sin(rad)),
                    constraints: { clockwise: 70, anticlockwise: 70 }
                },
                {
                    length: size * 0.7,
                    direction: new FIK.V2(Math.cos(rad) * 1.2, Math.sin(rad) * 0.8),
                    constraints: { clockwise: 80, anticlockwise: 80 }
                }
            ];
        });

        // Wing template
        this.templates.set('wing', (size, config) => {
            const rad = (config.angle || 0) * Math.PI / 180;
            return [
                {
                    length: size,
                    direction: new FIK.V2(Math.cos(rad), Math.sin(rad)),
                    constraints: { clockwise: 70, anticlockwise: 70 }
                },
                {
                    length: size * 0.7,
                    direction: new FIK.V2(Math.cos(rad) * 1.2, Math.sin(rad) * 0.8),
                    constraints: { clockwise: 80, anticlockwise: 80 }
                }
            ];
        });

        // Vertebrate tail
        this.templates.set('vertebrate-tail', (length, config) => {
            const bones = [];
            for (let i = 0; i < config.segments; i++) {
                bones.push({
                    length: length * (config.taper ? (1 - i * 0.2) : 1),
                    direction: new FIK.V2(-0.8, 0.4),
                    constraints: { clockwise: 40, anticlockwise: 40 }
                });
            }
            return bones;
        });

        // Serpentine spine
        this.templates.set('serpentine-spine', (length, config) => {
            const bones = [];
            for (let i = 0; i < config.segments; i++) {
                bones.push({
                    length: length,
                    direction: new FIK.V2(1, Math.sin(i * 0.1) * 0.05),
                    constraints: { 
                        clockwise: config.flexibility === 'very-high' ? 45 : 30, 
                        anticlockwise: config.flexibility === 'very-high' ? 45 : 30 
                    }
                });
            }
            return bones;
        });
    }

    generateBones(templateName, scale, config) {
        const template = this.templates.get(templateName);
        if (template) {
            return template(scale, config);
        }
        console.warn(`Bone template ${templateName} not found`);
        return [];
    }
}
