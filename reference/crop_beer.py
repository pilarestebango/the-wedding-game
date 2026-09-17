from PIL import Image
import numpy as np
from scipy import ndimage
import os

SRC = "beer.jpeg"
OUT = "_beer_crops"
DEST = "../assets/sprites/props"
TARGET_H = 48  # matches PROP_TARGET_H in finalize.py

os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert("RGB")
arr = np.array(img).astype(int)
bg = arr[0, 0, :3]
dist = np.sqrt(((arr - bg) ** 2).sum(axis=2))
mask = dist > 25

# Auto-detect the 6 mug bounding boxes via connected components instead of
# hand-picked pixel coordinates — those were tuned for a previous version of
# beer.jpeg and silently misaligned (cropped mugs mid-glass/handle) once the
# reference image was regenerated at different mug positions/sizes.
labeled, n = ndimage.label(mask)
slices = ndimage.find_objects(labeled)
sizes = ndimage.sum(mask, labeled, range(1, n + 1))
boxes = []
for i, sl in enumerate(slices):
    if sl is None:
        continue
    if sizes[i] < 200:  # drop jpeg-noise specks
        continue
    ysl, xsl = sl
    boxes.append((i + 1, xsl.start, ysl.start, xsl.stop, ysl.stop))  # label id, x0, y0, x1, y1
boxes.sort(key=lambda b: b[1])  # left -> right = full -> empty

assert len(boxes) == 6, f"expected 6 mugs, found {len(boxes)}: {boxes}"

alpha = np.clip((dist - 15) / (55 - 15) * 255, 0, 255).astype("uint8")
rgba = np.dstack([arr, alpha]).astype("uint8")

PAD = 4  # small margin, but mugs sit only ~2px apart so we also mask by
# connected-component identity below — otherwise this padding alone would
# pull in the neighboring mug's anti-aliased edge (the "stray line" bug).

for i, (label_id, x0, y0, x1, y1) in enumerate(boxes):
    # Zero out any pixel that isn't part of THIS mug's own connected
    # component, so a neighboring mug's edge can never bleed into the crop.
    own_alpha = np.where(labeled == label_id, alpha, 0).astype("uint8")
    own_rgba = np.dstack([arr, own_alpha]).astype("uint8")
    full_img = Image.fromarray(own_rgba, "RGBA")

    px0, py0 = max(0, x0 - PAD), max(0, y0 - PAD)
    px1, py1 = min(full_img.width, x1 + PAD), min(full_img.height, y1 + PAD)
    cropped = full_img.crop((px0, py0, px1, py1))

    bbox = cropped.getbbox()
    if bbox:
        cropped = cropped.crop(bbox)

    w, h = cropped.size
    scale = TARGET_H / h
    resized = cropped.resize((max(1, round(w * scale)), TARGET_H), Image.NEAREST)

    resized.save(f"{OUT}/beer-{i}.png")
    resized.save(f"{DEST}/beer-{i}.png")
    print(f"beer-{i}", (px0, py0, px1, py1), "->", resized.size)
