import type { Agent } from '../types/agent.js'

export interface PlaybookInput {
  agents: Agent[]
  projectName: string
  hasBlueprint: boolean
}

export function generatePlaybook({ agents, projectName, hasBlueprint }: PlaybookInput): string {
  const agentBlocks = agents.map((a) => agentBlock(a)).join('\n---\n\n')

  const phase0 = hasBlueprint
    ? `## Phase 0 — Agent Decomposition (run this first)

> A \`PROJECT_BLUEPRINT.md\` was provided.
> Claude Code reads it and decomposes the project into specialized agents
> before writing a single line of code.

**Read these files in order:**
1. \`CLAUDE.md\`
2. \`PROJECT_BLUEPRINT.md\`

**Then decompose the project into agents** following these rules:

- One agent = one coherent technical layer (never mix two layers)
- Each agent must have a runnable success criterion (\`npm test\`, \`cargo build\`…)
- Agents must be ordered by dependency (no feature without infra first)
- Maximum 6 agents — if you have more, group related ones
- Always respect this order:
  1. Infra & Configuration
  2. Data layer (DB schema, models, services)
  3. External integrations (auth, APIs, local services like Ollama)
  4. UI & pages
  5. Advanced features (RAG, export, realtime…)
  6. Build & release (CI/CD, packaging, installers)

**Write the result directly into \`AGENT_WORKFLOW.md\`** — replace its current
content with your decomposition.

**Then ask for human validation:**
> "I have decomposed the project into N agents: [list them].
> Should I proceed with execution?"

Wait for confirmation before moving to Phase 1.

---

`
    : `## Phase 0 — Project Discovery (run this first)

> No \`PROJECT_BLUEPRINT.md\` was provided.
> Before writing any code, Claude Code asks the user what they want to build,
> then decomposes the project into agents — exactly as if a blueprint had been provided.

**Ask the user these questions and wait for their answers:**

1. What is this project? (one sentence describing the goal)
2. What are the main features you want to build? (list them)
3. Are there any tech constraints or architecture preferences?
   (e.g. offline-only, specific DB, no auth, specific framework)

**Once you have the answers, decompose the project into agents**
following these rules:

- One agent = one coherent technical layer (never mix two layers)
- Each agent must have a runnable success criterion (\`npm test\`, \`cargo build\`…)
- Agents must be ordered by dependency (no feature without infra first)
- Maximum 6 agents — if you have more, group related ones
- Always respect this order:
  1. Infra & Configuration
  2. Data layer (DB schema, models, services)
  3. External integrations (auth, APIs, local services like Ollama)
  4. UI & pages
  5. Advanced features (RAG, export, realtime…)
  6. Build & release (CI/CD, packaging, installers)

**Write the result directly into \`AGENT_WORKFLOW.md\`** — replace its current
content with your decomposition.

**Then ask for human validation:**
> "I have decomposed the project into N agents: [list them].
> Should I proceed with execution?"

Wait for confirmation before moving to Phase 1.

---

`

  const betweenPhase = `## Between Phase 0 and Phase 1 — Skills Enrichment

Once the decomposition is validated, before writing any code:

1. Create all agent folders and empty skills files:
   For each agent in your decomposition, create:
   - agents/agent-{N}-{slug}/skills.md  (empty for now)

2. Announce to the user:
   "Agent folders created under agents/.

   You can now enrich any skills.md with additional context
   before I start executing:
   - API documentation
   - Database schemas
   - Algorithm references
   - Business conventions
   - Any project-specific knowledge

   Add .md files directly in the relevant agent folder —
   I will read everything in agents/agent-{N}-{slug}/ before
   starting that agent.

   Type 'proceed' (or any message) when you're ready
   and I'll start Phase 1."

3. Wait for the user's message before starting Phase 1.
   Do not start Agent 1 until the user explicitly responds.

---

`

  return `# PLAYBOOK.md — ${projectName}

> **One instruction to give Claude Code:**
> "Read PLAYBOOK.md and execute the procedure."
>
> Claude Code handles the rest autonomously — project discovery or blueprint reading,
> agent decomposition, execution, success validation, retries, and human escalation.
> No API key required. No additional cost beyond your LLM subscription.

---

## Global Execution Rules

Before each agent:
1. Read \`CLAUDE.md\`
2. Read \`agents/agent-{N}-{slug}/skills.md\` (current agent's file)
3. Read the agent's section in \`AGENT_WORKFLOW.md\`

After each agent:
- Run the success criterion command
- ✅ Passes → announce "✅ Agent N complete" and move to the next
- ❌ Fails  → analyze the root cause, fix, rerun (max 3 attempts)
- After 3 consecutive failures → stop and ask for human validation

**Never move to the next agent without a passing success criterion.**
**Stay strictly within your current agent's defined scope.**

---

${phase0}${betweenPhase}## Phase 1 — Execution

${agentBlocks}

---

## Future Iterations

When a new agent is added via \`agentkit add --feature <description>\`:
1. A new agent block is appended to \`AGENT_WORKFLOW.md\`
2. The folder \`agents/agent-{N}-{slug}/\` is created with \`skills.md\`
3. This \`PLAYBOOK.md\` is regenerated to include the new agent
4. Execution resumes at the new agent only — completed agents are not rerun

When you receive the instruction to continue after an iteration:
> "Read PLAYBOOK.md and execute only the agents that haven't been completed yet."

---

## Human Validation Required

Stop and wait for confirmation in these situations:
- **3 consecutive failures** on the same success criterion
- **Missing external dependency**: API key, env variable, unavailable service
- **Conflict** between the detected stack and the user's stated constraints
- **Destructive operation**: overwriting files not listed in deliverables
- **End of Phase 0**: agent decomposition must be validated before execution
`
}

function agentBlock(agent: Agent): string {
  const skillsPath = `agents/agent-${agent.number}-${agent.slug}/skills.md`
  const outputLines =
    agent.outputs.length > 0
      ? agent.outputs.map((o) => `- ${o}`).join('\n')
      : '- (see skills.md for details)'

  return `### Agent ${agent.number} · ${agent.name}

**Scope**: ${agent.scope}

**Skills**: \`${skillsPath}\`

**Deliverables**:
${outputLines}

**Success criterion**:
\`\`\`bash
${agent.criterion || 'npm run build && npm test'}
\`\`\`

**On failure**:
1. Read the full error output
2. Fix the root cause — not the symptoms
3. Rerun the success criterion (max 3 attempts)
4. After 3 failures → ask for human validation
`
}