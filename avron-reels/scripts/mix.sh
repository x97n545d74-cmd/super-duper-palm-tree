#!/usr/bin/env bash
# Final audio mix: music ducked under VO (sidechain), SFX, VO; two-pass loudnorm to -14 LUFS / -1.5 dBTP.
# usage: scripts/mix.sh <asset_dir>   (expects vo.wav music.wav sfx.wav, writes mix.wav)
set -euo pipefail
D="$1"
GRAPH="[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,highpass=f=80,acompressor=threshold=0.1:ratio=3:attack=5:release=120:makeup=1.5,asplit=2[vo][key];\
[1:a]volume=0.55[mus];[mus][key]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=400:makeup=1[duck];\
[2:a]volume=0.8[sfx];[vo][duck][sfx]amix=inputs=3:normalize=0:duration=longest[pre]"
STATS=$(ffmpeg -hide_banner -i "$D/vo.wav" -i "$D/music.wav" -i "$D/sfx.wav" -filter_complex "$GRAPH;[pre]loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$STATS" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -hide_banner -v error -y -i "$D/vo.wav" -i "$D/music.wav" -i "$D/sfx.wav" -filter_complex \
  "$GRAPH;[pre]loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000[out]" \
  -map "[out]" -c:a pcm_s16le "$D/mix.wav"
ffmpeg -hide_banner -i "$D/mix.wav" -af loudnorm=I=-14:TP=-1.5:print_format=summary -f null - 2>&1 | grep -E "Input Integrated|Input True Peak"
