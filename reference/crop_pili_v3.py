from PIL import Image
import numpy as np

SRC = "pili.png"
OUT = "_crops3"
import os
os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert("RGBA")
arr = np.array(img).astype(float)
bg = arr[0, 0, :3]
dist = np.sqrt(((arr[..., :3] - bg) ** 2).sum(axis=2))
fg = dist > 30

colsum = fg.sum(axis=0)
cols_with_content = colsum > 2
ranges = []
in_blob = False
start = 0
for x, has in enumerate(cols_with_content):
    if has and not in_blob:
        start = x
        in_blob = True
    elif not has and in_blob:
        ranges.append((start, x))
        in_blob = False
if in_blob:
    ranges.append((start, len(cols_with_content)))
merged = []
for r in ranges:
    if merged and r[0] - merged[-1][1] < 15:
        merged[-1] = (merged[-1][0], r[1])
    else:
        merged.append(list(r))
merged = [tuple(r) for r in merged if r[1] - r[0] > 50]
print("detected column ranges:", merged)

# Steeper alpha ramp (narrower transition band) + color decontamination:
# un-blend each partially-transparent edge pixel's RGB away from the known
# flat background color, so no blue fringe survives even at partial alpha.
LOW, HIGH = 25, 145
alpha = np.clip((dist - LOW) / (HIGH - LOW), 0, 1)

a_safe = np.where(alpha > 0.02, alpha, 1)[..., None]
decontaminated = bg + (arr[..., :3] - bg) / a_safe
decontaminated = np.clip(decontaminated, 0, 255)

out_full = arr.copy()
out_full[..., :3] = decontaminated
out_full[..., 3] = alpha * 255

# Dark clothing (boots) blended with the blue bg settles into a dark-but-
# still-blue-tinted color even once fully opaque, unlike skin/hair which
# shift hue strongly enough for decontamination alone to fix. Desaturate the
# blue cast out of any dark, blue-leaning, mostly-opaque pixel.
rgb = out_full[..., :3]
maxc = rgb.max(axis=2)
blue_bias = rgb[..., 2] - np.maximum(rgb[..., 0], rgb[..., 1])
dark_blue_tinted = (out_full[..., 3] > 100) & (maxc < 110) & (blue_bias > 12)
neutral = rgb.mean(axis=2, keepdims=True) * 0.7
rgb[dark_blue_tinted] = neutral[dark_blue_tinted]
out_full[..., :3] = rgb

full_img = Image.fromarray(out_full.astype("uint8"), "RGBA")

names = ["pili-idle", "pili-run-0", "pili-run-1", "pili-jump"]
pad = 8
for name, (x0, x1) in zip(names, merged):
    col_fg = fg[:, x0:x1]
    rows_with_content = np.where(col_fg.any(axis=1))[0]
    y0, y1 = rows_with_content.min(), rows_with_content.max()
    box = (max(x0 - pad, 0), max(y0 - pad, 0), min(x1 + pad, arr.shape[1]), min(y1 + pad, arr.shape[0]))
    cropped = full_img.crop(box)
    cropped.save(f"{OUT}/{name}.png")
    print(name, box, cropped.size)
