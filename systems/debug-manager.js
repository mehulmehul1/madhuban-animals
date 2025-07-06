/**
 * Unified Debug Manager - Consolidates all debug information into a single, clean panel
 * Replaces multiple scattered debug systems with one organized interface
 */
class DebugManager {
    constructor() {
        this.enabled = true;
        this.currentTab = 'overview'; // 'overview', 'gait', 'locomotion', 'skeleton', 'performance'
        this.showFootTargets = true;
        this.showSkeletonOverlay = false;
        this.showPerformanceMetrics = false;
        
        // Panel configuration
        this.panelX = 20;
        this.panelY = 20;
        this.panelWidth = 320;
        this.panelHeight = 280;
        this.tabHeight = 30;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 60;
        
        // Colors
        this.colors = {
            background: [0, 0, 0, 200],
            border: [100, 100, 100],
            activeTab: [70, 130, 180],
            inactiveTab: [40, 40, 40],
            text: [255, 255, 255],
            accent: [100, 200, 255],
            warning: [255, 200, 100],
            error: [255, 100, 100],
            success: [100, 255, 100]
        };
    }

    // *** MAIN UPDATE CALL - Called from creature builder ***
    update(builder) {
        if (!this.enabled) return;
        
        this.frameCount++;
        this.updatePerformanceMetrics();
        this.collectDebugData(builder);
    }

    // *** MAIN DRAW CALL - Called from creature builder ***
    draw(builder) {
        if (!this.enabled) return;
        
        push();
        
        // Draw main debug panel
        this.drawDebugPanel(builder);
        
        // Draw overlay elements if enabled
        if (this.showSkeletonOverlay) {
            this.drawSkeletonOverlay(builder);
        }
        
        if (this.showFootTargets && builder.activeLocomotion) {
            this.drawConsolidatedFootTargets(builder);
        }
        
        pop();
    }

    // *** UNIFIED DEBUG PANEL ***
    drawDebugPanel(builder) {
        // Background panel
        fill(...this.colors.background);
        stroke(...this.colors.border);
        strokeWeight(1);
        rect(this.panelX, this.panelY, this.panelWidth, this.panelHeight, 8);
        
        // Tab headers
        this.drawTabHeaders();
        
        // Content area
        const contentY = this.panelY + this.tabHeight + 10;
        const contentHeight = this.panelHeight - this.tabHeight - 20;
        
        // Draw content based on active tab
        switch(this.currentTab) {
            case 'overview':
                this.drawOverviewTab(builder, contentY, contentHeight);
                break;
            case 'gait':
                this.drawGaitTab(builder, contentY, contentHeight);
                break;
            case 'locomotion':
                this.drawLocomotionTab(builder, contentY, contentHeight);
                break;
            case 'skeleton':
                this.drawSkeletonTab(builder, contentY, contentHeight);
                break;
            case 'performance':
                this.drawPerformanceTab(builder, contentY, contentHeight);
                break;
        }
        
        // Instructions footer
        this.drawInstructions();
    }

    // *** TAB HEADERS ***
    drawTabHeaders() {
        const tabs = [
            { id: 'overview', label: 'Overview' },
            { id: 'gait', label: 'Gait' },
            { id: 'locomotion', label: 'Motion' },
            { id: 'skeleton', label: 'Bones' },
            { id: 'performance', label: 'Perf' }
        ];
        
        const tabWidth = this.panelWidth / tabs.length;
        
        tabs.forEach((tab, i) => {
            const x = this.panelX + i * tabWidth;
            const y = this.panelY;
            const isActive = this.currentTab === tab.id;
            
            // Tab background
            fill(isActive ? ...this.colors.activeTab : ...this.colors.inactiveTab);
            stroke(...this.colors.border);
            strokeWeight(1);
            rect(x, y, tabWidth, this.tabHeight);
            
            // Tab text
            fill(...this.colors.text);
            textAlign(CENTER, CENTER);
            textSize(11);
            textStyle(isActive ? BOLD : NORMAL);
            text(tab.label, x + tabWidth/2, y + this.tabHeight/2);
        });
    }

    // *** OVERVIEW TAB ***
    drawOverviewTab(builder, contentY, contentHeight) {
        let y = contentY + 15;
        const lineHeight = 16;
        
        fill(...this.colors.text);
        textAlign(LEFT);
        textSize(12);
        textStyle(BOLD);
        text('🎮 Project Status', this.panelX + 10, y);
        
        y += lineHeight + 5;
        textStyle(NORMAL);
        textSize(10);
        
        // Creature info
        fill(...this.colors.accent);
        text(`Creature: ${builder.creatureType || 'None'}`, this.panelX + 10, y);
        y += lineHeight;
        
        fill(...this.colors.text);
        text(`Render Mode: ${builder.renderMode}`, this.panelX + 10, y);
        y += lineHeight;
        
        text(`Body: (${builder.bodyPosition.x.toFixed(0)}, ${builder.bodyPosition.y.toFixed(0)})`, this.panelX + 10, y);
        y += lineHeight;
        
        text(`Mouse: (${builder.mouseTarget.x.toFixed(0)}, ${builder.mouseTarget.y.toFixed(0)})`, this.panelX + 10, y);
        y += lineHeight + 5;
        
        // Locomotion status
        textStyle(BOLD);
        text('🚶 Locomotion', this.panelX + 10, y);
        y += lineHeight;
        
        textStyle(NORMAL);
        if (builder.activeLocomotion) {
            const locomotion = builder.activeLocomotion;
            
            fill(...this.colors.success);
            text(`Pattern: ${locomotion.name || 'Active'}`, this.panelX + 10, y);
            y += lineHeight;
            
            fill(...this.colors.text);
            if (locomotion.gaitType) {
                text(`Gait: ${locomotion.gaitType.toUpperCase()}`, this.panelX + 10, y);
                y += lineHeight;
            }
            
            if (locomotion.getGroundedFeetCount) {
                text(`Grounded Feet: ${locomotion.getGroundedFeetCount()}/4`, this.panelX + 10, y);
                y += lineHeight;
            }
            
            if (locomotion.isInSuspension !== undefined) {
                fill(locomotion.isInSuspension ? this.colors.warning : this.colors.text);
                text(`Status: ${locomotion.isInSuspension ? 'AIRBORNE' : 'GROUNDED'}`, this.panelX + 10, y);
                y += lineHeight;
            }
        } else {
            fill(...this.colors.error);
            text('No active locomotion', this.panelX + 10, y);
        }
        
        // Performance summary
        y += 5;
        fill(...this.colors.text);
        textStyle(BOLD);
        text('⚡ Performance', this.panelX + 10, y);
        y += lineHeight;
        
        textStyle(NORMAL);
        const fpsColor = this.currentFPS > 50 ? this.colors.success : 
                        this.currentFPS > 30 ? this.colors.warning : this.colors.error;
        fill(...fpsColor);
        text(`FPS: ${this.currentFPS.toFixed(0)}`, this.panelX + 10, y);
        
        fill(...this.colors.text);
        text(`Chains: ${builder.chains.length}`, this.panelX + 100, y);
    }

    // *** GAIT ANALYSIS TAB ***
    drawGaitTab(builder, contentY, contentHeight) {
        let y = contentY + 15;
        const lineHeight = 14;
        
        if (!builder.activeLocomotion || !builder.activeLocomotion.gaitType) {
            fill(...this.colors.error);
            textAlign(CENTER);
            textSize(12);
            text('No gait data available', this.panelX + this.panelWidth/2, y + 50);
            return;
        }
        
        const locomotion = builder.activeLocomotion;
        const gaitParams = locomotion.gaitParams;
        
        // Gait header
        fill(...this.colors.text);
        textAlign(LEFT);
        textSize(14);
        textStyle(BOLD);
        
        const gaitColor = locomotion.gaitType === 'trot' ? this.colors.warning : this.colors.success;
        fill(...gaitColor);
        text(`${locomotion.gaitType.toUpperCase()} Gait`, this.panelX + 10, y);
        
        y += lineHeight + 8;
        fill(...this.colors.text);
        textStyle(NORMAL);
        textSize(10);
        
        // Core gait parameters
        text(`Duty Factor: ${(gaitParams.dutyFactor * 100).toFixed(0)}%`, this.panelX + 10, y);
        y += lineHeight;
        
        text(`Frequency: ${gaitParams.frequency.toFixed(1)}Hz`, this.panelX + 10, y);
        y += lineHeight;
        
        text(`Step Height: ${(gaitParams.stepHeight * 100).toFixed(0)}%`, this.panelX + 10, y);
        y += lineHeight;
        
        if (locomotion.groundedFeetCount !== undefined) {
            text(`Grounded: ${locomotion.groundedFeetCount}/4`, this.panelX + 10, y);
            y += lineHeight;
        }
        
        // Suspension status
        if (locomotion.isInSuspension !== undefined) {
            y += 5;
            textStyle(BOLD);
            fill(locomotion.isInSuspension ? this.colors.warning : this.colors.success);
            text(locomotion.isInSuspension ? '🚀 SUSPENSION PHASE' : '⚓ GROUND CONTACT', this.panelX + 10, y);
            y += lineHeight + 5;
        }
        
        // Transition data
        if (locomotion.transitionData) {
            fill(...this.colors.text);
            textStyle(BOLD);
            text('🔄 Transitions', this.panelX + 10, y);
            y += lineHeight;
            
            textStyle(NORMAL);
            const data = locomotion.transitionData;
            
            text(`Froude #: ${data.froudeNumber.toFixed(3)}`, this.panelX + 10, y);
            y += lineHeight;
            
            text(`Velocity: ${data.velocity.toFixed(2)} m/s`, this.panelX + 10, y);
            y += lineHeight;
            
            text(`Distance: ${data.distanceToTarget.toFixed(0)}px`, this.panelX + 10, y);
            y += lineHeight;
            
            const autoColor = data.automaticEnabled ? this.colors.success : this.colors.error;
            fill(...autoColor);
            text(`Auto: ${data.automaticEnabled ? 'ON' : 'OFF'}`, this.panelX + 10, y);
            
            if (data.cooldownRemaining > 0) {
                fill(...this.colors.warning);
                text(`Cooldown: ${data.cooldownRemaining}`, this.panelX + 100, y);
            }
        }
        
        // Gait pattern visualization
        if (locomotion.gaitType === 'trot') {
            y += lineHeight + 10;
            fill(...this.colors.text);
            textStyle(BOLD);
            text('Diagonal Pairs:', this.panelX + 10, y);
            y += lineHeight;
            
            textStyle(NORMAL);
            textSize(9);
            fill(255, 100, 100);
            text('🔴 LF + RH (Pair 1)', this.panelX + 10, y);
            y += lineHeight - 2;
            
            fill(100, 100, 255);
            text('🔵 RF + LH (Pair 2)', this.panelX + 10, y);
        }
    }

    // *** LOCOMOTION TAB ***
    drawLocomotionTab(builder, contentY, contentHeight) {
        let y = contentY + 15;
        const lineHeight = 14;
        
        // Body dynamics
        fill(...this.colors.text);
        textAlign(LEFT);
        textSize(12);
        textStyle(BOLD);
        text('🏃 Body Dynamics', this.panelX + 10, y);
        
        y += lineHeight + 5;
        textStyle(NORMAL);
        textSize(10);
        
        text(`Position: (${builder.bodyPosition.x.toFixed(1)}, ${builder.bodyPosition.y.toFixed(1)})`, this.panelX + 10, y);
        y += lineHeight;
        
        text(`Heading: ${(builder.bodyHeading * 180 / Math.PI).toFixed(1)}°`, this.panelX + 10, y);
        y += lineHeight;
        
        const distToMouse = Math.sqrt(
            Math.pow(builder.mouseTarget.x - builder.bodyPosition.x, 2) +
            Math.pow(builder.mouseTarget.y - builder.bodyPosition.y, 2)
        );
        text(`Mouse Distance: ${distToMouse.toFixed(0)}px`, this.panelX + 10, y);
        y += lineHeight + 8;
        
        // Chain information
        textStyle(BOLD);
        text('🔗 Chain System', this.panelX + 10, y);
        y += lineHeight + 5;
        
        textStyle(NORMAL);
        text(`Total Chains: ${builder.chains.length}`, this.panelX + 10, y);
        y += lineHeight;
        
        // List first few chains
        builder.chains.slice(0, 6).forEach((chain, i) => {
            const config = builder.chainConfigs[i];
            if (config) {
                const roleColor = this.getChainRoleColor(config.role);
                fill(...roleColor);
                text(`${config.role}: ${chain.bones.length} bones`, this.panelX + 10, y);
                y += lineHeight - 2;
            }
        });
        
        if (builder.chains.length > 6) {
            fill(...this.colors.text);
            text(`... and ${builder.chains.length - 6} more`, this.panelX + 10, y);
        }
    }

    // *** SKELETON TAB ***
    drawSkeletonTab(builder, contentY, contentHeight) {
        let y = contentY + 15;
        const lineHeight = 16;
        
        fill(...this.colors.text);
        textAlign(LEFT);
        textSize(12);
        textStyle(BOLD);
        text('🦴 Skeleton System', this.panelX + 10, y);
        
        y += lineHeight + 5;
        textStyle(NORMAL);
        textSize(10);
        
        // Skeleton controls
        const overlayColor = this.showSkeletonOverlay ? this.colors.success : this.colors.error;
        fill(...overlayColor);
        text(`Overlay: ${this.showSkeletonOverlay ? 'ON' : 'OFF'} (Press S)`, this.panelX + 10, y);
        y += lineHeight;
        
        fill(...this.colors.text);
        text(`Render Mode: ${builder.renderMode}`, this.panelX + 10, y);
        y += lineHeight + 5;
        
        // Chain breakdown by role
        textStyle(BOLD);
        text('Chain Roles:', this.panelX + 10, y);
        y += lineHeight;
        
        textStyle(NORMAL);
        const roleCount = {};
        builder.chainConfigs.forEach(config => {
            if (config && config.role) {
                roleCount[config.role] = (roleCount[config.role] || 0) + 1;
            }
        });
        
        Object.entries(roleCount).forEach(([role, count]) => {
            const roleColor = this.getChainRoleColor(role);
            fill(...roleColor);
            text(`${role}: ${count}`, this.panelX + 10, y);
            y += lineHeight;
        });
        
        // Controls help
        y += 10;
        fill(...this.colors.text);
        textStyle(BOLD);
        text('🎮 Controls:', this.panelX + 10, y);
        y += lineHeight;
        
        textStyle(NORMAL);
        textSize(9);
        text('S - Toggle skeleton overlay', this.panelX + 10, y);
        y += lineHeight - 2;
        text('M - Muscle mode', this.panelX + 10, y);
        y += lineHeight - 2;
        text('F - Skin mode', this.panelX + 10, y);
        y += lineHeight - 2;
        text('C - Current mode', this.panelX + 10, y);
    }

    // *** PERFORMANCE TAB ***
    drawPerformanceTab(builder, contentY, contentHeight) {
        let y = contentY + 15;
        const lineHeight = 16;
        
        fill(...this.colors.text);
        textAlign(LEFT);
        textSize(12);
        textStyle(BOLD);
        text('⚡ Performance Metrics', this.panelX + 10, y);
        
        y += lineHeight + 5;
        textStyle(NORMAL);
        textSize(10);
        
        // FPS display
        const fpsColor = this.currentFPS > 50 ? this.colors.success : 
                        this.currentFPS > 30 ? this.colors.warning : this.colors.error;
        fill(...fpsColor);
        textStyle(BOLD);
        text(`FPS: ${this.currentFPS.toFixed(1)}`, this.panelX + 10, y);
        
        textStyle(NORMAL);
        fill(...this.colors.text);
        text(`Frame: ${this.frameCount}`, this.panelX + 100, y);
        y += lineHeight + 5;
        
        // System stats
        text(`Chains: ${builder.chains.length}`, this.panelX + 10, y);
        y += lineHeight;
        
        let totalBones = 0;
        builder.chains.forEach(chain => totalBones += chain.bones.length);
        text(`Total Bones: ${totalBones}`, this.panelX + 10, y);
        y += lineHeight;
        
        if (builder.activeLocomotion && builder.activeLocomotion.footTargets) {
            text(`Foot Targets: ${builder.activeLocomotion.footTargets.length}`, this.panelX + 10, y);
            y += lineHeight;
        }
        
        y += 5;
        const memUsage = performance.memory ? 
            (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) : 'N/A';
        text(`Memory: ${memUsage} MB`, this.panelX + 10, y);
        y += lineHeight;
        
        // Performance status
        y += 10;
        textStyle(BOLD);
        if (this.currentFPS > 50) {
            fill(...this.colors.success);
            text('✅ Performance: Excellent', this.panelX + 10, y);
        } else if (this.currentFPS > 30) {
            fill(...this.colors.warning);
            text('⚠️ Performance: Good', this.panelX + 10, y);
        } else {
            fill(...this.colors.error);
            text('❌ Performance: Poor', this.panelX + 10, y);
        }
    }

    // *** INSTRUCTIONS FOOTER ***
    drawInstructions() {
        const instructY = this.panelY + this.panelHeight + 10;
        
        fill(...this.colors.text);
        textAlign(LEFT);
        textSize(9);
        textStyle(NORMAL);
        text('D: Toggle Debug | Click tabs to switch | 1-4: Creatures | W/T: Gaits | X: Auto-switching', 
             this.panelX, instructY);
    }

    // *** CONSOLIDATED FOOT TARGETS (NO PANEL OVERLAP) ***
    drawConsolidatedFootTargets(builder) {
        if (!builder.activeLocomotion || !builder.activeLocomotion.footTargets) return;
        
        const footTargets = builder.activeLocomotion.footTargets;
        const footNames = ['LF', 'RF', 'LH', 'RH'];
        
        // Use gait-appropriate colors
        let footColors;
        if (builder.activeLocomotion.gaitType === 'trot') {
            footColors = [
                [255, 100, 100], // LF - Red (Diagonal Pair 1)
                [100, 100, 255], // RF - Blue (Diagonal Pair 2)
                [100, 100, 255], // LH - Blue (Diagonal Pair 2)  
                [255, 100, 100]  // RH - Red (Diagonal Pair 1)
            ];
        } else {
            footColors = [
                [100, 255, 100], // LF - Green
                [255, 255, 100], // RF - Yellow
                [100, 100, 255], // LH - Blue
                [255, 100, 255]  // RH - Magenta
            ];
        }
        
        footTargets.forEach((foot, i) => {
            if (!foot || !foot.target) return;
            
            push();
            
            const color = footColors[i] || [200, 200, 200];
            
            if (foot.isLifted) {
                // Swing phase
                fill(...color);
                noStroke();
                circle(foot.target.x, foot.target.y, 8);
                
                // Ground projection
                stroke(...color, 100);
                strokeWeight(1);
                noFill();
                circle(foot.target.x, foot.target.y + 20, 12);
            } else {
                // Stance phase
                fill(...color.map(c => c * 0.7));
                stroke(...color);
                strokeWeight(2);
                circle(foot.target.x, foot.target.y, 10);
            }
            
            // Foot label
            fill(0);
            textAlign(CENTER);
            textSize(8);
            textStyle(BOLD);
            text(footNames[i] || `F${i}`, foot.target.x, foot.target.y - 12);
            
            pop();
        });
    }

    // *** SKELETON OVERLAY ***
    drawSkeletonOverlay(builder) {
        if (!builder.chains || builder.chains.length === 0) return;
        
        push();
        
        builder.chains.forEach((chain, chainIndex) => {
            const config = builder.chainConfigs[chainIndex];
            const role = config ? config.role : 'default';
            const color = this.getChainRoleColor(role);
            
            // Draw bones as lines
            stroke(...color, 180);
            strokeWeight(2);
            
            for (let i = 0; i < chain.bones.length; i++) {
                const bone = chain.bones[i];
                const start = bone.getStartLocation();
                const end = bone.getEndLocation();
                
                line(start.x, start.y, end.x, end.y);
            }
            
            // Draw joints as circles
            fill(...color, 120);
            noStroke();
            
            for (let i = 0; i < chain.bones.length; i++) {
                const bone = chain.bones[i];
                const joint = bone.getStartLocation();
                circle(joint.x, joint.y, 4);
                
                // End joint for last bone
                if (i === chain.bones.length - 1) {
                    const endJoint = bone.getEndLocation();
                    circle(endJoint.x, endJoint.y, 4);
                }
            }
        });
        
        pop();
    }

    // *** HELPER METHODS ***
    updatePerformanceMetrics() {
        if (millis() - this.lastFPSUpdate > 500) { // Update every 500ms
            this.currentFPS = frameRate();
            this.lastFPSUpdate = millis();
        }
    }

    collectDebugData(builder) {
        // Future: collect and process debug data here
    }

    getChainRoleColor(role) {
        const colorMap = {
            'spine': [100, 150, 255],
            'leg': [255, 100, 100],
            'neck': [100, 255, 100],
            'tail': [255, 255, 100],
            'fin': [255, 100, 255],
            'wing': [255, 150, 100],
            'head': [255, 200, 100],
            'default': [150, 150, 150]
        };
        return colorMap[role] || colorMap['default'];
    }

    // *** KEYBOARD CONTROLS ***
    handleKeyPress(key) {
        switch(key.toLowerCase()) {
            case 'd':
                this.enabled = !this.enabled;
                return true;
                
            case 's':
                this.showSkeletonOverlay = !this.showSkeletonOverlay;
                return true;
                
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                // Tab switching
                const tabs = ['overview', 'gait', 'locomotion', 'skeleton', 'performance'];
                const tabIndex = parseInt(key) - 1;
                if (tabIndex < tabs.length) {
                    this.currentTab = tabs[tabIndex];
                    return true;
                }
                break;
        }
        return false;
    }

    // *** MOUSE CONTROLS ***
    handleMouseClick(mouseX, mouseY) {
        if (!this.enabled) return false;
        
        // Check if click is on tab headers
        if (mouseX >= this.panelX && mouseX <= this.panelX + this.panelWidth &&
            mouseY >= this.panelY && mouseY <= this.panelY + this.tabHeight) {
            
            const tabs = ['overview', 'gait', 'locomotion', 'skeleton', 'performance'];
            const tabWidth = this.panelWidth / tabs.length;
            const clickedTab = Math.floor((mouseX - this.panelX) / tabWidth);
            
            if (clickedTab >= 0 && clickedTab < tabs.length) {
                this.currentTab = tabs[clickedTab];
                return true;
            }
        }
        
        return false;
    }
}