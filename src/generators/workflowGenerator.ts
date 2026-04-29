import type { StackInfo } from '../detectors/stackDetector.js'
import * as react from '../templates/react.js'
import * as nextjs from '../templates/nextjs.js'
import * as tauri from '../templates/tauri.js'
import * as fastapi from '../templates/fastapi.js'
import * as express from '../templates/express.js'
import * as node from '../templates/node.js'
import * as unknown from '../templates/unknown.js'

export function generateWorkflow(stack: StackInfo): string {
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
