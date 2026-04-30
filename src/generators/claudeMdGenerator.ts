import type { StackInfo } from '../detectors/stackDetector.js'
import { parseBlueprint } from '../utils/blueprintParser.js'
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

  const features = parseBlueprint(blueprintContent)
  if (features.length === 0) return base

  const featureLines = features
    .map((f, i) => {
      const sub = f.items.length > 0 ? '\n' + f.items.map((it) => `   - ${it}`).join('\n') : ''
      return `${i + 1}. **${f.name}**${sub}`
    })
    .join('\n')

  const featureSection = `\n## Features (Blueprint)\n\n${featureLines}\n`

  const conventionsIdx = base.indexOf('\n## Conventions')
  if (conventionsIdx !== -1) {
    return base.slice(0, conventionsIdx) + featureSection + base.slice(conventionsIdx)
  }
  return base + featureSection
}
