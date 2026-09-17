from PIL import Image
import numpy as np

SRC = "piggybank.png"
OUT = "_piggybank_crop.png"
DEST = "../assets/sprites/props/piggybank.png"
TARGET_H = 48  # matches PROP_TARGET_H in finalize.py

img = Image.open(SRC).convert("RGB")
arr = np.array(img).astype(int)
h, w, _ = arr.shape

# Background is a soft vignette (not flat), so distance to a single corner
# sample isn't reliable across the whole frame — use the nearest of all 4
# corners instead, which tracks the gradient well enough that the pig
# (pink/black, far from blue in any corner) still separates cleanly.
corners = np.array([arr[0, 0], arr[0, w - 1], arr[h - 1, 0], arr[h - 1, w - 1]])
diffs = arr[:, :, None, :] - corners[None, None, :, :]
dist = np.sqrt((diffs ** 2).sum(axis=3)).min(axis=2)

alpha = np.clip((dist - 40) / (100 - 40) * 255, 0, 255).astype("uint8")
rgba = np.dstack([arr, alpha]).astype("uint8")
cutout = Image.fromarray(rgba, "RGBA")

bbox = cutout.getbbox()
cropped = cutout.crop(bbox)
cropped.save(OUT)

cw, chh = cropped.size
scale = TARGET_H / chh
resized = cropped.resize((max(1, round(cw * scale)), TARGET_H), Image.NEAREST)
resized.save(DEST)
print("cropped", bbox, "->", cropped.size, "-> resized", resized.size)
