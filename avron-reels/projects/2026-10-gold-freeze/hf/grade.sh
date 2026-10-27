#!/usr/bin/env bash
# Colour grading for the v2 photos (HyperFrames media-treatment; no CSS filters). Run after gen_scenes.py.
set -e
cd "$(dirname "$0")"
DARK='{"adjust":{"exposure":-1.3,"saturation":-0.25,"contrast":0.1},"details":{"vignette":0.4}}'
DARKER='{"adjust":{"exposure":-1.7,"saturation":-0.4,"contrast":0.1},"details":{"vignette":0.45}}'
CARD='{"adjust":{"exposure":-0.25,"contrast":0.08,"saturation":-0.1}}'
g() { npx hyperframes media-treatment --file "$1" --selector "$2" --grading "$3" --apply --json >/dev/null; }
g compositions/s1.html "#s1-bg" "$DARK"
g compositions/s5.html "#s5-bg" "$DARKER"
for i in 0 1 2; do g compositions/s3.html "#s3-c$i img" "$CARD"; done
echo graded
