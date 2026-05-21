#!/usr/bin/env node
import { Command } from 'commander'
import { createRequire } from 'module'
import { registerInit } from './commands/init.js'
import { registerAdd } from './commands/add.js'
import { registerStatus } from './commands/status.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json')

const program = new Command()

program
  .name('agentkit')
  .description('Scaffold AI-native agent workflows for Claude Code')
  .version(version)

registerInit(program)
registerAdd(program)
registerStatus(program)

program.parse()