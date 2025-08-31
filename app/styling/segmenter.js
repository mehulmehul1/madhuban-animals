class Segmenter {
    constructor(path) {
        this.path = path;
    }

    segment(numSegments) {
        const segments = [];
        const bounds = this.getBoundingBox(this.path);
        const segmentHeight = (bounds.maxY - bounds.minY) / numSegments;

        for (let i = 0; i < numSegments; i++) {
            const segmentY = bounds.minY + i * segmentHeight;
            const segment = this.clip(this.path, segmentY, segmentHeight);
            segments.push(segment);
        }
        return segments;
    }

    clip(path, y, h) {
        const clippedPath = [];
        for (let i = 0; i < path.length; i++) {
            const p1 = path[i];
            const p2 = path[(i + 1) % path.length];

            const p1_inside = p1.y >= y && p1.y <= y + h;
            const p2_inside = p2.y >= y && p2.y <= y + h;

            if (p1_inside) {
                clippedPath.push(p1);
            }

            if (p1_inside !== p2_inside) {
                const intersection = this.getIntersection(p1, p2, y);
                if (intersection) clippedPath.push(intersection);
                const intersection2 = this.getIntersection(p1, p2, y + h);
                if (intersection2) clippedPath.push(intersection2);
            }
        }
        return clippedPath;
    }

    getIntersection(p1, p2, y) {
        const t = (y - p1.y) / (p2.y - p1.y);
        if (t >= 0 && t <= 1) {
            return p5.Vector.lerp(p1, p2, t);
        }
        return null;
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
}
