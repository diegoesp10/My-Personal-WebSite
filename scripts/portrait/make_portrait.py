"""Generates the data of the dot portrait shown on the home and about pages.

    python scripts/portrait/make_portrait.py <photo> [output.png]

The output is a tiny PNG with one pixel per dot: red = darkness of the area (0 light … 255 dark) and
green = how much of the cell belongs to the person (0 = no dot). The browser draws the dots on a canvas
(src/components/DotPortrait.tsx), so the photo itself is never published. The crop box and the silhouette
polygon below are specific to the original photo (1083 × 2000 px).
Requires Pillow, NumPy and SciPy.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

BOX = (318, 556, 758, 1056)  # head and shoulders, in photo coordinates (x0, y0, x1, y1)
COLUMNS = 92
SILHOUETTE = [
    (482, 586), (505, 578), (540, 572), (575, 578), (596, 590), (606, 588), (612, 592), (624, 598), (630, 610),
    (624, 624), (614, 640), (612, 690), (612, 725), (626, 744), (662, 760), (692, 790), (708, 830), (724, 880),
    (738, 930), (744, 975), (728, 1008), (694, 1024), (676, 1034), (676, 1165), (392, 1165), (390, 1062),
    (368, 1014), (344, 986), (330, 945), (334, 900), (350, 852), (370, 806), (398, 776), (426, 758), (440, 748),
    (466, 742), (476, 730), (462, 718), (452, 710), (448, 698), (448, 684), (450, 672), (442, 662), (440, 655),
    (452, 644), (458, 632), (462, 616), (470, 600),
]


def subject_mask(rgb: np.ndarray, luminance: np.ndarray) -> np.ndarray:
    """Rough silhouette refined by colour: dark coat and hair, or warm skin, inside the polygon."""
    height, width = luminance.shape
    red, green, blue = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    polygon = Image.new('L', (width, height), 0)
    ImageDraw.Draw(polygon).polygon([(x - BOX[0], y - BOX[1]) for x, y in SILHOUETTE], fill=255)
    inside = np.asarray(polygon.filter(ImageFilter.MaxFilter(5))) > 0

    warm = ((red - blue) > 25) & ((red - green) > 12) & (luminance < 215)
    subject = inside & ((luminance < 92) | warm)
    subject = ndi.binary_closing(subject, structure=np.ones((11, 11)), iterations=2)
    subject = ndi.binary_fill_holes(subject)
    subject = ndi.binary_opening(subject, structure=np.ones((5, 5)))
    labels, count = ndi.label(subject)
    if count:
        sizes = ndi.sum(subject, labels, range(1, count + 1))
        subject = labels == (np.argmax(sizes) + 1)
    subject = ndi.binary_fill_holes(subject) & inside
    # The street behind the top of the head is light: drop light pixels in that band.
    rows = np.arange(height)[:, None]
    return subject & ~((luminance > 135) & (rows < 70) & ~warm)


def darkness_map(luminance: np.ndarray, subject: np.ndarray) -> np.ndarray:
    """Linear stretch inside the person plus local contrast: the face keeps its features, the coat its folds."""
    sharp = np.clip(luminance + 1.2 * (luminance - ndi.gaussian_filter(luminance, 2.5)), 0, 255)
    low, high = np.percentile(sharp[subject], [3, 99.5])
    base = np.clip((sharp - low) / (high - low), 0, 1)
    local = sharp - ndi.gaussian_filter(sharp, 10)
    spread = np.sqrt(ndi.gaussian_filter(local ** 2, 10)) + 8
    detail = np.clip(local / (2.5 * spread), -0.5, 0.5)
    return 1 - np.clip(0.72 * base ** 0.85 + 0.28 * (0.5 + detail), 0, 1)


def main(photo: str, output: str) -> None:
    rgb = np.asarray(Image.open(photo).convert('RGB').crop(BOX)).astype(np.float32)
    luminance = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    subject = subject_mask(rgb, luminance)
    coverage = ndi.gaussian_filter(subject.astype(np.float32), 2.2)
    darkness = darkness_map(luminance, subject)

    height, width = luminance.shape
    cell = width / COLUMNS
    rows = int(round(height / cell))
    data = np.zeros((rows, COLUMNS, 3), np.uint8)
    for row in range(rows):
        for column in range(COLUMNS):
            y0, y1 = int(row * cell), int(min(height, (row + 1) * cell))
            x0, x1 = int(column * cell), int(min(width, (column + 1) * cell))
            weight = coverage[y0:y1, x0:x1]
            share = np.clip((weight.mean() - 0.15) / 0.6, 0, 1)
            if share <= 0:
                continue
            tone = (darkness[y0:y1, x0:x1] * weight).sum() / max(weight.sum(), 1e-6)
            data[row, column] = (round(tone * 255), max(1, round(share * 255)), 0)

    Image.fromarray(data, 'RGB').save(output, optimize=True)
    print(f'{output}: {COLUMNS} × {rows}, {int((data[..., 1] > 0).sum())} puntos')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    default = Path(__file__).resolve().parents[2] / 'src' / 'assets' / 'portrait-dots.png'
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else str(default))
