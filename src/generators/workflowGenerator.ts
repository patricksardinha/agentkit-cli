import type { StackInfo } from '../detectors/stackDetector.js'
import { parseBlueprint } from '../utils/blueprintParser.js'
import { toSlug } from '../utils/agentParser.js'
import * as react from '../templates/react.js'
import * as nextjs from '../templates/nextjs.js'
import * as tauri from '../templates/tauri.js'
import * as fastapi from '../templates/fastapi.js'
import * as express from '../templates/express.js'
import * as node from '../templates/node.js'
import * as unknown from '../templates/unknown.js'

export function generateWorkflow(stack: StackInfo, blueprintContent?: string): string {
  if (blueprintContent) return blueprintWorkflow(stack, blueprintContent)

  switch (stack.framework) {
    case 'react':   return react.workflow(stack)
    case 'nextjs':  return nextjs.workflow(stack)
    case 'tauri':   return tauri.workflow(stack)
    case 'fastapi': return fastapi.workflow(stack)
    case 'express': return express.workflow(stack)
    case 'node':    return node.workflow(stack)
    default:        return unknown.workflow(stack)
  }
}

function blueprintWorkflow(stack: StackInfo, blueprintContent: string): string {
  const features = parseBlueprint(blueprintContent)

  const agentBlocks = features.map((feature, i) => {
    const n = i + 1
    const slug = toSlug(feature.name)
    const outputLines =
      feature.items.length > 0
        ? feature.items.map((item) => `  - ${item}`).join('\n')
        : `  - src/${slug}/`
    return `### Agent ${n} · ${feature.name}
Périmètre : Implémenter la fonctionnalité ${feature.name.toLowerCase()}
Produit   :
${outputLines}
Critère   : npm test (tests ${feature.name.toLowerCase()} passent)`
  })

  const ciN = features.length + 1
  agentBlocks.push(
    `### Agent ${ciN} · Tests & CI
Périmètre : Couverture de tests complète et configuration du pipeline CI
Produit   :
  - tests/
  - .github/workflows/
Critère   : npm test passe, pipeline CI vert`,
  )

  return `# Agent Workflow — ${stack.framework} (Blueprint)

## Stack détectée
Framework: ${stack.framework} | Language: ${stack.language}

## Agents

${agentBlocks.join('\n\n')}
`
}
