# -*- coding: utf-8 -*-
"""TASK-0509: DK-Agency-Tanitim-Prototip.html -> public/tanitim/index.html (cleaned)."""
import re, sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()

def cut(pattern, repl='', flags=re.S, count=1):
    global s
    new, n = re.subn(pattern, repl, s, count=count, flags=flags)
    assert n == count, (pattern[:70], n)
    s = new

# 1) "240+" proof item — number not backed by anything in the code (Doğan: remove)
cut(r'\s*<div class="proof-item">\s*<div class="proof-num">240<span>\+</span></div>\s*<div class="proof-lbl">[^<]*</div>\s*</div>')
# 3 items left: desktop 3 columns; tablet keeps 2 -> make it 3 as well, phone stays 1
cut(r'\.proof-grid\{display:grid;grid-template-columns:repeat\(4,1fr\)', '.proof-grid{display:grid;grid-template-columns:repeat(3,1fr)')
cut(r'(@media \(max-width:1024px\)\{.*?)\.proof-grid\{grid-template-columns:repeat\(2,1fr\);gap:20px\}', r'\1.proof-grid{grid-template-columns:repeat(3,1fr);gap:20px}')

# 2) internal task labels shown to visitors
cut(r'\s*<span class="badge badge-green">TASK-0497 Aktivdir</span>')
cut(r'\s*<span class="badge badge-teal">TASK-0498 Aktivdir</span>')

# 3) the og:title / og:image diagnostics card (internal note, not for visitors)
cut(r'\s*<!-- METADATA & LINK DIAGNOSTICS CARD \(USER REQUEST\) -->\s*<div class="diag-box">.*?</div>\s*</div>\s*</div>\s*</div>(?=\s*</div>\s*</section>)')

# 4) VÖEN line — there is no VÖEN (Doğan: remove)
cut(r'\s*<p style="color:var\(--muted-2\);font-size:12px;margin-top:12px">\s*VÖEN:[^<]*</p>')

# 5) share preview + canonical for the page itself
meta = '''<link rel="canonical" href="https://dkagency.com.tr/tanitim">
<meta property="og:type" content="website">
<meta property="og:site_name" content="DK Agency">
<meta property="og:locale" content="az_AZ">
<meta property="og:url" content="https://dkagency.com.tr/tanitim">
<meta property="og:title" content="DK Agency | HoReCa İdarəetmə, KAZAN AI & Biznes Ekosistemi">
<meta property="og:description" content="40 illik təcrübə, KAZAN AI asistanı, 18+ interaktiv maliyyə aləti, ekspert bloq və sektor xəbərləri — Azərbaycan HoReCa sektoru üçün.">
<meta property="og:image" content="https://dkagency.com.tr/opengraph-image">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/icon.png">
'''
cut(r'(<meta name="description" content="[^"]*">\n)', r'\1' + meta)

# 6) B2B cards: inline 3-column grid stayed 3 columns on phones (scrollWidth 556 at 390px)
cut(r'<div style="display:grid;grid-template-columns:repeat\(3,1fr\);gap:24px;margin-top:48px">',
    '<div class="b2b-grid">')
cut(r'(@media \(max-width:1024px\)\{)', '.b2b-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:48px}\n\\1.b2b-grid{grid-template-columns:1fr}')

for bad in ['VÖEN', 'TASK-0', '240<span>', 'diag-box">', 'og:title):']:
    assert bad not in s.split('</style>', 1)[1], bad
open(dst, 'w', encoding='utf-8').write(s)
print('ok', len(s))
