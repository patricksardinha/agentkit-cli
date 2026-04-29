import type { StackInfo } from '../detectors/stackDetector.js'

export function claudeMd(stack: StackInfo): string {
  const hasTailwind = stack.extras.includes('tailwind')
  const hasPrisma = stack.extras.includes('prisma')
  return `# CLAUDE.md — Next.js Project

## Stack
- Framework : Next.js (TypeScript)
- Rendering : App Router (RSC + Client Components)
- Styling   : ${hasTailwind ? 'Tailwind CSS' : 'CSS Modules'}
${hasPrisma ? '- Database  : Prisma ORM\n' : ''}
## Commands
- \`npm run dev\`   — development server (http://localhost:3000)
- \`npm run build\` — production build
- \`npm start\`     — production server
- \`npm test\`      — run tests

## Structure
src/
  app/          ← App Router pages and layouts
  components/   ← shared UI components
  lib/          ← server utilities, db clients
  utils/        ← shared helpers

## Conventions
1. Server Components by default, \`'use client'\` only when needed
2. API routes in \`src/app/api/\`
3. Environment variables via \`src/env.ts\` (validated)
4. Tout output console passe par un logger centralisé
`
}

export function workflow(stack: StackInfo): string {
  const hasPrisma = stack.extras.includes('prisma')
  return `# Agent Workflow — Next.js Project

## Stack détectée
Framework: Next.js | Language: TypeScript

## Agents

### Agent 1 · Data Layer
Périmètre : schéma${hasPrisma ? ' Prisma' : ''}, types, server actions
Produit   : src/lib/, ${hasPrisma ? 'prisma/schema.prisma' : 'src/types/'}
Critère   : types compilent, migrations propres

### Agent 2 · UI Components
Périmètre : composants réutilisables (Server + Client)
Produit   : src/components/
Critère   : composants rendus sans erreur

### Agent 3 · Pages & Layout
Périmètre : App Router, layouts, pages
Produit   : src/app/
Critère   : navigation fonctionnelle, build passe

### Agent 4 · API & Tests
Périmètre : API routes, tests e2e/unitaires
Produit   : src/app/api/, tests/
Critère   : npm test passe
`
}
