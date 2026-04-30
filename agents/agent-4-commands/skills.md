# Skills — Agent 4 · Commands CLI

> This file is read by Agent 4 before starting its work.

## Commander.js setup

The CLI binary is `agentkit`. The three subcommands are:
- `init [options]`   with `--blueprint <path>`
- `add [options]`    with `--feature <description>`
- `status`

## init command behavior

1. Run gitDetector — warn but don't block if not a git repo
2. Run stackDetector on process.cwd()
3. If --blueprint provided: read file, warn if path doesn't exist
4. Call claudeMdGenerator(stack, blueprintContent?)
5. Call workflowGenerator(stack, blueprintContent?) → { markdown, agents }
6. Call playbookGenerator(agents, projectName)
7. Call skillsGenerator(agents)
8. Write all files — never overwrite existing files without --force flag

## add command behavior

1. Check AGENT_WORKFLOW.md exists — error if not (run init first)
2. Parse existing agents to find the last number
3. Generate new agent block from --feature description
4. Append to AGENT_WORKFLOW.md
5. Create agents/agent-{N+1}-{slug}/skills.md
6. Regenerate PLAYBOOK.md entirely (not append — full regeneration)

## Output rules

- Use logger.ts for all output — never console.log directly
- Use ora spinner during file generation
- Use chalk.green for success, chalk.yellow for warnings, chalk.red for errors
- Always print a summary of generated files at the end of init
