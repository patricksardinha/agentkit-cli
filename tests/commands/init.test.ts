import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { StackInfo } from '../../src/detectors/stackDetector.js'

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}))

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import inquirer from 'inquirer'
import { resolveStack } from '../../src/commands/init.js'
import { generateClaudeMd } from '../../src/generators/claudeMdGenerator.js'

function makeStack(
  framework: StackInfo['framework'],
  opts: Partial<Omit<StackInfo, 'framework'>> = {},
): StackInfo {
  return {
    framework,
    language: framework === 'fastapi' ? 'python' : opts.hasTypeScript ? 'typescript' : 'javascript',
    hasTypeScript: opts.hasTypeScript ?? false,
    extras: opts.extras ?? [],
    ...opts,
  }
}

describe('resolveStack', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns detected stack unchanged when framework is not unknown — no prompt shown', async () => {
    const detected = makeStack('react', { hasTypeScript: true })
    const result = await resolveStack(detected)

    expect(result.stack).toEqual(detected)
    expect(result.stackNotConfigured).toBe(false)
    expect(vi.mocked(inquirer.prompt)).not.toHaveBeenCalled()
  })

  it('does not prompt for any known framework', async () => {
    const frameworks: StackInfo['framework'][] = ['nextjs', 'tauri', 'fastapi', 'express', 'node']
    for (const framework of frameworks) {
      vi.clearAllMocks()
      const result = await resolveStack(makeStack(framework))
      expect(result.stackNotConfigured).toBe(false)
      expect(vi.mocked(inquirer.prompt)).not.toHaveBeenCalled()
    }
  })

  it('prompts for stack selection when framework is unknown', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selectedFramework: 'tauri' })

    const result = await resolveStack(makeStack('unknown'))

    expect(vi.mocked(inquirer.prompt)).toHaveBeenCalledOnce()
    expect(result.stack.framework).toBe('tauri')
    expect(result.stack.language).toBe('javascript')
    expect(result.stackNotConfigured).toBe(false)
  })

  it('unknown + user selects Tauri → stack.framework is tauri', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selectedFramework: 'tauri' })

    const result = await resolveStack(makeStack('unknown'))

    expect(result.stack.framework).toBe('tauri')
    expect(result.stackNotConfigured).toBe(false)
  })

  it('unknown + user selects FastAPI → language is python', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selectedFramework: 'fastapi' })

    const result = await resolveStack(makeStack('unknown'))

    expect(result.stack.framework).toBe('fastapi')
    expect(result.stack.language).toBe('python')
    expect(result.stackNotConfigured).toBe(false)
  })

  it('unknown + user selects "None of the above" → stackNotConfigured is true, framework stays unknown', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selectedFramework: 'none' })

    const result = await resolveStack(makeStack('unknown'))

    expect(result.stack.framework).toBe('unknown')
    expect(result.stackNotConfigured).toBe(true)
  })
})

describe('generateClaudeMd — stackNotConfigured warning', () => {
  it('includes warning block when stackNotConfigured is true', () => {
    const result = generateClaudeMd(makeStack('unknown'), undefined, true)
    expect(result).toContain('⚠️ Stack not configured')
    expect(result).toContain('AgentKit could not detect your stack')
    expect(result).toContain('Stack (framework, runtime, DB, tools)')
    expect(result).toContain('Read PLAYBOOK.md and execute the procedure.')
  })

  it('does not include warning block when stackNotConfigured is false', () => {
    const result = generateClaudeMd(makeStack('unknown'), undefined, false)
    expect(result).not.toContain('⚠️ Stack not configured')
  })

  it('does not include warning block when stackNotConfigured is omitted', () => {
    const result = generateClaudeMd(makeStack('unknown'))
    expect(result).not.toContain('⚠️ Stack not configured')
  })

  it('unknown + None selected → uses unknown template content', () => {
    const result = generateClaudeMd(makeStack('unknown'), undefined, true)
    expect(result).toContain('## Stack')
    expect(result).toContain('## Commands')
    expect(result).toContain('## Conventions')
  })

  it('unknown + Tauri selected → resolveStack returns tauri, generateClaudeMd uses tauri template', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selectedFramework: 'tauri' })

    const { stack, stackNotConfigured } = await resolveStack(makeStack('unknown'))
    const result = generateClaudeMd(stack, undefined, stackNotConfigured)

    expect(stack.framework).toBe('tauri')
    expect(stackNotConfigured).toBe(false)
    expect(result).toContain('Tauri')
    expect(result).toContain('Rust')
    expect(result).not.toContain('⚠️ Stack not configured')
  })

  it('warning block still present alongside blueprint note when both are set', () => {
    const blueprint = '# My App\n\n## Goal\nSomething\n'
    const result = generateClaudeMd(makeStack('unknown'), blueprint, true)
    expect(result).toContain('⚠️ Stack not configured')
    expect(result).toContain('PROJECT_BLUEPRINT.md is present')
  })
})
