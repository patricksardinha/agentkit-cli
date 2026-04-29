# CLAUDE.md — AgentKit CLI

## Rôle de ce fichier
Ce fichier est lu par tous les agents Claude Code avant toute action.
Il définit les conventions, la stack, et les règles du projet.

## Projet
Nom        : agentkit-cli
Type        : CLI npm open-source (Node.js + TypeScript)
Objectif    : Scaffolder des workflows multi-agents Claude Code
Public      : Développeurs fullstack qui utilisent Claude Code
Registry    : npm (npx agentkit init)

## Stack
- Runtime    : Node.js 20+, TypeScript 5
- CLI        : commander.js + inquirer.js + chalk + ora
- Build      : tsup (ESM + CJS dual output)
- Tests      : Vitest
- CI/CD      : GitHub Actions → npm publish on tag v*

## Structure des fichiers
src/
  cli.ts          ← entry point (commander setup)
  commands/       ← une commande = un fichier
  generators/     ← logique de génération des fichiers
  detectors/      ← détection de stack (package.json, etc.)
  templates/      ← templates CLAUDE.md, AGENT_WORKFLOW.md
  utils/          ← helpers partagés
tests/            ← Vitest, miroir de src/

## Règles absolues
1. Chaque commande dans src/commands/ est indépendante
2. Les templates dans src/templates/ sont des fonctions TS, pas des fichiers .md statiques
3. Tout output CLI passe par src/utils/logger.ts (jamais console.log direct)
4. Chaque fichier généré doit avoir un test dans tests/generators/
5. Zéro dépendance non listée ici sans discussion

## Conventions de commit
feat: / fix: / test: / docs: / chore: / release:

## Critères de succès (Definition of Done)
- npx agentkit init fonctionne sur un repo vide
- npx agentkit init détecte automatiquement React, Next.js, Tauri, Python
- npm test passe sans erreur
- npx tsc --noEmit passe sans erreur