// Interface: LocomotionPattern
// Contract for all locomotion patterns used by the builder.
// Implementations live under `locomotion/` and are instantiated via `LocomotionSystem`.
//
// Required shape:
// - constructor(config: object)
// - name: string
// - update(creature: ModularCreatureBuilder, deltaTime: number): void
// - getCycle(): number
//
// Common optional methods used by various patterns:
// - setCreatureConfig(creatureConfig: object): void
// - initializeFootSteps(bodyPosition: {x:number,y:number}, numFeet: number): void
// - getFootTarget(footIndex: number): {x:number,y:number} | null
// - getGroundedFeetCount(): number
// - applyBodyWave(chain, cfg): void            // fish-like
// - applySerpentineMotion(chain, cfg): void    // snake-like
// - getTailTarget(role, ctx): V2
// - getFinTarget(role, ctx): V2
// - getWingTarget(role, ctx): V2
// - getGaitAnalysis(): object                  // quadrupeds
// - transitionToGait(type: 'walk'|'trot'|'gallop'|'pace', manual?: boolean): void
// - toggleAutomaticGaitSwitching(): void
//
// Note: This file documents the interface for editor/IDE and code readers.
// It is not imported at runtime.

