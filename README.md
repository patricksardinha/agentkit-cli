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

You open Claude Code, type one instruction, and it runs the entire workflow autonomously.

---

## Core Design Principle — No AI Inside the Tool

AgentKit contains **no AI**. No API calls, no LLM integration, no costs, no API key required.

This is a deliberate choice. AgentKit is a **structural tool** — it generates the scaffolding, the rules, and the execution framework. The intelligence comes from two places:

- **You** — you write a plain-language `PROJECT_BLUEPRINT.md` describing what you want to build
- **Claude Code** — it reads the blueprint, decomposes the project into specialized agents, then executes them in sequence

This separation means AgentKit works with any LLM (Claude Code, local models via Ollama, or any other tool that reads markdown files), never becomes outdated as AI models improve, and costs nothing to run.

```
You (write the blueprint)
        ↓
AgentKit CLI (generates the structure)
        ↓
Claude Code (decomposes + executes)
        ↓
Your finished project
```

---

## The Problem It Solves

Most developers using Claude Code today work with a single, long-running conversation. They describe what they want, Claude builds it, they correct, they prompt again. This works — but it has limits:

- **Context gets polluted** — one agent accumulates unrelated concerns
- **No reusability** — you re-explain conventions on every project
- **No audit trail** — no document captures decisions made
- **Manual orchestration** — you have to manage agent transitions yourself
- **Poor decomposition** — most developers don't know how to split work into optimal agents

AgentKit solves all five — including the last one, by delegating the decomposition itself to Claude Code.

---

## How It Works

### Step 1 — Write your blueprint (you)

Create a `PROJECT_BLUEPRINT.md` at the root of your project. Write it in plain language — just describe what you want to build. No need to think about agents, layers, or technical structure. That's Claude Code's job.

```
my-project/
└── PROJECT_BLUEPRINT.md    ← you write this (plain language, no structure required)
```

**A good blueprint looks like this:**

```markdown
# DevLog Desktop — Blueprint

## Goal
A desktop app where I log my dev sessions as I work.
At the end of the week it generates a summary I can paste into my standup.
I also want to search my history in natural language.

## Features
- Create a session: what I worked on, how long, blockers encountered
- Weekly summary generated automatically from local history
- Natural language search across all past sessions (RAG)
- Export summaries as markdown for standups
- Dark/light theme, minimal UI

## Tech constraints
- Desktop app — Tauri v2 (Windows first)
- All data stays local — no cloud, no auth required
- React 19 + TypeScript + Tailwind v4
- Dexie for local storage (IndexedDB)
- Ollama for local AI (summaries + embeddings) — no API key

## Architecture notes
- No Supabase — bypass auth entirely
- RAG: generate embeddings with nomic-embed-text, store in Dexie,
  search by cosine similarity
- Export via Tauri fs plugin
```

That's all you need to write. Notice there are no agents, no technical layers, no decomposition — just your intent.

### Step 2 — Run AgentKit (AgentKit CLI)

```bash
npx @patricksardinha/agentkit-cli init --blueprint PROJECT_BLUEPRINT.md
```

AgentKit reads your blueprint and detected stack, then generates the full orchestration layer:

```
my-project/
├── PROJECT_BLUEPRINT.md         ← your input (untouched)
│
├── CLAUDE.md                    ← generated: conventions, stack, rules
├── AGENT_WORKFLOW.md            ← generated: placeholder (Claude Code fills this)
├── PLAYBOOK.md                  ← generated: full execution guide
│
└── agents/                      ← generated: per-agent skill folders
    ├── agent-1-infra/
    │   └── skills.md
    ├── agent-2-data/
    │   └── skills.md
    └── agent-3-features/
        └── skills.md
```

### Step 3 — Optionally enrich the skills files (you)

Before running Claude Code, you can drop context-specific `.md` files into any agent's folder. The agent reads them before starting its work:

```
agents/
├── agent-3-ollama/
│   ├── skills.md                    ← auto-generated template
│   └── ollama-api-reference.md      ← you add this: Ollama API docs
└── agent-4-rag/
    ├── skills.md
    └── cosine-similarity-example.md ← you add this: algorithm reference
```

This is the right place to add API documentation, database schemas, algorithm references, or any project-specific knowledge that a specific agent needs.

### Step 4 — Open Claude Code and type one instruction (Claude Code)

```
Read PLAYBOOK.md and execute the procedure.
```

Claude Code then runs in two phases automatically:

**Phase 0 — Decomposition (Claude Code reads your blueprint and decides)**

Claude Code reads `PROJECT_BLUEPRINT.md` and decomposes the project into specialized agents following built-in rules (one agent per technical layer, ordered by dependency, maximum 6 agents). It writes the result into `AGENT_WORKFLOW.md` and asks for your validation before continuing:

```
"I have decomposed the project into 6 agents:
  1. Infra & Tauri Setup
  2. Data Layer (Dexie)
  3. Ollama Integration
  4. RAG & Search
  5. UI & Features
  6. Desktop & Release
Should I proceed?"
```

You answer yes (or ask for adjustments), and execution begins.

**Phase 1 — Execution (Claude Code runs each agent autonomously)**

```
Agent 1 → Infra & Tauri Setup
  reads  : CLAUDE.md + agents/agent-1-infra/skills.md
  runs   : npm run tauri:dev
  ✅ passes → moves to Agent 2
  ❌ fails  → analyzes error, fixes, retries (max 3 times)
              → after 3 failures: asks for human intervention
    ↓
Agent 2 → Data Layer (Dexie)
  reads  : CLAUDE.md + agents/agent-2-data/skills.md
  runs   : npm test
  ✅ passes → moves to Agent 3
    ↓
Agent 3 → Ollama Integration
  ...
    ↓
Agent 6 → Desktop & Release
  ✅ 🎉 Workflow complete
```

---

## The Generated Files

**`CLAUDE.md`** — the standing brief for every agent. Covers stack, conventions, forbidden patterns, commands, and definition of done. Read by every agent at the start of their session. Never changes between agents.

**`AGENT_WORKFLOW.md`** — starts as a placeholder. Claude Code fills it during Phase 0 with the actual agent decomposition based on your blueprint. Becomes the single source of truth for the project roadmap.

**`PLAYBOOK.md`** — the execution engine. Contains Phase 0 (decomposition rules and validation gate) and Phase 1 (agent execution loop with retry logic and human escalation). You never edit this file — Claude Code reads and follows it.

**`agents/agent-N-slug/skills.md`** — per-agent context files. Auto-generated as templates. Fill in technical details, paste API docs, add schemas. Only the relevant agent reads its own skills file — bounded context by design.

---

## Without Blueprint vs With Blueprint

**Without blueprint** — AgentKit generates generic agents based on your detected stack. Useful for standard projects (a React app, a Next.js site) where the structure is predictable.

```bash
npx @patricksardinha/agentkit-cli init
```

Phase 0 is skipped. Claude Code receives pre-defined generic agents and executes them directly.

**With blueprint** — AgentKit generates a PLAYBOOK with Phase 0 enabled. Claude Code reads your features and decides the optimal agent structure before writing any code.

```bash
npx @patricksardinha/agentkit-cli init --blueprint PROJECT_BLUEPRINT.md
```

Phase 0 runs first. Claude Code proposes a decomposition, waits for your validation, then executes.

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

---

## Design Philosophy

### No AI in the tool — by design

Integrating an LLM into AgentKit would mean choosing a provider, managing API keys, adding costs, and coupling the tool to a specific model that will become outdated. Instead, AgentKit is purely structural — it generates files that any LLM can read and act on. The intelligence lives in Claude Code (or whatever tool you use), not in AgentKit.

### You write intent, Claude Code writes structure

The `PROJECT_BLUEPRINT.md` you write is intentionally free-form. You describe what you want to build, not how to build it. The decomposition into agents — which layer goes first, which agents can be parallelized, what the success criteria should be — is decided by Claude Code during Phase 0. This is the right division of responsibility: you own the product vision, the AI owns the technical planning.

### Bounded context per agent

Each agent reads only what it needs: `CLAUDE.md` (global conventions) and its own `skills.md` (specific context). An infrastructure agent doesn't see your business logic. A features agent doesn't see your CI/CD configuration. This produces better output and prevents agents from making decisions outside their scope.

### Verifiable success criteria

Every agent ends with a runnable check. Not a goal — a gate. The PLAYBOOK enforces them. You always know exactly which agents have succeeded and which haven't, without reading a single line of generated code.

---

## Meta: AgentKit Was Built With AgentKit

This CLI was built using the exact workflow it generates — including Phase 0.

The `PROJECT_BLUEPRINT.md` at the root of this repo was written first, in plain language, describing the CLI's features and constraints. Claude Code then ran Phase 0, proposed a 4-agent decomposition, and executed it after validation:

```
Phase 0 — Decomposition (Claude Code proposed, human validated)

  Proposed decomposition:
  1. Infra & Setup      → package.json, tsup, vitest, GitHub Actions
  2. Detectors          → stackDetector, gitDetector
  3. Generators         → claudeMd, workflow, playbook, skills generators
  4. Commands CLI       → init, add, status, cli entry point

  Human: "Looks good, proceed."

Phase 1 — Execution

  Agent 1 · Infra & Setup
    skills : agents/agent-1-infra/skills.md
    runs   : npm run build
    ✅ done

  Agent 2 · Detectors
    skills : agents/agent-2-detectors/skills.md
    runs   : npm test
    ✅ done

  Agent 3 · Generators & Templates
    skills : agents/agent-3-generators/skills.md
    runs   : npm test
    ✅ done

  Agent 4 · Commands CLI
    skills : agents/agent-4-commands/skills.md
    runs   : npm run build && node dist/cli.js --help
    ✅ done

  🎉 Workflow complete
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
│   │   ├── playbookGenerator.ts ← Phase 0 + Phase 1
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