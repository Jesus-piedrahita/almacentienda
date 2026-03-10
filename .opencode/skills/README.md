# AI Agent Skills

This directory contains **Agent Skills** following the [Agent Skills open standard](https://agentskills.io). Skills provide domain-specific patterns, conventions, and guardrails that help AI coding assistants understand project-specific requirements.

## What Are Skills?

[Agent Skills](https://agentskills.io) is an open standard format for extending AI agent capabilities with specialized knowledge. Skills teach AI assistants how to perform specific tasks.

## Available Skills

### Generic Skills

| Skill | Description |
|-------|-------------|
| `typescript` | Const types, flat interfaces, utility types |
| `react-19` | React 19 patterns, React Compiler |
| `zustand-5` | Zustand 5 state management patterns |
| `axios` | HTTP client patterns and best practices |

### Meta Skills

| Skill | Description |
|-------|-------------|
| `skill-creator` | Create new AI agent skills |
| `skill-sync` | Sync skill metadata to AGENTS.md Auto-invoke sections |

## Setup

Run the setup script to configure skills for AI coding assistants:

```bash
./.opencode/skills/skill-sync/assets/sync.sh
```

## How to Use Skills

Skills are automatically discovered by the AI agent. To manually load a skill during a session:

```
Read .opencode/skills/{skill-name}/SKILL.md
```

## Creating New Skills

Use the `skill-creator` skill for guidance:

```
Read .opencode/skills/skill-creator/SKILL.md
```

## Syncing Skills

After creating or modifying a skill, run:

```bash
./.opencode/skills/skill-sync/assets/sync.sh
```

This updates AGENTS.md files with skill metadata.

## Resources

- [Agent Skills Standard](https://agentskills.io)
