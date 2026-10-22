"""
Prepare the shipped assets for dsh-ayaka-theme.

  - copy 视频.mp4  -> assets/video.mp4 (dynamic background)
  - 图片.jpg       -> assets/poster.jpg (1920 wide JPEG, video poster / fallback)
  - 11 stickers    -> assets/stickers/{0..10}.webp (white background keyed to
                      transparency, edge-feathered)

The sticker source PNGs live on the Desktop and carry Chinese file names; we
match them by a stable key so the build never depends on the exact name.
"""

from __future__ import annotations

import os
import shutil
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
SRC_VIDEO = Path(r"C:\Users\28492.FSD的小电脑\Desktop\1\视频.mp4")
SRC_POSTER = Path(r"C:\Users\28492.FSD的小电脑\Desktop\1\图片.jpg")
SRC_STICKERS = Path(r"C:\Users\28492.FSD的小电脑\Desktop\绫华主题")

# index -> (file-name substring, zh caption)
STICKER_KEYS = [
    ("开心", "好耶"),
    ("乖巧", "收到"),
    ("疑惑", "咦？"),
    ("拒绝", "不要"),
    ("加油", "加油"),
    ("感谢", "谢谢"),
    ("委屈", "呜呜"),
    ("害羞", "害羞"),
    ("晚安", "晚安"),
    ("生气", "哼"),
    ("震惊", "啊？"),
]

THRESHOLD = 240  # remove border-connected pixels whose min channel >= this


def key_out_white(path: Path, out: Path) -> None:
    """Turn a white-background image into a transparent one via border flood fill."""
    im = Image.open(path).convert("RGB")
    w, h = im.size
    pix = im.load()
    alpha = bytearray([255]) * (w * h)
    queue: deque[tuple[int, int]] = deque()
    seen = bytearray(w * h)

    def is_white(x: int, y: int) -> bool:
        r, g, b = pix[x, y]
        return min(r, g, b) >= THRESHOLD

    # Seed from every border pixel that is white.
    for x in range(w):
        if is_white(x, 0) and not seen[x]:
            seen[x] = 1; queue.append((x, 0))
        if is_white(x, h - 1) and not seen[(h - 1) * w + x]:
            seen[(h - 1) * w + x] = 1; queue.append((x, h - 1))
    for y in range(h):
        if is_white(0, y) and not seen[y * w]:
            seen[y * w] = 1; queue.append((0, y))
        if is_white(w - 1, y) and not seen[y * w + w - 1]:
            seen[y * w + w - 1] = 1; queue.append((w - 1, y))

    while queue:
        x, y = queue.popleft()
        idx = y * w + x
        alpha[idx] = 0
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if not seen[nidx] and is_white(nx, ny):
                    seen[nidx] = 1
                    queue.append((nx, ny))

    mask = Image.frombytes("L", (w, h), bytes(alpha))
    mask = mask.filter(ImageFilter.GaussianBlur(1.0))
    rgba = im.convert("RGBA")
    rgba.putalpha(mask)
    rgba.save(out, "WEBP", quality=88, method=6)


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    stickers_dir = ASSETS / "stickers"
    stickers_dir.mkdir(parents=True, exist_ok=True)

    # Video + poster
    shutil.copyfile(SRC_VIDEO, ASSETS / "video.mp4")
    poster = Image.open(SRC_POSTER).convert("RGB")
    if poster.width > 1920:
        poster = poster.resize((1920, round(poster.height * 1920 / poster.width)), Image.LANCZOS)
    poster.save(ASSETS / "poster.jpg", "JPEG", quality=84, optimize=True)

    # Stickers, matched by substring.
    files = [p for p in SRC_STICKERS.iterdir() if p.suffix.lower() == ".png"]
    for index, (key, caption) in enumerate(STICKER_KEYS):
        match = next((p for p in files if key in p.name), None)
        if match is None:
            print(f"!! missing sticker for {key}")
            continue
        out = stickers_dir / f"{index}.webp"
        key_out_white(match, out)
        print(f"{index:2d} {key}:{caption} <- {match.name}  {out.stat().st_size // 1024} KB")

    video = ASSETS / "video.mp4"
    print(f"video.mp4: {video.stat().st_size // 1024} KB")
    print(f"poster.jpg: {(ASSETS / 'poster.jpg').stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
