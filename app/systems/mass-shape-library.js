/**
 * Mass Shape Library
 * ==================
 * Defines geometric mass classes for the Madhubani mass construction system.
 * These shapes (Sphere, Ovoid, Sausage, Cylinder) replace the old muscle definitions.
 */

class MassShape {
    constructor(config) {
        this.type = config.type || 'base';
        this.id = config.id;
        this.name = config.name;
        
        // Dimensions
        this.width = config.width || 10;
        this.length = config.length || 20;
        this.aspectRatio = config.aspectRatio || 1.0;
        
        // Positioning
        this.startBone = config.startBone;
        this.endBone = config.endBone;
        this.offset = config.offset || { x: 0, y: 0 };
        
        // Deformation State
        this.currentDeformation = {
            stretch: 1.0,
            compress: 1.0,
            twist: 0.0
        };
        
        // Style
        this.style = config.style || 'default';
    }

    update(dt) {
        // Base update logic
    }

    getRenderData() {
        return {
            type: this.type,
            x: 0, y: 0, // Calculated in renderer
            width: this.width,
            length: this.length,
            rotation: 0
        };
    }
}

class MassSphere extends MassShape {
    constructor(config) {
        super({ ...config, type: 'sphere' });
        this.radius = config.radius || this.width / 2;
    }
    
    // Spheres maintain volume perfectly
    calculateDeformation(stretchFactor) {
        // If stretched, it might become an ellipsoid
        // Volume = 4/3 * pi * r1 * r2 * r3
        // If length increases (stretch), width must decrease to maintain volume
    }
}

class MassOvoid extends MassShape {
    constructor(config) {
        super({ ...config, type: 'ovoid' });
        this.taper = config.taper || 0.8; // How much one end is smaller than the other
    }
}

class MassSausage extends MassShape {
    constructor(config) {
        super({ ...config, type: 'sausage' });
        this.curve = config.curve || 0;
    }
}

class MassCylinder extends MassShape {
    constructor(config) {
        super({ ...config, type: 'cylinder' });
    }
}

class MassShapeLibrary {
    static get shapes() {
        return {
            sphere: MassSphere,
            mass_sphere: MassSphere,
            ovoid: MassOvoid,
            mass_ovoid: MassOvoid,
            sausage: MassSausage,
            mass_sausage: MassSausage,
            cylinder: MassCylinder,
            mass_cylinder: MassCylinder
        };
    }

    static createShape(type, config) {
        const ShapeClass = MassShapeLibrary.shapes[type];
        if (!ShapeClass) {
            console.warn(`Unknown mass shape type: ${type}`);
            return new MassShape(config);
        }
        return new ShapeClass(config);
    }
}

// Export globally
window.MassShapeLibrary = MassShapeLibrary;
window.MassShape = MassShape;
window.MassSphere = MassSphere;
window.MassOvoid = MassOvoid;
window.MassSausage = MassSausage;
window.MassCylinder = MassCylinder;
