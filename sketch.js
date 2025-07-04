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
        case 'd':
            builder.showDebug = !builder.showDebug;
            break;
        case 's':
            // Toggle skeleton visualization
            builder.showSkeleton = !builder.showSkeleton;
            break;
        // Quadruped gait controls (works for horse and lizard)
        case 'w':
            if ((builder.creatureType === 'horse' || builder.creatureType === 'lizard') && builder.activeLocomotion.transitionToGait) {
                builder.activeLocomotion.transitionToGait('walk');
            }
            break;
        case 't':
            if ((builder.creatureType === 'horse' || builder.creatureType === 'lizard') && builder.activeLocomotion.transitionToGait) {
                builder.activeLocomotion.transitionToGait('trot');
            }
            break;
        case 'g':
            if ((builder.creatureType === 'horse' || builder.creatureType === 'lizard') && builder.activeLocomotion.transitionToGait) {
                builder.activeLocomotion.transitionToGait('gallop');
            }
            break;
        case 'p':
            if ((builder.creatureType === 'horse' || builder.creatureType === 'lizard') && builder.activeLocomotion.transitionToGait) {
                builder.activeLocomotion.transitionToGait('pace');
            }
            break;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}