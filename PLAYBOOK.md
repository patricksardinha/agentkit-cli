# PLAYBOOK.md — AgentKit CLI

> **One instruction to give Claude Code:**
> "Read PLAYBOOK.md and execute the procedure."
>
> Claude Code handles the rest autonomously.
> You don't need an API key or additional costs beyond your LLM subscription.

---

## Execution Rules (read before anything else)

You are the orchestrator of this project. Execute the agents below in order,
following these rules at all times:

1. **Before each agent**, read in this order:
   - `CLAUDE.md`
   - `agents/agent-{N}-{slug}/skills.md` (if it exists)
   - The agent's section in `AGENT_WORKFLOW.md`

2. **After each agent**, run the success criterion command.
   - ✅ Passes → announce "✅ Agent N complete" and move to the next
   - ❌ Fails  → analyze the error, fix only what is in your scope, rerun
   - After 3 consecutive failures → stop and ask for human validation

3. **Never move to the next agent** without a passing success criterion.

4. **Stay within scope** — do not touch files outside your current agent's
   defined deliverables.

5. At the end of all agents → announce "🎉 Workflow complete" and list
   everything that was produced.

---

## Agent 1 · Infra & Setup

**Scope:** scaffold the Node.js/TypeScript project structure, configure
all build and test tooling, set up GitHub Actions for automated npm publishing.

**Skills:** `agents/agent-1-infra/skills.md`

**Deliverables:**
- `package.json` with commander, inquirer, chalk, ora, tsup, vitest
- `tsconfig.json` and `tsup.config.ts`
- `vitest.config.ts`
- `.github/workflows/release.yml` (npm publish on `v*` tag)
- `src/utils/logger.ts` (chalk + ora, no direct console.log elsewhere)

**Success criterion:**
```bash
npm run build
```

**On failure:** read the error output, fix only the configuration files
in your scope, rerun `npm run build`. Do not touch src/commands/ or
src/generators/ — those are out of scope for this agent.

---

## Agent 2 · Detectors

**Depends on:** Agent 1 complete

**Scope:** implement pure detection functions that read a target project
directory and return a typed StackInfo object. No side effects.

**Skills:** `agents/agent-2-detectors/skills.md`

**Deliverables:**
- `src/detectors/stackDetector.ts`
  - Detects: react, nextjs, tauri, fastapi, express, node, unknown
  - Detects extras: typescript, tailwind, prisma, testing
  - Returns a typed `StackInfo` object
- `src/detectors/gitDetector.ts`
  - Returns true if the target directory contains a `.git` folder
- `tests/detectors/stackDetector.test.ts`
  - Fixtures for each supported stack (package.json mocks)
  - Tests for TypeScript, Tailwind, Prisma detection

**Success criterion:**
```bash
npm test
```

**On failure:** check the fixture paths, fix the detector logic or test
setup, rerun `npm test`.

---

## Agent 3 · Generators & Templates

**Depends on:** Agent 2 complete

**Scope:** implement one template per stack and four generators that
compose them into output files. The playbookGenerator is the core
deliverable of this agent.

**Skills:** `agents/agent-3-generators/skills.md`

**Deliverables:**
- `src/templates/react.ts` — exports `claudeMd(stack)` and `workflow(stack)`
- `src/templates/nextjs.ts`
- `src/templates/tauri.ts`
- `src/templates/fastapi.ts`
- `src/templates/express.ts`
- `src/templates/node.ts`
- `src/templates/unknown.ts`
- `src/generators/claudeMdGenerator.ts`
  - Routes to the right template based on `stack.framework`
  - Accepts optional `blueprintContent?: string`
- `src/generators/workflowGenerator.ts`
  - Same routing + blueprint support
  - Returns a typed `Agent[]` array alongside the markdown string
- `src/generators/playbookGenerator.ts`
  - Takes `Agent[]` and `projectName`
  - Generates PLAYBOOK.md with execution rules, per-agent blocks,
    retry logic, and human escalation section
- `src/generators/skillsGenerator.ts`
  - Takes `Agent[]`
  - Creates `agents/agent-{N}-{slug}/skills.md` for each agent
- `tests/generators/*.test.ts` for each generator

**Success criterion:**
```bash
npm test
```

**On failure:** check that template exports match the expected signature
`(stack: StackInfo) => string`, fix, rerun `npm test`.

---

## Agent 4 · Commands CLI

**Depends on:** Agents 2 and 3 complete

**Scope:** wire all generators and detectors into the three CLI commands
using commander.js. This agent writes no business logic — it only
composes existing modules.

**Skills:** `agents/agent-4-commands/skills.md`

**Deliverables:**
- `src/commands/init.ts`
  - Detects stack with `stackDetector`
  - Accepts `--blueprint <path>` — reads file if present, warns if missing
  - Calls all four generators in order
  - Writes CLAUDE.md, AGENT_WORKFLOW.md, PLAYBOOK.md to project root
  - Calls skillsGenerator to create `agents/` folder structure
- `src/commands/add.ts`
  - Accepts `--feature <description>`
  - Reads existing AGENT_WORKFLOW.md to find last agent number
  - Appends new agent block
  - Creates `agents/agent-{N+1}-{slug}/skills.md`
  - Regenerates PLAYBOOK.md with all agents including the new one
- `src/commands/status.ts`
  - Reads AGENT_WORKFLOW.md if present and displays current state
- `src/cli.ts` — registers all three commands with commander
- `tests/commands/init.test.ts`

**Success criterion:**
```bash
npm run build && node dist/cli.js --help
```

**On failure:** check that all imports resolve correctly, fix only
src/commands/ and src/cli.ts, rerun the criterion.

---

## Human Validation Required

Stop and wait for confirmation in these situations:

- 3 consecutive failures on the same success criterion
- A missing external dependency (API key, environment variable, binary)
- A conflict between the detected stack and the blueprint content
- Any destructive file operation (overwriting files not listed in deliverables)

---

## Future Iterations

When you receive an `agentkit add --feature "..."` instruction:

1. Read `AGENT_WORKFLOW.md` to identify the last agent number
2. Implement only the new feature — do not re-implement completed agents
3. Update `AGENT_WORKFLOW.md` with the new agent block
4. Create `agents/agent-{N+1}-{slug}/skills.md`
5. Regenerate `PLAYBOOK.md` to include the new agent
