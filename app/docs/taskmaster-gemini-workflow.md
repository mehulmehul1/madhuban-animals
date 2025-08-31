---
description: Guide for using Gemini as the engine for the Taskmaster development workflow.
globs: "**/*"
alwaysApply: true
---

# Gemini-Powered Taskmaster Workflow

This document outlines our collaborative process for task-driven development. In this workflow, I, Gemini, will act as the "Taskmaster." I will manage the project's state by directly reading from and writing to the `.taskmaster/tasks/tasks.json` file, using my own native tools and AI capabilities. This approach eliminates the need for the external `task-master-ai` CLI tool and its associated API keys.

Our workflow is based on the core principles of the original Taskmaster documentation but is adapted for our direct interaction.

## Core Principle: State in `tasks.json`

Our single source of truth is the `.taskmaster/tasks/tasks.json` file. I will manage all tasks, subtasks, dependencies, statuses, and tags by manipulating this file directly.

## Emulating the Taskmaster Commands

Here is how we will replicate the functionality of the `task-master` CLI commands:

*   **To Initialize a Project (`init` / `parse_prd`):**
    *   **Your Role:** Provide me with a Product Requirements Document (PRD), a high-level goal, or a simple prompt describing the project.
    *   **My Role:** I will analyze your input and generate the initial `.taskmaster/tasks/tasks.json` file, populating it with a structured list of tasks under the default `master` tag.

*   **To List Tasks (`list` / `show`):**
    *   **Your Role:** Ask me to "list the tasks," "show me task 5," or "what's the status of the project?"
    *   **My Role:** I will read the `tasks.json` file, parse its contents, and present the information to you in a clear, formatted, and easy-to-read way.

*   **To Get the Next Task (`next`):**
    *   **Your Role:** Ask, "What should I work on next?" or simply, "next?"
    *   **My Role:** I will perform a reasoning task by reading `tasks.json`. I will analyze dependencies and task statuses to identify the next logical task that is ready for implementation and present it to you.

*   **To Expand a Task (`expand`):**
    *   **Your Role:** Tell me, "Expand task 3" or "Break down the authentication task."
    *   **My Role:** I will read the specified task from `tasks.json`. Using my AI capabilities, I will generate a detailed list of subtasks and write them directly into the `tasks.json` file, updating the parent task.

*   **To Update Progress (`update_subtask` / `update_task`):**
    *   **Your Role:** Provide me with progress updates, code snippets, or logs. For example: "I've finished the database schema for task 2.1. Here is the code..." or "Log this finding for task 4.2..."
    *   **My Role:** I will read `tasks.json`, find the relevant task or subtask, and append your notes with a timestamp to its `details` field. This creates a permanent, auditable log of our work.

*   **To Set Status (`set-status`):**
    *   **Your Role:** Say, "Mark task 2.1 as done," or "Set task 5 to 'in-progress'."
    *   **My Role:** I will modify the `status` field for the specified task(s) in the `tasks.json` file.

*   **To Research (`research`):**
    *   **Your Role:** Ask me to research a topic for a specific task. For example: "For task 3, research the best way to implement OAuth2 with Node.js."
    *   **My Role:** I will use my internal knowledge and, if necessary, the `google_web_search` tool to find the information. I will then format the findings and log them against the specified task using our `update_subtask` workflow.

*   **To Manage Tags (`add-tag`, `use-tag`, etc.):**
    *   **Your Role:** Tell me, "Create a new tag called 'feature/new-dashboard'," or "Switch to the 'refactor-api' tag."
    *   **My Role:** I will manage the tags by directly manipulating the top-level structure within the `tasks.json` file, creating, deleting, or switching the `currentTag` in the `.taskmaster/state.json` file as needed.

## Our Collaborative Workflow

1.  **Define the Goal:** You provide the initial project requirements.
2.  **Task Generation:** I create the `tasks.json` file.
3.  **Work Cycle:**
    *   You ask for the `next` task.
    *   We `expand` it if necessary.
    *   You work on the implementation.
    *   You `update` me with your progress, and I log it.
    *   We mark the task as `done`.
4.  **Repeat.**

This document will be our guide. Let's begin!