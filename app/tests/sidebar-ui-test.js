/**
 * Simple test to check SidebarUI class loading
 */

console.log('🧪 Testing SidebarUI class availability...');

// Check if SidebarUI is defined
if (typeof SidebarUI !== 'undefined') {
    console.log('✅ SidebarUI class is available');
    
    // Test basic instantiation
    try {
        const mockBuilder = { chains: [], chainConfigs: [] };
        const mockEditor = { active: false };
        
        const sidebarUI = new SidebarUI(mockBuilder, mockEditor);
        console.log('✅ SidebarUI instantiated successfully:', sidebarUI);
        
        // Test initialize method
        if (typeof sidebarUI.initialize === 'function') {
            console.log('✅ SidebarUI.initialize method is available');
        } else {
            console.error('❌ SidebarUI.initialize method is missing');
        }
        
    } catch (error) {
        console.error('❌ Error instantiating SidebarUI:', error);
    }
} else {
    console.error('❌ SidebarUI class is not defined');
}