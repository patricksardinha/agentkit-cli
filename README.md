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

You open Claude Code, type one instruction, and it runs the entire workflow autonomously. You don't need an API key or incur additional costs; a simple subscription to an LLM provider or the use of local models may suffice.

---

## The Problem It Solves

Most developers using Claude Code today work with a single, long-running conversation. They describe what they want, Claude builds it, they correct, they prompt again. This works — but it has limits:

- **Context gets polluted** — one agent accumulates unrelated concerns
- **No reusability** — you re-explain conventions on every project
- **No audit trail** — no document captures decisions made
- **Manual orchestration** — you have to manage agent transitions yourself

AgentKit introduces a **structured orchestration layer** that solves all four problems.

---

## How It Works

### Step 1 — Prepare your project

Start from any directory — empty or existing. Optionally write a `PROJECT_BLUEPRINT.md` to describe your features (see below). Your project looks like this before running AgentKit:

```
my-project/                      ← empty or existing project
├── src/                         ← your existing code (if any)
├── package.json                 ← your existing config (if any)
└── PROJECT_BLUEPRINT.md         ← you write this (optional but recommended)
```

### Step 2 — Run AgentKit

```bash
# Without blueprint — generates generic agents based on detected stack
npx @patricksardinha/agentkit-cli init

# With blueprint — generates agents tailored to your features
npx @patricksardinha/agentkit-cli init --blueprint PROJECT_BLUEPRINT.md
```

AgentKit scans your directory, detects your stack, reads your blueprint if provided, and generates the full orchestration layer:

```
my-project/
├── src/                         ← untouched
├── package.json                 ← untouched
├── PROJECT_BLUEPRINT.md         ← your input (untouched)
│
├── CLAUDE.md                    ← generated: agent brief & conventions
├── AGENT_WORKFLOW.md            ← generated: roadmap with all agents
├── PLAYBOOK.md                  ← generated: autonomous execution guide
│
└── agents/                      ← generated: per-agent skill folders
    ├── agent-1-infra/
    │   └── skills.md            ← fill in your infra-specific context
    ├── agent-2-auth/
    │   └── skills.md            ← fill in your auth-specific context
    └── agent-3-features/
        └── skills.md            ← fill in your feature-specific context
```

### Step 3 — Optionally enrich the skills files

Before running Claude Code, you can drop additional `.md` files into any `agents/agent-N-*/` folder. The agent will read them before starting its work:

```
agents/
├── agent-2-auth/
│   ├── skills.md                ← auto-generated template
│   └── supabase-schema.md       ← you add this: your actual DB schema
└── agent-3-features/
    ├── skills.md
    └── chart-specs.md           ← you add this: exact chart requirements
```

### Step 4 — Open Claude Code and type one instruction

```
Read PLAYBOOK.md and execute the procedure.
```

Claude Code handles the rest autonomously:

```
Agent 1 → Infra & Setup
  runs: npm run build
  ✅ passes → moves to Agent 2
  ❌ fails  → analyzes error, fixes, retries
              (max 3 times before requesting human intervention)
    ↓
Agent 2 → Core Layer
  runs: npm test
  ✅ passes → moves to Agent 3
    ↓
Agent 3 → Features
  runs: npm test
  ✅ passes → moves to Agent 4
    ↓
Agent N → Docs & Deploy
  ✅ Workflow complete
```

---

## The Generated Files

**`CLAUDE.md`** — the standing brief for every agent. Covers stack, conventions, forbidden patterns, commands, and definition of done. Read by every agent at the start of their session.

**`AGENT_WORKFLOW.md`** — the project roadmap broken into agent-sized tasks. Each entry specifies scope, dependencies, deliverables, and a verifiable success criterion.

**`PLAYBOOK.md`** — a single file that Claude Code reads and executes as a complete autonomous workflow. Includes agent prompts, success criteria, retry logic, correction instructions, and human escalation rules. You don't manage agent transitions — Claude Code does.

**`agents/agent-N-slug/skills.md`** — per-agent context files. Auto-generated as empty templates for you to fill in. Add any `.md` files alongside `skills.md` and the agent will read them too.

---

## The PROJECT_BLUEPRINT.md

The `--blueprint` flag transforms AgentKit from a generic scaffold tool into a project-specific orchestrator.

**Without a blueprint**, AgentKit generates standard agents based on your detected stack — Components, Hooks, Pages, Tests for a React project.

**With a blueprint**, it reads your feature requirements and generates agents tailored to exactly what you want to build.

Place `PROJECT_BLUEPRINT.md` at the root of your project before running `agentkit init`:

```
my-project/
└── PROJECT_BLUEPRINT.md    ← write this first, then run agentkit init
```

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

Stack detection is additive — TypeScript, Tailwind, Prisma, and testing setup are detected on top of the primary framework and enrich all generated files.

---

## Design Philosophy

### Why a PLAYBOOK.md instead of manual prompting?

Without AgentKit, a developer using Claude Code has to write a prompt for Agent 1, wait and validate, write a prompt for Agent 2, handle failures manually, and repeat for every agent. With `PLAYBOOK.md`, you write one instruction. Claude Code handles agent transitions, validates success criteria, retries on failure (up to 3 times), and asks for human input only when genuinely blocked.

### Why per-agent skills instead of one big context?

Each agent should only know what it needs. An infrastructure agent doesn't need your business logic conventions. A features agent doesn't need your CI/CD configuration. Bounded context produces better output and prevents agents from making decisions outside their scope.

### Why verifiable success criteria?

Every agent ends with a runnable check (`npm test`, `cargo build`, `npm run build`). These aren't goals — they're gates. The PLAYBOOK enforces them. You always know exactly which agents have succeeded and which haven't.

---

## Meta: AgentKit Was Built With AgentKit

This CLI was built using the exact workflow it generates.

The repository contains `PROJECT_BLUEPRINT.md`, `CLAUDE.md`, `AGENT_WORKFLOW.md`, `PLAYBOOK.md`, and an `agents/` folder with per-agent skills — all written before a single line of code. Four agents executed the build in sequence:

```
Agent 1 · Infra & Setup
  skills : agents/agent-1-infra/skills.md
  runs   : npm run build
  ✅ package.json, tsconfig, tsup, vitest, GitHub Actions

Agent 2 · Detectors
  skills : agents/agent-2-detectors/skills.md
  runs   : npm test
  ✅ stackDetector, gitDetector, test fixtures

Agent 3 · Generators & Templates
  skills : agents/agent-3-generators/skills.md
  runs   : npm test
  ✅ claudeMdGenerator, workflowGenerator, playbookGenerator,
     skillsGenerator, templates for all 7 stacks

Agent 4 · Commands CLI
  skills : agents/agent-4-commands/skills.md
  runs   : npm run build && node dist/cli.js --help
  ✅ init (--blueprint), add (--feature), status, cli.ts
```

These files are not documentation added after the fact. They are the source of truth that was written first and executed against.

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
│   │   ├── playbookGenerator.ts
│   │   └── skillsGenerator.ts
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
├── agents/
│   ├── agent-1-infra/
│   │   └── skills.md
│   ├── agent-2-detectors/
│   │   └── skills.md
│   ├── agent-3-generators/
│   │   └── skills.md
│   └── agent-4-commands/
│       └── skills.md
├── PROJECT_BLUEPRINT.md
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
3. Register in `src/generators/claudeMdGenerator.ts` and `workflowGenerator.ts`
4. Add fixtures in `tests/detectors/` and tests in `tests/generators/`

---

## License

MIT — © 2026 Patrick Sardinha