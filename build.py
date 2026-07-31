#!/usr/bin/env python3
"""Build static site from src/*.page.html + partials/."""
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
PARTIALS = os.path.join(ROOT, 'partials')


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def partial(name):
    return read(os.path.join(PARTIALS, name))


def build():
    pages = json.loads(read(os.path.join(SRC, 'pages.json')))
    for p in pages:
        body = read(os.path.join(SRC, p['name'] + '.page.html'))
        head = (partial('head.html')
                .replace('{{title}}', p['title'])
                .replace('{{description}}', p['description'])
                .replace('{{extra_head}}', p['extra_head']))
        html = (body.replace('{{head}}', head)
                .replace('{{header}}', partial('header.html'))
                .replace('{{dialog}}', partial('dialog.html'))
                .replace('{{footer}}', partial('footer.html')))
        with open(os.path.join(ROOT, p['name'] + '.html'), 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'built {p["name"]}.html')


if __name__ == '__main__':
    build()
