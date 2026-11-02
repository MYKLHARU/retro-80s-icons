"""Verify this static site with Python's standard library, locally and on GitHub."""
from collections import Counter
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import struct
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent

def require(condition, message):
    if not condition:
        raise SystemExit('FAIL: ' + message)

def data(name):
    text = (ROOT / 'catalog.js').read_text(encoding='utf-8')
    match = re.search(r'window\.' + name + r' = (.*);', text)
    require(match is not None, 'Missing catalog data: ' + name)
    return json.loads(match.group(1))

pack, icons = data('RETRO_PACK'), data('RETRO_ICONS')
require(len(icons) == pack['icons'] == 1104, 'Expected all 1,104 designs')
names = [icon['file'] for icon in icons]
require(len(set(name.casefold() for name in names)) == len(names), 'Duplicate filenames')
require(set(names) == {path.name for path in (ROOT / 'icons').iterdir()}, 'Artwork and catalog disagree')
counts = Counter(icon['category'] for icon in icons)
require(len(counts) == 12, 'Expected 12 categories')
require(counts == {row['name']: row['count'] for row in pack['categories']}, 'Category counts disagree')
for name in names:
    require('/' not in name and '\\' not in name and name.endswith('.png'), 'Invalid icon filename')
    content = (ROOT / 'icons' / name).read_bytes()
    require(content[:8] == b'\x89PNG\r\n\x1a\n', 'Invalid PNG: ' + name)
    width, height, depth, colour = struct.unpack('>IIBB', content[16:26])
    require((width, height, depth, colour) == (320, 180, 8, 6), 'Expected 320 x 180 RGBA artwork: ' + name)
    offset, animated = 8, False
    while offset + 12 <= len(content):
        length = int.from_bytes(content[offset:offset+4], 'big')
        animated |= content[offset+4:offset+8] == b'acTL'
        offset += length + 12
    require(not animated, 'Expected static PNG: ' + name)
apk = ROOT / pack['apk']
require(apk.stat().st_size == pack['apkBytes'], 'APK size changed')
require(sha256(apk.read_bytes()).hexdigest() == pack['apkSha256'], 'APK checksum changed')

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.references, self.anchors, self.scripts, self.apk_links = [], [], [], [], []

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'img':
            require('alt' in attrs, 'Image without alternate text')
        if tag == 'script':
            require('src' in attrs, 'Unexpected inline script')
            self.scripts.append(urlsplit(attrs['src']).path)
        for key in ('src', 'href'):
            ref = attrs.get(key)
            if not ref:
                continue
            if ref.startswith('#'):
                self.anchors.append(ref[1:])
            elif not urlsplit(ref).scheme:
                self.references.append(ref)
        if urlsplit(attrs.get('href','')).path == pack['apk']:
            self.apk_links.append(attrs)

page = Page()
page.feed((ROOT / 'index.html').read_text('utf-8'))
require(len(set(page.ids)) == len(page.ids), 'Duplicate HTML IDs')
require(all(anchor in page.ids for anchor in page.anchors), 'Broken page anchor')
require(page.scripts == ['catalog.js', 'app.js'], 'Unexpected script dependency')
require(len(page.apk_links) == 2 and all('download' in row for row in page.apk_links), 'Missing APK download buttons')
for ref in page.references:
    relative = Path(unquote(urlsplit(ref).path))
    require(not relative.is_absolute() and '..' not in relative.parts, 'Asset outside website: ' + ref)
    cursor = ROOT
    for part in relative.parts:
        require(part in {entry.name for entry in cursor.iterdir()}, 'Missing asset or incorrect filename case: ' + ref)
        cursor /= part
require((ROOT / '.nojekyll').is_file(), 'Missing static-site marker')
print(json.dumps({'status':'passed','version':pack['version'],'icons':len(icons),'categories':len(counts),
    'png_dimensions':'320 x 180 RGBA','all_pngs_static':True,'apk_sha256':pack['apkSha256'],
    'local_asset_links':len(page.references),'page_anchors':len(page.anchors),
    'external_runtime_dependencies':0}, indent=2))
