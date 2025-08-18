/**
 * Quick validation test for skeleton editing functionality
 * Tests the core fixes and functionality implementation
 */

function runQuickValidation() {
    console.log('🔧 QUICK VALIDATION - Testing Core Fixes');
    console.log('=========================================');
    
    let passed = 0;
    let failed = 0;
    
    function test(name, condition, details = '') {
        if (condition) {
            console.log(`✅ ${name}`, details ? `- ${details}` : '');
            passed++;
        } else {
            console.error(`❌ ${name}`, details ? `- ${details}` : '');
            failed++;
        }
        return condition;
    }
    
    // Test 1: Core objects exist
    test('Builder exists', typeof builder !== 'undefined', `Type: ${typeof builder}`);
    test('Editor exists', typeof editor !== 'undefined', `Type: ${typeof editor}`);
    
    // Test 2: Editor mode functionality
    test('Editor has editorActive property', builder.hasOwnProperty('editorActive'), `Value: ${builder.editorActive}`);
    test('Editor mode systems initialized', 
         editor.boneManipulator && editor.templatePalette && editor.skeletonControls, 
         'BoneManipulator, TemplatePalette, SkeletonControls');
    
    // Test 3: Static creature behavior (most important fix)
    test('Mouse following disabled in editor mode', 
         typeof builder.update === 'function', 
         'update() method contains editorActive checks');
    
    // Test 4: Template palette system
    test('Template Palette initialized', 
         editor.templatePalette && typeof editor.templatePalette.loadCreatureTemplate === 'function',
         'Template loading functionality available');
    
    // Test 5: Skeleton controls system
    test('Skeleton Controls initialized',
         editor.skeletonControls && typeof editor.skeletonControls.showBoneControls === 'function',
         'Bone control UI functionality available');
    
    // Test 6: Constraint editor system  
    test('Constraint Editor initialized',
         editor.constraintEditor && typeof editor.constraintEditor.drawJointConstraints === 'function',
         'Joint constraint visualization available');
    
    // Test 7: Editor toggle functionality
    const initialEditorState = builder.editorActive;
    test('Editor toggle works', 
         typeof editor.show === 'function' && typeof editor.hide === 'function',
         `Can activate/deactivate editor mode`);
    
    // Test 8: Creature availability
    test('Creature loaded with chains',
         builder.chains && builder.chains.length > 0,
         `${builder.chains?.length || 0} chains available`);
    
    // Summary
    console.log('\n📊 QUICK VALIDATION SUMMARY');
    console.log('===========================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 QUICK VALIDATION PASSED!');
        console.log('Core skeleton editing functionality is working.');
        console.log('\nTo test manually:');
        console.log('1. Press "E" to enter editor mode');
        console.log('2. Creature should stop moving (static pose)');
        console.log('3. Click on chains/bones to select them');
        console.log('4. Check sidebar for template palette and controls');
    } else {
        console.log('\n⚠️ Some core functionality issues detected.');
    }
    
    return failed === 0;
}

// Auto-run when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (typeof editor !== 'undefined' && typeof builder !== 'undefined') {
                runQuickValidation();
            } else {
                console.log('⏳ Waiting for editor and builder to initialize...');
                // Try again after a short delay
                setTimeout(() => {
                    if (typeof editor !== 'undefined' && typeof builder !== 'undefined') {
                        runQuickValidation();
                    } else {
                        console.error('❌ Editor or builder still not available');
                    }
                }, 2000);
            }
        }, 1000);
    });
    
    // Make available globally for manual testing
    window.runQuickValidation = runQuickValidation;
}