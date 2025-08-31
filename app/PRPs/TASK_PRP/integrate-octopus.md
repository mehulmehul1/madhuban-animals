
# Task: Integrate Octopus

**Action**: MODIFY

**File**: `creature-builder.js`

**Changes**:

```javascript
// creature-builder.js

// ... existing imports
import { OctopusTemplateSystem } from './systems/octopus-template-system.js';

// ... existing code

    createCreature(type) {
        switch (type) {
            // ... existing cases
            case 'octopus':
                return this.createOctopus();
        }
    }

    createOctopus() {
        const octopusTemplate = new OctopusTemplateSystem(this);
        // ... build the octopus
    }

// ... existing code
```

**Validation**:

```bash
node -e 'require("./creature-builder.js")'
```

**Expected Outcome**:

No errors.
