\## 6) Configuration \& Data Model



To enable modularity and tooling, formalize configs as JSON with a schema (draft):



```json

{

&nbsp; "$schema": "https://example.com/creature.schema.json",

&nbsp; "type": "object",

&nbsp; "required": \["id", "anatomy", "locomotion"],

&nbsp; "properties": {

&nbsp;   "id": { "type": "string" },

&nbsp;   "anatomy": {

&nbsp;     "type": "object",

&nbsp;     "properties": {

&nbsp;       "spine": { "type": "object", "properties": { "segments": { "type": "integer" }, "flex": { "type": "number" } } },

&nbsp;       "legs": { "type": "array", "items": { "type": "object", "properties": { "segments": { "type": "integer" }, "attach": { "type": "string" } } } },

&nbsp;       "wings": { "type": "array" },

&nbsp;       "fins":  { "type": "array" },

&nbsp;       "tail":  { "type": "object", "properties": { "segments": { "type": "integer" } } }

&nbsp;     }

&nbsp;   },

&nbsp;   "locomotion": {

&nbsp;     "type": "object",

&nbsp;     "properties": {

&nbsp;       "pattern": { "enum": \["quadruped", "bipedal", "serpentine", "undulate"] },

&nbsp;       "gait": { "enum": \["walk", "trot", "gallop", null] },

&nbsp;       "speed": { "type": "number" }

&nbsp;     }

&nbsp;   },

&nbsp;   "render": { "type": "object", "properties": { "mode": { "enum": \["skeleton", "current"] }, "theme": { "type": "string" } } }

&nbsp; }

}

```



\*\*Authoring guidance\*\*



\* Define species in `creatures/<species>.json` referencing shared templates

\* Prefer data-driven attachment points (e.g., `attach: "spine:T3"`) over code constants



---
