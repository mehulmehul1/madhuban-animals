class ModularCreatureBuilder {
    constructor() {
        // Core systems
        this.chains = [];
        this.chainConfigs = []; // Store configuration for each chain
        
        // Global settings
        this.mouseTarget = new FIK.V2(400, 300);
        this.showDebug = true;
        this.renderMode = 'dots-and-lines';
        
        // Body tracking system
        this.bodyPosition = new FIK.V2(300, 300);
        this.bodyVelocity = new FIK.V2(0, 0);
        this.bodyRotation = 0;
        this.bodyHeading = 0; 
        
        // Enhanced modular systems
        this.locomotionSystem = new LocomotionSystem();
        this.boneTemplateSystem = new BoneTemplateSystem();
        this.gaitSystem = new GaitSystem();
        this.constraintSystem = new ConstraintSystem();
        
        // Current creature
        this.creatureType = null;
        this.creatureConfig = null;
        this.activeLocomotion = null;
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
            bones: params.bones || [],
            // New modular properties
            locomotionRole: params.locomotionRole || null, // How this chain participates in locomotion
            constraintTemplate: params.constraintTemplate || 'default',
            behaviorController: params.behaviorController || null
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
        
        // Set up fish locomotion
        this.activeLocomotion = this.locomotionSystem.createPattern('undulate', {
            bodyLength: this.creatureConfig.bodyLength,
            amplitude: 20,
            frequency: 1.0,
            wavelength: 0.7
        });
        
        // Main spine - body follows swim motion, head follows mouse
        const spineConfig = this.createChainConfig({
            role: 'spine',
            type: 'spine',
            attachment: 'free',
            targetMode: 'mouse',
            color: [100, 150, 255],
            bones: this.boneTemplateSystem.generateBones('fish-spine', this.creatureConfig.segmentLength, {
                segments: this.creatureConfig.bodySegments,
                flexibility: 'high'
            }),
            locomotionRole: 'primary',
            constraintTemplate: 'vertebra'
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
            bones: this.boneTemplateSystem.generateBones('fin', 30, { angle: 0 }),
            locomotionRole: 'propulsion',
            constraintTemplate: 'finBase'
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
            bones: this.boneTemplateSystem.generateBones('fin', 20, { angle: -90 }),
            locomotionRole: 'stability',
            constraintTemplate: 'finBase'
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
                bones: this.boneTemplateSystem.generateBones('fin', 18, { 
                    angle: side === 'left' ? -45 : 45 
                }),
                locomotionRole: 'steering',
                constraintTemplate: 'finBase'
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
        
        // Set up bipedal locomotion
        this.activeLocomotion = this.locomotionSystem.createPattern('bipedal-walk', {
            stepLength: 25,
            stepHeight: 30,
            frequency: 1.0,
            bodyHeight: this.creatureConfig.legLength
        });
        
        // Initialize foot steps for bipedal walking
        this.activeLocomotion.initializeFootSteps(this.bodyPosition, 2);
        
        // Body/Spine - follows leg average position
        const bodyConfig = this.createChainConfig({
            role: 'body',
            type: 'spine',
            attachment: 'free',
            targetMode: 'calculated', // Will follow leg average
            color: [150, 100, 200],
            bones: this.boneTemplateSystem.generateBones('vertebrate-spine', 15, {
                segments: 5,
                flexibility: 'medium'
            }),
            locomotionRole: 'primary',
            constraintTemplate: 'vertebra'
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
            bones: this.boneTemplateSystem.generateBones('vertebrate-neck', 10, {
                segments: 10,
                flexibility: 'high'
            }),
            locomotionRole: 'tracking',
            constraintTemplate: 'neck'
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
                bones: this.boneTemplateSystem.generateBones('crane-leg', 60, {
                    segments: 4,
                    side: side
                }),
                locomotionRole: 'support',
                constraintTemplate: 'leg',
                footIndex: i
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
            bones: this.boneTemplateSystem.generateBones('vertebrate-tail', 20, {
                segments: 4,
                taper: true
            }),
            locomotionRole: 'balance',
            constraintTemplate: 'vertebra'
        });
        this.addChain(tailConfig);

        // Wings (optional for crane)
        ['left', 'right'].forEach((side, i) => {
            const wingConfig = this.createChainConfig({
                role: `wing-${side}`,
                type: 'wing',
                attachment: 'parent',
                targetMode: 'parent-relative',
                parentRole: 'body',
                attachmentPoint: 'bone-index',
                attachmentIndex: 3,
                color: [100, 200, 255],
                bones: this.boneTemplateSystem.generateBones('wing', 18, { 
                    angle: side === 'left' ? -45 : 45 
                }),
                locomotionRole: 'display',
                constraintTemplate: 'wing'
            });
            this.addChain(wingConfig);
        });
    }

    // ALSO REPLACE the buildQuadruped method to fix the duplicate legs:

buildQuadruped() {
    this.clearCreature();
    this.creatureType = 'quadruped';
    
    this.creatureConfig = {
        bodyLength: 200,
        legLength: 80,
        neckLength: 40
    };
    
    // Set up quadrupedal locomotion
    // this.activeLocomotion = this.locomotionSystem.createPattern('quadruped-walk', {
    //     stepLength: 50,
    //     stepHeight: 25,
    //     frequency: 1.5
    // });

    this.activeLocomotion = new BiomechanicalQuadrupedGait({
        gaitType: 'trot',        // Start with trot
        stepLength: 50,
        legLength: 80,
        frequency: 2.0
    });
    
    this.activeLocomotion.initializeFootSteps(this.bodyPosition, 4);
    
    // Body/Spine - follows leg average position
    const bodyConfig = this.createChainConfig({
        role: 'body',
        type: 'spine',
        attachment: 'free',
        targetMode: 'calculated', // Will follow leg average
        color: [150, 100, 200],
        bones: this.boneTemplateSystem.generateBones('vertebrate-spine', 15, {
            segments: 6,
            flexibility: 'medium'
        }),
        locomotionRole: 'primary',
        constraintTemplate: 'vertebra'
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
        bones: this.boneTemplateSystem.generateBones('vertebrate-neck', 10, {
            segments: 4,
            flexibility: 'high'
        }),
        locomotionRole: 'tracking',
        constraintTemplate: 'neck'
    });
    this.addChain(neckConfig);
    
    // Front legs - attached to body front
    ['left', 'right'].forEach((side, i) => {
        const legConfig = this.createChainConfig({
            role: `front-leg-${side}`,
            type: 'leg',
            attachment: 'parent',
            targetMode: 'foot',
            parentRole: 'body',
            attachmentPoint: 'bone-index',
            attachmentIndex: 4, // Front of body
            color: [100, 200, 100],
            bones: this.boneTemplateSystem.generateBones('vertebrate-leg', 60, {
                segments: 4,
                side: side
            }),
            locomotionRole: 'support',
            constraintTemplate: 'leg',
            footIndex: i // Front feet are 0 and 1
        });
        this.addChain(legConfig);
    });

    // Back legs - attached to body back
    ['left', 'right'].forEach((side, i) => {
        const legConfig = this.createChainConfig({
            role: `back-leg-${side}`,
            type: 'leg',
            attachment: 'parent',
            targetMode: 'foot',
            parentRole: 'body',
            attachmentPoint: 'bone-index',
            attachmentIndex: 1, // Back of body
            color: [100, 200, 100],
            bones: this.boneTemplateSystem.generateBones('vertebrate-leg', 60, {
                segments: 4,
                side: side
            }),
            locomotionRole: 'support',
            constraintTemplate: 'leg',
            footIndex: i + 2 // Back feet are 2 and 3
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
        bones: this.boneTemplateSystem.generateBones('vertebrate-tail', 20, {
            segments: 4,
            taper: true
        }),
        locomotionRole: 'balance',
        constraintTemplate: 'vertebra'
    });
    this.addChain(tailConfig);

    console.log("Built modular quadruped with " + this.chains.length + " chains");
}

    buildSnake() {
        this.clearCreature();
        this.creatureType = 'snake';
        
        this.creatureConfig = {
            segments: 20,
            segmentLength: 15
        };
        
        // Set up serpentine locomotion
        this.activeLocomotion = this.locomotionSystem.createPattern('serpentine', {
            wavelength: 120,
            amplitude: 30,
            frequency: 2.0
        });
        
        // Single long spine with high flexibility
        const spineConfig = this.createChainConfig({
            role: 'spine',
            type: 'spine',
            attachment: 'free',
            targetMode: 'mouse',
            color: [100, 255, 100],
            bones: this.boneTemplateSystem.generateBones('serpentine-spine', this.creatureConfig.segmentLength, {
                segments: this.creatureConfig.segments,
                flexibility: 'very-high'
            }),
            locomotionRole: 'primary',
            constraintTemplate: 'vertebra'
        });
        this.addChain(spineConfig);
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
            
            // Apply advanced constraints
            const constraints = this.constraintSystem.getConstraints(
                config.constraintTemplate, 
                firstBone.constraints
            );
            bone.setClockwiseConstraintDegs(constraints.clockwise);
            bone.setAnticlockwiseConstraintDegs(constraints.anticlockwise);
            
            chain.addBone(bone);
            
            // Add remaining bones
            for (let i = 1; i < config.bones.length; i++) {
                const boneConfig = config.bones[i];
                const boneConstraints = this.constraintSystem.getConstraints(
                    config.constraintTemplate, 
                    boneConfig.constraints
                );
                
                chain.addConsecutiveBone(
                    boneConfig.direction.normalised(),
                    boneConfig.length,
                    boneConstraints.clockwise,
                    boneConstraints.anticlockwise
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
        this.activeLocomotion = null;
    }

    // UPDATE SYSTEM
    update() {
        this.mouseTarget.set(mouseX, mouseY);
        
        // Update locomotion system
        if (this.activeLocomotion) {
            this.activeLocomotion.update(this, 1/60); // Assuming 60fps
        }
        
        // Update all chains with enhanced strategies
        this.updateChains();
    }

    getChainUpdateStrategy(config) {
        // Enhanced strategy system with locomotion integration
        switch (config.type) {
            case 'spine':
                return (chain, cfg, ctx) => {
                    if (this.creatureType === 'crane' || this.creatureType === 'quadruped') {
                        chain.setBaseLocation(this.bodyPosition);
                        chain.baseboneConstraintUV = new FIK.V2(Math.cos(this.bodyHeading), Math.sin(this.bodyHeading));
                        const dir = chain.baseboneConstraintUV;
                        const target = new FIK.V2(
                            this.bodyPosition.x + dir.x * 60,
                            this.bodyPosition.y + dir.y * 10
                        );
                        chain.solveForTarget(target);
                    } else if (this.creatureType === 'fish') {
                        chain.setBaseLocation(this.bodyPosition);
                        // Apply body wave motion if active locomotion supports it
                        if (this.activeLocomotion && this.activeLocomotion.applyBodyWave) {
                            this.activeLocomotion.applyBodyWave(chain, cfg);
                        }
                        chain.solveForTarget(this.mouseTarget);
                    } else if (this.creatureType === 'snake') {
                        chain.setBaseLocation(this.bodyPosition);
                        if (this.activeLocomotion && this.activeLocomotion.applySerpentineMotion) {
                            this.activeLocomotion.applySerpentineMotion(chain, cfg);
                        }
                        chain.solveForTarget(this.mouseTarget);
                    }
                };
            
            case 'neck':
                return (chain, cfg, ctx) => {
                    chain.solveForTarget(this.mouseTarget);
                };
            
            case 'leg':
                return (chain, cfg, ctx) => {
                    // Use locomotion system for foot targeting
                    if (this.activeLocomotion && this.activeLocomotion.getFootTarget) {
                        const footIndex = cfg.footIndex || (cfg.role.includes('left') ? 0 : 1);
                        const footTarget = this.activeLocomotion.getFootTarget(footIndex);
                        if (footTarget) {
                            chain.solveForTarget(footTarget);
                        }
                    }
                };
            
            case 'fin':
                return (chain, cfg, ctx) => {
                    if (!ctx.attachPoint || !ctx.parentBone) return;
                    chain.setBaseLocation(ctx.attachPoint);
                    
                    if (this.activeLocomotion && this.activeLocomotion.getFinTarget) {
                        const finTarget = this.activeLocomotion.getFinTarget(cfg.role, ctx);
                        chain.solveForTarget(finTarget);
                    } else {
                        // Fallback to original fin logic
                        const direction = ctx.parentBone.getDirectionUV();
                        let targetOffset = this.calculateFinOffset(cfg.role, direction);
                        const target = new FIK.V2(
                            ctx.attachPoint.x + targetOffset.x,
                            ctx.attachPoint.y + targetOffset.y
                        );
                        chain.solveForTarget(target);
                    }
                };
            
            case 'tail':
                return (chain, cfg, ctx) => {
                    if (ctx.attachPoint && ctx.parentBone) {
                        chain.setBaseLocation(ctx.attachPoint);
                        
                        if (this.activeLocomotion && this.activeLocomotion.getTailTarget) {
                            const tailTarget = this.activeLocomotion.getTailTarget(cfg.role, ctx);
                            chain.solveForTarget(tailTarget);
                        } else {
                            // Fallback tail logic
                            const direction = ctx.parentBone.getDirectionUV();
                            const tailSwing = this.activeLocomotion ? 
                                this.activeLocomotion.getTailSwing() : 
                                Math.sin(Date.now() * 0.001) * 0.1;
                            const target = new FIK.V2(
                                ctx.attachPoint.x - direction.x * 30,
                                ctx.attachPoint.y + direction.y * 30 + tailSwing
                            );
                            chain.solveForTarget(target);
                        }
                    }
                };
            
            case 'wing':
                return (chain, cfg, ctx) => {
                    if (!ctx.attachPoint || !ctx.parentBone) return;
                    chain.setBaseLocation(ctx.attachPoint);
                    
                    if (this.activeLocomotion && this.activeLocomotion.getWingTarget) {
                        const wingTarget = this.activeLocomotion.getWingTarget(cfg.role, ctx);
                        chain.solveForTarget(wingTarget);
                    } else {
                        // Simple wing flapping
                        const direction = ctx.parentBone.getDirectionUV();
                        const flap = Math.sin(Date.now() * 0.003 + (cfg.role.includes('left') ? 0 : Math.PI)) * 20;
                        const side = cfg.role.includes('left') ? 1 : -1;
                        const target = new FIK.V2(
                            ctx.attachPoint.x + direction.x * 40 + side * 20,
                            ctx.attachPoint.y + direction.y * 20 + flap
                        );
                        chain.solveForTarget(target);
                    }
                };
            
            default:
                return (chain, cfg, ctx) => {
                    chain.solveForTarget(this.mouseTarget);
                };
        }
    }

    calculateFinOffset(finRole, direction) {
        // Helper method for fin positioning
        if (finRole === 'tail-fin') {
            const swimCycle = this.activeLocomotion ? this.activeLocomotion.getCycle() : Date.now() * 0.001;
            return new FIK.V2(
                direction.x * 40,
                direction.y * 40 + Math.sin(swimCycle * 2) * 15
            );
        } else if (finRole === 'dorsal-fin') {
            const upDir = new FIK.V2(-direction.y, direction.x);
            return new FIK.V2(upDir.x * 30, upDir.y * 30);
        } else if (finRole.includes('pectoral')) {
            const sideDir = finRole.includes('left')
                ? new FIK.V2(direction.y, -direction.x)
                : new FIK.V2(-direction.y, direction.x);
            return new FIK.V2(sideDir.x * 25, sideDir.y * 25);
        }
        return new FIK.V2(0, 0);
    }

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
                if ((cfg.role === 'spine' || cfg.role === 'body') && 
                    (this.creatureType === 'fish' || this.creatureType === 'crane' || 
                     this.creatureType === 'quadruped' || this.creatureType === 'snake')) {
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

    // RENDERING SYSTEM (keep existing draw methods)
    draw() {
        background(240, 248, 255);
        
        // Draw ground reference
        stroke(200);
        strokeWeight(1);
        line(0, 450, width, 450);
        
        // Draw body position
        this.drawBodyIndicator();
        
        // Draw foot targets for legged creatures
        if (this.activeLocomotion && this.activeLocomotion.drawFootTargets) {
            this.activeLocomotion.drawFootTargets();
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

    // Keep existing draw methods (drawBodyIndicator, drawChains, etc.)
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

        // Draw body direction (for legged creatures)
        if (this.creatureType === 'crane' || this.creatureType === 'quadruped') {
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
        rect(10, 10, 250, 180);
        
        fill(255);
        textAlign(LEFT);
        textSize(11);
        let y = 25;
        
        text(`Creature: ${this.creatureType}`, 20, y); y += 15;
        text(`Chains: ${this.chains.length}`, 20, y); y += 15;
        text(`Body: (${int(this.bodyPosition.x)}, ${int(this.bodyPosition.y)})`, 20, y); y += 15;
        
        if (this.activeLocomotion) {
            text(`Locomotion: ${this.activeLocomotion.name}`, 20, y); y += 15;
            text(`Cycle: ${this.activeLocomotion.getCycle().toFixed(2)}`, 20, y); y += 15;
            if (this.activeLocomotion.footSteps) {
                text(`Grounded feet: ${this.activeLocomotion.getGroundedFeetCount()}`, 20, y); y += 15;
            }
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
        rect(width - 250, 10, 240, 200);
        
        fill(255);
        textAlign(LEFT);
        textSize(11);
        let x = width - 240;
        let y = 25;
        
        text("ENHANCED MODULAR SYSTEM", x, y); y += 20;
        text("1: Fish (undulating)", x, y); y += 15;
        text("2: Bipedal Crane (walking)", x, y); y += 15;
        text("3: Quadruped (trotting)", x, y); y += 15;
        text("4: Snake (serpentine)", x, y); y += 20;
        
        text("FEATURES:", x, y); y += 15;
        text("• Modular locomotion patterns", x, y); y += 15;
        text("• Advanced bone templates", x, y); y += 15;
        text("• Constraint system", x, y); y += 15;
        text("• Gait state machines", x, y); y += 15;
        text("• Behavioral controllers", x, y); y += 20;
        
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

    drawControls() {
        push();
        fill(0, 180);
        noStroke();
        rect(10, 10, 250, this.creatureType === 'quadruped' ? 200 : 130, 5);
        
        fill(255);
        textAlign(LEFT, TOP);
        textSize(12);
        
        let y = 20;
        text('CREATURE TYPES', 20, y); y += 20;
        text('1: Fish (swimming)', 30, y); y += 15;
        text('2: Bipedal Crane (walking)', 30, y); y += 15;
        text('3: Quadruped (walking)', 30, y); y += 15;
        text('4: Snake (slithering)', 30, y); y += 25;
        
        // Gait controls (only for quadruped)
        if (this.creatureType === 'quadruped' && this.activeLocomotion) {
            text('GAIT CONTROLS', 20, y); y += 20;
            text('W: Walk', 30, y); y += 15;
            text('T: Trot', 30, y); y += 15;
            text('G: Gallop', 30, y); y += 15;
            text('P: Pace', 30, y); y += 15;
            
            // Gait analysis info
            const analysis = this.activeLocomotion.getGaitAnalysis ? this.activeLocomotion.getGaitAnalysis() : null;
            if (analysis) {
                y += 5;
                text('GAIT ANALYSIS', 20, y); y += 20;
                text(`Type: ${analysis.gaitType}`, 30, y); y += 15;
                text(`Duty Factor: ${analysis.dutyFactor.toFixed(2)}`, 30, y); y += 15;
                text(`Frequency: ${analysis.frequency.toFixed(2)} Hz`, 30, y); y += 15;
                text(`Grounded: ${analysis.groundedFeet}/4`, 30, y); y += 15;
                text(`Stability: ${(analysis.stabilityMargin * 100).toFixed(1)}%`, 30, y);
            }
        } else {
            text('D: Toggle debug info', 20, y); y += 20;
            text('Mouse: Head target', 20, y);
        }
        
        pop();
    }
}

// ENHANCED MODULAR SYSTEMS

class LocomotionSystem {
    constructor() {
        this.patterns = new Map();
        this.initializePatterns();
    }

    initializePatterns() {
        this.patterns.set('undulate', UndulatePattern);
        this.patterns.set('bipedal-walk', BipedalWalkPattern);
        this.patterns.set('quadruped-walk', QuadrupedWalkPattern);
        this.patterns.set('serpentine', SerpentinePattern);
    }

    createPattern(type, config) {
        const PatternClass = this.patterns.get(type);
        if (PatternClass) {
            return new PatternClass(config);
        }
        console.warn(`Locomotion pattern ${type} not found`);
        return null;
    }
}

class LocomotionPattern {
    constructor(name, config) {
        this.name = name;
        this.config = config;
        this.cycle = 0;
        this.frequency = config.frequency || 1.0;
    }

    update(creature, deltaTime) {
        this.cycle += this.frequency * deltaTime;
    }

    getCycle() {
        return this.cycle;
    }
}

class UndulatePattern extends LocomotionPattern {
    constructor(config) {
        super('undulate', config);
        this.wavelength = config.wavelength || 0.7;
        this.amplitude = config.amplitude || 20;
    }

    update(creature, deltaTime) {
        super.update(creature, deltaTime);
        
        // Fish body follows mouse with swimming motion
        const directionToMouse = new FIK.V2(
            creature.mouseTarget.x - creature.bodyPosition.x,
            creature.mouseTarget.y - creature.bodyPosition.y
        ).normalised();
        
        // Add swimming undulation
        const swimOffset = Math.sin(this.cycle) * this.amplitude;
        const perpendicular = new FIK.V2(-directionToMouse.y, directionToMouse.x);
        
        creature.bodyVelocity.add(directionToMouse.multiplyScalar(0.02));
        creature.bodyVelocity.add(perpendicular.multiplyScalar(swimOffset * 0.001));
        creature.bodyVelocity.multiplyScalar(0.95); // Drag
        
        creature.bodyPosition.add(creature.bodyVelocity);
    }

    applyBodyWave(chain, config) {
        // Apply wave motion to spine bones
        chain.bones.forEach((bone, i) => {
            const wavePhase = this.cycle - i * 0.3;
            const waveOffset = Math.sin(wavePhase) * this.amplitude * (i / chain.bones.length);
            bone.waveOffset = waveOffset;
        });
    }

    getFinTarget(finRole, context) {
        const direction = context.parentBone.getDirectionUV();
        
        if (finRole === "tail-fin") {
          return new FIK.V2(
            context.attachPoint.x + direction.x * 40,
            context.attachPoint.y +
              direction.y * 40 +
              Math.sin(this.cycle * 2) * 15
          );
        } else if (finRole === "dorsal-fin") {
          const upDir = new FIK.V2(-direction.y, direction.x);
          return new FIK.V2(
            context.attachPoint.x + upDir.x * 30,
            context.attachPoint.y + upDir.y * 30
          );
        } else if (finRole.includes("pectoral")) {
          const sideDir = finRole.includes("left")
            ? new FIK.V2(direction.y, -direction.x)
            : new FIK.V2(-direction.y, direction.x);
          return new FIK.V2(
            context.attachPoint.x + sideDir.x * 25,
            context.attachPoint.y + sideDir.y * 25
          );
        }
        
        return context.attachPoint;
    }

    getTailSwing() {
        return Math.sin(this.cycle) * 0.1;
    }
}

class BipedalWalkPattern extends LocomotionPattern {
    constructor(config) {
        super('bipedal-walk', config);
        this.stepLength = config.stepLength || 25;
        this.stepHeight = config.stepHeight || 30;
        this.bodyHeight = config.bodyHeight || 60;
        this.footSteps = [];
        this.state = 'idle'; // 'walk', 'turn'
    }

    initializeFootSteps(bodyPosition, numFeet) {
        this.footSteps = [];
        for (let i = 0; i < numFeet; i++) {
            this.footSteps.push({
                target: new FIK.V2(
                    bodyPosition.x + (i % 2 === 0 ? -30 : 30),
                    bodyPosition.y + this.bodyHeight
                ),
                phase: i * Math.PI,
                isLifted: false,
                side: i % 2 === 0 ? 'left' : 'right'
            });
        }
    }

    update(creature, deltaTime) {
        super.update(creature, deltaTime);
        
        // 1. Compute direction to target and angle difference
        const dirToTarget = new FIK.V2(
            creature.mouseTarget.x - creature.bodyPosition.x,
            creature.mouseTarget.y - creature.bodyPosition.y
        );
        const targetAngle = Math.atan2(dirToTarget.y, dirToTarget.x);
        const angleDiff = creature.normalizeAngle(targetAngle - creature.bodyHeading);

        // 2. State selection: turn or walk
        const absAngleDiff = Math.abs(angleDiff);
        const TURN_THRESHOLD = Math.PI / 3; // ~60 deg
        if (absAngleDiff > TURN_THRESHOLD) {
            this.state = 'turn';
        } else {
            this.state = 'walk';
        }

        // 3. Animate heading and feet
        if (this.state === 'turn') {
            const turnRate = 0.12;
            creature.bodyHeading += turnRate * Math.sign(angleDiff);
            creature.bodyHeading = creature.normalizeAngle(creature.bodyHeading);
        } else if (this.state === 'walk') {
            const walkTurnBlend = 0.07;
            creature.bodyHeading = creature.normalizeAngle(
                creature.bodyHeading + walkTurnBlend * angleDiff
            );

            // Update foot placement - place next step relative to current foot position
            const stepDir = new FIK.V2(Math.cos(creature.bodyHeading), Math.sin(creature.bodyHeading));
            this.footSteps.forEach((foot, i) => {
                foot.phase += 0.1;
                foot.isLifted = Math.sin(foot.phase) > 0.7;

                if (foot.isLifted) {
                    // Place next step ahead of current foot position, not body position
                    const sideOffset = (foot.side === 'left' ? -5 : 5);
                    const perp = new FIK.V2(-stepDir.y, stepDir.x);
                    
                    // Step forward from current foot position
                    const targetX = creature.bodyPosition.x +
                    stepDir.x * this.stepLength +      // Step forward in heading direction
                    perp.x * sideOffset;               // Offset left/right from body center
                
                const targetY = creature.bodyPosition.y +
                    stepDir.y * this.stepLength +      // Step forward in heading direction  
                    perp.y * sideOffset +              // Offset left/right from body center
                    this.bodyHeight;   
                    
                    foot.target.x += (targetX - foot.target.x) * 0.1;
                    foot.target.y += (targetY - foot.target.y) * 0.1;
                }
            });

            // Update body position based on foot average
            this.updateBodyFromFeet(creature);
        }
    }

    updateBodyFromFeet(creature) {
        let avgX = 0, avgY = 0;
        let groundedFeet = 0;
        
        this.footSteps.forEach(foot => {
            if (!foot.isLifted) {
                avgX += foot.target.x;
                avgY += foot.target.y;
                groundedFeet++;
            }
        });
        
        if (groundedFeet > 0) {
            avgX /= groundedFeet;
            avgY /= groundedFeet;
            
            const targetBodyX = avgX;
            const targetBodyY = avgY - this.bodyHeight;
            
            creature.bodyPosition.x += (targetBodyX - creature.bodyPosition.x) * 0.1;
            creature.bodyPosition.y += (targetBodyY - creature.bodyPosition.y) * 0.1;
        }
    }

    getFootTarget(footIndex) {
        if (footIndex < this.footSteps.length) {
            return this.footSteps[footIndex].target;
        }
        return null;
    }

    getGroundedFeetCount() {
        return this.footSteps.filter(f => !f.isLifted).length;
    }

    drawFootTargets() {
        this.footSteps.forEach((foot, i) => {
            push();
            
            if (foot.isLifted) {
                fill(255, 200, 100);
                noStroke();
                const liftHeight = Math.sin(foot.phase) * this.stepHeight;
                circle(foot.target.x, foot.target.y - liftHeight, 8);
                
                stroke(255, 200, 100, 100);
                strokeWeight(1);
                noFill();
                circle(foot.target.x, foot.target.y, 12);
            } else {
                fill(100, 200, 255);
                noStroke();
                circle(foot.target.x, foot.target.y, 10);
            }
            
            fill(0);
            textAlign(CENTER);
            textSize(9);
            text(foot.side, foot.target.x, foot.target.y - 15);
            
            pop();
        });
    }

    getTailTarget(tailRole, context) {
        const direction = context.parentBone.getDirectionUV();
        const tailSwing = Math.sin(this.cycle) * 10;
        return new FIK.V2(
            context.attachPoint.x - direction.x * 30,
            context.attachPoint.y + direction.y * 30 + tailSwing
        );
    }

    getWingTarget(wingRole, context) {
        const direction = context.parentBone.getDirectionUV();
        const flap = Math.sin(this.cycle + (wingRole.includes('left') ? 0 : Math.PI)) * 2;
        const side = wingRole.includes('left') ? 1 : -1;
        return new FIK.V2(
            context.attachPoint.x + direction.x * 40 + side * 20,
            context.attachPoint.y + direction.y * 20 + flap
        );
    }
}

// REPLACE the QuadrupedWalkPattern class with this complete implementation:

class QuadrupedWalkPattern extends LocomotionPattern {
    constructor(config) {
        super('quadruped-walk', config);
        this.stepLength = config.stepLength || 25;
        this.stepHeight = config.stepHeight || 10;
        this.footSteps = [];
        this.phaseOffsets = [0, Math.PI, Math.PI, 0]; // Diagonal pairs
        this.state = 'idle';
    }

    initializeFootSteps(bodyPosition, numFeet) {
        this.footSteps = [];
        const sides = ['front-left', 'front-right', 'back-left', 'back-right'];
        for (let i = 0; i < numFeet; i++) {
            this.footSteps.push({
                target: new FIK.V2(
                    bodyPosition.x + ((i % 2 === 0) ? -40 : 40),
                    bodyPosition.y + 80
                ),
                phase: this.phaseOffsets[i],
                isLifted: false,
                side: sides[i] || 'unknown'
            });
        }
    }

    update(creature, deltaTime) {
        super.update(creature, deltaTime);
        
        // Similar logic to bipedal but with diagonal gait pattern
        const dirToTarget = new FIK.V2(
            creature.mouseTarget.x - creature.bodyPosition.x,
            creature.mouseTarget.y - creature.bodyPosition.y
        );
        const targetAngle = Math.atan2(dirToTarget.y, dirToTarget.x);
        const angleDiff = creature.normalizeAngle(targetAngle - creature.bodyHeading);

        const absAngleDiff = Math.abs(angleDiff);
        const TURN_THRESHOLD = Math.PI / 4;
        
        if (absAngleDiff > TURN_THRESHOLD) {
            this.state = 'turn';
        } else {
            this.state = 'walk';
        }

        if (this.state === 'turn') {
            const turnRate = 0.08;
            creature.bodyHeading += turnRate * Math.sign(angleDiff);
            creature.bodyHeading = creature.normalizeAngle(creature.bodyHeading);
        } else if (this.state === 'walk') {
            const walkTurnBlend = 0.05;
            creature.bodyHeading = creature.normalizeAngle(
                creature.bodyHeading + walkTurnBlend * angleDiff
            );

            // Update quadruped foot placement with trot gait (diagonal pairs)
            const stepDir = new FIK.V2(Math.cos(creature.bodyHeading), Math.sin(creature.bodyHeading));
            this.footSteps.forEach((foot, i) => {
                foot.phase += 0.08;
                
                // Diagonal pairs: front-left with back-right, front-right with back-left
                const pairPhase = i < 2 ? foot.phase : foot.phase + Math.PI;
                foot.isLifted = Math.sin(pairPhase) > 0.6;

                if (foot.isLifted) {
                    // Calculate foot position based on quadruped body layout
                    const isLeft = foot.side.includes('left');
                    const isFront = foot.side.includes('front');
                    
                    // Body-relative positioning for quadruped
                    const lateralOffset = isLeft ? -35 : 35;
                    const longitudinalOffset = isFront ? 40 : -40;
                    
                    // Step forward from current position
                    const baseX = foot.target.x + stepDir.x * this.stepLength * 0.4;
                    const baseY = foot.target.y + stepDir.y * this.stepLength * 0.4;
                    
                    // Manual lerp to avoid p5.js conflicts
                    foot.target.x += (baseX - foot.target.x) * 0.2;
                    foot.target.y += (baseY - foot.target.y) * 0.2;
                }
            });

            this.updateBodyFromFeet(creature);
        }
    }

    // ADD this missing method:
    updateBodyFromFeet(creature) {
        let avgX = 0, avgY = 0;
        let groundedFeet = 0;
        
        this.footSteps.forEach(foot => {
            if (!foot.isLifted) {
                avgX += foot.target.x;
                avgY += foot.target.y;
                groundedFeet++;
            }
        });
        
        if (groundedFeet > 0) {
            avgX /= groundedFeet;
            avgY /= groundedFeet;
            
            const targetBodyX = avgX;
            const targetBodyY = avgY - 80; // Body height above ground
            
            // Manual lerp to avoid p5.js conflicts
            creature.bodyPosition.x += (targetBodyX - creature.bodyPosition.x) * 0.1;
            creature.bodyPosition.y += (targetBodyY - creature.bodyPosition.y) * 0.1;
        }
    }

    getFootTarget(footIndex) {
        if (footIndex < this.footSteps.length) {
            return this.footSteps[footIndex].target;
        }
        return null;
    }

    getGroundedFeetCount() {
        return this.footSteps.filter(f => !f.isLifted).length;
    }

    // ADD this missing method:
    drawFootTargets() {
        this.footSteps.forEach((foot, i) => {
            push();
            
            if (foot.isLifted) {
                fill(255, 200, 100);
                noStroke();
                const liftHeight = Math.sin(foot.phase) * this.stepHeight;
                circle(foot.target.x, foot.target.y - liftHeight, 8);
                
                stroke(255, 200, 100, 100);
                strokeWeight(1);
                noFill();
                circle(foot.target.x, foot.target.y, 12);
            } else {
                fill(100, 200, 255);
                noStroke();
                circle(foot.target.x, foot.target.y, 10);
            }
            
            fill(0);
            textAlign(CENTER);
            textSize(9);
            text(foot.side, foot.target.x, foot.target.y - 15);
            
            pop();
        });
    }

    // ADD this missing method:
    getTailTarget(tailRole, context) {
        const direction = context.parentBone.getDirectionUV();
        const tailSwing = Math.sin(this.cycle) * 10;
        return new FIK.V2(
            context.attachPoint.x - direction.x * 30,
            context.attachPoint.y + direction.y * 30 + tailSwing
        );
    }

    // ADD this missing method:
    getTailSwing() {
        return Math.sin(this.cycle) * 0.1;
    }

    // ADD this missing method:
    getWingTarget(wingRole, context) {
        const direction = context.parentBone.getDirectionUV();
        const flap = Math.sin(this.cycle + (wingRole.includes('left') ? 0 : Math.PI)) * 5;
        const side = wingRole.includes('left') ? 1 : -1;
        return new FIK.V2(
            context.attachPoint.x + direction.x * 40 + side * 20,
            context.attachPoint.y + direction.y * 20 + flap
        );
    }
}

// IMMEDIATE IMPROVEMENT: Replace your QuadrupedWalkPattern with this biomechanically accurate version

class BiomechanicalQuadrupedGait extends LocomotionPattern {
    constructor(config) {
        super('biomechanical-quadruped', config);
        
        // Research-based gait parameters
        this.gaitType = config.gaitType || 'trot';
        this.gaitParams = this.getGaitParameters(this.gaitType);
        
        // Leg tracking - LF, RF, LH, RH (Left Front, Right Front, Left Hind, Right Hind)
        this.legPhases = [0, 0, 0, 0];
        this.legStates = ['stance', 'stance', 'stance', 'stance'];
        this.footTargets = [];
        
        // Body dynamics
        this.bodyOscillation = 0;
        this.centerOfMass = { x: 0, y: 0 };
        this.state = 'idle'; // To manage turning vs. walking state

        // Stride parameters
        this.stepLength = config.stepLength || 50;
        this.legLength = config.legLength || 80;
        this.groundLevel = 450; // Adjust based on your canvas
        
        console.log(`Initialized ${this.gaitType} gait with duty factor ${this.gaitParams.dutyFactor}`);
    }

    getGaitParameters(gaitType) {
        switch(gaitType) {
            case 'walk':
                return {
                    dutyFactor: 0.70,           // 70% stance phase - research accurate
                    phaseShifts: [0, 180, 90, 270], // LF, RF, LH, RH in degrees - lateral sequence
                    frequency: 1.0,             // 1 Hz stride frequency
                    minGroundedFeet: 2,         // Always 2-3 feet on ground
                    stepHeight: 0.15,           // 15% of leg length
                    bodyOscillationAmp: 0.03,   // 3% vertical oscillation
                    suspensionPhase: 0          // No suspension in walk
                };
            case 'trot':
                return {
                    dutyFactor: 0.50,           // 50% stance phase - diagonal pairs
                    phaseShifts: [0, 180, 180, 0], // Diagonal coupling: LF+RH, RF+LH
                    frequency: 2.0,             // 2 Hz stride frequency
                    minGroundedFeet: 0,         // Can have suspension phases
                    stepHeight: 0.20,           // 20% of leg length
                    bodyOscillationAmp: 0.05,   // 5% vertical oscillation
                    suspensionPhase: 0.1        // Brief suspension phases
                };
            case 'pace':
                return {
                    dutyFactor: 0.50,           // 50% stance phase - lateral pairs
                    phaseShifts: [0, 180, 0, 180], // Lateral coupling: LF+LH, RF+RH
                    frequency: 2.2,             // Slightly faster than trot
                    minGroundedFeet: 0,         // Can have suspension phases
                    stepHeight: 0.18,           // 18% of leg length
                    bodyOscillationAmp: 0.06,   // 6% vertical oscillation
                    suspensionPhase: 0.15       // Lateral gaits have more suspension
                };
            case 'gallop':
                return {
                    dutyFactor: 0.30,           // 30% stance phase - asymmetrical
                    phaseShifts: [0, 45, 180, 225], // Lead leg preference
                    frequency: 3.0,             // 3 Hz stride frequency
                    minGroundedFeet: 0,         // Significant suspension phases
                    stepHeight: 0.30,           // 30% of leg length
                    bodyOscillationAmp: 0.10,   // 10% vertical oscillation
                    suspensionPhase: 0.4        // Long suspension phases
                };
            default:
                return this.getGaitParameters('trot');
        }
    }

    initializeFootSteps(bodyPosition, numFeet) {
        this.footTargets = [];
        
        // Anatomically correct foot placement for quadruped
        const legSpacing = 40; // Side-to-side spacing
        const shoulderHip = 80; // Front-to-back spacing between shoulders and hips
        
        // LF, RF, LH, RH
        const positions = [
            { x: bodyPosition.x + shoulderHip/2, y: bodyPosition.y + this.legLength, side: 'left', limb: 'front' },
            { x: bodyPosition.x + shoulderHip/2, y: bodyPosition.y + this.legLength, side: 'right', limb: 'front' },
            { x: bodyPosition.x - shoulderHip/2, y: bodyPosition.y + this.legLength, side: 'left', limb: 'hind' },
            { x: bodyPosition.x - shoulderHip/2, y: bodyPosition.y + this.legLength, side: 'right', limb: 'hind' }
        ];

        for (let i = 0; i < 4; i++) {
            this.footTargets.push({
                target: new FIK.V2(
                    positions[i].x + (positions[i].side === 'left' ? -legSpacing : legSpacing),
                    this.groundLevel
                ),
                phase: this.gaitParams.phaseShifts[i] / 360.0,
                isLifted: false,
                side: positions[i].side,
                limb: positions[i].limb,
                name: `${positions[i].side}-${positions[i].limb}`
            });
        }

        console.log('Initialized foot targets:', this.footTargets.map(f => f.name));
    }

    update(creature, deltaTime) {
        super.update(creature, deltaTime);

        // 1. Compute direction to target and angle difference for steering
        const dirToTarget = new FIK.V2(
            creature.mouseTarget.x - creature.bodyPosition.x,
            creature.mouseTarget.y - creature.bodyPosition.y
        );
        const targetAngle = Math.atan2(dirToTarget.y, dirToTarget.x);
        const angleDiff = creature.normalizeAngle(targetAngle - creature.bodyHeading);

        // 2. State selection: turn in place or walk forward
        const absAngleDiff = Math.abs(angleDiff);
        const TURN_THRESHOLD = Math.PI / 4; // 45 degrees
        
        // Only turn if the angle is significant and we're not too close to the target
        if (absAngleDiff > TURN_THRESHOLD && dirToTarget.length() > 50) {
            this.state = 'turn';
        } else {
            this.state = 'walk';
        }

        // 3. Animate heading based on the current state
        if (this.state === 'turn') {
            // If turning, rotate the body on the spot
            const turnRate = 0.08;
            creature.bodyHeading += turnRate * Math.sign(angleDiff);
            creature.bodyHeading = creature.normalizeAngle(creature.bodyHeading);
        } else { // 'walk' state
            // If walking, blend turning and forward motion
            const walkTurnBlend = 0.05;
            creature.bodyHeading = creature.normalizeAngle(
                creature.bodyHeading + walkTurnBlend * angleDiff
            );
        }
        
        // 4. Update biomechanics using the new heading
        this.updateLegPhases();
        this.updateFootPositions(creature);
        this.updateBodyDynamics(creature);
        this.checkGaitTransitions(creature);
    }

    updateLegPhases() {
        for (let i = 0; i < 4; i++) {
            // Calculate phase with proper offset
            this.legPhases[i] = (this.cycle + this.gaitParams.phaseShifts[i] / 360.0) % 1.0;
            
            // Determine stance vs swing phase
            this.legStates[i] = this.legPhases[i] < this.gaitParams.dutyFactor ? 'stance' : 'swing';
            
            // Update foot target state
            if (this.footTargets[i]) {
                this.footTargets[i].isLifted = this.legStates[i] === 'swing';
                this.footTargets[i].phase = this.legPhases[i];
            }
        }
    }

    updateFootPositions(creature) {
        const forward = new FIK.V2(Math.cos(creature.bodyHeading), Math.sin(creature.bodyHeading));
        const strideLength = this.stepLength;
        
        for (let i = 0; i < 4; i++) {
            const foot = this.footTargets[i];
            const phase = this.legPhases[i];
            
            if (this.legStates[i] === 'stance') {
                // STANCE PHASE: Foot is on ground, moves backward relative to body
                const stanceProgress = phase / this.gaitParams.dutyFactor;
                
                // Foot moves from front of stride to back of stride
                const footOffset = strideLength * (0.5 - stanceProgress);
                foot.target.x = creature.bodyPosition.x + forward.x * footOffset;
                foot.target.y = this.groundLevel;
                
            } else {
                // SWING PHASE: Foot lifts and moves forward
                const swingProgress = (phase - this.gaitParams.dutyFactor) / (1 - this.gaitParams.dutyFactor);
                
                // Foot moves from back to front with arc trajectory
                const footOffset = strideLength * (swingProgress - 0.5);
                foot.target.x = creature.bodyPosition.x + forward.x * footOffset;
                
                // Sinusoidal lift trajectory
                const liftHeight = this.gaitParams.stepHeight * this.legLength * Math.sin(Math.PI * swingProgress);
                foot.target.y = this.groundLevel - liftHeight;
            }
            
            // Add lateral offset for left/right legs
            const lateral = new FIK.V2(-forward.y, forward.x);
            const lateralOffset = foot.side === 'left' ? -35 : 35;
            foot.target.x += lateral.x * lateralOffset;
            foot.target.y += lateral.y * lateralOffset;
            
            // Add longitudinal offset for front/hind legs
            const longitudinalOffset = foot.limb === 'front' ? 40 : -40;
            foot.target.x += forward.x * longitudinalOffset;
            foot.target.y += forward.y * longitudinalOffset;
        }
    }

    updateBodyDynamics(creature) {
        // Calculate center of mass based on grounded feet (biomechanically accurate)
        const groundedFeet = this.footTargets.filter(f => !f.isLifted);
        
        if (groundedFeet.length > 0) {
            // Average position of grounded feet
            let avgX = groundedFeet.reduce((sum, f) => sum + f.target.x, 0) / groundedFeet.length;
            let avgY = groundedFeet.reduce((sum, f) => sum + f.target.y, 0) / groundedFeet.length;
            
            // Add gait-specific body oscillation (research-based)
            this.bodyOscillation = this.gaitParams.bodyOscillationAmp * this.legLength * 
                                  Math.sin(2 * Math.PI * this.cycle);
            
            // Body height is leg length above average foot position
            const targetBodyX = avgX;
            const targetBodyY = avgY - this.legLength + this.bodyOscillation;
            
            // Smooth body movement (prevents jerky motion)
            const smoothingFactor = 0.1;
            creature.bodyPosition.x += (targetBodyX - creature.bodyPosition.x) * smoothingFactor;
            creature.bodyPosition.y += (targetBodyY - creature.bodyPosition.y) * smoothingFactor;
            
            // Update center of mass for stability calculations
            this.centerOfMass.x = creature.bodyPosition.x;
            this.centerOfMass.y = creature.bodyPosition.y;
        }
    }

    checkGaitTransitions(creature) {
        // Calculate Froude number for biologically accurate gait transitions
        const velocity = this.calculateBodyVelocity(creature);
        const froudeNumber = (velocity * velocity) / (9.81 * this.legLength / 100); // Convert cm to m
        
        // Research-based transition thresholds
        if (this.gaitType === 'walk' && froudeNumber > 0.5) {
            this.transitionToGait('trot');
        } else if (this.gaitType === 'trot' && froudeNumber < 0.4) {
            this.transitionToGait('walk');
        } else if (this.gaitType === 'trot' && froudeNumber > 2.5) {
            this.transitionToGait('gallop');
        } else if (this.gaitType === 'gallop' && froudeNumber < 2.0) {
            this.transitionToGait('trot');
        }
    }

    calculateBodyVelocity(creature) {
        // Estimate velocity from stride frequency and length
        return this.frequency * this.stepLength / 100; // Convert to m/s
    }

    transitionToGait(newGaitType) {
        if (this.gaitType !== newGaitType) {
            console.log(`Gait transition: ${this.gaitType} → ${newGaitType}`);
            this.gaitType = newGaitType;
            this.gaitParams = this.getGaitParameters(newGaitType);
            this.frequency = this.gaitParams.frequency;
        }
    }

    getFootTarget(footIndex) {
        if (footIndex < this.footTargets.length) {
            return this.footTargets[footIndex].target;
        }
        return null;
    }

    getGroundedFeetCount() {
        return this.footTargets.filter(f => !f.isLifted).length;
    }

    drawFootTargets() {
        this.footTargets.forEach((foot, i) => {
            push();
            
            if (foot.isLifted) {
                // Swing phase - yellow/orange foot
                fill(255, 200, 100);
                noStroke();
                circle(foot.target.x, foot.target.y, 8);
                
                // Ground projection
                stroke(255, 200, 100, 100);
                strokeWeight(1);
                noFill();
                circle(foot.target.x, this.groundLevel, 12);
                
                // Trajectory line
                stroke(255, 200, 100, 50);
                line(foot.target.x, foot.target.y, foot.target.x, this.groundLevel);
            } else {
                // Stance phase - blue foot
                fill(100, 200, 255);
                noStroke();
                circle(foot.target.x, foot.target.y, 10);
                
                // Weight indicator (larger circle for grounded foot)
                stroke(100, 200, 255);
                strokeWeight(2);
                noFill();
                circle(foot.target.x, foot.target.y, 16);
            }
            
            // Foot label
            fill(0);
            textAlign(CENTER);
            textSize(9);
            text(foot.name, foot.target.x, foot.target.y - 20);
            
            // Phase indicator
            textSize(7);
            text(`${(foot.phase * 100).toFixed(0)}%`, foot.target.x, foot.target.y - 10);
            
            pop();
        });
    }

    // Additional gait analysis methods
    getGaitAnalysis() {
        const grounded = this.getGroundedFeetCount();
        const analysis = {
            gaitType: this.gaitType,
            dutyFactor: this.gaitParams.dutyFactor,
            frequency: this.frequency,
            groundedFeet: grounded,
            bodyOscillation: this.bodyOscillation,
            legStates: this.legStates.slice(),
            isSymmetrical: this.isGaitSymmetrical(),
            stabilityMargin: this.calculateStabilityMargin()
        };
        return analysis;
    }

    isGaitSymmetrical() {
        // Check if gait has symmetrical phase relationships
        return this.gaitType === 'walk' || this.gaitType === 'trot' || this.gaitType === 'pace';
    }

    calculateStabilityMargin() {
        // Calculate static stability margin (distance from CoM to support polygon edge)
        const groundedFeet = this.footTargets.filter(f => !f.isLifted);
        if (groundedFeet.length < 3) return 0; // Not statically stable
        
        // Simplified stability calculation (distance to nearest edge)
        const minX = Math.min(...groundedFeet.map(f => f.target.x));
        const maxX = Math.max(...groundedFeet.map(f => f.target.x));
        const centerToEdge = Math.min(
            this.centerOfMass.x - minX,
            maxX - this.centerOfMass.x
        );
        
        return Math.max(0, centerToEdge);
    }
}

class SerpentinePattern extends LocomotionPattern {
    constructor(config) {
        super('serpentine', config);
        this.wavelength = config.wavelength || 120;
        this.amplitude = config.amplitude || 30;
    }

    update(creature, deltaTime) {
        super.update(creature, deltaTime);
        
        // Serpentine movement toward mouse
        const directionToMouse = new FIK.V2(
            creature.mouseTarget.x - creature.bodyPosition.x,
            creature.mouseTarget.y - creature.bodyPosition.y
        ).normalised();
        
        creature.bodyVelocity.add(directionToMouse.multiplyScalar(0.015));
        creature.bodyVelocity.multiplyScalar(0.98);
        creature.bodyPosition.add(creature.bodyVelocity);
    }

    applySerpentineMotion(chain, config) {
        // Apply serpentine wave to each bone
        chain.bones.forEach((bone, i) => {
            const segmentPhase = this.cycle + (i * 2 * Math.PI / this.wavelength);
            const lateralOffset = Math.sin(segmentPhase) * this.amplitude * (1 - i / chain.bones.length);
            bone.serpentineOffset = lateralOffset;
        });
    }
}

class BoneTemplateSystem {
    constructor() {
        this.templates = new Map();
        this.initializeTemplates();
    }

    initializeTemplates() {
        // Fish templates
        this.templates.set('fish-spine', (length, config) => {
            const bones = [];
            for (let i = 0; i < config.segments; i++) {
                bones.push({
                    length: length,
                    direction: new FIK.V2(-1, Math.sin(i * 0.3) * 0.1),
                    constraints: { 
                        clockwise: 25 - i * 2, 
                        anticlockwise: 25 - i * 2 
                    }
                });
            }
            return bones;
        });

        // Vertebrate spine
        this.templates.set('vertebrate-spine', (length, config) => {
            const bones = [];
            for (let i = 0; i < config.segments; i++) {
                bones.push({
                    length: length,
                    direction: new FIK.V2(0, -1),
                    constraints: { 
                        clockwise: config.flexibility === 'high' ? 30 : 10, 
                        anticlockwise: config.flexibility === 'high' ? 30 : 20 
                    }
                });
            }
            return bones;
        });

        // Vertebrate neck
        this.templates.set('vertebrate-neck', (length, config) => {
            const bones = [];
            for (let i = 0; i < config.segments; i++) {
                bones.push({
                    length: length,
                    direction: new FIK.V2(0.2, -1).normalised(),
                    constraints: { 
                        clockwise: 60, 
                        anticlockwise: 60 
                    }
                });
            }
            return bones;
        });

        // Vertebrate legvertebrate-leg
        this.templates.set('crane-leg', (length, config) => {
            return [
                { // Hip to knee
                    length: length*0.5,
                    direction: new FIK.V2(1, 1),
                    constraints: { clockwise: 30, anticlockwise: 30 }
                },
                { // Knee to ankle
                    length: length * 1,
                    direction: new FIK.V2(0, 1),
                    constraints: { clockwise: 90, anticlockwise: 0 }
                },
                { // Ankle to toe
                    length: length * 0.6,
                    direction: new FIK.V2(0, 1),
                    constraints: { clockwise: 90, anticlockwise: 0 }
                },
                { // Foot
                    length: length * 0.2,
                    direction: new FIK.V2(1, 0),
                    constraints: { clockwise: 45, anticlockwise: 0 }
                }
            ];
        });

        // Vertebrate leg
        this.templates.set('vertebrate-leg', (length, config) => {
            return [
                { // Hip to knee
                    length: length*0.5,
                    direction: new FIK.V2(1, 1),
                    constraints: { clockwise: 30, anticlockwise: 30 }
                },
                { // Knee to ankle
                    length: length * 1,
                    direction: new FIK.V2(0, 1),
                    constraints: { clockwise: 90, anticlockwise: 0 }
                },
                { // Ankle to toe
                    length: length * 0.6,
                    direction: new FIK.V2(0, 1),
                    constraints: { clockwise: 90, anticlockwise: 0 }
                },
                { // Foot
                    length: length * 0.2,
                    direction: new FIK.V2(1, 0),
                    constraints: { clockwise: 45, anticlockwise: 0 }
                }
            ];
        });

        // Fin template
        this.templates.set('fin', (size, config) => {
            const rad = (config.angle || 0) * Math.PI / 180;
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
        });

        // Wing template
        this.templates.set('wing', (size, config) => {
            const rad = (config.angle || 0) * Math.PI / 180;
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
        });

        // Vertebrate tail
        this.templates.set('vertebrate-tail', (length, config) => {
            const bones = [];
            for (let i = 0; i < config.segments; i++) {
                bones.push({
                    length: length * (config.taper ? (1 - i * 0.2) : 1),
                    direction: new FIK.V2(-0.8, 0.4),
                    constraints: { clockwise: 40, anticlockwise: 40 }
                });
            }
            return bones;
        });

        // Serpentine spine
        this.templates.set('serpentine-spine', (length, config) => {
            const bones = [];
            for (let i = 0; i < config.segments; i++) {
                bones.push({
                    length: length,
                    direction: new FIK.V2(1, Math.sin(i * 0.1) * 0.05),
                    constraints: { 
                        clockwise: config.flexibility === 'very-high' ? 45 : 30, 
                        anticlockwise: config.flexibility === 'very-high' ? 45 : 30 
                    }
                });
            }
            return bones;
        });
    }

    generateBones(templateName, scale, config) {
        const template = this.templates.get(templateName);
        if (template) {
            return template(scale, config);
        }
        console.warn(`Bone template ${templateName} not found`);
        return [];
    }
}

class GaitSystem {
    constructor() {
        this.gaits = new Map();
        this.initializeGaits();
    }

    initializeGaits() {
        this.gaits.set('walk', {
            dutyCycle: 0.6,
            phaseOffset: Math.PI,
            frequency: 1.0,
            stepHeight: 0.3
        });
        
        this.gaits.set('trot', {
            dutyCycle: 0.5,
            phaseOffsets: [0, Math.PI, Math.PI, 0],
            frequency: 1.5
        });
        
        this.gaits.set('undulate', {
            wavelength: 0.7,
            frequency: 2.0,
            amplitude: 0.15
        });
    }

    getGait(name) {
        return this.gaits.get(name);
    }
}

class ConstraintSystem {
    constructor() {
        this.constraintTemplates = new Map();
        this.initializeConstraints();
    }

    initializeConstraints() {
        this.constraintTemplates.set('vertebra', {
            baseLimits: { clockwise: 25, anticlockwise: 25 },
            stiffness: 0.8,
            damping: 0.1
        });
        
        this.constraintTemplates.set('neck', {
            baseLimits: { clockwise: 60, anticlockwise: 60 },
            stiffness: 0.6,
            damping: 0.2
        });
        
        this.constraintTemplates.set('leg', {
            baseLimits: { clockwise: 45, anticlockwise: 90 },
            stiffness: 0.9,
            damping: 0.1
        });
        
        this.constraintTemplates.set('finBase', {
            baseLimits: { clockwise: 70, anticlockwise: 70 },
            stiffness: 0.7,
            damping: 0.15
        });
        
        this.constraintTemplates.set('wing', {
            baseLimits: { clockwise: 80, anticlockwise: 80 },
            stiffness: 0.6,
            damping: 0.2
        });
        
        this.constraintTemplates.set('default', {
            baseLimits: { clockwise: 45, anticlockwise: 45 },
            stiffness: 0.8,
            damping: 0.1
        });
    }

    getConstraints(templateName, boneConstraints) {
        const template = this.constraintTemplates.get(templateName) || 
                        this.constraintTemplates.get('default');
        
        return {
            clockwise: boneConstraints.clockwise || template.baseLimits.clockwise,
            anticlockwise: boneConstraints.anticlockwise || template.baseLimits.anticlockwise,
            stiffness: template.stiffness,
            damping: template.damping
        };
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
    
    console.log("Enhanced Modular Creature Builder initialized");
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
        case '3': 
            creatureBuilder.buildQuadruped(); 
            break;
        case '4': 
            creatureBuilder.buildSnake(); 
            break;
            
        // Gait switching for quadruped
        case 'w': case 'W':
            if (creatureBuilder.activeLocomotion?.transitionToGait) {
                creatureBuilder.activeLocomotion.transitionToGait('walk');
            }
            break;
        case 't': case 'T':
            if (creatureBuilder.activeLocomotion?.transitionToGait) {
                creatureBuilder.activeLocomotion.transitionToGait('trot');
            }
            break;
        case 'g': case 'G':
            if (creatureBuilder.activeLocomotion?.transitionToGait) {
                creatureBuilder.activeLocomotion.transitionToGait('gallop');
            }
            break;
        case 'p': case 'P':
            if (creatureBuilder.activeLocomotion?.transitionToGait) {
                creatureBuilder.activeLocomotion.transitionToGait('pace');
            }
            break;
            
        case 'd': case 'D':
            creatureBuilder.showDebug = !creatureBuilder.showDebug;
            break;
    }
}
