// Quick verification test for horse implementation
// Add this temporarily to sketch.js to test the changes

function testHorseImplementation() {
    console.log("=== TESTING HORSE IMPLEMENTATION ===");
    
    // Test 1: Check horse anatomy data
    const horseData = AnatomicalData.HORSE;
    console.log("✓ Horse leg segments:", horseData.legs.segments); // Should be 5
    console.log("✓ Front leg structure:", horseData.legs.front);
    console.log("✓ Hind leg structure:", horseData.legs.hind);
    
    // Test 2: Check constraints
    console.log("✓ Fetlock constraints:", horseData.constraints.fetlock);
    console.log("✓ Shoulder constraints:", horseData.constraints.shoulder);
    
    // Test 3: Test bone generation
    const boneSystem = new BoneTemplateSystem();
    const frontBones = boneSystem.generateBones('horse-front-leg', 50, { side: 'left' });
    const hindBones = boneSystem.generateBones('horse-hind-leg', 65, { side: 'left' });
    
    console.log("✓ Front leg bones generated:", frontBones.length); // Should be 5
    console.log("✓ Hind leg bones generated:", hindBones.length);   // Should be 5
    
    // Test 4: Check ground contact
    const frontHoof = frontBones[frontBones.length - 1];
    const hindHoof = hindBones[hindBones.length - 1];
    console.log("✓ Front hoof ground contact:", frontHoof.groundContact); // Should be true
    console.log("✓ Hind hoof ground contact:", hindHoof.groundContact);   // Should be true
    
    // Test 5: Test quadruped template system
    try {
        const deerBones = boneSystem.generateBones('quadruped-deer-front-leg', 50, { side: 'left' });
        console.log("✓ Deer template works:", deerBones.length > 0);
    } catch (e) {
        console.log("⚠ Deer template error:", e.message);
    }
    
    console.log("=== HORSE IMPLEMENTATION TEST COMPLETE ===");
}

// Uncomment this line in setup() to run the test:
// testHorseImplementation();
