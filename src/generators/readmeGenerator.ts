import type { StackInfo } from '../detectors/stackDetector.js'

export interface ReadmeInput {
  projectName: string
  blueprintContent?: string
  stack: StackInfo
}

function extractSection(content: string, heading: string): string {
  const regex = new RegExp(`##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`)
  const match = regex.exec(content)
  return match ? match[1].trim() : ''
}

function stackLabel(stack: StackInfo): string {
  switch (stack.framework) {
    case 'react':   return 'React + Vite'
    case 'nextjs':  return 'Next.js'
    case 'tauri':   return 'Tauri v2'
    case 'fastapi': return 'FastAPI'
    case 'express': return 'Express'
    case 'node':    return 'Node.js'
    default:        return 'Unknown'
  }
}

function gettingStarted(stack: StackInfo): string {
  switch (stack.framework) {
    case 'tauri':
      return `\`\`\`bash
npm install
npm run tauri:dev   # development (hot reload)
npm run tauri:build # production bundle
\`\`\``
    case 'react':
      return `\`\`\`bash
npm install
npm run dev   # development server
npm run build # production build
\`\`\``
    case 'nextjs':
      return `\`\`\`bash
npm install
npm run dev   # development server (http://localhost:3000)
npm run build # production build
\`\`\``
    case 'fastapi':
      return `\`\`\`bash
pip install -r requirements.txt
uvicorn main:app --reload
\`\`\``
    case 'express':
    case 'node':
      return `\`\`\`bash
npm install
npm start
\`\`\``
    default:
      return `\`\`\`bash
npm install
npm run dev
\`\`\``
  }
}

function projectStructure(stack: StackInfo): string {
  switch (stack.framework) {
    case 'react':
      return `\`\`\`
src/
  components/   ← UI components (PascalCase)
  hooks/        ← custom hooks (prefix: use*)
  pages/        ← page-level components
  utils/        ← shared helpers
\`\`\``
    case 'nextjs':
      return `\`\`\`
src/
  app/          ← App Router pages and layouts
  components/   ← shared UI components
  lib/          ← server utilities, db clients
  utils/        ← shared helpers
\`\`\``
    case 'tauri':
      return `\`\`\`
src/            ← frontend (${stack.hasTypeScript ? 'TypeScript' : 'JavaScript'})
  components/
  utils/
src-tauri/      ← Rust backend
  src/
    main.rs     ← Tauri entry point
    commands.rs ← Tauri commands (IPC)
  tauri.conf.json
\`\`\``
    case 'fastapi':
      return `\`\`\`
app/
  main.py       ← FastAPI app entry point
  routers/      ← API route groups
  models/       ← Pydantic models
  services/     ← business logic
  dependencies/ ← FastAPI dependencies (DI)
tests/          ← pytest tests
\`\`\``
    case 'express':
      return `\`\`\`
src/
  routes/       ← Express routers (one per domain)
  controllers/  ← request handlers
  services/     ← business logic
  middleware/   ← Express middleware
  utils/        ← shared helpers
\`\`\``
    case 'node':
      return `\`\`\`
src/
  index.ts      ← entry point
  lib/          ← core library code
  utils/        ← shared helpers
\`\`\``
    default:
      return `\`\`\`
src/            ← source files
\`\`\``
  }
}

function stackTable(stack: StackInfo, blueprintConstraints: string): string {
  const lang = stack.language === 'python' ? 'Python' : stack.hasTypeScript ? 'TypeScript' : 'JavaScript'
  const rows: [string, string][] = [
    ['Framework', stackLabel(stack)],
    ['Language', lang],
  ]
  if (stack.extras.includes('prisma')) rows.push(['Database', 'Prisma ORM'])
  if (stack.extras.includes('tailwind')) rows.push(['Styling', 'Tailwind CSS'])
  if (stack.extras.includes('testing')) rows.push(['Testing', 'Vitest / Jest'])

  const header = '| Technology | Details |\n|---|---|'
  const rowLines = rows.map(([k, v]) => `| **${k}** | ${v} |`).join('\n')

  let table = `${header}\n${rowLines}`

  if (blueprintConstraints) {
    table += `\n\n**Tech constraints (from blueprint)**:\n${blueprintConstraints}`
  }

  return table
}

export function generateReadme({ projectName, blueprintContent, stack }: ReadmeInput): string {
  const goal = blueprintContent ? extractSection(blueprintContent, 'Goal') : ''
  const features = blueprintContent ? extractSection(blueprintContent, 'Features') : ''
  const techConstraints = blueprintContent
    ? extractSection(blueprintContent, 'Tech constraints')
    : ''

  const tagline = goal
    ? goal.split('\n')[0].replace(/^[-*>]\s*/, '')
    : `A ${stackLabel(stack)} project.`

  const overview = goal
    ? goal
    : `This project was scaffolded with [AgentKit](https://www.npmjs.com/package/@patricksardinha/agentkit-cli).`

  const featuresSection = features
    ? features
    : '_Features will be described here._'

  return `# ${projectName}

> ${tagline}

## Overview

${overview}

## Tech Stack

${stackTable(stack, techConstraints)}

## Getting Started

${gettingStarted(stack)}

## Features

${featuresSection}

## Project Structure

${projectStructure(stack)}

## Built with AgentKit

This project was scaffolded with [AgentKit](https://www.npmjs.com/package/@patricksardinha/agentkit-cli) — a CLI that generates AI-native agent workflows for Claude Code.

Read \`PLAYBOOK.md\` to understand the agent workflow that built this project.
`
}
