// Minimal SidebarUI test to isolate the issue
console.log('🧪 Testing minimal SidebarUI implementation...');

class MinimalSidebarUI {
    constructor(builder, editor) {
        console.log('✅ MinimalSidebarUI constructor called');
        this.builder = builder;
        this.editor = editor;
    }
    
    initialize() {
        console.log('✅ MinimalSidebarUI initialize called');
    }
    
    show() {
        console.log('✅ MinimalSidebarUI show called');
    }
    
    hide() {
        console.log('✅ MinimalSidebarUI hide called');
    }
    
    updateAll() {
        console.log('✅ MinimalSidebarUI updateAll called');
    }
    
    cleanup() {
        console.log('✅ MinimalSidebarUI cleanup called');
    }
}

// Test the minimal version
try {
    const mockBuilder = { chains: [], chainConfigs: [] };
    const mockEditor = { active: false };
    
    const minimalUI = new MinimalSidebarUI(mockBuilder, mockEditor);
    console.log('✅ MinimalSidebarUI created successfully');
    
    minimalUI.initialize();
    minimalUI.show();
    minimalUI.hide();
    minimalUI.updateAll();
    minimalUI.cleanup();
    
    console.log('✅ All MinimalSidebarUI methods work correctly');
} catch (error) {
    console.error('❌ Error with MinimalSidebarUI:', error);
}

// Check if the original SidebarUI has issues
console.log('🔍 Checking if SidebarUI is available:', typeof SidebarUI);
console.log('🔍 Checking if EditorMode is available:', typeof EditorMode);