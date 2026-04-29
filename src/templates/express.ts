import type { StackInfo } from '../detectors/stackDetector.js'

export function claudeMd(stack: StackInfo): string {
  const lang = stack.hasTypeScript ? 'TypeScript' : 'JavaScript'
  const hasPrisma = stack.extras.includes('prisma')
  return `# CLAUDE.md — Express Project

## Stack
- Framework : Express (${lang})
- Language  : ${lang}
- Runtime   : Node.js 20+
${hasPrisma ? '- Database  : Prisma ORM\n' : ''}
## Commands
- \`npm run dev\`   — development server (nodemon)
- \`npm run build\` — compile TypeScript
- \`npm start\`     — production server
- \`npm test\`      — run tests

## Structure
src/
  routes/       ← Express routers (one per domain)
  controllers/  ← request handlers
  services/     ← business logic
  middleware/   ← Express middleware
  utils/        ← shared helpers

## Conventions
1. Routes grouped by domain in \`src/routes/\`
2. Business logic in \`src/services/\`, not in controllers
3. Middleware for cross-cutting concerns (auth, validation)
4. Tout output console passe par un logger centralisé
`
}

export function workflow(stack: StackInfo): string {
  const lang = stack.hasTypeScript ? 'TypeScript' : 'JavaScript'
  return `# Agent Workflow — Express Project

## Stack détectée
Framework: Express | Language: ${lang}

## Agents

### Agent 1 · Data & Models
Périmètre : modèles de données, accès DB
Produit   : src/models/, src/services/db.ts
Critère   : connexion DB fonctionnelle

### Agent 2 · Services
Périmètre : logique métier
Produit   : src/services/
Critère   : services testés unitairement

### Agent 3 · Routes & Controllers
Périmètre : routes Express, validation, auth
Produit   : src/routes/, src/controllers/, src/middleware/
Critère   : endpoints répondent correctement

### Agent 4 · Tests & CI
Périmètre : tests d'intégration, configuration CI
Produit   : tests/, .github/workflows/
Critère   : npm test passe
`
}
