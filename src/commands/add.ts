import type { Command } from 'commander'
import { readFile, writeFile } from 'node:fs/promises'
import { join, basename } from 'node:path'
import inquirer from 'inquirer'
import { logger } from '../utils/logger.js'
import { extractAgentsFromWorkflow, toSlug } from '../utils/agentParser.js'
import { generatePlaybook } from '../generators/playbookGenerator.js'
import { generateSkills } from '../generators/skillsGenerator.js'
import type { Agent } from '../types/agent.js'

function featureToAgentName(description: string): string {
  const clean = description
    .replace(/^(add|implement|create|build|integrate|setup|configure|refactor|improve)\s+/i, '')
    .trim()
  return clean.replace(/\b\w/g, (c) => c.toUpperCase())
}

export interface AddFeatureResult {
  agent: Agent
  agentDirPath: string
}

export async function addFeatureToProject(
  description: string,
  projectDir: string,
): Promise<AddFeatureResult> {
  const workflowPath = join(projectDir, 'AGENT_WORKFLOW.md')
  const playbookPath = join(projectDir, 'PLAYBOOK.md')

  let workflowContent = ''
  try {
    workflowContent = await readFile(workflowPath, 'utf-8')
  } catch {
    throw new Error(`AGENT_WORKFLOW.md not found in ${projectDir} — run agentkit init first`)
  }

  const existingAgents = extractAgentsFromWorkflow(workflowContent)
  const nextNumber = existingAgents.length + 1
  const name = featureToAgentName(description)
  const slug = toSlug(name)
  const fullName = `Agent ${nextNumber} · ${name}`

  const newAgent: Agent = {
    number: nextNumber,
    name,
    fullName,
    slug,
    scope: description,
    outputs: [`agents/agent-${nextNumber}-${slug}/`],
    criterion: 'npm run build && npm test',
  }

  const agentBlock = `
### ${fullName}
Périmètre : ${description}
Produit   :
  - agents/agent-${nextNumber}-${slug}/
Critère   : npm run build && npm test
`

  await writeFile(workflowPath, workflowContent + agentBlock, 'utf-8')
  await generateSkills([newAgent], projectDir)

  let projectName = basename(projectDir)
  try {
    const pkg = JSON.parse(
      await readFile(join(projectDir, 'package.json'), 'utf-8'),
    ) as { name?: string }
    if (pkg.name) projectName = pkg.name
  } catch { /* use dirname fallback */ }

  const allAgents = [...existingAgents, newAgent]

  // When adding a feature iteration, hasBlueprint is false —
  // Phase 0 decomposition only runs during the initial init with --blueprint.
  const playbookContent = generatePlaybook({
    agents: allAgents,
    projectName,
    hasBlueprint: false,
  })
  await writeFile(playbookPath, playbookContent, 'utf-8')

  return {
    agent: newAgent,
    agentDirPath: join(projectDir, 'agents', `agent-${nextNumber}-${slug}`),
  }
}

export function registerAdd(program: Command): void {
  const addCmd = program
    .command('add')
    .description('Add resources to the agentkit project')
    .option('--feature <description>', 'Add an agent from a feature description and regenerate PLAYBOOK.md')
    .action(async (options: { feature?: string }) => {
      if (options.feature) {
        try {
          const result = await addFeatureToProject(options.feature, process.cwd())
          logger.success(`Agent added    : ${result.agent.fullName}`)
          logger.success(`Folder created : agents/agent-${result.agent.number}-${result.agent.slug}/`)
          logger.success('PLAYBOOK.md    : regenerated')
        } catch (err) {
          logger.error(err instanceof Error ? err.message : String(err))
          process.exit(1)
        }
      } else {
        addCmd.help()
      }
    })

  addCmd
    .command('agent')
    .description('Add a new agent to AGENT_WORKFLOW.md (interactive)')
    .action(async () => {
      const cwd = process.cwd()
      const workflowPath = join(cwd, 'AGENT_WORKFLOW.md')

      let existing = ''
      try {
        existing = await readFile(workflowPath, 'utf-8')
      } catch {
        logger.error('AGENT_WORKFLOW.md not found — run agentkit init first')
        process.exit(1)
      }

      const agentCount = (existing.match(/^### Agent \d+/gm) ?? []).length
      const nextNumber = agentCount + 1

      const answers = await inquirer.prompt<{
        name: string
        scope: string
        outputs: string
        criterion: string
      }>([
        {
          type: 'input',
          name: 'name',
          message: `Agent name (e.g. "Agent ${nextNumber} · Feature X"):`,
          default: `Agent ${nextNumber}`,
        },
        {
          type: 'input',
          name: 'scope',
          message: 'Scope (one sentence):',
        },
        {
          type: 'input',
          name: 'outputs',
          message: 'Deliverables (comma-separated):',
        },
        {
          type: 'input',
          name: 'criterion',
          message: 'Success criterion:',
        },
      ])

      const outputLines = answers.outputs
        .split(',')
        .map((o: string) => `  - ${o.trim()}`)
        .join('\n')

      const agentSection = `
### ${answers.name}
Périmètre : ${answers.scope}
Produit   :
${outputLines}
Critère   : ${answers.criterion}
`

      await writeFile(workflowPath, existing + agentSection, 'utf-8')
      logger.success(`Agent "${answers.name}" added to AGENT_WORKFLOW.md`)
    })
}