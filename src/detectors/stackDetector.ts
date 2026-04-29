import { readFile, access } from 'node:fs/promises'
import { join } from 'node:path'

export interface StackInfo {
  framework: 'react' | 'nextjs' | 'tauri' | 'fastapi' | 'express' | 'node' | 'unknown'
  language: 'typescript' | 'javascript' | 'python' | 'unknown'
  hasTypeScript: boolean
  extras: string[]
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function readJson(p: string): Promise<Record<string, unknown> | null> {
  try {
    const raw = await readFile(p, 'utf-8')
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

async function readText(p: string): Promise<string | null> {
  try {
    return await readFile(p, 'utf-8')
  } catch {
    return null
  }
}

export async function detectStack(projectPath: string): Promise<StackInfo> {
  const info: StackInfo = {
    framework: 'unknown',
    language: 'unknown',
    hasTypeScript: false,
    extras: [],
  }

  const packageJson = await readJson(join(projectPath, 'package.json'))
  const requirementsTxt = await readText(join(projectPath, 'requirements.txt'))
  const hasTauriDir = await pathExists(join(projectPath, 'src-tauri'))
  const hasTsConfig = await pathExists(join(projectPath, 'tsconfig.json'))

  if (packageJson !== null) {
    const deps = (packageJson.dependencies as Record<string, string>) ?? {}
    const devDeps = (packageJson.devDependencies as Record<string, string>) ?? {}
    const allDeps = { ...deps, ...devDeps }

    info.hasTypeScript = 'typescript' in allDeps || hasTsConfig
    info.language = info.hasTypeScript ? 'typescript' : 'javascript'

    // Order matters: most specific first
    if ('next' in allDeps) {
      info.framework = 'nextjs'
    } else if (hasTauriDir || '@tauri-apps/api' in allDeps || '@tauri-apps/cli' in allDeps) {
      info.framework = 'tauri'
    } else if ('react' in allDeps) {
      info.framework = 'react'
    } else if ('express' in allDeps) {
      info.framework = 'express'
    } else {
      info.framework = 'node'
    }

    if ('vitest' in allDeps || 'jest' in allDeps) info.extras.push('testing')
    if ('prisma' in allDeps || '@prisma/client' in allDeps) info.extras.push('prisma')
    if ('tailwindcss' in allDeps) info.extras.push('tailwind')
  }

  if (requirementsTxt !== null && info.framework === 'unknown') {
    info.language = 'python'
    if (/\bfastapi\b/i.test(requirementsTxt)) {
      info.framework = 'fastapi'
    }
  }

  if (hasTauriDir && info.framework === 'unknown') {
    info.framework = 'tauri'
  }

  return info
}
