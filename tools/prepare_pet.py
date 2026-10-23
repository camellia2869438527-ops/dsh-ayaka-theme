"""
Prepare the desktop-pet assets.

  - cut the checkerboard background out of the supplied chibi illustration
  - crop to the character
  - copy the fifteen voice lines with stable ASCII file names

Run:  python tools/prepare_pet.py
"""

from __future__ import annotations

import os
import shutil
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"

SRC_IMAGE = Path(
    r"C:\Users\28492.FSD的小电脑\.dsh\attachments\v1\objects\35"
    r"\35454f80d9cc8d7f247a530204203f4636a76a13e899e48ca55d9cb08f6c9758"
)
VOICE_DIR = Path(r"C:\Users\28492.FSD的小电脑\Desktop\2")

# stable name -> (substring in the source file, Chinese line)
VOICES = {
    "open": ("稻妻神里流", "稻妻神里流太刀术皆传…参上！请多指教哦。"),
    "idle1": ("悠闲安稳", "像这样悠闲安稳的时光，如果再多一点就好了…"),
    "idle2": ("和茶一样", "剑，就和茶一样，细细品味才能理解其中风雅。"),
    "idle3": ("平日里的生活", "这就是旅行者平日里的生活么，呵，感觉又多了解了你一些。"),
    "idle4": ("刀剑抱业", "刀剑抱业，名工怀宝。"),
    "rain": ("避雨", "请随我一同避雨吧。"),
    "thunder": ("大御所", "大御所大人…是在诉说什么吗？"),
    "snow": ("雪霁银妆", "雪霁银妆素，桔高映琼枝。嗯…美景当前，只差一壶茶与之相衬呢。"),
    "sunny": ("风和日丽", "风和日丽，要去哪边走走么？"),
    "wind": ("风吹来的方向", "闭上眼睛，向着风吹来的方向…怎么样，很舒服吧？"),
    "morning": ("早安", "早安，旅行者…接下来将是顺利的一天。"),
    "noon": ("午安", "午安。茶饭之后…是否有兴致下盘棋提神呢？"),
    "evening": ("晚上好", "晚上好。夜风舒畅，会是一个良宵呢。"),
    "night": ("若知是梦", "若知是梦何须醒，不比真如一相会。"),
    "happy": ("我真是太幸福", "嗯…我真是太幸福了…"),
}


def cut_checkerboard(path: Path, out: Path) -> None:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    alpha = bytearray([255]) * (w * h)
    seen = bytearray(w * h)
    queue: deque[tuple[int, int]] = deque()

    def is_bg(x: int, y: int) -> bool:
        r, g, b = px[x, y]
        return min(r, g, b) >= 210 and (max(r, g, b) - min(r, g, b)) <= 14

    for x in range(w):
        for y in (0, h - 1):
            if is_bg(x, y) and not seen[y * w + x]:
                seen[y * w + x] = 1
                queue.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg(x, y) and not seen[y * w + x]:
                seen[y * w + x] = 1
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        alpha[y * w + x] = 0
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h:
                idx = ny * w + nx
                if not seen[idx] and is_bg(nx, ny):
                    seen[idx] = 1
                    queue.append((nx, ny))

    mask = Image.frombytes("L", (w, h), bytes(alpha))
    mask = mask.filter(ImageFilter.MinFilter(3))          # shave the antialiased rim
    mask = mask.filter(ImageFilter.GaussianBlur(0.6))     # soft edge
    rgba = im.convert("RGBA")
    rgba.putalpha(mask)
    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)
    out.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(out, "WEBP", quality=90, method=6)
    rgba.save(out.with_name("pet-preview.png"))
    print(f"pet.webp {rgba.size} {out.stat().st_size // 1024} KB")


def copy_voices() -> None:
    target = ASSETS / "voice"
    target.mkdir(parents=True, exist_ok=True)
    files = [p for p in VOICE_DIR.iterdir() if p.suffix.lower() == ".mp3"]
    for name, (needle, _line) in VOICES.items():
        match = next((p for p in files if needle in p.name), None)
        if match is None:
            print(f"!! missing voice {name} ({needle})")
            continue
        shutil.copyfile(match, target / f"{name}.mp3")
        print(f"{name:8s} <- {match.name}")


def main() -> None:
    cut_checkerboard(SRC_IMAGE, ASSETS / "pet.webp")
    copy_voices()


if __name__ == "__main__":
    main()
