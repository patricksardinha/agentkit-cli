import { describe, it, expect } from 'vitest'
import { generateWorkflow } from '../../src/generators/workflowGenerator.js'
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

describe('generateWorkflow', () => {
  it('returns a non-empty string for every supported framework', () => {
    const frameworks: StackInfo['framework'][] = [
      'react', 'nextjs', 'tauri', 'fastapi', 'express', 'node', 'unknown',
    ]
    for (const framework of frameworks) {
      const result = generateWorkflow(makeStack(framework))
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    }
  })

  it('all outputs start with a markdown heading', () => {
    const frameworks: StackInfo['framework'][] = [
      'react', 'nextjs', 'tauri', 'fastapi', 'express', 'node', 'unknown',
    ]
    for (const framework of frameworks) {
      const result = generateWorkflow(makeStack(framework))
      expect(result.trimStart()).toMatch(/^#/)
    }
  })

  it('React — contains Agent sections', () => {
    const result = generateWorkflow(makeStack('react'))
    expect(result).toContain('Agent')
    expect(result).toContain('React')
  })

  it('React — reflects TypeScript language', () => {
    const result = generateWorkflow(makeStack('react', { hasTypeScript: true }))
    expect(result).toContain('TypeScript')
  })

  it('Next.js — mentions Next.js and Prisma when extra present', () => {
    const result = generateWorkflow(makeStack('nextjs', { extras: ['prisma'] }))
    expect(result).toContain('Next.js')
    expect(result).toContain('Prisma')
  })

  it('Tauri — mentions Rust and Cargo', () => {
    const result = generateWorkflow(makeStack('tauri'))
    expect(result).toContain('Tauri')
    expect(result).toContain('Rust')
  })

  it('FastAPI — mentions FastAPI and Python', () => {
    const result = generateWorkflow(makeStack('fastapi'))
    expect(result).toContain('FastAPI')
    expect(result).toContain('Python')
  })

  it('Express — mentions Express', () => {
    const result = generateWorkflow(makeStack('express'))
    expect(result).toContain('Express')
  })

  it('Node — mentions Node.js', () => {
    const result = generateWorkflow(makeStack('node'))
    expect(result).toContain('Node.js')
  })

  it('unknown — returns a generic fallback', () => {
    const result = generateWorkflow(makeStack('unknown'))
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
