import { describe, it, expect } from 'vitest'
import { parseBlueprint } from '../../src/utils/blueprintParser.js'
import { generateClaudeMd } from '../../src/generators/claudeMdGenerator.js'
import { generateWorkflow } from '../../src/generators/workflowGenerator.js'
import { extractAgentsFromWorkflow } from '../../src/utils/agentParser.js'
import type { StackInfo } from '../../src/detectors/stackDetector.js'

const BLUEPRINT = `# My App Blueprint

## Authentication
- JWT tokens
- OAuth2 with Google
- Password reset flow

## Dashboard
- User statistics
- Charts and graphs
- CSV export

## API
- REST endpoints
- Rate limiting
- API key management
`

const REACT_STACK: StackInfo = {
  framework: 'react',
  language: 'typescript',
  hasTypeScript: true,
  extras: [],
}

describe('parseBlueprint', () => {
  it('extracts features from ## headings', () => {
    const features = parseBlueprint(BLUEPRINT)
    expect(features).toHaveLength(3)
    expect(features[0].name).toBe('Authentication')
    expect(features[1].name).toBe('Dashboard')
    expect(features[2].name).toBe('API')
  })

  it('extracts list items under each feature', () => {
    const features = parseBlueprint(BLUEPRINT)
    expect(features[0].items).toContain('JWT tokens')
    expect(features[0].items).toContain('OAuth2 with Google')
    expect(features[1].items).toContain('User statistics')
    expect(features[2].items).toContain('REST endpoints')
  })

  it('returns empty array for content with no ## headings', () => {
    expect(parseBlueprint('# Title\nSome text without sections.')).toEqual([])
  })

  it('handles features with no list items', () => {
    const features = parseBlueprint('## Feature A\nJust prose.\n## Feature B\n- item1')
    expect(features[0].items).toEqual([])
    expect(features[1].items).toEqual(['item1'])
  })
})

describe('generateClaudeMd with blueprint', () => {
  it('returns same output as without blueprint when blueprintContent is undefined', () => {
    expect(generateClaudeMd(REACT_STACK)).toBe(generateClaudeMd(REACT_STACK, undefined))
  })

  it('includes a Features section when blueprint is provided', () => {
    const result = generateClaudeMd(REACT_STACK, BLUEPRINT)
    expect(result).toContain('## Features (Blueprint)')
    expect(result).toContain('Authentication')
    expect(result).toContain('Dashboard')
    expect(result).toContain('API')
  })

  it('includes blueprint sub-items', () => {
    const result = generateClaudeMd(REACT_STACK, BLUEPRINT)
    expect(result).toContain('JWT tokens')
    expect(result).toContain('User statistics')
  })

  it('places Features section before Conventions', () => {
    const result = generateClaudeMd(REACT_STACK, BLUEPRINT)
    const featIdx = result.indexOf('## Features (Blueprint)')
    const convIdx = result.indexOf('## Conventions')
    expect(featIdx).toBeGreaterThan(-1)
    expect(convIdx).toBeGreaterThan(-1)
    expect(featIdx).toBeLessThan(convIdx)
  })

  it('still contains stack-specific content', () => {
    const result = generateClaudeMd(REACT_STACK, BLUEPRINT)
    expect(result).toContain('React')
    expect(result).toContain('## Stack')
  })
})

describe('generateWorkflow with blueprint', () => {
  it('returns same output as without blueprint when blueprintContent is undefined', () => {
    expect(generateWorkflow(REACT_STACK)).toBe(generateWorkflow(REACT_STACK, undefined))
  })

  it('generates one agent per blueprint feature plus a CI agent', () => {
    const result = generateWorkflow(REACT_STACK, BLUEPRINT)
    expect(result).toContain('Agent 1 · Authentication')
    expect(result).toContain('Agent 2 · Dashboard')
    expect(result).toContain('Agent 3 · API')
    expect(result).toContain('Agent 4 · Tests & CI')
  })

  it('each agent block is parseable by extractAgentsFromWorkflow', () => {
    const result = generateWorkflow(REACT_STACK, BLUEPRINT)
    const agents = extractAgentsFromWorkflow(result)
    expect(agents).toHaveLength(4)
    expect(agents[0].name).toBe('Authentication')
    expect(agents[0].slug).toBe('authentication')
    expect(agents[3].name).toBe('Tests & CI')
    expect(agents[3].slug).toBe('tests-ci')
  })

  it('includes blueprint feature items as outputs', () => {
    const result = generateWorkflow(REACT_STACK, BLUEPRINT)
    expect(result).toContain('JWT tokens')
    expect(result).toContain('User statistics')
  })

  it('includes stack information in the header', () => {
    const result = generateWorkflow(REACT_STACK, BLUEPRINT)
    expect(result).toContain('react')
    expect(result).toContain('typescript')
  })
})
