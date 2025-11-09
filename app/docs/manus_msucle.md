# ⚠️ ARCHIVED: Muscle System Documentation

**Status:** SUPERSEDED by `manus_muscle_v2.md`

**See:** `/app/docs/manus_muscle_v2.md` for the current, scalable muscle architecture.

---

## What Changed

The original approach defined **anatomically-named muscles** per creature:
- 11 muscles for horse (Quadriceps, Hamstring, etc.)
- 10 muscles for lizard (Lateral Flexor, Extensor, etc.)
- Not scalable to arbitrary creatures

### New Approach (v2)

- Define **7 reusable muscle shape types** based on force behavior
- Specify **locomotion type** + **skeleton structure**
- Muscles **auto-generate** from those inputs
- Adding a new creature: define skeleton + locomotion type → done

---

## Migration Path

1. Read `manus_muscle_v2.md` for the new architecture
2. Update Phase 1 to reflect shape types instead of anatomical names
3. Refactor `anatomical-configs.js` to use auto-generation
4. Proceed with Phase 2 using new muscle-generator system

---

**This file kept for historical reference only.**
