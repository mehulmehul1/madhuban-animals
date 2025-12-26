/**
 * Geometric Primitive Renderer
 * =============================
 * Renders discrete geometric masses using p5.js primitives.
 * Used for volume-based mass construction (artist approach).
 * 
 * Primitives:
 * - Sphere: Simple circle
 * - Ovoid: Rotated ellipse (stretched sphere)
 * - Cylinder: Two circles + connecting rectangle
 * - Sausage: Rounded capsule (cylinder with very round ends)
 */

(function(global) {
  'use strict';
  
  class GeometricPrimitiveRenderer {
    constructor() {
      // Can add config later
    }

    /**
     * Render a sphere (cranium, joints)
     * @param {Object} p5 - p5.js instance
     * @param {Object} center - {x, y} center position
     * @param {number} radius - Sphere radius
     * @param {Object} color - p5.color object
     */
    renderSphere(p5, center, radius, color) {
      p5.push();
      p5.noStroke();
      p5.fill(color);
      p5.circle(center.x, center.y, radius * 2);
      p5.pop();
    }

    /**
     * Render an ovoid (ribcage, pelvis - stretched sphere)
     * @param {Object} p5 - p5.js instance
     * @param {Object} center - {x, y} center position
     * @param {number} width - Ellipse width
     * @param {number} height - Ellipse height
     * @param {number} rotation - Rotation angle in radians
     * @param {Object} color - p5.color object
     * @param {boolean} isRibcage - Special flag for ribcage highlighting
     */
    renderOvoid(p5, center, width, height, rotation, color, isRibcage = false) {
      p5.push();

      // Special highlighting for ribcage
      if (isRibcage) {
        p5.stroke(0, 255, 0); // Green outline
        p5.strokeWeight(3);
      } else {
        p5.noStroke();
      }

      p5.fill(color);
      p5.translate(center.x, center.y);
      p5.rotate(rotation);
      p5.ellipse(0, 0, width, height);
      p5.pop();
    }

    /**
     * Render a cylinder (limbs - solid tube)
     * @param {Object} p5 - p5.js instance
     * @param {Object} startPos - {x, y} start position
     * @param {Object} endPos - {x, y} end position
     * @param {number} radius - Cylinder radius
     * @param {Object} color - p5.color object
     */
    renderCylinder(p5, startPos, endPos, radius, color) {
      const dx = endPos.x - startPos.x;
      const dy = endPos.y - startPos.y;
      const angle = Math.atan2(dy, dx);
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length < 0.1) return; // Skip degenerate cylinders
      
      p5.push();
      p5.noStroke();
      p5.fill(color);
      
      // Draw connecting rectangle
      p5.translate(startPos.x, startPos.y);
      p5.rotate(angle);
      p5.rect(0, -radius, length, radius * 2);
      p5.pop();
      
      // Draw end caps (circles)
      p5.push();
      p5.noStroke();
      p5.fill(color);
      p5.circle(startPos.x, startPos.y, radius * 2);
      p5.circle(endPos.x, endPos.y, radius * 2);
      p5.pop();
    }

    /**
     * Render a sausage (torso, tail - rounded capsule)
     * @param {Object} p5 - p5.js instance
     * @param {Object} startPos - {x, y} start position
     * @param {Object} endPos - {x, y} end position
     * @param {number} radius - Sausage radius
     * @param {Object} color - p5.color object
     */
    renderSausage(p5, startPos, endPos, radius, color) {
      // Sausage is essentially a cylinder with emphasized round ends
      // For now, same as cylinder (can add extra roundness later)
      this.renderCylinder(p5, startPos, endPos, radius, color);
    }
  }

  // Immediately assign to global window object
  global.GeometricPrimitiveRenderer = GeometricPrimitiveRenderer;
  
  console.log('[GEOMETRIC RENDERER] Loaded and available globally');
  
})(typeof window !== 'undefined' ? window : this);
