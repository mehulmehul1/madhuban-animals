class ThemeManager {
    constructor() {
        this.themes = {
            'default': {
                background: [245, 235, 220],
                creature_fill: () => [random(180, 220), random(200, 240), random(160, 200)],
                creature_stroke: [139, 69, 19],
                stroke_weight: 2,
                border: {
                    stroke: [139, 69, 19],
                    style: { numLines: 2, strokeGap: 3, beads: { count: 15, size: 4 } }
                },
                filler: {
                    stroke: [139, 69, 19],
                    patterns: ['circles', 'hatching', 'dots'],
                    styles: {
                        'circles': { pattern: 'circles', spacing: 15, radius: 3 },
                        'hatching': { pattern: 'hatching', spacing: 10 },
                        'dots': { pattern: 'dots', spacing: 8 }
                    }
                }
            },
            'ocean': {
                background: [0, 50, 100],
                creature_fill: () => [random(0, 50), random(120, 180), random(200, 255)],
                creature_stroke: [255, 255, 255],
                stroke_weight: 1,
                border: {
                    stroke: [255, 255, 255],
                    style: { numLines: 1, strokeGap: 4, beads: { count: 20, size: 3 } }
                },
                filler: {
                    stroke: [200, 200, 255],
                    patterns: ['hatching', 'dots'],
                    styles: {
                        'hatching': { pattern: 'hatching', spacing: 8 },
                        'dots': { pattern: 'dots', spacing: 10 }
                    }
                }
            }
        };
        this.currentTheme = 'default';
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            console.log(`Theme changed to: ${themeName}`);
            // Optional: Add a function to redraw the canvas or notify other components
            if (typeof redraw === 'function') {
                redraw(); // if using p5.js noLoop() mode
            }
        }
    }

    get(key) {
        const theme = this.themes[this.currentTheme];
        const keys = key.split('.');
        let value = theme;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined; // Key not found
            }
        }
        return value;
    }
}
