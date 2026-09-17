from PIL import Image
import numpy as np
from scipy import ndimage
import os

SRC = "/Users/josephprinable/Documents/wedding site/images/pili-good-poses.png"
OUT = "_good_poses_crops"
os.makedirs(OUT, exist_ok=True)

EXPECTED_POSES = 9
SINGLE_POSE_MAX = 150
pad = 6
# pili-good-poses.png renders Pili at roughly half the pixel density of
# dance01/02.jpeg (compare a plain standing pose in each: ~219px tall here
# vs. ~445px tall there) -- upscale 2x with nearest-neighbor so these frames
# read at the same on-screen size as the existing dance-0..11 frames once
# Level3WaitScene applies its single shared baseScale, and so the pixel art
# stays crisp instead of blurring under Phaser's own scaling.
UPSCALE = 2

img = Image.open(SRC).convert("RGBA")
arr = np.array(img)
alpha = arr[..., 3].astype(float)
fg = alpha > 20
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
    if merged and r[0] - merged[-1][1] < 6:
        merged[-1] = (merged[-1][0], r[1])
    else:
        merged.append(list(r))
merged = [list(r) for r in merged if r[1] - r[0] > 20]

# Two touching/overlapping figures show up as one much-wider blob (single
# poses top out around 120px here). Split any blob over SINGLE_POSE_MAX at
# its weakest interior column (fewest foreground pixels).
INSET = 3
split_once = []
for x0, x1 in merged:
    if x1 - x0 > SINGLE_POSE_MAX:
        core_lo, core_hi = x0 + 25, x1 - 25
        seg = colsum[core_lo:core_hi]
        split_x = core_lo + int(np.argmin(seg))
        split_once.append([x0, split_x - INSET])
        split_once.append([split_x + INSET, x1])
        print(f"  split blob ({x0},{x1}) at x={split_x}")
    else:
        split_once.append([x0, x1])
merged = split_once

print("final column ranges:", merged)
if len(merged) != EXPECTED_POSES:
    print(f"!! expected {EXPECTED_POSES}, got {len(merged)}")

names = [f"pili-good-pose-{i}" for i in range(len(merged))]
for name, (x0, x1) in zip(names, merged):
    col_fg = fg[:, x0:x1]
    rows_with_content = np.where(col_fg.any(axis=1))[0]
    y0, y1 = rows_with_content.min(), rows_with_content.max()
    box = (max(x0 - pad, 0), max(y0 - pad, 0), min(x1 + pad, arr.shape[1]), min(y1 + pad, arr.shape[0]))
    cropped = img.crop(box)

    # Adjacent poses can leak a stray fragment (a fingertip, a sliver of hair)
    # into the crop's edge. Keep only the largest connected alpha component.
    c_arr = np.array(cropped)
    c_fg = c_arr[..., 3] > 20
    labels, n = ndimage.label(c_fg, structure=np.ones((3, 3)))
    if n > 1:
        sizes = ndimage.sum(c_fg, labels, range(1, n + 1))
        keep = 1 + int(np.argmax(sizes))
        c_arr[labels != keep, 3] = 0
        cropped = Image.fromarray(c_arr, "RGBA")
        main_ys, main_xs = np.where(labels == keep)
        tight = (main_xs.min(), main_ys.min(), main_xs.max() + 1, main_ys.max() + 1)
        cropped = cropped.crop(tight)
        print(f"    dropped {n - 1} stray fragment(s), retightened to {tight}")

    cropped = cropped.resize((cropped.width * UPSCALE, cropped.height * UPSCALE), Image.NEAREST)
    cropped.save(f"{OUT}/{name}.png")
    print(" ", name, box, cropped.size)
