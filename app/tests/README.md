# Test Files Directory

This directory contains all test files for the Madhuban Animals project. Each test file focuses on specific features or bug fixes developed during the project.

## 📁 Test File Organization

### 🔧 Debug System Tests
- **`test_debug_fix.html`** - Quick test for DebugManager loading issues
- **`test_debug_loading.html`** - Comprehensive script loading validation
- **`test_unified_debug_system.html`** - Full unified debug system integration test

### 🐎 Gait System Tests
- **`test_trot_gait.html`** - Basic diagonal pair testing for trot gait
- **`test_complete_trot_system.html`** - Complete trot implementation with all 4 subtasks
- **`test_proper_walk_gait.html`** - 4-beat walk gait validation
- **`hybrid_gait_system.html`** - Hybrid gait system experiments

### 🚶 Movement System Tests
- **`test_movement_fixes.html`** - 2D canvas movement system validation
- **`diagonal_movement_fix.html`** - Diagonal movement bug fixes
- **`test_chassis_system.html`** - Fixed chassis system (car-like wheelbase)
- **`two_bipeds_system.html`** - Bipedal locomotion system testing

### 🦴 Anatomy & Structure Tests
- **`test_anatomical_fixes.html`** - Anatomical proportion and posture testing
- **`simplified_quadruped_test.html`** - Simplified quadruped movement testing
- **`verify_simplified_mode.html`** - Mode verification and validation

### 🔧 General System Tests
- **`test_fix.html`** - General bug fixes and system validation
- **`test_organization_verification.html`** - Verify test file organization and script loading
- **`test_template.html`** - Template for creating new test files

## 🧪 How to Use Test Files

### Running Tests
1. **Navigate to the tests folder**: `cd tests/`
2. **Open any test file** in your web browser
3. **Follow on-screen instructions** for each specific test
4. **Check browser console** for detailed test results

### Test File Conventions
- All test files include **detailed instructions** in the HTML interface
- **Console logging** provides technical details and debug information
- **Visual indicators** show test status (✅ PASS / ❌ FAIL)
- **Keyboard controls** are documented in each test interface

### Common Controls Across Tests
- **`D`** - Toggle debug information
- **`1-4`** - Switch between creatures (Fish, Crane, Horse, Lizard)
- **`W`** - Walk gait (for quadrupeds)
- **`T`** - Trot gait (for quadrupeds)
- **`S`** - Toggle skeleton overlay
- **`Space`** - Run automated test sequences (when available)

## 📊 Test Categories

### ✅ Completed Features (Green)
Tests for features that are fully implemented and working:
- Unified debug system
- Trot gait with diagonal pairs
- Walk gait with 4-beat sequence
- 2D movement system
- Chassis system

### 🚧 In Progress (Yellow)
Tests for features currently being developed:
- Anatomical specialization
- Enhanced skeleton visualization

### 🔴 Legacy/Deprecated (Red)
Older test files kept for reference:
- Some early movement fix tests
- Simplified mode experiments

## 🎯 Test Development Guidelines

When creating new test files:

1. **Save in `/tests/` folder** - All test files go here
2. **Use descriptive naming**: `test_[feature_name].html`
3. **Include comprehensive instructions** in the HTML interface
4. **Add console logging** for technical validation
5. **Document test purpose** in this README
6. **Test file paths** use `../` to reference main project files

### Example Test File Structure
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test: [Feature Name]</title>
    <!-- Instructions panel -->
    <div>Test instructions and expected behaviors</div>
</head>
<body>
    <!-- Load main project scripts with ../ prefix -->
    <script src="../FIK.js"></script>
    <script src="../systems/debug-manager.js"></script>
    <!-- Test-specific code -->
</body>
</html>
```

## 📈 Test Results History

### Major Test Milestones
- **✅ 2025-01-06**: Debug system consolidation - All tests passing
- **✅ 2025-01-06**: Trot gait implementation - All 4 subtasks complete
- **✅ 2025-01-06**: Movement system fixes - 2D canvas movement working
- **✅ 2025-01-06**: Chassis system - No leg crossing, anatomical spacing

### Performance Benchmarks
- **Target FPS**: 60fps maintained across all tests
- **Load Time**: < 2 seconds for test file initialization
- **Debug Overhead**: < 5% performance impact when debug enabled

## 🔧 Troubleshooting Test Issues

### Common Issues
1. **Script Loading Errors**: Check that `../` paths are correct
2. **Debug Panel Not Showing**: Verify debug-manager.js loads properly
3. **Gait Issues**: Ensure creature type supports the gait being tested
4. **Performance Issues**: Check browser console for warnings

### Getting Help
- Check browser console for detailed error messages
- Compare working test files for reference
- Ensure all dependencies are loaded in correct order

---

**Last Updated**: January 6, 2025  
**Total Test Files**: 18 (16 feature tests + 1 template + 1 verification)  
**Test Coverage**: Debug System, Gait Analysis, Movement, Anatomy, General System Validation