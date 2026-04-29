import type { StackInfo } from '../detectors/stackDetector.js'

export function claudeMd(_stack: StackInfo): string {
  return `# CLAUDE.md

## Stack
Stack non détectée automatiquement — à remplir manuellement.

## Commands
- À définir selon le projet

## Structure
src/    ← code source
tests/  ← tests

## Conventions
1. Tout output console passe par un logger centralisé
2. À compléter selon les conventions du projet
`
}

export function workflow(_stack: StackInfo): string {
  return `# Agent Workflow

## Stack détectée
Stack inconnue — workflow générique.

## Agents

### Agent 1 · Setup
Périmètre : configuration initiale du projet
Produit   : structure de base
Critère   : projet compilable

### Agent 2 · Core
Périmètre : logique principale
Produit   : src/
Critère   : fonctionnalités principales opérationnelles

### Agent 3 · Tests
Périmètre : couverture de tests
Produit   : tests/
Critère   : tests passent
`
}
