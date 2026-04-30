# Skills — Agent 3 · Generators & Templates

> This file is read by Agent 3 before starting its work.

## Template function signature

Every template file must export exactly these two functions:

```typescript
export function claudeMd(stack: StackInfo): string
export function workflow(stack: StackInfo): string
```

The `workflow()` function returns a markdown string. The workflowGenerator
is responsible for parsing that string into an `Agent[]` array.

## Agent type

```typescript
export interface Agent {
  number: number        // 1, 2, 3…
  slug: string          // 'infra', 'auth', 'features'…
  name: string          // 'Infra & Setup', 'Auth & Supabase'…
  scope: string         // one-line description
  deliverables: string[]
  successCriterion: string   // the runnable bash command
}
```

## Blueprint parsing

When `blueprintContent` is provided, parse `## Feature` sections
using simple line splitting — no external markdown parser needed.
Extract bullet points under each `##` heading and use them to name
and scope the generated agents.

## playbookGenerator rules

The PLAYBOOK.md must always start with the one-instruction block:
> "Read PLAYBOOK.md and execute the procedure."

The retry limit is always 3. The escalation section is always present.
Do not make these values configurable — consistency is the point.
