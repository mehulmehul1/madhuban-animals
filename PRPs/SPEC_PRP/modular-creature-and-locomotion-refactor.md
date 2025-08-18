# SPEC PRP: Modular Creature Builder and Locomotion Refactor

## Specification

Refactor the Modular Creature Builder into a schema-driven, morphology-aware system enabling easy creation of any creature via data, and implement locomotion controllers for erect quadrupeds, sprawling quadrupeds, bipeds, serpentine, fish, and cephalopods. Complete octopus integration. Improve lizard gait to a true sprawling walk. Unify and polish locomotion with support-polygon stabilization and clean debug.

## Current State Assessment

- files:
  - `creature-builder.js`: Method-per-creature builds, modular templates and constraints; unified DebugManager; locomotion update strategies by chain `type` and `role`.
  - `systems/*`: anatomical-data/configs; bone-template-system; quadruped-template-system; constraint-system; shape-profile/shape-generation.
  - `locomotion/*`: `locomotion-system`, `locomotion-pattern` base; `quadruped-gait` (walk/trot/pace/gallop, Froude transitions); `bipedal-walk-pattern`; `undulate-pattern`; `serpentine-pattern`; `octopus-crawl-pattern` (stub); no cephalopod controller.
  - `systems/octopus-template-system.js`: mantle/arm chain creation; arms attach to single mantle index.
- behavior:
  - Chains are created from role templates, constraints applied from species data. Gaits produce foot targets; builder solves chains each frame. Debug is centralized.
- issues:
  - Not fully schema-driven; adding creatures requires code edits.
  - Sprawling quadruped uses erect assumptions; lizard gait not morphology-accurate.
  - Octopus lacks controller; arms not distributed around mantle; `arm` type unsupported in update strategy.
  - Skinning/outline pipeline is basic; width profiles exist but envelope is WIP.

## Desired State

```yaml
current_state:
  files: [creature-builder.js, systems/*.js, locomotion/*.js, systems/octopus-template-system.js]
  behavior: [role-based chains, mixed locomotion controllers, centralized debug]
  issues: [no schema loader, lizard gait wrong, octopus incomplete, skinning basic]

desired_state:
  files:
    - loader: systems/creature-schema-loader.js
    - schemas: data/creatures/{horse,lizard,crane,fish,octopus}.json
    - locomotion: locomotion/{biped,erect-quadruped,sprawling-quadruped,serpentine,aquatic,cephalopod}.js
    - builder: refactored to support `type: 'arm'`, schema loading, morphology map
  behavior:
    - Load creatures from JSON schemas; build chains via templates; constraints by profile; render skinned outlines
    - Morphology-specific controllers with shared FootPlanner/BodyStabilizer/TransitionManager
    - Octopus crawl works with alternating arm anchors; arms evenly distributed around mantle
    - Lizard shows proper sprawling gait with coordinated spine undulation
  benefits:
    - Add new creatures without code changes; correctness and reuse; clean debug; stable gaits
```

## Hierarchical Objectives

1. High-Level
   - Data-first creature definition; morphology-aware locomotion; complete octopus; fix sprawling gait.
2. Mid-Level
   - Schema loader + example schemas
   - Add `arm` chain strategy + cephalopod controller
   - Sprawling quadruped controller and lizard tune-up
   - Morphology profiles + controller map
   - Optional: support polygon stabilizer
3. Low-Level Tasks
   - See Task Specification

## Task Specification (information-dense)

schema_loader:
  action: CREATE
  file: systems/creature-schema-loader.js
  changes: |
    - Export loadCreatureFromSchema(schema, builder)
    - Validate schema; create chain configs; resolve attachments; call builder.addChain
    - Apply morphology profile and map locomotion controller
  validation:
    - command: Open minimal-test.html and load horse.json; expect identical to buildHorse()

arm_type_support:
  action: MODIFY
  file: creature-builder.js
  changes: |
    - In getChainUpdateStrategy: add case for type 'arm' calling controller.getArmTarget(role, ctx)
    - Ensure no regression for other types
  validation:
    - command: index.html; press 5 (octopus); no errors in console; arms solve to targets

cephalopod_controller:
  action: CREATE
  file: locomotion/cephalopod-crawl.js
  changes: |
    - Class CephalopodCrawlController extends LocomotionPattern
    - Manage alternating anchors vs swing arms; provide getArmTarget, update body toward anchor centroid
  validation:
    - command: index.html; octopus advances slowly with arm cycling; Debug shows anchor/swing counts

octopus_arm_distribution:
  action: MODIFY
  file: systems/octopus-template-system.js
  changes: |
    - Distribute 8 arms around mantle by angle; map angle→bone index by arc length/t parameter
    - Store per-arm role (arm-0..arm-7) for controller addressing
  validation:
    - command: index.html; arms placed around mantle; no overlaps

sprawling_gait_controller:
  action: CREATE
  file: locomotion/sprawling-quadruped-gait.js
  changes: |
    - Class SprawlingQuadrupedGaitController with lateral sequence, low lift, horizontal sweep
    - Home positions from spine attachments; couple to spine undulation; body COM low and rolling slightly
  validation:
    - command: index.html; select lizard; observe true sprawling gait; grounded feet ≥2; proper sequence

lizard_morphology_tune:
  action: MODIFY
  file: systems/anatomical-data.js
  changes: |
    - Adjust leg segment ratios, abduction ranges, sprawlAngle; verify shoulder/hip constraints wide
  validation:
    - command: tests/test_lizard_sprawling_posture.html; visual posture matches sprawling anatomy

morphology_map:
  action: CREATE
  file: systems/morphology-profiles.js
  changes: |
    - Map creatureType→morphology profile
    - Map morphology→default locomotion controller
  validation:
    - command: tests/test_template.html loads each schema and correct controller is selected

support_polygon_stabilizer:
  action: CREATE
  file: locomotion/support-polygon.js
  changes: |
    - Compute support polygon from grounded feet; compute COM; adjust body Y/R gently toward stable region
  validation:
    - command: tests/test_proper_walk_gait.html; body height stable; no oscillatory drift

circle_tangent_skinning_mvp:
  action: CREATE
  file: systems/skin-envelope.js
  changes: |
    - Given chain bones + radius profile, compute bilateral tangent outline; return polygon
  validation:
    - command: minimal-test.html; outline follows chain smoothly; no self-intersections on moderate curves

## Implementation Strategy

- Dependencies
  - arm_type_support before cephalopod_controller and octopus_arm_distribution
  - sprawling_gait_controller before lizard_morphology_tune validation
  - morphology_map before schema_loader demo
- Order
  1) arm_type_support
  2) cephalopod_controller
  3) octopus_arm_distribution
  4) sprawling_gait_controller
  5) lizard_morphology_tune
  6) morphology_map
  7) schema_loader + schemas
  8) support_polygon_stabilizer (optional)
  9) circle_tangent_skinning_mvp (optional)
- Rollback
  - Feature-flag new controllers; keep old QuadrupedWalkPattern as fallback
  - Keep buildHorse/buildLizard methods until schema parity
  - Guard new files with safe defaults if missing
- Progressive enhancement
  - Start with minimal cephalopod (2–3 arms anchor), then scale to 8
  - Start with simple stabilizer (avg of grounded feet), then polygon

## Risks & Mitigations

- Risk: Gait regressions
  - Mitigation: Keep current controllers; A/B via feature flags per creature
- Risk: Performance dips
  - Mitigation: lightweight controllers; throttle debug; avoid allocations in loops
- Risk: Attachment resolution bugs
  - Mitigation: unit harness with synthetic parent chains; visual tests

## Validation Gates

- Manual tests (existing in `/tests`): walk/trot gait, anatomical posture, debug loading
- New HTML harnesses: `tests/test_lizard_sprawling_posture.html`, `tests/test_cephalopod.html`, `tests/test_schema_loader.html`
- Editor regression: press E; editor overlay still works; no interference

## Output

Save as: `SPEC_PRP/PRPs/modular-creature-and-locomotion-refactor.md`

## Quality Checklist

- [x] Current state fully documented
- [x] Desired state clearly defined
- [x] Objectives measurable
- [x] Tasks ordered by dependency
- [x] Each task has validation
- [x] Risks identified
- [x] Rollback strategy included
- [x] Integration points noted
