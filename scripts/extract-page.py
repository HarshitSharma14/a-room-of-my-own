"""Extract the approved paper and restore its small background patch.

Deterministic retouching of existing pixels; no image API. Run on macOS with
Python 3 and sips. The website/build only need the resulting committed PNGs.
"""
import math
import struct
import subprocess
import tempfile
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
with tempfile.TemporaryDirectory() as temporary:
    target = Path(temporary) / 'room.bmp'
    subprocess.run(['sips', '-s', 'format', 'bmp', str(ROOT / 'public/art/room-scene.jpg'), '--out', str(target)], check=True, capture_output=True)
    bitmap = target.read_bytes()
width, signed_height = struct.unpack_from('<ii', bitmap, 18)
offset = struct.unpack_from('<I', bitmap, 10)[0]
stride = (width * 3 + 3) // 4 * 4
height = abs(signed_height)

def pixel(x, y):
    x, y = round(x), round(y)
    y = y if signed_height < 0 else height - 1 - y
    at = offset + y * stride + x * 3
    return tuple(bitmap[at + i] for i in (2, 1, 0))

def inside(x, y, polygon):
    hit = False
    for a, b in zip(polygon, polygon[1:] + polygon[:1]):
        if (a[1] > y) != (b[1] > y) and x < (b[0]-a[0]) * (y-a[1]) / (b[1]-a[1]) + a[0]:
            hit = not hit
    return hit

def write_png(name, bounds, paint):
    x0, y0, w, h = bounds
    rows = [b'\0' + bytes(value for x in range(w) for value in paint(x+x0, y+y0)) for y in range(h)]
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind+data) & 0xffffffff)
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(b''.join(rows), 9)) + chunk(b'IEND', b'')
    (ROOT / 'public/art' / name).write_bytes(png)

paper = [(375,507),(453,504),(455,550),(458,602),(465,644),(385,654),(377,604),(373,551)]
removal = [(369,500),(459,497),(464,550),(469,607),(477,656),(382,672),(371,612),(367,547)]

def paper_pixel(x, y):
    alpha = round(255 * sum(inside(x+dx,y+dy,paper) for dx in (.25,.75) for dy in (.25,.75)) / 4)
    rgb = pixel(x, y)
    if math.hypot((x-419.5)/1.1, y-514.5) < 8:
        rgb = pixel(x-16, y+3)  # Paper texture under the removable nail.
    return (*rgb, alpha)

def repaired(x, y):
    if not inside(x+.5, y+.5, removal):
        return (*pixel(x,y), 255)
    back_edge = 404 + (y-438)*.05
    if y < 573 and x < back_edge:
        # Continue the partially hidden sheet behind this one.
        rgb = pixel(387 + x % 5, 449 + y % 14)
        if back_edge-x < 2.5:
            rgb = (49,46,57)
    elif y < 573:
        rgb = pixel(465+x%3, y)
    else:
        # Adjacent cork, sloping frame and wall, from the same horizontal band.
        sx = 332 + x % 19
        rgb = pixel(sx, y + (x-sx)*.08)
    # Feather only the outer restoration margin, beyond the original paper.
    distance = 1000
    for a,b in zip(removal,removal[1:]+removal[:1]):
        dx,dy=b[0]-a[0],b[1]-a[1]
        t=max(0,min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)))
        distance=min(distance,math.hypot(x-a[0]-dx*t,y-a[1]-dy*t))
    blend=min(1,distance/5);blend=blend*blend*(3-2*blend)
    original=pixel(x,y)
    return (*(round(original[i]*(1-blend)+rgb[i]*blend) for i in range(3)),255)

write_png('story-page.png', (369,499,108,173), paper_pixel)
write_png('story-wall.png', (361,490,125,189), repaired)
write_png('story-nail.png', (411,506,17,17), lambda x,y: (*pixel(x,y), round(255*max(0,min(1,1.3-math.hypot((x-419.5)/7.2,(y-514.5)/6.5))))))
print('Extracted story-page.png, story-wall.png, story-nail.png.')
