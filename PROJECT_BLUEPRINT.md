# AgentKit CLI — Project Blueprint

## Goal

Build an open-source CLI tool that scaffolds an AI-native orchestration layer
on top of any project. Developers run one command and get a structured set of
files that tell Claude Code who to be, what to build, and how to divide work
across specialized agents — including a PLAYBOOK.md that Claude Code reads and
executes autonomously from start to finish, with no manual prompting between agents.

## Features

- Detect the project stack automatically by reading package.json, Cargo.toml,
  src-tauri/, and requirements.txt
- Generate CLAUDE.md adapted to the detected stack (conventions, commands, rules)
- Generate AGENT_WORKFLOW.md as a placeholder — Claude Code fills it during Phase 0
- Generate PLAYBOOK.md with two phases:
    - Phase 0: if a blueprint is provided, Claude Code reads it and decomposes
      the project into agents; if not, Claude Code asks the user three questions
      and decomposes from the answers. Either way, decomposition is validated
      by the human before execution begins.
    - Phase 1: Claude Code executes each agent in sequence, validates success
      criteria, retries on failure (max 3), and escalates to the human if blocked.
- Generate agents/agent-N-slug/ folders with skills.md templates for per-agent
  context injection
- Support --blueprint flag to provide a PROJECT_BLUEPRINT.md
- Support agentkit add --feature to append a new agent and regenerate PLAYBOOK.md
  without Phase 0 (decomposition is already done)
- Support agentkit status to display the current workflow state

## Tech constraints

- Node.js 20+ CLI, published to npm as a scoped package (@patricksardinha/agentkit-cli)
- TypeScript 5, compiled with tsup (ESM + CJS dual output)
- commander.js for CLI parsing, inquirer.js for interactive prompts,
  chalk + ora for terminal output
- Vitest for unit tests
- GitHub Actions for CI/CD — npm publish automatically on tag v*
- No API calls at runtime — all generation is local and static
- No AI integrated in the tool itself — AgentKit is purely structural

## Architecture notes

- One file per command in src/commands/
- One file per stack in src/templates/ (each exports claudeMd(stack) and workflow(stack))
- Generators in src/generators/ compose templates into output files
- Detectors in src/detectors/ are pure functions with no side effects —
  they read the filesystem and return a typed StackInfo object
- All user-facing output goes through src/utils/logger.ts (never console.log directly)
- Every generator has a corresponding test file in tests/generators/
- The stack detector enriches CLAUDE.md with the right commands and conventions —
  the agent decomposition itself is always delegated to Claude Code via Phase 0