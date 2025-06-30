class LocomotionSystem {
    constructor() {
        this.patterns = new Map();
        this.initializePatterns();
    }

    initializePatterns() {
        this.patterns.set('undulate', UndulatePattern);
        this.patterns.set('bipedal-walk', BipedalWalkPattern);
        this.patterns.set('quadruped-walk', QuadrupedWalkPattern);
        this.patterns.set('serpentine', SerpentinePattern);
    }

    createPattern(type, config) {
        const PatternClass = this.patterns.get(type);
        if (PatternClass) {
            return new PatternClass(config);
        }
        console.warn(`Locomotion pattern ${type} not found`);
        return null;
    }
}

class LocomotionPattern {
    constructor(name, config) {
        this.name = name;
        this.config = config;
        this.cycle = 0;
        this.frequency = config.frequency || 1.0;
    }

    update(creature, deltaTime) {
        this.cycle += this.frequency * deltaTime;
    }

    getCycle() {
        return this.cycle;
    }
}
