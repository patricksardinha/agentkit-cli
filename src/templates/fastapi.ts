import type { StackInfo } from '../detectors/stackDetector.js'

export function claudeMd(_stack: StackInfo): string {
  return `# CLAUDE.md — FastAPI Project

## Stack
- Framework : FastAPI (Python)
- Language  : Python 3.11+
- Server    : Uvicorn
- Validation: Pydantic v2

## Commands
- \`uvicorn main:app --reload\` — development server (http://localhost:8000)
- \`pytest\`                    — run tests
- \`pip install -r requirements.txt\` — install dependencies

## Structure
app/
  main.py       ← FastAPI app entry point
  routers/      ← API route groups
  models/       ← Pydantic models
  services/     ← business logic
  dependencies/ ← FastAPI dependencies (DI)
tests/          ← pytest tests

## Conventions
1. Routers grouped by domain in \`app/routers/\`
2. Pydantic models for all request/response bodies
3. Business logic in \`app/services/\`, not in routes
4. Async endpoints by default (\`async def\`)
5. Environment variables via \`python-dotenv\` + \`pydantic-settings\`
`
}

export function workflow(_stack: StackInfo): string {
  return `# Agent Workflow — FastAPI Project

## Stack détectée
Framework: FastAPI | Language: Python

## Agents

### Agent 1 · Models & Schemas
Périmètre : modèles Pydantic, schémas DB (SQLAlchemy/SQLModel)
Produit   : app/models/
Critère   : modèles validés, migrations propres

### Agent 2 · Services
Périmètre : logique métier, accès base de données
Produit   : app/services/
Critère   : services testés unitairement (pytest)

### Agent 3 · Routers & API
Périmètre : routes FastAPI, dépendances, auth
Produit   : app/routers/, app/dependencies/
Critère   : endpoints documentés (OpenAPI), tests d'intégration

### Agent 4 · Tests & CI
Périmètre : couverture pytest, configuration CI
Produit   : tests/, .github/workflows/
Critère   : \`pytest\` passe à 100%
`
}
