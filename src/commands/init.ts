import type { Command } from 'commander'
import { writeFile, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import inquirer from 'inquirer'
import ora from 'ora'
import { detectStack } from '../detectors/stackDetector.js'
import { isGitRepo } from '../detectors/gitDetector.js'
import { generateClaudeMd } from '../generators/claudeMdGenerator.js'
import { generateWorkflow } from '../generators/workflowGenerator.js'
import { generatePlaybook } from '../generators/playbookGenerator.js'
import { generateSkills } from '../generators/skillsGenerator.js'
import { extractAgentsFromWorkflow } from '../utils/agentParser.js'
import { logger } from '../utils/logger.js'
import type { StackInfo } from '../detectors/stackDetector.js'
import { basename } from 'node:path'

const FRAMEWORK_LABELS: Record<StackInfo['framework'], string> = {
  react: 'React',
  nextjs: 'Next.js',
  tauri: 'Tauri',
  fastapi: 'FastAPI (Python)',
  express: 'Express',
  node: 'Node.js',
  unknown: 'Unknown (generic)',
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await readFile(path)
    return true
  } catch {
    return false
  }
}

export function registerInit(program: Command): void {
  program
    .command('init')
    .description('Génère CLAUDE.md et AGENT_WORKFLOW.md dans le dossier courant')
    .option('-f, --force', 'Écrase les fichiers existants sans confirmation')
    .option('--blueprint <path>', 'Fichier blueprint .md à utiliser pour personnaliser les fichiers générés')
    .action(async (options: { force?: boolean; blueprint?: string }) => {
      const cwd = process.cwd()

      const spinner = ora('Détection de la stack…').start()
      const [stack, isGit] = await Promise.all([detectStack(cwd), isGitRepo(cwd)])
      spinner.stop()

      if (!isGit) {
        logger.warn('Ce dossier n\'est pas un repo git — lancez git init si nécessaire')
      }

      const label = FRAMEWORK_LABELS[stack.framework]
      logger.info(`Stack détectée : ${label} (${stack.language})`)

      const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
        {
          type: 'confirm',
          name: 'confirmed',
          message: `Générer les fichiers pour ${label} ?`,
          default: true,
        },
      ])

      if (!confirmed) {
        logger.warn('Annulé.')
        return
      }

      const claudeMdPath = join(cwd, 'CLAUDE.md')
      const workflowPath = join(cwd, 'AGENT_WORKFLOW.md')
      const playbookPath = join(cwd, 'PLAYBOOK.md')

      // Resolve project name from package.json or directory name
      let projectName = basename(cwd)
      try {
        const pkg = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf-8')) as { name?: string }
        if (pkg.name) projectName = pkg.name
      } catch { /* fallback to dirname */ }

      if (!options.force) {
        const existing: string[] = []
        if (await fileExists(claudeMdPath)) existing.push('CLAUDE.md')
        if (await fileExists(workflowPath)) existing.push('AGENT_WORKFLOW.md')
        if (await fileExists(playbookPath)) existing.push('PLAYBOOK.md')

        if (existing.length > 0) {
          const { overwrite } = await inquirer.prompt<{ overwrite: boolean }>([
            {
              type: 'confirm',
              name: 'overwrite',
              message: `${existing.join(' et ')} existe déjà. Écraser ?`,
              default: false,
            },
          ])
          if (!overwrite) {
            logger.warn('Annulé.')
            return
          }
        }
      }

      // Load blueprint if provided
      let blueprintContent: string | undefined
      if (options.blueprint) {
        try {
          blueprintContent = await readFile(options.blueprint, 'utf-8')
        } catch {
          logger.error(`Blueprint introuvable : ${options.blueprint}`)
          process.exit(1)
        }
      }

      const genSpinner = ora('Génération des fichiers…').start()
      const claudeMdContent = generateClaudeMd(stack, blueprintContent)
      const workflowContent = generateWorkflow(stack, blueprintContent)
      const agents = extractAgentsFromWorkflow(workflowContent)
      const playbookContent = generatePlaybook({ agents, projectName, hasBlueprint: !!blueprintContent })
      await writeFile(claudeMdPath, claudeMdContent, 'utf-8')
      await writeFile(workflowPath, workflowContent, 'utf-8')
      await writeFile(playbookPath, playbookContent, 'utf-8')
      await generateSkills(agents, cwd)
      genSpinner.succeed('Fichiers générés')

      logger.success('CLAUDE.md         → créé')
      logger.success('AGENT_WORKFLOW.md  → créé')
      logger.success('PLAYBOOK.md        → créé')
      logger.success(`agents/           → ${agents.length} dossier(s) créé(s)`)
    })
}
