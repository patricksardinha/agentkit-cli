import type { Agent } from '../types/agent.js'

export interface PlaybookInput {
  agents: Agent[]
  projectName: string
}

export function generatePlaybook({ agents, projectName }: PlaybookInput): string {
  const agentBlocks = agents.map((a) => agentBlock(a)).join('\n---\n\n')

  return `# PLAYBOOK.md — ${projectName}

> Donne cette instruction à Claude Code : 'Lis PLAYBOOK.md et exécute la procédure.'

## Règles d'exécution globales

Avant chaque agent :
1. Lire \`CLAUDE.md\`
2. Lire \`agents/agent-{N}-{slug}/skills.md\` (le fichier de l'agent courant)

Après chaque agent :
- Exécuter le critère de succès
- Si succès → annoncer "✅ Agent N terminé" et passer au suivant
- Si échec → analyser la cause racine, corriger, réexécuter (max 3 tentatives)
- Après 3 échecs consécutifs → pause et demander validation humaine
- **Ne jamais passer à l'agent suivant sans critère validé**

## Agents

${agentBlocks}

## Itérations futures

Lorsqu'un nouvel agent est ajouté via \`agentkit add --feature <description>\` :
1. Un nouveau bloc agent est ajouté à la fin de \`AGENT_WORKFLOW.md\`
2. Le dossier \`agents/agent-{N}-{slug}/\` est créé avec \`skills.md\` et \`context.md\`
3. Ce \`PLAYBOOK.md\` est régénéré automatiquement pour inclure le nouvel agent
4. L'exécution reprend à ce nouvel agent uniquement — les agents précédents ne sont pas réexécutés

## Validation humaine requise

Les cas suivants nécessitent une pause et une confirmation humaine avant de continuer :
- **3 échecs consécutifs** sur le critère de succès d'un agent
- **Dépendance externe manquante** : clé API, variable d'environnement non définie, service tiers inaccessible
- **Conflit** entre le blueprint fourni (\`--blueprint\`) et la stack détectée automatiquement
`
}

function agentBlock(agent: Agent): string {
  const skillsPath = `agents/agent-${agent.number}-${agent.slug}/skills.md`
  const outputLines =
    agent.outputs.length > 0
      ? agent.outputs.map((o) => `- ${o}`).join('\n')
      : '- (voir skills.md pour le détail)'

  return `### ${agent.fullName}

**Périmètre** : ${agent.scope}

**Skills** : \`${skillsPath}\`

**Fichiers produits** :
${outputLines}

**Critère de succès** :
\`\`\`bash
${agent.criterion || 'npm run build && npm test'}
\`\`\`

**En cas d'échec** :
1. Analyser le message d'erreur complet
2. Corriger la cause racine (pas les symptômes)
3. Réexécuter le critère (max 3 tentatives)
4. Après 3 échecs → demander validation humaine
`
}
