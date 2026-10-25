"""Paint the 'AVRON' lettering off the girl's notebook (the series posts on a separate account).
usage: debrand.py <chars_dir>  -> writes girl_body_plain.png"""
import sys
import numpy as np, cv2
from scipy import ndimage as ndi
d = sys.argv[1]
im = cv2.imread(f"{d}/girl_body.png", cv2.IMREAD_UNCHANGED)
x0, y0, x1, y1 = 370, 820, 620, 1150  # notebook, 2x crop px
roi = im[y0:y1, x0:x1, :3]
hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
dark = hsv[..., 2] < 70
# the cover: the big dark component in the box; letters are the light holes inside it
lab, n = ndi.label(dark)
cover = lab == (np.argmax(ndi.sum(dark, lab, range(1, n + 1))) + 1)
inside = ndi.binary_fill_holes(cover) & ~cover
lab2, n2 = ndi.label(inside)
mask = np.zeros_like(inside)
for i, sl in enumerate(ndi.find_objects(lab2), 1):
    h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
    if h < 60 and w < 60:  # letters only, not the hand or page edges
        mask[sl] |= lab2[sl] == i
# letter band: the one row the lettering sits on (roi px), filled from the cover around it
band = np.zeros_like(mask); band[80:150, 36:200] = True
mask = band.astype(np.uint8) * 255
filled = cv2.inpaint(np.ascontiguousarray(roi), mask, 12, cv2.INPAINT_TELEA)
sm = cv2.GaussianBlur(filled, (0, 0), 4)
fm = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 3)[..., None]
roi[:] = (roi * (1 - fm) + sm * fm).astype(np.uint8)
cv2.imwrite(f"{d}/girl_body_plain.png", im)
cv2.imwrite("/tmp/claude-0/-home-user-super-duper-palm-tree/68b9b21f-854c-58ed-8295-de6b3b967d9e/scratchpad/notebook.png",
            np.hstack([cv2.imread(f"{d}/girl_body.png")[y0:y1, x0:x1], im[y0:y1, x0:x1, :3]]))
print("letters removed:", int(mask.sum() / 255), "px")
