import type { StackInfo } from '../detectors/stackDetector.js'
import * as react from '../templates/react.js'
import * as nextjs from '../templates/nextjs.js'
import * as tauri from '../templates/tauri.js'
import * as fastapi from '../templates/fastapi.js'
import * as express from '../templates/express.js'
import * as node from '../templates/node.js'
import * as unknown from '../templates/unknown.js'

export function generateClaudeMd(stack: StackInfo): string {
  switch (stack.framework) {
    case 'react':   return react.claudeMd(stack)
    case 'nextjs':  return nextjs.claudeMd(stack)
    case 'tauri':   return tauri.claudeMd(stack)
    case 'fastapi': return fastapi.claudeMd(stack)
    case 'express': return express.claudeMd(stack)
    case 'node':    return node.claudeMd(stack)
    default:        return unknown.claudeMd(stack)
  }
}
