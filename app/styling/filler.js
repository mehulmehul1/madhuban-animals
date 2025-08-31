class Filler {
    constructor(path, style) {
        this.path = path;
        this.style = style;
    }

    draw(strokeColor) {
        push(); // Isolate styling for the filler
        noFill(); // Fillers are typically stroke-only patterns
        strokeWeight(1); // Consistent weight for filler patterns

        if (strokeColor) {
            stroke(...strokeColor);
        }

        switch (this.style.pattern) {
            case 'hatching':
                this.drawHatching();
                break;
            case 'dots':
                this.drawDots();
                break;
            case 'circles':
                this.drawCircles();
                break;
        }
        pop(); // Restore original drawing style
    }

    drawHatching() {
        const bounds = this.getBoundingBox(this.path);
        for (let y = bounds.minY; y < bounds.maxY; y += this.style.spacing) {
            for (let x = bounds.minX; x < bounds.maxX; x += this.style.spacing) {
                if (this.isPointInPath(createVector(x, y), this.path)) {
                    line(x, y, x + this.style.spacing, y + this.style.spacing);
                }
            }
        }
    }

    drawDots() {
        const bounds = this.getBoundingBox(this.path);
        for (let y = bounds.minY; y < bounds.maxY; y += this.style.spacing) {
            for (let x = bounds.minX; x < bounds.maxX; x += this.style.spacing) {
                if (this.isPointInPath(createVector(x, y), this.path)) {
                    point(x, y);
                }
            }
        }
    }

    drawCircles() {
        const bounds = this.getBoundingBox(this.path);
        for (let y = bounds.minY; y < bounds.maxY; y += this.style.spacing) {
            for (let x = bounds.minX; x < bounds.maxX; x += this.style.spacing) {
                if (this.isPointInPath(createVector(x, y), this.path)) {
                    ellipse(x, y, this.style.radius, this.style.radius);
                }
            }
        }
    }

    getBoundingBox(path) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const p of path) {
            minX = min(minX, p.x);
            minY = min(minY, p.y);
            maxX = max(maxX, p.x);
            maxY = max(maxY, p.y);
        }
        return { minX, minY, maxX, maxY };
    }

    isPointInPath(point, path) {
        let inside = false;
        for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
            const xi = path[i].x, yi = path[i].y;
            const xj = path[j].x, yj = path[j].y;

            const intersect = ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
}
