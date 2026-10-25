"""Cut both characters out of the reference sheet and separate their face features.
Writes public/ep01/chars/{boy,girl}_body.png (features painted out), feature sprites, and rig.json."""
import json, sys, os
import numpy as np, cv2
from scipy import ndimage as ndi

src, out = sys.argv[1:3]
os.makedirs(out, exist_ok=True)
S = 2  # work at 2x
img = cv2.imread(src)
img = cv2.resize(img, None, fx=S, fy=S, interpolation=cv2.INTER_LANCZOS4)
blur = cv2.GaussianBlur(img, (0, 0), 1.0)
img = cv2.addWeighted(img, 1.5, blur, -0.5, 0)
H, W = img.shape[:2]
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
# background = bright, unsaturated, connected to the border
bright = (hsv[..., 2] > 222) & (hsv[..., 1] < 30)
lab, _ = ndi.label(bright)
border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
bg = np.isin(lab, border[border > 0])
fg = ~bg
fg = ndi.binary_opening(fg, iterations=1)
lab, n = ndi.label(fg)
sizes = ndi.sum(fg, lab, range(1, n + 1))
keep = np.zeros(n + 1, bool); keep[1:] = sizes > 40000 * S * S / 4
fg = keep[lab]
# soft edge
alpha = cv2.GaussianBlur(fg.astype(np.float32), (0, 0), 0.8)
rig = {"scale": S}
LIMIT = {"boy": 0.8, "girl": 0.8}  # below this (sneakers) white stays
KEEP = {"boy": [], "girl": [(860, 600, 1060, 830), (370, 820, 620, 1150)]}  # coffee cup, AVRON notebook (2x crop px)
# feature boxes in 2x crop coordinates, picked from the debug overlay
BOXES = {
    "boy": {"browL": (526, 332, 78, 53), "browR": (735, 260, 88, 34), "eyeL": (568, 409, 64, 67), "eyeR": (776, 332, 64, 68), "mouth": (648, 461, 196, 169)},
    "girl": {"browL": (361, 378, 50, 30), "browR": (558, 344, 77, 27), "eyeL": (301, 443, 123, 89), "eyeR": (577, 406, 90, 90), "mouth": (444, 538, 145, 116)},
}
for name, (x0, x1) in {"boy": (0, 745 * S), "girl": (745 * S, W)}.items():
    m = np.zeros_like(fg); m[:, x0:x1] = fg[:, x0:x1]
    ys, xs = np.where(m)
    bx0, by0, bx1, by1 = xs.min() - 6, ys.min() - 6, xs.max() + 7, ys.max() + 7
    crop = img[by0:by1, bx0:bx1].copy()
    a = (alpha[by0:by1, bx0:bx1] * m[by0:by1, bx0:bx1].astype(np.float32))
    # white paper trapped between hair strands / arms is background too; keep the sneakers, cup and notebook
    cb = bright[by0:by1, bx0:bx1] & m[by0:by1, bx0:bx1]
    hl, hn = ndi.label(cb)
    keepbox = KEEP[name]
    for i, sl_ in enumerate(ndi.find_objects(hl), 1):
        cy = (sl_[0].start + sl_[0].stop) / 2 / (by1 - by0)
        cx_ = (sl_[1].start + sl_[1].stop) / 2
        cyp = (sl_[0].start + sl_[0].stop) / 2
        if cy > LIMIT[name] or any(x0k <= cx_ <= x1k and y0k <= cyp <= y1k for x0k, y0k, x1k, y1k in keepbox):
            continue
        hole = ndi.binary_dilation(hl[sl_] == i, iterations=2)
        a[sl_][hole] = 0
    a = cv2.GaussianBlur(a, (0, 0), 0.7)
    # face: skin region in the head area, holes = features
    hc = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    skin = ((hc[..., 0] <= 22) | (hc[..., 0] >= 172)) & (hc[..., 1] > 40) & (hc[..., 1] < 165) & (hc[..., 2] > 200)
    hh = int(crop.shape[0] * 0.42)
    sk = np.zeros_like(skin); sk[:hh] = skin[:hh]
    sl, sn = ndi.label(sk)
    face = sl == (np.argmax(ndi.sum(sk, sl, range(1, sn + 1))) + 1)
    hull = cv2.fillConvexPoly(np.zeros(face.shape, np.uint8), cv2.convexHull(np.argwhere(face)[:, ::-1].astype(np.int32)), 1).astype(bool)
    hull = ndi.binary_erosion(hull, iterations=2)
    feats = np.zeros_like(face)
    comps = []
    for role, (fx, fy, fw, fh) in BOXES[name].items():
        box = np.zeros_like(face); box[fy - 3:fy + fh + 3, fx - 3:fx + fw + 3] = True
        fm_ = box & hull & ~face
        fm_ = ndi.binary_fill_holes(fm_)
        feats |= fm_
        ys_, xs_ = np.where(fm_)
        comps.append({"role": role, "x": int(xs_.min()), "y": int(ys_.min()), "w": int(xs_.max() - xs_.min() + 1), "h": int(ys_.max() - ys_.min() + 1),
                      "cx": float(xs_.mean()), "cy": float(ys_.mean()), "_m": fm_})
    rig[name] = {"origin": [int(bx0), int(by0)], "size": [int(bx1 - bx0), int(by1 - by0)],
                 "skin": [int(v) for v in np.median(crop[face][:, ::-1], axis=0)],
                 "features": {c["role"]: {k: v for k, v in c.items() if k[0] != "_"} for c in comps}}
    feat_mask = ndi.binary_dilation(feats, iterations=7).astype(np.uint8) * 255
    # sprites of the original features (RGBA, feature pixels only)
    for c in comps:
        y0, x0_, hh_, ww = c["y"] - 6, c["x"] - 6, c["h"] + 12, c["w"] + 12
        c["x"], c["y"], c["w"], c["h"] = x0_, y0, ww, hh_
        sp = crop[y0:y0 + hh_, x0_:x0_ + ww]
        ma = ndi.binary_dilation(c["_m"][y0:y0 + hh_, x0_:x0_ + ww], iterations=2)
        aa = cv2.GaussianBlur(ma.astype(np.float32), (0, 0), 0.8)
        cv2.imwrite(f"{out}/{name}_{c['role']}.png", np.dstack([sp, (aa * 255).astype(np.uint8)]))
    # inpaint the features from skin only: hair/outline pixels near a feature are first set to the
    # median skin colour so the inpaint never samples them, then the result is blended back softly
    med = np.median(crop[face], axis=0)
    ring = ndi.binary_dilation(feat_mask > 0, iterations=18) & ~face & ~(feat_mask > 0)
    pre = crop.copy(); pre[ring] = med
    filled_ = cv2.inpaint(pre, feat_mask, 6, cv2.INPAINT_TELEA)
    sm = cv2.GaussianBlur(filled_, (0, 0), 3)
    fm = cv2.GaussianBlur(feat_mask.astype(np.float32) / 255, (0, 0), 2)[..., None]
    clean = (crop * (1 - fm) + sm * fm).clip(0, 255).astype(np.uint8)
    cv2.imwrite(f"{out}/{name}_body.png", np.dstack([clean, (np.clip(a, 0, 1) * 255).astype(np.uint8)]))
    cv2.imwrite(f"{out}/{name}_orig.png", np.dstack([crop, (np.clip(a, 0, 1) * 255).astype(np.uint8)]))
json.dump(rig, open(f"{out}/rig.json", "w"), indent=1)
print(json.dumps({k: rig[k]['features'] if k != 'scale' else 2 for k in rig}, indent=0))
