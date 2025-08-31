class GaitSystem {
    constructor() {
        this.gaits = new Map();
        this.initializeGaits();
    }

    initializeGaits() {
        this.gaits.set('walk', {
            dutyCycle: 0.6,
            phaseOffset: Math.PI,
            frequency: 1.0,
            stepHeight: 0.3
        });
        
        this.gaits.set('trot', {
            dutyCycle: 0.5,
            phaseOffsets: [0, Math.PI, Math.PI, 0],
            frequency: 1.5
        });
        
        this.gaits.set('undulate', {
            wavelength: 0.7,
            amplitude: 20,
            frequency: 1.0
        });
    }

    getGait(name) {
        return this.gaits.get(name);
    }
}
