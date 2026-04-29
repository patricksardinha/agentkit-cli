#!/usr/bin/env node
import { Command } from 'commander'
import { registerInit } from './commands/init.js'
import { registerAdd } from './commands/add.js'
import { registerStatus } from './commands/status.js'

const program = new Command()

program
  .name('agentkit')
  .description('Scaffolder des workflows multi-agents Claude Code')
  .version('0.1.0')

registerInit(program)
registerAdd(program)
registerStatus(program)

program.parse()
