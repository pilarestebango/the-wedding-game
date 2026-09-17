from PIL import Image

SRC = "caracters/_crops"
DEST = "../assets/sprites/characters"
TARGET_H = 80

NAMES = ["joe-idle", "joe-run-0", "joe-run-1", "joe-jump", "pili-idle", "pili-run-0", "pili-run-1", "pili-jump"]

for name in NAMES:
    img = Image.open(f"{SRC}/{name}.png").convert("RGBA")
    w, h = img.size
    scale = TARGET_H / h
    new_w = max(1, round(w * scale))
    out = img.resize((new_w, TARGET_H), Image.LANCZOS)
    out.save(f"{DEST}/{name}.png")
    print(name, "->", out.size)
