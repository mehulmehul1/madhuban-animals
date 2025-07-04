/**
 * Shape Profile System - Geometric Primitives Approach
 * Artist approach: skeleton first, simple shapes second, details later
 * Uses basic geometric shapes instead of complex anatomical profiles
 */

class ShapeProfileSystem {
    constructor() {
        this.shapeCache = new Map();
    }

    /**
     * Get geometric shape profile for creature body parts
     * @param {string} creatureType - 'fish', 'crane', 'horse', 'lizard'
     * @param {string} bodyPart - 'torso', 'neck', 'leg', 'tail', 'spine'
     * @param {object} config - Additional configuration
     * @returns {function} Width function using geometric shapes
     */
    getWidthProfile(creatureType, bodyPart, config = {}) {
        const cacheKey = `${creatureType}-${bodyPart}-${JSON.stringify(config)}`;
        
        if (this.shapeCache.has(cacheKey)) {
            return this.shapeCache.get(cacheKey);
        }

        const baseShapeFunc = this.createGeometricShape(creatureType, bodyPart, config);
        const scale = config.scale || 1.0;
        
        // Apply scaling to the shape function
        const scaledShapeFunc = (t) => {
            return baseShapeFunc(t) * scale;
        };
        
        this.shapeCache.set(cacheKey, scaledShapeFunc);
        return scaledShapeFunc;
    }

    /**
     * Create geometric shape function - artist's basic forms approach
     */
    createGeometricShape(creatureType, bodyPart, config) {
        const shapes = this.getCreatureShapes(creatureType);
        const partShape = shapes[bodyPart] || shapes.default;
        
        return this.createShapeFunction(partShape.type, partShape.config);
    }

    /**
     * Get basic shape configurations for each creature
     * Based on artist's "3 main masses" principle: head, torso, pelvis
     */
    getCreatureShapes(creatureType) {
        const shapeConfigs = {
            fish: {
                spine: { type: 'tapered-cylinder', config: { startWidth: 24, endWidth: 6 } },
                default: { type: 'cylinder', config: { width: 12 } }
            },
            
            snake: {
                spine: { type: 'tapered-cylinder', config: { startWidth: 16, endWidth: 4 } },
                default: { type: 'cylinder', config: { width: 8 } }
            },
            
            crane: {
                // Artist's 3 main masses
                head: { type: 'ellipse', config: { width: 12, height: 10 } },
                neck: { type: 'tapered-cylinder', config: { startWidth: 6, endWidth: 8 } },
                torso: { type: 'ellipse', config: { width: 32, height: 24 } }, // Main mass 1
                leg: { type: 'tapered-cylinder', config: { startWidth: 8, endWidth: 4 } },
                wing: { type: 'ellipse', config: { width: 20, height: 8 } },
                default: { type: 'cylinder', config: { width: 10 } }
            },
            
            horse: {
                // Artist's 3 main masses approach
                head: { type: 'ellipse', config: { width: 20, height: 16 } }, // Main mass 1
                neck: { type: 'tapered-cylinder', config: { startWidth: 12, endWidth: 16 } },
                torso: { type: 'ellipse', config: { width: 40, height: 10 } }, // Main mass 2 (largest)
                pelvis: { type: 'ellipse', config: { width: 32, height: 26 } }, // Main mass 3
                leg: { type: 'tapered-cylinder', config: { startWidth: 10, endWidth: 6 } },
                tail: { type: 'tapered-cylinder', config: { startWidth: 8, endWidth: 2 } },
                default: { type: 'cylinder', config: { width: 12 } }
            },
            
            lizard: {
                // Sprawling body structure
                head: { type: 'ellipse', config: { width: 14, height: 10 } },
                neck: { type: 'cylinder', config: { width: 6 } },
                torso: { type: 'ellipse', config: { width: 28, height: 18 } },
                leg: { type: 'tapered-cylinder', config: { startWidth: 6, endWidth: 4 } },
                tail: { type: 'tapered-cylinder', config: { startWidth: 10, endWidth: 2 } },
                default: { type: 'cylinder', config: { width: 8 } }
            }
        };
        
        return shapeConfigs[creatureType] || shapeConfigs.fish;
    }

    /**
     * Create shape function based on geometric primitive
     */
    createShapeFunction(shapeType, config) {
        switch (shapeType) {
            case 'rectangle':
                return this.createRectangleProfile(config);
            case 'cylinder':
                return this.createCylinderProfile(config);
            case 'ellipse':
                return this.createEllipseProfile(config);
            case 'tapered-cylinder':
                return this.createTaperedCylinderProfile(config);
            case 'capsule':
                return this.createCapsuleProfile(config);
            default:
                return this.createCylinderProfile(config);
        }
    }

    /**
     * Rectangle - Uniform width, good for torso, simple limbs
     */
    createRectangleProfile(config) {
        const width = config.width || 20;
        
        return (t) => {
            return width; // Constant width
        };
    }

    /**
     * Cylinder - Rounded uniform width, good for neck, arms
     */
    createCylinderProfile(config) {
        const width = config.width || 16;
        
        return (t) => {
            return width; // Constant width with rounded ends
        };
    }

    /**
     * Ellipse - Oval cross-section, good for muscle groups, fish body
     */
    createEllipseProfile(config) {
        const width = config.width || 24;
        const height = config.height || width * 0.7;
        
        return (t) => {
            // Ellipse width varies along length (simulates oval cross-section)
            const centerT = 0.5;
            const distFromCenter = Math.abs(t - centerT) * 2; // 0 at center, 1 at ends
            const widthFactor = Math.sqrt(1 - distFromCenter * distFromCenter); // Ellipse equation
            return width * widthFactor;
        };
    }

    /**
     * Tapered Cylinder - Gradual width change, perfect for tail, legs
     */
    createTaperedCylinderProfile(config) {
        const startWidth = config.startWidth || 20;
        const endWidth = config.endWidth || 8;
        
        return (t) => {
            // Linear taper from start to end
            return startWidth + (endWidth - startWidth) * t;
        };
    }

    /**
     * Capsule - Rounded rectangle, good for limbs with joints
     */
    createCapsuleProfile(config) {
        const width = config.width || 18;
        const tapering = config.tapering || 0.1; // Slight taper at ends
        
        return (t) => {
            // Slight taper at ends to create capsule effect
            const endFactor = Math.min(t, 1 - t) * 2; // 0 at ends, 1 in middle
            const taperAmount = 1 - tapering + (tapering * endFactor);
            return width * taperAmount;
        };
    }

    /**
     * Generic fallback profile
     */
    getGenericProfile() {
        return (t) => 12; // Simple constant width
    }

    /**
     * Get width profile for specific chain configuration - maintains compatibility
     */
    getProfileForChain(creatureType, chainConfig) {
        const bodyPart = this.mapChainToBodyPart(chainConfig);
        const scale = chainConfig.scale || 1.0;
        
        return this.getWidthProfile(creatureType, bodyPart, {
            scale: scale,
            role: chainConfig.role,
            type: chainConfig.type
        });
    }

    /**
     * Map chain configuration to body part type
     */
    mapChainToBodyPart(chainConfig) {
        const role = chainConfig.role.toLowerCase();
        const type = chainConfig.type.toLowerCase();

        // Direct mapping from chain type
        if (['torso', 'neck', 'leg', 'tail', 'wing', 'fin'].includes(type)) {
            return type;
        }

        // Map from role
        if (role.includes('spine') || role.includes('body')) return 'torso';
        if (role.includes('neck')) return 'neck';
        if (role.includes('leg')) return 'leg';
        if (role.includes('tail')) return 'tail';
        if (role.includes('wing')) return 'wing';
        if (role.includes('fin')) return 'fin';

        // Default based on type
        return type || 'torso';
    }

    /**
     * Apply width profile to bone chain
     */
    applyWidthToChain(chain, widthProfile, config = {}) {
        if (!chain || !chain.bones || chain.bones.length === 0) return;

        const bones = chain.bones;
        const totalBones = bones.length;

        bones.forEach((bone, index) => {
            const t = totalBones > 1 ? index / (totalBones - 1) : 0.5;
            const width = widthProfile(t);
            
            // Store width and shape info on bone
            bone.renderWidth = width;
            bone.shapeProfile = {
                width: width,
                position: t,
                config: config
            };
        });
    }
}

// Export for use in creature builder
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShapeProfileSystem;
} else if (typeof window !== 'undefined') {
    window.ShapeProfileSystem = ShapeProfileSystem;
}
