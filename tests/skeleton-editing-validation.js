/**
 * Comprehensive validation suite for skeleton editing functionality (PRP2)
 * 
 * This validates all implemented skeleton editing features:
 * - Multi-level selection (chain/bone/joint)
 * - Real-time bone manipulation
 * - IK test mode
 * - Performance monitoring
 * - UI integration
 */

class SkeletonEditingValidator {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
        
        console.log('🔍 Starting Skeleton Editing Validation Suite');
        console.log('===============================================');
    }
    
    test(name, condition, details = '') {
        const result = {
            name: name,
            passed: condition,
            details: details,
            timestamp: Date.now()
        };
        
        this.results.push(result);
        
        if (condition) {
            this.passed++;
            console.log(`✅ ${name}`, details ? `- ${details}` : '');
        } else {
            this.failed++;
            console.error(`❌ ${name}`, details ? `- ${details}` : '');
        }
        
        return condition;
    }
    
    async validateFoundation() {
        console.log('\n📋 FOUNDATION VALIDATION');
        console.log('========================');
        
        // Test 1: EditorMode skeleton editing extensions
        this.test(
            'EditorMode skeleton extensions exist',
            editor && editor.selectionMode && editor.editingMode !== undefined,
            `selectionMode: ${editor?.selectionMode}, editingMode: ${editor?.editingMode}`
        );
        
        // Test 2: BoneManipulator initialization
        this.test(
            'BoneManipulator properly initialized',
            editor?.boneManipulator && typeof editor.boneManipulator.selectBone === 'function',
            'BoneManipulator class instantiated with required methods'
        );
        
        // Test 3: Multi-level selection state
        this.test(
            'Multi-level selection state initialized',
            editor?.selectedBone === null && editor?.selectedJoint === null,
            'Clean initial state for bone and joint selection'
        );
        
        // Test 4: IK test mode capability
        this.test(
            'IK test mode functionality exists',
            typeof editor?.toggleIKTestMode === 'function' && editor.ikTestMode === false,
            'IK test mode toggle function available, initially disabled'
        );
        
        return this.results.filter(r => r.name.includes('Foundation')).every(r => r.passed);
    }
    
    async validateBoneSelection() {
        console.log('\n🎯 BONE SELECTION VALIDATION');
        console.log('============================');
        
        if (!builder?.chains || builder.chains.length === 0) {
            this.test('Bone selection validation', false, 'No chains available for testing');
            return false;
        }
        
        const testChain = builder.chains[0];
        if (!testChain || testChain.getNumBones() === 0) {
            this.test('Bone selection validation', false, 'No bones available for testing');
            return false;
        }
        
        // Test 5: Point-to-line distance calculation
        const bone = testChain.getBone(0);
        const start = bone.getStartLocation();
        const end = bone.getEndLocation();
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        const distance = editor.boneManipulator.pointToLineDistance(
            midX, midY, start.x, start.y, end.x, end.y
        );
        
        this.test(
            'Point-to-line distance calculation',
            distance < 1.0, // Should be very close to 0 for midpoint
            `Distance: ${distance.toFixed(2)}px (should be ~0 for midpoint)`
        );
        
        // Test 6: Bone selection by coordinates
        editor.selectionMode = 'bone';
        const selectedBone = editor.boneManipulator.selectBone(midX, midY);
        
        this.test(
            'Bone selection by coordinates',
            selectedBone && selectedBone.bone === bone,
            `Selected bone index: ${selectedBone?.boneIndex}, chain: ${selectedBone?.chainIndex}`
        );
        
        // Test 7: Bone properties extraction
        if (selectedBone) {
            const props = editor.boneManipulator.getBoneProperties(selectedBone);
            this.test(
                'Bone properties extraction',
                props && props.length && props.angle !== undefined,
                `Length: ${props?.length}px, Angle: ${props?.angle}°`
            );
        }
        
        return this.results.filter(r => r.name.includes('selection')).every(r => r.passed);
    }
    
    async validateBoneManipulation() {
        console.log('\n🔧 BONE MANIPULATION VALIDATION');
        console.log('===============================');
        
        if (!editor?.selectedBone) {
            this.test('Bone manipulation validation', false, 'No bone selected for manipulation testing');
            return false;
        }
        
        const originalBone = editor.selectedBone.bone;
        const originalEnd = originalBone.getEndLocation();
        const originalLength = originalBone.getLength();
        
        // Test 8: End-effector movement validation
        const newX = originalEnd.x + 10;
        const newY = originalEnd.y + 10;
        
        const moveResult = editor.boneManipulator.handleEndEffectorMove(
            editor.selectedBone, newX, newY
        );
        
        this.test(
            'End-effector movement',
            moveResult === true,
            `Move operation success: ${moveResult}`
        );
        
        // Test 9: Bone manipulation validation constraints
        const invalidLength = 2; // Below minimum
        const validationResult = editor.boneManipulator.validateBoneManipulation(
            editor.selectedBone, invalidLength, 0
        );
        
        this.test(
            'Bone manipulation constraints',
            validationResult === false,
            'Correctly rejected invalid length (2px < 5px minimum)'
        );
        
        // Test 10: Performance monitoring
        const startTime = performance.now();
        for (let i = 0; i < 10; i++) {
            editor.boneManipulator.selectBone(300 + i, 300 + i);
        }
        const selectionTime = performance.now() - startTime;
        
        this.test(
            'Selection performance',
            selectionTime < 100, // Should complete 10 selections in <100ms
            `10 selections in ${selectionTime.toFixed(1)}ms`
        );
        
        return this.results.filter(r => r.name.includes('manipulation')).every(r => r.passed);
    }
    
    async validateIKTestMode() {
        console.log('\n🎮 IK TEST MODE VALIDATION');
        console.log('==========================');
        
        // Test 11: IK test mode toggle
        const initialState = editor.ikTestMode;
        const toggleResult = editor.toggleIKTestMode();
        
        this.test(
            'IK test mode toggle',
            editor.ikTestMode !== initialState && toggleResult === editor.ikTestMode,
            `State changed from ${initialState} to ${editor.ikTestMode}`
        );
        
        // Test 12: Chain optimization for IK
        if (builder?.chains && builder.chains.length > 0) {
            const chain = builder.chains[0];
            const originalAttempts = chain.maxIterationAttempts;
            
            editor.optimizeChainsForIK();
            
            this.test(
                'Chain optimization for real-time IK',
                chain.maxIterationAttempts !== originalAttempts,
                `Iteration attempts reduced for performance`
            );
            
            // Test 13: IK solving performance
            if (editor.ikTestMode && chain.getNumBones() > 0) {
                const target = new FIK.V2(400, 300);
                const solveStart = performance.now();
                
                try {
                    chain.solveForTarget(target);
                    const solveTime = performance.now() - solveStart;
                    
                    this.test(
                        'IK solve performance',
                        solveTime < 16.67, // <16.67ms = 60fps capable
                        `IK solve in ${solveTime.toFixed(1)}ms (60fps = 16.67ms max)`
                    );
                } catch (error) {
                    this.test('IK solve performance', false, `IK solve error: ${error.message}`);
                }
            }
        }
        
        // Toggle back to original state
        if (editor.ikTestMode !== initialState) {
            editor.toggleIKTestMode();
        }
        
        return this.results.filter(r => r.name.includes('IK') || r.name.includes('optimization')).every(r => r.passed);
    }
    
    async validateUIIntegration() {
        console.log('\n🖥️ UI INTEGRATION VALIDATION');
        console.log('============================');
        
        // Test 14: Sidebar bone properties display
        if (editor?.selectedBone) {
            const sidebarElement = document.getElementById('editor-sidebar');
            const sidebarContent = sidebarElement?.innerHTML || '';
            
            this.test(
                'Sidebar bone properties display',
                sidebarContent.includes('Selected Bone') && sidebarContent.includes('Length:'),
                'Sidebar shows bone properties when bone is selected'
            );
        }
        
        // Test 15: Selection mode switching
        const originalMode = editor.selectionMode;
        editor.setSelectionMode('bone');
        
        this.test(
            'Selection mode switching',
            editor.selectionMode === 'bone',
            `Mode switched to: ${editor.selectionMode}`
        );
        
        editor.setSelectionMode(originalMode); // Reset
        
        // Test 16: Editing mode switching
        const originalEditMode = editor.editingMode;
        editor.setEditingMode('rotate');
        
        this.test(
            'Editing mode switching',
            editor.editingMode === 'rotate',
            `Edit mode switched to: ${editor.editingMode}`
        );
        
        editor.setEditingMode(originalEditMode); // Reset
        
        // Test 17: Performance monitoring
        this.test(
            'Performance monitoring active',
            typeof editor.performanceMonitor === 'object' && 
            editor.performanceMonitor.selectionResponseMax > 0,
            `Max response time: ${editor.performanceMonitor.selectionResponseMax}ms`
        );
        
        return this.results.filter(r => r.name.includes('UI') || r.name.includes('mode')).every(r => r.passed);
    }
    
    async validateKeyboardControls() {
        console.log('\n⌨️ KEYBOARD CONTROLS VALIDATION');
        console.log('===============================');
        
        // Test 18: IK test mode key toggle (simulate 'I' key)
        const initialIKState = editor.ikTestMode;
        
        // Simulate key press handler
        if (typeof keyPressed === 'function') {
            window.key = 'i';
            editorActive = true;
            
            try {
                keyPressed(); // This should trigger IK test mode toggle
                
                this.test(
                    'IK test mode keyboard toggle',
                    editor.ikTestMode !== initialIKState,
                    `'I' key toggled IK test mode from ${initialIKState} to ${editor.ikTestMode}`
                );
            } catch (error) {
                this.test('IK test mode keyboard toggle', false, `Key handler error: ${error.message}`);
            }
            
            // Reset state
            if (editor.ikTestMode !== initialIKState) {
                editor.toggleIKTestMode();
            }
        }
        
        return this.results.filter(r => r.name.includes('keyboard')).every(r => r.passed);
    }
    
    async runFullValidation() {
        console.log('🚀 RUNNING FULL SKELETON EDITING VALIDATION');
        console.log('============================================');
        
        try {
            await this.validateFoundation();
            await this.validateBoneSelection();
            await this.validateBoneManipulation();
            await this.validateIKTestMode();
            await this.validateUIIntegration();
            await this.validateKeyboardControls();
            
            this.printSummary();
            return this.failed === 0;
            
        } catch (error) {
            console.error('❌ Validation suite error:', error);
            return false;
        }
    }
    
    printSummary() {
        console.log('\n📊 VALIDATION SUMMARY');
        console.log('=====================');
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
        
        if (this.failed > 0) {
            console.log('\n🔍 FAILED TESTS:');
            this.results.filter(r => !r.passed).forEach(r => {
                console.log(`   • ${r.name}: ${r.details}`);
            });
        } else {
            console.log('\n🎉 ALL TESTS PASSED! Skeleton editing implementation is validated.');
        }
        
        return this.failed === 0;
    }
}

// Auto-run validation when loaded in browser
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        // Wait for editor to be initialized and check periodically
        const checkAndRunValidation = async () => {
            if (typeof editor !== 'undefined' && typeof builder !== 'undefined' && 
                editor.boneManipulator && builder.chains) {
                console.log('🔍 Editor and builder ready - starting validation...');
                const validator = new SkeletonEditingValidator();
                await validator.runFullValidation();
                return true;
            }
            return false;
        };
        
        // Try immediately
        if (await checkAndRunValidation()) return;
        
        // If not ready, check every 500ms for up to 10 seconds
        let attempts = 0;
        const maxAttempts = 20;
        const checkInterval = setInterval(async () => {
            attempts++;
            if (await checkAndRunValidation() || attempts >= maxAttempts) {
                clearInterval(checkInterval);
                if (attempts >= maxAttempts) {
                    console.error('❌ Validation timeout: editor or builder not available after 10 seconds');
                    console.log('Available globals:', {
                        editor: typeof editor !== 'undefined',
                        builder: typeof builder !== 'undefined',
                        boneManipulator: typeof editor?.boneManipulator !== 'undefined',
                        chains: Array.isArray(builder?.chains)
                    });
                }
            }
        }, 500);
    });
}

// Manual validation function for console use
if (typeof window !== 'undefined') {
    window.runSkeletonValidation = async () => {
        if (typeof editor !== 'undefined' && typeof builder !== 'undefined') {
            const validator = new SkeletonEditingValidator();
            return await validator.runFullValidation();
        } else {
            console.error('❌ Editor or builder not available. Make sure you are in a loaded page with the skeleton editing system.');
            return false;
        }
    };
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkeletonEditingValidator;
}