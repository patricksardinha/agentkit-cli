# PLAYBOOK.md — @patricksardinha/agentkit-cli

> **One instruction to give Claude Code:**
> "Read PLAYBOOK.md and execute the procedure."
>
> Claude Code handles the rest autonomously — blueprint reading, agent decomposition,
> execution, success validation, retries, and human escalation.
> No API key required. No additional cost beyond your LLM subscription.

---

## Global Execution Rules

Before each agent:
1. Read `CLAUDE.md`
2. Read `agents/agent-{N}-{slug}/skills.md` (current agent's file)
3. Read the agent's section in `AGENT_WORKFLOW.md`

After each agent:
- Run the success criterion command
- ✅ Passes → announce "✅ Agent N complete" and move to the next
- ❌ Fails  → analyze the root cause, fix, rerun (max 3 attempts)
- After 3 consecutive failures → stop and ask for human validation

**Never move to the next agent without a passing success criterion.**
**Stay strictly within your current agent's defined scope.**

---

## Phase 0 — Agent Decomposition (run this first)

> A `PROJECT_BLUEPRINT.md` was provided.
> Claude Code reads it and decomposes the project into specialized agents
> before writing a single line of code.

**Read these files in order:**
1. `CLAUDE.md`
2. `PROJECT_BLUEPRINT.md`

**Then decompose the project into agents** following these rules:

- One agent = one coherent technical layer (never mix two layers)
- Each agent must have a runnable success criterion (`npm test`, `cargo build`…)
- Agents must be ordered by dependency (no feature without infra first)
- Maximum 6 agents — if you have more, group related ones
- Always respect this order:
  1. Infra & Configuration
  2. Data layer (DB schema, models, services)
  3. External integrations (auth, APIs, local services like Ollama)
  4. UI & pages
  5. Advanced features (RAG, export, realtime…)
  6. Build & release (CI/CD, packaging, installers)

**Write the result directly into `AGENT_WORKFLOW.md`** — replace its current
content with your decomposition.

**Then ask for human validation:**
> "I have decomposed the project into N agents: [list them].
> Should I proceed with execution?"

Wait for confirmation before moving to Phase 1.

---

## Phase 1 — Execution

### Agent 1 · Infra & Setup

**Scope**: scaffold the Node.js/TypeScript project, configure build and test tooling, set up GitHub Actions.

**Skills**: `agents/agent-1-infra/skills.md`

**Deliverables**:
- package.json (commander, inquirer, chalk, ora, tsup, vitest)
- tsconfig.json and tsup.config.ts
- vitest.config.ts
- .github/workflows/release.yml
- src/utils/logger.ts

**Success criterion**:
```bash
npm run build
```

**On failure**:
1. Read the full error output
2. Fix the root cause — not the symptoms
3. Rerun the success criterion (max 3 attempts)
4. After 3 failures → ask for human validation

---

### Agent 2 · Detectors

**Scope**: implement pure detection functions, no side effects.

**Skills**: `agents/agent-2-detectors/skills.md`

**Deliverables**:
- src/detectors/stackDetector.ts
- src/detectors/gitDetector.ts
- src/types/stack.ts
- tests/detectors/stackDetector.test.ts

**Success criterion**:
```bash
npm test
```

**On failure**:
1. Read the full error output
2. Fix the root cause — not the symptoms
3. Rerun the success criterion (max 3 attempts)
4. After 3 failures → ask for human validation

---

### Agent 3 · Generators & Templates

**Scope**: one template per stack, four generators composing them into output files.

**Skills**: `agents/agent-3-generators/skills.md`

**Deliverables**:
- src/templates/ (react, nextjs, tauri, fastapi, express, node, unknown)
- src/generators/claudeMdGenerator.ts
- src/generators/workflowGenerator.ts
- src/generators/playbookGenerator.ts
- src/generators/skillsGenerator.ts
- src/types/agent.ts
- tests/generators/*.test.ts

**Success criterion**:
```bash
npm test
```

**On failure**:
1. Read the full error output
2. Fix the root cause — not the symptoms
3. Rerun the success criterion (max 3 attempts)
4. After 3 failures → ask for human validation

---

### Agent 4 · Commands CLI

**Scope**: wire generators and detectors into CLI commands. No business logic — composition only.

**Skills**: `agents/agent-4-commands/skills.md`

**Deliverables**:
- src/commands/init.ts (--blueprint support)
- src/commands/add.ts (--feature support)
- src/commands/status.ts
- src/cli.ts
- tests/commands/init.test.ts

**Success criterion**:
```bash
npm run build && node dist/cli.js --help
```

**On failure**:
1. Read the full error output
2. Fix the root cause — not the symptoms
3. Rerun the success criterion (max 3 attempts)
4. After 3 failures → ask for human validation

---

## Future Iterations

When a new agent is added via `agentkit add --feature <description>`:
1. A new agent block is appended to `AGENT_WORKFLOW.md`
2. The folder `agents/agent-{N}-{slug}/` is created with `skills.md`
3. This `PLAYBOOK.md` is regenerated to include the new agent — **without Phase 0**
4. Execution resumes at the new agent only — completed agents are not rerun

When you receive the instruction to continue after an iteration:
> "Read PLAYBOOK.md and execute only the agents that haven't been completed yet."

---

## Human Validation Required

Stop and wait for confirmation in these situations:
- **3 consecutive failures** on the same success criterion
- **Missing external dependency**: API key, env variable, unavailable service
- **Conflict** between `PROJECT_BLUEPRINT.md` and the detected stack
- **Destructive operation**: overwriting files not listed in deliverables
- **End of Phase 0**: agent decomposition must be validated before execution