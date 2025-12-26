/**
 * Ribcage Muscle System
 * ====================
 * Scalable ribcage muscle that automatically adapts to any creature
 * Detects creature properties and scales accordingly
 */

class RibcageMuscle {
  constructor(skeleton) {
    this.skeleton = skeleton;
    this.properties = this.analyzeCreature(skeleton);
    this.config = this.generateConfig();
    this.attachments = this.calculateAttachments();
  }

  /**
   * Analyze creature skeleton to determine properties
   */
  analyzeCreature(skeleton) {
    const spineChain = skeleton.chains.find(c =>
      c.role === 'body' || c.role === 'spine' || c.config?.role === 'body'
    );

    if (!spineChain || !spineChain.bones) {
      return {
        spineLength: 100,
        bodyType: 'slender',
        hasLimbs: false
      };
    }

    // Calculate spine length
    let spineLength = 0;
    spineChain.bones.forEach(bone => {
      const dx = bone.end.x - bone.start.x;
      const dy = bone.end.y - bone.start.y;
      spineLength += Math.sqrt(dx * dx + dy * dy);
    });

    // Detect body type
    const limbChains = skeleton.chains.filter(c => {
      const role = c.role || c.config?.role || '';
      return role.includes('leg') || role.includes('arm');
    });

    const hasLimbs = limbChains.length > 0;
    let bodyType = 'slender';

    if (hasLimbs) {
      // Calculate average limb length
      let totalLimbLength = 0;
      let limbCount = 0;

      limbChains.forEach(chain => {
        if (chain.bones) {
          chain.bones.forEach(bone => {
            const dx = bone.end.x - bone.start.x;
            const dy = bone.end.y - bone.start.y;
            totalLimbLength += Math.sqrt(dx * dx + dy * dy);
            limbCount++;
          });
        }
      });

      const avgLimbLength = totalLimbLength / limbCount;
      const spineToLimbRatio = spineLength / avgLimbLength;

      // Determine body type based on proportions
      if (spineToLimbRatio < 0.6) {
        bodyType = 'stocky';      // Horse-like, thick body
      } else if (spineToLimbRatio > 1.2) {
        bodyType = 'serpentine'; // Snake-like, long body
      } else {
        bodyType = 'slender';   // Lizard-like, lean body
      }
    } else {
      // No limbs - check for aquatic features
      bodyType = 'aquatic';
    }

    return {
      spineLength,
      bodyType,
      hasLimbs,
      spineChain
    };
  }

  /**
   * Generate configuration based on creature properties
   */
  generateConfig() {
    const baseProportions = {
      widthToLength: 0.6,
      depthToLength: 0.4,
      positionOffset: 0.25
    };

    // Body type modifiers
    const modifiers = {
      stocky: { width: 1.4, depth: 1.2 },    // Horse: broad chest
      slender: { width: 0.6, depth: 0.5 },   // Lizard: streamlined
      serpentine: { width: 0.3, depth: 0.3 }, // Snake: thin body
      aquatic: { width: 0.8, depth: 1.0 },    // Fish: torpedo shape
      default: { width: 0.8, depth: 0.6 }     // Fallback
    };

    const modifier = modifiers[this.properties.bodyType] || modifiers.default;

    return {
      spineRange: { start: 0.2, end: 0.7 }, // Ribcage covers middle portion of spine
      size: {
        width: this.properties.spineLength * baseProportions.widthToLength * modifier.width,
        height: this.properties.spineLength * baseProportions.depthToLength * modifier.depth
      },
      offset: this.properties.spineLength * baseProportions.positionOffset
    };
  }

  /**
   * Calculate attachment points on spine bones
   */
  calculateAttachments() {
    if (!this.properties.spineChain) return null;

    const bones = this.properties.spineChain.bones;
    const startIdx = Math.floor(bones.length * this.config.spineRange.start);
    const endIdx = Math.floor(bones.length * this.config.spineRange.end);

    return {
      bones: bones.slice(startIdx, endIdx),
      startBone: bones[startIdx],
      endBone: bones[endIdx]
    };
  }

  /**
   * Calculate center position of ribcage
   */
  calculateCenter() {
    if (!this.attachments || !this.attachments.bones.length) {
      return { x: 300, y: 300 }; // Fallback position
    }

    let sumX = 0, sumY = 0;
    let count = 0;

    this.attachments.bones.forEach(bone => {
      const midX = (bone.start.x + bone.end.x) / 2;
      const midY = (bone.start.y + bone.end.y) / 2;
      sumX += midX;
      sumY += midY;
      count++;
    });

    return {
      x: sumX / count,
      y: sumY / count
    };
  }

  /**
   * Calculate rotation angle based on spine orientation
   */
  calculateRotation() {
    if (!this.attachments || !this.attachments.startBone || !this.attachments.endBone) {
      return 0;
    }

    const start = this.attachments.startBone;
    const end = this.attachments.endBone;

    const dx = end.end.x - start.start.x;
    const dy = end.end.y - start.start.y;

    return Math.atan2(dy, dx);
  }

  /**
   * Get muscle data for rendering (compatible with existing system)
   */
  getMuscleData() {
    const center = this.calculateCenter();
    const rotation = this.calculateRotation();

    return {
      type: 'ovoid',
      boneIds: this.attachments ? this.attachments.bones.map(b => b.id) : [],
      widthRatio: this.config.size.width / this.properties.spineLength,
      heightRatio: this.config.size.height / this.properties.spineLength,
      rotation: rotation,
      offset: this.config.offset,
      center: center,
      role: 'ribcage',
      spineLength: this.properties.spineLength, // Add spine length for rendering
      creatureInfo: {
        bodyType: this.properties.bodyType,
        spineLength: this.properties.spineLength
      }
    };
  }

  /**
   * Debug information
   */
  getDebugInfo() {
    return {
      bodyType: this.properties.bodyType,
      spineLength: this.properties.spineLength,
      hasLimbs: this.properties.hasLimbs,
      config: this.config,
      attachments: this.attachments ? {
        boneCount: this.attachments.bones.length,
        startIdx: Math.floor(this.properties.spineChain.bones.length * this.config.spineRange.start),
        endIdx: Math.floor(this.properties.spineChain.bones.length * this.config.spineRange.end)
      } : null
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RibcageMuscle;
} else {
  window.RibcageMuscle = RibcageMuscle;
}