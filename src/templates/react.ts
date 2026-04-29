import type { StackInfo } from '../detectors/stackDetector.js'

export function claudeMd(stack: StackInfo): string {
  const lang = stack.hasTypeScript ? 'TypeScript' : 'JavaScript'
  const testLine = stack.extras.includes('testing') ? '- `npm test`      — run tests\n' : ''
  return `# CLAUDE.md — React Project

## Stack
- Framework : React (${lang})
- Language  : ${lang}
- Build     : Vite

## Commands
- \`npm run dev\`   — development server
- \`npm run build\` — production build
${testLine}
## Structure
src/
  components/   ← UI components (PascalCase)
  hooks/        ← custom hooks (prefix: use*)
  pages/        ← page-level components
  utils/        ← shared helpers

## Conventions
1. Components in PascalCase
2. Hooks prefixed with \`use\`
3. Props interfaces named \`*Props\`
4. Tout output console passe par un logger centralisé
`
}

export function workflow(stack: StackInfo): string {
  const lang = stack.hasTypeScript ? 'TypeScript' : 'JavaScript'
  return `# Agent Workflow — React Project

## Stack détectée
Framework: React | Language: ${lang}

## Agents

### Agent 1 · Components
Périmètre : composants UI réutilisables
Produit   : src/components/
Critère   : composants documentés et testés

### Agent 2 · State & Hooks
Périmètre : state management, hooks personnalisés
Produit   : src/hooks/
Critère   : hooks testés unitairement

### Agent 3 · Pages & Routing
Périmètre : assemblage des pages, react-router
Produit   : src/pages/
Critère   : navigation fonctionnelle

### Agent 4 · Tests & CI
Périmètre : couverture de tests, configuration CI
Produit   : tests/, .github/workflows/
Critère   : npm test passe
`
}
