# FORCE Creature Template-Based Editor Requirements

## Introduction

This document outlines the requirements for rebuilding the Madhuban creature editor as a toggleable mode within the p5.js/FIK.js animation system. The editor enables creation and modification of creatures across four layers: skeleton (modular IK chains), muscle (volumetric shapes), skinning (FORCE-inspired hulls), and styling (Madhubani patterns). The current cluttered implementation will be replaced with a clean, FORCE-principle-driven interface using p5.js native DOM elements for seamless integration.

**Context:** The existing editor has grown to 3000+ lines with cluttered UI. This rebuild focuses on Mike Mattesi's FORCE drawing principles (rhythm, asymmetry, thirds proportions) combined with traditional Madhubani folk art patterns, creating a unique creature design tool that bridges animation and artistic expression.

## Requirements

### Requirement 1: Editor Mode Toggle and Template Selection

**User Story:** As a creature designer, I want to toggle into Editor Mode from the main animation view (via key 'E'), so that I can seamlessly switch between previewing animated creatures and designing new ones without losing the current builder state.

#### Acceptance Criteria

1. WHEN I press 'E' THEN the editor SHALL toggle within 100ms preserving current creature state
2. WHEN entering editor mode THEN locomotion SHALL pause and UI overlay SHALL appear
3. WHEN I see the template gallery THEN it SHALL display FORCE-inspired thumbnails with color-coded anatomical lines (spine in blue, limbs in red)
4. WHEN I select a template (Fish/Biped/Sprawling Quadruped/Erect Quadruped/Arthropod) THEN it SHALL load within 200ms with anatomically correct, asymmetric skeletons
5. IF I have unsaved changes THEN the system SHALL warn before template switching

### Requirement 2: Four-Layer Editing System

**User Story:** As a creature designer, I want to work across four distinct layers (Skeleton, Muscle, Skinning, Styling), so that I can build creatures following FORCE principles with Madhubani artistic styling.

#### Acceptance Criteria

1. WHEN I see the layer tabs THEN they SHALL be clearly labeled: Skeleton (🦴), Muscle (💪), Skinning (🎨), Styling (✨)
2. WHEN I switch layers THEN the active layer SHALL highlight and show relevant tools within 100ms
3. WHEN on Skeleton layer THEN I SHALL see IK chains with color-coded bones (spine blue, limbs red)
4. WHEN on Muscle layer THEN I SHALL see editable volumetric shapes that snap to bone anchors
5. WHEN on Skinning layer THEN I SHALL see FORCE-generated hull outlines with rhythm and asymmetry
6. WHEN on Styling layer THEN I SHALL see Madhubani pattern segments that fill all space

### Requirement 3: Skeleton Layer - Chain Selection and Manipulation

**User Story:** As a creature designer, I want to select and modify skeleton chains with FORCE-aware feedback, so that I can create anatomically correct, rhythmic structures.

#### Acceptance Criteria

1. WHEN I hover over a chain THEN it SHALL highlight with FORCE line visualization (S-curves, asymmetry indicators)
2. WHEN I click a chain THEN it SHALL select with yellow outline and show properties sidebar
3. WHEN I drag bone end-effectors THEN IK SHALL solve in real-time at 30+ FPS with constraint visualization
4. WHEN I modify chain properties THEN I SHALL see FORCE warnings (e.g., "Symmetry detected—add curve?")
5. WHEN I add/remove bones THEN the system SHALL maintain IK integrity and warn of locomotion impacts

### Requirement 4: Muscle Layer - Volumetric Shape Editing

**User Story:** As a creature designer, I want to add and edit volumetric muscle shapes that follow FORCE applied shapes principles, so that I can create dynamic, energy-storing forms that deform during animation.

#### Acceptance Criteria

1. WHEN I switch to Muscle layer THEN I SHALL see editable ellipses/polygons that snap to bone anchors
2. WHEN I add a muscle shape THEN it SHALL limit to 2-4 muscles per chain and auto-merge overlaps
3. WHEN I drag muscle handles THEN shapes SHALL transform (position/scale/rotate) with real-time preview
4. WHEN I adjust deform intensity THEN muscles SHALL show squash/stretch preview (0-100% intensity)
5. WHEN in IK preview mode THEN muscles SHALL deform realistically (compress on energy storage, stretch on release)

### Requirement 5: Skinning Layer - FORCE Hull Generation

**User Story:** As a creature designer, I want auto-generated dynamic hull outlines that follow FORCE rules, so that I can create natural, rhythmic silhouettes without manual drawing.

#### Acceptance Criteria

1. WHEN I switch to Skinning layer THEN the system SHALL auto-generate hull around skeleton/muscles
2. WHEN the hull generates THEN it SHALL alternate straight and curved Bezier segments following FORCE rhythm
3. WHEN I view proportions THEN the system SHALL apply thirds rule (head:body:legs ratios)
4. WHEN symmetry exceeds 90% THEN I SHALL see warnings like "Adjust for asymmetry?"
5. WHEN in motion preview THEN hull SHALL deform smoothly at 60fps maintaining FORCE flow

### Requirement 6: Styling Layer - Madhubani Pattern Application

**User Story:** As a creature designer, I want to apply Madhubani borders and patterns that deform with motion, so that I can create folk-art styled creatures with no empty space.

#### Acceptance Criteria

1. WHEN I apply borders THEN they SHALL generate around hull using existing border.js system
2. WHEN I segment the hull THEN I SHALL divide by body parts or muscle groups with drag refinement
3. WHEN I select patterns THEN I SHALL choose from filler.js options (dots/cross-hatch/florals) with color/density sliders
4. WHEN patterns fill segments THEN there SHALL be no empty space (auto-fill procedural)
5. WHEN in motion preview THEN all styling SHALL deform rhythmically without breaking

### Requirement 7: Configuration Management and Compatibility

**User Story:** As a developer, I want to save and load creature configurations with full layer data, so that I can preserve and share complete FORCE-styled creatures.

#### Acceptance Criteria

1. WHEN I save THEN the system SHALL export JSON with skeleton + muscles + hull params + styling + gaits
2. WHEN I load a configuration THEN all four layers SHALL restore exactly as saved
3. WHEN exporting THEN I SHALL choose formats: complete, skeleton-only, or base template
4. WHEN importing THEN the system SHALL validate compatibility with existing ModularCreatureBuilder
5. IF configuration is invalid THEN I SHALL see specific error messages with suggested fixes

### Requirement 8: p5.js UI Architecture and Performance

**User Story:** As a developer, I want a clean p5.js-native UI architecture that leverages DOM elements efficiently, so that the editor integrates seamlessly with the existing animation system.

#### Acceptance Criteria

1. WHEN I examine the code THEN UI SHALL use p5.js createDiv(), createButton(), createSlider() for native integration
2. WHEN components render THEN they SHALL use absolute positioning to avoid canvas interference
3. WHEN the editor opens THEN UI elements SHALL overlay the canvas without blocking p5.js draw() loop
4. WHEN switching layers THEN only relevant DOM elements SHALL be visible (display: none/block)
5. WHEN editor closes THEN all DOM elements SHALL be properly removed to prevent memory leaks

### Requirement 9: Performance and Responsiveness

**User Story:** As a user, I want the editor to be responsive and performant, so that I can work efficiently without lag during FORCE-based creature editing.

#### Acceptance Criteria

1. WHEN I interact with the UI THEN responses SHALL occur within 100ms
2. WHEN performing IK calculations THEN the frame rate SHALL stay above 30 FPS
3. WHEN the editor is open THEN it SHALL not interfere with creature animation performance
4. IF performance degrades THEN the system SHALL gracefully reduce quality rather than freeze
5. WHEN switching between layers THEN transitions SHALL be smooth and under 200ms

### Requirement 10: Intuitive FORCE-Aware User Experience

**User Story:** As a new user, I want an intuitive interface with FORCE principle guidance, so that I can start creating dynamic creatures without extensive documentation.

#### Acceptance Criteria

1. WHEN I first open the editor THEN the interface SHALL be self-explanatory with FORCE principle hints
2. WHEN I perform an action THEN I SHALL receive appropriate visual feedback and FORCE suggestions
3. WHEN I make an error THEN I SHALL see helpful error messages with FORCE corrections
4. IF I'm unsure what to do THEN tooltips SHALL guide me with FORCE examples (e.g., "Add S-curve for rhythm")
5. WHEN I want to undo an action THEN standard keyboard shortcuts SHALL work (Ctrl+Z, Ctrl+Y)

### Requirement 11: Responsive Design and Touch Support

**User Story:** As a user on different devices, I want the editor to work on various screen sizes with touch-friendly FORCE editing, so that I can create creatures anywhere.

#### Acceptance Criteria

1. WHEN I use the editor on a tablet THEN all four layers SHALL remain accessible with touch gestures
2. WHEN the screen is small THEN the UI SHALL adapt with collapsible panels and layer tabs
3. WHEN using touch input THEN bone dragging and muscle manipulation SHALL work intuitively
4. IF the screen is too small THEN non-essential FORCE hints SHALL hide gracefully
5. WHEN rotating the device THEN the layout SHALL adjust maintaining layer visibility

### Requirement 12: p5.js UI Implementation Strategy

**User Story:** As a developer, I want to implement the editor UI using p5.js native DOM elements with proper layering and event handling, so that the interface integrates seamlessly with the existing canvas-based animation system.

#### Acceptance Criteria

1. WHEN I create UI components THEN they SHALL use p5.js createDiv(), createButton(), createSlider(), createSelect() for native integration
2. WHEN positioning UI elements THEN they SHALL use absolute positioning with z-index layering to overlay the canvas
3. WHEN handling events THEN the system SHALL prevent canvas event conflicts using stopPropagation() and proper event delegation
4. WHEN styling components THEN they SHALL use p5.js .style() method with CSS-in-JS for consistent theming
5. WHEN managing component lifecycle THEN all DOM elements SHALL be properly created, updated, and removed to prevent memory leaks

### Requirement 13: Layer-Specific Tool Integration

**User Story:** As a creature designer, I want each layer to have contextual tools that integrate with existing systems (border.js, filler.js, segmenter.js), so that I can leverage proven functionality while maintaining a unified interface.

#### Acceptance Criteria

1. WHEN on Skeleton layer THEN tools SHALL integrate with existing IK chain manipulation and constraint systems
2. WHEN on Muscle layer THEN tools SHALL use existing shape generation and deformation algorithms
3. WHEN on Skinning layer THEN tools SHALL leverage existing hull generation with FORCE principle validation
4. WHEN on Styling layer THEN tools SHALL integrate border.js, filler.js, and segmenter.js with unified controls
5. WHEN switching layers THEN tool state SHALL persist and restore appropriately for each layer context