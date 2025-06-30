let builder;

function setup() {
    createCanvas(windowWidth, windowHeight);
    builder = new ModularCreatureBuilder();
    builder.buildQuadruped(); // Start with the quadruped
}

function draw() {
    builder.update();
    builder.draw();
}

function keyPressed() {
    switch (key.toLowerCase()) {
        case '1':
            builder.buildFish();
            break;
        case '2':
            builder.buildBipedalCrane();
            break;
        case '3':
            builder.buildQuadruped();
            break;
        case '4':
            builder.buildSnake();
            break;
        case 'd':
            builder.showDebug = !builder.showDebug;
            break;
        // Quadruped gait controls
        case 'w':
            if (builder.creatureType === 'quadruped' && builder.activeLocomotion.transitionToGait) {
                builder.activeLocomotion.transitionToGait('walk');
            }
            break;
        case 't':
            if (builder.creatureType === 'quadruped' && builder.activeLocomotion.transitionToGait) {
                builder.activeLocomotion.transitionToGait('trot');
            }
            break;
        case 'g':
            if (builder.creatureType === 'quadruped' && builder.activeLocomotion.transitionToGait) {
                builder.activeLocomotion.transitionToGait('gallop');
            }
            break;
        case 'p':
            if (builder.creatureType === 'quadruped' && builder.activeLocomotion.transitionToGait) {
                builder.activeLocomotion.transitionToGait('pace');
            }
            break;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}