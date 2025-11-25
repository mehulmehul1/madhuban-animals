/**
 * Muscle Generation Strategies
 * Defines how muscles are created for different anatomical regions.
 */

window.MuscleStrategies = {
  /**
   * Mass Strategy: Merges multiple bones into a single large muscle.
   * Used for: Torso, Spine, Pelvis
   */
  mass: (chain, config, muscleIdCounter) => {
    const muscles = [];
    const bones = chain.bones;
    const mergeCount = config.mergeCount || 3;
    
    // Iterate through bones in chunks
    for (let i = 0; i < bones.length; i += mergeCount) {
      let endIndex = Math.min(i + mergeCount, bones.length) - 1;
      
      if (endIndex < i) endIndex = i; 
      
      const startBone = bones[i];
      const endBone = bones[endIndex];
      
      if (!startBone || !endBone) continue;

      // Extract the bones in this span for circle-chain rendering
      const bonesInSpan = bones.slice(i, endIndex + 1);

      muscles.push({
        id: `muscle_${muscleIdCounter.count++}`,
        startJoint: startBone.id,
        endJoint: endBone.id,
        type: 'compression_mass',
        shapeType: config.shape || 'block',
        strategy: 'mass',
        span: endIndex - i + 1,
        bones: bonesInSpan  // ← ADD THIS: Pass bones for circle-chain rendering
      });
    }
    return muscles;
  },

  /**
   * Limb Strategy: Muscles span between consecutive bones.
   * Used for: Legs, Arms
   */
  limb: (chain, config, muscleIdCounter) => {
    const muscles = [];
    const bones = chain.bones;
    
    // Create muscles that span from one bone to the next
    // This creates proper muscle shapes that can deform
    for (let i = 0; i < bones.length - 1; i++) {
      const startBone = bones[i];
      const endBone = bones[i + 1];
      
      muscles.push({
        id: `muscle_${muscleIdCounter.count++}`,
        startJoint: startBone.id,
        endJoint: endBone.id,
        type: 'extending_limb_muscle',
        shapeType: config.shape || 'spindle',
        strategy: 'limb'
      });
    }
    
    // Optionally add a muscle for the last bone if the chain is short
    if (bones.length === 1) {
      muscles.push({
        id: `muscle_${muscleIdCounter.count++}`,
        startJoint: bones[0].id,
        endJoint: bones[0].id, // Single bone case
        type: 'extending_limb_muscle',
        shapeType: config.shape || 'spindle',
        strategy: 'limb'
      });
    }
    
    return muscles;
  },

  /**
   * Segment Strategy: Continuous chain for flexible appendages.
   * Used for: Tentacles, Snakes
   */
  segment: (chain, config, muscleIdCounter) => {
    const muscles = [];
    const bones = chain.bones;
    
    // Create muscles spanning between consecutive bones
    for (let i = 0; i < bones.length - 1; i++) {
      const startBone = bones[i];
      const endBone = bones[i + 1];
      
      muscles.push({
        id: `muscle_${muscleIdCounter.count++}`,
        startJoint: startBone.id,
        endJoint: endBone.id,
        type: 'extending_limb_muscle',
        shapeType: config.shape || 'spindle',
        strategy: 'segment'
      });
    }
    return muscles;
  }
};
