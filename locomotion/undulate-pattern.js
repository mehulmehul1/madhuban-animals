class UndulatePattern extends LocomotionPattern {
    constructor(config) {
        super('undulate', config);
        this.wavelength = config.wavelength || 0.7;
        this.amplitude = config.amplitude || 20;
    }

    update(creature, deltaTime) {
        super.update(creature, deltaTime);
        
        // Fish body follows mouse with swimming motion
        const directionToMouse = new FIK.V2(
            creature.mouseTarget.x - creature.bodyPosition.x,
            creature.mouseTarget.y - creature.bodyPosition.y
        ).normalised();
        
        // Add swimming undulation
        const swimOffset = Math.sin(this.cycle) * this.amplitude;
        const perpendicular = new FIK.V2(-directionToMouse.y, directionToMouse.x);
        
        creature.bodyVelocity.add(directionToMouse.multiplyScalar(0.02));
        creature.bodyVelocity.add(perpendicular.multiplyScalar(swimOffset * 0.001));
        creature.bodyVelocity.multiplyScalar(0.95); // Drag
        
        creature.bodyPosition.add(creature.bodyVelocity);
    }

    applyBodyWave(chain, config) {
        // Apply wave motion to spine bones
        chain.bones.forEach((bone, i) => {
            const wavePhase = this.cycle - i * 0.3;
            const waveOffset = Math.sin(wavePhase) * this.amplitude * (i / chain.bones.length);
            bone.waveOffset = waveOffset;
        });
    }

    getFinTarget(finRole, context) {
        const direction = context.parentBone.getDirectionUV();
        
        if (finRole === "tail-fin") {
          return new FIK.V2(
            context.attachPoint.x + direction.x * 40,
            context.attachPoint.y +
              direction.y * 40 +
              Math.sin(this.cycle * 2) * 15
          );
        } else if (finRole === "dorsal-fin") {
          const upDir = new FIK.V2(-direction.y, direction.x);
          return new FIK.V2(
            context.attachPoint.x + upDir.x * 30,
            context.attachPoint.y + upDir.y * 30
          );
        } else if (finRole.includes("pectoral")) {
          const sideDir = finRole.includes("left")
            ? new FIK.V2(direction.y, -direction.x)
            : new FIK.V2(-direction.y, direction.x);
          return new FIK.V2(
            context.attachPoint.x + sideDir.x * 25,
            context.attachPoint.y + sideDir.y * 25
          );
        }
        
        return context.attachPoint;
    }

    getTailSwing() {
        return Math.sin(this.cycle) * 0.1;
    }
}
