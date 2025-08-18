
# Task: Create Octopus Template

**Action**: CREATE

**File**: `systems/octopus-template-system.js`

**Changes**:

```javascript
// systems/octopus-template-system.js

class OctopusTemplateSystem {
    constructor(builder) {
        this.builder = builder;
    }

    createMantle(config) {
        // Create the central body of the octopus
    }

    createArm(config) {
        // Create a single, segmented arm
    }
}
```

**Validation**:

```bash
node -e 'require("./systems/octopus-template-system.js")'
```

**Expected Outcome**:

No errors.
