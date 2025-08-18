class OctopusTemplateSystem {
    constructor(builder) {
        this.builder = builder;
        this.boneTemplateSystem = new BoneTemplateSystem();
    }

    createMantle(config) {
        const mantleBones = this.boneTemplateSystem.generateBones('serpentine-spine', config.length, {
            segments: config.segments,
            flexibility: 'very-high'
        });
        return this.builder.addChain(this.builder.createChainConfig({
            role: 'mantle',
            type: 'spine',
            attachment: 'free',
            targetMode: 'calculated',
            color: [0, 0, 255], // Blue for octopus mantle
            bones: mantleBones,
            locomotionRole: 'primary',
            constraintTemplate: 'vertebra',
            shapeProfile: 'torso',
            scale: 1.0
        }));
    }

    createArm(config) {
        const armBones = this.boneTemplateSystem.generateBones('serpentine-spine', config.length, {
            segments: config.segments,
            flexibility: 'very-high'
        });
        return this.builder.addChain(this.builder.createChainConfig({
            role: config.role || 'arm',
            type: 'arm',
            attachment: 'parent',
            targetMode: 'calculated',
            parentRole: 'mantle',
            attachmentPoint: 'bone-index',
            attachmentIndex: (typeof config.attachmentIndex === 'number') ? config.attachmentIndex : Math.floor(this.builder.creatureConfig.mantleSegments / 2),
            color: [0, 255, 0], // Green for octopus arms
            bones: armBones,
            locomotionRole: 'propulsion',
            constraintTemplate: 'limb',
            shapeProfile: 'limb',
            scale: 0.8
        }));
    }
}
