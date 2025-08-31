/**
 * Shape Profile System for Madhuban Creatures
 * Generates anatomically accurate width profiles for different body parts
 * Uses anatomical-data.js for research-based proportions
 */

class ShapeProfileSystem {
    constructor() {
        this.baseWidth = 30; // Base width multiplier for scaling
        this.profileCache = new Map();
    }

    /**
     * Get width profile function for a specific creature and body part
     * @param {string} creatureType - 'fish', 'crane', 'horse', 'lizard'
     * @param {string} bodyPart - 'torso', 'neck', 'leg', 'tail', 'spine'
     * @param {object} config - Additional configuration (scale, role, etc.)
     * @returns {function} Width function that takes t (0-1) and returns width
     */
    getWidthProfile(creatureType, bodyPart, config = {}) {
        const cacheKey = `${creatureType}-${bodyPart}-${JSON.stringify(config)}`;
        
        if (this.profileCache.has(cacheKey)) {
            return this.profileCache.get(cacheKey);
        }

        const widthFunc = this.createWidthFunction(creatureType, bodyPart, config);
        this.profileCache.set(cacheKey, widthFunc);
        return widthFunc;
    }

    /**
     * Create width function based on creature anatomy
     */
    createWidthFunction(creatureType, bodyPart, config) {
        const anatomyData = AnatomicalData[creatureType.toUpperCase()];
        if (!anatomyData) {
            return this.getGenericProfile();
        }

        const scale = config.scale || 1.0;
        const role = config.role || bodyPart;

        switch (creatureType.toLowerCase()) {
            case 'fish':
                return this.createFishProfile(anatomyData, bodyPart, scale);
            case 'crane':
                return this.createCraneProfile(anatomyData, bodyPart, scale, role);
            case 'horse':
                return this.createHorseProfile(anatomyData, bodyPart, scale, role);
            case 'lizard':
                return this.createLizardProfile(anatomyData, bodyPart, scale, role);
            default:
                return this.getGenericProfile();
        }
    }

    /**
     * Fish Profile - Streamlined torpedo shape
     */
    createFishProfile(data, bodyPart, scale) {
        const baseWidth = this.baseWidth * scale;

        if (bodyPart === 'spine' || bodyPart === 'body') {
            // Main fish body - torpedo shape
            return (t) => {
                const width = AnatomicalData.getWidthAtPosition('fish', 'widthProfile', t);
                return baseWidth * width;
            };
        } else if (bodyPart === 'fin') {
            // Fins - tapered from base to tip
            return (t) => {
                return baseWidth * 0.3 * (1 - t * 0.8); // Tapers to 20% at tip
            };
        }
        
        return (t) => baseWidth * 0.5; // Default fin width
    }

    /**
     * Crane Profile - Thin neck, compact body, slender legs
     */
    createCraneProfile(data, bodyPart, scale, role) {
        const baseWidth = this.baseWidth * scale;

        switch (bodyPart) {
            case 'torso':
            case 'body':
                // Compact body profile
                return (t) => {
                    const width = AnatomicalData.getWidthAtPosition('crane', 'torso', t);
                    return baseWidth * width * data.proportions.torsoWidth;
                };

            case 'neck':
                // Long thin neck with slight head bulge
                return (t) => {
                    const width = AnatomicalData.getWidthAtPosition('crane', 'neck', t);
                    return baseWidth * width * 0.5; // Scale down for neck
                };

            case 'leg':
                // Slender legs, thicker at joints
                return (t) => {
                    const width = AnatomicalData.getWidthAtPosition('crane', 'leg', t);
                    // Add joint bulges at knee and ankle
                    const jointBulge = this.getJointBulge(t, [0.25, 0.75], 1.3);
                    return baseWidth * width * data.proportions.legWidth * jointBulge;
                };

            case 'tail':
                // Small tail feathers
                return (t) => {
                    return baseWidth * 0.15 * (1 - t * 0.5); // Tapered
                };

            case 'wing':
                // Wing profile
                return (t) => {
                    return baseWidth * 0.2 * (1 - t * 0.6); // Tapered wing
                };
        }

        return (t) => baseWidth * 0.3; // Default
    }

    /**
     * Horse Profile - Muscular barrel chest, thick legs
     */
    createHorseProfile(data, bodyPart, scale, role) {
        const baseWidth = this.baseWidth * scale;

        switch (bodyPart) {
            case 'torso':
            case 'body':
                // Barrel chest profile
                return (t) => {
                    const width = AnatomicalData.getWidthAtPosition('horse', 'torso', t);
                    return baseWidth * width * data.proportions.bodyWidth;
                };

            case 'neck':
                // Strong neck
                return (t) => {
                    const width = AnatomicalData.getWidthAtPosition('horse', 'neck', t);
                    return baseWidth * width * 0.7; // Substantial neck
                };

            case 'leg':
                // Muscular legs with defined joints
                return (t) => {
                    const width = AnatomicalData.getWidthAtPosition('horse', 'leg', t);
                    // Emphasize muscle definition and joints
                    const jointBulge = this.getJointBulge(t, [0.3, 0.65], 1.2);
                    const muscleBulge = this.getMuscleDefinition(t, role);
                    return width * data.proportions.legWidth * jointBulge * muscleBulge;
                };

            case 'tail':
                // Thick tail base, flowing hair
                return (t) => {
                    return baseWidth * 0.25 * (0.8 - t * 0.3); // Gradual taper
                };
        }

        return (t) => baseWidth * 0.4; // Default
    }

    /**
     * Lizard Profile - Low, elongated body, thin limbs
     */
    createLizardProfile(data, bodyPart, scale, role) {
        const baseWidth = this.baseWidth * scale;

        switch (bodyPart) {
            case 'torso':
            case 'body':
            case 'spine':
                // Low, wide body
                return (t) => {
                    const width = AnatomicalData.getWidthAtPosition('lizard', 'torso', t);
                    return baseWidth * width * data.proportions.bodyWidth;
                };

            case 'tail':
                // Long tapering tail
                return (t) => {
                    const width = AnatomicalData.getWidthAtPosition('lizard', 'tail', t);
                    return baseWidth * width * 0.8; // Scale for tail
                };

            case 'leg':
                // Thin sprawling legs
                return (t) => {
                    const width = AnatomicalData.getWidthAtPosition('lizard', 'leg', t);
                    // Minimal joint definition
                    const jointBulge = this.getJointBulge(t, [0.4, 0.8], 1.1);
                    return baseWidth * width * data.proportions.legWidth * jointBulge;
                };

            case 'neck':
                // Continuous with body
                return (t) => {
                    return baseWidth * 0.4 * (1 - t * 0.2); // Slight taper to head
                };
        }

        return (t) => baseWidth * 0.2; // Default thin
    }

    /**
     * Add joint bulges at specific positions
     */
    getJointBulge(t, jointPositions, bulgeAmount) {
        let bulge = 1.0;
        const bulgeWidth = 0.1; // Width of bulge effect

        for (const jointPos of jointPositions) {
            const distance = Math.abs(t - jointPos);
            if (distance < bulgeWidth) {
                const bulgeIntensity = 1 - (distance / bulgeWidth);
                bulge *= 1 + (bulgeAmount - 1) * bulgeIntensity;
            }
        }

        return bulge;
    }

    /**
     * Add muscle definition based on leg role
     */
    getMuscleDefinition(t, role) {
        if (role && role.includes('front')) {
            // Front legs - more muscle in upper portion
            return 1 + 0.3 * Math.exp(-t * 3); // Exponential decay from shoulder
        } else if (role && role.includes('back')) {
            // Back legs - power muscles in middle
            return 1 + 0.4 * Math.exp(-Math.pow((t - 0.3) * 4, 2)); // Gaussian at 30%
        }
        return 1.0;
    }

    /**
     * Generic fallback profile
     */
    getGenericProfile() {
        return (t) => {
            return this.baseWidth * (0.5 + 0.5 * (1 - Math.pow(2 * t - 1, 2)));
        };
    }

    /**
     * Get profile for specific chain configuration
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
     * Utility: Create width function from profile points
     */
    static createInterpolatedProfile(profilePoints, baseWidth = 30) {
        return (t) => {
            // Find the two points to interpolate between
            for (let i = 0; i < profilePoints.length - 1; i++) {
                if (t >= profilePoints[i].t && t <= profilePoints[i + 1].t) {
                    const ratio = (t - profilePoints[i].t) / (profilePoints[i + 1].t - profilePoints[i].t);
                    const width = profilePoints[i].width + ratio * (profilePoints[i + 1].width - profilePoints[i].width);
                    return baseWidth * width;
                }
            }
            
            // Handle edge cases
            if (t <= profilePoints[0].t) return baseWidth * profilePoints[0].width;
            return baseWidth * profilePoints[profilePoints.length - 1].width;
        };
    }
}
