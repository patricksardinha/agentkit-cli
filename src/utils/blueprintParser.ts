export interface BlueprintFeature {
  name: string
  items: string[]
}

export function parseBlueprint(content: string): BlueprintFeature[] {
  const features: BlueprintFeature[] = []

  // Locate all ## headings (not # or ###)
  const sectionRegex = /^## (.+)$/gm
  const sections: Array<{ name: string; start: number }> = []
  let m: RegExpExecArray | null
  while ((m = sectionRegex.exec(content)) !== null) {
    sections.push({ name: m[1].trim(), start: m.index })
  }

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const end = i + 1 < sections.length ? sections[i + 1].start : content.length
    const body = content.slice(section.start, end)

    const items = [...body.matchAll(/^[-*]\s+(.+)$/gm)].map((r) => r[1].trim())

    features.push({ name: section.name, items })
  }

  return features
}
