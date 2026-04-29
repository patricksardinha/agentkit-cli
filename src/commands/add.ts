import type { Command } from 'commander'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import inquirer from 'inquirer'
import { logger } from '../utils/logger.js'

export function registerAdd(program: Command): void {
  const addCmd = program
    .command('add')
    .description('Ajoute des ressources au projet agentkit')

  addCmd
    .command('agent')
    .description('Ajoute un nouvel agent dans AGENT_WORKFLOW.md')
    .action(async () => {
      const cwd = process.cwd()
      const workflowPath = join(cwd, 'AGENT_WORKFLOW.md')

      let existing = ''
      try {
        existing = await readFile(workflowPath, 'utf-8')
      } catch {
        logger.error('AGENT_WORKFLOW.md introuvable — lancez d\'abord : agentkit init')
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
          message: `Nom de l'agent (ex: "Agent ${nextNumber} · Feature X") :`,
          default: `Agent ${nextNumber}`,
        },
        {
          type: 'input',
          name: 'scope',
          message: 'Périmètre (une phrase) :',
        },
        {
          type: 'input',
          name: 'outputs',
          message: 'Fichiers produits (séparés par des virgules) :',
        },
        {
          type: 'input',
          name: 'criterion',
          message: 'Critère de succès :',
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
      logger.success(`Agent "${answers.name}" ajouté dans AGENT_WORKFLOW.md`)
    })
}
