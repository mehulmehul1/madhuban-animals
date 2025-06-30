
class ModularCreatureBuilder {
    constructor() {
        // Core systems
        this.chains = [];
        this.chainConfigs = []; // Store configuration for each chain
        
        // Global settings
        this.mouseTarget = new FIK.V2(400, 300);
        this.showDebug = true;
        this.renderMode = 'dots-and-lines'; // Clean visualization
        
        // Body tracking system
        this.bodyPosition = new FIK.V2(300, 300);
        this.bodyVelocity = new FIK.V2(0, 0);
        this.bodyRotation = 0;
        this.bodyHeading = 0; 
        
        // Locomotion system
        this.locomotion = {
            walkCycle: 0,
            swimCycle: 0,
            footSteps: [],
            stepHeight: 30,
            stepLength: 60,
            moveSpeed: 0.02
        };

        this.locomotion.state = 'idle'; // 'walk', 'turn'
        
        // Current creature
        this.creatureType = null;
        this.creatureConfig = null;
    }

    // MODULAR CHAIN CONFIGURATION SYSTEM
    createChainConfig(params) {
        return {
            role: params.role,
            type: params.type, // 'spine', 'leg', 'fin', 'neck', 'head'
            attachment: params.attachment, // 'free', 'body', 'parent'
            targetMode: params.targetMode, // 'mouse', 'foot', 'calculated', 'parent-relative'
            parentRole: params.parentRole || null,
            attachmentPoint: params.attachmentPoint || 'end', // 'start', 'end', 'middle', 'bone-index'
            attachmentIndex: params.attachmentIndex || 0,
            color: params.color || [100, 150, 255],
            constraints: params.constraints || { clockwise: 45, anticlockwise: 45 },
            bones: params.bones || []
        };
    }

    // CREATURE DEFINITIONS
    buildFish() {
        this.clearCreature();
        this.creatureType = 'fish';
        
        // Fish body configuration
        this.creatureConfig = {
            bodyLength: 200,
            bodySegments: 8,
            segmentLength: 25,
            finSize: 30
        };
        
        // Main spine - body follows swim motion, head follows mouse
        const spineConfig = this.createChainConfig({
            role: 'spine',
            type: 'spine',
            attachment: 'free',
            targetMode: 'mouse',
            color: [100, 150, 255],
            bones: this.generateSpineBones(8, 25)
        });
        this.addChain(spineConfig);
        
        // Tail fin - attached to spine tail
        const tailFinConfig = this.createChainConfig({
            role: 'tail-fin',
            type: 'fin',
            attachment: 'parent',
            targetMode: 'parent-relative',
            parentRole: 'spine',
            attachmentPoint: 'start',
            color: [255, 100, 150],
            bones: this.generateFinBones(30)
        });
        this.addChain(tailFinConfig);
        
        // Dorsal fin - attached to spine middle
        const dorsalFinConfig = this.createChainConfig({
            role: 'dorsal-fin',
            type: 'fin',
            attachment: 'parent',
            targetMode: 'parent-relative',
            parentRole: 'spine',
            attachmentPoint: 'bone-index',
            attachmentIndex: 4,
            color: [150, 255, 100],
            bones: this.generateFinBones(20, -90)
        });
        this.addChain(dorsalFinConfig);
        
        // Pectoral fins
        ['left', 'right'].forEach((side, i) => {
            const pectoralConfig = this.createChainConfig({
                role: `pectoral-${side}`,
                type: 'fin',
                attachment: 'parent',
                targetMode: 'parent-relative',
                parentRole: 'spine',
                attachmentPoint: 'bone-index',
                attachmentIndex: 6,
                color: [100, 200, 255],
                bones: this.generateFinBones(18, side === 'left' ? -45 : 45)
            });
            this.addChain(pectoralConfig);
        });
        
        console.log("Built modular fish with " + this.chains.length + " chains");
    }

    buildBipedalCrane() {
        this.clearCreature();
        this.creatureType = 'crane';
        
        // Crane configuration
        this.creatureConfig = {
            bodyHeight: 500,
            legLength: 100,
            neckLength: 60,
            headSize: 20
        };
        
        // Initialize foot steps for bipedal walking
        this.locomotion.footSteps = [
            { 
                target: new FIK.V2(this.bodyPosition.x - 30, this.bodyPosition.y + 100),
                phase: 0,
                isLifted: false,
                side: 'left'
            },
            { 
                target: new FIK.V2(this.bodyPosition.x + 30, this.bodyPosition.y + 100),
                phase: Math.PI,
                isLifted: false,
                side: 'right'
            }
        ];
        
        // Body/Spine - follows leg average position
        const bodyConfig = this.createChainConfig({
            role: 'body',
            type: 'spine',
            attachment: 'free',
            targetMode: 'calculated', // Will follow leg average
            color: [150, 100, 200],
            bones: this.generateBodyBones(5, 15)
        });
        this.addChain(bodyConfig);
        
        // Neck - attached to body top, follows mouse
        const neckConfig = this.createChainConfig({
            role: 'neck',
            type: 'neck',
            attachment: 'parent',
            targetMode: 'mouse',
            parentRole: 'body',
            attachmentPoint: 'end',
            color: [200, 150, 100],
            bones: this.generateNeckBones(12, 10)
        });
        this.addChain(neckConfig);
        
        // Legs - attached to body base, follow foot targets
        ['left', 'right'].forEach((side, i) => {
            const legConfig = this.createChainConfig({
                role: `leg-${side}`,
                type: 'leg',
                attachment: 'parent',
                targetMode: 'foot',
                parentRole: 'body',
                attachmentPoint: 'start',
                color: [100, 200, 100],
                bones: this.generateLegBones(3, 60),
                constraints: {
                    thigh: { clockwise: 45, anticlockwise: 90 },
                    shin: { clockwise: 10, anticlockwise: 130 },
                    foot: { clockwise: 45, anticlockwise: 45 }
                }
            });
            this.addChain(legConfig);
        });
        
        // Tail - attached to body base
        const tailConfig = this.createChainConfig({
            role: 'tail',
            type: 'tail',
            attachment: 'parent',
            targetMode: 'parent-relative',
            parentRole: 'body',
            attachmentPoint: 'start',
            color: [255, 150, 100],
            bones: this.generateTailBones(4, 20)
        });
        this.addChain(tailConfig);

   ['left', 'right'].forEach((side, i) => {
            const wingConfig = this.createChainConfig({
                role: `wing-${side}`,
                type: 'wing',
                attachment: 'parent',
                targetMode: 'parent-relative',
                parentRole: 'spine',
                attachmentPoint: 'bone-index',
                attachmentIndex: 3,
                color: [100, 200, 255],
                bones: this.generateWingBones(18, side === 'left' ? -45 : 45)
            });
            this.addChain(wingConfig);
        });
      
    }

    // BONE GENERATION FUNCTIONS
    generateSpineBones(count, length) {
        const bones = [];
        for (let i = 0; i < count; i++) {
            bones.push({
                length: length,
                direction: new FIK.V2(-1, Math.sin(i * 0.3) * 0.1),
                constraints: { clockwise: 25, anticlockwise: 25 }
            });
        }
        return bones;
    }

    generateBodyBones(count, length) {
        const bones = [];
        for (let i = 0; i < count; i++) {
            bones.push({
                length: length,
                direction: new FIK.V2(0, -1), // Vertical body
                constraints: { clockwise: 20, anticlockwise: 20 }
            });
        }
        return bones;
    }

    generateNeckBones(count, length) {
        const bones = [];
        for (let i = 0; i < count; i++) {
            bones.push({
                length: length,
                direction: new FIK.V2(0.2, -1).normalised(),
                constraints: { clockwise: 60, anticlockwise: 60 }
            });
        }
        return bones;
    }

    generateLegBones(count, length) {
        return [
              { // hip to knee
                length: length,
                direction: new FIK.V2(1, 1),
                constraints: { clockwise: 45, anticlockwise: 0 }
            },
            { // knee to itj
                length: length * 1.5,
                direction: new FIK.V2(0, 1),
                constraints: { clockwise: 90, anticlockwise: 0 }
            },
            { // itj to tmpj
                length: length* 0.5,
                direction: new FIK.V2(0, 1),
                constraints: { clockwise: 90, anticlockwise: 0 }
            },
            { // Foot
                length: length * 0.2,
                direction: new FIK.V2(1, 0),
                constraints: { clockwise: 45, anticlockwise: 0 }
            }
        ];
    }

    
    generateWingBones(size, angle = 0) {
        const rad = angle * Math.PI / 180;
        return [
            {
                length: size,
                direction: new FIK.V2(Math.cos(rad), Math.sin(rad)),
                constraints: { clockwise: 70, anticlockwise: 70 }
            },
            {
                length: size * 0.7,
                direction: new FIK.V2(Math.cos(rad) * 1.2, Math.sin(rad) * 0.8),
                constraints: { clockwise: 80, anticlockwise: 80 }
            }
        ];
    }
   


    generateFinBones(size, angle = 0) {
        const rad = angle * Math.PI / 180;
        return [
            {
                length: size,
                direction: new FIK.V2(Math.cos(rad), Math.sin(rad)),
                constraints: { clockwise: 70, anticlockwise: 70 }
            },
            {
                length: size * 0.7,
                direction: new FIK.V2(Math.cos(rad) * 1.2, Math.sin(rad) * 0.8),
                constraints: { clockwise: 80, anticlockwise: 80 }
            }
        ];
    }

    generateTailBones(count, length) {
        const bones = [];
        for (let i = 0; i < count; i++) {
            bones.push({
                length: length * (1 - i * 0.2), // Taper
                direction: new FIK.V2(-0.8, 0.4),
                constraints: { clockwise: 40, anticlockwise: 40 }
            });
        }
        return bones;
    }

    // CHAIN CREATION AND MANAGEMENT
    addChain(config) {
        const chain = new FIK.Chain2D(this.rgbToHex(config.color));
        
        // Create first bone
        if (config.bones.length > 0) {
            const firstBone = config.bones[0];
            const startPos = new FIK.V2(300, 300);
            const direction = firstBone.direction.normalised();
            const endPos = new FIK.V2(
                startPos.x + direction.x * firstBone.length,
                startPos.y + direction.y * firstBone.length
            );
            
            const bone = new FIK.Bone2D(startPos, endPos);
            bone.setClockwiseConstraintDegs(firstBone.constraints.clockwise);
            bone.setAnticlockwiseConstraintDegs(firstBone.constraints.anticlockwise);
            chain.addBone(bone);
            
            // Add remaining bones
            for (let i = 1; i < config.bones.length; i++) {
                const boneConfig = config.bones[i];
                chain.addConsecutiveBone(
                    boneConfig.direction.normalised(),
                    boneConfig.length,
                    boneConfig.constraints.clockwise,
                    boneConfig.constraints.anticlockwise
                );
            }
        }
        
        chain.setFixedBaseMode(config.attachment !== 'free');
        
        this.chains.push(chain);
        this.chainConfigs.push(config);
    }

    clearCreature() {
        this.chains = [];
        this.chainConfigs = [];
        this.bodyPosition.set(300, 300);
        this.bodyVelocity.set(0, 0);
        this.locomotion.footSteps = [];
    }

    // UPDATE SYSTEM
    update() {
        this.mouseTarget.set(mouseX, mouseY);
        
        // Update locomotion
        if (this.creatureType === 'fish') {
            this.updateFishMovement();
        } else if (this.creatureType === 'crane') {
            this.updateCraneMovement();
        }
        
        // Update all chains
        this.updateChains();
    }

    updateFishMovement() {
        this.locomotion.swimCycle += 0.03;
        
        // Fish body follows mouse with swimming motion
        const directionToMouse = new FIK.V2(
            this.mouseTarget.x - this.bodyPosition.x,
            this.mouseTarget.y - this.bodyPosition.y
        ).normalised();
        
        // Add swimming undulation
        const swimOffset = Math.sin(this.locomotion.swimCycle) * 20;
        const perpendicular = new FIK.V2(-directionToMouse.y, directionToMouse.x);
        
        this.bodyVelocity.add(directionToMouse.multiplyScalar(this.locomotion.moveSpeed));
        this.bodyVelocity.add(perpendicular.multiplyScalar(swimOffset * 0.001));
        this.bodyVelocity.multiplyScalar(0.95); // Drag
        
        this.bodyPosition.add(this.bodyVelocity);
    }

  updateCraneMovement() {
    // 1. Compute direction to target and angle difference
    const dirToTarget = new FIK.V2(
        this.mouseTarget.x - this.bodyPosition.x,
        this.mouseTarget.y - this.bodyPosition.y
    );
    const targetAngle = Math.atan2(dirToTarget.y, dirToTarget.x);
    const angleDiff = this.normalizeAngle(targetAngle - this.bodyHeading);

    // 2. State selection: turn or walk
    const absAngleDiff = Math.abs(angleDiff);
    const TURN_THRESHOLD = Math.PI / 3; // ~60 deg
    if (absAngleDiff > TURN_THRESHOLD) {
        this.locomotion.state = 'turn';
    } else {
        this.locomotion.state = 'walk';
    }

    // 3. Animate heading
    if (this.locomotion.state === 'turn') {
        // Turn in place (fast)
        const turnRate = 0.12;
        this.bodyHeading += turnRate * Math.sign(angleDiff);
        // Keep in -PI..PI
        this.bodyHeading = this.normalizeAngle(this.bodyHeading);
        // Optionally, keep feet grounded during turn (no walk)
        // Optionally, you could add a "turning" foot pose here
    } else if (this.locomotion.state === 'walk') {
        // Blend heading slowly toward target (soft steering)
        const walkTurnBlend = 0.07;
        this.bodyHeading = this.normalizeAngle(
            this.bodyHeading + walkTurnBlend * angleDiff
        );
        this.locomotion.walkCycle += 0.05;

        // Update foot placement: now relative to heading!
        const stepDir = new FIK.V2(Math.cos(this.bodyHeading), Math.sin(this.bodyHeading));
        this.locomotion.footSteps.forEach((foot, i) => {
            foot.phase += 0.1;
            foot.isLifted = Math.sin(foot.phase) > 0.7;

            if (foot.isLifted) {
                // Place step in front of body, with offset for left/right
                const sideOffset = (foot.side === 'left' ? -30 : 30);
                const perp = new FIK.V2(-stepDir.y, stepDir.x); // perpendicular to heading
                const targetX = this.bodyPosition.x +
                    stepDir.x * this.locomotion.stepLength +
                    perp.x * sideOffset;
                const targetY = this.bodyPosition.y +
                    stepDir.y * this.locomotion.stepLength +
                    perp.y * sideOffset +
                    this.creatureConfig.legLength;
                foot.target.x = lerp(foot.target.x, targetX, 0.2);
                foot.target.y = lerp(foot.target.y, targetY, 0.2);
            }
        });

        // Update body position based on foot average
        this.updateBodyFromFeet();
    }
}

    updateBodyFromFeet() {
        // Calculate average foot position
        let avgX = 0, avgY = 0;
        let groundedFeet = 0;
        
        this.locomotion.footSteps.forEach(foot => {
            if (!foot.isLifted) {
                avgX += foot.target.x;
                avgY += foot.target.y;
                groundedFeet++;
            }
        });
        
        if (groundedFeet > 0) {
            avgX /= groundedFeet;
            avgY /= groundedFeet;
            
            // Body should be above the feet
            const targetBodyX = avgX;
            const targetBodyY = avgY - this.creatureConfig.legLength;
            
            // Smooth movement
            this.bodyPosition.x = lerp(this.bodyPosition.x, targetBodyX, 0.1);
            this.bodyPosition.y = lerp(this.bodyPosition.y, targetBodyY, 0.1);
        }
    }

    getChainUpdateStrategy(config) {
        // Return a function (strategy) which will be called as (chain, config, context)
        // The context object contains this, parentChain, parentBone, attachPoint, etc.
        switch (config.type) {
            case 'spine':
            if (this.creatureType === 'crane') {
             return (chain, cfg, ctx) => {
            // Set base location and orientation
            chain.setBaseLocation(this.bodyPosition);
            // Set basebone direction to bodyHeading
            chain.baseboneConstraintUV = new FIK.V2(Math.cos(this.bodyHeading), Math.sin(this.bodyHeading));
            // Target for body chain is a bit in front of body, in heading direction
            const dir = chain.baseboneConstraintUV;
            const target = new FIK.V2(
                this.bodyPosition.x + dir.x * 60,
                this.bodyPosition.y + dir.y * 10
            );
            chain.solveForTarget(target);
        };
    }
    break;
            case 'neck':
                return (chain, cfg, ctx) => {
                    // Neck follows mouse
                    chain.solveForTarget(this.mouseTarget);
                };
            case 'leg':
                return (chain, cfg, ctx) => {
                    // Leg follows foot target
                    const footIndex = cfg.role.includes('left') ? 0 : 1;
                    if (this.locomotion.footSteps[footIndex]) {
                        chain.solveForTarget(this.locomotion.footSteps[footIndex].target);
                    }
                };
            case 'tail':
                return (chain, cfg, ctx) => {
                    // Tail swings with walk/swim cycle
                    if (ctx.attachPoint && ctx.parentBone) {
                        chain.setBaseLocation(ctx.attachPoint);
                        const direction = ctx.parentBone.getDirectionUV();
                        const tailSwing =
                            this.creatureType === 'fish'
                                ? Math.sin(this.locomotion.swimCycle) * 0.1
                                : Math.sin(this.locomotion.walkCycle) * 0.1;
                        const target = new FIK.V2(
                            ctx.attachPoint.x - direction.x * 30,
                            ctx.attachPoint.y + direction.y * 30 + tailSwing
                        );
                        chain.solveForTarget(target);
                    }
                };
            case 'fin':
                return (chain, cfg, ctx) => {
                    // Fins: different logic for tail-fin, dorsal, pectoral
                    if (!ctx.attachPoint || !ctx.parentBone) return;
                    chain.setBaseLocation(ctx.attachPoint);
                    const direction = ctx.parentBone.getDirectionUV();
                    let targetOffset = new FIK.V2(0, 0);
                    if (cfg.role === 'tail-fin') {
                        targetOffset = new FIK.V2(
                            direction.x * 40,
                            direction.y * 40 + Math.sin(this.locomotion.swimCycle * 2) * 15
                        );
                    } else if (cfg.role === 'dorsal-fin') {
                        const upDir = new FIK.V2(-direction.y, direction.x);
                        targetOffset = new FIK.V2(upDir.x * 30, upDir.y * 30);
                    } else if (cfg.role.includes('pectoral')) {
                        const sideDir = cfg.role.includes('left')
                            ? new FIK.V2(direction.y, -direction.x)
                            : new FIK.V2(-direction.y, direction.x);
                        targetOffset = new FIK.V2(sideDir.x * 25, sideDir.y * 25);
                    }
                    const target = new FIK.V2(
                        ctx.attachPoint.x + targetOffset.x,
                        ctx.attachPoint.y + targetOffset.y
                    );
                    chain.solveForTarget(target);
                };
            case 'wing':
                return (chain, cfg, ctx) => {
                    // Simple flapping: wings flap with walkCycle (or add a flapCycle)
                    if (!ctx.attachPoint || !ctx.parentBone) return;
                    chain.setBaseLocation(ctx.attachPoint);
                    const direction = ctx.parentBone.getDirectionUV();
                    const flap = Math.sin(this.locomotion.walkCycle + (cfg.role.includes('left') ? 0 : Math.PI)) * 20;
                    const side = cfg.role.includes('left') ? 1 : -1;
                    const target = new FIK.V2(
                        ctx.attachPoint.x + direction.x * 40 + side * 20,
                        ctx.attachPoint.y + direction.y * 20 + flap
                    );
                    chain.solveForTarget(target);
                };
            default:
                // Fallback: just solve for mouse
                return (chain, cfg, ctx) => {
                    chain.solveForTarget(this.mouseTarget);
                };
        }
    }

     // --- NEW updateChains USING STRATEGIES ---
    updateChains() {
        // First pass: resolve attachment, parent chain, parent bone, attach point
        const contextCache = this.chains.map((chain, i) => {
            const cfg = this.chainConfigs[i];
            let parentChain = null, parentBone = null, attachPoint = null;
            if (cfg.attachment === 'parent' && cfg.parentRole) {
                const parentIndex = this.chainConfigs.findIndex(c => c.role === cfg.parentRole);
                if (parentIndex >= 0) {
                    parentChain = this.chains[parentIndex];
                    switch (cfg.attachmentPoint) {
                        case 'start':
                            if (parentChain.bones.length > 0) attachPoint = parentChain.bones[0].start;
                            parentBone = parentChain.bones[0];
                            break;
                        case 'end':
                            if (parentChain.bones.length > 0) {
                                attachPoint = parentChain.bones[parentChain.bones.length - 1].end;
                                parentBone = parentChain.bones[parentChain.bones.length - 1];
                            }
                            break;
                        case 'bone-index':
                            const boneIndex = Math.min(cfg.attachmentIndex, parentChain.bones.length - 1);
                            if (parentChain.bones[boneIndex]) {
                                attachPoint = parentChain.bones[boneIndex].start;
                                parentBone = parentChain.bones[boneIndex];
                            }
                            break;
                    }
                }
            }
            return { parentChain, parentBone, attachPoint };
        });

        // Second pass: run modular per-chain update strategy
        for (let i = 0; i < this.chains.length; i++) {
            const chain = this.chains[i];
            const cfg = this.chainConfigs[i];
            const ctx = contextCache[i];
            // If this chain is free, set its base location
            if (cfg.attachment === 'free') {
                if (cfg.role === 'spine' && this.creatureType === 'fish') {
                    chain.setBaseLocation(this.bodyPosition);
                } else if (cfg.role === 'body' && this.creatureType === 'crane') {
                    chain.setBaseLocation(this.bodyPosition);
                }
            } else if (cfg.attachment === 'parent' && ctx.attachPoint) {
                chain.setBaseLocation(ctx.attachPoint);
            }

            // Get update strategy for this chain and run it
            const updateStrategy = this.getChainUpdateStrategy(cfg);
            if (updateStrategy) {
                try {
                    updateStrategy.call(this, chain, cfg, { ...ctx });
                } catch (e) {
                    console.log(`Chain ${cfg.role} strategy error:`, e);
                }
            }
        }
    }

    // updateChains() {
    //     // First pass: Update targets and solve chains
    //     for (let i = 0; i < this.chains.length; i++) {
    //         const chain = this.chains[i];
    //         const config = this.chainConfigs[i];
            
    //         // Calculate target based on mode
    //         let target = null;
            
    //         switch (config.targetMode) {
    //             case 'mouse':
    //                 target = this.mouseTarget;
    //                 break;
                    
    //             case 'foot':
    //                 // Find the appropriate foot
    //                 const footIndex = config.role.includes('left') ? 0 : 1;
    //                 if (this.locomotion.footSteps[footIndex]) {
    //                     target = this.locomotion.footSteps[footIndex].target;
    //                 }
    //                 break;
                    
    //             case 'calculated':
    //                 // Body chain - create target above feet
    //                 if (config.role === 'body' && this.creatureType === 'crane') {
    //                     // Body should lean toward mouse but stay above feet
    //                     const dirToMouse = new FIK.V2(
    //                         this.mouseTarget.x - this.bodyPosition.x,
    //                         this.mouseTarget.y - this.bodyPosition.y
    //                     ).normalised();
                        
    //                     target = new FIK.V2(
    //                         this.bodyPosition.x + dirToMouse.x * 50,
    //                         this.bodyPosition.y - 50
    //                     );
    //                 }
    //                 break;
                    
    //             case 'parent-relative':
    //                 // Will be calculated after parent updates
    //                 target = new FIK.V2(0, 0);
    //                 break;
    //         }
            
    //         // Update chain position if needed
    //         if (config.attachment === 'free') {
    //             if (config.role === 'spine' && this.creatureType === 'fish') {
    //                 chain.setBaseLocation(this.bodyPosition);
    //             } else if (config.role === 'body' && this.creatureType === 'crane') {
    //                 chain.setBaseLocation(this.bodyPosition);
    //             }
    //         }
            
    //         // Solve chain
    //         if (target) {
    //             try {
    //                 chain.solveForTarget(target);
    //             } catch (e) {
    //                 console.log(`Chain ${config.role} solve error:`, e);
    //             }
    //         }
    //     }
        
    //     // Second pass: Update attachments
    //     for (let i = 0; i < this.chains.length; i++) {
    //         const chain = this.chains[i];
    //         const config = this.chainConfigs[i];
            
    //         if (config.attachment === 'parent' && config.parentRole) {
    //             const parentIndex = this.chainConfigs.findIndex(c => c.role === config.parentRole);
    //             if (parentIndex >= 0) {
    //                 const parentChain = this.chains[parentIndex];
    //                 let attachPoint = null;
                    
    //                 switch (config.attachmentPoint) {
    //                     case 'start':
    //                         if (parentChain.bones.length > 0) {
    //                             attachPoint = parentChain.bones[0].start;
    //                         }
    //                         break;
                            
    //                     case 'end':
    //                         if (parentChain.bones.length > 0) {
    //                             const lastBone = parentChain.bones[parentChain.bones.length - 1];
    //                             attachPoint = lastBone.end;
    //                         }
    //                         break;
                            
    //                     case 'bone-index':
    //                         const boneIndex = Math.min(config.attachmentIndex, parentChain.bones.length - 1);
    //                         if (parentChain.bones[boneIndex]) {
    //                             attachPoint = parentChain.bones[boneIndex].start;
    //                         }
    //                         break;
    //                 }
                    
    //                 if (attachPoint) {
    //                     chain.setBaseLocation(attachPoint);
                        
    //                     // Calculate relative target for attached chains
    //                     if (config.targetMode === 'parent-relative') {
    //                         const parentBone = this.getAttachmentBone(parentChain, config);
    //                         if (parentBone) {
    //                             const direction = parentBone.getDirectionUV();
    //                             let targetOffset = new FIK.V2(0, 0);
                                
    //                             // Calculate offset based on type
    //                             if (config.type === 'fin') {
    //                                 if (config.role === 'tail-fin') {
    //                                     targetOffset = new FIK.V2(
    //                                         direction.x * 40,
    //                                         direction.y * 40 + Math.sin(this.locomotion.swimCycle * 2) * 15
    //                                     );
    //                                 } else if (config.role === 'dorsal-fin') {
    //                                     const upDir = new FIK.V2(-direction.y, direction.x);
    //                                     targetOffset = new FIK.V2(upDir.x * 30, upDir.y * 30);
    //                                 } else if (config.role.includes('pectoral')) {
    //                                     const sideDir = config.role.includes('left') ?
    //                                         new FIK.V2(direction.y, -direction.x) :
    //                                         new FIK.V2(-direction.y, direction.x);
    //                                     targetOffset = new FIK.V2(sideDir.x * 25, sideDir.y * 25);
    //                                 }
    //                             } else if (config.type === 'tail') {
    //                                 targetOffset = new FIK.V2(
    //                                     -direction.x * 30,
    //                                     direction.y * 30 + Math.sin(this.locomotion.walkCycle) * 10
    //                                 );
    //                             }
                                
    //                             const target = new FIK.V2(
    //                                 attachPoint.x + targetOffset.x,
    //                                 attachPoint.y + targetOffset.y
    //                             );
                                
    //                             chain.solveForTarget(target);
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    getAttachmentBone(parentChain, config) {
        switch (config.attachmentPoint) {
            case 'start':
                return parentChain.bones[0];
            case 'end':
                return parentChain.bones[parentChain.bones.length - 1];
            case 'bone-index':
                const index = Math.min(config.attachmentIndex, parentChain.bones.length - 1);
                return parentChain.bones[index];
            default:
                return parentChain.bones[0];
        }
    }

    // RENDERING SYSTEM
    draw() {
        background(240, 248, 255);
        
        // Draw ground reference
        stroke(200);
        strokeWeight(1);
        line(0, 450, width, 450);
        
        // Draw body position
        this.drawBodyIndicator();
        
        // Draw foot targets for crane
        if (this.creatureType === 'crane') {
            this.drawFootTargets();
        }
        
        // Draw all chains with dots and lines
        this.drawChains();
        
        // Draw debug info
        if (this.showDebug) {
            this.drawDebugInfo();
        }
        
        // Draw controls
        this.drawControls();
    }

    drawBodyIndicator() {
        push();

        // Draw body center
        noStroke();
        fill(255, 100, 100, 100);
        circle(this.bodyPosition.x, this.bodyPosition.y, 20);

        // Draw body heading arrow
        stroke(255, 100, 0);
        strokeWeight(3);
        const headLen = 35;
        line(
            this.bodyPosition.x,
            this.bodyPosition.y,
            this.bodyPosition.x + Math.cos(this.bodyHeading) * headLen,
            this.bodyPosition.y + Math.sin(this.bodyHeading) * headLen
        );

        // Draw body direction (for crane)
        if (this.creatureType === 'crane') {
            const bodyChain = this.getChainByRole('body');
            if (bodyChain && bodyChain.bones.length > 0) {
                const dir = bodyChain.bones[0].getDirectionUV();
                stroke(255, 100, 100);
                strokeWeight(2);
                line(
                    this.bodyPosition.x,
                    this.bodyPosition.y,
                    this.bodyPosition.x + dir.x * 30,
                    this.bodyPosition.y + dir.y * 30
                );
            }
        }

        pop();
    }

    drawFootTargets() {
        this.locomotion.footSteps.forEach((foot, i) => {
            push();
            
            // Foot target
            if (foot.isLifted) {
                fill(255, 200, 100);
                noStroke();
                // Show lifted position
                const liftHeight = Math.sin(foot.phase) * this.locomotion.stepHeight;
                circle(foot.target.x, foot.target.y - liftHeight, 8);
                
                // Show ground target
                stroke(255, 200, 100, 100);
                strokeWeight(1);
                noFill();
                circle(foot.target.x, foot.target.y, 12);
            } else {
                fill(100, 200, 255);
                noStroke();
                circle(foot.target.x, foot.target.y, 10);
            }
            
            // Label
            fill(0);
            textAlign(CENTER);
            textSize(9);
            text(foot.side, foot.target.x, foot.target.y - 15);
            
            pop();
        });
    }

    drawChains() {
        // Draw each chain with its specific style
        this.chains.forEach((chain, i) => {
            const config = this.chainConfigs[i];
            
            push();
            
            // Set colors
            const color = config.color;
            stroke(color[0], color[1], color[2]);
            strokeWeight(2);
            
            // Draw bones as lines
            chain.bones.forEach((bone, boneIndex) => {
                line(bone.start.x, bone.start.y, bone.end.x, bone.end.y);
            });
            
            // Draw joints as dots
            fill(color[0], color[1], color[2]);
            noStroke();
            
            // Different dot sizes based on type
            const dotSize = config.attachment === 'free' ? 8 : 6;
            
            chain.bones.forEach((bone, boneIndex) => {
                circle(bone.start.x, bone.start.y, dotSize);
                
                // Special markers for specific bones
                if (config.role === 'spine' || config.role === 'body') {
                    if (boneIndex === 0) {
                        // Base marker
                        stroke(color[0], color[1], color[2]);
                        strokeWeight(2);
                        noFill();
                        circle(bone.start.x, bone.start.y, dotSize + 4);
                    }
                }
            });
            
            // End effector dot
            if (chain.bones.length > 0) {
                const lastBone = chain.bones[chain.bones.length - 1];
                circle(lastBone.end.x, lastBone.end.y, dotSize);
                
                // Special end effector marker
                if (config.targetMode === 'mouse' || config.targetMode === 'foot') {
                    stroke(color[0], color[1], color[2]);
                    strokeWeight(2);
                    noFill();
                    circle(lastBone.end.x, lastBone.end.y, dotSize + 4);
                }
            }
            
            // Draw role label
            fill(0);
            noStroke();
            textAlign(CENTER);
            textSize(9);
            if (chain.bones.length > 0) {
                const midBone = chain.bones[Math.floor(chain.bones.length / 2)];
                text(config.role, midBone.start.x, midBone.start.y - 10);
            }
            
            pop();
        });
        
        // Draw mouse target
        push();
        stroke(255, 0, 0);
        strokeWeight(2);
        noFill();
        circle(this.mouseTarget.x, this.mouseTarget.y, 16);
        line(this.mouseTarget.x - 8, this.mouseTarget.y, this.mouseTarget.x + 8, this.mouseTarget.y);
        line(this.mouseTarget.x, this.mouseTarget.y - 8, this.mouseTarget.x, this.mouseTarget.y + 8);
        
        fill(255, 0, 0);
        noStroke();
        textAlign(CENTER);
        textSize(10);
        text("MOUSE", this.mouseTarget.x, this.mouseTarget.y - 20);
        pop();
    }

    drawDebugInfo() {
        push();
        fill(0, 200);
        noStroke();
        rect(10, 10, 200, 150);
        
        fill(255);
        textAlign(LEFT);
        textSize(11);
        let y = 25;
        
        text(`Creature: ${this.creatureType}`, 20, y); y += 15;
        text(`Chains: ${this.chains.length}`, 20, y); y += 15;
        text(`Body: (${int(this.bodyPosition.x)}, ${int(this.bodyPosition.y)})`, 20, y); y += 15;
        
        if (this.creatureType === 'fish') {
            text(`Swim cycle: ${this.locomotion.swimCycle.toFixed(2)}`, 20, y); y += 15;
        } else if (this.creatureType === 'crane') {
            text(`Walk cycle: ${this.locomotion.walkCycle.toFixed(2)}`, 20, y); y += 15;
            text(`Grounded feet: ${this.locomotion.footSteps.filter(f => !f.isLifted).length}`, 20, y); y += 15;
        }
        
        y += 10;
        text("Chain attachments:", 20, y); y += 15;
        this.chainConfigs.forEach((config, i) => {
            const attachment = config.attachment === 'parent' ? 
                `→ ${config.parentRole}` : config.attachment;
            text(`${config.role}: ${attachment}`, 20, y); y += 12;
        });
        
        pop();
    }

    drawControls() {
        push();
        fill(0, 200);
        noStroke();
        rect(width - 220, 10, 210, 180);
        
        fill(255);
        textAlign(LEFT);
        textSize(11);
        let x = width - 210;
        let y = 25;
        
        text("MODULAR CREATURE SYSTEM", x, y); y += 20;
        text("1: Fish (swimming)", x, y); y += 15;
        text("2: Bipedal Crane (walking)", x, y); y += 20;
        
        text("FEATURES:", x, y); y += 15;
        text("• Clean dot & line rendering", x, y); y += 15;
        text("• Body follows foot average", x, y); y += 15;
        text("• Only head/neck track mouse", x, y); y += 15;
        text("• Modular chain configs", x, y); y += 15;
        text("• Proper parent attachments", x, y); y += 20;
        
        text("D: Toggle debug info", x, y); y += 15;
        text("Mouse: Head target", x, y);
        
        pop();
    }

    normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
}

    // Helper functions
    getChainByRole(role) {
        const index = this.chainConfigs.findIndex(c => c.role === role);
        return index >= 0 ? this.chains[index] : null;
    }

    rgbToHex(rgb) {
        return (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
    }
}

// Global variables and p5 functions
let creatureBuilder;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    if (typeof FIK === 'undefined') {
        console.error("FIK library not loaded!");
        return;
    }
    
    creatureBuilder = new ModularCreatureBuilder();
    creatureBuilder.buildFish();
    
    console.log("Modular Creature Builder initialized");
}

function draw() {
    if (creatureBuilder) {
        creatureBuilder.update();
        creatureBuilder.draw();
    }
}

function keyPressed() {
    if (!creatureBuilder) return;
    
    switch(key) {
        case '1':
            creatureBuilder.buildFish();
            break;
        case '2':
            creatureBuilder.buildBipedalCrane();
            break;
        case 'd':
        case 'D':
            creatureBuilder.showDebug = !creatureBuilder.showDebug;
            break;
    }
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

