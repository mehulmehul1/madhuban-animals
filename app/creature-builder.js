class ModularCreatureBuilder {
  constructor() {
    // Core systems
    this.chains = [];
    this.chainConfigs = []; // Store configuration for each chain

    // Global settings
    this.ik =
      typeof createIKAdapter === "function"
        ? createIKAdapter(typeof FIK !== "undefined" ? FIK : window.FIK)
        : null;
    if (!this.ik) throw new Error("IK adapter not available");
    this.renderer =
      typeof createP5Renderer === "function" ? createP5Renderer() : null;
    if (!this.renderer) throw new Error("Renderer adapter not available");

    this.mouseTarget = new this.ik.V2(400, 300);
    this.showDebug = true;
    this.showSkeleton = false; // Legacy - now handled by renderMode
    this.renderMode = "current"; // 'current', 'skeleton', 'muscle', 'skin'

    // Body tracking system
    this.bodyPosition = new this.ik.V2(300, 300);
    this.bodyVelocity = new this.ik.V2(0, 0);
    this.bodyRotation = 0;
    this.bodyHeading = 0;

    // Enhanced modular systems
    this.locomotionSystem = new LocomotionSystem();
    this.boneTemplateSystem = new BoneTemplateSystem();
    this.gaitSystem = new GaitSystem();
    this.constraintSystem = new ConstraintSystem();
    this.shapeProfileSystem = new ShapeProfileSystem();

    // *** UNIFIED DEBUG SYSTEM ***
    try {
      this.debugManager = new DebugManager();
    } catch (error) {
      console.error("DebugManager failed to load:", error);
      console.log("Using fallback debug system");
      this.debugManager = {
        enabled: true,
        update: () => {},
        draw: () => {},
        handleKeyPress: () => false,
        handleMouseClick: () => false,
      };
    }

    // *** PHASE 2: FORCE-DRIVEN DEFORMATION ENGINE ***
    try {
      // Ensure classes are available globally (loaded via index.html)
      // If using modules, imports would be needed, but this project uses script tags
      this.forceAnalyzer = typeof ForceAnalyzer !== 'undefined' ? new ForceAnalyzer() : null;
      this.deformationEngine = typeof DeformationEngine !== 'undefined' ? new DeformationEngine() : null;
      this.muscleRenderer = typeof MuscleShapeRenderer !== 'undefined' ? new MuscleShapeRenderer({
        debugMode: this.showDebug,
        colorIntensity: 1.0,
      }) : null;
      
      if (this.forceAnalyzer && this.deformationEngine && this.muscleRenderer) {
          console.log("Phase 2 deformation systems initialized");
      } else {
          console.warn("Phase 2 systems missing classes. Check index.html includes.");
      }
    } catch (error) {
      console.error("Phase 2 deformation systems failed to load:", error);
      this.forceAnalyzer = null;
      this.deformationEngine = null;
      this.muscleRenderer = null;
    }

    // Madhubani styling systems
    this.themeManager = new ThemeManager();
    this.borderDecorator = new BorderDecorator([], {});
    this.filler = new Filler([], {});
    this.segmenter = new Segmenter([]);

    // Current creature
    this.creatureType = null;
    this.creatureConfig = null;
    this.activeLocomotion = null;
    
    // Muscles for Phase 2 deformation
    this.muscles = [];
    this.deformationParams = {}; // Will be populated by deformation engine

    // Help overlay (legacy controls panel) – disabled by default to avoid clutter
    this.showHelpOverlay = false;

    // Editor integration
    this.editorActive = false;
    this.editorSavedState = null;

    // Skeleton visualization colors
    this.chainColors = {
      spine: [100, 150, 255], // Blue
      leg: [255, 100, 100], // Red
      neck: [100, 255, 100], // Green
      tail: [255, 255, 100], // Yellow
      fin: [255, 100, 255], // Magenta
      "tail-fin": [255, 100, 255], // Magenta
      "dorsal-fin": [255, 100, 255], // Magenta
      "pectoral-fin": [255, 100, 255], // Magenta
      wing: [255, 150, 100], // Orange
      default: [128, 128, 128], // Gray
    };
  }

  // MODULAR CHAIN CONFIGURATION SYSTEM
  createChainConfig(params) {
    return {
      role: params.role,
      type: params.type, // 'spine', 'leg', 'fin', 'neck', 'head'
      attachment: params.attachment, // 'free', 'body', 'parent'
      targetMode: params.targetMode, // 'mouse', 'foot', 'calculated', 'parent-relative'
      parentRole: params.parentRole || null,
      attachmentPoint: params.attachmentPoint || "end", // 'start', 'end', 'middle', 'bone-index'
      attachmentIndex: params.attachmentIndex || 0,
      color: params.color || [100, 150, 255],
      constraints: params.constraints || { clockwise: 45, anticlockwise: 45 },
      bones: params.bones || [],
      // New modular properties
      locomotionRole: params.locomotionRole || null, // How this chain participates in locomotion
      footIndex: params.footIndex,
      constraintTemplate: params.constraintTemplate || "default",
      behaviorController: params.behaviorController || null,
      shapeProfile: params.shapeProfile || null,
      scale: params.scale || 1.0,
    };
  }

  // CREATURE DEFINITIONS
  buildFish() {
    this.clearCreature();
    this.creatureType = "fish";

    // Fish body configuration
    this.creatureConfig = {
      bodyLength: 200,
      bodySegments: 8,
      segmentLength: 25,
      finSize: 30,
    };

    // Set up fish locomotion
    this.activeLocomotion = this.locomotionSystem.createPattern("undulate", {
      bodyLength: this.creatureConfig.bodyLength,
      amplitude: 20,
      frequency: 1.0,
      wavelength: 0.7,
    });

    // Main spine - body follows swim motion, head follows mouse
    const spineConfig = this.createChainConfig({
      role: "spine",
      type: "spine",
      attachment: "free",
      targetMode: "mouse",
      color: [100, 150, 255],
      bones: this.boneTemplateSystem.generateBones(
        "fish-spine",
        this.creatureConfig.segmentLength,
        {
          segments: this.creatureConfig.bodySegments,
          flexibility: "high",
        }
      ),
      locomotionRole: "primary",
      constraintTemplate: "vertebra",
      shapeProfile: "spine",
      scale: 1.2,
    });
    this.addChain(spineConfig);

    // Tail fin - attached to spine tail
    const tailFinConfig = this.createChainConfig({
      role: "tail-fin",
      type: "fin",
      attachment: "parent",
      targetMode: "parent-relative",
      parentRole: "spine",
      attachmentPoint: "start",
      color: [255, 100, 150],
      bones: this.boneTemplateSystem.generateBones("fin", 30, { angle: 0 }),
      locomotionRole: "propulsion",
      constraintTemplate: "finBase",
      shapeProfile: "fin",
      scale: 0.8,
    });
    this.addChain(tailFinConfig);

    // Dorsal fin - attached to spine middle
    const dorsalFinConfig = this.createChainConfig({
      role: "dorsal-fin",
      type: "fin",
      attachment: "parent",
      targetMode: "parent-relative",
      parentRole: "spine",
      attachmentPoint: "bone-index",
      attachmentIndex: 4,
      color: [150, 255, 100],
      bones: this.boneTemplateSystem.generateBones("fin", 20, { angle: -90 }),
      locomotionRole: "stability",
      constraintTemplate: "finBase",
    });
    this.addChain(dorsalFinConfig);

    // Pectoral fins
    ["left", "right"].forEach((side, i) => {
      const pectoralConfig = this.createChainConfig({
        role: `pectoral-${side}`,
        type: "fin",
        attachment: "parent",
        targetMode: "parent-relative",
        parentRole: "spine",
        attachmentPoint: "bone-index",
        attachmentIndex: 6,
        color: [100, 200, 255],
        bones: this.boneTemplateSystem.generateBones("fin", 18, {
          angle: side === "left" ? -45 : 45,
        }),
        locomotionRole: "steering",
        constraintTemplate: "finBase",
      });
      this.addChain(pectoralConfig);
    });

    console.log("Built modular fish with " + this.chains.length + " chains");
  
  // *** PHASE 2: Generate muscles for deformation engine ***
  this.muscles = this.generateFullMuscles();
}

  buildBipedalCrane() {
    this.clearCreature();
    this.creatureType = "crane";

    // Crane configuration
    this.creatureConfig = {
      bodyHeight: 500,
      legLength: 100,
      neckLength: 60,
      headSize: 20,
    };

    // Set up bipedal locomotion
    this.activeLocomotion = this.locomotionSystem.createPattern(
      "bipedal-walk",
      {
        stepLength: 25,
        stepHeight: 30,
        frequency: 1.0,
        bodyHeight: this.creatureConfig.legLength,
      }
    );

    // Initialize foot steps for bipedal walking
    this.activeLocomotion.initializeFootSteps(this.bodyPosition, 2);

    // Body/Spine - follows leg average position
    const bodyConfig = this.createChainConfig({
      role: "body",
      type: "spine",
      attachment: "free",
      targetMode: "calculated", // Will follow leg average
      color: [150, 100, 200],
      bones: this.boneTemplateSystem.generateBones("vertebrate-spine", 15, {
        segments: 5,
        flexibility: "medium",
      }),
      locomotionRole: "primary",
      constraintTemplate: "vertebra",
    });
    this.addChain(bodyConfig);

    // Neck - attached to body top, follows mouse
    const neckConfig = this.createChainConfig({
      role: "neck",
      type: "neck",
      attachment: "parent",
      targetMode: "mouse",
      parentRole: "body",
      attachmentPoint: "end",
      color: [200, 150, 100],
      bones: this.boneTemplateSystem.generateBones("vertebrate-neck", 10, {
        segments: 10,
        flexibility: "high",
      }),
      locomotionRole: "tracking",
      constraintTemplate: "neck",
    });
    this.addChain(neckConfig);

    // Neck - attached to body top, follows mouse
    const headConfig = this.createChainConfig({
      role: "head",
      type: "head",
      attachment: "parent",
      targetMode: "mouse",
      parentRole: "neck",
      attachmentPoint: "end",
      color: [200, 150, 100],
      bones: this.boneTemplateSystem.generateBones("crane-leg", 10, {
        segments: 10,
        flexibility: "high",
      }),
      locomotionRole: "tracking",
      constraintTemplate: "head",
    });
    this.addChain(headConfig);

    // Legs - attached to body base, follow foot targets
    ["left", "right"].forEach((side, i) => {
      const legConfig = this.createChainConfig({
        role: `leg-${side}`,
        type: "leg",
        attachment: "parent",
        targetMode: "foot",
        parentRole: "body",
        attachmentPoint: "bone-index",
        attachmentIndex: 0,
        color: [100, 200, 100],
        bones: this.boneTemplateSystem.generateBones("crane-leg", 60, {
          segments: 4,
          side: side,
        }),
        locomotionRole: "support",
        constraintTemplate: "leg",
        footIndex: i,
      });
      this.addChain(legConfig);
    });

    // Tail - attached to body base
    const tailConfig = this.createChainConfig({
      role: "tail",
      type: "tail",
      attachment: "parent",
      targetMode: "parent-relative",
      parentRole: "body",
      attachmentPoint: "bone-index",
      attachmentIndex: 1,
      color: [255, 150, 100],
      bones: this.boneTemplateSystem.generateBones("vertebrate-tail", 20, {
        segments: 4,
        taper: true,
      }),
      locomotionRole: "balance",
      constraintTemplate: "vertebra",
    });
    this.addChain(tailConfig);

    // Wings (optional for crane)
    ["left", "right"].forEach((side, i) => {
      const wingConfig = this.createChainConfig({
        role: `wing-${side}`,
        type: "wing",
        attachment: "parent",
        targetMode: "parent-relative",
        parentRole: "body",
        attachmentPoint: "bone-index",
        attachmentIndex: 1, // Changed to use a valid bone index
        color: [100, 200, 255],
        bones: this.boneTemplateSystem.generateBones("wing", 18, {
          angle: side === "left" ? -45 : 45,
        }),
        locomotionRole: "display",
        constraintTemplate: "wing",
      });
      this.addChain(wingConfig);
    });
  
    // *** PHASE 2: Generate muscles for deformation engine ***
    this.muscles = this.generateFullMuscles();
  }

  buildHorse() {
    this.clearCreature();
    this.creatureType = "horse";

    this.creatureConfig = {
      bodyLength: 200,
      legLength: 80,
      neckLength: 40,
    };

    this.activeLocomotion = new QuadrupedWalkPattern({
      stepLength: 50, // Smaller steps for natural walk
      stepHeight: 30, // Moderate lift height
      adaptiveGround: true, // Enable free movement like crane
      debugSimpleMode: true, // Enable simplified mode
      useProperWalkGait: true, // 🔧 ENABLE PROPER WALK GAIT
      shoulderHipDistance: 120, // Horse shoulder-to-hip distance
      legSpacing: 45, // Horse leg spacing (wider stance)
      creatureConfig: this.creatureConfig, // 📐 PASS ANATOMICAL PROPORTIONS
    });

    // Set creature configuration for anatomical calculations
    this.activeLocomotion.setCreatureConfig(this.creatureConfig);

    this.activeLocomotion.initializeFootSteps(this.bodyPosition, 4);

    // Body/Spine - rigid horse spine for stability
    const bodyConfig = this.createChainConfig({
      role: "body",
      type: "spine",
      attachment: "free",
      targetMode: "calculated", // Will follow leg average
      color: [139, 69, 19], // Brown horse color
      bones: this.boneTemplateSystem.generateBones("vertebrate-spine", 25, {
        segments: 8,
        flexibility: "low", // Rigid spine for horse
      }),
      locomotionRole: "primary",
      constraintTemplate: "vertebra",
      shapeProfile: "torso",
      scale: 1.3, // Larger, more muscular body
      erectPosture: true,
    });
    this.addChain(bodyConfig);

    // Neck - strong horse neck
    const neckConfig = this.createChainConfig({
      role: "neck",
      type: "neck",
      attachment: "parent",
      targetMode: "mouse",
      parentRole: "body",
      attachmentPoint: "end",
      color: [139, 69, 19], // Match body color
      bones: this.boneTemplateSystem.generateBones("vertebrate-neck", 15, {
        segments: 6,
        flexibility: "medium", // Strong but flexible horse neck
      }),
      locomotionRole: "tracking",
      constraintTemplate: "neck",
      shapeProfile: "neck",
      scale: 1.1,
      erectPosture: true,
    });
    this.addChain(neckConfig);

    // Front legs - erect posture with powerful shoulders
    ["left", "right"].forEach((side, i) => {
      const legConfig = this.createChainConfig({
        role: `front-leg-${side}`,
        type: "leg",
        attachment: "parent",
        targetMode: "foot",
        parentRole: "body",
        attachmentPoint: "bone-index",
        attachmentIndex: 6, // Front of body
        color: [139, 69, 19], // Match body color
        bones: this.boneTemplateSystem.generateBones("horse-front-leg", 50, {
          segments: 5, // ← UPDATED: Now 5 segments (added hoof)
          side: side,
          erectPosture: true,
        }),
        locomotionRole: "support",
        constraintTemplate: "leg",
        footIndex: i, // Front feet are 0 and 1
        shapeProfile: "leg",
        scale: 1.2, // Muscular horse legs
        erectPosture: true,
        ungulgrade: true, // Walks on hooves
      });
      this.addChain(legConfig);
    });

    // Back legs - powerful hindquarters for propulsion
    ["left", "right"].forEach((side, i) => {
      const legConfig = this.createChainConfig({
        role: `back-leg-${side}`,
        type: "leg",
        attachment: "parent",
        targetMode: "foot",
        parentRole: "body",
        attachmentPoint: "bone-index",
        attachmentIndex: 2, // Back of body
        color: [139, 69, 19], // Match body color
        bones: this.boneTemplateSystem.generateBones("horse-hind-leg", 65, {
          segments: 5, // ← UPDATED: Keep 5 segments (already had hoof)
          side: side,
          erectPosture: true,
          powerfulHindquarters: true,
        }),
        locomotionRole: "propulsion", // Hind legs provide power
        constraintTemplate: "leg",
        footIndex: i + 2, // Back feet are 2 and 3
        shapeProfile: "leg",
        scale: 1.3, // Powerful hind legs
        erectPosture: true,
        ungulgrade: true,
      });
      this.addChain(legConfig);
    });

    // Tail - flowing horse tail with hair
    const tailConfig = this.createChainConfig({
      role: "tail",
      type: "tail",
      attachment: "parent",
      targetMode: "parent-relative",
      parentRole: "body",
      attachmentPoint: "bone-index",
      attachmentIndex: 0,
      color: [101, 67, 33], // Darker brown for tail
      bones: this.boneTemplateSystem.generateBones("vertebrate-tail", 35, {
        segments: 6,
        taper: true,
        flexibility: "medium", // Less flexible than lizard tail
        horseHair: true,
      }),
      locomotionRole: "balance",
      constraintTemplate: "vertebra",
      shapeProfile: "tail",
      scale: 1.1,
      erectPosture: true,
    });
    this.addChain(tailConfig);

    console.log(
      "Built modular quadruped with " + this.chains.length + " chains"
    );
    
    // *** PHASE 2: Generate muscles for deformation engine ***
    this.muscles = this.generateFullMuscles();
  }

  buildLizard() {
    this.clearCreature();
    this.creatureType = "lizard";

    this.creatureConfig = {
      bodyLength: 180,
      legLength: 50,
      tailLength: 120,
      sprawlAngle: 45,
    };

    // Set up sprawling quadruped locomotion with lateral undulation
    this.activeLocomotion = new SprawlingQuadrupedGaitController({
      stepLength: 18,
      stepHeight: 6,
      frequency: 0.9,
      dutyFactor: 0.8,
      shoulderHipDistance: 70,
      legSpacing: 50,
      creatureConfig: this.creatureConfig,
    });

    // Set creature configuration for anatomical calculations
    this.activeLocomotion.setCreatureConfig(this.creatureConfig);

    this.activeLocomotion.initializeFootSteps(this.bodyPosition, 4);

    // Highly flexible spine - supports lateral undulation for sprawling locomotion
    const spineConfig = this.createChainConfig({
      role: "spine",
      type: "spine",
      attachment: "free",
      targetMode: "calculated",
      color: [85, 107, 47], // Olive green lizard color
      bones: this.boneTemplateSystem.generateBones("vertebrate-spine", 14, {
        segments: 15, // More segments for flexibility
        flexibility: "very-high",
      }),
      locomotionRole: "primary",
      constraintTemplate: "vertebra",
      shapeProfile: "torso",
      scale: 0.8, // Lower profile body
      sprawlingPosture: true,
      lateralUndulation: true,
    });
    this.addChain(spineConfig);

    // Sprawling legs - splayed outward for low-to-ground locomotion
    ["left", "right"].forEach((side, i) => {
      // Front legs - splayed at 45 degree angle
      const frontLegConfig = this.createChainConfig({
        role: `front-leg-${side}`,
        type: "leg",
        attachment: "parent",
        targetMode: "foot",
        parentRole: "spine",
        attachmentPoint: "bone-index",
        attachmentIndex: 11, // Front of body
        color: [85, 107, 47], // Match body color
        bones: this.boneTemplateSystem.generateBones("lizard-leg", 42, {
          segments: 4,
          side: side,
          sprawlAngle: 45,
          sprawlingPosture: true,
        }),
        locomotionRole: "support",
        constraintTemplate: "leg",
        footIndex: i,
        shapeProfile: "leg",
        scale: 0.7, // Thinner sprawling legs
        sprawlingPosture: true,
        sprawlAngle: 45,
      });
      this.addChain(frontLegConfig);

      // Back legs - powerful for propulsion with sprawling gait
      const backLegConfig = this.createChainConfig({
        role: `back-leg-${side}`,
        type: "leg",
        attachment: "parent",
        targetMode: "foot",
        parentRole: "spine",
        attachmentPoint: "bone-index",
        attachmentIndex: 4, // Back of body
        color: [85, 107, 47], // Match body color
        bones: this.boneTemplateSystem.generateBones("lizard-leg", 48, {
          segments: 4,
          side: side,
          sprawlAngle: 45,
          sprawlingPosture: true,
          powerfulPush: true,
        }),
        locomotionRole: "propulsion", // Back legs push body forward
        constraintTemplate: "leg",
        footIndex: i + 2,
        shapeProfile: "leg",
        scale: 0.75, // Slightly thicker for propulsion
        sprawlingPosture: true,
        sprawlAngle: 45,
      });
      this.addChain(backLegConfig);
    });

    // Long undulating tail - contributes to locomotion
    const tailConfig = this.createChainConfig({
      role: "tail",
      type: "tail",
      attachment: "parent",
      targetMode: "parent-relative",
      parentRole: "spine",
      attachmentPoint: "bone-index",
      attachmentIndex: 0,
      color: [75, 96, 42], // Darker green for tail
      bones: this.boneTemplateSystem.generateBones("vertebrate-tail", 22, {
        segments: 12, // More segments for snake-like movement
        taper: true,
        flexibility: "very-high",
      }),
      locomotionRole: "propulsion", // Tail assists in forward motion
      constraintTemplate: "vertebra",
      shapeProfile: "tail",
      scale: 0.8,
      sprawlingPosture: true,
      lateralUndulation: true,
    });
    this.addChain(tailConfig);

    console.log("Built modular lizard with " + this.chains.length + " chains");
    
    // *** PHASE 2: Generate muscles for deformation engine ***
    this.muscles = this.generateFullMuscles();
  }

  buildOctopus() {
    this.clearCreature();
    this.creatureType = "octopus";

    this.creatureConfig = {
      mantleSegments: 5,
      mantleLength: 20,
      armSegments: 10,
      armLength: 15,
      numArms: 8,
    };

    this.activeLocomotion = new OctopusCrawlPattern(this);

    const octopusTemplate = new OctopusTemplateSystem(this);

    const mantle = octopusTemplate.createMantle({
      length: this.creatureConfig.mantleLength,
      segments: this.creatureConfig.mantleSegments,
      position: this.bodyPosition,
    });

    for (let i = 0; i < this.creatureConfig.numArms; i++) {
      const attachmentIndex = Math.round(
        (i / (this.creatureConfig.numArms - 1)) *
          (this.creatureConfig.mantleSegments - 1)
      );
      const roleName = `arm-${i}`;
      octopusTemplate.createArm({
        length: this.creatureConfig.armLength,
        segments: this.creatureConfig.armSegments,
        attachmentIndex,
        role: roleName,
      });
    }

    console.log("Built modular octopus with " + this.chains.length + " chains");

    // *** PHASE 2: Generate muscles for deformation engine ***
    this.muscles = this.generateFullMuscles();
  }

  buildSnake() {
    this.clearCreature();
    this.creatureType = "snake";

    this.creatureConfig = {
      segments: 25,
      segmentLength: 12,
    };

    // Set up pure serpentine locomotion
    this.activeLocomotion = this.locomotionSystem.createPattern("serpentine", {
      wavelength: 120,
      amplitude: 30,
      frequency: 2.0,
    });

    // Single long spine with very high flexibility
    const spineConfig = this.createChainConfig({
      role: "spine",
      type: "spine",
      attachment: "free",
      targetMode: "mouse",
      color: [60, 180, 60],
      bones: this.boneTemplateSystem.generateBones(
        "fish-spine",
        this.creatureConfig.segmentLength,
        {
          segments: this.creatureConfig.segments,
          flexibility: "very-high",
        }
      ),
      locomotionRole: "primary",
      constraintTemplate: "vertebra",
      shapeProfile: "spine",
      scale: 0.8,
    });
    this.addChain(spineConfig);

    console.log("Built pure snake with " + this.chains.length + " chains");

    // *** PHASE 2: Generate muscles for deformation engine ***
    this.muscles = this.generateFullMuscles();
  }

  createCreature(type) {
    switch (type) {
      case "fish":
        this.buildFish();
        break;
      case "crane":
        this.buildBipedalCrane();
        break;
      case "horse":
        this.buildHorse();
        break;
      case "lizard":
        this.buildLizard();
        break;
      case "snake":
        this.buildSnake();
        break;
      case "octopus":
        this.buildOctopus();
        break;
    }
  }

  // Legacy method - redirect to horse
  buildQuadruped() {
    this.buildHorse();
  }

  // CHAIN CREATION AND MANAGEMENT
  addChain(config) {
    const chain = new this.ik.Chain2D(this.rgbToHex(config.color));

    // Create first bone
    if (config.bones.length > 0) {
      const firstBone = config.bones[0];
      const startPos = new this.ik.V2(300, 300);
      const direction = firstBone.direction.normalised();
      const endPos = new this.ik.V2(
        startPos.x + direction.x * firstBone.length,
        startPos.y + direction.y * firstBone.length
      );

      const bone = new this.ik.Bone2D(startPos, endPos);

      // Apply advanced constraints - use anatomical data if available
      let constraints;
      if (firstBone.anatomicalRole && this.creatureType) {
        constraints = this.constraintSystem.getAnatomicalConstraints(
          this.creatureType,
          firstBone.anatomicalRole,
          firstBone
        );
      } else {
        constraints = this.constraintSystem.getConstraints(
          config.constraintTemplate,
          firstBone.constraints
        );
      }
      bone.setClockwiseConstraintDegs(constraints.clockwise);
      bone.setAnticlockwiseConstraintDegs(constraints.anticlockwise);

      chain.addBone(bone);

      // Add remaining bones
      for (let i = 1; i < config.bones.length; i++) {
        const boneConfig = config.bones[i];
        let boneConstraints;

        if (boneConfig.anatomicalRole && this.creatureType) {
          boneConstraints = this.constraintSystem.getAnatomicalConstraints(
            this.creatureType,
            boneConfig.anatomicalRole,
            boneConfig
          );
        } else {
          boneConstraints = this.constraintSystem.getConstraints(
            config.constraintTemplate,
            boneConfig.constraints
          );
        }

        chain.addConsecutiveBone(
          boneConfig.direction.normalised(),
          boneConfig.length,
          boneConstraints.clockwise,
          boneConstraints.anticlockwise
        );
      }
    }

    chain.setFixedBaseMode(config.attachment !== "free");
     
    // Assign unique IDs to bones for muscle generation
    if (chain.bones) {
      console.log(`Assigning IDs for chain ${config.role}, bones: ${chain.bones.length}`);
      for (let i = 0; i < chain.bones.length; i++) {
          if (!chain.bones[i].id) {
           chain.bones[i].id = `${config.role}_bone_${i}`;
           console.log(`  Assigned ID: ${chain.bones[i].id}`);
          } else {
            console.log(`  Bone already has ID: ${chain.bones[i].id}`);
          }
       }
     } else {
       console.warn(`Chain ${config.role} has no bones array!`);
     }

     this.chains.push(chain);
     this.chainConfigs.push(config);
     return chain;
   }

   // CREATE CHAIN FROM CONFIGURATION (for ConfigManager integration)
  createChainFromConfig(config) {
    const chain = new this.ik.Chain2D(this.rgbToHex(config.color));

    // Create first bone
    if (config.bones.length > 0) {
      const firstBone = config.bones[0];
      let startPos;

      // Determine start position based on attachment
      if (config.basePosition) {
        startPos = new this.ik.V2(config.basePosition.x, config.basePosition.y);
      } else if (config.attachment === "parent" && config.parentRole) {
        startPos = this.getAttachmentPoint(
          config.parentRole,
          config.attachmentPoint,
          config.attachmentIndex
        );
      } else {
        startPos = new this.ik.V2(300, 300); // Default position
      }

      // Calculate end position
      let direction;
      if (firstBone.direction) {
        direction = firstBone.direction.normalised();
      } else {
        direction = new this.ik.V2(1, 0); // Default right direction
      }

      const endPos = new this.ik.V2(
        startPos.x + direction.x * firstBone.length,
        startPos.y + direction.y * firstBone.length
      );

      const bone = new this.ik.Bone2D(startPos, endPos);

      // Apply constraints
      const constraints = this.getConstraintsForBone(firstBone, config);
      bone.setClockwiseConstraintDegs(constraints.clockwise);
      bone.setAnticlockwiseConstraintDegs(constraints.anticlockwise);

      chain.addBone(bone);

      // Add remaining bones
      for (let i = 1; i < config.bones.length; i++) {
        const boneConfig = config.bones[i];
        const boneConstraints = this.getConstraintsForBone(boneConfig, config);

        let boneDirection;
        if (boneConfig.direction) {
          boneDirection = boneConfig.direction.normalised();
        } else {
          boneDirection = new this.ik.V2(1, 0); // Default direction
        }

        chain.addConsecutiveBone(
          boneDirection,
          boneConfig.length,
          boneConstraints.clockwise,
          boneConstraints.anticlockwise
        );
      }
    }

    // Configure chain properties
    chain.setFixedBaseMode(config.attachment !== "free");
     
    // Assign unique IDs to bones for muscle generation
    if (chain.bones) {
      for (let i = 0; i < chain.bones.length; i++) {
         if (!chain.bones[i].id) {
          chain.bones[i].id = `${config.role}_bone_${i}`;
      }
      }
    }

     // Add to builder arrays
     this.chains.push(chain);
     this.chainConfigs.push(config);

     console.log(
       `Created chain from config: ${config.role} (${config.bones.length} bones)`
     );
     return chain;
   }

  // Helper method to get constraints for a bone
  getConstraintsForBone(boneConfig, chainConfig) {
    let constraints;

    if (boneConfig.anatomicalRole && this.creatureType) {
      constraints = this.constraintSystem.getAnatomicalConstraints(
        this.creatureType,
        boneConfig.anatomicalRole,
        boneConfig
      );
    } else if (boneConfig.constraints) {
      // Use explicit constraints from bone config
      constraints = {
        clockwise: boneConfig.constraints.clockwise || 45,
        anticlockwise: boneConfig.constraints.anticlockwise || 45,
      };
    } else {
      // Use template constraints
      constraints = this.constraintSystem.getConstraints(
        chainConfig.constraintTemplate || "default",
        boneConfig.constraints || {}
      );
    }

    return constraints;
  }

  // Helper method to get attachment point for parent chains
  getAttachmentPoint(parentRole, attachmentPoint, attachmentIndex) {
    // Find parent chain by role
    const parentChainIndex = this.chainConfigs.findIndex(
      (config) => config.role === parentRole
    );

    if (parentChainIndex !== -1 && parentChainIndex < this.chains.length) {
      const parentChain = this.chains[parentChainIndex];

      switch (attachmentPoint) {
        case "start":
          return parentChain.bones[0].start;
        case "end":
          const lastBone = parentChain.bones[parentChain.numBones - 1];
          return lastBone.end;
        case "bone-index":
          if (attachmentIndex < parentChain.numBones) {
            return parentChain.bones[attachmentIndex].start;
          }
          break;
        case "middle":
          const middleIndex = Math.floor(parentChain.numBones / 2);
          return parentChain.bones[middleIndex].start;
      }
    }

    // Fallback to default position
    return new this.ik.V2(300, 300);
  }

  clearCreature() {
    this.chains = [];
    this.chainConfigs = [];
    this.muscles = [];
    this.deformationParams = {};
    this.bodyPosition.set(300, 300);
    this.bodyVelocity.set(0, 0);
    this.activeLocomotion = null;
  }

  // UPDATE SYSTEM
  update() {
    // Only update mouse target if NOT in editor mode to prevent unwanted mouse following
    if (!this.editorActive) {
      this.mouseTarget.set(mouseX, mouseY);
    }

    // Update locomotion system
    if (this.activeLocomotion) {
      this.activeLocomotion.update(this, 1 / 60); // Assuming 60fps
    }

    // Update all chains with enhanced strategies
    // Skip chain updates in editor mode to keep creatures static for selection
    if (!this.editorActive) {
      this.updateChains();
    }

    // *** PHASE 2: Update Deformation Engine ***
    if (this.deformationEngine && this.muscles && this.muscles.length > 0) {
        try {
            // Calculate forces and deformation for all muscles
            this.deformationParams = this.deformationEngine.calculateAllMuscleForcesForCreature(this);
        } catch (error) {
            console.warn("Deformation engine update failed:", error);
            this.deformationParams = {};
        }
    }

    // *** UPDATE UNIFIED DEBUG SYSTEM ***
    this.debugManager.update(this);
  }

  getChainUpdateStrategy(config) {
    // Enhanced strategy system with locomotion integration
    switch (config.type) {
      case "spine":
        return (chain, cfg, ctx) => {
          if (this.creatureType === "octopus") {
            chain.setBaseLocation(this.bodyPosition);
            chain.baseboneConstraintUV = new this.ik.V2(
              Math.cos(this.bodyHeading),
              Math.sin(this.bodyHeading)
            );
            // If controller provides a mantle swim wave, apply it in swim mode
            if (
              this.activeLocomotion &&
              this.activeLocomotion.applyMantleSwimWave &&
              this.activeLocomotion.getMode &&
              this.activeLocomotion.getMode() === "swim"
            ) {
              this.activeLocomotion.applyMantleSwimWave(chain, cfg);
            }
            const dir = chain.baseboneConstraintUV;
            const target = new this.ik.V2(
              this.bodyPosition.x + dir.x * 40,
              this.bodyPosition.y + dir.y * 10
            );
            chain.solveForTarget(target);
          } else if (this.creatureType === "crane") {
            // Crane - upright posture, flexible neck movement
            chain.setBaseLocation(this.bodyPosition);
            chain.baseboneConstraintUV = new this.ik.V2(
              Math.cos(this.bodyHeading),
              Math.sin(this.bodyHeading)
            );
            const dir = chain.baseboneConstraintUV;
            const target = new this.ik.V2(
              this.bodyPosition.x + dir.x * 50,
              this.bodyPosition.y + dir.y * 5
            );
            chain.solveForTarget(target);
          } else if (this.creatureType === "horse") {
            // Horse - rigid spine, erect posture, minimal vertical movement
            chain.setBaseLocation(this.bodyPosition);
            chain.baseboneConstraintUV = new this.ik.V2(
              Math.cos(this.bodyHeading),
              Math.sin(this.bodyHeading)
            );
            const dir = chain.baseboneConstraintUV;
            const target = new this.ik.V2(
              this.bodyPosition.x + dir.x * 80, // Longer, more rigid
              this.bodyPosition.y + dir.y * 5 // Minimal vertical flex
            );
            chain.solveForTarget(target);
          } else if (this.creatureType === "lizard") {
            // Lizard - low sprawling posture with lateral undulation
            chain.setBaseLocation(this.bodyPosition);
            chain.baseboneConstraintUV = new this.ik.V2(
              Math.cos(this.bodyHeading),
              Math.sin(this.bodyHeading)
            );
            // Couple spine undulation to gait if available
            if (
              this.activeLocomotion &&
              this.activeLocomotion.applySpineUndulation
            ) {
              this.activeLocomotion.applySpineUndulation(chain, cfg);
            }
            const dir = chain.baseboneConstraintUV;
            const target = new this.ik.V2(
              this.bodyPosition.x + dir.x * 40,
              this.bodyPosition.y + dir.y * 12 // Low to ground
            );
            chain.solveForTarget(target);
          } else if (this.creatureType === "fish") {
            chain.setBaseLocation(this.bodyPosition);
            // Apply body wave motion if active locomotion supports it
            if (this.activeLocomotion && this.activeLocomotion.applyBodyWave) {
              this.activeLocomotion.applyBodyWave(chain, cfg);
            }
            // Don't follow mouse in editor mode - keep static for selection
            if (!this.editorActive) {
              chain.solveForTarget(this.mouseTarget);
            }
          } else if (this.creatureType === "snake") {
            chain.setBaseLocation(this.bodyPosition);
            if (
              this.activeLocomotion &&
              this.activeLocomotion.applySerpentineMotion
            ) {
              this.activeLocomotion.applySerpentineMotion(chain, cfg);
            }
            // Don't follow mouse in editor mode - keep static for selection
            if (!this.editorActive) {
              chain.solveForTarget(this.mouseTarget);
            }
          }
        };

      case "neck":
        return (chain, cfg, ctx) => {
          // Don't follow mouse in editor mode - keep static for selection
          if (!this.editorActive) {
            chain.solveForTarget(this.mouseTarget);
          }
        };

      case "leg":
        return (chain, cfg, ctx) => {
          // Prefer outward-lateral bending for sprawling lizard
          if (this.creatureType === "lizard") {
            const side = cfg.role.includes("left") ? -1 : 1;
            const base = new this.ik.V2(side * 1.0, 0.3).normalised();
            chain.baseboneConstraintUV = base;
          }
          // Use locomotion system for foot targeting
          if (this.activeLocomotion && this.activeLocomotion.getFootTarget) {
            const footIndex = cfg.footIndex;
            const footTarget = this.activeLocomotion.getFootTarget(footIndex);
            if (footTarget) {
              chain.solveForTarget(footTarget);
            }
          }
        };

      case "arm":
        return (chain, cfg, ctx) => {
          // Cephalopod/arm controller targeting
          if (this.activeLocomotion && this.activeLocomotion.getArmTarget) {
            const armTarget = this.activeLocomotion.getArmTarget(cfg.role, ctx);
            if (armTarget) {
              chain.solveForTarget(armTarget);
            }
          } else {
            // Fallback: hover near attachment point with slight oscillation
            if (ctx.attachPoint) {
              const t = Date.now() * 0.002;
              const offset = new this.ik.V2(
                Math.sin(t) * 20,
                30 + Math.cos(t) * 10
              );
              chain.solveForTarget(
                new this.ik.V2(
                  ctx.attachPoint.x + offset.x,
                  ctx.attachPoint.y + offset.y
                )
              );
            }
          }
        };

      case "fin":
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
            const target = new this.ik.V2(
              ctx.attachPoint.x + targetOffset.x,
              ctx.attachPoint.y + targetOffset.y
            );
            chain.solveForTarget(target);
          }
        };

      case "tail":
        return (chain, cfg, ctx) => {
          if (ctx.attachPoint && ctx.parentBone) {
            chain.setBaseLocation(ctx.attachPoint);

            if (this.activeLocomotion && this.activeLocomotion.getTailTarget) {
              const tailTarget = this.activeLocomotion.getTailTarget(
                cfg.role,
                ctx
              );
              chain.solveForTarget(tailTarget);
            } else {
              // Enhanced tail logic based on creature type
              const direction = ctx.parentBone.getDirectionUV();

              const tailSwing = this.activeLocomotion
                ? this.activeLocomotion.getTailSwing()
                : Math.sin(Date.now() * 0.001) * 0.1;
              const target = new this.ik.V2(
                ctx.attachPoint.x - direction.x * 30,
                ctx.attachPoint.y + direction.y * 30 + tailSwing
              );
              chain.solveForTarget(target);
            }
          }
        };

      case "wing":
        return (chain, cfg, ctx) => {
          if (!ctx.attachPoint || !ctx.parentBone) return;
          chain.setBaseLocation(ctx.attachPoint);

          if (this.activeLocomotion && this.activeLocomotion.getWingTarget) {
            const wingTarget = this.activeLocomotion.getWingTarget(
              cfg.role,
              ctx
            );
            chain.solveForTarget(wingTarget);
          } else {
            // Simple wing flapping
            const direction = ctx.parentBone.getDirectionUV();
            const flap =
              Math.sin(
                Date.now() * 0.003 + (cfg.role.includes("left") ? 0 : Math.PI)
              ) * 20;
            const side = cfg.role.includes("left") ? 1 : -1;
            const target = new this.ik.V2(
              ctx.attachPoint.x + direction.x * 40 + side * 20,
              ctx.attachPoint.y + direction.y * 20 + flap
            );
            chain.solveForTarget(target);
          }
        };

      default:
        return (chain, cfg, ctx) => {
          // Don't follow mouse in editor mode - keep static for selection
          if (!this.editorActive) {
            chain.solveForTarget(this.mouseTarget);
          }
        };
    }
  }

  calculateFinOffset(finRole, direction) {
    // Helper method for fin positioning
    if (finRole === "tail-fin") {
      const swimCycle = this.activeLocomotion
        ? this.activeLocomotion.getCycle()
        : Date.now() * 0.001;
      return new this.ik.V2(
        direction.x * 40,
        direction.y * 40 + Math.sin(swimCycle * 2) * 15
      );
    } else if (finRole === "dorsal-fin") {
      const upDir = new this.ik.V2(-direction.y, direction.x);
      return new this.ik.V2(upDir.x * 30, upDir.y * 30);
    } else if (finRole.includes("pectoral")) {
      const sideDir = finRole.includes("left")
        ? new this.ik.V2(direction.y, -direction.x)
        : new this.ik.V2(-direction.y, direction.x);
      return new this.ik.V2(sideDir.x * 25, sideDir.y * 25);
    }
    return new this.ik.V2(0, 0);
  }

  updateChains() {
    // First pass: resolve attachment, parent chain, parent bone, attach point
    const contextCache = this.chains.map((chain, i) => {
      const cfg = this.chainConfigs[i];
      let parentChain = null;
      let attachPoint = null;
      let parentBone = null;
      // If attached to a parent, calculate the fresh attachment point from the now-updated parent chain
      if (cfg.attachment === "parent" && cfg.parentRole) {
        const parentIndex = this.chainConfigs.findIndex(
          (c) => c.role === cfg.parentRole
        );
        if (parentIndex !== -1) {
          parentChain = this.chains[parentIndex];
          switch (cfg.attachmentPoint) {
            case "start":
              if (parentChain.bones.length > 0) {
                const lastBone =
                  parentChain.bones[parentChain.bones.length - 1];
                // attachPoint = lastBone.end;
                parentBone = parentChain.bones[parentChain.bones.length - 1];
              }
              break;
            case "end":
              if (parentChain.bones.length > 0) {
                const lastBone =
                  parentChain.bones[parentChain.bones.length - 1];
                attachPoint = lastBone.end;
                parentBone = lastBone;
              }
              break;
            case "bone-index":
              const boneIndex = Math.min(
                cfg.attachmentIndex,
                parentChain.bones.length - 1
              );
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

      if (cfg.attachment === "free") {
        if (cfg.role === "spine" || cfg.role === "body") {
          chain.setBaseLocation(this.bodyPosition);
        }
      } else if (cfg.attachment === "parent" && ctx.attachPoint) {
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
            parentChain: ctx.parentChain,
          });
        } catch (e) {
          console.log(`Chain ${cfg.role} strategy error:`, e);
        }
      }
    }

    // *** PHASE 2: Force calculation moved to drawMuscles for now ***
  }

  // RENDER MODE SYSTEM
  setRenderMode(mode) {
    const validModes = ["current", "skeleton", "muscle", "skin"];
    if (validModes.includes(mode)) {
      this.renderMode = mode;
      console.log(`Render mode changed to: ${mode}`);
    } else {
      console.warn(
        `Invalid render mode: ${mode}. Valid modes: ${validModes.join(", ")}`
      );
    }
  }

  switchRenderMode() {
    const modes = ["current", "skeleton", "muscle", "skin"];
    const currentIndex = modes.indexOf(this.renderMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.setRenderMode(modes[nextIndex]);
  }

  getChainColor(role) {
    const colorArray = this.chainColors[role] || this.chainColors["default"];
    return color(colorArray[0], colorArray[1], colorArray[2]);
  }

  getChainColorArray(role) {
    return this.chainColors[role] || this.chainColors["default"];
  }

  // RENDERING SYSTEM (keep existing draw methods)
  draw() {
    this.renderer.background(240, 248, 255);

    // Draw ground reference
    this.renderer.stroke(200);
    this.renderer.strokeWeight(1);
    this.renderer.line(0, 450, this.renderer.width, 450);

    // Draw body position
    // this.drawBodyIndicator();

    // *** REMOVED: Individual foot target drawing - now handled by DebugManager ***
    // Old code: if (this.activeLocomotion && this.activeLocomotion.drawFootTargets) {
    //     this.activeLocomotion.drawFootTargets();
    // }

    // Render based on mode
    switch (this.renderMode) {
      case 'skeleton':
        this.drawSkeleton();
        break;
      case 'muscle':
        // Draw skeleton faintly for reference (optional)
        // this.drawSkeleton(); 
        this.drawMuscles();
        break;
      case 'skin':
        this.drawChains();
        break;
      case 'current':
      default:
        this.drawChains();
        // Legacy support: if showSkeleton is true, overlay it
        if (this.showSkeleton) {
             this.drawSkeleton();
        }
        break;
    }

    // *** UNIFIED DEBUG SYSTEM - Replaces all scattered debug rendering ***
    this.debugManager.draw(this);

    // Optional help panel (disabled by default to reduce clutter)
    if (this.showHelpOverlay) {
      this.drawControls();
    }
  }

  drawBodyIndicator() {
    this.renderer.push();

    // Draw body center
    this.renderer.noStroke();
    this.renderer.fill(255, 100, 100, 100);
    this.renderer.circle(this.bodyPosition.x, this.bodyPosition.y, 20);

    // Draw body heading arrow
    this.renderer.stroke(255, 100, 0);
    this.renderer.strokeWeight(3);
    const headLen = 35;
    this.renderer.line(
      this.bodyPosition.x,
      this.bodyPosition.y,
      this.bodyPosition.x + Math.cos(this.bodyHeading) * headLen,
      this.bodyPosition.y + Math.sin(this.bodyHeading) * headLen
    );

    // Draw body direction (for legged creatures)
    if (this.creatureType === "crane" || this.creatureType === "quadruped") {
      const bodyChain = this.getChainByRole("body");
      if (bodyChain && bodyChain.bones.length > 0) {
        const dir = bodyChain.bones[0].getDirectionUV();
        this.renderer.stroke(255, 100, 100);
        this.renderer.strokeWeight(2);
        this.renderer.line(
          this.bodyPosition.x,
          this.bodyPosition.y,
          this.bodyPosition.x + dir.x * 30,
          this.bodyPosition.y + dir.y * 30
        );
      }
    }

    this.renderer.pop();
  }

  drawChains() {
    this.chains.forEach((chain, i) => {
      const config = this.chainConfigs[i];
      if (chain.bones.length < 2) return;

      // 1. Generate the outline from the bone chain using anatomical width profile
      const widthProfile = this.shapeProfileSystem.getProfileForChain(
        this.creatureType,
        config
      );
      const fikOutline = this.generateOutlineFromChain(chain, widthProfile);

      // Debug: Log width profile info (remove in production)
      /*
      if (this.showDebug && i === 0) {
        console.log(
          `${this.creatureType} ${config.role}: width at 0.5 = ${widthProfile(
            0.5
          ).toFixed(1)}`
        );
      }
      */

      // Convert FIK.V2 outline to p5.Vector outline for rendering and decoration
      const outline = fikOutline.map((p) =>
        this.renderer.createVector(p.x, p.y)
      );

      // 2. Draw the main filled shape using the theme
      const creatureFill = this.themeManager.get("creature_fill")();
      const creatureStroke = this.themeManager.get("creature_stroke");
      const themeStrokeWeight = this.themeManager.get("stroke_weight");

      this.renderer.fill(creatureFill);
      this.renderer.stroke(creatureStroke);
      this.renderer.strokeWeight(themeStrokeWeight);

      this.renderer.beginShape();
      for (const pt of outline) {
        this.renderer.vertex(pt.x, pt.y);
      }
      this.renderer.endShapeClose();

      // 3. Apply Madhubani-style decorations
      this.applyDecorations(outline);
    });
  }

  drawMuscles() {
    // *** PHASE 2: Render deformed muscles if deformation engine is enabled ***
    
    if (this.muscleRenderer && this.muscles && this.deformationParams) {
      try {
        let renderedCount = 0;
        for (const muscle of this.muscles) {
          if (!muscle) continue;

          // Get bone positions from skeleton
          const startBone = this.getBoneById(muscle.startJoint);
          const endBone = this.getBoneById(muscle.endJoint);

          if (!startBone || !endBone) {
            console.warn(`Bones not found for muscle ${muscle.id}:`, {
              startJoint: muscle.startJoint,
              endJoint: muscle.endJoint,
              foundStart: !!startBone,
              foundEnd: !!endBone
            });
          }

          // Get start and end positions
          const startPos = { x: startBone.end.x, y: startBone.end.y };
          const endPos = { x: endBone.end.x, y: endBone.end.y };

          // Get deformation parameters for this muscle
          const deformation = this.deformationParams[muscle.id] || {};

          // Render the deformed muscle shape
          this.muscleRenderer.renderMuscle(
            this.renderer, // Pass the renderer adapter directly
            muscle,
            deformation,
            startPos,
            endPos,
            this.getBoneById.bind(this) // Pass getBoneById for live bone positions
          );
          renderedCount++;
        }
      } catch (error) {
        console.error("Muscle deformation rendering error:", error);
      }
    } else {
      console.warn('drawMuscles: Missing required components', {
        hasRenderer: !!this.muscleRenderer,
        hasMuscles: !!this.muscles,
        hasDeformParams: !!this.deformationParams
      });
    }
  }

  generateOutlineFromChain(chain, widthProfile) {
    const points = chain.bones
      .map((b) => b.start)
      .concat([chain.bones[chain.bones.length - 1].end]);
    const outline = [];
    const left = [],
      right = [];

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
      const normal = new this.ik.V2(-dir.y, dir.x);

      left.push(points[i].plus(normal.multiplyScalar(w)));
      right.push(points[i].plus(normal.multiplyScalar(-w)));
    }

    return left.concat(right.reverse());
  }

  applyDecorations(path) {
    // --- 1. Apply Border to the main outline ---
    const borderStroke = this.themeManager.get("border.stroke");
    this.borderDecorator.path = path;
    this.borderDecorator.style = this.themeManager.get("border.style");
    this.borderDecorator.draw(borderStroke);

    // --- 2. Segment the path and apply different fillers ---
    this.segmenter.path = path;
    const segments = this.segmenter.segment(3);

    const patterns = this.themeManager.get("filler.patterns");
    const fillerStroke = this.themeManager.get("filler.stroke");

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

  // *** REMOVED: Old debug system replaced by unified DebugManager ***
  // drawDebugInfo() method removed - now handled by this.debugManager.draw()

  // *** INPUT HANDLING FOR DEBUG SYSTEM ***
  handleKeyPress(key) {
    // Let debug manager handle its keys first
    if (this.debugManager.handleKeyPress(key)) {
      return true; // Debug manager handled it
    }

    // Handle other creature builder keys
    switch (key.toLowerCase()) {
      case "h":
        // Toggle legacy help overlay panel
        this.showHelpOverlay = !this.showHelpOverlay;
        console.log(`Help overlay: ${this.showHelpOverlay ? "ON" : "OFF"}`);
        return true;
    }
    return false;
  }

  handleMouseClick(mouseX, mouseY) {
    // Let debug manager handle mouse clicks first
    if (this.debugManager.handleMouseClick(mouseX, mouseY)) {
      return true; // Debug manager handled it
    }

    // Handle other creature builder mouse events
    return false;
  }

  drawControls() {
    this.renderer.push();
    this.renderer.fill(0, 180);
    this.renderer.noStroke();
    this.renderer.rect(
      10,
      10,
      250,
      this.creatureType === "quadruped" ? 220 : 150,
      5
    );

    this.renderer.fill(255);
    this.renderer.textAlign(LEFT, TOP);
    this.renderer.textSize(12);

    let y = 20;
    this.renderer.text("CREATURE TYPES", 20, y);
    y += 20;
    this.renderer.text("1: Fish (swimming)", 30, y);
    y += 15;
    this.renderer.text("2: Crane (bipedal walking)", 30, y);
    y += 15;
    this.renderer.text("3: Horse (erect quadruped)", 30, y);
    y += 15;
    this.renderer.text("4: Lizard (sprawling quadruped)", 30, y);
    y += 25;

    // Gait controls (for horse and lizard)
    if (
      (this.creatureType === "horse" || this.creatureType === "lizard") &&
      this.activeLocomotion
    ) {
      this.renderer.text("GAIT CONTROLS", 20, y);
      y += 20;
      this.renderer.text("W: Walk", 30, y);
      y += 15;
      this.renderer.text("T: Trot", 30, y);
      y += 15;
      this.renderer.text("G: Gallop", 30, y);
      y += 15;
      this.renderer.text("P: Pace", 30, y);
      y += 20;

      this.renderer.text("D: Toggle debug info", 30, y);
      y += 15;
      this.renderer.text("S: Toggle skeleton", 30, y);
      y += 15;
      this.renderer.text(
        "A: Toggle adaptive ground (FREE vs CONSTRAINED)",
        30,
        y
      );
      y += 15;

      // Gait analysis info
      const analysis = this.activeLocomotion.getGaitAnalysis
        ? this.activeLocomotion.getGaitAnalysis()
        : null;
      if (analysis) {
        y += 5;
        this.renderer.text("GAIT ANALYSIS", 20, y);
        y += 20;
        this.renderer.text(`Type: ${analysis.gaitType}`, 30, y);
        y += 15;
        this.renderer.text(
          `Duty Factor: ${analysis.dutyFactor.toFixed(2)}`,
          30,
          y
        );
        y += 15;
        this.renderer.text(
          `Frequency: ${analysis.frequency.toFixed(2)} Hz`,
          30,
          y
        );
        y += 15;
        this.renderer.text(`Grounded: ${analysis.groundedFeet}/4`, 30, y);
        y += 15;
        this.renderer.text(
          `Stability: ${(analysis.stabilityMargin * 100).toFixed(1)}%`,
          30,
          y
        );
      }
    } else {
      this.renderer.text("D: Toggle debug info", 20, y);
      y += 15;
      this.renderer.text("--- Render Modes ---", 20, y);
      y += 15;
      this.renderer.text("S: Skeleton  M: Muscle  F: Skin  C: Current", 20, y);
      y += 15;
      this.renderer.text("Space: Switch modes", 20, y);
      y += 15;
      this.renderer.text("--- Creatures ---", 20, y);
      y += 15;
      this.renderer.text("1: Fish  2: Crane  3: Horse  4: Snake", 20, y);
      y += 15;
      this.renderer.text("Mouse: Head target", 20, y);
    }

    this.renderer.pop();
  }

  drawSkeleton() {
    this.renderer.push();

    this.chains.forEach((chain, i) => {
      const config = this.chainConfigs[i];
      const colorArray = this.getChainColorArray(config.role);

      // Draw bones as lines
      this.renderer.stroke(colorArray[0], colorArray[1], colorArray[2]);
      this.renderer.strokeWeight(2);

      chain.bones.forEach((bone, boneIndex) => {
        // Draw bone line
        this.renderer.line(bone.start.x, bone.start.y, bone.end.x, bone.end.y);

        // Draw joint circles
        this.renderer.fill(colorArray[0], colorArray[1], colorArray[2]);
        // noStroke();
        this.renderer.circle(bone.start.x, bone.start.y, 6);

        // Draw end joint for last bone
        if (boneIndex === chain.bones.length - 1) {
          this.renderer.circle(bone.end.x, bone.end.y, 6);
        }
      });

      // Draw chain label
      if (chain.bones.length > 0) {
        const firstBone = chain.bones[0];
        this.renderer.fill(colorArray[0], colorArray[1], colorArray[2]);
        // noStroke();
        this.renderer.textAlign(CENTER);
        this.renderer.textSize(10);
        this.renderer.text(
          config.role,
          firstBone.start.x,
          firstBone.start.y - 10
        );
      }
    });

    this.renderer.pop();
  }

  // Placeholder methods for future phases
  drawMuscleMasses() {
    if (!this.muscles || this.muscles.length === 0) {
      return; // No muscles to render
    }

    // Build deformation map from deformation params
    const deformationsMap = new Map();
    for (const muscleId in this.deformationParams) {
      deformationsMap.set(muscleId, this.deformationParams[muscleId]);
    }

    let renderedCount = 0;
    let missedCount = 0;

    // Render each muscle with its deformation
    for (const muscle of this.muscles) {
      if (!muscle.id || !muscle.startJoint || !muscle.endJoint) {
        continue;
      }

      // Get start and end bone positions
      const startBone = this.getBoneById(muscle.startJoint);
      const endBone = this.getBoneById(muscle.endJoint);

      if (!startBone || !endBone) {
        if (missedCount === 0) {
          console.warn(`[MUSCLE RENDER] Bone lookup failed for muscle ${muscle.id}. startBone=${startBone}, endBone=${endBone}`);
        }
        missedCount++;
        continue;
      }

      const startPos = {
        x: startBone.start?.x || startBone.x || 0,
        y: startBone.start?.y || startBone.y || 0,
      };
      const endPos = {
        x: endBone.start?.x || endBone.x || 0,
        y: endBone.start?.y || endBone.y || 0,
      };

      // Get deformation for this muscle (or use rest state)
      const deformation = deformationsMap.get(muscle.id) || {
        width: 1.0,
        bulgeFactor: 0,
        thinFactor: 0,
        spiralOffset: 0,
      };

      // Render the muscle
      if (this.muscleRenderer) {
        this.muscleRenderer.renderMuscle(
          this.renderer,
          muscle,
          deformation,
          startPos,
          endPos
        );
        renderedCount++;
      }
    }

    if (renderedCount > 0) {
      console.log(`[MUSCLE RENDER] Rendered ${renderedCount}/${this.muscles.length} muscles, missed ${missedCount}`);
    }
  }

  drawSkinLayer() {
    this.renderer.push();
    this.renderer.fill(100, 255, 100, 50);
    this.renderer.stroke(100, 255, 100);
    this.renderer.strokeWeight(1);
    this.renderer.textAlign(CENTER);
    this.renderer.textSize(20);
    this.renderer.fill(100, 255, 100);
    this.renderer.text(
      "SKIN LAYER - Coming in Phase 3",
      this.renderer.width / 2,
      this.renderer.height / 2
    );
    this.renderer.pop();
  }

  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  // Helper functions
  getChainByRole(role) {
    const index = this.chainConfigs.findIndex((c) => c.role === role);
    return index >= 0 ? this.chains[index] : null;
  }

  /**
   * Get a bone from any chain by unique ID
   * @param {string} boneId - Bone identifier
   * @returns {Object|null} Bone object or null if not found
   */
  getBoneById(boneId) {
    if (!boneId) return null;
    
    for (let chainIdx = 0; chainIdx < this.chains.length; chainIdx++) {
      const chain = this.chains[chainIdx];
      
      if (!chain.bones) continue;
      
      for (let boneIdx = 0; boneIdx < chain.bones.length; boneIdx++) {
        const bone = chain.bones[boneIdx];
        
        if (bone.id === boneId) {
          return bone;
        }
      }
    }
    
    return null;
  }

  /**
   * Generate muscles for the entire creature using scalable strategies
   * Iterates through all chains and applies region-based muscle rules
   */
  generateFullMuscles() {
    const muscles = [];
    const muscleIdCounter = { count: 0 };

    // Helper: Add deformation rules to a muscle based on its type
    const addDeformationRules = (muscle) => {
      // Check if MUSCLE_SHAPE_TYPES is available globally
      if (typeof MUSCLE_SHAPE_TYPES !== 'undefined' && MUSCLE_SHAPE_TYPES[muscle.type]) {
        const shapeType = MUSCLE_SHAPE_TYPES[muscle.type];
        muscle.deformationRules = shapeType.deformationRules;
        muscle.twistSensitivity = shapeType.twistSensitivity || 1.0;
        
        // Calculate rest angle (angle between start and end joints)
        const startBone = this.getBoneById(muscle.startJoint);
        const endBone = this.getBoneById(muscle.endJoint);
        if (startBone && endBone) {
          const startPos = startBone.start || startBone;
          const endPos = endBone.start || endBone;
          muscle.restAngle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x) * 180 / Math.PI;
        } else {
          muscle.restAngle = 0;
        }
      } else {
        // Fallback: create basic deformation rules
        muscle.deformationRules = {
          rest: { widthMultiplier: 1.0, bulgeFactor: 1.0 },
          stretch: { widthMultiplier: 0.8, bulgeFactor: 0.7 },
          compress: { widthMultiplier: 1.2, bulgeFactor: 1.3 }
        };
        muscle.twistSensitivity = 1.0;
        muscle.restAngle = 0;
      }
      return muscle;
    };

    // Iterate through all chains and generate muscles
    for (let i = 0; i < this.chains.length; i++) {
      const chain = this.chains[i];
      const config = this.chainConfigs[i];
      
      if (!chain.bones || chain.bones.length === 0) continue;

      // Determine strategy based on role
      let strategyConfig = window.MUSCLE_STRATEGIES['default'];
      
      // Direct role match
      if (window.MUSCLE_STRATEGIES[config.role]) {
        strategyConfig = window.MUSCLE_STRATEGIES[config.role];
      } else {
        // Check for partial matches
        for (const key of Object.keys(window.MUSCLE_STRATEGIES)) {
          if (config.role.includes(key)) {
            strategyConfig = window.MUSCLE_STRATEGIES[key];
            break;
          }
        }
      }

      console.log(`[MUSCLE GEN] Chain: ${config.role}, Strategy: ${strategyConfig.type}, Shape: ${strategyConfig.shape}`);

      // Execute strategy
      if (window.MuscleStrategies && window.MuscleStrategies[strategyConfig.type]) {
        const newMuscles = window.MuscleStrategies[strategyConfig.type](chain, strategyConfig, muscleIdCounter);
        
        console.log(`[MUSCLE GEN] Generated ${newMuscles.length} muscles for ${config.role}`);
        
        // Post-process: Add deformation rules and config parameters
        newMuscles.forEach(m => {
          // Assign width from config or default
          m.width = m.width || strategyConfig.baseWidth || (strategyConfig.type === 'mass' ? 15 : 8);
          
          // Pass meaningful parameters from config to muscle
          m.taper = strategyConfig.taper;
          m.bulgeSensitivity = strategyConfig.bulgeSensitivity;
          m.overlapFactor = strategyConfig.overlapFactor;
          m.role = config.role; // IMPORTANT: Pass role for anatomical profiling
          
          // Ensure type is set for deformation lookup
          m.type = m.type || 'extending_limb_muscle';
          
          console.log(`[MUSCLE] ID: ${m.id}, ShapeType: ${m.shapeType}, Width: ${m.width}`);
          
          muscles.push(addDeformationRules(m));
        });
      }
    }

    console.log(`[MUSCLE GEN] Total muscles generated: ${muscles.length}`);
    return muscles;
  }

  rgbToHex(rgb) {
    return (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
  }

  getBonesByRole(role) {
    return this.chains.filter((chain, i) => this.chainConfigs[i].role === role);
  }

  // *** EDITOR INTEGRATION METHODS ***

  pauseForEditor() {
    this.editorSavedState = {
      locomotion: this.activeLocomotion,
      renderMode: this.renderMode,
    };
    this.activeLocomotion = null;
    this.editorActive = true;
  }

  resumeFromEditor() {
    if (this.editorSavedState) {
      this.activeLocomotion = this.editorSavedState.locomotion;
      this.renderMode = this.editorSavedState.renderMode;
      this.editorSavedState = null;
    }
    this.editorActive = false;
  }
}
