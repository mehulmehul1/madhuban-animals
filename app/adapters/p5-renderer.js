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

      // Primitives
      line: (...args) => global.line(...args),
      circle: (...args) => global.circle(...args),
      rect: (...args) => global.rect(...args),

      // Text
      text: (...args) => global.text(...args),
      textAlign: (...args) => global.textAlign(...args),
      textSize: (...args) => global.textSize(...args),

      // Shapes
      beginShape: (...args) => global.beginShape(...args),
      vertex: (...args) => global.vertex(...args),
      endShapeClose: () => global.endShape(global.CLOSE),

      // Misc
      createVector: (...args) => global.createVector(...args),
      background: (...args) => global.background(...args),
    };
  }

  global.createP5Renderer = createP5Renderer;
})(typeof window !== 'undefined' ? window : globalThis);

