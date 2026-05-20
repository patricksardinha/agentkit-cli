import { describe, it, expect } from 'vitest'
import { generateClaudeMd } from '../../src/generators/claudeMdGenerator.js'
import type { StackInfo } from '../../src/detectors/stackDetector.js'

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

describe('generateClaudeMd', () => {
  it('returns a non-empty string for every supported framework', () => {
    const frameworks: StackInfo['framework'][] = [
      'react', 'nextjs', 'tauri', 'fastapi', 'express', 'node', 'unknown',
    ]
    for (const framework of frameworks) {
      const result = generateClaudeMd(makeStack(framework))
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    }
  })

  it('React — mentions React and expected sections', () => {
    const result = generateClaudeMd(makeStack('react'))
    expect(result).toContain('React')
    expect(result).toContain('## Stack')
    expect(result).toContain('## Commands')
    expect(result).toContain('## Conventions')
  })

  it('React — reflects TypeScript when hasTypeScript is true', () => {
    const result = generateClaudeMd(makeStack('react', { hasTypeScript: true }))
    expect(result).toContain('TypeScript')
  })

  it('React — reflects JavaScript when hasTypeScript is false', () => {
    const result = generateClaudeMd(makeStack('react', { hasTypeScript: false }))
    expect(result).toContain('JavaScript')
  })

  it('Next.js — mentions Next.js and TypeScript', () => {
    const result = generateClaudeMd(makeStack('nextjs', { hasTypeScript: true }))
    expect(result).toContain('Next.js')
    expect(result).toContain('TypeScript')
  })

  it('Next.js — includes Prisma section when extra is present', () => {
    const result = generateClaudeMd(makeStack('nextjs', { extras: ['prisma'] }))
    expect(result).toContain('Prisma')
  })

  it('Tauri — mentions Tauri and Rust', () => {
    const result = generateClaudeMd(makeStack('tauri', { hasTypeScript: true }))
    expect(result).toContain('Tauri')
    expect(result).toContain('Rust')
  })

  it('FastAPI — mentions FastAPI and Python', () => {
    const result = generateClaudeMd(makeStack('fastapi'))
    expect(result).toContain('FastAPI')
    expect(result).toContain('Python')
  })

  it('Express — mentions Express', () => {
    const result = generateClaudeMd(makeStack('express'))
    expect(result).toContain('Express')
  })

  it('Node — mentions Node.js', () => {
    const result = generateClaudeMd(makeStack('node'))
    expect(result).toContain('Node.js')
  })

  it('unknown — returns a fallback string', () => {
    const result = generateClaudeMd(makeStack('unknown'))
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  describe('blueprint note', () => {
    const blueprint = `# My Project\n\n## Goal\nBuild something\n\n## Features\n- Auth\n- Dashboard\n`

    it('adds the blueprint note when blueprintContent is provided', () => {
      const result = generateClaudeMd(makeStack('react'), blueprint)
      expect(result).toContain('PROJECT_BLUEPRINT.md is present')
      expect(result).toContain('Phase 0')
    })

    it('does NOT list blueprint sections as features', () => {
      const result = generateClaudeMd(makeStack('react'), blueprint)
      expect(result).not.toContain('Features (Blueprint)')
      expect(result).not.toContain('**Goal**')
      expect(result).not.toContain('**Features**')
    })

    it('still contains the stack-based template content', () => {
      const result = generateClaudeMd(makeStack('react'), blueprint)
      expect(result).toContain('React')
      expect(result).toContain('## Stack')
      expect(result).toContain('## Commands')
    })

    it('adds blueprint note for unknown stack with blueprint', () => {
      const result = generateClaudeMd(makeStack('unknown'), blueprint)
      expect(result).toContain('PROJECT_BLUEPRINT.md is present')
      expect(result).toContain('Phase 0')
    })

    it('returns base template unchanged when blueprintContent is absent', () => {
      const withBlueprint = generateClaudeMd(makeStack('react'), blueprint)
      const withoutBlueprint = generateClaudeMd(makeStack('react'))
      expect(withBlueprint).not.toBe(withoutBlueprint)
      expect(withoutBlueprint).not.toContain('PROJECT_BLUEPRINT.md is present')
    })

    it('adds blueprint note for every framework', () => {
      const frameworks: StackInfo['framework'][] = [
        'react', 'nextjs', 'tauri', 'fastapi', 'express', 'node', 'unknown',
      ]
      for (const framework of frameworks) {
        const result = generateClaudeMd(makeStack(framework), blueprint)
        expect(result).toContain('PROJECT_BLUEPRINT.md is present')
        expect(result).not.toContain('Features (Blueprint)')
      }
    })
  })
})
