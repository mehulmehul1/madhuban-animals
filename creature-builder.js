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

        // Madhubani styling systems
        this.themeManager = new ThemeManager();
        this.borderDecorator = new BorderDecorator([], {});
        this.filler = new Filler([], {});
        this.segmenter = new Segmenter([]);
        
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
            footIndex: params.footIndex,
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
                attachmentPoint: 'bone-index',
                attachmentIndex: 0, 
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
            attachmentPoint: 'bone-index',
            attachmentIndex: 1, 
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
                attachmentIndex: 1,  // Changed to use a valid bone index
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

    buildQuadruped() {
        this.clearCreature();
        this.creatureType = 'quadruped';
        
        this.creatureConfig = {
            bodyLength: 200,
            legLength: 80,
            neckLength: 40
        };
        
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
            bones: this.boneTemplateSystem.generateBones('vertebrate-spine', 20, {
                segments: 6,
                flexibility: 'medium'
            }),
            locomotionRole: 'primary',
            constraintTemplate: 'vertebra',
            shapeProfile: 'torso'
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
            constraintTemplate: 'neck',
            shapeProfile: 'neck'
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
                bones: this.boneTemplateSystem.generateBones('vertebrate-leg', 40, {
                    segments: 4,
                    side: side
                }),
                locomotionRole: 'support',
                constraintTemplate: 'leg',
                footIndex: i, // Front feet are 0 and 1
                shapeProfile: 'limb'
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
                footIndex: i + 2, // Back feet are 2 and 3
                shapeProfile: 'limb'
            });
            this.addChain(legConfig);
        });
        
        // Tail - attached to the back of the body
        const tailConfig = this.createChainConfig({
            role: 'tail',
            type: 'tail',
            attachment: 'parent',
            targetMode: 'parent-relative',
            parentRole: 'body',
            attachmentPoint: 'bone-index',
            attachmentIndex: 0, 
            color: [255, 150, 100],
            bones: this.boneTemplateSystem.generateBones('vertebrate-tail', 30, {  // Increased length for better visibility
                segments: 5,  // Added one more segment for smoother movement
                taper: true
            }),
            locomotionRole: 'balance',
            constraintTemplate: 'vertebra',
            shapeProfile: 'tapered-tail'
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
                        const footIndex = cfg.footIndex;
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
            let parentChain = null;
            let attachPoint = null;
            let parentBone = null;
            // If attached to a parent, calculate the fresh attachment point from the now-updated parent chain 
            if (cfg.attachment === 'parent' && cfg.parentRole) {
                const parentIndex = this.chainConfigs.findIndex(c => c.role === cfg.parentRole);
                if (parentIndex !== -1) {
                    parentChain = this.chains[parentIndex];
                    switch (cfg.attachmentPoint) {
                        case 'start':
                            if (parentChain.bones.length > 0) {
                                const lastBone = parentChain.bones[parentChain.bones.length - 1];
                                // attachPoint = lastBone.end;
                                parentBone = parentChain.bones[parentChain.bones.length - 1]; 
                            }
                            break;
                        case 'end':
                            if (parentChain.bones.length > 0) {
                                const lastBone = parentChain.bones[parentChain.bones.length - 1];
                                attachPoint = lastBone.end;
                                parentBone = lastBone;
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
                    if (attachPoint) {
                        chain.setBaseLocation(attachPoint);
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
            
            if (cfg.attachment === 'free') {
                if ((cfg.role === 'spine' || cfg.role === 'body')) {
                    chain.setBaseLocation(this.bodyPosition);
                }    
            } else if (cfg.attachment === 'parent' && ctx.attachPoint) {
                chain.setBaseLocation(ctx.attachPoint);
            }

            // Get update strategy for this chain and run it
            const updateStrategy = this.getChainUpdateStrategy(cfg);
            if (updateStrategy) {
                try {
                    // Use the context from the cache which contains the resolved attachment points
                    updateStrategy.call(this, chain, cfg, { 
                        attachPoint: ctx.attachPoint, 
                        parentBone: ctx.parentBone,
                        parentChain: ctx.parentChain
                    });
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
        this.chains.forEach((chain, i) => {
            const config = this.chainConfigs[i];
            if (chain.bones.length < 2) return;

            // 1. Generate the outline from the bone chain and a width profile
            const fikOutline = this.generateOutlineFromChain(chain, t => {
                // Example width profile: thicker in the middle
                return 30 * (0.5 + 0.5 * (1 - Math.pow(2 * t - 1, 2)));
            });

            // Convert FIK.V2 outline to p5.Vector outline for rendering and decoration
            const outline = fikOutline.map(p => createVector(p.x, p.y));

            // 2. Draw the main filled shape using the theme
            const creatureFill = this.themeManager.get('creature_fill')();
            const creatureStroke = this.themeManager.get('creature_stroke');
            const themeStrokeWeight = this.themeManager.get('stroke_weight');

            fill(creatureFill);
            stroke(creatureStroke);
            strokeWeight(themeStrokeWeight);

            beginShape();
            for (const pt of outline) {
                vertex(pt.x, pt.y);
            }
            endShape(CLOSE);

            // 3. Apply Madhubani-style decorations
            this.applyDecorations(outline);
        });
    }

    generateOutlineFromChain(chain, widthProfile) {
        const points = chain.bones.map(b => b.start).concat([chain.bones[chain.bones.length - 1].end]);
        const outline = [];
        const left = [], right = [];

        for (let i = 0; i < points.length; i++) {
            const t = i / (points.length - 1);
            const w = widthProfile(t) / 2;

            let dir;
            if (i === 0) {
                dir = points[1].minus(points[0]);
            } else if (i === points.length - 1) {
                dir = points[i].minus(points[i - 1]);
            } else {
                dir = points[i + 1].minus(points[i - 1]);
            }
            dir.normalize();
            const normal = new FIK.V2(-dir.y, dir.x);

            left.push(points[i].plus(normal.multiplyScalar(w)));
            right.push(points[i].plus(normal.multiplyScalar(-w)));
        }

        return left.concat(right.reverse());
    }

    applyDecorations(path) {
        // --- 1. Apply Border to the main outline ---
        const borderStroke = this.themeManager.get('border.stroke');
        this.borderDecorator.path = path;
        this.borderDecorator.style = this.themeManager.get('border.style');
        this.borderDecorator.draw(borderStroke);

        // --- 2. Segment the path and apply different fillers ---
        this.segmenter.path = path;
        const segments = this.segmenter.segment(3);

        const patterns = this.themeManager.get('filler.patterns');
        const fillerStroke = this.themeManager.get('filler.stroke');

        for (let i = 0; i < segments.length; i++) {
            const segmentPath = segments[i];
            if (segmentPath.length > 2) {
                const patternName = patterns[i % patterns.length];
                const style = this.themeManager.get(`filler.styles.${patternName}`);
                
                this.filler.path = segmentPath;
                this.filler.style = style;
                this.filler.draw(fillerStroke);
            }
        }
        
        this.filler.path = [];
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
