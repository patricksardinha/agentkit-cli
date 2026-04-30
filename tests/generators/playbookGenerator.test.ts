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

describe('generatePlaybook', () => {
  it('returns a non-empty string', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app' })
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('contains the project name', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app' })
    expect(result).toContain('my-app')
  })

  it('starts with the unique instruction', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app' })
    expect(result).toContain("Donne cette instruction à Claude Code")
    expect(result).toContain("Lis PLAYBOOK.md et exécute la procédure")
  })

  it('contains global execution rules', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app' })
    expect(result).toContain('Règles d\'exécution globales')
    expect(result).toContain('3 tentatives')
    expect(result).toContain('validation humaine')
    expect(result).toContain('Ne jamais passer')
  })

  it('contains a block for each agent', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app' })
    for (const agent of sampleAgents) {
      expect(result).toContain(agent.fullName)
      expect(result).toContain(agent.scope)
      expect(result).toContain(`agents/agent-${agent.number}-${agent.slug}/skills.md`)
    }
  })

  it('each agent block contains outputs and criterion', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app' })
    expect(result).toContain('package.json')
    expect(result).toContain('npm run build')
    expect(result).toContain('src/components/')
    expect(result).toContain('npm test')
  })

  it('contains the "Itérations futures" section', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app' })
    expect(result).toContain('Itérations futures')
    expect(result).toContain('agentkit add --feature')
  })

  it('contains the human validation section', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app' })
    expect(result).toContain('Validation humaine requise')
    expect(result).toContain('3 échecs consécutifs')
    expect(result).toContain('Dépendance externe manquante')
    expect(result).toContain('Conflit')
  })

  it('handles an empty agents list gracefully', () => {
    const result = generatePlaybook({ agents: [], projectName: 'empty-project' })
    expect(typeof result).toBe('string')
    expect(result).toContain('empty-project')
  })
})

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
