from PIL import Image
import numpy as np
import matplotlib.colors as mcolors

ASSETS = "../assets/sprites/characters"

# Current skin base (238,197,105) -> target E0A375, measured in HSV:
#   hue   41.5deg -> 25.8deg  (delta -15.7deg)
#   sat   0.559   -> 0.478    (ratio 0.855)
#   val   0.933   -> 0.878    (ratio 0.941)
# Applied as an offset/ratio (not a flat recolor) so the existing shading
# bands (highlight/base/shadow) stay intact, just re-hued.
HUE_DELTA = -15.7 / 360.0
SAT_RATIO = 0.855
VAL_RATIO = 0.941

# Skin sits at hue ~40-42deg; the orange shorts sit at ~26-28deg and the
# purple shirt at ~290deg. This band isolates skin without touching either.
HUE_LOW, HUE_HIGH = 33 / 360.0, 52 / 360.0

FILES = ["joe-idle.png", "joe-run-0.png", "joe-run-1.png", "joe-jump.png"]


def recolor(path):
    img = Image.open(path).convert("RGBA")
    arr = np.array(img).astype(float) / 255.0
    rgb = arr[..., :3]
    hsv = mcolors.rgb_to_hsv(rgb)

    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    alpha = arr[..., 3]
    skin_mask = (h >= HUE_LOW) & (h <= HUE_HIGH) & (alpha > 0)

    h2 = h.copy()
    h2[skin_mask] = (h[skin_mask] + HUE_DELTA) % 1.0
    s2 = s.copy()
    s2[skin_mask] = np.clip(s[skin_mask] * SAT_RATIO, 0, 1)
    v2 = v.copy()
    v2[skin_mask] = np.clip(v[skin_mask] * VAL_RATIO, 0, 1)

    new_rgb = mcolors.hsv_to_rgb(np.stack([h2, s2, v2], axis=-1))
    out = arr.copy()
    out[..., :3] = new_rgb
    out = np.clip(out * 255, 0, 255).astype("uint8")
    return Image.fromarray(out, "RGBA")


for name in FILES:
    path = f"{ASSETS}/{name}"
    recolored = recolor(path)
    recolored.save(path)
    print("recolored", name)

# joe-head.png is a straight top-33-row crop of joe-idle.png (see
# crop_joe_v2.py) -- regenerate it the same way so it stays in sync.
idle = Image.open(f"{ASSETS}/joe-idle.png").convert("RGBA")
head = idle.crop((0, 0, idle.width, 33))
head.save(f"{ASSETS}/joe-head.png")
print("regenerated joe-head.png")
