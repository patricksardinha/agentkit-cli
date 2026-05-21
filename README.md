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

This separation means AgentKit works with any LLM and never becomes outdated as AI models improve. The tool itself costs nothing to run — but be aware:

- **Claude Code or any hosted LLM** requires a paid subscription to the provider (Anthropic, OpenAI, etc.)
- **Local models via Ollama** are free to run, but require a machine with sufficient RAM and ideally a dedicated GPU — a standard laptop may struggle with larger models
- **AgentKit itself** has no cost, no API key, and no usage limits

```
You (optionally write a blueprint)
        ↓
AgentKit CLI (detects stack or asks you, generates the structure)
        ↓
Claude Code (reads blueprint or asks questions → decomposes → pauses
             for skills enrichment → executes agents in sequence)
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

AgentKit always runs in three phases inside Claude Code. The full flow looks like this:

```
Phase 0 — Decomposition or Discovery
    Claude Code reads your blueprint (or asks you 3 questions)
    → proposes a list of agents
    → waits for your validation
          ↓
Skills Enrichment pause
    Claude Code creates agents/agent-N-slug/ folders
    → announces what folders were created
    → waits for you to add context files (API docs, schemas, etc.)
    → you type "proceed" when ready
          ↓
Phase 1 — Execution
    Claude Code executes each agent in sequence
    → validates success criterion after each one
    → retries on failure (max 3)
    → escalates to human if blocked
    → 🎉 announces completion
```

### Without blueprint — Phase 0 asks you

```bash
npx @patricksardinha/agentkit-cli init
```

Claude Code starts with **Phase 0 — Project Discovery**: it asks you three questions and waits for your answers before proposing any decomposition.

```
Claude Code: "Before I start, I need to understand what you want to build.

  1. What is this project? (one sentence)
  2. What are the main features you want to build?
  3. Any tech constraints or architecture preferences?"

You: "A desktop app for logging dev sessions, with Tauri v2,
      local RAG via Ollama, no cloud."

Claude Code: "I've decomposed the project into 5 agents:
  1. Infra & Tauri Setup
  2. Data Layer (Dexie)
  3. Ollama Integration
  4. UI & Pages
  5. RAG, Export & Release
Should I proceed?"

You: "Yes."
```

### With blueprint — Phase 0 reads your file

Write a `PROJECT_BLUEPRINT.md` at the root of your project in plain language — just describe what you want to build. No agents, no structure, no technical layers required.

```bash
npx @patricksardinha/agentkit-cli init --blueprint PROJECT_BLUEPRINT.md
```

Claude Code starts with **Phase 0 — Agent Decomposition**: it reads your blueprint and proposes an agent structure before writing any code.

```
Claude Code: "I've read PROJECT_BLUEPRINT.md and decomposed the project into 6 agents:
  1. Infra & Configuration
  2. Data Layer (Dexie)
  3. Ollama Integration
  4. UI & Pages
  5. Advanced Features (RAG, Export)
  6. Build & Release
Should I proceed?"

You: "Yes."
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

### Skills Enrichment pause — between Phase 0 and Phase 1

This is the key moment where you can inject project-specific knowledge
into individual agents — **before they start writing code**.

After you validate the decomposition, Claude Code creates all agent folders
and pauses:

```
Claude Code: "Agent folders created under agents/:
  - agents/agent-1-infra-scaffold/skills.md
  - agents/agent-2-data-dexie/skills.md
  - agents/agent-3-ollama-service/skills.md
  - agents/agent-4-ui-pages/skills.md
  - agents/agent-5-features-rag-export/skills.md
  - agents/agent-6-build-release/skills.md

You can now enrich any skills.md with additional context:
  - API documentation
  - Database schemas
  - Algorithm references
  - Business conventions
  - Any project-specific knowledge

Add .md files directly in the relevant agent folder —
I will read everything in agents/agent-{N}-{slug}/ before
starting that agent.

Type 'proceed' when you're ready and I'll start Phase 1."
```

You can then drop any context files into the agent folders:

```
agents/
├── agent-3-ollama-service/
│   ├── skills.md                  ← auto-generated empty template
│   └── ollama-api-reference.md    ← you add this before typing "proceed"
├── agent-5-features-rag-export/
│   ├── skills.md
│   └── cosine-similarity.md       ← algorithm reference for the RAG agent
```

When you're done, type `proceed` and Phase 1 begins.

### Phase 1 — Execution

```
Agent 1 → Infra & Configuration
  reads  : CLAUDE.md + agents/agent-1-infra/skills.md + any .md in that folder
  runs   : npm run build
  ✅ passes → moves to Agent 2
  ❌ fails  → analyzes error, fixes, retries (max 3 times)
              → after 3 failures: asks for human intervention
    ↓
Agent 2 → Data Layer
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

In all cases, the instruction to give Claude Code is identical:

```
Read PLAYBOOK.md and execute the procedure.
```

---

## Stack Detection

AgentKit automatically reads your project directory to detect the stack.
If it can identify your framework, it generates a `CLAUDE.md` immediately.
If not, it asks you interactively.

### Automatic detection

| Stack | Detected by |
|---|---|
| **React + Vite** | `react` in `package.json` dependencies |
| **Next.js** | `next` in `package.json` dependencies |
| **Tauri v2** | `src-tauri/` directory present |
| **FastAPI** | `fastapi` in `requirements.txt` |
| **Express** | `express` in `package.json` dependencies |
| **Node.js** | `package.json` exists (generic fallback) |

### Interactive selection (when stack is not detected)

If the project directory is empty or the stack cannot be identified automatically,
AgentKit asks you to pick from the supported list:

```
⚠ Stack not detected automatically.
? Please select your stack:
❯ React + Vite
  Next.js
  Tauri v2 (React + Rust)
  FastAPI (Python)
  Express (Node.js)
  Node.js (generic)
  None of the above — generate a generic CLAUDE.md to fill manually
```

This is the most common case when **starting a brand new project** from an
empty folder. You pick your stack, AgentKit generates a fully enriched `CLAUDE.md`
with the right commands, conventions, and Tauri-specific rules — exactly as if
it had detected the stack automatically.

### "None of the above"

If your stack isn't in the list, AgentKit generates a generic `CLAUDE.md` with
a clear warning:

```markdown
## ⚠️ Stack not configured
AgentKit could not detect your stack and no stack was selected.
Before running Claude Code, fill in: Stack, Commands, Structure.
```

### Adding a new stack

See the **Contributing** section — adding a new template takes less than 30 minutes
and makes it available to all AgentKit users.

---

## The Generated Files

```
my-project/
├── PROJECT_BLUEPRINT.md         ← your input (untouched, optional)
│
├── CLAUDE.md                    ← generated: conventions, stack, rules
├── AGENT_WORKFLOW.md            ← placeholder: Claude Code fills this in Phase 0
├── PLAYBOOK.md                  ← generated: Phase 0 + pause + Phase 1
├── README.md                    ← generated: project doc (skipped if already exists)
│
└── agents/                      ← created by Claude Code after Phase 0 validation
    ├── agent-1-infra/
    │   └── skills.md            ← enrich before typing "proceed"
    ├── agent-2-data/
    │   └── skills.md
    └── agent-3-features/
        └── skills.md
```

**`CLAUDE.md`** — the standing brief for every agent. Covers stack, conventions, forbidden patterns, commands, and definition of done.

**`AGENT_WORKFLOW.md`** — starts as a placeholder. Claude Code fills it during Phase 0. Becomes the single source of truth for the project roadmap.

**`PLAYBOOK.md`** — the execution engine. Contains Phase 0, the skills enrichment pause, and Phase 1 with retry logic and human escalation.

**`README.md`** — generated automatically if no README.md exists yet.
Contains the project name, goal and features extracted from the blueprint, the tech stack, getting started commands, and a reference to the AgentKit workflow. If a README.md already exists in your project, AgentKit skips
it and warns you — your existing doc is never overwritten.

**`agents/agent-N-slug/`** — created by Claude Code after Phase 0 validation. Drop any `.md` files here during the enrichment pause — the agent will read them before starting.

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

Phase 0 and the skills enrichment pause only run once — during the initial
`agentkit init`. Iterations go straight to execution.

---

## Design Philosophy

### No AI in the tool — by design

Integrating an LLM into AgentKit would mean choosing a provider, managing API keys, adding costs, and coupling the tool to a specific model. Instead, AgentKit is purely structural — it generates files that any LLM can read and act on.

### Stack detection first, interactive fallback

AgentKit tries to detect your stack automatically. If it can't, it asks you interactively rather than generating something useless. The goal is always a `CLAUDE.md` that Claude Code can actually use.

### Phase 0 always runs — with or without blueprint

Most developers don't know how to optimally decompose a project into agents. AgentKit always delegates decomposition to Claude Code. With a blueprint, Claude Code reads the file. Without one, it asks you three questions. Either way, you never have to think about agents yourself.

### The skills enrichment pause is intentional

Between decomposition and execution, there's a window where you know exactly which agents will run but none of them have started yet. This is the right moment to inject project-specific knowledge — API docs, schemas, algorithm references. AgentKit formalizes this window as an explicit pause rather than leaving it to chance.

### Phase 0 and the pause run once, iterations skip both

When you run `agentkit add --feature`, the regenerated PLAYBOOK goes straight to execution — the planning and enrichment are already done.

### Bounded context per agent

Each agent reads only `CLAUDE.md` and its own folder. An infrastructure agent doesn't see your business logic. A features agent doesn't see your CI/CD configuration.

### Verifiable success criteria

Every agent ends with a runnable check — not a goal, a gate. The PLAYBOOK enforces them.

---

## Meta: AgentKit Was Built With AgentKit

This CLI was built using the exact workflow it generates.

### A note on honesty

The `CLAUDE.md`, `AGENT_WORKFLOW.md`, and `PLAYBOOK.md` at the root of this repo
are **illustrative** — written after the fact to show what AgentKit would have
generated. This is the bootstrapping paradox: you can't use a tool to build itself
before it exists.

`PROJECT_BLUEPRINT.md` is **genuine** — it reflects the actual vision from the
start, including the Phase 0 and skills enrichment principles.

### How it would have worked

```
Step 1 — Write PROJECT_BLUEPRINT.md
Step 2 — npx agentkit init --blueprint PROJECT_BLUEPRINT.md
Step 3 — "Read PLAYBOOK.md and execute the procedure."

  Phase 0: Claude Code proposes 4 agents → human validates

  Skills pause: Claude Code creates agents/ folders → human adds
                skills context → types "proceed"

  Phase 1:
    Agent 1 · Infra & Setup      → npm run build        ✅
    Agent 2 · Detectors          → npm test             ✅
    Agent 3 · Generators         → npm test             ✅
    Agent 4 · Commands CLI       → node dist/cli.js --help ✅
    🎉 Workflow complete
```

### Real-world example

AgentKit was also used to build **DevLog Desktop** — a Tauri v2 desktop app
with local RAG via Ollama. The full `PROJECT_BLUEPRINT.md`, `CLAUDE.md`,
`AGENT_WORKFLOW.md`, and `PLAYBOOK.md` from that project are available at
[github.com/patricksardinha/devlog-desktop](https://github.com/patricksardinha/devlog-desktop)
as a concrete reference of what AgentKit generates on a real project.

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
│   │   ├── playbookGenerator.ts ← Phase 0 + skills pause + Phase 1
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
│   ├── agent-1-infra/skills.md
│   ├── agent-2-detectors/skills.md
│   ├── agent-3-generators/skills.md
│   └── agent-4-commands/skills.md
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
3. Add the stack to the interactive selection list in `src/commands/init.ts`
4. Register in `src/generators/claudeMdGenerator.ts` and `workflowGenerator.ts`
5. Add fixtures in `tests/detectors/` and tests in `tests/generators/`

---

## License

MIT — © 2026 Patrick Sardinha