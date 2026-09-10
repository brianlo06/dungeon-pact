"""Builds public/art/characters-v2.png from raw generated sprites.

The generator is asked for a flat magenta field behind each character; this
keys that out, trims to the artwork, and centres each sprite in an equal cell.

    python3 -m venv .venv && .venv/bin/pip install Pillow
    .venv/bin/python scripts/build-sprite-sheet.py public/art/characters-v2.png \
        art-out/raw-broker.png art-out/raw-herald.png \
        art-out/raw-reaver.png art-out/raw-beguiler.png

Cell order is row-major and must match the `v2` map in Sprite.tsx.
Pillow is the only dependency and is deliberately kept out of package.json:
this runs when art changes, not as part of the build.
"""
import sys
from PIL import Image

CELL = 512          # v2 cells; the 4x4 v1 sheet uses 313px cells
MARGIN = 0.06       # keep a little air so nothing touches the cell edge
KEY = (255, 0, 255)
TOL = 60            # generous: the model dithers the magenta slightly

def keyed(path):
    """Drops the magenta field and the halo the model dithers around the art.

    A flat threshold leaves a purple fringe: the edge pixels are part sprite,
    part key. Anything strongly magenta-dominant goes transparent, and pixels
    that merely lean that way are pulled back toward their own hue instead of
    being kept as-is."""
    im = Image.open(path).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            magenta = min(r, b) - g          # how much r and b both exceed g
            if magenta > 110:
                px[x, y] = (0, 0, 0, 0)
            elif magenta > 55:
                # Fringe: neutralise the key's contribution rather than keep it.
                k = (magenta - 55) / 55
                px[x, y] = (
                    int(r - (r - g) * k * 0.7),
                    g,
                    int(b - (b - g) * k * 0.7),
                    int(a * (1 - k * 0.55)),
                )
    return im

def fit(im):
    box = im.getbbox()
    if box:
        im = im.crop(box)
    inner = int(CELL * (1 - MARGIN * 2))
    scale = min(inner / im.width, inner / im.height)
    size = (max(1, round(im.width * scale)), max(1, round(im.height * scale)))
    im = im.resize(size, Image.NEAREST)
    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    cell.alpha_composite(im, ((CELL - im.width) // 2, (CELL - im.height) // 2))
    return cell

if __name__ == "__main__":
    out = sys.argv[1]
    cells = [fit(keyed(p)) for p in sys.argv[2:]]
    sheet = Image.new("RGBA", (CELL * 2, CELL * 2), (0, 0, 0, 0))
    for i, c in enumerate(cells):
        sheet.alpha_composite(c, ((i % 2) * CELL, (i // 2) * CELL))
    sheet.save(out)
    print("wrote", out, sheet.size, f"{len(cells)} cells")
