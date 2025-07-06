let builder;

function setup() {
    createCanvas(windowWidth, windowHeight);
    builder = new ModularCreatureBuilder();
    builder.buildHorse(); // Start with the horse
}

function draw() {
    builder.update();
    builder.draw();
}

function keyPressed() {
    switch (key.toLowerCase()) {
        // Creature switching
        case '1':
            builder.buildFish();
            break;
        case '2':
            builder.buildBipedalCrane();
            break;
        case '3':
            builder.buildHorse();
            break;
        case '4':
            builder.buildLizard();
            break;
        
        // Debug toggle
        case 'd':
            // Let debug manager handle debug toggle
            if (builder.handleKeyPress(key)) {
                break; // Debug manager handled it
            }
            // Fallback to old system
            builder.showDebug = !builder.showDebug;
            break;
            
        // Render mode switching
        case 's':
            builder.setRenderMode('skeleton');
            break;
        case 'm':
            builder.setRenderMode('muscle');
            break;
        case 'f':
            builder.setRenderMode('skin');
            break;
        case 'c':
            builder.setRenderMode('current');
            break;
        case ' ':
            builder.switchRenderMode();
            break;
            
        // Quadruped gait controls (works for horse and lizard)
        case 'w':
            if ((builder.creatureType === 'horse' || builder.creatureType === 'lizard') && builder.activeLocomotion.transitionToGait) {
                builder.activeLocomotion.transitionToGait('walk', true); // true = manual
            }
            break;
        case 't':
            if ((builder.creatureType === 'horse' || builder.creatureType === 'lizard') && builder.activeLocomotion.transitionToGait) {
                builder.activeLocomotion.transitionToGait('trot', true); // true = manual
            }
            break;
        case 'g':
            if ((builder.creatureType === 'horse' || builder.creatureType === 'lizard') && builder.activeLocomotion.transitionToGait) {
                builder.activeLocomotion.transitionToGait('gallop', true); // true = manual
            }
            break;
        case 'p':
            if ((builder.creatureType === 'horse' || builder.creatureType === 'lizard') && builder.activeLocomotion.transitionToGait) {
                builder.activeLocomotion.transitionToGait('pace', true); // true = manual
            }
            break;
            
        // Toggle automatic gait switching for quadrupeds
        case 'x':
            if ((builder.creatureType === 'horse' || builder.creatureType === 'lizard') && builder.activeLocomotion.toggleAutomaticGaitSwitching) {
                const isEnabled = builder.activeLocomotion.toggleAutomaticGaitSwitching();
                console.log(`🔄 Automatic Gait Switching: ${isEnabled ? 'ON (moves fast = trot)' : 'OFF (manual only)'}`);
            }
            break;
            
        // Toggle adaptive ground mode for quadrupeds
        case 'a':
            if ((builder.creatureType === 'horse' || builder.creatureType === 'lizard') && builder.activeLocomotion.adaptiveGround !== undefined) {
                builder.activeLocomotion.adaptiveGround = !builder.activeLocomotion.adaptiveGround;
                console.log(`Adaptive Ground: ${builder.activeLocomotion.adaptiveGround ? 'ON (FREE Hybrid Movement)' : 'OFF (CONSTRAINED Traditional)'}`);
            }
            break;
            
        // Toggle simple mode for quadrupeds (🔧 DEBUG FEATURE)
        case 'q':
            if ((builder.creatureType === 'horse' || builder.creatureType === 'lizard') && builder.activeLocomotion.debugSimpleMode !== undefined) {
                builder.activeLocomotion.debugSimpleMode = !builder.activeLocomotion.debugSimpleMode;
                console.log(`🔧 Simple Mode: ${builder.activeLocomotion.debugSimpleMode ? 'ON (Crane-like)' : 'OFF (Complex Gait)'}`);
            }
            break;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// *** MOUSE HANDLING FOR DEBUG SYSTEM ***
function mousePressed() {
    if (builder && builder.handleMouseClick) {
        builder.handleMouseClick(mouseX, mouseY);
    }
}