import type { StackInfo } from '../detectors/stackDetector.js'

export function claudeMd(stack: StackInfo): string {
  const lang = stack.hasTypeScript ? 'TypeScript' : 'JavaScript'
  return `# CLAUDE.md — Node.js Project

## Stack
- Runtime  : Node.js 20+
- Language : ${lang}

## Commands
- \`npm run dev\`   — development (with watch)
- \`npm run build\` — compile${stack.hasTypeScript ? ' TypeScript' : ''}
- \`npm start\`     — run production build
- \`npm test\`      — run tests

## Structure
src/
  index.ts      ← entry point
  lib/          ← core library code
  utils/        ← shared helpers

## Conventions
1. Modules follow single-responsibility principle
2. Async/await over callbacks
3. Tout output console passe par un logger centralisé
`
}

export function workflow(stack: StackInfo): string {
  const lang = stack.hasTypeScript ? 'TypeScript' : 'JavaScript'
  return `# Agent Workflow — Node.js Project

## Stack détectée
Runtime: Node.js | Language: ${lang}

## Agents

### Agent 1 · Core Library
Périmètre : logique principale
Produit   : src/lib/
Critère   : module fonctionne et testé

### Agent 2 · CLI / API
Périmètre : interface utilisateur (CLI ou API)
Produit   : src/index.ts, src/cli.ts
Critère   : commandes fonctionnelles

### Agent 3 · Tests & CI
Périmètre : couverture de tests, configuration CI
Produit   : tests/, .github/workflows/
Critère   : npm test passe
`
}
