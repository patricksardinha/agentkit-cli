import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Agent } from '../types/agent.js'

export async function generateSkills(agents: Agent[], outputDir: string): Promise<void> {
  for (const agent of agents) {
    const agentDir = join(outputDir, 'agents', `agent-${agent.number}-${agent.slug}`)
    await mkdir(agentDir, { recursive: true })
    await writeFile(join(agentDir, 'skills.md'), skillsMd(agent), 'utf-8')
    await writeFile(join(agentDir, 'context.md'), contextMd(agent), 'utf-8')
  }
}

function skillsMd(agent: Agent): string {
  return `# Skills — ${agent.fullName}

> Ce fichier est lu par l'agent avant de commencer.

## Contexte technique

<!-- À remplir : bibliothèques, versions, décisions d'architecture spécifiques à cet agent -->

## Documentation de référence

<!-- À remplir : liens vers docs, exemples, ADRs pertinents -->

## Conventions spécifiques

<!-- À remplir : règles propres à cet agent (naming, patterns, structure de fichiers) -->
`
}

function contextMd(agent: Agent): string {
  const outputLines =
    agent.outputs.length > 0
      ? agent.outputs.map((o) => `- ${o}`).join('\n')
      : '- (voir AGENT_WORKFLOW.md)'

  return `# Context — ${agent.fullName}

> Ce fichier fournit le contexte additionnel à l'agent avant exécution.
> À compléter avant de lancer cet agent.

## Périmètre

${agent.scope}

## Fichiers produits attendus

${outputLines}

## Critère de succès

\`${agent.criterion || 'npm run build && npm test'}\`
`
}
