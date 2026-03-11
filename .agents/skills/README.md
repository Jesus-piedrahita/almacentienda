# AI Agent Skills

This directory contains **Agent Skills** following the [Agent Skills open standard](https://agentskills.io). Skills provide domain-specific patterns, conventions, and guardrails that help AI coding assistants understand project-specific requirements.

## What Are Skills?

[Agent Skills](https://agentskills.io) is an open standard format for extending AI agent capabilities with specialized knowledge. Skills teach AI assistants how to perform specific tasks.

## Available Skills

### Generic Skills

| Skill | Description | Source |
|-------|-------------|--------|
| `typescript` | Const types, flat interfaces, utility types | local |
| `react-19` | React 19 patterns, React Compiler | local |
| `zustand-5` | Zustand 5 state management patterns | local |
| `axios` | HTTP client patterns and best practices | local |
| `frontend-design` | Production-grade frontend interfaces with distinctive design | github |
| `frontend-design-system` | UI designs with design tokens, layout rules, motion guidance | github |
| `frontend-ui-animator` | UI animations for Next.js + Tailwind + React | github |

### Meta Skills

| Skill | Description | Source |
|-------|-------------|--------|
| `skill-creator` | Create new AI agent skills | local |
| `skill-sync` | Sync skill metadata to AGENTS.md Auto-invoke sections | local |

## Setup

Run the setup script to configure skills for AI coding assistants:

```bash
./.agents/skills/skill-sync/assets/sync.sh
```

## How to Use Skills

Skills are automatically discovered by the AI agent. To manually load a skill during a session, use the skill tool:

```
Load skill: {skill-name}
```

Or read the skill file:

```
Read .agents/skills/{skill-name}/SKILL.md
```

## Creating New Skills

Use the `skill-creator` skill for guidance:

```
Load skill: skill-creator
```

Or read the skill file:

```
Read .agents/skills/skill-creator/SKILL.md
```

## Syncing Skills

After creating or modifying a skill, run:

```bash
./.agents/skills/skill-sync/assets/sync.sh
```

This updates AGENTS.md files with skill metadata.

## Resources

- [Agent Skills Standard](https://agentskills.io)
