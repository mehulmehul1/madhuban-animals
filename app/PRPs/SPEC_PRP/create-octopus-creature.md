
# PRP Specification: Create Octopus Creature

## State Documentation

current_state:
  files:
    - systems/quadruped-template-system.js
    - locomotion/serpentine-pattern.js
    - creature-builder.js
    - sketch.js
  behavior: The system can create and animate bipedal and quadrupedal creatures. A serpentine locomotion pattern exists but is not fully integrated.
  issues: No support for creatures with a flexible, multi-limbed body like an octopus.

desired_state:
  files:
    - systems/octopus-template-system.js
    - locomotion/octopus-crawl-pattern.js
    - creature-builder.js
    - sketch.js
  behavior: The system can create and animate an octopus with a basic crawling motion, activated by pressing the '5' key.
  benefits: Extends the capabilities of the creature creation system to support a new and interesting type of creature.

## Hierarchical Objectives

1.  **High-Level**: Add a new, fully functional octopus creature to the simulation.
2.  **Mid-Level**:
    - Create the anatomical structure for the octopus.
    - Implement a crawling locomotion pattern for the octopus.
    - Integrate the octopus into the main simulation.
3.  **Low-Level**:
    - Create a new `OctopusTemplateSystem` class.
    - Implement a `createMantle` method in the new class.
    - Implement a `createArm` method in the new class.
    - Create a new `OctopusCrawlPattern` class.
    - Implement the crawling logic in the new pattern.
    - Modify `creature-builder.js` to use the new template.
    - Modify `sketch.js` to activate the octopus with the '5' key.

## Task Specification

- task: CREATE_OCTOPUS_TEMPLATE
  action: CREATE
  file: systems/octopus-template-system.js
  changes: |
    - Create a new `OctopusTemplateSystem` class.
    - Add a `createMantle` method to create the central body.
    - Add a `createArm` method to create a single, segmented arm.
  validation:
    - command: "node -e 'require("./systems/octopus-template-system.js")'"
    - expect: "No errors"

- task: CREATE_OCTOPUS_LOCOMOTION
  action: CREATE
  file: locomotion/octopus-crawl-pattern.js
  changes: |
    - Create a new `OctopusCrawlPattern` class.
    - Implement a crawling pattern that coordinates the movement of eight arms.
  validation:
    - command: "node -e 'require("./locomotion/octopus-crawl-pattern.js")'"
    - expect: "No errors"

- task: INTEGRATE_OCTOPUS
  action: MODIFY
  file: creature-builder.js
  changes: |
    - Import the new `OctopusTemplateSystem`.
    - Add a new case to the main creature creation function to handle the octopus.
  validation:
    - command: "node -e 'require("./creature-builder.js")'"
    - expect: "No errors"

- task: ADD_OCTOPUS_KEYBINDING
  action: MODIFY
  file: sketch.js
  changes: |
    - Add a new case to the `keyPressed` function to check for the '5' key.
    - When the '5' key is pressed, call the creature builder to create the octopus.
  validation:
    - command: "Open minimal-test.html in a browser and press '5'"
    - expect: "An octopus creature is created and animated."

## Implementation Strategy

1.  Implement the `OctopusTemplateSystem`.
2.  Implement the `OctopusCrawlPattern`.
3.  Modify `creature-builder.js` to integrate the new template.
4.  Modify `sketch.js` to add the keybinding.
5.  Test the final implementation in the browser.

## Rollback Plan

- Revert the changes to `creature-builder.js` and `sketch.js`.
- Delete the new `octopus-template-system.js` and `octopus-crawl-pattern.js` files.
