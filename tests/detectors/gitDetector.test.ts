import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { isGitRepo } from '../../src/detectors/gitDetector.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = join(__dirname, '..', '..')
const noGitDir = join(__dirname, 'fixtures', 'no-git')
const nonExistentDir = join(__dirname, 'fixtures', 'nonexistent-xyz')

describe('isGitRepo', () => {
  it('returns true for the project root (which is a git repo)', async () => {
    const result = await isGitRepo(projectRoot)
    expect(result).toBe(true)
  })

  it('returns false for a directory without .git', async () => {
    const result = await isGitRepo(noGitDir)
    expect(result).toBe(false)
  })

  it('returns false for a non-existent path', async () => {
    const result = await isGitRepo(nonExistentDir)
    expect(result).toBe(false)
  })
})
