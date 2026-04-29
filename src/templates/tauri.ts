import type { StackInfo } from '../detectors/stackDetector.js'

export function claudeMd(stack: StackInfo): string {
  const lang = stack.hasTypeScript ? 'TypeScript' : 'JavaScript'
  return `# CLAUDE.md — Tauri Project

## Stack
- Framework : Tauri (Rust + ${lang} frontend)
- Language  : Rust (backend) + ${lang} (frontend)
- Build     : Cargo + Vite

## Commands
- \`npm run tauri dev\`   — development (hot reload)
- \`npm run tauri build\` — production bundle
- \`npm run build\`       — frontend only
- \`npm test\`            — run tests

## Structure
src/            ← frontend (${lang})
  components/
  utils/
src-tauri/      ← Rust backend
  src/
    main.rs     ← Tauri entry point
    commands.rs ← Tauri commands (IPC)
  tauri.conf.json

## Conventions
1. IPC commands defined in \`src-tauri/src/commands.rs\`
2. Frontend invokes via \`@tauri-apps/api/tauri\`
3. No direct filesystem access from frontend
4. Tout output console passe par un logger centralisé
`
}

export function workflow(stack: StackInfo): string {
  const lang = stack.hasTypeScript ? 'TypeScript' : 'JavaScript'
  return `# Agent Workflow — Tauri Project

## Stack détectée
Framework: Tauri | Language: Rust + ${lang}

## Agents

### Agent 1 · Rust Commands
Périmètre : commandes Tauri (IPC), permissions
Produit   : src-tauri/src/commands.rs, tauri.conf.json
Critère   : \`cargo build\` passe

### Agent 2 · Frontend UI
Périmètre : interface ${lang}, intégration IPC
Produit   : src/components/, src/utils/
Critère   : appels IPC fonctionnels

### Agent 3 · Build & Packaging
Périmètre : configuration build, icônes, installeurs
Produit   : src-tauri/tauri.conf.json, icons/
Critère   : \`npm run tauri build\` produit un bundle

### Agent 4 · Tests
Périmètre : tests Rust + tests frontend
Produit   : src-tauri/tests/, tests/
Critère   : \`cargo test\` + \`npm test\` passent
`
}
