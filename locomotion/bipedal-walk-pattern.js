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
