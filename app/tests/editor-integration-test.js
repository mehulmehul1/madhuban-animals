// Editor Integration Test
// This test validates the basic editor functionality

function runEditorTests() {
    console.log("🧪 Starting Editor Integration Tests...");
    
    let testsPassed = 0;
    let testsFailed = 0;
    
    function assert(condition, message) {
        if (condition) {
            console.log(`✓ ${message}`);
            testsPassed++;
        } else {
            console.error(`❌ ${message}`);
            testsFailed++;
        }
    }
    
    // Test 1: Basic object initialization
    try {
        assert(typeof builder !== 'undefined', "ModularCreatureBuilder exists");
        assert(typeof editor !== 'undefined', "EditorMode exists");
        assert(typeof editorActive !== 'undefined', "editorActive variable exists");
        assert(editorActive === false, "Editor initially inactive");
    } catch (e) {
        console.error("❌ Basic initialization test failed:", e);
        testsFailed++;
    }
    
    // Test 2: Editor state management
    try {
        assert(typeof builder.pauseForEditor === 'function', "pauseForEditor method exists");
        assert(typeof builder.resumeFromEditor === 'function', "resumeFromEditor method exists");
        assert(typeof editor.show === 'function', "editor.show method exists");
        assert(typeof editor.hide === 'function', "editor.hide method exists");
    } catch (e) {
        console.error("❌ State management test failed:", e);
        testsFailed++;
    }
    
    // Test 3: UI components
    try {
        assert(editor.ui.sidebar !== null, "Sidebar UI component created");
        assert(editor.ui.toolbar !== null, "Toolbar UI component created");
    } catch (e) {
        console.error("❌ UI components test failed:", e);
        testsFailed++;
    }
    
    // Test 4: Chain selection functionality
    try {
        assert(typeof editor.handleMouseClick === 'function', "handleMouseClick method exists");
        assert(typeof editor.isPointNearChain === 'function', "isPointNearChain method exists");
        assert(editor.selectedChain === null, "No chain initially selected");
    } catch (e) {
        console.error("❌ Chain selection test failed:", e);
        testsFailed++;
    }
    
    // Test 5: Performance monitoring
    try {
        assert(typeof editor.performanceMonitor === 'object', "Performance monitor exists");
        assert(typeof editor.monitorPerformance === 'function', "Performance monitoring function exists");
    } catch (e) {
        console.error("❌ Performance monitoring test failed:", e);
        testsFailed++;
    }
    
    console.log(`\n🧪 Test Results: ${testsPassed} passed, ${testsFailed} failed`);
    
    if (testsFailed === 0) {
        console.log("🎉 All editor integration tests passed!");
        return true;
    } else {
        console.log("⚠️ Some tests failed. Check implementation.");
        return false;
    }
}

// Export for browser console use
window.runEditorTests = runEditorTests;