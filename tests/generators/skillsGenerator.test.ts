import { describe, it, expect, afterEach } from 'vitest'
import { generateSkills } from '../../src/generators/skillsGenerator.js'
import type { Agent } from '../../src/types/agent.js'
import { readFile, rm, mkdtemp } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const sampleAgents: Agent[] = [
  {
    number: 1,
    name: 'Infra & Setup',
    fullName: 'Agent 1 · Infra & Setup',
    slug: 'infra-setup',
    scope: 'scaffolding du projet',
    outputs: ['package.json', 'tsconfig.json'],
    criterion: 'npm run build',
  },
  {
    number: 2,
    name: 'Components',
    fullName: 'Agent 2 · Components',
    slug: 'components',
    scope: 'composants UI réutilisables',
    outputs: ['src/components/'],
    criterion: 'npm test',
  },
]

let tempDir = ''

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true })
    tempDir = ''
  }
})

describe('generateSkills', () => {
  it('creates an agents/ directory with one folder per agent', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentkit-test-'))
    await generateSkills(sampleAgents, tempDir)

    for (const agent of sampleAgents) {
      const dirPath = join(tempDir, 'agents', `agent-${agent.number}-${agent.slug}`)
      // readFile would throw if dir doesn't exist — use access via readFile on a known file
      const skills = await readFile(join(dirPath, 'skills.md'), 'utf-8')
      expect(skills).toBeTruthy()
    }
  })

  it('skills.md contains the agent fullName', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentkit-test-'))
    await generateSkills(sampleAgents, tempDir)

    const skills1 = await readFile(
      join(tempDir, 'agents', 'agent-1-infra-setup', 'skills.md'),
      'utf-8',
    )
    expect(skills1).toContain('Agent 1 · Infra & Setup')
    expect(skills1).toContain('## Contexte technique')
    expect(skills1).toContain('## Documentation de référence')
    expect(skills1).toContain('## Conventions spécifiques')
  })

  it('context.md contains scope and criterion', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentkit-test-'))
    await generateSkills(sampleAgents, tempDir)

    const ctx = await readFile(
      join(tempDir, 'agents', 'agent-1-infra-setup', 'context.md'),
      'utf-8',
    )
    expect(ctx).toContain('Agent 1 · Infra & Setup')
    expect(ctx).toContain('scaffolding du projet')
    expect(ctx).toContain('npm run build')
    expect(ctx).toContain('package.json')
  })

  it('generates correct folder name from agent slug', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentkit-test-'))
    await generateSkills(sampleAgents, tempDir)

    const skills2 = await readFile(
      join(tempDir, 'agents', 'agent-2-components', 'skills.md'),
      'utf-8',
    )
    expect(skills2).toContain('Agent 2 · Components')
  })

  it('handles empty agents list without error', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentkit-test-'))
    await expect(generateSkills([], tempDir)).resolves.toBeUndefined()
  })
})
