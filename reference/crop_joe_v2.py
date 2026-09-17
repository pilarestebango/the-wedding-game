from PIL import Image
import numpy as np
from skimage.segmentation import flood
from scipy import ndimage
import os

SRC = "caracters"
OUT = "caracters/_crops2"
os.makedirs(OUT, exist_ok=True)

FILES = {
    "joe-idle": "joe-stand.png",
    "joe-run-0": "joe-walk.png",
    "joe-run-1": "jowe-run.png",
    "joe-jump": "joe-jump.png",
}

# The navy backdrop isn't a flat color -- it has soft grain/vignette noise
# that wanders far enough in absolute color distance to overlap with Joe's
# own dark hair, so a global "distance from bg color" threshold either cuts
# holes in the hair or leaves background haze. Flood-fill from a corner
# instead: local pixel-to-pixel steps within the backdrop stay small even as
# the average wanders, while the jump at the character silhouette is sharp,
# so a per-step tolerance separates the two even though their global color
# distance ranges overlap.
TOLERANCE = 21
pad = 8


def process(src_path):
    img = Image.open(src_path).convert("RGBA")
    arr = np.array(img).astype(float)
    bg = arr[0, 0, :3]
    dist = np.sqrt(((arr[..., :3] - bg) ** 2).sum(axis=2))

    bg_mask = flood(dist, (0, 0), tolerance=TOLERANCE)

    # The source art also has a faint soft-shadow blob under the character's
    # feet and scattered single-pixel noise specks, both disconnected from
    # the body -- drop every foreground component below a size floor so only
    # substantial parts of the figure (legs included) survive.
    labels, n = ndimage.label(~bg_mask)
    if n > 1:
        sizes = ndimage.sum(~bg_mask, labels, index=np.arange(1, n + 1))
        small_labels = np.flatnonzero(sizes < 3000) + 1
        bg_mask = bg_mask | np.isin(labels, small_labels)

    out = arr.copy()
    out[..., 3] = np.where(bg_mask, 0, 255)

    # Clean up any residual blue cast on now-opaque dark pixels (hair, dark
    # fabric) that blended slightly with the backdrop before the hard cut.
    rgb = out[..., :3]
    maxc = rgb.max(axis=2)
    blue_bias = rgb[..., 2] - np.maximum(rgb[..., 0], rgb[..., 1])
    dark_blue_tinted = (~bg_mask) & (maxc < 130) & (blue_bias > 6)
    neutral = rgb.mean(axis=2, keepdims=True) * 0.7
    rgb[dark_blue_tinted] = neutral[dark_blue_tinted]
    out[..., :3] = rgb

    full_img = Image.fromarray(out.astype("uint8"), "RGBA")

    fg_ys, fg_xs = np.where(~bg_mask)
    x0, x1 = max(fg_xs.min() - pad, 0), min(fg_xs.max() + pad, arr.shape[1] - 1)
    y0, y1 = max(fg_ys.min() - pad, 0), min(fg_ys.max() + pad, arr.shape[0] - 1)
    return full_img.crop((x0, y0, x1 + 1, y1 + 1))


for out_name, src_file in FILES.items():
    cropped = process(f"{SRC}/{src_file}")
    cropped.save(f"{OUT}/{out_name}.png")
    print(out_name, "<-", src_file, cropped.size)
