
# Task: Add Octopus Keybinding

**Action**: MODIFY

**File**: `sketch.js`

**Changes**:

```javascript
// sketch.js

// ... existing code

function keyPressed() {
    // ... existing cases
    if (key === '5') {
        creature = creatureBuilder.createCreature('octopus');
    }
}

// ... existing code
```

**Validation**:

Open `minimal-test.html` in a browser and press the '5' key.

**Expected Outcome**:

An octopus creature is created and animated.
