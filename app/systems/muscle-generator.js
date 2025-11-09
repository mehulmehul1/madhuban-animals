/**
 * Muscle Auto-Generation System
 * =============================
 * Automatically generates muscles for a creature based on skeleton structure and locomotion type.
 * Uses shape types and mappings to create behavioral muscle definitions.
 */

/**
 * Main function: Generate muscles for a creature
 * @param {string} creatureName - Name of the creature (e.g., 'horse')
 * @param {Object} skeleton - Skeleton object with bones array
 * @param {string} locomotionType - Type of locomotion (e.g., 'erect_quadruped')
 * @returns {Array} Array of generated muscle objects
 */
function generateMusclesTours(creatureName, skeleton, locomotionType) {
    // Validate inputs
    if (!MUSCLE_MAPPINGS || typeof MUSCLE_MAPPINGS !== 'object') {
        console.error('MUSCLE_MAPPINGS not loaded');
        return [];
    }
    if (!MUSCLE_SHAPE_TYPES || typeof MUSCLE_SHAPE_TYPES !== 'object') {
        console.error('MUSCLE_SHAPE_TYPES not loaded');
        return [];
    }

    const mapping = MUSCLE_MAPPINGS[locomotionType];
    if (!mapping) {
        console.warn(`Unknown locomotion type: ${locomotionType}`);
        return [];
    }

    const muscles = [];
    let muscleCounter = 0;

    // For each region in the mapping
    for (const [regionName, regionConfig] of Object.entries(mapping)) {
        try {
            const regionBones = findBonesByRegion(skeleton, regionName);
            
            if (regionBones.length === 0) {
                console.warn(`No bones found for region: ${regionName}`);
                continue;
            }

            // Handle special attachment patterns (e.g., spine_to_femur)
            if (regionConfig.attachmentPattern === 'spine_to_femur') {
                // Special case: attach from spine to femur (not sequential)
                const spineBones = findBonesByRegion(skeleton, 'spine');
                const femoralBones = findBonesByRegion(skeleton, regionName.replace('_compression', '_limb'));
                
                if (spineBones.length > 0 && femoralBones.length > 0) {
                    // Create muscle from last spine bone to first femoral bone
                    const startBone = spineBones[spineBones.length - 1];
                    const endBone = femoralBones[0];
                    
                    const muscle = createMuscle(
                        creatureName,
                        regionName,
                        muscleCounter++,
                        startBone,
                        endBone,
                        regionConfig
                    );
                    muscles.push(muscle);
                }
                continue;
            }

            // Generate muscle for each consecutive bone pair in region
            for (let i = 0; i < regionBones.length - 1; i++) {
                const startBone = regionBones[i];
                const endBone = regionBones[i + 1];

                const muscle = createMuscle(
                    creatureName,
                    regionName,
                    muscleCounter++,
                    startBone,
                    endBone,
                    regionConfig
                );

                muscles.push(muscle);
            }
        } catch (error) {
            console.error(`Error generating muscles for region ${regionName}:`, error);
        }
    }

    return muscles;
}

/**
 * Helper: Create a single muscle object
 * @param {string} creatureName - Creature name
 * @param {string} regionName - Region name
 * @param {number} counter - Muscle counter (for unique IDs)
 * @param {Object} startBone - Start bone object
 * @param {Object} endBone - End bone object
 * @param {Object} regionConfig - Region configuration from mapping
 * @returns {Object} Muscle object
 */
function createMuscle(creatureName, regionName, counter, startBone, endBone, regionConfig) {
    // Get shape type definition
    const shapeType = MUSCLE_SHAPE_TYPES[regionConfig.shapeType];
    
    if (!shapeType) {
        throw new Error(`Shape type not found: ${regionConfig.shapeType}`);
    }

    // Calculate rest length and angle from skeleton
    const startPos = startBone.pos || { x: startBone.x || 0, y: startBone.y || 0 };
    const endPos = endBone.pos || { x: endBone.x || 0, y: endBone.y || 0 };

    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const restLength = Math.sqrt(dx * dx + dy * dy);
    const restAngle = Math.atan2(dy, dx) * 180 / Math.PI;

    return {
        // Core properties
        id: `${creatureName}_${regionName}_${counter}`,
        name: `${regionName} #${counter}`,
        
        // Skeletal attachment
        startJoint: startBone.id,
        endJoint: endBone.id,
        
        // Rest state properties
        restLength: restLength,
        restAngle: restAngle,
        
        // Visual properties
        width: regionConfig.baseWidth,
        sensitivity: regionConfig.sensitivity,
        
        // Behavioral properties
        type: regionConfig.shapeType,
        group: regionName,
        shapeType: regionConfig.shapeType,
        
        // Deformation rules from shape type
        deformationRules: {
            stretch: { ...shapeType.deformationRules.stretch },
            compress: { ...shapeType.deformationRules.compress },
            twist: { ...shapeType.deformationRules.twist }
        },
        
        // Width range
        widthRange: { ...shapeType.widthRange },
        
        // Twist sensitivity
        twistSensitivity: shapeType.twistSensitivity,
        
        // Metadata
        description: regionConfig.description || `Auto-generated muscle for ${regionName}`,
        attachmentPattern: regionConfig.attachmentPattern || 'sequential'
    };
}

/**
 * Find bones in a skeleton by region name
 * Uses regex pattern matching to identify anatomical regions
 * @param {Object} skeleton - Skeleton object with bones array
 * @param {string} regionName - Region name (e.g., 'front_left_limb', 'spine')
 * @returns {Array} Array of bone objects in correct anatomical order
 */
function findBonesByRegion(skeleton, regionName) {
    // Pattern definitions for anatomical regions
    const patterns = {
        // FRONT LIMBS
        front_left_limb: /^frontLeft(?!.*flexor)/i,  // frontLeft but not flexor variant
        front_left_flexor: /^frontLeft/i,
        front_right_limb: /^frontRight(?!.*flexor)/i,
        front_right_flexor: /^frontRight/i,
        
        // HIND LIMBS
        hind_left_limb: /^hindLeft(?!.*lateral|compression)/i,
        hind_left_lateral: /^hindLeft/i,
        hind_left_compression: /^(spine|hindLeft)/i,  // Composite pattern
        hind_right_limb: /^hindRight(?!.*lateral|compression)/i,
        hind_right_lateral: /^hindRight/i,
        hind_right_compression: /^(spine|hindRight)/i,
        
        // BIPEDAL
        left_limb: /^left(?!.*flexor)/i,
        left_flexor: /^left/i,
        right_limb: /^right(?!.*flexor)/i,
        right_flexor: /^right/i,
        
        // BODY/SPINE
        spine: /^spine(\d+)?$/i,
        spine_deep: /^spine(\d+)?$/i,
        
        // TAIL
        tail: /^tail/i,
        
        // NECK/HEAD
        neck: /^neck/i,
        head: /^head/i,
        
        // FINS (aquatic)
        pectoral_fins: /^(pectoral|dorsal|fin)/i,
        dorsal_fin: /^(dorsal|fin)/i
    };

    const pattern = patterns[regionName];
    if (!pattern) {
        console.warn(`Unknown region pattern: ${regionName}`);
        return [];
    }

    // Get all bones matching the pattern
    let bones = (skeleton.bones || [])
        .filter(bone => {
            if (!bone || !bone.id) return false;
            return pattern.test(bone.id);
        });

    // Sort bones in anatomical order
    bones = sortBonesByAnatomicalOrder(bones, regionName);

    return bones;
}

/**
 * Sort bones by anatomical order (e.g., spine0, spine1, spine2)
 * @param {Array} bones - Array of bone objects
 * @param {string} regionName - Region name for context
 * @returns {Array} Sorted bone array
 */
function sortBonesByAnatomicalOrder(bones, regionName) {
    if (bones.length === 0) return bones;

    // Try to extract numeric indices from bone IDs
    const bonesWithIndex = bones.map(bone => {
        const match = bone.id.match(/\d+/);
        const index = match ? parseInt(match[0]) : -1;
        return { bone, index };
    });

    // If all have numeric indices, sort by them
    if (bonesWithIndex.every(item => item.index >= 0)) {
        return bonesWithIndex
            .sort((a, b) => a.index - b.index)
            .map(item => item.bone);
    }

    // Fallback: sort by position (left-to-right or top-to-bottom)
    if (regionName.includes('left') || regionName.includes('spine') || regionName.includes('neck')) {
        // For spine/neck: sort by distance from origin (sequential)
        return bones.sort((a, b) => {
            const posA = a.pos || { x: a.x || 0, y: a.y || 0 };
            const posB = b.pos || { x: b.x || 0, y: b.y || 0 };
            const distA = Math.sqrt(posA.x * posA.x + posA.y * posA.y);
            const distB = Math.sqrt(posB.x * posB.x + posB.y * posB.y);
            return distA - distB;
        });
    }

    return bones;
}

/**
 * Validate that all generated muscles have required fields
 * @param {Array} muscles - Array of generated muscles
 * @returns {Object} Validation report
 */
function validateGeneratedMuscles(muscles) {
    const requiredFields = [
        'id', 'name', 'startJoint', 'endJoint', 'restLength', 'restAngle',
        'width', 'sensitivity', 'type', 'group', 'deformationRules'
    ];

    const errors = [];
    
    muscles.forEach((muscle, index) => {
        const missingFields = requiredFields.filter(field => !(field in muscle));
        if (missingFields.length > 0) {
            errors.push({
                muscleId: muscle.id,
                index,
                missingFields
            });
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        muscleCount: muscles.length
    };
}

/**
 * Helper: Get muscle count by region
 * @param {Array} muscles - Array of generated muscles
 * @returns {Object} Muscle count by group
 */
function getMuscleCountByRegion(muscles) {
    const counts = {};
    muscles.forEach(muscle => {
        counts[muscle.group] = (counts[muscle.group] || 0) + 1;
    });
    return counts;
}
