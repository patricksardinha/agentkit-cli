import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { detectStack } from '../../src/detectors/stackDetector.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const fixturesDir = join(__dirname, 'fixtures')

describe('detectStack', () => {
  it('detects React', async () => {
    const result = await detectStack(join(fixturesDir, 'react-app'))
    expect(result.framework).toBe('react')
    expect(result.language).toBe('javascript')
    expect(result.hasTypeScript).toBe(false)
  })

  it('detects Next.js (priority over React)', async () => {
    const result = await detectStack(join(fixturesDir, 'nextjs-app'))
    expect(result.framework).toBe('nextjs')
    expect(result.hasTypeScript).toBe(true)
    expect(result.language).toBe('typescript')
  })

  it('detects Tauri via @tauri-apps/api and src-tauri/', async () => {
    const result = await detectStack(join(fixturesDir, 'tauri-app'))
    expect(result.framework).toBe('tauri')
    expect(result.hasTypeScript).toBe(true)
  })

  it('detects FastAPI (Python)', async () => {
    const result = await detectStack(join(fixturesDir, 'fastapi-app'))
    expect(result.framework).toBe('fastapi')
    expect(result.language).toBe('python')
    expect(result.hasTypeScript).toBe(false)
  })

  it('detects Express', async () => {
    const result = await detectStack(join(fixturesDir, 'express-app'))
    expect(result.framework).toBe('express')
    expect(result.language).toBe('javascript')
  })

  it('returns unknown for a directory with no recognizable files', async () => {
    const result = await detectStack(join(fixturesDir, 'no-git'))
    expect(result.framework).toBe('unknown')
    expect(result.language).toBe('unknown')
  })
})
