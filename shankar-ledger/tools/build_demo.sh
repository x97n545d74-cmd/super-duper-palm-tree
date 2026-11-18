#!/usr/bin/env bash
# Builds the no-server demo (sample papers only) into the folder given as $1.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
out="${1:?usage: build_demo.sh <output folder>}"
mkdir -p "$out"
cp "$here"/public/{app.js,match.js,i18n.js,demo.js,style.css} "$out"/
pdftoppm -png -r 110 -singlefile "$here/samples/sample-our-ledger-tally.pdf" "$out/sample-our-ledger"
pdftoppm -png -r 110 -singlefile "$here/samples/sample-party-statement.pdf" "$out/sample-party-statement"
# Page for the Artifact host: no doctype/html/head/body (the host wraps it), styles inline.
{
  echo '<title>Shankar Medicos खाता मिलान</title>'
  echo '<style>'; cat "$here/public/style.css"; echo '</style>'
  echo '<script>window.LEDGER_DEMO = true;</script>'
  sed -n '/<body>/,/<\/body>/p' "$here/public/index.html" | sed '1d;$d' | grep -v '<script type="module"'
  echo '<script type="module" src="app.js"></script>'
} > "$out/index.html"
echo "demo built in $out"
