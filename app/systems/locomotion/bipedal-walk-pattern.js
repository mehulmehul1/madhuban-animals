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

        // 2. State selection: ALWAYS WALK toward target (like quadrupeds now)
        // Simplified: always move toward mouse for responsive control
        this.state = 'walk';
        
        // 3. Update heading gradually while walking
        const walkTurnBlend = 0.07;
        creature.bodyHeading = creature.normalizeAngle(
            creature.bodyHeading + walkTurnBlend * angleDiff
        );

        // 4. Update foot placement - ALWAYS (no state restriction)
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

        // 5. Update body position based on foot average - ALWAYS
        this.updateBodyFromFeet(creature);
    }

    updateBodyFromFeet(creature) {
        let avgX = 0, avgY = 0;
        let groundedFeet = 0;

        // Calculate average of grounded foot positions
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

            // Position pelvis triangle center above average foot position
            const targetBodyX = avgX;
            const targetBodyY = avgY - this.bodyHeight;

            // Smooth movement toward target
            creature.bodyPosition.x += (targetBodyX - creature.bodyPosition.x) * 0.1;
            creature.bodyPosition.y += (targetBodyY - creature.bodyPosition.y) * 0.1;

            // FABRIK-style distance maintenance between feet and pelvis
            this.maintainPelvicTriangleStability(creature, avgX, avgY);
        }
    }

    maintainPelvicTriangleStability(creature, footCenterX, footCenterY) {
        // Ensure pelvis triangle maintains proper distance from foot center
        const pelvisChain = creature.chains && creature.chains.find(c => c.config && c.config.role === 'pelvis-triangle');
        if (pelvisChain && pelvisChain.chain) {
            const desiredPelvisHeight = this.bodyHeight;
            const currentPelvisHeight = Math.abs(creature.bodyPosition.y - footCenterY);

            // Adjust pelvis height if needed to maintain triangle stability
            if (Math.abs(currentPelvisHeight - desiredPelvisHeight) > 2) {
                const heightAdjustment = (desiredPelvisHeight - currentPelvisHeight) * 0.1;
                creature.bodyPosition.y += heightAdjustment;
            }
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

    // Removed per-pattern foot HUD; unified DebugManager renders these

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

// Human-specific walking pattern with plantigrade characteristics
class HumanWalkPattern extends BipedalWalkPattern {
    constructor(config) {
        super('human-walk', config);

        // Human-specific walking parameters (from research paper)
        this.pelvicRotation = config.pelvicRotation || 3;    // degrees
        this.pelvicTilt = config.pelvicTilt || 5;           // degrees
        this.lateralDisplacement = config.lateralDisplacement || 5; // degrees
        this.armSwingAmplitude = config.armSwingAmplitude || 15;  // degrees
        this.doubleSupportRatio = config.doubleSupportRatio || 0.2;

        // Human gait cycle timing
        this.stancePhase = 0.6;              // 60% stance phase
        this.swingPhase = 0.4;               // 40% swing phase
        this.heelStrike = 0.0;               // Start of stance
        this.toeOff = 0.6;                   // End of stance

        console.log("🚶 Human Walk Pattern initialized - pelvic rotation:", this.pelvicRotation + "°", "arm swing:", this.armSwingAmplitude + "°");
    }

    // Override update to include human-specific walking behaviors
    update(creature, deltaTime) {
        super.update(creature, deltaTime);
    }

    updatePattern(creature, deltaTime) {
        // Apply human-specific walking determinants from research paper
        if (this.state === 'walk') {
            this.applyPelvicRotation(creature);
            this.applyArmSwing(creature);
            this.applyLateralDisplacement(creature);
        }
    }

    applyPelvicRotation(creature) {
        // ±3 degrees pelvic rotation about vertical axis during walking
        const rotationAngle = Math.sin(this.cycle * Math.PI * 2) * this.pelvicRotation;

        // Apply rotation to spine chain (main body) for pelvic effect - with safety checks
        if (!creature.chainConfigs || !creature.chains) {
            return;
        }
        const spineChainIndex = creature.chainConfigs.findIndex(config => config.role === 'spine');
        if (spineChainIndex >= 0 && spineChainIndex < creature.chains.length) {
            const spineChain = creature.chains[spineChainIndex];
            if (spineChain && spineChain.bones.length > 1) {
                // Apply subtle constraint changes to lower spine bones for pelvic effect
                const lowerSpineBone = spineChain.bones[0]; // Base of spine
                const baseConstraint = 15;
                const variation = rotationAngle * 0.5; // Scale down for subtle effect

                lowerSpineBone.setClockwiseConstraintDegs(baseConstraint + variation);
                lowerSpineBone.setAnticlockwiseConstraintDegs(baseConstraint - variation);
            }
        }
    }

    applyArmSwing(creature) {
        // Natural arm swing opposite leg movement (human characteristic)
        const swingAngle = Math.sin(this.cycle * Math.PI * 2) * this.armSwingAmplitude;

        // Apply to arm chains - with safety checks
        if (!creature.chainConfigs || !creature.chains) {
            return;
        }
        const leftArmChainIndex = creature.chainConfigs.findIndex(config => config.role === 'left-arm');
        const rightArmChainIndex = creature.chainConfigs.findIndex(config => config.role === 'right-arm');

        // Arms swing opposite to legs (natural human walking)
        if (leftArmChainIndex >= 0 && leftArmChainIndex < creature.chains.length) {
            const leftArmChain = creature.chains[leftArmChainIndex];
            if (leftArmChain && leftArmChain.bones.length > 0) {
                this.swingArm(leftArmChain, -swingAngle);
            }
        }
        if (rightArmChainIndex >= 0 && rightArmChainIndex < creature.chains.length) {
            const rightArmChain = creature.chains[rightArmChainIndex];
            if (rightArmChain && rightArmChain.bones.length > 0) {
                this.swingArm(rightArmChain, swingAngle);
            }
        }
    }

    swingArm(armChain, swingAngle) {
        // Apply natural arm swing to shoulder joint using constraints
        if (armChain.bones.length >= 1) {
            const shoulderBone = armChain.bones[0]; // Clavicle/shoulder bone
            const baseConstraint = 30;
            const variation = swingAngle * 0.3; // Scale down for natural movement

            // Apply asymmetric constraints to create swing direction
            if (variation > 0) {
                shoulderBone.setClockwiseConstraintDegs(baseConstraint + variation);
                shoulderBone.setAnticlockwiseConstraintDegs(baseConstraint - variation * 0.5);
            } else {
                shoulderBone.setClockwiseConstraintDegs(baseConstraint + variation * 0.5);
                shoulderBone.setAnticlockwiseConstraintDegs(baseConstraint - variation);
            }
        }
    }

    applyLateralDisplacement(creature) {
        // Side-to-side hip movement during walking (weight transfer)
        const lateralShift = Math.sin(this.cycle * Math.PI * 2) * this.lateralDisplacement;

        // Apply slight lateral movement to body position
        creature.bodyPosition.x += lateralShift * 0.1;
    }

    // Override foot placement for plantigrade (heel-to-toe) walking
    updateFootPlacement(creature) {
        // Plantigrade-specific foot contact pattern
        this.footSteps.forEach((foot, i) => {
            if (foot.isLifted) {
                // Human foot placement with heel-strike to toe-off pattern
                const stepPhase = (foot.phase % (Math.PI * 2)) / (Math.PI * 2);

                // Heel strike at beginning, toe push-off at end
                if (stepPhase < 0.2) {
                    // Heel strike phase
                    foot.contactPoint = 'heel';
                } else if (stepPhase > 0.8) {
                    // Toe push-off phase
                    foot.contactPoint = 'toe';
                } else {
                    // Full foot contact (mid-stance)
                    foot.contactPoint = 'full';
                }
            }
        });
    }
}
