import type { StackInfo } from '../detectors/stackDetector.js'
import * as react from '../templates/react.js'
import * as nextjs from '../templates/nextjs.js'
import * as tauri from '../templates/tauri.js'
import * as fastapi from '../templates/fastapi.js'
import * as express from '../templates/express.js'
import * as node from '../templates/node.js'
import * as unknown from '../templates/unknown.js'

const STACK_NOT_CONFIGURED_WARNING = `
## ⚠️ Stack not configured
AgentKit could not detect your stack and no stack was selected.
Before running Claude Code, fill in the following sections:
- Stack (framework, runtime, DB, tools)
- Commands (dev, build, test)
- Structure (folder layout)

Once filled, give Claude Code this instruction:
"Read PLAYBOOK.md and execute the procedure."
`

export function generateClaudeMd(stack: StackInfo, blueprintContent?: string, stackNotConfigured?: boolean): string {
  let base: string
  switch (stack.framework) {
    case 'react':   base = react.claudeMd(stack); break
    case 'nextjs':  base = nextjs.claudeMd(stack); break
    case 'tauri':   base = tauri.claudeMd(stack); break
    case 'fastapi': base = fastapi.claudeMd(stack); break
    case 'express': base = express.claudeMd(stack); break
    case 'node':    base = node.claudeMd(stack); break
    default:        base = unknown.claudeMd(stack)
  }

  if (stackNotConfigured) {
    const firstNewline = base.indexOf('\n')
    base = base.slice(0, firstNewline + 1) + STACK_NOT_CONFIGURED_WARNING + base.slice(firstNewline + 1)
  }

  if (!blueprintContent) return base

  const blueprintNote = '\n> A PROJECT_BLUEPRINT.md is present — Claude Code will read it during Phase 0.\n'

  const conventionsIdx = base.indexOf('\n## Conventions')
  if (conventionsIdx !== -1) {
    return base.slice(0, conventionsIdx) + blueprintNote + base.slice(conventionsIdx)
  }
  return base + blueprintNote
}
