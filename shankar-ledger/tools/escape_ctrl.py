"""Rewrites raw control characters and every non-ASCII character in a minified JS file as
\\uXXXX escapes, which mean the same thing in JS strings, regexes and identifiers. The Claude
artifact host refuses files holding raw ESC bytes or U+FFFD, which the bundled libraries use
inside their code-page tables."""
import re, sys

def esc(m):
    c = ord(m.group())
    if c > 0xFFFF:
        c -= 0x10000
        return '\\u%04x\\u%04x' % (0xD800 + (c >> 10), 0xDC00 + (c & 0x3FF))
    return '\\u%04x' % c

for path in sys.argv[1:]:
    s = open(path, encoding='utf-8').read()
    out, n = re.subn(r'[\x00-\x08\x0b\x0c\x0e-\x1f]|[^\x00-\x7f]', esc, s)
    open(path, 'w', encoding='utf-8').write(out)
    print(path, 'escaped', n)
