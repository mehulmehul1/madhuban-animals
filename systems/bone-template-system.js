class BoneTemplateSystem {
    constructor() {
        this.templates = new Map();
        this.initializeTemplates();
    }

    initializeTemplates() {
        // Fish templates
        this.templates.set('fish-spine', (length, config) => {
            const bones = [];
            for (let i = 0; i < config.segments; i++) {
                bones.push({
                    length: length,
                    direction: new FIK.V2(-1, Math.sin(i * 0.3) * 0.1),
                    constraints: { 
                        clockwise: 25 - i * 2, 
                        anticlockwise: 25 - i * 2 
                    }
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

        // Vertebrate legvertebrate-leg
        this.templates.set('crane-leg', (length, config) => {
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

        // Vertebrate leg
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
