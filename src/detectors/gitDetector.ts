import { access } from 'node:fs/promises'
import { join } from 'node:path'

export async function isGitRepo(projectPath: string): Promise<boolean> {
  try {
    await access(join(projectPath, '.git'))
    return true
  } catch {
    return false
  }
}
