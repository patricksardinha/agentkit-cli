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

  it('adds the blueprint note when blueprint is provided', () => {
    const result = generateClaudeMd(REACT_STACK, BLUEPRINT)
    expect(result).toContain('PROJECT_BLUEPRINT.md is present')
    expect(result).toContain('Phase 0')
  })

  it('does NOT include a Features (Blueprint) section', () => {
    const result = generateClaudeMd(REACT_STACK, BLUEPRINT)
    expect(result).not.toContain('## Features (Blueprint)')
  })

  it('does NOT include blueprint sub-items as feature bullets', () => {
    const result = generateClaudeMd(REACT_STACK, BLUEPRINT)
    expect(result).not.toContain('JWT tokens')
    expect(result).not.toContain('User statistics')
  })

  it('places blueprint note before Conventions', () => {
    const result = generateClaudeMd(REACT_STACK, BLUEPRINT)
    const noteIdx = result.indexOf('PROJECT_BLUEPRINT.md is present')
    const convIdx = result.indexOf('## Conventions')
    expect(noteIdx).toBeGreaterThan(-1)
    expect(convIdx).toBeGreaterThan(-1)
    expect(noteIdx).toBeLessThan(convIdx)
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

  it('returns a Phase 0 placeholder instead of agent blocks', () => {
    const result = generateWorkflow(REACT_STACK, BLUEPRINT)
    expect(result).toContain('AGENT_WORKFLOW.md')
    expect(result).toContain('Phase 0')
    expect(result).toContain('PROJECT_BLUEPRINT.md')
    expect(result).toContain('Waiting for Phase 0 decomposition')
  })

  it('does NOT generate agent blocks from blueprint sections', () => {
    const result = generateWorkflow(REACT_STACK, BLUEPRINT)
    expect(result).not.toContain('Agent 1')
    expect(result).not.toContain('Authentication')
    expect(result).not.toContain('Dashboard')
    expect(result).not.toContain('Tests & CI')
  })

  it('does NOT include blueprint feature items as outputs', () => {
    const result = generateWorkflow(REACT_STACK, BLUEPRINT)
    expect(result).not.toContain('JWT tokens')
    expect(result).not.toContain('User statistics')
  })

  it('uses projectName in heading when provided', () => {
    const result = generateWorkflow(REACT_STACK, BLUEPRINT, 'my-app')
    expect(result).toContain('AGENT_WORKFLOW.md — my-app')
  })

  it('falls back to framework name when projectName is omitted', () => {
    const result = generateWorkflow(REACT_STACK, BLUEPRINT)
    expect(result).toContain('AGENT_WORKFLOW.md — react')
  })
})
