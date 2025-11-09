class SprawlingQuadrupedGaitController extends LocomotionPattern {
    constructor(config = {}) {
        super('sprawling-quadruped', config);
        this.stepLength = config.stepLength || 16;     // short steps
        this.stepHeight = config.stepHeight || 8;      // low lift with clarity
        this.dutyFactor = config.dutyFactor || 0.7;    // slightly shorter stance to enable progression
        this.frequency = config.frequency || 0.9;

        this.shoulderHipDistance = config.shoulderHipDistance || 70; // shorter body
        this.legSpacing = config.legSpacing || 45;     // wide stance

        // Lateral sequence walk from top view (LH → LF → RH → RF)
        this.walkPhaseOffsets = [0.25, 0.75, 0.0, 0.5]; // [FL, FR, LH, RH]
        this.footPhases = [0, 0, 0, 0];
        this.footHomes = []; // world positions, recomputed each frame from spine attachments
        this.creatureConfig = config.creatureConfig || null;

        this.turnBlend = 0.03; // softer turning to avoid stance flips
        this.moveSpeed = 2.0;

        // Stance anchoring
        this.prevInStance = [false, false, false, false];
        this.stanceAnchor = [null, null, null, null];

        // Stabilization smoothing
        this.smoothedCentroid = null;
        this.centroidAlpha = 0.18; // smoothing factor

        // Foot state with hysteresis and swing planning
        this.stanceEps = 0.05;
        this.footState = ['stance','stance','stance','stance'];
        this.swingStartPos = [null,null,null,null];
        this.landingTarget = [null,null,null,null];
        this.lastLanding = [null,null,null,null];
    }

    // Compatibility with existing builder API
    initializeFootSteps(bodyPosition, numFeet) {
        this.footHomes = new Array(numFeet || 4).fill(null).map(() => new FIK.V2(bodyPosition.x, bodyPosition.y));
    }

    setCreatureConfig(creatureConfig) {
        this.creatureConfig = creatureConfig;
        if (creatureConfig) {
            this.shoulderHipDistance = creatureConfig.bodyLength ? creatureConfig.bodyLength * 0.4 : this.shoulderHipDistance;
            // for sprawling, spacing is generous but body is low
            if (creatureConfig.legLength) {
                this.legSpacing = Math.max(this.legSpacing, creatureConfig.legLength * 0.9);
            }
        }
    }

    update(creature, deltaTime) {
        const dt = (deltaTime || 1/60);
        // Update internal cycle
        this.cycle = (this.cycle + dt * this.frequency * Math.PI * 2) % (Math.PI * 2);

        // Heading toward mouse
        const toMouse = new FIK.V2(
            creature.mouseTarget.x - creature.bodyPosition.x,
            creature.mouseTarget.y - creature.bodyPosition.y
        );
        const targetAngle = Math.atan2(toMouse.y, toMouse.x);
        const angleDiff = creature.normalizeAngle(targetAngle - (creature.bodyHeading || 0));
        creature.bodyHeading = creature.normalizeAngle((creature.bodyHeading || 0) + this.turnBlend * angleDiff);

        // Support-polygon stabilization: body follows stance centroid with slight forward lead and mouse bias
        const stancePoints = [];
        for (let i = 0; i < 4; i++) {
            const anchor = this.stanceAnchor[i];
            if (anchor) stancePoints.push(anchor);
        }
        if (stancePoints.length > 0) {
            let cx = 0, cy = 0;
            for (const p of stancePoints) { cx += p.x; cy += p.y; }
            cx /= stancePoints.length; cy /= stancePoints.length;
            const rawCentroid = new FIK.V2(cx, cy);
            // Exponential smoothing of centroid to prevent recoil
            if (!this.smoothedCentroid) {
                this.smoothedCentroid = new FIK.V2(rawCentroid.x, rawCentroid.y);
            } else {
                this.smoothedCentroid.x = this.smoothedCentroid.x * (1 - this.centroidAlpha) + rawCentroid.x * this.centroidAlpha;
                this.smoothedCentroid.y = this.smoothedCentroid.y * (1 - this.centroidAlpha) + rawCentroid.y * this.centroidAlpha;
            }
            const centroid = this.smoothedCentroid;
            const fwd = new FIK.V2(Math.cos(creature.bodyHeading||0), Math.sin(creature.bodyHeading||0));
            const lead = 25;
            const leadPoint = new FIK.V2(centroid.x + fwd.x * lead, centroid.y + fwd.y * lead);
            const bias = toMouse.length() > 1e-3 ? toMouse.normalised().multiplyScalar(60) : new FIK.V2(0, 0);
            const targetPos = new FIK.V2(leadPoint.x + bias.x * 0.25, leadPoint.y + bias.y * 0.25);
            const toTarget = new FIK.V2(targetPos.x - creature.bodyPosition.x, targetPos.y - creature.bodyPosition.y);
            const maxStep = this.moveSpeed * (dt * 60);
            const step = Math.min(toTarget.length(), maxStep);
            const dir = toTarget.length() > 1e-3 ? toTarget.normalised() : new FIK.V2(0, 0);
            creature.bodyPosition.x += dir.x * step;
            creature.bodyPosition.y += dir.y * step;
        } else {
            // Fallback: gentle move toward mouse when no stance anchors yet
            const dist = toMouse.length();
            if (dist > 20) {
                const dir = toMouse.normalised();
                const speed = this.moveSpeed * (dt * 60);
                creature.bodyPosition.x += dir.x * speed;
                creature.bodyPosition.y += dir.y * speed;
            }
        }

        // Update foot phases
        for (let i = 0; i < 4; i++) {
            const phaseBase = (this.cycle / (Math.PI * 2)); // 0..1
            this.footPhases[i] = (phaseBase + this.walkPhaseOffsets[i]) % 1.0;
        }

        // Compute homes from spine attachments (not body frame), low body height
        this.computeFootHomes(creature);
    }

    computeFootHomes(creature) {
        this.footHomes = [];
        const spine = creature.getChainByRole ? creature.getChainByRole('spine') : null;
        const len = spine && spine.bones ? spine.bones.length : 0;

        // Choose attachment indices along spine (front near head, back near tail)
        const frontIndex = len > 0 ? Math.max(0, Math.min(len - 1, Math.floor((len - 1) * 0.75))) : null;
        const backIndex = len > 0 ? Math.max(0, Math.min(len - 1, Math.floor((len - 1) * 0.25))) : null;

        // Frame vectors
        const forward = new FIK.V2(Math.cos(creature.bodyHeading), Math.sin(creature.bodyHeading));
        const right = new FIK.V2(-Math.sin(creature.bodyHeading), Math.cos(creature.bodyHeading));

        const lateral = this.legSpacing; // distance from centerline
        const bodyLow = 60; // keep body low to ground visually

        // Base points from spine bones or bodyPosition fallback
        const baseFront = (spine && frontIndex !== null) ? spine.bones[frontIndex].start : creature.bodyPosition;
        const baseBack = (spine && backIndex !== null) ? spine.bones[backIndex].start : creature.bodyPosition;

        // FL, FR, LH, RH
        this.footHomes[0] = new FIK.V2(baseFront.x + right.x * (-lateral), baseFront.y + right.y * (-lateral) + bodyLow);
        this.footHomes[1] = new FIK.V2(baseFront.x + right.x * ( lateral), baseFront.y + right.y * ( lateral) + bodyLow);
        this.footHomes[2] = new FIK.V2(baseBack.x  + right.x * (-lateral), baseBack.y  + right.y * (-lateral) + bodyLow);
        this.footHomes[3] = new FIK.V2(baseBack.x  + right.x * ( lateral), baseBack.y  + right.y * ( lateral) + bodyLow);
    }

    getFootTarget(index) {
        const home = this.footHomes[index];
        if (!home) return null;

        // Walking cycle with long stance, low swing
        const phase = this.footPhases[index]; // 0..1
        // Hysteresis around stance threshold to avoid toggling
        const stanceThresh = this.dutyFactor;
        const inStance = (this.footState[index] !== 'swing')
            ? (phase < stanceThresh + this.stanceEps)
            : (phase < stanceThresh - this.stanceEps);
        this.footState[index] = inStance ? 'stance' : 'swing';

        // Detect stance transitions and manage anchors
        if (inStance && !this.prevInStance[index]) {
            // Entering stance: pin current position (last swing landing), not recomputed home
            const lastLanding = this.lastLanding && this.lastLanding[index];
            const anchor = lastLanding ? lastLanding : (this.landingTarget[index] || home);
            this.stanceAnchor[index] = new FIK.V2(anchor.x, anchor.y);
        } else if (!inStance && this.prevInStance[index]) {
            // Leaving stance: start swing
            this.stanceAnchor[index] = null;
            this.swingStartPos[index] = new FIK.V2(home.x, home.y);
        }
        this.prevInStance[index] = inStance;

        if (inStance && this.stanceAnchor[index]) {
            // Keep stance foot pinned in world
            return this.stanceAnchor[index];
        }

        // Swing: low arc, horizontal sweep from swingStartPos to landingTarget
        const swingT = (phase - this.dutyFactor) / Math.max(1e-4, (1 - this.dutyFactor)); // 0..1
        const sweep = (swingT - 0.5) * 2; // -1..1
        const isFront = (index === 0 || index === 1);
        const foreAft = (isFront ? 1 : -1) * this.stepLength * 0.9; // more forward progression
        const lift = this.stepHeight; // low lift
        // bias swing in the direction of travel for clearer top-view progression
        const travelDir = new FIK.V2(Math.cos((creature.bodyHeading||0)), Math.sin((creature.bodyHeading||0)));
        const travelBias = 10;
        // Plan landing target once per swing
        if (!this.landingTarget[index]) {
            this.landingTarget[index] = new FIK.V2(
                home.x + (isFront? foreAft : -foreAft) * 0.2 + travelDir.x * travelBias,
                home.y + travelDir.y * travelBias
            );
        }
        const start = this.swingStartPos[index] || home;
        const end = this.landingTarget[index];
        // Parametric swing with low vertical arc
        const px = start.x + (end.x - start.x) * swingT + sweep * 2;
        const py = start.y + (end.y - start.y) * swingT - Math.sin(swingT * Math.PI) * lift;
        const landing = new FIK.V2(px, py);
        // Store intended landing at end of swing
        if (swingT >= 0.99) {
            this.lastLanding[index] = new FIK.V2(end.x, end.y);
            this.landingTarget[index] = null;
        }
        return landing;
    }

    applySpineUndulation(chain, cfg) {
        // Couple lateral undulation to gait cycle: stance feet side is concave
        const len = chain.bones.length;
        for (let i = 0; i < len; i++) {
            const t = i / Math.max(1, len - 1);
            // Spine phase runs 0..1 along body; sync with cycle
            const phase = this.cycle + t * Math.PI * 1.5;
            const wave = Math.sin(phase) * 12 * (1 - t) + Math.sin(phase * 0.5) * 3;
            const bone = chain.bones[i];
            const baseCW = 28, baseCCW = 28;
            bone.setClockwiseConstraintDegs(baseCW + wave);
            bone.setAnticlockwiseConstraintDegs(baseCCW + wave);
        }
    }
} 
