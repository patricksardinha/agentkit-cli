import type { Command } from 'commander'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import chalk from 'chalk'
import { detectStack } from '../detectors/stackDetector.js'
import { isGitRepo } from '../detectors/gitDetector.js'
import { logger } from '../utils/logger.js'

export function registerStatus(program: Command): void {
  program
    .command('status')
    .description('Affiche l\'état du workflow agentkit dans le dossier courant')
    .action(async () => {
      const cwd = process.cwd()

      const [stack, isGit, claudeMd, workflow] = await Promise.all([
        detectStack(cwd),
        isGitRepo(cwd),
        readFile(join(cwd, 'CLAUDE.md'), 'utf-8').catch(() => null),
        readFile(join(cwd, 'AGENT_WORKFLOW.md'), 'utf-8').catch(() => null),
      ])

      process.stdout.write('\n' + chalk.bold('AgentKit Status') + '\n')
      process.stdout.write('─'.repeat(40) + '\n')

      process.stdout.write(
        chalk.bold('Git repo     : ') +
          (isGit ? chalk.green('✔ oui') : chalk.red('✖ non')) +
          '\n',
      )

      process.stdout.write(
        chalk.bold('Stack        : ') + chalk.cyan(stack.framework) + ' (' + stack.language + ')\n',
      )

      process.stdout.write(
        chalk.bold('CLAUDE.md    : ') +
          (claudeMd !== null ? chalk.green('✔ présent') : chalk.yellow('✖ absent — lancez agentkit init')) +
          '\n',
      )

      process.stdout.write(
        chalk.bold('AGENT_WORKFLOW.md : ') +
          (workflow !== null ? chalk.green('✔ présent') : chalk.yellow('✖ absent — lancez agentkit init')) +
          '\n',
      )

      if (workflow !== null) {
        const agentMatches = workflow.match(/^### Agent \d+/gm) ?? []
        process.stdout.write(
          chalk.bold('Agents définis   : ') + chalk.cyan(String(agentMatches.length)) + '\n',
        )
      }

      process.stdout.write('─'.repeat(40) + '\n\n')
    })
}
