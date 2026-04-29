import chalk from 'chalk'

export const logger = {
  info: (message: string): void => {
    process.stdout.write(chalk.blue('ℹ') + ' ' + message + '\n')
  },
  success: (message: string): void => {
    process.stdout.write(chalk.green('✔') + ' ' + message + '\n')
  },
  warn: (message: string): void => {
    process.stdout.write(chalk.yellow('⚠') + ' ' + message + '\n')
  },
  error: (message: string): void => {
    process.stderr.write(chalk.red('✖') + ' ' + message + '\n')
  },
}
