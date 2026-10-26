"""Write src/projects/thali/v2/photos.json (which stock photos are present) and credits.json (end-card credits),
and projects/2026-10-thali/assets/LICENSES.md, from the asset table below. usage: thali2_assets.py"""
import json, os

PUB = "public/thali2"
# file: (title, creator, licence, source page, credit needed)
A = {
    "thali.jpg": ("South Indian Thali Plate", "Rohit Motwani", "CC0 1.0", "https://wordpress.org/photos/photo/66865bead0/", False),
    "thali_b.jpg": ("My traditional Indian thali meal", "shankar s.", "CC BY 2.0", "https://www.flickr.com/photos/77742560@N06/48625245542", True),
    "onion.jpg": ("Onions", "JeepersMedia", "CC BY 2.0", "https://www.flickr.com/photos/ (16078327962, via Openverse 40594f5b)", True),
    "potato.jpg": ("Potatoes", "16:9clue", "CC BY 2.0", "https://www.flickr.com/photos/ (6762195603, via Openverse 059671ec)", True),
    "tomato.jpg": ("Tomatoes", "rightee", "CC BY 2.0", "https://www.flickr.com/photos/95172615@N00/4309558", True),
    "market.jpg": ("Vegetable market India", "KimMaxPhoto", "CC BY 2.0", "https://www.flickr.com/photos/49049659@N05/7582541956", True),
    "subji.jpg": ("Subji-walli", "Meanest Indian", "CC BY 2.0", "https://www.flickr.com/photos/56252733@N00/2179187363", True),
    "village.jpg": ("Rural Indian Village House", "Nithi clicks", "CC BY 2.0", "https://www.flickr.com/photos/47850033@N08/44431531434", True),
    "night_skyline.jpg": ("Mumbai Night City", "Vidur Malhotra", "Public Domain Mark", "https://www.flickr.com/photos/111661024@N07/18219784390", False),
    "grocery.jpg": ("Grocery Shelves", "Dennis S. Hurd", "CC0", "https://www.flickr.com/photos/43296902@N00/65248068", False),
    "sacks.jpg": ("Stock market", "Manu Manohar Photography", "CC BY 2.0", "https://www.flickr.com/photos/32833136@N04/4845905314", True),
    "street_1.jpg": ("Random Bangalore Traffic", "Peter Richmond", "CC BY 2.0", "https://www.flickr.com/photos/69364392@N00/4273320989", True),
}
present = sorted(f for f in os.listdir(PUB) if f in A)
json.dump(present, open("src/projects/thali/v2/photos.json", "w"), indent=1)
credits = [f'Photos: {A[f][0]} by {A[f][1]} ({A[f][2]})' for f in present if A[f][4]]
json.dump(["Photos " + "; ".join(f'{A[f][1]} ({A[f][2]})' for f in present if A[f][4])] if credits else [], open("src/projects/thali/v2/credits.json", "w"), indent=1)
os.makedirs("projects/2026-10-thali/assets", exist_ok=True)
with open("projects/2026-10-thali/assets/LICENSES.md", "w") as fh:
    fh.write("# Thali reel v2: stock photo licences\n\nOnly CC0, public domain and CC BY (no SA). CC BY credits are on the end card. Logged 2026-10-26. Used in `src/projects/thali/v2/ReelV2.tsx`.\n\n")
    fh.write("| file | title | creator | licence | source | credit on end card |\n|---|---|---|---|---|---|\n")
    for f in present:
        t, c, l, u, cr = A[f]
        fh.write(f"| public/thali2/{f} | {t} | {c} | {l} | {u} | {'yes' if cr else 'no'} |\n")
print("present:", present)
