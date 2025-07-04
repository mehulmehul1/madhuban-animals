/**
 * Geometric Shape System - Artist-inspired basic forms for creature construction
 * Based on how artists approach figure drawing: skeleton first, simple shapes second, details later
 */

class GeometricShapeSystem {
    /**
     * Generate basic geometric shape profiles for bone chains
     * @param {string} shapeType - Shape primitive type
     * @param {Object} config - Shape configuration
     * @returns {Function} Width function for the shape
     */
    static createShapeProfile(shapeType, config = {}) {
        switch (shapeType) {
            case 'rectangle':
                return this.createRectangle(config);
            case 'cylinder':
                return this.createCylinder(config);
            case 'ellipse':
                return this.createEllipse(config);
            case 'tapered-cylinder':
                return this.createTaperedCylinder(config);
            case 'capsule':
                return this.createCapsule(config);
            case 'sphere':
                return this.createSphere(config);
            default:
                return this.createCylinder(config); // Default fallback
        }
    }

    /**
     * Rectangle - Uniform width for torso, simple limbs
     */
    static createRectangle(config) {
        const width = config.width || 20;
        const height = config.height || width;
        
        return (position) => {
            return {
                width: width,
                height: height,
                shape: 'rectangle'
            };
        };
    }

    /**
     * Cylinder - Rounded uniform width for neck, arms
     */
    static createCylinder(config) {
        const radius = config.radius || 10;
        
        return (position) => {
            return {
                width: radius * 2,
                height: radius * 2,
                shape: 'cylinder'
            };
        };
    }

    /**
     * Ellipse - Oval cross-section for muscle groups, fish body
     */
    static createEllipse(config) {
        const width = config.width || 20;
        const height = config.height || width * 0.6;
        
        return (position) => {
            return {
                width: width,
                height: height,
                shape: 'ellipse'
            };
        };
    }

    /**
     * Tapered Cylinder - Gradual width change for tail, legs
     */
    static createTaperedCylinder(config) {
        const startRadius = config.startRadius || 15;
        const endRadius = config.endRadius || 5;
        
        return (position) => {
            // Position is 0.0 to 1.0 along the bone chain
            const t = Math.max(0, Math.min(1, position));
            const radius = startRadius + (endRadius - startRadius) * t;
            
            return {
                width: radius * 2,
                height: radius * 2,
                shape: 'tapered-cylinder'
            };
        };
    }

    /**
     * Capsule - Rounded rectangle for limbs with joints
     */
    static createCapsule(config) {
        const width = config.width || 16;
        const height = config.height || width * 3;
        const cornerRadius = config.cornerRadius || width * 0.4;
        
        return (position) => {
            return {
                width: width,
                height: height,
                cornerRadius: cornerRadius,
                shape: 'capsule'
            };
        };
    }

    /**
     * Sphere - For joints (shoulders, elbows, knees)
     */
    static createSphere(config) {
        const radius = config.radius || 8;
        
        return (position) => {
            return {
                width: radius * 2,
                height: radius * 2,
                shape: 'sphere'
            };
        };
    }

    /**
     * Get creature-specific shape configurations
     * Artist approach: 3 main masses (head, torso, pelvis) + simple limbs
     */
    static getCreatureShapes(creatureType) {
        const shapes = {
            fish: {
                spine: { type: 'tapered-cylinder', config: { startRadius: 12, endRadius: 3 } },
                fins: { type: 'ellipse', config: { width: 8, height: 4 } }
            },
            
            snake: {
                spine: { type: 'tapered-cylinder', config: { startRadius: 8, endRadius: 2 } }
            },
            
            crane: {
                // 3 main masses approach
                head: { type: 'ellipse', config: { width: 8, height: 6 } },
                neck: { type: 'tapered-cylinder', config: { startRadius: 3, endRadius: 4 } },
                torso: { type: 'ellipse', config: { width: 18, height: 12 } },
                legs: { type: 'tapered-cylinder', config: { startRadius: 4, endRadius: 2 } },
                wings: { type: 'ellipse', config: { width: 15, height: 6 } }
            },
            
            horse: {
                // 3 main masses: head, torso, pelvis
                head: { type: 'ellipse', config: { width: 12, height: 8 } },
                neck: { type: 'tapered-cylinder', config: { startRadius: 6, endRadius: 8 } },
                torso: { type: 'ellipse', config: { width: 25, height: 18 } }, // Main mass
                pelvis: { type: 'ellipse', config: { width: 20, height: 15 } }, // Main mass
                legs: { type: 'tapered-cylinder', config: { startRadius: 5, endRadius: 3 } },
                tail: { type: 'tapered-cylinder', config: { startRadius: 4, endRadius: 1 } }
            },
            
            lizard: {
                // Sprawling body structure
                head: { type: 'ellipse', config: { width: 8, height: 6 } },
                neck: { type: 'cylinder', config: { radius: 3 } },
                torso: { type: 'ellipse', config: { width: 16, height: 10 } },
                legs: { type: 'tapered-cylinder', config: { startRadius: 3, endRadius: 2 } },
                tail: { type: 'tapered-cylinder', config: { startRadius: 5, endRadius: 1 } }
            }
        };
        
        return shapes[creatureType] || shapes.fish; // Default fallback
    }

    /**
     * Apply geometric shape to bone chain - replaces complex anatomical profiles
     */
    static applyShapeToChain(chain, shapeConfig) {
        if (!chain || !chain.bones) return;
        
        const shapeProfile = this.createShapeProfile(shapeConfig.type, shapeConfig.config);
        const totalLength = chain.bones.length;
        
        chain.bones.forEach((bone, index) => {
            const position = totalLength > 1 ? index / (totalLength - 1) : 0;
            const shapeData = shapeProfile(position);
            
            // Store shape data on bone for rendering
            bone.shapeData = shapeData;
        });
    }
}

// Export for use in other systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeometricShapeSystem;
} else if (typeof window !== 'undefined') {
    window.GeometricShapeSystem = GeometricShapeSystem;
}
