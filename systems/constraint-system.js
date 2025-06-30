class ConstraintSystem {
    constructor() {
        this.constraints = new Map();
        this.initializeConstraints();
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

    getConstraints(templateName, overrides = {}) {
        const defaults = this.constraints.get(templateName) || this.constraints.get('default');
        return { ...defaults, ...overrides };
    }
}
