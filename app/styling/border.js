class BorderDecorator {
    constructor(path, style) {
        this.path = path;
        this.style = style;
    }

    draw(strokeColor) {
        push(); // Isolate styling for the decorator
        noFill();
        strokeWeight(1); // Consistent weight for borders

        if (strokeColor) {
            stroke(...strokeColor);
        }

        // Draw border lines, preserving original inside/outside logic
        for (let i = 0; i < this.style.numLines; i++) {
            const offset = (i + 1) * this.style.strokeGap;
            this.drawPath(this.path, offset);
            this.drawPath(this.path, -offset);
        }

        // Draw beads
        if (this.style.beads && this.style.beads.count > 0) {
            if (strokeColor) {
                fill(...strokeColor);
                noStroke(); // Beads typically don't have a separate stroke
            }
            this.drawBeads();
        }
        pop(); // Restore original drawing style
    }

    drawPath(path, offset) {
        beginShape();
        for (let i = 0; i < path.length; i++) {
            const p = path[i];
            const p_next = path[(i + 1) % path.length];
            const normal = createVector(p_next.y - p.y, p.x - p_next.x).normalize();
            const new_p = p5.Vector.add(p, p5.Vector.mult(normal, offset));
            vertex(new_p.x, new_p.y);
        }
        endShape(CLOSE);
    }

    drawBeads() {
        const totalLength = this.getPathLength(this.path);
        const spacing = totalLength / this.style.beads.count;

        for (let i = 0; i < this.style.beads.count; i++) {
            const point = this.getPointAtLength(this.path, i * spacing);
            ellipse(point.x, point.y, this.style.beads.size, this.style.beads.size);
        }
    }

    getPathLength(path) {
        let length = 0;
        for (let i = 0; i < path.length; i++) {
            length += p5.Vector.dist(path[i], path[(i + 1) % path.length]);
        }
        return length;
    }

    getPointAtLength(path, length) {
        let currentLength = 0;
        for (let i = 0; i < path.length; i++) {
            const p1 = path[i];
            const p2 = path[(i + 1) % path.length];
            const segmentLength = p5.Vector.dist(p1, p2);
            if (currentLength + segmentLength >= length) {
                const t = (length - currentLength) / segmentLength;
                return p5.Vector.lerp(p1, p2, t);
            }
            currentLength += segmentLength;
        }
    }
}
