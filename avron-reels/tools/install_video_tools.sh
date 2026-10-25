#!/usr/bin/env bash
# Reinstall the 5 GitHub video tools after a container reset (installed 2026-10-25).
# All were scanned with SkillSpector first; see avron-reels/MEMORY.md "Video tools".
# Safe to re-run: each step is skipped when already done.
set -u
export PATH="$HOME/.local/bin:$PATH"
tools="$HOME/github-tools"
mkdir -p "$tools" "$HOME/.claude/skills"

clone() { [ -d "$tools/$2" ] || git clone --depth 1 "https://github.com/$1/$2.git" "$tools/$2"; }

# 1. HyperFrames (Apache-2.0) and 5. Lemo-Opuscar (MIT): Claude Code plugins
if ! claude plugin list 2>/dev/null | grep -q "hyperframes@hyperframes"; then
  claude plugin marketplace add heygen-com/hyperframes && claude plugin install hyperframes@hyperframes
fi
if ! claude plugin list 2>/dev/null | grep -q "lemo-opuscar@lemolab"; then
  claude plugin marketplace add lemomo-ai/lemo-opuscar && claude plugin install lemo-opuscar@lemolab
fi

# 2. onetake (PolyForm Noncommercial) and 3. gbro-collage-broll (MIT): plain skills
for r in feitangyuan/onetake pyang5166/gbro-collage-broll; do
  name="${r#*/}"
  clone "${r%/*}" "$name"
  [ -d "$HOME/.claude/skills/$name" ] || cp -r "$tools/$name" "$HOME/.claude/skills/$name"
done
# onetake renders with Python Playwright; pin it to the container's Chromium (Node playwright version)
pw="$(node -e "console.log(require('playwright/package.json').version)" 2>/dev/null)"
python3 -c "import playwright,numpy,scipy,PIL,matplotlib,cv2" 2>/dev/null \
  || pip install -q ${pw:+"playwright==$pw"} numpy scipy Pillow matplotlib opencv-python-headless

# 4. Claude Animation Base (MIT): a p5.js starter kit, not a skill
clone JohnHeibel ClaudeAnimationBase
[ -d "$tools/ClaudeAnimationBase/node_modules" ] || (cd "$tools/ClaudeAnimationBase" && npm install --no-audit --no-fund)

echo "Video tools ready: hyperframes, onetake, gbro-collage-broll, ClaudeAnimationBase, lemo-opuscar"
