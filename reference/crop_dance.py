from PIL import Image
import numpy as np
import os

OUT = "_dance_crops"
os.makedirs(OUT, exist_ok=True)

SOURCES = [
    ("dance01.jpeg", ["pili-dance-0", "pili-dance-1", "pili-dance-2", "pili-dance-3", "pili-dance-4", "pili-dance-5"]),
    ("dance02.jpeg", ["pili-dance-6", "pili-dance-7", "pili-dance-8", "pili-dance-9", "pili-dance-10", "pili-dance-11"]),
]

pad = 8

for src, names in SOURCES:
    img = Image.open(src).convert("RGBA")
    arr = np.array(img).astype(float)
    # sample bg from several corners and average, to smooth over jpeg noise
    corners = [arr[0, 0, :3], arr[0, -1, :3], arr[-1, 0, :3], arr[-1, -1, :3]]
    bg = np.mean(corners, axis=0)
    dist = np.sqrt(((arr[..., :3] - bg) ** 2).sum(axis=2))
    fg = dist > 30

    colsum = fg.sum(axis=0)
    cols_with_content = colsum > 3
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
        if merged and r[0] - merged[-1][1] < 4:
            merged[-1] = (merged[-1][0], r[1])
        else:
            merged.append(list(r))
    merged = [tuple(r) for r in merged if r[1] - r[0] > 50]

    # Two figures with overlapping/touching limbs (no zero-column gap) still
    # show up as one wide blob -- split any blob much wider than a single
    # pose at its weakest column (fewest foreground pixels) instead of
    # merging them. The split point still has a few pixels of one figure's
    # limb bleeding across (e.g. a fingertip), so inset both sides of the cut
    # a little further and skip the usual outer pad there.
    SINGLE_POSE_MAX = 350
    SPLIT_INSET = 3
    split_merged = []  # list of (x0, x1, pad_left, pad_right)
    for x0, x1 in merged:
        if x1 - x0 > SINGLE_POSE_MAX:
            core_lo, core_hi = x0 + 60, x1 - 60
            seg = colsum[core_lo:core_hi]
            split_x = core_lo + int(np.argmin(seg))
            split_merged.append((x0, split_x - SPLIT_INSET, True, False))
            split_merged.append((split_x + SPLIT_INSET, x1, False, True))
            print(f"  split wide blob ({x0},{x1}) at x={split_x}")
        else:
            split_merged.append((x0, x1, True, True))
    merged = split_merged
    print(src, "detected column ranges:", [(a, b) for a, b, _, _ in merged])

    LOW, HIGH = 25, 145
    alpha = np.clip((dist - LOW) / (HIGH - LOW), 0, 1)

    a_safe = np.where(alpha > 0.02, alpha, 1)[..., None]
    decontaminated = bg + (arr[..., :3] - bg) / a_safe
    decontaminated = np.clip(decontaminated, 0, 255)

    out_full = arr.copy()
    out_full[..., :3] = decontaminated
    out_full[..., 3] = alpha * 255

    rgb = out_full[..., :3]
    maxc = rgb.max(axis=2)
    blue_bias = rgb[..., 2] - np.maximum(rgb[..., 0], rgb[..., 1])
    dark_blue_tinted = (out_full[..., 3] > 100) & (maxc < 110) & (blue_bias > 12)
    neutral = rgb.mean(axis=2, keepdims=True) * 0.7
    rgb[dark_blue_tinted] = neutral[dark_blue_tinted]
    out_full[..., :3] = rgb

    full_img = Image.fromarray(out_full.astype("uint8"), "RGBA")

    if len(merged) != len(names):
        print(f"  !! expected {len(names)} blobs, found {len(merged)} -- check output")

    for name, (x0, x1, pad_left, pad_right) in zip(names, merged):
        col_fg = fg[:, x0:x1]
        rows_with_content = np.where(col_fg.any(axis=1))[0]
        y0, y1 = rows_with_content.min(), rows_with_content.max()
        left = max(x0 - pad, 0) if pad_left else x0
        right = min(x1 + pad, arr.shape[1]) if pad_right else x1
        box = (left, max(y0 - pad, 0), right, min(y1 + pad, arr.shape[0]))
        cropped = full_img.crop(box)
        cropped.save(f"{OUT}/{name}.png")
        print(" ", name, box, cropped.size)
