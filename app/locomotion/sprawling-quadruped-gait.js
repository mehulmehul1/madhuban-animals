class SprawlingQuadrupedGaitController extends LocomotionPattern {
    constructor(config = {}) {
        super('sprawling-quadruped', config);
        this.stepLength = config.stepLength || 16;
        this.stepHeight = config.stepHeight || 8;
        this.dutyFactor = config.dutyFactor || 0.75; // Stable stance
        this.frequency = config.frequency || 1.0;

        this.shoulderHipDistance = config.shoulderHipDistance || 70;
        this.legSpacing = config.legSpacing || 45;

        // Lateral sequence walk (LH -> LF -> RH -> RF)
        // Standard tetrapod gait
        this.walkPhaseOffsets = [0.25, 0.75, 0.0, 0.5]; // [FL, FR, LH, RH]
        this.footPhases = [0, 0, 0, 0];
        this.footHomes = [];
        this.creatureConfig = config.creatureConfig || null;

        this.turnBlend = 0.05;
        this.moveSpeed = 2.5;

        this.prevInStance = [false, false, false, false];
        this.stanceAnchor = [null, null, null, null];

        this.stanceEps = 0.05;
        this.footState = ['stance','stance','stance','stance'];
        this.swingStartPos = [null,null,null,null];
        this.landingTarget = [null,null,null,null];
        this.lastLanding = [null,null,null,null];
        
        this.currentBodyHeading = 0;
    }

    initializeFootSteps(bodyPosition, numFeet) {
        this.footHomes = new Array(numFeet || 4).fill(null).map(() => new FIK.V2(bodyPosition.x, bodyPosition.y));
    }

    setCreatureConfig(creatureConfig) {
        this.creatureConfig = creatureConfig;
        if (creatureConfig) {
            this.shoulderHipDistance = creatureConfig.bodyLength ? creatureConfig.bodyLength * 0.4 : this.shoulderHipDistance;
            if (creatureConfig.legLength) {
                this.legSpacing = Math.max(this.legSpacing, creatureConfig.legLength * 0.9);
            }
        }
    }

    update(creature, deltaTime) {
        const dt = (deltaTime || 1/60);
        
        // 1. Update Gait Cycle
        this.cycle = (this.cycle + dt * this.frequency * Math.PI * 2) % (Math.PI * 2);

        // 2. Steering & Movement (Non-Holonomic)
        const toMouse = new FIK.V2(
            creature.mouseTarget.x - creature.bodyPosition.x,
            creature.mouseTarget.y - creature.bodyPosition.y
        );
        
        // Calculate steering error
        const targetAngle = Math.atan2(toMouse.y, toMouse.x);
        const angleDiff = creature.normalizeAngle(targetAngle - (creature.bodyHeading || 0));
        
        // Turn towards target
        // Increase turn rate if we are moving slow (turning in place)
        const turnRate = this.turnBlend * (1.0 + Math.abs(angleDiff) * 0.5);
        creature.bodyHeading = creature.normalizeAngle((creature.bodyHeading || 0) + turnRate * angleDiff);
        
        // Cache current heading for spine/legs
        this.currentBodyHeading = creature.bodyHeading;
        
        // Calculate forward movement
        const dist = toMouse.length();
        if (dist > 20) {
            // Throttle speed based on turning angle (slow down to turn)
            // If angleDiff is 90 deg (PI/2), speed is reduced significantly
            const turnThrottle = Math.max(0.2, 1.0 - Math.abs(angleDiff) / (Math.PI / 2));
            
            // Move in direction of BODY HEADING (not mouse direction)
            // This prevents "sliding" and ensures lizard walks where it faces
            const fwd = new FIK.V2(Math.cos(creature.bodyHeading), Math.sin(creature.bodyHeading));
            
            const maxStep = this.moveSpeed * turnThrottle * (dt * 60);
            const step = Math.min(dist, maxStep);
            
            creature.bodyPosition.x += fwd.x * step;
            creature.bodyPosition.y += fwd.y * step;
        }

        // 3. Apply Spine Undulation + Turn Bending
        const spine = creature.getChainByRole ? creature.getChainByRole('spine') : null;
        if (spine) {
            // Pass angleDiff to bend spine into turn
            this.applySpineUndulation(spine, angleDiff);
        }

        // 4. Compute Foot Homes based on NEW spine position
        this.computeFootHomes(creature);

        // 5. Update Foot Phases & Move Feet
        for (let i = 0; i < 4; i++) {
            const phaseBase = (this.cycle / (Math.PI * 2)); // 0..1
            this.footPhases[i] = (phaseBase + this.walkPhaseOffsets[i]) % 1.0;
        }
    }

    applySpineUndulation(spine, turnBiasAngle = 0) {
        const len = spine.bones.length;
        // Wave parameters
        const waveAmp = 15; // Degrees of bend
        const waveFreq = 1.5; // Waves along body length
        
        // Turn bending: Bend spine into the turn
        // If turning Left (+angleDiff), spine should curve Left (concave left)
        const turnBend = turnBiasAngle * (180 / Math.PI) * 0.5; // Convert radians to degrees, scale down
        
        for (let i = 0; i < len; i++) {
            const t = i / Math.max(1, len - 1); // 0..1 along spine
            
            // Traveling wave
            const phase = this.cycle - (t * Math.PI * 2 * waveFreq);
            const undulation = Math.sin(phase) * waveAmp;
            
            // Bias for turning (gradual along spine?)
            // Simple uniform bias works well for "leaning"
            const bias = undulation + turnBend; 
            
            const baseLimit = 25; 
            
            // Apply constraint modulation
            // Shift the "neutral" point by adjusting limits asymmetrically.
            spine.bones[i].setClockwiseConstraintDegs(baseLimit - bias);
            spine.bones[i].setAnticlockwiseConstraintDegs(baseLimit + bias);
        }
    }

    computeFootHomes(creature) {
        this.footHomes = [];
        const spine = creature.getChainByRole ? creature.getChainByRole('spine') : null;

        if (!spine || !spine.bones || spine.bones.length === 0) {
            // Fallback if no spine (shouldn't happen for lizard)
            return;
        }

        const len = spine.bones.length;

        // Match builder indices: Front=11, Back=4
        const frontIndex = Math.min(len - 1, 11); 
        const backIndex = Math.min(len - 1, 4);

        const frontBone = spine.bones[frontIndex];
        const backBone = spine.bones[backIndex];

        // Helper to get global angle of a bone
        const getBoneAngle = (bone) => {
            const dx = bone.end.x - bone.start.x;
            const dy = bone.end.y - bone.start.y;
            return Math.atan2(dy, dx);
        };

        const frontAngle = getBoneAngle(frontBone);
        const backAngle = getBoneAngle(backBone);

        // Sprawl angle from config (default 45)
        const sprawlDeg = this.creatureConfig && this.creatureConfig.sprawlAngle ? this.creatureConfig.sprawlAngle : 45;
        const legLen = this.creatureConfig && this.creatureConfig.legLength ? this.creatureConfig.legLength : 50;
        
        const sprawlRad = sprawlDeg * (Math.PI / 180);

        const calcLegPos = (bone, angle, isLeft) => {
            const base = bone.start; // Shoulder/Hip position
            
            // Angle relative to bone direction
            // Left is negative rotation, Right is positive
            const theta = angle + (isLeft ? -sprawlRad : sprawlRad);
            
            return new FIK.V2(
                base.x + Math.cos(theta) * legLen,
                base.y + Math.sin(theta) * legLen
            );
        };

        // FL (Left Front)
        this.footHomes[0] = calcLegPos(frontBone, frontAngle, true);
        // FR (Right Front)
        this.footHomes[1] = calcLegPos(frontBone, frontAngle, false);
        // LH (Left Hind)
        this.footHomes[2] = calcLegPos(backBone, backAngle, true);
        // RH (Right Hind)
        this.footHomes[3] = calcLegPos(backBone, backAngle, false);
    }

    getFootTarget(index) {
        const home = this.footHomes[index];
        if (!home) return null;

        const phase = this.footPhases[index]; // 0..1
        const stanceThresh = this.dutyFactor;
        
        // Hysteresis for stability
        const inStance = (this.footState[index] !== 'swing')
            ? (phase < stanceThresh + this.stanceEps)
            : (phase < stanceThresh - this.stanceEps);
        this.footState[index] = inStance ? 'stance' : 'swing';

        // Stance Entry/Exit Logic
        if (inStance && !this.prevInStance[index]) {
            // Just landed: Anchor is where we landed (or home if first frame)
            const lastLanding = this.lastLanding && this.lastLanding[index];
            const anchor = lastLanding ? lastLanding : home;
            this.stanceAnchor[index] = new FIK.V2(anchor.x, anchor.y);
        } else if (!inStance && this.prevInStance[index]) {
            // Just lifted: Start swing from current anchor
            this.stanceAnchor[index] = null;
            this.swingStartPos[index] = new FIK.V2(home.x, home.y); // Fallback to home if anchor missing
        }
        this.prevInStance[index] = inStance;

        // STANCE: Return anchor
        if (inStance && this.stanceAnchor[index]) {
            return this.stanceAnchor[index];
        }

        // SWING: Move from Start to Home
        const swingT = (phase - this.dutyFactor) / Math.max(1e-4, (1 - this.dutyFactor)); // 0..1
        
        const start = this.swingStartPos[index] || home;
        const end = home; 
        
        // Simple parabolic arc
        const px = start.x + (end.x - start.x) * swingT;
        const py = start.y + (end.y - start.y) * swingT;
        
        const landing = new FIK.V2(px, py);
        
        if (swingT >= 0.99) {
            this.lastLanding[index] = new FIK.V2(end.x, end.y);
        }
        
        return landing;
    }
}