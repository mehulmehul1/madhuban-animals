/**
 * Validation tests for ConfigManager (PRP1-7)
 * 
 * Tests JSON import/export functionality, backward compatibility,
 * and integration with ModularCreatureBuilder.
 */

class ConfigManagerValidator {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
        
        console.log('🔍 Starting ConfigManager Validation Tests');
        console.log('============================================');
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
    
    async runAllTests() {
        console.log('\n📋 CONFIGMANAGER FOUNDATION TESTS');
        console.log('===================================');
        
        // Test 1: ConfigManager exists and is initialized
        this.test(
            'ConfigManager class exists',
            typeof ConfigManager !== 'undefined',
            'ConfigManager class should be loaded'
        );
        
        this.test(
            'Editor has ConfigManager instance',
            editor && editor.configManager && editor.configManager instanceof ConfigManager,
            'EditorMode should initialize ConfigManager'
        );
        
        this.test(
            'ConfigManager has builder reference',
            editor.configManager.builder === builder,
            'ConfigManager should reference ModularCreatureBuilder'
        );
        
        console.log('\n📤 EXPORT FUNCTIONALITY TESTS');
        console.log('==============================');
        
        // Test 2: Export functionality
        await this.testExportFunctionality();
        
        console.log('\n📥 IMPORT FUNCTIONALITY TESTS');
        console.log('==============================');
        
        // Test 3: Import functionality
        await this.testImportFunctionality();
        
        console.log('\n🔄 ROUND-TRIP TESTS');
        console.log('====================');
        
        // Test 4: Round-trip export/import
        await this.testRoundTripFunctionality();
        
        console.log('\n🎯 UI INTEGRATION TESTS');
        console.log('========================');
        
        // Test 5: UI integration
        this.testUIIntegration();
        
        // Summary
        console.log('\n📊 TEST SUMMARY');
        console.log('================');
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
        
        return this.failed === 0;
    }
    
    async testExportFunctionality() {
        try {
            // Ensure we have a creature to export
            builder.buildHorse();
            
            // Test basic export
            const config = editor.configManager.exportConfig('complete');
            
            this.test(
                'Export config returns object',
                config && typeof config === 'object',
                'exportConfig should return configuration object'
            );
            
            this.test(
                'Export config has required fields',
                config.version && config.creatureType && config.chainConfigs,
                'Configuration should have version, creatureType, and chainConfigs'
            );
            
            this.test(
                'Export config has correct creature type',
                config.creatureType === 'horse',
                'Should export current creature type'
            );
            
            this.test(
                'Export config has chain configurations',
                Array.isArray(config.chainConfigs) && config.chainConfigs.length > 0,
                'Should export chain configurations'
            );
            
            // Test different export formats
            const skeletonConfig = editor.configManager.exportConfig('skeleton');
            this.test(
                'Skeleton export format works',
                skeletonConfig && skeletonConfig.format === 'skeleton',
                'Skeleton format should export without locomotion data'
            );
            
            const baseConfig = editor.configManager.exportConfig('base');
            this.test(
                'Base export format works',
                baseConfig && baseConfig.format === 'base' && !baseConfig.editorMetadata,
                'Base format should export without editor metadata'
            );
            
        } catch (error) {
            this.test(
                'Export functionality basic test',
                false,
                `Export failed: ${error.message}`
            );
        }
    }
    
    async testImportFunctionality() {
        try {
            // Create a test configuration
            const originalType = builder.creatureType;
            const testConfig = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                format: 'complete',
                creatureType: 'fish',
                creatureConfig: {
                    bodyLength: 200,
                    bodySegments: 8,
                    segmentLength: 25,
                    finSize: 30
                },
                chainConfigs: [
                    {
                        role: 'spine',
                        type: 'spine',
                        attachment: 'free',
                        targetMode: 'mouse',
                        color: [100, 150, 255],
                        bones: [
                            { length: 25, direction: { x: 1, y: 0 }, constraints: { clockwise: 30, anticlockwise: 30 } },
                            { length: 25, direction: { x: 1, y: 0 }, constraints: { clockwise: 30, anticlockwise: 30 } }
                        ]
                    }
                ],
                locomotion: null,
                editorMetadata: {
                    lastModified: new Date().toISOString(),
                    editorVersion: '1.0'
                }
            };
            
            // Test import
            const success = editor.configManager.importConfig(testConfig);
            
            this.test(
                'Import config returns success',
                success === true,
                'importConfig should return true on success'
            );
            
            this.test(
                'Import changes creature type',
                builder.creatureType === 'fish',
                'Should change creature type to imported value'
            );
            
            this.test(
                'Import creates chains',
                builder.chains.length > 0,
                'Should create chains from imported configuration'
            );
            
            // Restore original creature
            if (originalType === 'horse') {
                builder.buildHorse();
            }
            
        } catch (error) {
            this.test(
                'Import functionality basic test',
                false,
                `Import failed: ${error.message}`
            );
        }
    }
    
    async testRoundTripFunctionality() {
        try {
            // Start with a known creature
            builder.buildHorse();
            const originalChainCount = builder.chains.length;
            const originalType = builder.creatureType;
            
            // Export configuration
            const exportedConfig = editor.configManager.exportConfig('complete');
            
            // Clear and import
            builder.clearCreature();
            const importSuccess = editor.configManager.importConfig(exportedConfig);
            
            this.test(
                'Round-trip import succeeds',
                importSuccess === true,
                'Should successfully import exported configuration'
            );
            
            this.test(
                'Round-trip preserves creature type',
                builder.creatureType === originalType,
                'Creature type should be preserved through export/import'
            );
            
            this.test(
                'Round-trip preserves chain count',
                builder.chains.length === originalChainCount,
                'Number of chains should be preserved'
            );
            
            this.test(
                'Round-trip preserves chain configurations',
                builder.chainConfigs.length === originalChainCount,
                'Chain configurations should be preserved'
            );
            
        } catch (error) {
            this.test(
                'Round-trip functionality test',
                false,
                `Round-trip failed: ${error.message}`
            );
        }
    }
    
    testUIIntegration() {
        // Test UI elements exist
        this.test(
            'Save button exists in UI',
            document.querySelector('button[onclick="editor.saveCreatureConfig();"]') !== null,
            'Save button should be present in editor UI'
        );
        
        this.test(
            'Load button exists in UI',
            document.querySelector('button[onclick="editor.loadCreatureConfig();"]') !== null,
            'Load button should be present in editor UI'
        );
        
        this.test(
            'Export button exists in UI',
            document.querySelector('button[onclick="editor.exportCreatureConfig();"]') !== null,
            'Export button should be present in editor UI'
        );
        
        this.test(
            'Format selector exists',
            document.getElementById('editor-export-format') !== null,
            'Export format selector should be present'
        );
        
        this.test(
            'File input exists',
            document.getElementById('editor-config-upload') !== null,
            'File upload input should be present'
        );
        
        // Test UI methods exist
        this.test(
            'Save method exists on editor',
            typeof editor.saveCreatureConfig === 'function',
            'saveCreatureConfig method should exist'
        );
        
        this.test(
            'Load method exists on editor',
            typeof editor.loadCreatureConfig === 'function',
            'loadCreatureConfig method should exist'
        );
        
        this.test(
            'Export method exists on editor',
            typeof editor.exportCreatureConfig === 'function',
            'exportCreatureConfig method should exist'
        );
    }
    
    // Manual test helper for file operations
    testFileOperations() {
        console.log('\n📁 MANUAL FILE OPERATION TESTS');
        console.log('===============================');
        console.log('Run these tests manually:');
        console.log('1. Press E to enter editor mode');
        console.log('2. Modify a creature (select chains, move bones, etc.)');
        console.log('3. Click "Save" button - should download JSON file');
        console.log('4. Click "Load" button - should open file dialog');
        console.log('5. Select the downloaded file - should load configuration');
        console.log('6. Click "Export JSON" - should copy to clipboard');
        console.log('7. Check console for exported JSON');
    }
}

// Global test function for easy access
function runConfigManagerTests() {
    const validator = new ConfigManagerValidator();
    return validator.runAllTests();
}

// Global manual test function
function testConfigManagerFiles() {
    const validator = new ConfigManagerValidator();
    validator.testFileOperations();
}

console.log('ConfigManager validation loaded. Run tests with:');
console.log('- runConfigManagerTests() - automated tests');
console.log('- testConfigManagerFiles() - manual file operation guide');