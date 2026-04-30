import type { Agent } from '../types/agent.js'

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[·•&]/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getFieldValue(lines: string[], pattern: RegExp): string {
  for (const line of lines) {
    const m = line.match(pattern)
    if (m) return (m[1] ?? '').trim()
  }
  return ''
}

export function extractAgentsFromWorkflow(content: string): Agent[] {
  const agents: Agent[] = []

  // Split into blocks starting with "### Agent N"
  const blocks = content
    .split(/(?=^### Agent \d)/m)
    .filter((b) => /^### Agent \d/.test(b.trimStart()))

  for (const block of blocks) {
    const lines = block.split('\n')

    const headerMatch = lines[0].match(/^### Agent (\d+)\s*[·•]\s*(.+)$/)
    if (!headerMatch) continue

    const number = parseInt(headerMatch[1], 10)
    const name = headerMatch[2].trim()
    const fullName = `Agent ${number} · ${name}`
    const slug = toSlug(name)

    const scope = getFieldValue(lines, /Périmètre\s*:\s*(.+)/)
    const criterion = getFieldValue(lines, /Critère[s]?\s*:\s*(.+)/)

    // Outputs: may be inline or multi-line (indented "- item")
    const outputs: string[] = []
    const produitIdx = lines.findIndex((l) => /Produit\s*:/.test(l))
    if (produitIdx !== -1) {
      const inlineVal = (lines[produitIdx].match(/Produit\s*:\s*(.+)/)?.[1] ?? '').trim()
      if (inlineVal) {
        outputs.push(inlineVal)
      } else {
        for (let i = produitIdx + 1; i < lines.length; i++) {
          const line = lines[i]
          if (/^\s+[-]/.test(line)) {
            outputs.push(line.trim().replace(/^-\s*/, ''))
          } else if (line.trim() !== '' && !/^\s/.test(line)) {
            break
          }
        }
      }
    }

    agents.push({ number, name, fullName, slug, scope, outputs, criterion })
  }

  return agents
}
