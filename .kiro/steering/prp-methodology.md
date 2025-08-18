# PRP Framework Integration for Kiro

## Core Methodology
When generating implementation plans, always follow the PRP (Product Requirement Prompt) framework from this codebase:

### PRP Structure Requirements
- **Goal**: Specific end state and desires
- **Why**: Business value and user impact  
- **What**: User-visible behavior and technical requirements
- **All Needed Context**: Documentation URLs, code examples, gotchas, patterns
- **Implementation Blueprint**: Pseudocode with critical details and task lists
- **Validation Loop**: Executable commands for syntax, tests, integration

### Context Integration Points
- Reference `.claude/commands/PRPs/prp-base-create.md` for research methodology
- Use templates from `PRPs/templates/prp_base.md`
- Include validation gates pattern from existing commands
- Follow existing code conventions found in codebase analysis

### Validation Gates (Must be Executable)
Always include these validation steps:
```bash
# Level 1: Syntax & Style
ruff check --fix && mypy .

# Level 2: Unit Tests  
uv run pytest tests/ -v

# Level 3: Integration
# Add project-specific integration tests
```

### Anti-Patterns to Avoid
- Don't create minimal context prompts - context is everything
- Don't skip validation steps - they're critical for one-pass success
- Don't ignore the structured PRP format - it's battle-tested
- Don't create new patterns when existing templates work

### Success Pattern
**"PRP = PRD + curated codebase intelligence + agent/runbook"**

The goal is one-pass implementation success through comprehensive context and validation.