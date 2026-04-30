import { describe, it, expect, afterEach } from 'vitest'
import { addFeatureToProject } from '../../src/commands/add.js'
import { readFile, rm, mkdtemp, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const INITIAL_WORKFLOW = `# Agent Workflow — my-project

## Stack détectée
Framework: react | Language: typescript

## Agents

### Agent 1 · Components
Périmètre : composants UI réutilisables
Produit   : src/components/
Critère   : npm test

### Agent 2 · State & Hooks
Périmètre : state management
Produit   : src/hooks/
Critère   : npm test
`

let tempDir = ''

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true })
    tempDir = ''
  }
})

async function setupProject(workflowContent = INITIAL_WORKFLOW): Promise<string> {
  tempDir = await mkdtemp(join(tmpdir(), 'agentkit-add-test-'))
  await writeFile(join(tempDir, 'AGENT_WORKFLOW.md'), workflowContent, 'utf-8')
  await writeFile(join(tempDir, 'PLAYBOOK.md'), '# PLAYBOOK placeholder\n', 'utf-8')
  return tempDir
}

describe('addFeatureToProject', () => {
  it('appends a new agent block to AGENT_WORKFLOW.md', async () => {
    const dir = await setupProject()
    await addFeatureToProject('Add user authentication', dir)

    const workflow = await readFile(join(dir, 'AGENT_WORKFLOW.md'), 'utf-8')
    expect(workflow).toContain('Agent 3 · User Authentication')
    expect(workflow).toContain('Add user authentication')
  })

  it('assigns the correct next agent number', async () => {
    const dir = await setupProject()
    const result = await addFeatureToProject('Add dark mode', dir)

    expect(result.agent.number).toBe(3)
  })

  it('derives a title-cased name from the description', async () => {
    const dir = await setupProject()
    const result = await addFeatureToProject('Add payment integration with Stripe', dir)

    expect(result.agent.name).toBe('Payment Integration With Stripe')
    expect(result.agent.slug).toBe('payment-integration-with-stripe')
  })

  it('strips common action prefixes from the agent name', async () => {
    const dir = await setupProject()
    const r1 = await addFeatureToProject('implement search functionality', dir)
    expect(r1.agent.name).toBe('Search Functionality')

    const dir2 = await setupProject()
    const r2 = await addFeatureToProject('create admin dashboard', dir2)
    expect(r2.agent.name).toBe('Admin Dashboard')
  })

  it('creates the agent skills folder with skills.md and context.md', async () => {
    const dir = await setupProject()
    const result = await addFeatureToProject('Add notifications', dir)

    const skillsContent = await readFile(
      join(result.agentDirPath, 'skills.md'),
      'utf-8',
    )
    const contextContent = await readFile(
      join(result.agentDirPath, 'context.md'),
      'utf-8',
    )

    expect(skillsContent).toContain(result.agent.fullName)
    expect(contextContent).toContain('Add notifications')
  })

  it('regenerates PLAYBOOK.md with all agents including the new one', async () => {
    const dir = await setupProject()
    await addFeatureToProject('Add analytics dashboard', dir)

    const playbook = await readFile(join(dir, 'PLAYBOOK.md'), 'utf-8')
    expect(playbook).toContain('Agent 1 · Components')
    expect(playbook).toContain('Agent 2 · State & Hooks')
    expect(playbook).toContain('Agent 3 · Analytics Dashboard')
  })

  it('reads project name from package.json when available', async () => {
    const dir = await setupProject()
    await writeFile(
      join(dir, 'package.json'),
      JSON.stringify({ name: 'my-custom-app' }),
      'utf-8',
    )
    await addFeatureToProject('Add search', dir)

    const playbook = await readFile(join(dir, 'PLAYBOOK.md'), 'utf-8')
    expect(playbook).toContain('my-custom-app')
  })

  it('throws an error when AGENT_WORKFLOW.md is missing', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentkit-add-test-'))
    await expect(addFeatureToProject('Add feature', tempDir)).rejects.toThrow(
      'AGENT_WORKFLOW.md introuvable',
    )
  })

  it('works on a project with no existing agents', async () => {
    const dir = await setupProject('# Agent Workflow\n\n## Agents\n')
    const result = await addFeatureToProject('Add first feature', dir)

    expect(result.agent.number).toBe(1)
    expect(result.agent.name).toBe('First Feature')
  })
})
