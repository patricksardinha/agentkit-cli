import type { StackInfo } from '../detectors/stackDetector.js'
import * as react from '../templates/react.js'
import * as nextjs from '../templates/nextjs.js'
import * as tauri from '../templates/tauri.js'
import * as fastapi from '../templates/fastapi.js'
import * as express from '../templates/express.js'
import * as node from '../templates/node.js'
import * as unknown from '../templates/unknown.js'

export function generateClaudeMd(stack: StackInfo, blueprintContent?: string): string {
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

  if (!blueprintContent) return base

  const blueprintNote = '\n> A PROJECT_BLUEPRINT.md is present — Claude Code will read it during Phase 0.\n'

  const conventionsIdx = base.indexOf('\n## Conventions')
  if (conventionsIdx !== -1) {
    return base.slice(0, conventionsIdx) + blueprintNote + base.slice(conventionsIdx)
  }
  return base + blueprintNote
}
