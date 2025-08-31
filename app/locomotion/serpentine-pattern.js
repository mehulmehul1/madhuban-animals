class SerpentinePattern extends LocomotionPattern {
    constructor(config) {
        super('serpentine', config);
        this.wavelength = config.wavelength || 120;
        this.amplitude = config.amplitude || 30;
    }

    update(creature, deltaTime) {
        super.update(creature, deltaTime);
        
        // Serpentine movement toward mouse
        const directionToMouse = new FIK.V2(
            creature.mouseTarget.x - creature.bodyPosition.x,
            creature.mouseTarget.y - creature.bodyPosition.y
        ).normalised();
        
        creature.bodyVelocity.add(directionToMouse.multiplyScalar(0.015));
        creature.bodyVelocity.multiplyScalar(0.98);
        creature.bodyPosition.add(creature.bodyVelocity);
    }

    applySerpentineMotion(chain, config) {
        // Apply serpentine wave to each bone
        chain.bones.forEach((bone, i) => {
            const segmentPhase = this.cycle + (i * 2 * Math.PI / this.wavelength);
            const lateralOffset = Math.sin(segmentPhase) * this.amplitude * (1 - i / chain.bones.length);
            bone.serpentineOffset = lateralOffset;
        });
    }
}
