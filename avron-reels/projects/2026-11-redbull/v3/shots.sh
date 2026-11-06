#!/bin/bash
# usage: ./shots.sh R2 1.6,5,13 ...   -> scratchpad/R2.jpg
N=$1; shift; rm -rf stills; node render.mjs stills "$1" 2>&1 | grep -E "PAGEERR|PAGE error" | head -5
python3 - "$N" <<'PY'
import sys,glob
from PIL import Image
fs=sorted(glob.glob('stills/*.jpg'), key=lambda f: float(f.split('_')[1][:-4])); W=240;H=427
out=Image.new('RGB',(W*len(fs),H))
for i,f in enumerate(fs): out.paste(Image.open(f).resize((W,H)),(i*W,0))
out.save(f'/tmp/claude-0/-home-user-super-duper-palm-tree/bf2774eb-63a9-5e43-86be-4b7c08f3b2dc/scratchpad/{sys.argv[1]}.jpg')
PY
