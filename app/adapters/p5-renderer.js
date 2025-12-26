// p5.js renderer adapter implementing the Renderer interface

(function initP5RendererFactory(global){
  function createP5Renderer() {
    if (typeof global.createCanvas !== 'function') {
      throw new Error('p5.js not available for renderer adapter');
    }

    return {
      // State
      get width() { return global.width; },
      get height() { return global.height; },

      // Drawing stack
      push: (...args) => global.push(...args),
      pop: (...args) => global.pop(...args),

      // Styles
      fill: (...args) => global.fill(...args),
      stroke: (...args) => global.stroke(...args),
      strokeWeight: (...args) => global.strokeWeight(...args),
      noStroke: (...args) => global.noStroke(...args),
      noFill: (...args) => global.noFill(...args),
      color: (...args) => global.color(...args),

      // Primitives
      line: (...args) => global.line(...args),
      circle: (...args) => global.circle(...args),
      ellipse: (...args) => global.ellipse(...args),  // For ovoids
      rect: (...args) => global.rect(...args),

      // Transformations
      translate: (...args) => global.translate(...args),
      rotate: (...args) => global.rotate(...args),

      // Text
      text: (...args) => global.text(...args),
      textAlign: (...args) => global.textAlign(...args),
      textSize: (...args) => global.textSize(...args),

      // Shapes
      beginShape: (...args) => global.beginShape(...args),
      vertex: (...args) => global.vertex(...args),
      bezierVertex: (...args) => global.bezierVertex(...args),
      endShape: (...args) => global.endShape(...args),
      endShapeClose: () => global.endShape(global.CLOSE),

      // Misc
      createVector: (...args) => global.createVector(...args),
      background: (...args) => global.background(...args),
    };
  }

  global.createP5Renderer = createP5Renderer;
})(typeof window !== 'undefined' ? window : globalThis);

