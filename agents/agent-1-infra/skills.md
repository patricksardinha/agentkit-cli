# Skills — Agent 1 · Infra & Setup

> This file is read by Agent 1 before starting its work.
> It contains project-specific context that enriches the agent's understanding
> beyond what is in CLAUDE.md.

## Technical context

- Package name   : @patricksardinha/agentkit-cli
- Node.js target : 20+
- Output formats : ESM + CJS (tsup dual build)
- Binary name    : `agentkit` (mapped in package.json `bin` field)
- Registry       : npm (scoped, public)

## publishConfig requirement

The package.json must include:
```json
"publishConfig": {
  "access": "public"
}
```
Without this, npm treats scoped packages as private and blocks publishing.

## GitHub Actions release trigger

The workflow must trigger on `v*` tags only (not branch pushes).
The npm publish step must use:
```yaml
- run: npm publish --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```
The NPM_TOKEN must be an Automation token (not Granular) to bypass 2FA.

## tsup configuration

Dual output is required for compatibility:
```ts
export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
})
```
