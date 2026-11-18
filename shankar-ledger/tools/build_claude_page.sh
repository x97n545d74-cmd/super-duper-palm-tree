#!/usr/bin/env bash
# Builds the version published as a Claude artifact: it reads papers on the viewer's own
# Claude account (the artifact "sample" capability), so it needs no server and no API key.
# Publish with capabilities {sample: {images: true}}.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
out="${1:?usage: build_claude_page.sh <output folder>}"
mkdir -p "$out/vendor"
cp "$here"/public/{app.js,match.js,i18n.js,demo.js,prompt.js,claude-reader.js} "$out"/
cp "$here"/public/vendor/{pdf.min.js,pdf.worker.min.js,xlsx.full.min.js} "$out/vendor/"
{
  echo '<title>Shankar Medicos खाता मिलान</title>'
  echo '<style>'; cat "$here/public/style.css"; echo '</style>'
  echo '<script>window.LEDGER_VIA_CLAUDE = true;</script>'
  sed -n '/<body>/,/<\/body>/p' "$here/public/index.html" | sed '1d;$d' | grep -v '<script type="module"'
  echo '<script type="module" src="app.js"></script>'
} > "$out/index.html"
echo "Claude page built in $out"
