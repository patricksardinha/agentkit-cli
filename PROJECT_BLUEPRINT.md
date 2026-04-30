# AgentKit CLI — Project Blueprint

## Goal

Build an open-source CLI tool that scaffolds an AI-native orchestration layer
on top of any existing project. Developers run one command and get a structured
set of files that tell Claude Code who to be, what to build, and how to divide
work across specialized agents — including a PLAYBOOK.md that Claude Code
executes autonomously from start to finish.

## Features

- Auto-detect the project stack by reading package.json, Cargo.toml,
  requirements.txt, and directory structure
- Generate CLAUDE.md adapted to the detected stack and conventions
- Generate AGENT_WORKFLOW.md with specialized agents and verifiable
  success criteria
- Generate PLAYBOOK.md — a single file Claude Code reads and executes
  autonomously, with retry logic and human escalation rules
- Generate agents/agent-N-slug/ folders with skills.md templates
  for per-agent context injection
- Support --blueprint flag to read a PROJECT_BLUEPRINT.md and generate
  agents tailored to specific features instead of generic stack defaults
- Support agentkit add --feature to append a new agent to an existing
  workflow and regenerate PLAYBOOK.md
- Support agentkit status to display the current workflow state

## Tech constraints

- Node.js 20+ CLI, published to npm as a scoped package
- TypeScript 5, compiled with tsup (ESM + CJS dual output)
- commander.js for CLI parsing, inquirer.js for prompts,
  chalk + ora for output
- Vitest for tests
- GitHub Actions for CI/CD — npm publish on tag v*
- Zero runtime dependencies beyond the CLI framework
- No API calls at runtime — all generation is local and static

## Architecture notes

- One file per command in src/commands/
- One file per stack in src/templates/
- Generators in src/generators/ call templates and compose output
- Detectors in src/detectors/ are pure functions with no side effects
- All user-facing output goes through src/utils/logger.ts
- Every generator has a corresponding test file in tests/generators/
