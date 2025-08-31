\## 8) Target Modular Architecture



\### 8.1 Package/Folder Layout



```

src/

&nbsp; core/

&nbsp;   creature-builder.ts

&nbsp;   types.ts

&nbsp; systems/

&nbsp;   anatomy/

&nbsp;     data/

&nbsp;     configs/

&nbsp;     bone-template-system.ts

&nbsp;     constraint-system.ts

&nbsp;     shape-profile-system.ts

&nbsp;   locomotion/

&nbsp;     locomotion-system.ts

&nbsp;     patterns/

&nbsp;       quadruped-gait.ts

&nbsp;       bipedal-walk.ts

&nbsp;       serpentine.ts

&nbsp;       undulate.ts

&nbsp; styling/

&nbsp;   theme-manager.ts

&nbsp;   border-decorator.ts

&nbsp;   fillers.ts

&nbsp;   segmenter.ts

&nbsp; debug/

&nbsp;   debug-manager.ts

&nbsp; creatures/

&nbsp;   horse.json

&nbsp;   lizard.json

&nbsp;   deer.json

&nbsp;   elephant.json

&nbsp; adapters/

&nbsp;   p5-renderer.ts

&nbsp;   fik-adapter.ts

&nbsp; demos/

&nbsp;   horse-vs-lizard.sketch.ts



index.html

```



\### 8.2 Public API (minimal)



```ts

class CreatureBuilder {

&nbsp; constructor(opts?: { renderer?: Renderer; ik?: IKAdapter })

&nbsp; load(speciesConfig: CreatureConfig): void

&nbsp; setRenderMode(mode: 'skeleton'|'current'): void

&nbsp; setLocomotion(pattern: Pattern, gait?: Gait): void

&nbsp; update(dt: number): void

&nbsp; draw(): void

}

```



\### 8.3 Boundaries \& Contracts



\* \*\*Builder ⇄ Locomotion\*\*: builder provides limb endpoints \& phase; locomotion provides per-frame targets and gait transitions

\* \*\*Builder ⇄ Constraint/IK\*\*: builder delegates joint solving to IK adapter (FIK)

\* \*\*Renderer\*\* isolated behind adapter (p5 today, open to Pixi/WebGL tomorrow)

\* \*\*Configs\*\* are validated at load time (JSON schema) and compiled into internal structures



---
