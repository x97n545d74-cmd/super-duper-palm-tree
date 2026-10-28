#!/usr/bin/env bash
# SessionStart: make sure the agent tools the user asked for are installed.
# Skips the reinstall when everything is already there, so it is fast after the first run.
export PATH="$HOME/.local/bin:$PATH"
root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

# lemo-opuscar film-style plugin (user asked 2026-10-28; reviewed with SkillSpector, see avron-reels/MEMORY.md)
if [ ! -d "$HOME/.claude/plugins/cache/lemolab/lemo-opuscar" ] && command -v claude >/dev/null; then
  { claude plugin marketplace add lemomo-ai/lemo-opuscar && claude plugin install lemo-opuscar@lemolab; } >/tmp/lemo_opuscar_install.log 2>&1 \
    && echo "lemo-opuscar plugin installed" || echo "lemo-opuscar install failed; see /tmp/lemo_opuscar_install.log"
fi

if command -v agent-reach >/dev/null && command -v skillspector >/dev/null \
   && [ -d "$HOME/.claude/plugins/cache/thedotmack/claude-mem" ]; then
  npx -y claude-mem start >/dev/null 2>&1 || true
  echo "Agent tools ready: claude-mem, agent-reach, skillspector, no-ai-slop"
  exit 0
fi

bash "$root/avron-reels/tools/install_agent_tools.sh" >/tmp/agent_tools_install.log 2>&1 \
  && echo "Agent tools installed: claude-mem, agent-reach, skillspector, no-ai-slop" \
  || echo "Agent tools install failed; see /tmp/agent_tools_install.log"
exit 0
