# AGENT_WORKFLOW.md — @patricksardinha/agentkit-cli

> This file was filled in by Claude Code during Phase 0 — Agent Decomposition.
> It was proposed to the human and validated before execution began.
>
> Original proposal:
> "I have decomposed the project into 4 agents:
>   1. Infra & Setup
>   2. Detectors
>   3. Generators & Templates
>   4. Commands CLI
> Should I proceed?"
>
> Human: "Yes."

---

## Agent 1 · Infra & Setup

**Scope:** scaffold the Node.js/TypeScript project, configure all build
and test tooling, set up GitHub Actions for automated npm publishing.

**Depends on:** nothing — this is the foundation

**Skills:** `agents/agent-1-infra/skills.md`

**Deliverables:**
- `package.json` with all dependencies (commander, inquirer, chalk, ora, tsup, vitest)
- `tsconfig.json` and `tsup.config.ts`
- `vitest.config.ts`
- `.github/workflows/release.yml` — npm publish on `v*` tag push
- `src/utils/logger.ts` — chalk + ora output helpers

**Success criterion:**
```bash
npm run build
```

---

## Agent 2 · Detectors

**Scope:** implement pure detection functions that read a target project
directory and return a typed `StackInfo` object. No filesystem writes,
no side effects.

**Depends on:** Agent 1

**Skills:** `agents/agent-2-detectors/skills.md`

**Deliverables:**
- `src/detectors/stackDetector.ts`
  - Detects: react, nextjs, tauri, fastapi, express, node, unknown
  - Detects extras: typescript, tailwind, prisma, testing
  - Returns a typed `StackInfo` object
- `src/detectors/gitDetector.ts`
  - Returns true if the target directory contains a `.git` folder
- `src/types/stack.ts` — `StackInfo` interface
- `tests/detectors/stackDetector.test.ts` — fixtures for each stack

**Success criterion:**
```bash
npm test
```

---

## Agent 3 · Generators & Templates

**Scope:** implement one template per stack and four generators that compose
them into output files. The `playbookGenerator` is the core deliverable —
it generates Phase 0 (Discovery or Decomposition) and Phase 1 (execution loop).

**Depends on:** Agent 2

**Skills:** `agents/agent-3-generators/skills.md`

**Deliverables:**
- `src/templates/` — one file per stack: react, nextjs, tauri, fastapi, express, node, unknown
  - Each exports `claudeMd(stack: StackInfo): string` and `workflow(stack: StackInfo): string`
- `src/generators/claudeMdGenerator.ts` — routes to the right template
- `src/generators/workflowGenerator.ts` — routes + returns `Agent[]`
- `src/generators/playbookGenerator.ts`
  - `hasBlueprint: true` → Phase 0 reads PROJECT_BLUEPRINT.md
  - `hasBlueprint: false` → Phase 0 asks the user three questions
  - Phase 1 always present with retry logic and human escalation
- `src/generators/skillsGenerator.ts` — creates `agents/agent-N-slug/skills.md`
- `src/types/agent.ts` — `Agent` interface
- `tests/generators/*.test.ts` — one test file per generator

**Success criterion:**
```bash
npm test
```

---

## Agent 4 · Commands CLI

**Scope:** wire all generators and detectors into the three CLI commands
using commander.js. This agent composes existing modules — it writes no
business logic.

**Depends on:** Agents 2 and 3

**Skills:** `agents/agent-4-commands/skills.md`

**Deliverables:**
- `src/commands/init.ts`
  - Detects stack with `stackDetector`
  - Accepts `--blueprint <path>` — reads file, warns if path missing
  - Calls all four generators in order
  - Writes CLAUDE.md, AGENT_WORKFLOW.md, PLAYBOOK.md to project root
  - Calls `skillsGenerator` to create `agents/` folder structure
  - Never overwrites existing files without `--force`
- `src/commands/add.ts`
  - Accepts `--feature <description>`
  - Reads existing AGENT_WORKFLOW.md to find last agent number
  - Appends new agent block, creates `agents/agent-{N+1}-{slug}/skills.md`
  - Regenerates PLAYBOOK.md **without Phase 0** (`hasBlueprint: false`)
- `src/commands/status.ts`
  - Reads AGENT_WORKFLOW.md and displays current state
- `src/cli.ts` — registers all three commands with commander
- `tests/commands/init.test.ts`

**Success criterion:**
```bash
npm run build && node dist/cli.js --help
```