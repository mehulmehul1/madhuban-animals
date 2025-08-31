/**
 * UI Components for Madhuban Creature Editor
 * Foundational UI components for consistent interface using p5.js DOM
 */

/**
 * CollapsibleSection - Expandable content sections with headers
 * Provides organized, space-efficient content display
 */
class CollapsibleSection {
    constructor(parent, title, expanded = false) {
        this.parent = parent;
        this.title = title;
        this.expanded = expanded;
        this.content = '';
        
        // Create main container
        this.container = createDiv();
        this.container.parent(parent);
        this.container.class('collapsible-section');
        
        // Create header with toggle functionality
        this.header = createDiv();
        this.header.parent(this.container);
        this.header.class('collapsible-header');
        this.header.style(`
            background: #e8e8e8;
            padding: 8px 12px;
            cursor: pointer;
            border: 1px solid #ddd;
            border-radius: 4px 4px 0 0;
            font-weight: bold;
            user-select: none;
        `);
        
        // Create arrow indicator
        this.arrow = createSpan(this.expanded ? '▼' : '▶');
        this.arrow.parent(this.header);
        this.arrow.style('margin-right: 8px; font-size: 12px;');
        
        // Add title text
        this.titleSpan = createSpan(this.title);
        this.titleSpan.parent(this.header);
        
        // Create content area
        this.contentDiv = createDiv();
        this.contentDiv.parent(this.container);
        this.contentDiv.class('collapsible-content');
        this.contentDiv.style(`
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 4px 4px;
            padding: 8px 12px;
            background: #f9f9f9;
            display: ${this.expanded ? 'block' : 'none'};
        `);
        
        // Add click handler
        this.header.mousePressed(() => this.toggle());
        
        // Add hover effects
        this.header.mouseOver(() => {
            this.header.style('background', '#ddd');
        });
        this.header.mouseOut(() => {
            this.header.style('background', '#e8e8e8');
        });
    }
    
    toggle() {
        this.expanded = !this.expanded;
        this.arrow.html(this.expanded ? '▼' : '▶');
        this.contentDiv.style('display', this.expanded ? 'block' : 'none');
    }
    
    show() {
        this.container.style('display', 'block');
    }
    
    hide() {
        this.container.style('display', 'none');
    }
    
    setContent(htmlString) {
        this.content = htmlString;
        this.contentDiv.html(htmlString);
    }
    
    destroy() {
        if (this.container) {
            this.container.remove();
            this.container = null;
            this.header = null;
            this.contentDiv = null;
            this.arrow = null;
            this.titleSpan = null;
        }
    }
}

/**
 * PropertySlider - Labeled sliders with live value display
 * Provides consistent numeric input with immediate visual feedback
 */
class PropertySlider {
    constructor(parent, label, min, max, value, callback) {
        this.parent = parent;
        this.label = label;
        this.min = min;
        this.max = max;
        this.value = value;
        this.callback = callback;
        
        // Create container
        this.container = createDiv();
        this.container.parent(parent);
        this.container.class('property-slider');
        this.container.style(`
            margin: 8px 0;
            padding: 4px;
            border-radius: 4px;
        `);
        
        // Create label row
        this.labelRow = createDiv();
        this.labelRow.parent(this.container);
        this.labelRow.style('margin-bottom: 4px; display: flex; justify-content: space-between;');
        
        // Add label text
        this.labelSpan = createSpan(this.label);
        this.labelSpan.parent(this.labelRow);
        this.labelSpan.style('font-weight: bold; font-size: 12px;');
        
        // Add value display
        this.valueSpan = createSpan(this.value.toFixed(1));
        this.valueSpan.parent(this.labelRow);
        this.valueSpan.style('font-size: 12px; color: #666; font-family: monospace;');
        
        // Create slider
        this.slider = createSlider(this.min, this.max, this.value, 0.1);
        this.slider.parent(this.container);
        this.slider.style('width: 100%;');
        
        // Add input handler
        this.slider.input(() => {
            this.value = this.slider.value();
            this.valueSpan.html(this.value.toFixed(1));
            if (this.callback) {
                this.callback(this.value);
            }
        });
    }
    
    setValue(newValue) {
        this.value = constrain(newValue, this.min, this.max);
        this.slider.value(this.value);
        this.valueSpan.html(this.value.toFixed(1));
    }
    
    getValue() {
        return this.value;
    }
    
    setEnabled(enabled) {
        if (enabled) {
            this.slider.removeAttribute('disabled');
            this.container.style('opacity', '1');
        } else {
            this.slider.attribute('disabled', true);
            this.container.style('opacity', '0.5');
        }
    }
    
    show() {
        this.container.style('display', 'block');
    }
    
    hide() {
        this.container.style('display', 'none');
    }
    
    destroy() {
        if (this.container) {
            this.container.remove();
            this.container = null;
            this.slider = null;
            this.labelSpan = null;
            this.valueSpan = null;
            this.labelRow = null;
        }
    }
}

/**
 * IconButton - Consistent button styling with hover effects
 * Provides unified button appearance and behavior
 */
class IconButton {
    constructor(parent, text, callback, icon = null) {
        this.parent = parent;
        this.text = text;
        this.callback = callback;
        this.icon = icon;
        this.enabled = true;
        
        // Create button
        this.button = createButton(this.icon ? `${this.icon} ${this.text}` : this.text);
        this.button.parent(parent);
        this.button.class('icon-button');
        this.button.style(`
            padding: 6px 12px;
            margin: 2px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: #f5f5f5;
            cursor: pointer;
            font-size: 12px;
            font-family: inherit;
            transition: all 0.2s ease;
        `);
        
        // Add click handler
        this.button.mousePressed(() => {
            if (this.enabled && this.callback) {
                this.callback();
            }
        });
        
        // Add hover effects
        this.button.mouseOver(() => {
            if (this.enabled) {
                this.button.style('background', '#e8e8e8');
                this.button.style('border-color', '#999');
            }
        });
        
        this.button.mouseOut(() => {
            if (this.enabled) {
                this.button.style('background', '#f5f5f5');
                this.button.style('border-color', '#ccc');
            }
        });
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled) {
            this.button.style('opacity', '1');
            this.button.style('cursor', 'pointer');
            this.button.style('background', '#f5f5f5');
        } else {
            this.button.style('opacity', '0.5');
            this.button.style('cursor', 'default');
            this.button.style('background', '#e0e0e0');
        }
    }
    
    setText(newText) {
        this.text = newText;
        this.button.html(this.icon ? `${this.icon} ${this.text}` : this.text);
    }
    
    show() {
        this.button.style('display', 'inline-block');
    }
    
    hide() {
        this.button.style('display', 'none');
    }
    
    destroy() {
        if (this.button) {
            this.button.remove();
            this.button = null;
        }
    }
}

/**
 * SelectionHighlight - Visual highlighting for selected elements
 * Provides consistent visual feedback for selected chains/bones
 */
class SelectionHighlight {
    constructor() {
        this.highlightedChain = null;
        this.highlightedBone = null;
        this.chainColor = [255, 255, 0]; // Yellow
        this.boneColor = [255, 100, 100]; // Red
        this.highlightWeight = 3;
    }
    
    highlightChain(chainIndex, color = null) {
        this.highlightedChain = chainIndex;
        this.highlightedBone = null;
        if (color) {
            this.chainColor = color;
        }
    }
    
    highlightBone(chainIndex, boneIndex, color = null) {
        this.highlightedChain = chainIndex;
        this.highlightedBone = boneIndex;
        if (color) {
            this.boneColor = color;
        }
    }
    
    clear() {
        this.highlightedChain = null;
        this.highlightedBone = null;
    }
    
    draw(chains) {
        if (!chains || chains.length === 0) return;
        
        push();
        strokeWeight(this.highlightWeight);
        noFill();
        
        // Highlight selected chain
        if (this.highlightedChain !== null && this.highlightedChain < chains.length) {
            const chain = chains[this.highlightedChain];
            
            if (this.highlightedBone !== null) {
                // Highlight specific bone
                stroke(this.boneColor);
                if (this.highlightedBone < chain.getNumBones()) {
                    const bone = chain.getBone(this.highlightedBone);
                    const start = bone.getStartLocation();
                    const end = bone.getEndLocation();
                    line(start.x, start.y, end.x, end.y);
                    
                    // Draw circles at bone endpoints
                    circle(start.x, start.y, 8);
                    circle(end.x, end.y, 8);
                }
            } else {
                // Highlight entire chain
                stroke(this.chainColor);
                for (let i = 0; i < chain.getNumBones(); i++) {
                    const bone = chain.getBone(i);
                    const start = bone.getStartLocation();
                    const end = bone.getEndLocation();
                    line(start.x, start.y, end.x, end.y);
                }
                
                // Draw circles at chain endpoints
                if (chain.getNumBones() > 0) {
                    const firstBone = chain.getBone(0);
                    const lastBone = chain.getBone(chain.getNumBones() - 1);
                    const chainStart = firstBone.getStartLocation();
                    const chainEnd = lastBone.getEndLocation();
                    
                    fill(this.chainColor);
                    noStroke();
                    circle(chainStart.x, chainStart.y, 6);
                    circle(chainEnd.x, chainEnd.y, 6);
                }
            }
        }
        
        pop();
    }
    
    isPointNearChain(px, py, chain, threshold = 10) {
        for (let i = 0; i < chain.getNumBones(); i++) {
            const bone = chain.getBone(i);
            const start = bone.getStartLocation();
            const end = bone.getEndLocation();
            
            // Calculate distance from point to line segment
            const dist = this.pointToLineDistance(px, py, start.x, start.y, end.x, end.y);
            if (dist < threshold) {
                return { chainHit: true, boneIndex: i };
            }
        }
        return { chainHit: false, boneIndex: -1 };
    }
    
    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) return dist(px, py, x1, y1);
        
        let param = dot / lenSq;
        param = constrain(param, 0, 1);
        
        const xx = x1 + param * C;
        const yy = y1 + param * D;
        
        return dist(px, py, xx, yy);
    }
}

/**
 * Utility function to create consistent spacing
 */
function createSpacer(parent, height = 8) {
    const spacer = createDiv();
    spacer.parent(parent);
    spacer.style(`height: ${height}px;`);
    return spacer;
}

/**
 * Utility function to create section dividers
 */
function createDivider(parent) {
    const divider = createDiv();
    divider.parent(parent);
    divider.style(`
        height: 1px;
        background: #ddd;
        margin: 8px 0;
    `);
    return divider;
}