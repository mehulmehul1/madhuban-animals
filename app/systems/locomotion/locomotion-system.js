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
        if (typeof SprawlingQuadrupedGaitController !== 'undefined') {
            this.patterns.set('sprawling-quadruped', SprawlingQuadrupedGaitController);
        }
        if (typeof HumanWalkPattern !== 'undefined') {
            this.patterns.set('human-walk', HumanWalkPattern);
        }
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
