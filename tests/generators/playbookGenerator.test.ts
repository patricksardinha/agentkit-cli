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

// ─── Common behaviour (both modes) ────────────────────────────────────────────

describe('generatePlaybook (common)', () => {
  for (const hasBlueprint of [true, false]) {
    const label = hasBlueprint ? 'hasBlueprint: true' : 'hasBlueprint: false'

    it(`[${label}] returns a non-empty string`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it(`[${label}] contains the project name`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      expect(result).toContain('my-app')
    })

    it(`[${label}] contains the one-instruction block`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      expect(result).toContain('Read PLAYBOOK.md and execute the procedure')
    })

    it(`[${label}] contains global execution rules`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      expect(result).toContain('Global Execution Rules')
      expect(result).toContain('max 3 attempts')
      expect(result).toContain('human validation')
      expect(result).toContain('Never move to the next agent')
    })

    it(`[${label}] always contains Phase 0`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      expect(result).toContain('Phase 0')
    })

    it(`[${label}] always contains Phase 1`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      expect(result).toContain('Phase 1')
    })

    it(`[${label}] Phase 0 comes before Phase 1`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      expect(result.indexOf('Phase 0')).toBeLessThan(result.indexOf('Phase 1'))
    })

    it(`[${label}] contains a block for each agent`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      for (const agent of sampleAgents) {
        expect(result).toContain(agent.fullName)
        expect(result).toContain(agent.scope)
        expect(result).toContain(`agents/agent-${agent.number}-${agent.slug}/skills.md`)
      }
    })

    it(`[${label}] each agent block contains outputs and criterion`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      expect(result).toContain('package.json')
      expect(result).toContain('npm run build')
      expect(result).toContain('src/components/')
      expect(result).toContain('npm test')
    })

    it(`[${label}] contains the future iterations section`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      expect(result).toContain('Future Iterations')
      expect(result).toContain('agentkit add --feature')
    })

    it(`[${label}] contains the human validation section`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      expect(result).toContain('Human Validation Required')
      expect(result).toContain('3 consecutive failures')
      expect(result).toContain('Missing external dependency')
      expect(result).toContain('End of Phase 0')
    })

    it(`[${label}] handles an empty agents list gracefully`, () => {
      const result = generatePlaybook({ agents: [], projectName: 'empty-project', hasBlueprint })
      expect(typeof result).toBe('string')
      expect(result).toContain('empty-project')
    })

    it(`[${label}] contains the Between Phase 0 and Phase 1 block`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      expect(result).toContain('Between Phase 0 and Phase 1')
    })

    it(`[${label}] Between block contains "proceed"`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      expect(result).toContain('proceed')
    })

    it(`[${label}] Between block contains "agents/"`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      expect(result).toContain('agents/')
    })

    it(`[${label}] Between Phase block appears after Phase 0 and before Phase 1`, () => {
      const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint })
      const phase0Idx = result.indexOf('Phase 0')
      const betweenIdx = result.indexOf('Between Phase 0 and Phase 1')
      const phase1Idx = result.indexOf('Phase 1 — Execution')
      expect(phase0Idx).toBeLessThan(betweenIdx)
      expect(betweenIdx).toBeLessThan(phase1Idx)
    })
  }
})

// ─── Phase 0 with blueprint (Decomposition mode) ──────────────────────────────

describe('generatePlaybook Phase 0 — Decomposition (hasBlueprint: true)', () => {
  it('contains the decomposition title', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: true })
    expect(result).toContain('Agent Decomposition')
  })

  it('references PROJECT_BLUEPRINT.md', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: true })
    expect(result).toContain('PROJECT_BLUEPRINT.md')
  })

  it('contains decomposition rules', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: true })
    expect(result).toContain('Maximum 6 agents')
    expect(result).toContain('AGENT_WORKFLOW.md')
  })

  it('contains the validation gate', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: true })
    expect(result).toContain('Should I proceed')
  })

  it('does NOT contain Project Discovery language', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: true })
    expect(result).not.toContain('Project Discovery')
    expect(result).not.toContain('Ask the user these questions')
  })
})

// ─── Phase 0 without blueprint (Discovery mode) ───────────────────────────────

describe('generatePlaybook Phase 0 — Discovery (hasBlueprint: false)', () => {
  it('contains the discovery title', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(result).toContain('Project Discovery')
  })

  it('instructs Claude Code to ask the user questions', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(result).toContain('Ask the user these questions')
    expect(result).toContain('What is this project')
    expect(result).toContain('What are the main features')
  })

  it('still contains decomposition rules', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(result).toContain('Maximum 6 agents')
    expect(result).toContain('AGENT_WORKFLOW.md')
  })

  it('still contains the validation gate', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(result).toContain('Should I proceed')
  })

  it('does NOT reference PROJECT_BLUEPRINT.md as a file to read', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(result).not.toContain('A `PROJECT_BLUEPRINT.md` was provided')
  })

  it('does NOT contain Agent Decomposition title', () => {
    const result = generatePlaybook({ agents: sampleAgents, projectName: 'my-app', hasBlueprint: false })
    expect(result).not.toContain('Agent Decomposition (run this first)')
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