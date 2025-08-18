let builder;
let editorSystem;
let editorActive = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    builder = new ModularCreatureBuilder();
    builder.buildHorse(); // Start with the horse
    
    // Initialize editor
    editorSystem = new EditorSystem(builder);
}

function draw() {
    background(240);
    
    if (editorActive) {
        editorSystem.update();
        builder.update(); // Update builder but locomotion paused
        builder.draw();
        editorSystem.draw(); // Draw editor overlay
    } else {
        builder.update();
        builder.draw();
    }
}

function keyPressed() {
    // Check for editor keyboard shortcuts first
    if (editorActive && editorSystem && editorSystem.handleKeyboard) {
        if (editorSystem.handleKeyboard({
            ctrlKey: keyIsDown(CONTROL),
            key: key.toLowerCase(),
            shiftKey: keyIsDown(SHIFT),
            preventDefault: () => {}
        })) {
            return; // Shortcut handled, don't process other keys
        }
    }
    
    // Editor toggle
    if (key === 'E' || key === 'e') {
        console.time('editor-toggle');
        
        editorActive = !editorActive;
        builder.editorActive = editorActive;
        
        if (editorActive) {
            builder.pauseForEditor();
            editorSystem.show();
        } else {
            editorSystem.hide();
            builder.resumeFromEditor();
        }
        
        console.timeEnd('editor-toggle');
        return;
    }
    
    // SKELETON EDITING EXTENSIONS - IK Test Mode toggle
    if ((key === 'I' || key === 'i') && editorActive) {
        if (editorSystem.skeletonEditor) {
            editorSystem.skeletonEditor.toggleIKTestMode();
        }
        return;
    }
    
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
        case '5':
            builder.buildOctopus();
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
            
        // Octopus gait toggle (crawl/swim)
        case 'o':
            if (builder.creatureType === 'octopus' && builder.activeLocomotion.toggleMode) {
                const mode = builder.activeLocomotion.toggleMode();
                console.log(`Octopus mode: ${mode}`);
            }
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

// *** MOUSE HANDLING FOR DEBUG SYSTEM AND EDITOR ***
function mousePressed() {
    // Let editor handle mouse clicks first if active
    if (editorActive && editorSystem && editorSystem.handleMouseClick) {
        if (editorSystem.handleMouseClick(mouseX, mouseY)) {
            return; // Editor handled the click
        }
    }
    
    // Fallback to builder mouse handling
    if (builder && builder.handleMouseClick) {
        builder.handleMouseClick(mouseX, mouseY);
    }
}

// SKELETON EDITING EXTENSIONS - Mouse drag support
function mouseDragged() {
    // Let editor handle mouse dragging first if active
    if (editorActive && editorSystem && editorSystem.handleMouseDrag) {
        if (editorSystem.handleMouseDrag(mouseX, mouseY)) {
            return; // Editor handled the drag
        }
    }
}