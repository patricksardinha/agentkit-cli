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

- **You** — you optionally write a `PROJECT_BLUEPRINT.md` describing what you want to build
- **Claude Code** — it either reads your blueprint or asks you questions, decomposes the project into specialized agents, then executes them in sequence

This separation means AgentKit works with any LLM and never becomes outdated
as AI models improve. The tool itself costs nothing to run — but be aware:

- **Claude Code or any hosted LLM** requires a paid subscription to the
  provider (Anthropic, OpenAI, etc.)
- **Local models via Ollama** are free to run, but require a machine with
  sufficient RAM and ideally a dedicated GPU — a standard laptop may
  struggle with larger models
- **AgentKit itself** has no cost, no API key, and no usage limits

```
You (optionally write a blueprint)
        ↓
AgentKit CLI (generates the structure)
        ↓
Claude Code (discovers or reads blueprint → decomposes → executes)
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

AgentKit solves all five — including the last one, by always delegating decomposition to Claude Code, whether or not you provide a blueprint.

---

## How It Works

AgentKit always runs in two phases inside Claude Code. **Phase 0 always runs first**, regardless of whether you provided a blueprint. The difference is only the *source* of information.

### Without blueprint — Phase 0 asks you

```bash
npx @patricksardinha/agentkit-cli init
```

When Claude Code reads the generated PLAYBOOK, it starts with **Phase 0 — Project Discovery**: it asks you three questions directly in the chat and waits for your answers before decomposing anything.

```
Claude Code: "Before I start, I need to understand what you want to build.

  1. What is this project? (one sentence)
  2. What are the main features you want to build?
  3. Any tech constraints or architecture preferences?

Please answer and I'll propose an agent decomposition."

You: "It's a desktop app where I log my dev sessions.
      Features: session logging, weekly summaries, natural language search.
      Constraints: Tauri v2, all local, no cloud, Ollama for AI."

Claude Code: "I've decomposed the project into 5 agents:
  1. Infra & Tauri Setup
  2. Data Layer (Dexie)
  3. Ollama Integration
  4. RAG & Search
  5. UI & Features
Should I proceed?"

You: "Yes."  ← then execution begins
```

### With blueprint — Phase 0 reads your file

Write a `PROJECT_BLUEPRINT.md` at the root of your project in plain language — just describe what you want to build. No agents, no structure, no technical layers required.

```bash
npx @patricksardinha/agentkit-cli init --blueprint PROJECT_BLUEPRINT.md
```

When Claude Code reads the generated PLAYBOOK, it starts with **Phase 0 — Agent Decomposition**: it reads your blueprint and proposes an agent structure before writing any code.

```
Claude Code: "I've read PROJECT_BLUEPRINT.md and decomposed the project into 5 agents:
  1. Infra & Tauri Setup
  2. Data Layer (Dexie)
  3. Ollama Integration
  4. RAG & Search
  5. UI & Features
Should I proceed?"

You: "Yes."  ← then execution begins
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

### Phase 1 — Execution (same in both cases)

Once you validate the decomposition, Claude Code executes each agent autonomously:

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
...
    ↓
Agent N → last agent
  ✅ 🎉 Workflow complete
```

### The one instruction

In both cases, the instruction to give Claude Code is identical:

```
Read PLAYBOOK.md and execute the procedure.
```

---

## The Generated Files

```
my-project/
├── PROJECT_BLUEPRINT.md         ← your input (untouched, optional)
│
├── CLAUDE.md                    ← generated: conventions, stack, rules
├── AGENT_WORKFLOW.md            ← placeholder: Claude Code fills this in Phase 0
├── PLAYBOOK.md                  ← generated: Phase 0 + Phase 1 execution engine
│
└── agents/                      ← generated: per-agent skill folders
    ├── agent-1-infra/
    │   └── skills.md            ← fill in infra-specific context
    ├── agent-2-data/
    │   └── skills.md            ← fill in data-specific context
    └── agent-3-features/
        └── skills.md            ← fill in feature-specific context
```

**`CLAUDE.md`** — the standing brief for every agent. Covers stack, conventions, forbidden patterns, commands, and definition of done. Read by every agent at the start of their session.

**`AGENT_WORKFLOW.md`** — starts as a placeholder. Claude Code fills it during Phase 0. Becomes the single source of truth for the project roadmap.

**`PLAYBOOK.md`** — the execution engine. Phase 0 is always present (Discovery or Decomposition depending on whether a blueprint was provided). Phase 1 contains the agent execution loop with retry logic and human escalation.

**`agents/agent-N-slug/skills.md`** — per-agent context files. Auto-generated as templates. Only the relevant agent reads its own file — bounded context by design. Add any `.md` files alongside `skills.md` and the agent reads those too.

---

## Optionally Enrich the Skills Files

Before running Claude Code, drop context-specific `.md` files into any agent's folder:

```
agents/
├── agent-3-ollama/
│   ├── skills.md                    ← auto-generated template
│   └── ollama-api-reference.md      ← you add this: Ollama API docs
└── agent-4-rag/
    ├── skills.md
    └── cosine-similarity-example.md ← you add this: algorithm reference
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
4. Regenerates `PLAYBOOK.md` **without Phase 0** — the initial decomposition is already done

Then in Claude Code:
```
Read PLAYBOOK.md and execute only the agents that haven't been completed yet.
```

Phase 0 only ever runs once — during the initial `agentkit init`. Iterations go straight to execution.

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

### Phase 0 always runs — with or without blueprint

The key insight: most developers don't know how to optimally decompose a project into agents. AgentKit solves this by always delegating decomposition to Claude Code. With a blueprint, Claude Code reads the file. Without one, it asks you three questions. Either way, you never have to think about agents yourself — that's Claude Code's job.

### You write intent, Claude Code writes structure

Whether you write a blueprint or answer questions in chat, you describe *what* you want to build, not *how*. The decomposition into agents — which layer goes first, what the success criteria should be — is always decided by Claude Code during Phase 0.

### Phase 0 runs once, iterations skip it

Phase 0 is only present in the PLAYBOOK generated by `agentkit init`. When you run `agentkit add --feature`, the regenerated PLAYBOOK goes straight to Phase 1 — the initial planning is done, you're just adding to it.

### Bounded context per agent

Each agent reads only `CLAUDE.md` and its own `skills.md`. An infrastructure agent doesn't see your business logic. A features agent doesn't see your CI/CD configuration. This produces better output and prevents agents from making decisions outside their scope.

### Verifiable success criteria

Every agent ends with a runnable check — not a goal, a gate. The PLAYBOOK enforces them. You always know exactly which agents have succeeded and which haven't.

---

## Meta: AgentKit Was Built With AgentKit

This CLI was built using the exact workflow it generates.

### A little note

The `CLAUDE.md`, `AGENT_WORKFLOW.md`, and `PLAYBOOK.md` files at the root of
this repo are **illustrative** — they were written after the fact to show what
AgentKit would have generated had it existed at the start of this project.
This is the inherent bootstrapping paradox: you can't use a tool to build itself
before the tool exists.

`PROJECT_BLUEPRINT.md` however is **genuine** — it reflects the actual vision
of the project from the beginning, including the Phase 0 decomposition principle
that was central to the design.

These four files serve as a concrete, real-world example of what AgentKit
generates — on the same project rather than a separate demo repo. When you
use AgentKit on your own project, the files it generates will follow exactly
this structure.

### How it would have worked

```
Step 1 — Write PROJECT_BLUEPRINT.md (genuine)
  Described the CLI's features, constraints, and architecture in plain language.
  No agents, no layers — just intent.

Step 2 — npx agentkit init --blueprint PROJECT_BLUEPRINT.md
  AgentKit detects: Node.js + TypeScript stack
  Generates: CLAUDE.md, AGENT_WORKFLOW.md (placeholder), PLAYBOOK.md, agents/

Step 3 — "Read PLAYBOOK.md and execute the procedure."

  Phase 0 — Decomposition
    Claude Code reads PROJECT_BLUEPRINT.md.
    Proposes 4 agents, waits for validation.

    "I have decomposed the project into 4 agents:
      1. Infra & Setup
      2. Detectors
      3. Generators & Templates
      4. Commands CLI
    Should I proceed?"

    Human: "Yes."

  Phase 1 — Execution

    Agent 1 · Infra & Setup
      skills : agents/agent-1-infra/skills.md
      runs   : npm run build        ✅

    Agent 2 · Detectors
      skills : agents/agent-2-detectors/skills.md
      runs   : npm test             ✅

    Agent 3 · Generators & Templates
      skills : agents/agent-3-generators/skills.md
      runs   : npm test             ✅

    Agent 4 · Commands CLI
      skills : agents/agent-4-commands/skills.md
      runs   : npm run build && node dist/cli.js --help   ✅

    🎉 Workflow complete
```

The `CLAUDE.md`, `AGENT_WORKFLOW.md`, and `PLAYBOOK.md` in this repo show
exactly what each file looks like after AgentKit generates it and Claude Code
fills it in. Use them as a reference when writing your own `PROJECT_BLUEPRINT.md`.

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
│   │   ├── playbookGenerator.ts ← Phase 0 (Discovery or Decomposition) + Phase 1
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