# Skills — Agent 2 · Detectors

> This file is read by Agent 2 before starting its work.

## StackInfo type

The detector must return this exact shape:

```typescript
export interface StackInfo {
  framework: 'react' | 'nextjs' | 'tauri' | 'fastapi' | 'express' | 'node' | 'unknown'
  hasTypeScript: boolean
  extras: string[]   // e.g. ['tailwind', 'prisma', 'testing']
}
```

## Detection priority

Frameworks are detected in this order (first match wins):
1. tauri    — `src-tauri/` directory exists
2. nextjs   — `next` key in package.json dependencies
3. react    — `react` key in package.json dependencies
4. fastapi  — `fastapi` in requirements.txt
5. express  — `express` key in package.json dependencies
6. node     — package.json exists (fallback)
7. unknown  — nothing found

## Extras detection

- typescript : `typescript` in devDependencies OR tsconfig.json exists
- tailwind   : `tailwindcss` in dependencies or devDependencies
- prisma     : `prisma` in devDependencies OR prisma/ directory exists
- testing    : `vitest` or `jest` in devDependencies

## Test fixtures

Use in-memory mock file systems for tests — do not read the actual
agentkit-cli project files as fixtures, as this creates circular dependencies.
