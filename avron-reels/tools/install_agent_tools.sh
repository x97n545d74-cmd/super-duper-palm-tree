#!/usr/bin/env bash
# Re-install the agent tools the user asked for (installed on 2026-10-24).
# Safe to re-run. Needs node/npx, uv and git on PATH.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"

# 1. claude-mem: persistent memory plugin for Claude Code (github.com/thedotmack/claude-mem)
#    On a non-interactive run it defaults to local memory on your Anthropic plan, with cloud sync off.
npx -y claude-mem install
npx -y claude-mem start

# 2. Agent Reach: read-only multi-platform reader (github.com/Panniantong/Agent-Reach)
#    Never install the PyPI package called "agent-reach"; it is a different project.
uv tool install --force https://github.com/Panniantong/Agent-Reach/releases/latest/download/agent-reach.zip
agent-reach setup

# 3. SkillSpector: security scanner for agent skills (github.com/NVIDIA/skillspector)
#    Update later with: uv tool update skillspector
uv tool install --force git+https://github.com/NVIDIA/skillspector.git

# 4. no-ai-slop skill, installed globally for Claude Code (github.com/petergyang/no-ai-slop)
tmp=$(mktemp -d)
git clone -q --depth 1 https://github.com/petergyang/no-ai-slop.git "$tmp/no-ai-slop"
skillspector scan "$tmp/no-ai-slop/skills/no-ai-slop" --no-llm | tail -6
mkdir -p "$HOME/.claude/skills"
rm -rf "$HOME/.claude/skills/no-ai-slop"
cp -r "$tmp/no-ai-slop/skills/no-ai-slop" "$HOME/.claude/skills/no-ai-slop"
rm -rf "$tmp"

echo "Done: claude-mem, agent-reach, skillspector, no-ai-slop"
