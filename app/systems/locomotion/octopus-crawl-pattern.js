class OctopusCrawlPattern {
    constructor(creature) {
        this.creature = creature;
        this.time = 0;
        this.mode = 'crawl';
        this.moveSpeed = 1.2; // crawl speed
        this.turnBlend = 0.08; // crawl turn rate
        this.swimParams = { thrust: 2.5, damping: 0.92, turnBlend: 0.05 };
    }

    setMode(mode) {
        if (mode === 'crawl' || mode === 'swim') {
            this.mode = mode;
        }
        return this.mode;
    }

    toggleMode() {
        this.mode = this.mode === 'crawl' ? 'swim' : 'crawl';
        return this.mode;
    }

    getMode() {
        return this.mode;
    }

    update(creature, deltaTime) {
        // Advance internal time for phase-based motion
        const dt = (deltaTime || 1/60);
        this.time += dt * 3.0;

        const toMouse = new FIK.V2(
            creature.mouseTarget.x - creature.bodyPosition.x,
            creature.mouseTarget.y - creature.bodyPosition.y
        );

        if (this.mode === 'crawl') {
            // Smoothly turn body toward mouse
            const targetAngle = Math.atan2(toMouse.y, toMouse.x);
            const angleDiff = creature.normalizeAngle(targetAngle - (creature.bodyHeading || 0));
            creature.bodyHeading = creature.normalizeAngle((creature.bodyHeading || 0) + this.turnBlend * angleDiff);

            // Move body toward mouse at gentle crawl speed
            const dist = toMouse.length();
            if (dist > 10) {
                const dir = toMouse.normalised();
                const speed = this.moveSpeed * (dt * 60); // frame-rate scaled
                creature.bodyPosition.x += dir.x * speed;
                creature.bodyPosition.y += dir.y * speed;
            }
        } else {
            // Swim mode: thrust pulses + damping for inertia
            const targetAngle = Math.atan2(toMouse.y, toMouse.x);
            const angleDiff = creature.normalizeAngle(targetAngle - (creature.bodyHeading || 0));
            creature.bodyHeading = creature.normalizeAngle((creature.bodyHeading || 0) + this.swimParams.turnBlend * angleDiff);

            const dist = toMouse.length();
            if (dist > 5) {
                const pulse = 0.5 + 0.5 * Math.sin(this.time * 2.0);
                const dir = toMouse.normalised();
                const thrust = this.swimParams.thrust * pulse;
                creature.bodyVelocity.x += dir.x * thrust;
                creature.bodyVelocity.y += dir.y * thrust;
            }

            // Apply water-like damping
            creature.bodyVelocity.multiplyScalar(this.swimParams.damping);
            creature.bodyPosition.add(creature.bodyVelocity);
        }
    }

    getArmTarget(role, ctx) {
        const index = parseInt((role || '').split('-')[1] || '0', 10) || 0;
        const base = ctx && ctx.attachPoint ? ctx.attachPoint : this.creature.bodyPosition;

        if (this.mode === 'swim') {
            // Arms trail behind the body heading with low amplitude
            const backDir = new FIK.V2(-Math.cos(this.creature.bodyHeading || 0), -Math.sin(this.creature.bodyHeading || 0));
            const trail = 60 + (index % 3) * 10;
            const sway = 8 * Math.sin(this.time * 2 + index * 0.6);
            return new FIK.V2(base.x + backDir.x * trail, base.y + backDir.y * trail + sway);
        }

        // Crawl mode: alternating anchor vs swing groups
        const isAnchorGroup = (index % 2) === 0;
        const anchorLift = isAnchorGroup ? 10 : 30;
        const radius = isAnchorGroup ? 30 : 55;

        const phase = index * (Math.PI / 4);
        const angle = this.time + phase;

        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * (radius * 0.6) + anchorLift;

        return new FIK.V2(base.x + offsetX, base.y + offsetY);
    }

    applyMantleSwimWave(chain, cfg) {
        // Gentle undulation along mantle for swim visuals
        const len = chain.bones.length;
        for (let i = 0; i < len; i++) {
            const phase = this.time * 1.5 + (i / Math.max(1, len - 1)) * Math.PI * 2;
            const wave = Math.sin(phase) * 10;
            // Use constraints as a simple proxy for visual waving without altering solver API
            const bone = chain.bones[i];
            const baseCW = 25, baseCCW = 25;
            bone.setClockwiseConstraintDegs(baseCW + wave);
            bone.setAnticlockwiseConstraintDegs(baseCCW + wave);
        }
    }
}
