import type { StackInfo } from '../detectors/stackDetector.js'
import * as react from '../templates/react.js'
import * as nextjs from '../templates/nextjs.js'
import * as tauri from '../templates/tauri.js'
import * as fastapi from '../templates/fastapi.js'
import * as express from '../templates/express.js'
import * as node from '../templates/node.js'
import * as unknown from '../templates/unknown.js'

export function generateWorkflow(stack: StackInfo, blueprintContent?: string, projectName?: string): string {
  if (blueprintContent) return blueprintPlaceholder(projectName ?? stack.framework)

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

function blueprintPlaceholder(projectName: string): string {
  return `# AGENT_WORKFLOW.md — ${projectName}

> This file will be filled in by Claude Code during Phase 0.
> Claude Code will read PROJECT_BLUEPRINT.md, propose a decomposition,
> and replace this content after human validation.

---

*Waiting for Phase 0 decomposition...*
`
}
