from PIL import Image
import numpy as np

OUT = "_crops"
INSET = 6  # px to step past the cyan border line itself


def is_bg_color(px):
    # The navy background is dark AND distinctly blue-hued (b noticeably higher
    # than r and g). Near-black sprite content (e.g. a black dress) is dark but
    # neutral/no-hue, so this tells the two apart where a brightness-only or
    # neighbor-chained test would leak through into the sprite.
    r, g, b = int(px[0]), int(px[1]), int(px[2])
    return max(r, g, b) < 95 and (b - r) > 9 and (b - g) > 6


def flood_key(img_rgb, pad=3):
    # Direct per-pixel classification, no connectivity needed: the hue-based
    # test already distinguishes background from every sprite color observed
    # (including near-black content like Pili's dress), and applying it
    # directly (rather than only to background connected to the crop border)
    # also correctly clears enclosed holes, e.g. inside the ring.
    arr = np.array(img_rgb).astype(int)
    h, w, _ = arr.shape
    is_bg = np.apply_along_axis(is_bg_color, 2, arr)

    fg_ys, fg_xs = np.where(~is_bg)
    if len(fg_xs) == 0:
        return None
    left, right = max(fg_xs.min() - pad, 0), min(fg_xs.max() + pad, w - 1)
    top, bottom = max(fg_ys.min() - pad, 0), min(fg_ys.max() + pad, h - 1)

    alpha = np.where(is_bg, 0, 255).astype('uint8')
    rgba = np.dstack([np.array(img_rgb), alpha])
    out = Image.fromarray(rgba, 'RGBA').crop((left, top, right + 1, bottom + 1))
    return out


def cell(img_rgb, box, inset=INSET):
    x0, y0, x1, y1 = box
    return img_rgb.crop((x0 + inset, y0 + inset, x1 - inset, y1 - inset))


def cols(box, n):
    x0, y0, x1, y1 = box
    w = (x1 - x0) / n
    return [(x0 + i * w, y0, x0 + (i + 1) * w, y1) for i in range(n)]


def save(img, name):
    if img is None:
        print("FAILED", name)
        return
    path = f"{OUT}/{name}.png"
    img.save(path)
    print("saved", path, img.size)


# ---- characters.jpeg (1024x821) — precise boundaries from detect_boxes.py ----
chars = Image.open("characters.jpeg").convert("RGB")
JOE_PANEL = (30, 67, 1006, 396)
PILI_PANEL = (30, 453, 1006, 782)
poses = ["idle", "run-0", "run-1", "jump"]
for i, box in enumerate(cols(JOE_PANEL, 4)):
    save(flood_key(cell(chars, box)), f"joe-{poses[i]}")
for i, box in enumerate(cols(PILI_PANEL, 4)):
    save(flood_key(cell(chars, box)), f"pili-{poses[i]}")

# ---- pixel elements level 1.jpeg (1240x848) ----
lvl1 = Image.open("pixel elements level 1.jpeg").convert("RGB")
row1_boxes = [(23, 159, 299, 435), (323, 159, 598, 435), (623, 159, 899, 435), (922, 159, 1199, 435)]
row2_boxes = [(23, 507, 299, 783), (323, 507, 598, 783), (623, 507, 899, 783), (922, 507, 1199, 783)]
row1_names = ["beer", "kangaroo", "book", "mountain"]
row2_names = ["heart", "ring", "speech-bubble", "star"]
for box, name in zip(row1_boxes, row1_names):
    save(flood_key(cell(lvl1, box)), name)
for box, name in zip(row2_boxes, row2_names):
    save(flood_key(cell(lvl1, box)), name)

# ---- pixel elements level 2.jpeg (1102x960) ----
lvl2 = Image.open("pixel elements level 2.jpeg").convert("RGB")
r1_boxes = [(30, 144, 361, 430), (386, 144, 717, 430), (742, 144, 1072, 430)]
r2_boxes = [(30, 550, 361, 855), (386, 550, 717, 855), (742, 550, 1072, 855)]
r1_names = ["car", "tent", "plane"]
r2_names = ["island", "campervan", "house"]
for box, name in zip(r1_boxes, r1_names):
    save(flood_key(cell(lvl2, box)), name)
for box, name in zip(r2_boxes, r2_names):
    save(flood_key(cell(lvl2, box)), name)
