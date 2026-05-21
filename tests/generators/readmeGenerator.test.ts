import { describe, it, expect } from 'vitest'
import { generateReadme } from '../../src/generators/readmeGenerator.js'
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

const sampleBlueprint = `# My Awesome App

## Goal
A desktop app for logging development sessions with local AI search.

## Features
- Session logging with timestamps
- Weekly summary reports
- Natural language search via Ollama

## Tech constraints
- Tauri v2, all local, no cloud
- Ollama for AI, no external API keys
`

// ─── Project name ─────────────────────────────────────────────────────────────

describe('generateReadme — project name', () => {
  it('contains the project name in the title', () => {
    const result = generateReadme({ projectName: 'my-project', stack: makeStack('react') })
    expect(result).toContain('# my-project')
  })

  it('contains the project name when blueprint is present', () => {
    const result = generateReadme({
      projectName: 'devlog-desktop',
      blueprintContent: sampleBlueprint,
      stack: makeStack('tauri', { hasTypeScript: true }),
    })
    expect(result).toContain('# devlog-desktop')
  })
})

// ─── Built with AgentKit ──────────────────────────────────────────────────────

describe('generateReadme — Built with AgentKit section', () => {
  it('always contains the Built with AgentKit section', () => {
    for (const framework of ['react', 'nextjs', 'tauri', 'fastapi', 'express', 'node', 'unknown'] as StackInfo['framework'][]) {
      const result = generateReadme({ projectName: 'test', stack: makeStack(framework) })
      expect(result).toContain('Built with AgentKit')
    }
  })

  it('contains the npmjs link', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('react') })
    expect(result).toContain('https://www.npmjs.com/package/@patricksardinha/agentkit-cli')
  })

  it('contains the PLAYBOOK.md one-liner', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('react') })
    expect(result).toContain('PLAYBOOK.md')
  })
})

// ─── Getting Started — commands per stack ─────────────────────────────────────

describe('generateReadme — Getting Started commands', () => {
  it('Tauri: contains tauri:dev and tauri:build', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('tauri', { hasTypeScript: true }) })
    expect(result).toContain('npm run tauri:dev')
    expect(result).toContain('npm run tauri:build')
  })

  it('React: contains npm run dev and npm run build', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('react') })
    expect(result).toContain('npm run dev')
    expect(result).toContain('npm run build')
    expect(result).not.toContain('tauri')
  })

  it('Next.js: contains npm run dev and npm run build', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('nextjs') })
    expect(result).toContain('npm run dev')
    expect(result).toContain('npm run build')
  })

  it('FastAPI: contains pip install and uvicorn', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('fastapi') })
    expect(result).toContain('pip install -r requirements.txt')
    expect(result).toContain('uvicorn main:app --reload')
  })

  it('Express: contains npm install and npm start', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('express') })
    expect(result).toContain('npm install')
    expect(result).toContain('npm start')
  })

  it('Node.js: contains npm install and npm start', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('node') })
    expect(result).toContain('npm install')
    expect(result).toContain('npm start')
  })

  it('Unknown: contains npm install and npm run dev', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('unknown') })
    expect(result).toContain('npm install')
    expect(result).toContain('npm run dev')
  })
})

// ─── Blueprint: Goal extraction ───────────────────────────────────────────────

describe('generateReadme — Goal extraction from blueprint', () => {
  it('uses the Goal section as the tagline when blueprint is present', () => {
    const result = generateReadme({
      projectName: 'devlog',
      blueprintContent: sampleBlueprint,
      stack: makeStack('tauri', { hasTypeScript: true }),
    })
    expect(result).toContain('A desktop app for logging development sessions')
  })

  it('uses a generic tagline when no blueprint is provided', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('react') })
    expect(result).toContain('React + Vite')
  })

  it('includes Goal content in the Overview section', () => {
    const result = generateReadme({
      projectName: 'devlog',
      blueprintContent: sampleBlueprint,
      stack: makeStack('tauri', { hasTypeScript: true }),
    })
    expect(result).toContain('## Overview')
    expect(result).toContain('A desktop app for logging development sessions')
  })
})

// ─── Blueprint: Features extraction ──────────────────────────────────────────

describe('generateReadme — Features extraction from blueprint', () => {
  it('extracts Features section from blueprint', () => {
    const result = generateReadme({
      projectName: 'devlog',
      blueprintContent: sampleBlueprint,
      stack: makeStack('tauri', { hasTypeScript: true }),
    })
    expect(result).toContain('## Features')
    expect(result).toContain('Session logging with timestamps')
    expect(result).toContain('Weekly summary reports')
    expect(result).toContain('Natural language search via Ollama')
  })

  it('uses placeholder when no blueprint is provided', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('react') })
    expect(result).toContain('## Features')
    expect(result).toContain('Features will be described here')
  })

  it('includes tech constraints from blueprint in the Tech Stack section', () => {
    const result = generateReadme({
      projectName: 'devlog',
      blueprintContent: sampleBlueprint,
      stack: makeStack('tauri', { hasTypeScript: true }),
    })
    expect(result).toContain('Tauri v2, all local, no cloud')
  })
})

// ─── Project structure ────────────────────────────────────────────────────────

describe('generateReadme — Project Structure section', () => {
  it('always contains the Project Structure section', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('react') })
    expect(result).toContain('## Project Structure')
  })

  it('React structure contains src/components/', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('react') })
    expect(result).toContain('components/')
  })

  it('Tauri structure mentions src-tauri/', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('tauri', { hasTypeScript: true }) })
    expect(result).toContain('src-tauri/')
  })

  it('FastAPI structure mentions app/routers/', () => {
    const result = generateReadme({ projectName: 'test', stack: makeStack('fastapi') })
    expect(result).toContain('routers/')
  })
})
