# @patricksardinha/agentkit-cli

> Bootstrap any project with an AI-native orchestration layer — like `create vite@latest`, but for agentic development with Claude Code.

[![npm version](https://img.shields.io/npm/v/@patricksardinha/agentkit-cli)](https://www.npmjs.com/package/@patricksardinha/agentkit-cli)
[![license](https://img.shields.io/npm/l/@patricksardinha/agentkit-cli)](./LICENSE)
[![built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-7c3aed)](https://claude.ai/code)

---

## What is AgentKit?

When you run `npm create vite@latest`, it scaffolds a complete React project in seconds — giving you a working structure you can build on immediately instead of configuring everything from scratch.

**AgentKit does the same thing, but for AI-native development.**

It scaffolds the *orchestration layer* that sits on top of any project: the files that tell Claude Code **who** to be, **what** to build, **how** to divide the work across specialized agents, and **exactly what to do** — step by step, without you having to prompt each agent manually.

```
Without AgentKit                 With AgentKit
────────────────                 ──────────────────────────────
my-project/                      my-project/
├── src/                         ├── src/
├── package.json                 ├── package.json
└── README.md                    ├── README.md
                                 ├── CLAUDE.md             ← agent brief
                                 ├── AGENT_WORKFLOW.md     ← roadmap
                                 ├── PLAYBOOK.md           ← execution guide
                                 └── agents/               ← per-agent skills
                                     ├── agent-1-infra/
                                     ├── agent-2-auth/
                                     └── agent-3-features/
```

You open Claude Code, type one instruction, and it runs the entire workflow autonomously.

---

## The Problem It Solves

Most developers using Claude Code today work with a single, long-running conversation. They describe what they want, Claude builds it, they correct, they prompt again. This works — but it has limits:

- **Context gets polluted** — one agent accumulates unrelated concerns
- **No reusability** — you re-explain conventions on every project
- **No parallelism** — everything is sequential without a coordination layer
- **No audit trail** — no document captures decisions made
- **Manual orchestration** — you have to manage agent transitions yourself

AgentKit introduces a **structured orchestration layer** that solves all five problems.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 1 — You run: npx agentkit init --blueprint BLUEPRINT.md   │
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
│  3. Reads your blueprint (optional)                             │
│     → parses features, requirements, architecture notes         │
│     → generates agents tailored to YOUR features                │
│                                                                 │
│  4. Generates the orchestration layer                           │
│     → CLAUDE.md           (conventions, stack, rules)           │
│     → AGENT_WORKFLOW.md   (agents, scope, dependencies)         │
│     → PLAYBOOK.md         (autonomous execution guide)          │
│     → agents/agent-N-*/   (per-agent skills folders)            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2 — You open Claude Code and type ONE instruction:        │
│                                                                 │
│  "Read PLAYBOOK.md and execute the procedure."                  │
│                                                                 │
│  Claude Code then runs autonomously:                            │
│                                                                 │
│  Agent 1 → Infra & Setup                                        │
│    runs: npm run build                                          │
│    ✅ passes → moves to Agent 2                                 │
│    ❌ fails  → analyzes error, fixes, retries (max 3x)          │
│      ↓                                                          │
│  Agent 2 → Auth & Data Layer                                    │
│    runs: npm test                                               │
│    ✅ passes → moves to Agent 3                                 │
│      ↓                                                          │
│  Agent 3 → Features                                             │
│    runs: npm test                                               │
│    ✅ passes → moves to Agent 4                                 │
│      ↓                                                          │
│  Agent 4 → Docs & Deploy                                        │
│    ✅ 🎉 Workflow complete                                     │
└─────────────────────────────────────────────────────────────────┘
```

### The generated files

**`CLAUDE.md`** — the standing brief for every agent. Covers stack, conventions, forbidden patterns, commands, and definition of done. Read by every agent at the start of their session.

**`AGENT_WORKFLOW.md`** — the project roadmap broken into agent-sized tasks. Each entry specifies scope, dependencies, deliverables, and a verifiable success criterion.

**`PLAYBOOK.md`** — the key innovation. A single file that Claude Code reads and executes as a complete autonomous workflow. Includes agent prompts, success criteria, retry logic, correction instructions, and human escalation rules. You don't manage agent transitions — Claude Code does.

**`agents/agent-N-slug/`** — per-agent skill folders. Drop any `.md` files here (API docs, DB schemas, business conventions) and the relevant agent will read them before starting its work.

---

## Quickstart

```bash
# In any project directory
npx @patricksardinha/agentkit-cli init

# With a blueprint for feature-specific agents
npx @patricksardinha/agentkit-cli init --blueprint PROJECT_BLUEPRINT.md

# Add a new feature to an existing project
npx @patricksardinha/agentkit-cli add --feature "add PDF export system"

# Check workflow status
npx @patricksardinha/agentkit-cli status
```

Then open Claude Code and type:
```
Read PLAYBOOK.md and execute the procedure.
```

---

## The Blueprint File

The `--blueprint` flag transforms AgentKit from a generic scaffold tool into a project-specific orchestrator.

Without a blueprint, AgentKit generates standard agents based on your stack (Components, Hooks, Pages, Tests for React). With a blueprint, it reads your feature requirements and generates agents tailored to exactly what you want to build.

**Example `PROJECT_BLUEPRINT.md`:**

```markdown
# My App — Blueprint

## Features
- Email/password authentication with Supabase
- Dashboard with D3 charts (revenue, users, conversion)
- PDF export of reports
- Dark/light theme

## Tech constraints
- Must work offline (IndexedDB for local data)
- Tauri desktop build for Windows
- French and English i18n

## Architecture notes
- Supabase for auth + reference data
- Dexie for local user data
- No Redux — Context API only
```

**What AgentKit generates from this blueprint:**

```markdown
## Agent 1 · Infra & Tauri Setup
Scope    : Vite + React + Tauri + Tailwind, i18n config
Criteria : npm run dev opens without error

## Agent 2 · Auth & Supabase
Scope    : Supabase client, email/password auth, bypass mode
Criteria : login/logout functional, npm test passes

## Agent 3 · Local Data Layer
Scope    : Dexie schema, sync service, offline support
Criteria : useLiveQuery returns data, npm test passes

## Agent 4 · Dashboard & D3 Charts
Scope    : chart components, data hooks, mock data
Criteria : charts render, npm test passes

## Agent 5 · PDF Export
Scope    : PDF generation from dashboard data
Criteria : export produces valid PDF, npm test passes

## Agent 6 · Desktop & CI/CD
Scope    : Tauri build, GitHub Actions, release workflow
Criteria : npm run tauri:build produces installer
```

---

## Per-Agent Skills

Each agent gets its own folder under `agents/`. Drop any `.md` files there — API documentation, database schemas, business conventions, examples — and the agent reads them before starting.

```
agents/
├── agent-2-auth/
│   ├── skills.md              ← auto-generated template
│   └── supabase-schema.md     ← you add this: your actual DB schema
├── agent-4-dashboard/
│   ├── skills.md
│   └── chart-specs.md         ← you add this: exact chart requirements
```

The `skills.md` template generated by AgentKit:

```markdown
# Skills — Agent 2 · Auth & Supabase

> This file is read by Agent 2 before starting its work.
> Fill in what's relevant for your project.

## Technical context (fill in)
- Supabase URL      :
- Tables involved   :
- Expected RLS      :

## Reference documentation (optional)
<!-- paste API docs, schemas, examples here -->

## Project-specific conventions (optional)
<!-- e.g. "always use useSession(), never useUser()" -->
```

---

## Handling Future Iterations

When you want to add a feature to an already-built project:

```bash
npx @patricksardinha/agentkit-cli add --feature "add CSV export to the dashboard"
```

AgentKit:
1. Reads your existing `AGENT_WORKFLOW.md` to find the last agent number
2. Appends a new agent block scoped to the new feature
3. Creates `agents/agent-N-csv-export/skills.md`
4. Regenerates `PLAYBOOK.md` with the new agent included

Then in Claude Code:
```
Read PLAYBOOK.md and execute only the agents that haven't been completed yet.
```

---

## Supported Stacks

| Stack | Detected by | Template enrichment |
|---|---|---|
| **React** | `react` in `package.json` | TypeScript/JS, Vite, testing |
| **Next.js** | `next` in `package.json` | App Router, Tailwind, Prisma |
| **Tauri** | `src-tauri/` directory | Rust/JS boundary, IPC, plugins |
| **FastAPI** | `fastapi` in `requirements.txt` | Python, Pydantic, async |
| **Express** | `express` in `package.json` | REST, middleware, auth |
| **Node.js** | `package.json` (generic) | Scripts, modules, CI/CD |
| **Unknown** | fallback | Generic editable workflow |

Stack detection is additive — TypeScript, Tailwind, Prisma, and testing setup are detected on top of the primary framework and enrich all generated files accordingly.

---

## Design Philosophy

### Why a PLAYBOOK.md instead of manual prompting?

Without AgentKit, a developer using Claude Code has to write a prompt for Agent 1, wait and validate, write a prompt for Agent 2, handle failures manually, and repeat for every agent. With `PLAYBOOK.md`, you write one instruction. Claude Code handles agent transitions, validates success criteria, retries on failure, and asks for human input only when genuinely blocked.

### Why per-agent skills instead of one big context?

Each agent should only know what it needs. An infrastructure agent doesn't need your business logic conventions. A features agent doesn't need your CI/CD configuration. Bounded context produces better output and prevents agents from making decisions outside their scope.

### Why verifiable success criteria?

Every agent ends with a runnable check (`npm test`, `cargo build`, `npm run build`). These aren't goals — they're gates. The PLAYBOOK enforces them. You always know exactly which agents have succeeded and which haven't.

---

## Meta: AgentKit Was Built With AgentKit

This CLI was built using the exact workflow it generates. The `CLAUDE.md`, `AGENT_WORKFLOW.md`, and `PLAYBOOK.md` at the root of this repo drove the entire build process — written first, executed against, not added after the fact.

```
Agent 1 · Infra & Setup       → success: npm run build passes
Agent 2 · Detectors           → success: npm test passes on fixtures
Agent 3 · Generators          → success: valid files for each stack
Agent 4 · Commands CLI        → success: npx agentkit --help works
```

---

## Project Structure

```
agentkit-cli/
├── src/
│   ├── cli.ts
│   ├── commands/
│   │   ├── init.ts              ← npx agentkit init [--blueprint]
│   │   ├── add.ts               ← npx agentkit add --feature
│   │   └── status.ts            ← npx agentkit status
│   ├── detectors/
│   │   ├── stackDetector.ts
│   │   └── gitDetector.ts
│   ├── generators/
│   │   ├── claudeMdGenerator.ts
│   │   ├── workflowGenerator.ts
│   │   ├── playbookGenerator.ts ← PLAYBOOK.md with full exec logic
│   │   └── skillsGenerator.ts   ← agents/agent-N-slug/ folders
│   ├── templates/
│   │   ├── react.ts
│   │   ├── nextjs.ts
│   │   ├── tauri.ts
│   │   ├── fastapi.ts
│   │   ├── express.ts
│   │   ├── node.ts
│   │   └── unknown.ts
│   └── utils/
│       └── logger.ts
├── tests/
├── CLAUDE.md
├── AGENT_WORKFLOW.md
├── PLAYBOOK.md
├── package.json
└── tsup.config.ts
```

---

## Contributing

To add a new stack template:

1. Create `src/templates/your-stack.ts` — export `claudeMd(stack)` and `workflow(stack)`
2. Add detection in `src/detectors/stackDetector.ts`
3. Register in both generators
4. Add fixtures in `tests/detectors/` and tests in `tests/generators/`

---

## License

MIT — © 2026 Patrick Sardinha