class ShapeProfileSystem {
    constructor() {
        this.profiles = new Map();
        this.initializeProfiles();
    }

    initializeProfiles() {
        // Default profile: A symmetrical shape, thick in the middle.
        this.profiles.set('default', t => {
            // Parabolic curve for a smooth bulge
            return 30 * (1 - Math.pow(2 * t - 1, 2));
        });

        // Torso profile: Generally thick, slightly tapered at the neck end.
        this.profiles.set('torso', t => {
            const baseWidth = 40;
            const neckTaper = 0.5; // Tapers to 50% width at the neck (t=1)
            return baseWidth * (1 - t * (1 - neckTaper));
        });

        // Limb profile: Simulates a joint, thicker at the base.
        this.profiles.set('limb', t => {
            const baseWidth = 25;
            const tipWidth = 10;
            // Linear interpolation from base to tip
            return baseWidth * (1 - t) + tipWidth * t;
        });

        // Tapered Tail profile: Starts thick and tapers to a point.
        this.profiles.set('tapered-tail', t => {
            const baseWidth = 20;
            // A stronger curve for a more dramatic taper
            return baseWidth * (1 - Math.pow(t, 2));
        });

        // Neck profile: Relatively uniform width.
        this.profiles.set('neck', t => {
            return 15;
        });

        // Fin profile: Wide base, quick taper.
        this.profiles.set('fin', t => {
            return 40 * (1 - Math.pow(t, 3));
        });
    }

    getProfile(name) {
        const profile = this.profiles.get(name);
        if (profile) {
            return profile;
        }
        console.warn(`Shape profile '${name}' not found. Using 'default'.`);
        return this.profiles.get('default');
    }
}