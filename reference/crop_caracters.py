from PIL import Image
import numpy as np

SRC = "caracters"
OUT = "caracters/_crops"
import os
os.makedirs(OUT, exist_ok=True)

FILES = {
    "joe-idle": "joe-stand.png",
    "joe-run-0": "joe-walk.png",
    "joe-run-1": "jowe-run.png",
    "joe-jump": "joe-jump.png",
    "pili-idle": "pili-stand.png",
    "pili-run-0": "pili-walk.png",
    "pili-run-1": "pili-run.png",
    "pili-jump": "pili-jump.png",
}


def key_and_crop(path, pad=6, low=10, high=48):
    img = Image.open(path).convert("RGBA")
    arr = np.array(img).astype(int)
    bg = arr[0, 0, :3]
    dist = np.sqrt(((arr[..., :3] - bg) ** 2).sum(axis=2))
    alpha = np.clip((dist - low) / (high - low) * 255, 0, 255).astype("uint8")
    out = arr.copy()
    out[..., 3] = alpha
    fg_ys, fg_xs = np.where(alpha > 40)
    x0, x1 = max(fg_xs.min() - pad, 0), min(fg_xs.max() + pad, arr.shape[1] - 1)
    y0, y1 = max(fg_ys.min() - pad, 0), min(fg_ys.max() + pad, arr.shape[0] - 1)
    cropped = Image.fromarray(out.astype("uint8"), "RGBA").crop((x0, y0, x1 + 1, y1 + 1))
    return cropped


for out_name, src_file in FILES.items():
    cropped = key_and_crop(f"{SRC}/{src_file}")
    cropped.save(f"{OUT}/{out_name}.png")
    print(out_name, "<-", src_file, cropped.size)
