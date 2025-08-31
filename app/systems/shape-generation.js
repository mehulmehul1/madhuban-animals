/**
 * Shape Generation System - Handles outline generation from bone chains
 * Placeholder for shape generation functionality used by creature rendering
 */

// Shape generation utilities
function generateOutlineFromChain(chain, widthProfile) {
    // Basic outline generation from chain bones
    if (!chain || !chain.bones || chain.bones.length < 2) {
        return { leftSide: [], rightSide: [] };
    }
    
    const leftSide = [];
    const rightSide = [];
    const defaultWidth = widthProfile || 10;
    
    for (let i = 0; i < chain.bones.length; i++) {
        const bone = chain.bones[i];
        const start = bone.getStartLocation();
        const end = bone.getEndLocation();
        
        // Calculate perpendicular direction for width
        const dir = new FIK.V2(end.x - start.x, end.y - start.y);
        const perp = new FIK.V2(-dir.y, dir.x).normalised();
        
        const width = Array.isArray(widthProfile) && i < widthProfile.length ? 
                     widthProfile[i] : defaultWidth;
        
        // Add points to left and right sides
        leftSide.push({
            x: start.x + perp.x * width,
            y: start.y + perp.y * width
        });
        
        rightSide.unshift({
            x: start.x - perp.x * width,
            y: start.y - perp.y * width
        });
        
        // Add end point for last bone
        if (i === chain.bones.length - 1) {
            leftSide.push({
                x: end.x + perp.x * width,
                y: end.y + perp.y * width
            });
            
            rightSide.unshift({
                x: end.x - perp.x * width,
                y: end.y - perp.y * width
            });
        }
    }
    
    return { leftSide, rightSide };
}

// Export for other systems to use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateOutlineFromChain };
}