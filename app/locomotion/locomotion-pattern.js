export class LocomotionPattern {
    constructor(name, config) {
        this.name = name;
        this.config = config || {};
        this.cycle = 0;
        this.frequency = config.frequency || 1.0;
        this.amplitude = config.amplitude || 1.0;
    }

    update(creature, deltaTime) {
        // Update the cycle based on time and frequency
        this.cycle = (this.cycle + deltaTime * 0.001 * this.frequency) % (Math.PI * 2);
        
        // Apply pattern-specific updates
        this.updatePattern(creature, deltaTime);
    }
    
    // To be implemented by subclasses
    updatePattern(creature, deltaTime) {
        throw new Error('Subclasses must implement updatePattern');
    }
    
    // Helper method to get a value that oscillates with the cycle
    getOscillation(phase = 0) {
        return Math.sin(this.cycle + phase) * this.amplitude;
    }
    
    // Helper method to get a value that oscillates between 0 and 1
    getNormalizedOscillation(phase = 0) {
        return (Math.sin(this.cycle + phase) + 1) * 0.5;
    }
    
    // Helper method to get a value that oscillates between min and max
    getRangeOscillation(min, max, phase = 0) {
        const t = (Math.sin(this.cycle + phase) + 1) * 0.5; // 0..1
        return min + (max - min) * t;
    }
}
