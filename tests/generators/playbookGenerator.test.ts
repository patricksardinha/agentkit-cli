import { describe, it, expect } from 'vitest'
import { generatePlaybook } from '../../src/generators/playbookGenerator.js'
import { extractAgentsFromWorkflow } from '../../src/utils/agentParser.js'
import { toSlug } from '../../src/utils/agentParser.js'
import type { Agent } from '../../src/types/agent.js'

const sampleAgents: Agent[] = [
  {
    number: 1,
    name: 'Infra & Setup',
    fullName: 'Agent 1 · Infra & Setup',
    slug: 'infra-setup',
    scope: 'project scaffolding',
    outputs: ['package.json', 'tsconfig.json'],
    criterion: 'npm run build',
  },
  {
    number: 2,
    name: 'Components',
    fullName: 'Agent 2 · Components',
    slug: 'components',
    scope: 'reusable UI components',
    outputs: ['src/components/'],
    criterion: 'npm test',
  },
]

// ─── generatePlaybook without blueprint ───────────────────────────────────────

describe('generatePlaybook (hasBlueprint: false)', () => {
  it('returns a non-empty string', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('contains the project name', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(result).toContain('my-app')
  })

  it('contains the one-instruction block', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(result).toContain('Read PLAYBOOK.md and execute the procedure')
  })

  it('contains global execution rules', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(result).toContain('Global Execution Rules')
    expect(result).toContain('max 3 attempts')
    expect(result).toContain('human validation')
    expect(result).toContain('Never move to the next agent')
  })

  it('does NOT contain Phase 0 when hasBlueprint is false', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(result).not.toContain('Phase 0')
    expect(result).not.toContain('Agent Decomposition')
  })

  it('contains a block for each agent', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    for (const agent of sampleAgents) {
      expect(result).toContain(agent.fullName)
      expect(result).toContain(agent.scope)
      expect(result).toContain(`agents/agent-${agent.number}-${agent.slug}/skills.md`)
    }
  })

  it('each agent block contains outputs and criterion', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(result).toContain('package.json')
    expect(result).toContain('npm run build')
    expect(result).toContain('src/components/')
    expect(result).toContain('npm test')
  })

  it('contains the future iterations section', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(result).toContain('Future Iterations')
    expect(result).toContain('agentkit add --feature')
  })

  it('contains the human validation section', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(result).toContain('Human Validation Required')
    expect(result).toContain('3 consecutive failures')
    expect(result).toContain('Missing external dependency')
    expect(result).toContain('Conflict')
  })

  it('handles an empty agents list gracefully', () => {
    const result = generatePlaybook({ agents: [], projectName: 'empty-project', hasBlueprint: false })
    expect(typeof result).toBe('string')
    expect(result).toContain('empty-project')
  })
})

// ─── generatePlaybook with blueprint ──────────────────────────────────────────

describe('generatePlaybook (hasBlueprint: true)', () => {
  it('contains Phase 0 when hasBlueprint is true', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: true })
    expect(result).toContain('Phase 0')
    expect(result).toContain('Agent Decomposition')
  })

  it('contains decomposition rules in Phase 0', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: true })
    expect(result).toContain('PROJECT_BLUEPRINT.md')
    expect(result).toContain('AGENT_WORKFLOW.md')
    expect(result).toContain('Maximum 6 agents')
    expect(result).toContain('human validation')
  })

  it('contains the validation gate instruction', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: true })
    expect(result).toContain('Should I proceed')
  })

  it('still contains Phase 1 execution after Phase 0', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: true })
    expect(result).toContain('Phase 1')
    expect(result).toContain('Agent 1 · Infra & Setup')
  })

  it('contains both phases in the correct order', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: true })
    const phase0Index = result.indexOf('Phase 0')
    const phase1Index = result.indexOf('Phase 1')
    expect(phase0Index).toBeLessThan(phase1Index)
  })
})

// ─── toSlug ───────────────────────────────────────────────────────────────────

describe('toSlug', () => {
  it('converts name to lowercase hyphenated slug', () => {
    expect(toSlug('Infra & Setup')).toBe('infra-setup')
    expect(toSlug('Components')).toBe('components')
    expect(toSlug('State & Hooks')).toBe('state-hooks')
    expect(toSlug('Pages & Routing')).toBe('pages-routing')
    expect(toSlug('Tests & CI')).toBe('tests-ci')
  })

  it('handles extra spaces and special chars', () => {
    expect(toSlug('Data Layer')).toBe('data-layer')
    expect(toSlug('API · Routes')).toBe('api-routes')
  })
})

// ─── extractAgentsFromWorkflow ────────────────────────────────────────────────

describe('extractAgentsFromWorkflow', () => {
  it('extracts agents from a workflow string matching template format', () => {
    const workflow = `# Agent Workflow — React Project

## Stack détectée
Framework: React

## Agents

### Agent 1 · Components
Périmètre : composants UI réutilisables
Produit   : src/components/
Critère   : composants documentés et testés

### Agent 2 · State & Hooks
Périmètre : state management, hooks personnalisés
Produit   : src/hooks/
Critère   : hooks testés unitairement
`
    const agents = extractAgentsFromWorkflow(workflow)
    expect(agents).toHaveLength(2)
    expect(agents[0].number).toBe(1)
    expect(agents[0].name).toBe('Components')
    expect(agents[0].fullName).toBe('Agent 1 · Components')
    expect(agents[0].slug).toBe('components')
    expect(agents[0].scope).toBe('composants UI réutilisables')
    expect(agents[0].criterion).toBe('composants documentés et testés')
    expect(agents[0].outputs).toEqual(['src/components/'])
  })

  it('handles multi-line outputs', () => {
    const workflow = `### Agent 1 · Setup
Périmètre : configuration initiale
Produit   :
  - package.json
  - tsconfig.json
Critère   : npm run build
`
    const agents = extractAgentsFromWorkflow(workflow)
    expect(agents[0].outputs).toEqual(['package.json', 'tsconfig.json'])
  })

  it('returns empty array for content with no agent blocks', () => {
    expect(extractAgentsFromWorkflow('# Just a title\nNo agents here.')).toEqual([])
  })
})