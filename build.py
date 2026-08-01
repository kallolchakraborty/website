#!/usr/bin/env python3
"""Build static site from src/*.page.html + partials/."""
import json
import os
import re

TAG_RE = re.compile(r'<[^>]+>')


def strip_tags(text):
    return TAG_RE.sub(' ', text)


def index_terms(html):
    parts = []
    title = re.search(r'<title>(.*?)</title>', html, re.S)
    if title:
        parts.append(title.group(1))
    for m in re.findall(r'<h[1-3][^>]*>(.*?)</h[1-3]>', html, re.S):
        parts.append(m)
    first_p = re.search(r'<p[^>]*>(.*?)</p>', html, re.S)
    if first_p:
        parts.append(first_p.group(1))
    return strip_tags(' '.join(parts)).split()

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
    index = []
    for p in pages:
        body = read(os.path.join(SRC, p['name'] + '.page.html'))
        head = (partial('head.html')
                .replace('{{title}}', p['title'])
                .replace('{{description}}', p['description'])
                .replace('{{og_url}}', 'index.html' if p['name'] == 'index' else p['name'] + '.html')
                .replace('{{extra_head}}', p['extra_head']))
        html = (body.replace('{{head}}', head)
                .replace('{{header}}', partial('header.html'))
                .replace('{{dialog}}', partial('dialog.html'))
                .replace('{{footer}}', partial('footer.html')))
        m = re.search(r'<body[^>]*>', html)
        if m:
            html = html[:m.end()] + '\n' + partial('icons.svg') + html[m.end():]
        with open(os.path.join(ROOT, p['name'] + '.html'), 'w', encoding='utf-8') as f:
            f.write(html)
        index.append({
            'url': 'index.html' if p['name'] == 'index' else p['name'] + '.html',
            'title': p['title'],
            'terms': index_terms(html)
        })
        print(f'built {p["name"]}.html')
    projects_html = os.path.join(ROOT, 'projects.html')
    if os.path.exists(projects_html):
        index.extend(index_projects(read(projects_html)))
    static = os.path.join(ROOT, 'static')
    os.makedirs(static, exist_ok=True)
    with open(os.path.join(static, 'search-index.json'), 'w', encoding='utf-8') as f:
        json.dump(index, f)
    print(f'wrote static/search-index.json ({len(index)} entries)')


def index_projects(project_html):
    cards = []
    for chunk in project_html.split('<div class="project-card-item')[1:]:
        chunk = chunk.split('<script>')[0]
        title = re.search(r'<h2[^>]*>(.*?)</h2>', chunk, re.S)
        desc = re.search(r'<p class="font-body-md[^>]*>(.*?)</p>', chunk, re.S)
        if not title:
            continue
        tags = re.findall(r'<span class="bg-surface-container px-2 py-1[^>]*>(.*?)</span>', chunk, re.S)
        text = ' '.join(filter(None, [title.group(1), desc and desc.group(1), ' '.join(tags)]))
        cards.append({
            'url': 'projects.html',
            'title': strip_tags(title.group(1)).strip(),
            'terms': strip_tags(text).split()
        })
    return cards


if __name__ == '__main__':
    build()
