/**
 * FABRIK Coordinator - Whole-body coordination system
 * Implements forward/backward reaching for coordinated human movement
 */
class FABRIKCoordinator {
    constructor(creature) {
        this.creature = creature;
        this.maxIterations = 3;
        this.convergenceThreshold = 0.5;
        this.enabled = true;
        this.debugMode = false;

        // Chain references for efficient access
        this.pelvisChain = null;
        this.spineChain = null;
        this.shoulderChain = null;
        this.leftArmChain = null;
        this.rightArmChain = null;
        this.leftLegChain = null;
        this.rightLegChain = null;

        this.initializeChainReferences();
    }

    initializeChainReferences() {
        // Cache chain references for performance - with safety checks
        if (!this.creature.chains || !Array.isArray(this.creature.chains)) {
            console.warn("FABRIK: creature.chains is not available");
            return;
        }

        // Find chains by matching chain objects with their configs
        this.pelvisChain = this.creature.chains.find((chain, index) => {
            const config = this.creature.chainConfigs[index];
            return config && config.role === 'pelvis-triangle';
        });
        this.spineChain = this.creature.chains.find((chain, index) => {
            const config = this.creature.chainConfigs[index];
            return config && config.role === 'spine';
        });
        this.shoulderChain = this.creature.chains.find((chain, index) => {
            const config = this.creature.chainConfigs[index];
            return config && config.role === 'shoulder-triangle';
        });
        this.leftArmChain = this.creature.chains.find((chain, index) => {
            const config = this.creature.chainConfigs[index];
            return config && config.role === 'left-arm';
        });
        this.rightArmChain = this.creature.chains.find((chain, index) => {
            const config = this.creature.chainConfigs[index];
            return config && config.role === 'right-arm';
        });
        this.leftLegChain = this.creature.chains.find((chain, index) => {
            const config = this.creature.chainConfigs[index];
            return config && config.role === 'left-leg';
        });
        this.rightLegChain = this.creature.chains.find((chain, index) => {
            const config = this.creature.chainConfigs[index];
            return config && config.role === 'right-leg';
        });

        // Only log chain initialization once per creature creation
        if (!this.loggedInitialization) {
            console.log("🔗 FABRIK chains:", {
                pelvis: !!this.pelvisChain,
                spine: !!this.spineChain,
                shoulder: !!this.shoulderChain,
                leftArm: !!this.leftArmChain,
                rightArm: !!this.rightArmChain,
                leftLeg: !!this.leftLegChain,
                rightLeg: !!this.rightLegChain
            });
            this.loggedInitialization = true;
        }
    }

    solve() {
        if (!this.enabled) return;

        // Re-initialize chain references in case chains were updated
        this.initializeChainReferences();

        // Check if we have the minimum required chains for FABRIK
        if (!this.pelvisChain || !this.spineChain) {
            // Only log warning once
            if (!this.loggedMissingChains) {
                console.warn("⚠️ FABRIK: Missing required chains (pelvis/spine)");
                this.loggedMissingChains = true;
            }
            return;
        }

        // Apply locomotion input first
        this.applyLocomotionInput();

        // Store initial positions for convergence checking
        const initialPositions = this.captureKeyJointPositions();

        // Perform FABRIK iterations
        for (let iter = 0; iter < this.maxIterations; iter++) {
            const previousPositions = this.captureKeyJointPositions();

            // Forward reaching: adjust from limbs inward toward body center
            this.forwardReaching();

            // Backward reaching: adjust from center outward to limbs
            this.backwardReaching();

            // Check convergence
            if (this.hasConverged(previousPositions)) {
                if (this.debugMode) {
                    console.log(`FABRIK converged after ${iter + 1} iterations`);
                }
                break;
            }
        }

        if (this.debugMode) {
            const finalDistance = this.calculateTotalMovement(initialPositions, this.captureKeyJointPositions());
            console.log(`FABRIK total movement: ${finalDistance.toFixed(2)}px`);
        }
    }

    forwardReaching() {
        // 1. Limbs maintain their targets (set by locomotion/head tracking)
        // 2. Pelvis triangle adjusts to maintain connection to limbs
        this.updatePelvisFromLimbs();

        // 3. Spine follows pelvis triangle center
        this.updateSpineFromPelvis();

        // 4. Shoulder triangle follows spine
        this.updateShouldersFromSpine();

        // 5. Arms maintain connection to shoulder triangle
        this.updateArmsFromShoulders();
    }

    backwardReaching() {
        // 1. Keep pelvis triangle at calculated position (from locomotion)
        // 2. Ensure spine maintains proper attachment to pelvis center
        this.enforceSpinePelvisConnection();

        // 3. Ensure shoulder triangle maintains proper attachment to spine
        this.enforceShoulderSpineConnection();

        // 4. Ensure arms maintain proper attachment to shoulder triangle
        this.enforceArmShoulderConnections();

        // 5. Ensure legs maintain proper attachment to pelvis triangle
        this.enforceLegPelvisConnections();
    }

    updatePelvisFromLimbs() {
        if (!this.pelvisChain || !this.leftLegChain || !this.rightLegChain) return;

        // Update leg targets based on locomotion pattern first
        this.updateLegTargets();

        // Get current leg attachment points
        const leftHipPos = this.getChainAttachmentPoint(this.leftLegChain);
        const rightHipPos = this.getChainAttachmentPoint(this.rightLegChain);

        if (leftHipPos && rightHipPos) {
            // Update pelvis triangle to maintain connection to leg hips
            const pelvisBase = this.pelvisChain.bones[1]; // Center of triangle
            if (pelvisBase && pelvisBase.setEndLocation) {
                // Calculate center point between hip attachments
                const centerX = (leftHipPos.x + rightHipPos.x) / 2;
                const centerY = (leftHipPos.y + rightHipPos.y) / 2;

                // Apply slight upward offset for realistic pelvis position
                const targetPos = new FIK.V2(centerX, centerY - 5);

                // Smooth adjustment
                const currentPos = pelvisBase.getEndLocation();
                if (currentPos) {
                    const newPos = new FIK.V2(
                        currentPos.x + (targetPos.x - currentPos.x) * 0.3,
                        currentPos.y + (targetPos.y - currentPos.y) * 0.3
                    );

                    // Update pelvis triangle constraints
                    this.adjustTriangleToCenter(this.pelvisChain, newPos);
                }
            }
        }
    }

    updateLegTargets() {
        // Apply leg targets from locomotion pattern
        if (this.creature.activeLocomotion && this.leftLegChain && this.rightLegChain) {
            // Update left leg target
            if (this.creature.activeLocomotion.getFootTarget) {
                const leftFootTarget = this.creature.activeLocomotion.getFootTarget(0);
                if (leftFootTarget) {
                    this.leftLegChain.solveForTarget(leftFootTarget);
                }
            }

            // Update right leg target
            const rightFootTarget = this.creature.activeLocomotion.getFootTarget(1);
            if (rightFootTarget) {
                this.rightLegChain.solveForTarget(rightFootTarget);
            }
        }
    }

    updateSpineFromPelvis() {
        if (!this.spineChain || !this.pelvisChain) return;

        // Check chain structure safely
        if (!this.pelvisChain.bones || this.pelvisChain.bones.length < 2) {
            return;
        }

        // Spine base should follow pelvis triangle center
        const pelvisBase = this.pelvisChain.bones[1]; // Center of triangle
        if (pelvisBase && pelvisBase.getEndLocation) {
            const pelvisCenterPos = pelvisBase.getEndLocation();
            if (pelvisCenterPos && this.spineChain) {
                this.spineChain.setBaseLocation(pelvisCenterPos);
            }
        }
    }

    updateShouldersFromSpine() {
        if (!this.shoulderChain || !this.spineChain) return;

        // Shoulder triangle should attach to upper spine - with safety checks
        if (!this.spineChain.bones || this.spineChain.bones.length <= 4) {
            return;
        }

        const shoulderBone = this.spineChain.bones[4]; // Upper thoracic
        if (shoulderBone && shoulderBone.getEndLocation) {
            const shoulderPos = shoulderBone.getEndLocation();
            if (shoulderPos && this.shoulderChain) {
                this.shoulderChain.setBaseLocation(shoulderPos);
            }
        }
    }

    updateArmsFromShoulders() {
        // Arms are handled by parent-relative attachment, but we can ensure constraints
        this.maintainArmLengths();
    }

    enforceSpinePelvisConnection() {
        if (!this.spineChain || !this.pelvisChain) return;

        // Safety check for bone structure
        if (!this.pelvisChain.bones || this.pelvisChain.bones.length < 2) {
            return;
        }

        const pelvisBase = this.pelvisChain.bones[1];
        if (pelvisBase && pelvisBase.getEndLocation && this.spineChain) {
            const pelvisPos = pelvisBase.getEndLocation();
            if (pelvisPos) {
                this.spineChain.setBaseLocation(pelvisPos);
            }
        }
    }

    enforceShoulderSpineConnection() {
        if (!this.shoulderChain || !this.spineChain) return;

        if (this.spineChain.chain && this.spineChain.chain.bones.length > 4) {
            const shoulderBone = this.spineChain.chain.bones[4];
            if (shoulderBone && shoulderBone.getEndLocation && this.shoulderChain.chain) {
                const shoulderPos = shoulderBone.getEndLocation();
                if (shoulderPos) {
                    this.shoulderChain.chain.setBaseLocation(shoulderPos);
                }
            }
        }
    }

    enforceArmShoulderConnections() {
        // Ensure arms maintain proper distances from shoulder triangle points - with safety checks
        if (this.leftArmChain && this.shoulderChain) {
            if (!this.shoulderChain.bones || this.shoulderChain.bones.length < 1) {
                return;
            }
            const leftShoulderPoint = this.shoulderChain.bones[0];
            if (leftShoulderPoint && leftShoulderPoint.getEndLocation && this.leftArmChain) {
                const shoulderPos = leftShoulderPoint.getEndLocation();
                if (shoulderPos) {
                    this.leftArmChain.setBaseLocation(shoulderPos);
                }
            }
        }

        if (this.rightArmChain && this.shoulderChain) {
            if (!this.shoulderChain.bones || this.shoulderChain.bones.length < 3) {
                return;
            }
            const rightShoulderPoint = this.shoulderChain.bones[2];
            if (rightShoulderPoint && rightShoulderPoint.getEndLocation && this.rightArmChain) {
                const shoulderPos = rightShoulderPoint.getEndLocation();
                if (shoulderPos) {
                    this.rightArmChain.setBaseLocation(shoulderPos);
                }
            }
        }
    }

    enforceLegPelvisConnections() {
        // Ensure legs maintain proper distances from pelvis triangle points - with safety checks
        if (this.leftLegChain && this.pelvisChain) {
            if (!this.pelvisChain.bones || this.pelvisChain.bones.length < 1) {
                return;
            }
            const leftHipPoint = this.pelvisChain.bones[0];
            if (leftHipPoint && leftHipPoint.getEndLocation && this.leftLegChain) {
                const hipPos = leftHipPoint.getEndLocation();
                if (hipPos) {
                    this.leftLegChain.setBaseLocation(hipPos);
                }
            }
        }

        if (this.rightLegChain && this.pelvisChain) {
            if (!this.pelvisChain.bones || this.pelvisChain.bones.length < 3) {
                return;
            }
            const rightHipPoint = this.pelvisChain.bones[2];
            if (rightHipPoint && rightHipPoint.getEndLocation && this.rightLegChain) {
                const hipPos = rightHipPoint.getEndLocation();
                if (hipPos) {
                    this.rightLegChain.setBaseLocation(hipPos);
                }
            }
        }
    }

    maintainArmLengths() {
        // Simple constraint to ensure arms don't stretch unrealistically - with safety checks
        [this.leftArmChain, this.rightArmChain].forEach(armChain => {
            if (armChain) {
                // This would involve checking bone lengths and adjusting if needed
                // For now, let the IK system handle it
            }
        });
    }

    adjustTriangleToCenter(triangleChain, centerPos) {
        if (!triangleChain || !triangleChain.bones) return;

        // Adjust triangle bones to maintain center position
        const bones = triangleChain.bones;
        if (bones.length >= 3) {
            // Recalculate triangle positions based on new center
            const baseLoc = triangleChain.getBaseLocation();
            if (baseLoc) {
                const offset = new FIK.V2(
                    centerPos.x - baseLoc.x,
                    centerPos.y - baseLoc.y
                );

                // Apply gentle adjustment to triangle base location
                triangleChain.chain.setBaseLocation(new FIK.V2(
                    baseLoc.x + offset.x * 0.5,
                    baseLoc.y + offset.y * 0.5
                ));
            }
        }
    }

    getChainAttachmentPoint(chain) {
        if (!chain || !chain.chain) return null;

        if (chain.chain.bones.length > 0) {
            const firstBone = chain.chain.bones[0];
            if (firstBone && firstBone.getEndLocation) {
                return firstBone.getEndLocation();
            }
        }
        return null;
    }

    captureKeyJointPositions() {
        const positions = {};

        if (this.pelvisChain && this.pelvisChain.bones && this.pelvisChain.bones.length > 1) {
            const pelvisBase = this.pelvisChain.bones[1];
            if (pelvisBase.getEndLocation) {
                positions.pelvis = pelvisBase.getEndLocation();
            }
        }

        if (this.shoulderChain && this.shoulderChain.bones && this.shoulderChain.bones.length > 1) {
            const shoulderBase = this.shoulderChain.bones[1];
            if (shoulderBase.getEndLocation) {
                positions.shoulder = shoulderBase.getEndLocation();
            }
        }

        return positions;
    }

    applyLocomotionInput() {
        // Update body position based on locomotion pattern (this is the key!)
        if (this.creature.activeLocomotion && this.creature.activeLocomotion.update) {
            // The locomotion pattern should update creature.bodyPosition and bodyHeading
            // This should have already been called in the main update loop
        }

        // Position pelvis triangle center at updated body location
        if (this.pelvisChain) {
            this.pelvisChain.setBaseLocation(this.creature.bodyPosition);
            this.pelvisChain.baseboneConstraintUV = new FIK.V2(
                Math.cos(this.creature.bodyHeading),
                Math.sin(this.creature.bodyHeading)
            );
        }

        // Apply human walking characteristics (pelvic rotation)
        if (this.creature.activeLocomotion && this.creature.activeLocomotion.applyPelvicRotation) {
            this.creature.activeLocomotion.applyPelvicRotation(this.creature);
        }
    }

    hasConverged(previousPositions) {
        const currentPositions = this.captureKeyJointPositions();
        let totalMovement = 0;

        ['pelvis', 'shoulder'].forEach(key => {
            if (previousPositions[key] && currentPositions[key]) {
                const dx = currentPositions[key].x - previousPositions[key].x;
                const dy = currentPositions[key].y - previousPositions[key].y;
                totalMovement += Math.sqrt(dx * dx + dy * dy);
            }
        });

        return totalMovement < this.convergenceThreshold;
    }

    calculateTotalMovement(initialPositions, finalPositions) {
        let totalMovement = 0;

        ['pelvis', 'shoulder'].forEach(key => {
            if (initialPositions[key] && finalPositions[key]) {
                const dx = finalPositions[key].x - initialPositions[key].x;
                const dy = finalPositions[key].y - initialPositions[key].y;
                totalMovement += Math.sqrt(dx * dx + dy * dy);
            }
        });

        return totalMovement;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
}