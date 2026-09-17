from PIL import Image
import os

SRC = "_crops"
CHAR_DEST = "../assets/sprites/characters"
PROP_DEST = "../assets/sprites/props"

CHAR_TARGET_H = 56
PROP_TARGET_H = 48


def resize_to_height(img, target_h):
    w, h = img.size
    scale = target_h / h
    new_w = max(1, round(w * scale))
    return img.resize((new_w, target_h), Image.NEAREST)


CHAR_FILES = [
    "pili-idle", "pili-run-0", "pili-run-1", "pili-jump",
    "joe-idle", "joe-run-0", "joe-run-1", "joe-jump",
]
PROP_FILES = [
    "beer", "kangaroo", "book", "mountain", "heart", "ring",
    "speech-bubble", "star", "tent", "car", "plane", "island",
    "campervan", "house",
]

for name in CHAR_FILES:
    img = Image.open(f"{SRC}/{name}.png").convert("RGBA")
    out = resize_to_height(img, CHAR_TARGET_H)
    out.save(f"{CHAR_DEST}/{name}.png")
    print("char", name, "->", out.size)

for name in PROP_FILES:
    img = Image.open(f"{SRC}/{name}.png").convert("RGBA")
    out = resize_to_height(img, PROP_TARGET_H)
    out.save(f"{PROP_DEST}/{name}.png")
    print("prop", name, "->", out.size)
