"""Crops a photo and grades it with the site palette for the profile card of "Sobre mí".

    python scripts/photo/grade_photo.py <photo> [output.webp] [--crop x0,y0,x1,y1]

The photo is mapped through a gradient of the brand colours (ink shadows, warm mid tones, ivory highlights) with
a fine grain, so it matches the dot portrait and both themes. The output carries no EXIF or location data and the
original photo is never published. Requires Pillow and NumPy.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageOps

# Gradient map: (position of the luminance, colour). Ink → burnt orange → sand → ivory.
STOPS = [
    (0.00, (18, 18, 17)),
    (0.38, (92, 44, 27)),
    (0.62, (190, 112, 78)),
    (0.82, (229, 196, 170)),
    (1.00, (247, 242, 233)),
]
DEFAULT_CROP = (150, 210, 870, 1110)  # 4:5, head to waist, in the original 940 × 2000 photo


def gradient_map(gray: np.ndarray) -> np.ndarray:
    positions = [stop[0] for stop in STOPS]
    channels = [np.interp(gray, positions, [stop[1][i] for stop in STOPS]) for i in range(3)]
    return np.stack(channels, axis=-1)


def main() -> None:
    args = [arg for arg in sys.argv[1:] if not arg.startswith('--crop')]
    crop_arg = next((arg.split('=', 1)[1] for arg in sys.argv[1:] if arg.startswith('--crop=')), None)
    source = Path(args[0])
    output = Path(args[1]) if len(args) > 1 else Path('src/assets/physique.webp')
    crop = tuple(int(v) for v in crop_arg.split(',')) if crop_arg else DEFAULT_CROP

    image = ImageOps.exif_transpose(Image.open(source)).convert('RGB').crop(crop)
    image = ImageEnhance.Contrast(image).enhance(1.12)
    gray = np.asarray(image.convert('L'), dtype=np.float32) / 255.0
    gray = np.clip((gray - 0.04) / 0.92, 0, 1) ** 0.95
    graded = gradient_map(gray)
    rng = np.random.default_rng(7)
    graded += rng.normal(0, 4.0, graded.shape[:2])[..., None]
    result = Image.fromarray(np.clip(graded, 0, 255).astype(np.uint8), 'RGB')
    output.parent.mkdir(parents=True, exist_ok=True)
    # Saved from pixel data only: no EXIF, GPS or colour profile from the camera.
    result.save(output, 'WEBP', quality=84, method=6)
    print(f'{output} {result.size[0]}x{result.size[1]}')


if __name__ == '__main__':
    main()
