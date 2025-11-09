# Phase 2: Force-Driven Deformation Engine - Brownfield Epic

**Version 1.0 — Building on Phase 1 Muscle Infrastructure**

---

## Epic Goal

Implement a force-driven deformation engine that transforms auto-generated muscle structures (from Phase 1) into dynamic visual representations that respond to skeleton movement, alignment with Mattesi force animation principles (stretch/compress/twist).

---

## Epic Description

### Existing System Context

**Phase 1 Foundation (already complete):**
- 7 shape types defined with deformation behavior rules
- 5 locomotion type mappings (erect, sprawling, bipedal, serpentine, aquatic)
- Auto-generation algorithm produces `{id, type, startJoint, endJoint, restLength, width, deformationRules}`
- Creatures (horse, lizard) auto-generate muscles from skeleton structure
- Integration point: `creature-builder.js` calls `generateMusclesTours()`

**Current Technology Stack:**
- Core: FIK.js (Forward/Inverse Kinematics), p5.js (rendering)
- Muscle data: ES6 objects with behavior definitions
- Skeleton: bone-based with joint positions, angles
- Rendering adapter: `adapters/p5-fiks-adapter.js`

### Enhancement Details

**What's being added:**
1. Force analyzer: Calculates deformation metrics (ratio, twist) from skeleton state
2. Deformation rules engine: Applies shape-type-specific visual transformations
3. Shape renderer: Converts deformation rules → 2D muscle geometry
4. Integration layer: Wires analyzer → rules → renderer in draw loop

**How it integrates:**
- Input: Creature skeleton joint positions (from locomotion system)
- Calculation: Per-muscle force ratios and twist angles
- Output: Deformed muscle shapes rendered via p5.js
- Existing APIs: No breaking changes; uses current muscle/skeleton objects

**Success Criteria:**
- ✅ Horse muscles bulge during stance phase, thin during extension
- ✅ Lizard spine undulates with high twist sensitivity
- ✅ Muscle deformation follows shape-type rules (stretch/compress/twist)
- ✅ Performance: Real-time rendering at 60fps with 15-20 muscles visible
- ✅ New system coexists with existing p5.js rendering

---

## Stories

### Story 2.1: Implement Force Analyzer (2h)

**Description:** Create `systems/force-analyzer.js` that calculates force metrics from skeleton state.

**Deliverable:**
- `ForceAnalyzer` class with:
  - `calculateMuscleForce(muscle, skeleton)` → `{ratio, twistAngle, compression}`
  - Ratio = current bone-pair distance / rest length
  - Twist = angle change in local joint rotation
  - Compression = ratio < 1.0 (flexion) vs ratio > 1.0 (extension)

**Acceptance Criteria:**
- ✅ Force analyzer correctly calculates ratio from bone positions
- ✅ Twist angle derived from skeleton rotation (from FIK.js)
- ✅ Handles all muscle types (extending_limb_muscle, rotation_joint, etc.)
- ✅ Returns consistent object structure: `{ratio, twistAngle, compression}`
- ✅ Unit tested with mock skeleton and known force values

**Integration:**
- Input: `muscle` object + `creature.skeleton`
- Output: Force metrics used by deformation rules
- No changes to existing muscle/skeleton objects

---

### Story 2.2: Implement Deformation Rules Engine (2h)

**Description:** Create `systems/deformation-rules.js` that applies shape-type-specific visual transformations based on force.

**Deliverable:**
- `DeformationEngine` class with:
  - `applyDeformationRules(muscle, forceMetrics)` → `{width, bulgeFactor, thinFactor, spiralOffset}`
  - Per-shape-type rules (extending_limb_muscle stretches thin, compression_mass bulges on compress)
  - Twist sensitivity multiplied per shape type

**Acceptance Criteria:**
- ✅ Extending limb muscle: ratio > 1.0 → thin (0.7x), ratio < 1.0 → bulge (1.2x)
- ✅ Compression mass: ratio < 1.0 → maximum bulge (1.4x)
- ✅ Rotation joint: high twist sensitivity (1.2x offset angle)
- ✅ Undulation segment: very high twist (1.4x), spiral pattern
- ✅ All shape types produce valid deformation output

**Integration:**
- Input: `muscle` + force metrics from Story 2.1
- Output: Deformation values consumed by renderer
- No breaking changes to muscle structure

---

### Story 2.3: Implement Shape Renderer + Integration (3h)

**Description:** Create/enhance `systems/shape-renderer.js` to convert deformation rules → 2D geometry and integrate with existing p5.js rendering.

**Deliverable:**
- `MuscleShapeRenderer` class with:
  - `renderMuscle(p5, muscle, deformationRules, startPos, endPos)` → p5.js shape
  - Support bulging, thinning, spiraling, and striations
  - Integration with existing `p5-fiks-adapter.js` draw loop
  - Optional debug overlay (muscle centerline, force vectors)

**Acceptance Criteria:**
- ✅ Horse muscles render with bulge/thin based on gait phase
- ✅ Lizard tail undulates with visible twist spiral
- ✅ Rendering integrates into existing p5.js sketch without breaking
- ✅ Debug mode shows muscle force vectors and deformation metrics
- ✅ Performance: 60fps with 15-20 muscles visible
- ✅ Visual quality matches Mattesi principles (clear silhouette, force-driven form)

**Integration:**
- Input: Deformation output from Story 2.2
- Draw loop: Call renderer in existing `sketch.js` draw function
- Backward compatible: Existing creatures still work if deformation engine unavailable

---

## Compatibility Requirements

- ✅ **Existing muscle object structure unchanged** — Force analyzer reads from current fields only
- ✅ **Skeleton API unchanged** — Uses existing `getBoneById()`, joint position access
- ✅ **No changes to creature initialization** — Works with auto-generated muscles from Phase 1
- ✅ **p5.js integration non-breaking** — New rendering optional; fallback to existing if needed
- ✅ **Graceful degradation** — If force analyzer unavailable, muscles render at rest state

---

## Risk Mitigation

**Primary Risk:** Deformation calculations may be performance-heavy with many muscles; real-time rendering might not maintain 60fps.

**Mitigation:**
- Implement force analyzer with O(n) complexity (cache calculations per frame)
- Profile rendering path; use p5.js batching/caching if needed
- Start with simplified geometry; optimize if frame rate drops

**Rollback Plan:**
- If integration causes visual regression, disable deformation engine via feature flag
- Existing rendering still works; new code is additive, not replacing

---

## Definition of Done

- ✅ All 3 stories completed with acceptance criteria met
- ✅ Force analyzer calculates correct force metrics (verified by unit tests)
- ✅ Deformation rules follow shape-type specifications exactly
- ✅ Renderer produces smooth, force-driven muscle animations
- ✅ Integration tested with horse (erect_quadruped) and lizard (sprawling_quadruped)
- ✅ No regression in existing creature visualization or locomotion
- ✅ Code follows project style (ES6 classes, JSDoc, 4-space indent)
- ✅ Documentation updated: muscle deformation behavior documented
- ✅ Tests pass: Unit tests for analyzer, rules, renderer

---

## Story Manager Handoff

---

**Please develop detailed user stories for this brownfield epic. Key considerations:**

- This is an enhancement to an existing creature animation system running **p5.js + FIK.js**
- Integration points: 
  - Force analyzer reads skeleton state (bone positions, joint angles)
  - Deformation engine consumes auto-generated muscle objects
  - Renderer integrates into existing p5.js draw loop
- Existing patterns to follow: 
  - Class-based architecture (see `ModularCreatureBuilder`, `ConstraintSystem`)
  - Adapter pattern for external libraries (FIK.js adapter)
  - Strategy pattern for shape types and deformation behaviors
- Critical compatibility requirements:
  - Must not modify existing muscle/skeleton object structures
  - Must integrate cleanly with existing p5.js rendering
  - Must handle all 5 locomotion types correctly
- Each story must include verification that existing functionality remains intact (no regression in creature movement/rendering)

The epic should deliver **force-driven muscle deformation that aligns with Mattesi animation principles** while maintaining system integrity.

---

## Success Criteria for Phase 2

✅ **S1:** Force analyzer correctly calculates muscle ratios and twist angles  
✅ **S2:** Deformation rules follow shape-type specifications exactly  
✅ **S3:** Shape renderer produces smooth, responsive muscle animations  
✅ **S4:** Horse trotting shows realistic muscle bulge/thin cycle  
✅ **S5:** Lizard undulation shows spine twist and high-frequency deformation  
✅ **S6:** 60fps real-time rendering with 15-20 visible muscles  
✅ **S7:** No breaking changes to Phase 1 or existing creature system  
✅ **S8:** Code quality and documentation match project standards  

---

## Timeline

- **Story 2.1 (Force Analyzer):** 2 hours
- **Story 2.2 (Deformation Rules):** 2 hours
- **Story 2.3 (Shape Renderer + Integration):** 3 hours
- **Total Phase 2:** ~7 hours

---

## Architectural Diagram

```
Skeleton State (from locomotion/gait system)
     ↓
[Force Analyzer] → {ratio, twistAngle, compression}
     ↓
[Deformation Rules Engine] → {width, bulgeFactor, spiralOffset}
     ↓
[Shape Renderer] → 2D geometry (p5.js shapes)
     ↓
p5.js Draw Loop → Visual result (animated creature)
```

---

## Phase 2 Enables Phase 3

Once Phase 2 is complete:
- Muscles dynamically respond to locomotion (force-driven)
- Foundation for Phase 3 (decorator system for Madhubani-style visual styling)
- All creature deformation uses same engine (reusable across species)
- Ready for interactive editing: adjust sensitivity/width per shape type

---

**Ready to assign stories to development.**
