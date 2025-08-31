// Interface: Renderer
// Minimal rendering contract used by domain layer.
// Implementations: adapters/p5-renderer.js
//
// Expected shape (methods map to p5.js drawing API):
// - push(), pop()
// - fill(...), stroke(...), strokeWeight(n), noStroke()
// - line(x1,y1,x2,y2), circle(x,y,d), rect(x,y,w,h,r)
// - text(str,x,y), textAlign(h,v), textSize(n)
// - beginShape(), vertex(x,y), endShapeClose()
// - createVector(x,y)
// - width (getter), height (getter)

