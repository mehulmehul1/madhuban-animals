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

    getTailSwing() {
        return Math.sin(this.cycle) * 0.1;
    }

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
                    dutyFactor: 0.70,
                    phaseShifts: [0, 180, 90, 270],
                    frequency: 1.0,
                    speed: 20,
                    minGroundedFeet: 2,
                    stepHeight: 0.15,
                    bodyOscillationAmp: 0.03,
                    suspensionPhase: 0
                };
            case 'trot':
                return {
                    dutyFactor: 0.50,
                    phaseShifts: [0, 180, 180, 0],
                    frequency: 2.0,
                    speed: 45,
                    minGroundedFeet: 0,
                    stepHeight: 0.20,
                    bodyOscillationAmp: 0.05,
                    suspensionPhase: 0.1
                };
            case 'pace':
                return {
                    dutyFactor: 0.50,
                    phaseShifts: [0, 180, 0, 180],
                    frequency: 2.2,
                    speed: 50,
                    minGroundedFeet: 0,
                    stepHeight: 0.18,
                    bodyOscillationAmp: 0.06,
                    suspensionPhase: 0.15
                };
            case 'gallop':
                return {
                    dutyFactor: 0.30,
                    phaseShifts: [0, 45, 180, 225],
                    frequency: 3.0,
                    speed: 80,
                    minGroundedFeet: 0,
                    stepHeight: 0.30,
                    bodyOscillationAmp: 0.10,
                    suspensionPhase: 0.4
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
        this.updateFootPositions(creature, deltaTime);
        this.updateBodyDynamics(creature, deltaTime);
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

    updateFootPositions(creature, deltaTime) {
        const forward = new FIK.V2(Math.cos(creature.bodyHeading), Math.sin(creature.bodyHeading));
        const right = new FIK.V2(-Math.sin(creature.bodyHeading), Math.cos(creature.bodyHeading));
        const strideLength = this.stepLength;

        const lerp = (v1, v2, t) => new FIK.V2(v1.x * (1 - t) + v2.x * t, v1.y * (1 - t) + v2.y * t);

        for (let i = 0; i < 4; i++) {
            const foot = this.footTargets[i];
            const phase = this.legPhases[i];

            const lateralOffsetVal = (foot.side === 'left' ? -1 : 1) * 35;
            const longitudinalOffsetVal = (foot.limb === 'front' ? 1 : -1) * 40;

            const lateralOffsetVec = right.clone().multiplyScalar(lateralOffsetVal);
            const longitudinalOffsetVec = forward.clone().multiplyScalar(longitudinalOffsetVal);
            
            const neutralAnchorPoint = creature.bodyPosition.clone().add(lateralOffsetVec).add(longitudinalOffsetVec);

            if (this.legStates[i] === 'stance') {
                const stanceProgress = phase / this.gaitParams.dutyFactor;
                const startPoint = neutralAnchorPoint.clone().add(forward.clone().multiplyScalar(strideLength * 0.5));
                const endPoint = neutralAnchorPoint.clone().add(forward.clone().multiplyScalar(-strideLength * 0.5));
                const stancePosition = lerp(startPoint, endPoint, stanceProgress);
                foot.target.x = stancePosition.x;
                foot.target.y = this.groundLevel;
            } else {
                const swingProgress = (phase - this.gaitParams.dutyFactor) / (1 - this.gaitParams.dutyFactor);
                const bodyVelocityInfluence = forward.clone().multiplyScalar(this.gaitParams.speed * deltaTime * 1.5);
                const landingPoint = neutralAnchorPoint.clone().add(forward.clone().multiplyScalar(strideLength * 0.5)).add(bodyVelocityInfluence);
                const liftOffPoint = neutralAnchorPoint.clone().add(forward.clone().multiplyScalar(-strideLength * 0.5));
                const swingPosition = lerp(liftOffPoint, landingPoint, swingProgress);
                const liftHeight = this.gaitParams.stepHeight * this.legLength * Math.sin(Math.PI * swingProgress);
                foot.target.x = swingPosition.x;
                foot.target.y = this.groundLevel - liftHeight;
            }
        }
    }

    updateBodyDynamics(creature, deltaTime) {
        // 1. Apply primary forward motion
        if (this.state === 'walk') {
            const speed = this.gaitParams.speed;
            const desiredVelocity = new FIK.V2(Math.cos(creature.bodyHeading), Math.sin(creature.bodyHeading));
            desiredVelocity.multiplyScalar(speed * deltaTime);
            creature.bodyPosition.add(desiredVelocity);
        }

        // 2. Apply corrective force for stability
        const groundedFeet = this.footTargets.filter(f => !f.isLifted);
        if (groundedFeet.length > 0) {
            // Average position of grounded feet
            let avgX = groundedFeet.reduce((sum, f) => sum + f.target.x, 0) / groundedFeet.length;
            let avgY = groundedFeet.reduce((sum, f) => sum + f.target.y, 0) / groundedFeet.length;
            
            // Body oscillation based on gait
            this.bodyOscillation = Math.sin(this.cycle * Math.PI * 2) * this.gaitParams.bodyOscillationAmp * this.legLength;
            
            // Body height is leg length above average foot position
            const targetBodyX = avgX;
            const targetBodyY = avgY - this.legLength + this.bodyOscillation;
            
            // Apply a gentle pull towards the stable center, instead of a hard lerp.
            const correctionForce = new FIK.V2(targetBodyX - creature.bodyPosition.x, targetBodyY - creature.bodyPosition.y);
            creature.bodyPosition.add(correctionForce.multiplyScalar(0.1)); // Small correction factor
            
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
    
    getTailSwing() {
        // Return a value that oscillates with the gait cycle
        // Using a slower oscillation than the leg movement for more natural motion
        return Math.sin(this.cycle * 2) * 0.15 * this.gaitParams.stepHeight;
    }
}
