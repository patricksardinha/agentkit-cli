# AgentKit CLI

> Bootstrap your projects with an AI-native orchestration layer — like `create vite@latest`, but for agentic development with Claude Code.

[![npm version](https://img.shields.io/npm/v/agentkit-cli)](https://www.npmjs.com/package/agentkit-cli)
[![license](https://img.shields.io/npm/l/agentkit-cli)](./LICENSE)
[![built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-7c3aed)](https://claude.ai/code)

---

## What is AgentKit?

When you run `npm create vite@latest`, it scaffolds a complete React (or Vue, Svelte…) project in seconds — giving you a working structure you can build on immediately instead of configuring everything from scratch.

**AgentKit does the same thing, but for AI-native development.**

It scaffolds the *orchestration layer* that sits on top of any project: the files that tell Claude Code **who** to be, **what** to build, and **how** to divide the work across specialized agents.

```
Without AgentKit                 With AgentKit
────────────────                 ──────────────────────────────
my-project/                      my-project/
├── src/                         ├── src/
├── package.json                 ├── package.json
└── README.md                    ├── README.md
                                 ├── CLAUDE.md          ← generated
                                 └── AGENT_WORKFLOW.md  ← generated
```

You open Claude Code, and instead of spending the first 30 minutes explaining your stack and conventions, you just say: **"Read CLAUDE.md and AGENT_WORKFLOW.md, then run Agent 1."**

---

## The Problem It Solves

Most developers using Claude Code today work with a single, long-running conversation. They describe what they want, Claude builds it, they correct, they prompt again. This works — but it has limits:

- **Context gets polluted** — one agent accumulates unrelated concerns
- **No reusability** — you re-explain conventions on every project
- **No parallelism** — everything is sequential because there's no coordination layer
- **No audit trail** — no document captures the decisions made

AgentKit introduces a **structured orchestration layer** that solves all four problems. Your project gets two new files — `CLAUDE.md` and `AGENT_WORKFLOW.md` — that act as standing instructions for a team of specialized agents.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  Developer runs: npx agentkit init                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  AgentKit CLI                                                   │
│                                                                 │
│  1. Scans the project directory                                 │
│     → reads package.json, Cargo.toml, requirements.txt…         │
│                                                                 │
│  2. Detects the stack                                           │
│     → React · Next.js · Tauri · FastAPI · Express · Node        │
│     → TypeScript? Tailwind? Prisma? Testing setup?              │
│                                                                 │
│  3. Generates adapted files                                     │
│     → CLAUDE.md    (conventions, stack, commands, rules)        │
│     → AGENT_WORKFLOW.md  (agents, scope, success criteria)      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  Your project — ready for agentic development                   │
│                                                                 │
│  Developer opens Claude Code and runs agents one by one:        │
│                                                                 │
│  Agent 1 → Infra & Setup     (success: project builds)          │
│      ↓                                                          │
│  Agent 2 → Core Feature A    (success: tests pass)              │
│      ↓                                                          │
│  Agent 3 → Core Feature B    (success: tests pass)              │
│      ↓                                                          │
│  Agent 4 → Docs & Deploy     (success: CI/CD green)             │
│                                                                 │
│  Human validates each success criterion before the next agent.  │
└─────────────────────────────────────────────────────────────────┘
```

### The two generated files

**`CLAUDE.md`** — the standing brief for every agent. It answers:
- What is this project and what stack does it use?
- What are the absolute rules (naming conventions, forbidden patterns, testing requirements)?
- What commands exist and what do they do?
- What does "done" look like?

**`AGENT_WORKFLOW.md`** — the project roadmap, broken into agent-sized tasks. Each agent entry specifies:
- Its scope (what it touches)
- Its dependencies (which agent must finish first)
- Its deliverables (what files it produces)
- Its success criterion (a verifiable, runnable check)

---

## Quickstart

```bash
# In any project directory (empty or existing)
npx agentkit init
```

That's it. AgentKit detects your stack and writes the two files.

```bash
# Add a new specialized agent to an existing workflow
npx agentkit add agent

# Check the status of your agent workflow
npx agentkit status
```

---

## Supported Stacks

| Stack | Detected by | Template features |
|---|---|---|
| **React** | `react` in `package.json` | TypeScript/JS, Vite, testing setup |
| **Next.js** | `next` in `package.json` | App Router, Tailwind, Prisma (if present) |
| **Tauri** | `src-tauri/` directory | Rust backend, IPC commands, Tauri plugins |
| **FastAPI** | `fastapi` in `requirements.txt` | Python, Pydantic, async patterns |
| **Express** | `express` in `package.json` | REST API, middleware, auth patterns |
| **Node.js** | `package.json` (generic) | Scripts, modules, CI/CD |
| **Unknown** | fallback | Generic workflow, manually editable |

Stack detection is additive — extras like TypeScript, Tailwind, and Prisma are detected on top of the primary framework and enrich the generated templates accordingly.

---

## Example Output

### For a React + TypeScript project

`npx agentkit init` in a React/TypeScript/Vite project generates:

```markdown
# CLAUDE.md — my-app

## Stack
- Framework : React (TypeScript)
- Language  : TypeScript
- Build     : Vite

## Commands
- `npm run dev`    — development server
- `npm run build`  — production build
- `npm test`       — run tests

## Structure
src/
  components/   ← UI components (PascalCase)
  hooks/        ← custom hooks (prefix: use*)
  pages/        ← page-level components
  utils/        ← shared helpers

## Conventions
1. Components in PascalCase
2. Hooks prefixed with `use`
3. Props interfaces named `*Props`
4. All console output through a centralized logger
```

```markdown
# Agent Workflow — my-app

## Agents

### Agent 1 · Components
Scope    : reusable UI components
Delivers : src/components/
Criteria : components documented and tested

### Agent 2 · State & Hooks
Scope    : state management, custom hooks
Delivers : src/hooks/
Criteria : hooks unit-tested

### Agent 3 · Pages & Routing
Scope    : page assembly, react-router
Delivers : src/pages/
Criteria : navigation working

### Agent 4 · Tests & CI
Scope    : test coverage, CI configuration
Delivers : tests/, .github/workflows/
Criteria : npm test passes
```

### For a Tauri project (more complex detection)

A project with `src-tauri/` gets a richer workflow that accounts for the Rust/JS boundary, IPC commands, plugin permissions, and the dual build system:

```markdown
# Agent Workflow — my-desktop-app

### Agent 1 · Rust Commands
Scope    : Tauri commands (IPC), permissions
Delivers : src-tauri/src/commands.rs, tauri.conf.json
Criteria : `cargo build` passes

### Agent 2 · Frontend UI
Scope    : TypeScript UI, IPC integration
Delivers : src/components/, src/utils/
Criteria : IPC calls functional

### Agent 3 · Build & Packaging
Scope    : build config, icons, installers
Delivers : src-tauri/tauri.conf.json, icons/
Criteria : `npm run tauri build` produces a bundle

### Agent 4 · Tests
Scope    : Rust tests + frontend tests
Delivers : src-tauri/tests/, tests/
Criteria : `cargo test` + `npm test` pass
```

---

## Design Philosophy

### Why not just use a prompt template?

A prompt template lives in your head (or your notes). It gets copy-pasted, drifts between projects, and is lost the moment you close the conversation.

`CLAUDE.md` and `AGENT_WORKFLOW.md` are **project artifacts**. They live in the repo, they're versioned, they're readable by every agent in every session, and they can be reviewed in a pull request like any other code.

### Why separate agents instead of one big conversation?

Each agent has a **bounded context** — it only knows what it needs to know. This has three effects:

1. **Better output** — an agent focused solely on testing isn't distracted by infrastructure concerns
2. **Human checkpoints** — you validate a success criterion before the next agent starts, catching errors early
3. **Parallelism** — once dependencies are met, agents that don't depend on each other can run simultaneously

### Why verifiable success criteria?

Every agent in `AGENT_WORKFLOW.md` ends with a criterion like `npm test passes` or `cargo build passes`. These aren't goals — they're **gates**. If the criterion isn't met, you don't prompt the next agent. This makes the workflow deterministic and auditable.

---

## Meta: How AgentKit Was Built

AgentKit CLI was built using the same workflow it generates.

The repo contains a `CLAUDE.md` and `AGENT_WORKFLOW.md` that describe how to build the CLI itself. Four specialized agents were used in sequence:

```
Agent 1 · Infra & Setup
  → package.json, tsconfig, tsup, vitest, GitHub Actions
  → success: npm run build passes

Agent 2 · Detectors
  → src/detectors/stackDetector.ts, gitDetector.ts
  → success: npm test passes on project fixtures

Agent 3 · Generators & Templates
  → src/generators/, src/templates/ (one per stack)
  → success: valid files generated for each supported stack

Agent 4 · Commands CLI
  → src/commands/init.ts, add.ts, status.ts, src/cli.ts
  → success: npx agentkit --help shows all commands
```

The `CLAUDE.md` and `AGENT_WORKFLOW.md` at the root of this repo are the exact files that drove this build process. They are not documentation added after the fact — they are the source of truth that was written first and executed against.

---

## Project Structure

```
agentkit-cli/
├── src/
│   ├── cli.ts                  ← entry point (commander.js)
│   ├── commands/
│   │   ├── init.ts             ← npx agentkit init
│   │   ├── add.ts              ← npx agentkit add agent
│   │   └── status.ts           ← npx agentkit status
│   ├── detectors/
│   │   ├── stackDetector.ts    ← reads package.json, Cargo.toml, etc.
│   │   └── gitDetector.ts      ← checks for .git directory
│   ├── generators/
│   │   ├── claudeMdGenerator.ts   ← routes to the right template
│   │   └── workflowGenerator.ts   ← routes to the right template
│   ├── templates/
│   │   ├── react.ts            ← React/Vite template
│   │   ├── nextjs.ts           ← Next.js App Router template
│   │   ├── tauri.ts            ← Tauri v2 template
│   │   ├── fastapi.ts          ← FastAPI template
│   │   ├── express.ts          ← Express.js template
│   │   ├── node.ts             ← generic Node.js template
│   │   └── unknown.ts          ← fallback for unknown stacks
│   └── utils/
│       └── logger.ts           ← chalk + ora output helpers
├── tests/
├── CLAUDE.md                   ← agent brief for this repo
├── AGENT_WORKFLOW.md           ← agent workflow for this repo
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

---

## Contributing

Pull requests are welcome. If you add a new stack template:

1. Create `src/templates/your-stack.ts` — export `claudeMd(stack)` and `workflow(stack)`
2. Add detection logic in `src/detectors/stackDetector.ts`
3. Register the new case in `src/generators/claudeMdGenerator.ts` and `workflowGenerator.ts`
4. Add fixtures in `tests/detectors/` and tests in `tests/generators/`

---

## License

MIT — © 2026