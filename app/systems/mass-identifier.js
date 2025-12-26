/**
 * Mass Identifier
 * ================
 * Identifies anatomical masses from skeleton structure.
 * Converts bone chains into discrete geometric volumes.
 * 
 * NOW STORES BONE IDS - positions calculated dynamically each frame!
 */

(function(global) {
  'use strict';
  
  class MassIdentifier {
    constructor() {
      // Helper to calculate distance
      this.dist = (p1, p2) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
      };
    }

    /**
     * Identify ribcage mass from torso/spine bones
     * NOW RETURNS BONE IDS instead of positions
     */
    identifyThorax(skeleton, creatureType) {
      const spineChain = skeleton.chains.find(c =>
        c.role === 'body' || c.role === 'spine' || c.config?.role === 'body'
      );

      if (!spineChain || !spineChain.bones || spineChain.bones.length < 2) return null;

      const bones = spineChain.bones;
      const startIdx = Math.floor(bones.length * 0.4);
      const endIdx = Math.floor(bones.length * 0.6);

      if (endIdx <= startIdx) return null;

      const boneIds = bones.slice(startIdx, endIdx).map(bone => bone.id);

      // Width multiplier based on creature type
      let widthRatio = 0.7;
      if (creatureType === 'horse' || creatureType === 'quadruped') {
        widthRatio = 0.9;  // Horse has broad chest
      } else if (creatureType === 'lizard') {
        widthRatio = 0.4;
      }

      return {
        type: 'ovoid',
        boneIds: boneIds,
        widthRatio: widthRatio,
        role: 'thorax'
      };
    }

    identifyAbdomen(skeleton, creatureType) {
      const spineChain = skeleton.chains.find(c =>
        c.role === 'body' || c.role === 'spine' || c.config?.role === 'body'
      );

      if (!spineChain || !spineChain.bones || spineChain.bones.length < 2) return null;

      const bones = spineChain.bones;
      const startIdx = Math.floor(bones.length * 0.6);
      const endIdx = Math.floor(bones.length * 0.85);

      if (endIdx <= startIdx) return null;

      const boneIds = bones.slice(startIdx, endIdx).map(bone => bone.id);

      let widthRatio = 0.6;
      if (creatureType === 'horse' || creatureType === 'quadruped') {
        widthRatio = 0.7;
      } else if (creatureType === 'lizard') {
        widthRatio = 0.45;
      }

      return {
        type: 'ovoid',
        boneIds: boneIds,
        widthRatio: widthRatio,
        role: 'abdomen'
      };
    }

    identifyRibcage(skeleton, creatureType) {
      const spineChain = skeleton.chains.find(c =>
        c.role === 'body' || c.role === 'spine' || c.config?.role === 'body'
      );

      if (!spineChain || !spineChain.bones || spineChain.bones.length < 2) return null;

      const bones = spineChain.bones;
      const startIdx = Math.floor(bones.length * 0.25);
      const endIdx = Math.floor(bones.length * 0.5);

      if (endIdx <= startIdx) return null;

      // Store bone IDs instead of positions
      const boneIds = bones.slice(startIdx, endIdx).map(bone => bone.id);

      // Width multiplier based on creature type
      let widthRatio = 0.6;
      if (creatureType === 'horse' || creatureType === 'quadruped') {
        widthRatio = 0.85;  // Horse has very broad ribcage
      } else if (creatureType === 'lizard') {
        widthRatio = 0.5;
      }

      return {
        type: 'ovoid',
        boneIds: boneIds,      // DYNAMIC - will calculate position each frame
        widthRatio: widthRatio, // Store ratio, not absolute width
        role: 'ribcage'
      };
    }

    identifyPelvis(skeleton, creatureType) {
      const spineChain = skeleton.chains.find(c => 
        c.role === 'body' || c.role === 'spine' || c.config?.role === 'body'
      );
      
      if (!spineChain || !spineChain.bones || spineChain.bones.length < 2) return null;
      
      const bones = spineChain.bones;
      const pelvisEndIdx = Math.floor(bones.length * 0.25);
      if (pelvisEndIdx < 1) return null;
      
      // Store bone IDs
      const boneIds = bones.slice(0, pelvisEndIdx).map(bone => bone.id);
      
      return {
        type: 'ovoid',
        boneIds: boneIds,
        widthRatio: 0.6,
        heightRatio: 0.7,  // Pelvis shorter than ribcage
        role: 'pelvis'
      };
    }

    identifyCranium(skeleton) {
      const neckChain = skeleton.chains.find(c => 
        c.role === 'neck' || c.config?.role === 'neck'
      );
      
      if (!neckChain || !neckChain.bones || neckChain.bones.length === 0) return null;
      
      const headBone = neckChain.bones[neckChain.bones.length - 1];
      
      return {
        type: 'sphere',
        boneIds: [headBone.id],  // Single bone for sphere
        radiusRatio: 0.8,        // Radius relative to bone length
        role: 'cranium'
      };
    }

    identifyLimbSegments(skeleton) {
      const limbs = [];

      const limbChains = skeleton.chains.filter(c => {
        const role = c.role || c.config?.role || '';
        return role.includes('leg') || role.includes('arm');
      });

      limbChains.forEach(chain => {
        if (!chain.bones || chain.bones.length < 2) return;

        for (let i = 0; i < chain.bones.length - 1; i++) {
          const bone1 = chain.bones[i];
          const bone2 = chain.bones[i + 1];

          // Calculate bone length for appropriate sizing
          const boneLength = Math.sqrt(
            Math.pow(bone2.end.x - bone1.start.x, 2) +
            Math.pow(bone2.end.y - bone1.start.y, 2)
          );

          // Taper factor - thicker at top, tapering down
          const taperFactor = 1.0 - (i / chain.bones.length) * 0.4;

          // Base radius as proportion of bone length - makes limbs more substantial
          const baseRadius = Math.max(10, boneLength * 0.2);

          limbs.push({
            type: 'cylinder',
            startBoneId: bone1.id,
            endBoneId: bone2.id,
            baseRadius: baseRadius,
            taperFactor: taperFactor,
            role: chain.role || chain.config?.role || 'limb'
          });
        }
      });

      return limbs;
    }

    identifyTorsoSausage(skeleton) {
      const spineChain = skeleton.chains.find(c => 
        c.role === 'body' || c.role === 'spine' || c.config?.role === 'body'
      );
      
      if (!spineChain || !spineChain.bones || spineChain.bones.length < 2) return null;
      
      const bones = spineChain.bones;
      const firstBone = bones[0];
      const lastBone = bones[bones.length - 1];
      
      return {
        type: 'sausage',
        startBoneId: firstBone.id,
        endBoneId: lastBone.id,
        radiusRatio: 0.25,  // Radius as ratio of length
        role: 'torso'
      };
    }

    identifyAllMasses(skeleton, creatureType, useSeparateMasses = true) {
      const masses = [];

      // NEW: Add scalable ribcage that works for all creatures
      if (typeof RibcageMuscle !== 'undefined') {
        console.log('[RIBCAGE] Creating ribcage for', creatureType);
        const ribcageMuscle = new RibcageMuscle(skeleton);
        const debugInfo = ribcageMuscle.getDebugInfo();
        console.log('[RIBCAGE] Debug info:', debugInfo);

        if (ribcageMuscle.attachments) {
          const ribcageData = ribcageMuscle.getMuscleData();
          if (ribcageData) {
            masses.push(ribcageData);
            console.log('[RIBCAGE] Successfully added to', creatureType);
            console.log('[RIBCAGE] Center position:', ribcageData.center);
            console.log('[RIBCAGE] Size:', ribcageData.widthRatio * ribcageData.spineLength, 'x', ribcageData.heightRatio * ribcageData.spineLength);
          } else {
            console.warn('[RIBCAGE] No muscle data returned');
          }
        } else {
          console.warn('[RIBCAGE] No attachments found');
        }
      } else {
        console.warn('[RIBCAGE] RibcageMuscle class not available');
      }

      if (useSeparateMasses) {
        // Full body coverage for quadrupeds
        const thorax = this.identifyThorax(skeleton, creatureType);
        if (thorax) masses.push(thorax);

        const abdomen = this.identifyAbdomen(skeleton, creatureType);
        if (abdomen) masses.push(abdomen);

        const pelvis = this.identifyPelvis(skeleton, creatureType);
        if (pelvis) masses.push(pelvis);
      } else {
        const torso = this.identifyTorsoSausage(skeleton);
        if (torso) masses.push(torso);
      }

      const cranium = this.identifyCranium(skeleton);
      if (cranium) masses.push(cranium);

      const limbs = this.identifyLimbSegments(skeleton);
      masses.push(...limbs);

      return masses;
    }

    /**
     * Calculate live geometry from bone IDs
     * CALLED EVERY FRAME to get current positions
     */
    static calculateMassPosition(massData, getBoneById) {
      if (!massData || !getBoneById) return null;

      if (massData.type === 'sphere') {
        const bone = getBoneById(massData.boneIds[0]);
        if (!bone) return null;
        
        const boneLength = Math.sqrt(
          Math.pow(bone.end.x - bone.start.x, 2) +
          Math.pow(bone.end.y - bone.start.y, 2)
        );
        
        return {
          position: { x: bone.end.x, y: bone.end.y },
          radius: Math.max(12, boneLength * (massData.radiusRatio || 0.8))
        };
      }
      
      if (massData.type === 'ovoid') {
        // Special handling for ribcage (has pre-calculated center)
        if (massData.role === 'ribcage' && massData.center) {
          return {
            position: massData.center,
            width: massData.widthRatio * massData.spineLength || 60,
            height: massData.heightRatio * massData.spineLength || 40,
            rotation: massData.rotation || 0
          };
        }

        // Regular ovoid handling
        const bones = massData.boneIds.map(id => getBoneById(id)).filter(b => b);
        if (bones.length === 0) return null;

        // Calculate center
        let sumX = 0, sumY = 0;
        bones.forEach(bone => {
          sumX += (bone.start.x + bone.end.x) / 2;
          sumY += (bone.start.y + bone.end.y) / 2;
        });

        const centerX = sumX / bones.length;
        const centerY = sumY / bones.length;

        // Calculate rotation and size
        const firstBone = bones[0];
        const lastBone = bones[bones.length - 1];
        const dx = lastBone.end.x - firstBone.start.x;
        const dy = lastBone.end.y - firstBone.start.y;
        const rotation = Math.atan2(dy, dx);
        const length = Math.sqrt(dx * dx + dy * dy);

        const width = length * (massData.widthRatio || 0.6);
        const height = length * (massData.heightRatio || 1.0);

        return {
          position: { x: centerX, y: centerY },
          width: width,
          height: height,
          rotation: rotation
        };
      }
      
      if (massData.type === 'cylinder' || massData.type === 'sausage') {
        const startBone = getBoneById(massData.startBoneId);
        const endBone = getBoneById(massData.endBoneId);
        
        if (!startBone || !endBone) return null;
        
        const radius = massData.baseRadius ? 
          massData.baseRadius * (massData.taperFactor || 1.0) :
          Math.sqrt(
            Math.pow(endBone.end.x - startBone.start.x, 2) +
            Math.pow(endBone.end.y - startBone.start.y, 2)
          ) * (massData.radiusRatio || 0.25);
        
        return {
          startPos: { x: startBone.end.x, y: startBone.end.y },
          endPos: { x: endBone.end.x, y: endBone.end.y },
          radius: radius
        };
      }
      
      return null;
    }
  }

  // Immediately assign to global window object
  global.MassIdentifier = MassIdentifier;
  console.log('[MASS IDENTIFIER] Loaded with dynamic positioning');
  
})(typeof window !== 'undefined' ? window : this);
