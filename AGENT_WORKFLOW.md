# Agent Workflow — AgentKit CLI

## Vue d'ensemble
Ce projet est construit par 4 agents spécialisés en séquence.
Chaque agent a un périmètre strict, des inputs définis, et un
critère de succès vérifiable avant de passer au suivant.

## Phase 1 — Foundation

### Agent 1 · Infra & Setup
Périmètre : scaffolding du projet Node.js/TS, configuration build
Lit      : CLAUDE.md section Stack
Produit  :
  - package.json (commander, inquirer, chalk, ora, tsup)
  - tsconfig.json + tsup.config.ts
  - .github/workflows/release.yml (npm publish on v*)
  - vitest.config.ts
  - src/utils/logger.ts
Critère  : npm run build passe, structure src/ conforme à CLAUDE.md

### Agent 2 · Detectors
Dépend de : Agent 1
Périmètre : détection automatique de la stack d'un projet cible
Produit  :
  - src/detectors/stackDetector.ts
    → détecte : React, Next.js, Tauri, Python/FastAPI, Node/Express
    → lit package.json, requirements.txt, src-tauri/
  - src/detectors/gitDetector.ts
    → vérifie si le dossier est un repo git
  - tests/detectors/stackDetector.test.ts
Critère  : npm test passe sur des fixtures de projets types

## Phase 2 — Generators (parallélisables)

### Agent 3 · Generators
Dépend de : Agent 2 (pour stackDetector)
Périmètre : génération des fichiers CLAUDE.md et AGENT_WORKFLOW.md
Produit  :
  - src/generators/claudeMdGenerator.ts
    → prend StackInfo, retourne string CLAUDE.md adapté
  - src/generators/workflowGenerator.ts
    → prend StackInfo, retourne string AGENT_WORKFLOW.md adapté
  - src/templates/ (un template par stack détectée)
  - tests/generators/*.test.ts
Critère  : génère des fichiers valides pour chaque stack supportée

### Agent 4 · Commands CLI
Dépend de : Agent 2 + Agent 3
Périmètre : wiring des commandes CLI avec commander.js
Produit  :
  - src/commands/init.ts   → npx agentkit init
  - src/commands/add.ts    → npx agentkit add agent
  - src/commands/status.ts → npx agentkit status
  - src/cli.ts             → entry point
Critère  : npx agentkit --help affiche toutes les commandes