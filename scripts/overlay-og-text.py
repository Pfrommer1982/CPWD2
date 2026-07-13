from pathlib import Path
import sys

from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
base_path = Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'public/og-image-base.jpg'
out_path = Path(sys.argv[2]) if len(sys.argv) > 2 else root / 'public/og-image.jpg'
font_path = root / 'public/assets/Layn.ttf'

img = Image.open(base_path).convert('RGB')
draw = ImageDraw.Draw(img)

title_font = ImageFont.truetype(font_path, 96)
tagline_font = ImageFont.truetype(font_path, 30)

width, _height = img.size
cx = width // 2

draw.text((cx, 430), 'CPWD', font=title_font, fill='#f1f1f1', anchor='mm')
draw.text((cx, 495), 'Webdevelopment uit Nederland', font=tagline_font, fill='#7b8f86', anchor='mm')

img.save(out_path, quality=90, optimize=True)
