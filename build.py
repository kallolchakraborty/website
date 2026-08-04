#!/usr/bin/env python3
"""Build static site from src/*.page.html + partials/."""
import datetime
import json
import os
import re

TAG_RE = re.compile(r'<[^>]+>')
BASE = 'https://kallolchakraborty.github.io/website'


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

PROJECT_DETAIL = {'chhanda-ai', 'ai-colab-server', 'lgit', 'health-simulator', 'effort-planner', 'free-chess'}


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def partial(name):
    return read(os.path.join(PARTIALS, name))


def page_url(name):
    return BASE + ('/' if name == 'index' else '/' + name + '.html')


def ld_json(obj):
    return '<script type="application/ld+json">' + json.dumps(obj) + '</script>\n'


def breadcrumb_schema(name):
    if name == 'index':
        return None
    crumbs = [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': BASE + '/'}]
    pos = 2
    if name in PROJECT_DETAIL:
        crumbs.append({'@type': 'ListItem', 'position': pos, 'name': 'Projects', 'item': BASE + '/projects.html'})
        pos += 1
    crumbs.append({'@type': 'ListItem', 'position': pos, 'name': name.replace('-', ' ').title(), 'item': page_url(name)})
    return ld_json({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': crumbs
    })


def page_schema(p, body):
    name = p['name']
    schemas = ''
    bc = breadcrumb_schema(name)
    if bc:
        schemas += bc
    if name == 'projects':
        cards = index_projects(body)
        schemas += ld_json({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            'name': p['title'],
            'description': p['description'],
            'url': page_url(name),
            'mainEntity': {
                '@type': 'ItemList',
                'numberOfItems': len(cards),
                'itemListElement': [{
                    '@type': 'ListItem',
                    'position': i + 1,
                    'name': c['title'],
                    'url': page_url(name)
                } for i, c in enumerate(cards)]
            }
        })
    if name in PROJECT_DETAIL:
        schemas += ld_json({
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            'headline': p['title'],
            'description': p['description'],
            'url': page_url(name),
            'author': {'@type': 'Person', 'name': 'Kallol Chakraborty'},
            'publisher': {'@type': 'Person', 'name': 'Kallol Chakraborty'}
        })
    return schemas


def og_type(name):
    if name == 'index':
        return 'profile'
    if name in PROJECT_DETAIL:
        return 'article'
    return 'website'


def build():
    pages = json.loads(read(os.path.join(SRC, 'pages.json')))
    index = []
    for p in pages:
        body = read(os.path.join(SRC, p['name'] + '.page.html'))
        schemas = page_schema(p, body)
        head = (partial('head.html')
                .replace('{{title}}', p['title'])
                .replace('{{description}}', p['description'])
                .replace('{{og_url}}', 'index.html' if p['name'] == 'index' else p['name'] + '.html')
                .replace('{{og_type}}', og_type(p['name']))
                .replace('{{extra_head}}', p['extra_head'] + '\n' + schemas))
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
    featured = featured_projects(read(projects_html), 3) if os.path.exists(projects_html) else []
    dest = os.path.join(ROOT, 'featured_solutions')
    os.makedirs(dest, exist_ok=True)
    for existing in os.listdir(dest):
        p = os.path.join(dest, existing)
        if os.path.isfile(p) or os.path.isdir(p):
            if os.path.isdir(p) and not os.path.islink(p):
                import shutil
                shutil.rmtree(p)
            else:
                os.remove(p)
    for c in featured:
        proj_dir = os.path.join(dest, c['slug'])
        os.makedirs(proj_dir, exist_ok=True)
        with open(os.path.join(proj_dir, 'index.json'), 'w', encoding='utf-8') as f:
            json.dump(c, f, indent=2)
    print(f'wrote featured_solutions ({len(featured)} projects)')
    static = os.path.join(ROOT, 'static')
    os.makedirs(static, exist_ok=True)
    today = datetime.date.today().isoformat()
    def sitemap_entry(url, prio):
        return (f'<url><loc>{url}</loc><lastmod>{today}</lastmod>'
                f'<changefreq>monthly</changefreq><priority>{prio}</priority></url>\n')
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap += sitemap_entry(BASE + '/', '1.0')
    for p in pages:
        if p['name'] in ('404', 'index'):
            continue
        prio = '0.9' if p['name'] in ('experience', 'projects', 'contact') else '0.6'
        sitemap += sitemap_entry(page_url(p['name']), prio)
    sitemap += '</urlset>\n'
    with open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write(sitemap)
    print(f'wrote sitemap.xml ({len(pages) - 2} urls)')
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


def featured_projects(project_html, count=3):
    cards = []
    for chunk in project_html.split('<div class="project-card-item')[1:]:
        chunk = chunk.split('<script>')[0]
        added = re.search(r'data-added="([^"]*)"', chunk)
        if not added:
            continue
        title_m = re.search(r'<h2[^>]*>(.*?)</h2>', chunk, re.S)
        if not title_m:
            continue
        desc_m = re.search(r'<p class="font-body-md[^>]*>(.*?)</p>', chunk, re.S)
        tags = re.findall(r'<span class="bg-surface-container px-2 py-1[^>]*>(.*?)</span>', chunk, re.S)
        gh_m = re.search(r'<a href="(https://github\.com/[^"]*)"[^>]*>\s*View on GitHub', chunk, re.S)
        href_m = re.search(r'<a href="([^"]+)"[^>]*>', chunk, re.S)
        title = strip_tags(title_m.group(1)).strip()
        slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
        cards.append({
            'title': title,
            'slug': slug,
            'data_added': added.group(1),
            'description': strip_tags(desc_m.group(1)).strip() if desc_m else '',
            'tags': [strip_tags(t).strip() for t in tags],
            'github_url': gh_m.group(1) if gh_m else (href_m.group(1) if href_m else ''),
            'website_url': page_url('projects'),
        })
    cards.sort(key=lambda c: c['data_added'], reverse=True)
    return cards[:count]


if __name__ == '__main__':
    build()
