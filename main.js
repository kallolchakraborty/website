// Main Interactive JavaScript Engine for Terminal Portfolio

document.addEventListener('DOMContentLoaded', () => {
  const inits = [
    initNavigationHighlighting,
    initCommandPalette,
    initMobileMenu,
    initWebGLShaderBackground,
    initTerminalAnimations,
    initBackToTop
  ];
  for (const init of inits) {
    try { init(); } catch (e) { console.warn('init failed:', e); }
  }
});

// 1. Navigation Active Link Highlighting
function initNavigationHighlighting() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const detailPages = ['chhanda-ai.html', 'ai-colab-server.html', 'lgit.html', 'health-simulator.html', 'effort-planner.html', 'free-chess.html'];
  const navLinks = document.querySelectorAll('nav a[data-path], header a[data-path]');

  navLinks.forEach(link => {
    const path = link.getAttribute('data-path');
    let isActive = false;

    if (path === 'home' && (currentPath === 'index.html' || currentPath === '' || currentPath === '/')) {
      isActive = true;
    } else if (path === 'projects' && detailPages.includes(currentPath)) {
      isActive = true;
    } else if (currentPath.includes(path)) {
      isActive = true;
    }

    if (isActive) {
      link.classList.add('text-primary', 'font-bold');
      link.classList.remove('text-on-surface-variant');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('text-primary', 'font-bold');
      link.classList.add('text-on-surface-variant');
      link.removeAttribute('aria-current');
    }
  });
}

// 2. Command Palette (Ctrl+K / Cmd+K / Terminal Icon trigger)
let paletteSearchIndex = [];

function loadSearchIndex() {
  if (paletteSearchIndex.length) return;
  fetch('static/search-index.json')
    .then(r => r.json())
    .then(data => { paletteSearchIndex = data; })
    .catch(() => { paletteSearchIndex = []; });
}

function bindPaletteTriggers() {
  document.querySelectorAll('[data-trigger="command-palette"], .terminal-trigger').forEach(btn => {
    if (btn.dataset.paletteBound) return;
    btn.dataset.paletteBound = 'true';
    btn.addEventListener('click', () => {
      const modal = document.getElementById('command-palette');
      if (!modal) return;
      modal.showModal();
      loadSearchIndex();
      const input = document.getElementById('command-input');
      if (input) {
        input.value = '';
        input.focus();
        input.dispatchEvent(new Event('input'));
      }
    });
  });
}

function initCommandPalette() {
  const modal = document.getElementById('command-palette');
  const closeBtn = document.getElementById('close-palette');
  const input = document.getElementById('command-input');
  const resultsContainer = document.getElementById('command-results');

  if (!modal) return;

  const SECTIONS = {
    nav: 'NAVIGATION',
    actions: 'ACTIONS',
    search: 'SEARCH RESULTS'
  };

  const commands = [
    { section: 'nav', name: '/home', desc: 'Home overview', action: () => location.href = 'index.html' },
    { section: 'nav', name: '/experience', desc: 'Work & career history', action: () => location.href = 'experience.html' },
    { section: 'nav', name: '/projects', desc: 'Software & open-source projects', action: () => location.href = 'projects.html' },
    { section: 'nav', name: '/contact', desc: 'Send a message', action: () => location.href = 'contact.html' },
    { section: 'actions', name: 'download resume', desc: 'PDF resume', action: () => window.open('assets/resume.pdf', '_blank') },
    { section: 'actions', name: 'copy email', desc: 'kallol.a.chakraborty@gmail.com', action: async () => {
        try {
          await navigator.clipboard.writeText('kallol.a.chakraborty@gmail.com');
          flash('Email copied to clipboard');
        } catch (e) {
          prompt('Copy email:', 'kallol.a.chakraborty@gmail.com');
        }
      } },
    { section: 'actions', name: 'github', desc: 'github.com/kallolchakraborty', action: () => window.open('https://github.com/kallolchakraborty', '_blank') },
    { section: 'actions', name: 'linkedin', desc: 'LinkedIn profile', action: () => window.open('https://www.linkedin.com/in/kallol-chakraborty-9728a699/', '_blank') }
  ];

  function highlight(name, q) {
    if (!q) return name;
    const idx = name.toLowerCase().indexOf(q);
    if (idx === -1) return name;
    return name.slice(0, idx) + '<mark class="bg-transparent text-primary font-bold">' + name.slice(idx, idx + q.length) + '</mark>' + name.slice(idx + q.length);
  }

  function openPalette() {
    modal.showModal();
    currentItems = commands;
    activeIndex = 0;
    if (input) {
      input.value = '';
      input.focus();
      renderCommands(commands);
    }
    loadSearchIndex();
  }

  function closePalette() {
    modal.close();
  }

  function flash(msg) {
    const el = document.createElement('div');
    el.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg bg-primary text-on-primary font-code-sm text-xs shadow-lg';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  bindPaletteTriggers();
  if (closeBtn) closeBtn.addEventListener('click', closePalette);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
    if (!isInDialog) closePalette();
  });

  // Global shortcut listener: Cmd+K / Ctrl+K / ~
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      modal.open ? closePalette() : openPalette();
    }
  });

  function renderCommands(list) {
    if (!resultsContainer) return;

    if (list.length === 0) {
      resultsContainer.innerHTML = '<div class="px-md py-3 font-code-sm text-sm text-on-surface-variant">No matches found</div>';
      return;
    }

    const groups = [];
    const seen = {};
    for (const item of list) {
      const key = item.section;
      if (!seen[key]) {
        seen[key] = true;
        groups.push({ section: key, items: [] });
      }
      groups[groups.length - 1].items.push(item);
    }

    let html = '';
    groups.forEach(g => {
      html += '<div class="px-md pt-2.5 pb-1 font-code-sm text-[10px] tracking-wider text-on-surface-variant/60">' + SECTIONS[g.section] + '</div>';
      g.items.forEach(item => {
        const q = input ? input.value.toLowerCase().trim() : '';
        const desc = highlight(item.desc, q);
        html += `
          <div class="command-item flex items-center justify-between gap-sm px-md py-2.5 cursor-pointer transition-colors border-l-2 border-transparent hover:bg-surface-container" data-action>
            <div class="flex items-center gap-sm min-w-0">
              <svg class="icon text-primary text-[16px] shrink-0" aria-hidden="true"><use href="#i-terminal"/></svg>
              <span class="font-code-sm text-sm font-bold text-on-surface truncate">${highlight(item.name, q)}</span>
            </div>
            <span class="font-code-sm text-xs text-on-surface-variant truncate">${desc}</span>
          </div>`;
      });
    });

    resultsContainer.innerHTML = html;
    bindItemClicks();
    const first = resultsContainer.querySelector('.command-item');
    if (first) setActive(first);
  }

  function bindItemClicks() {
    const items = resultsContainer.querySelectorAll('.command-item');
    items.forEach((el, idx) => {
      el.dataset.index = idx;
      el.addEventListener('click', () => { runItem(idx); });
    });
  }

  // Flat list of currently rendered commands, in display order.
  let currentItems = [];
  let activeIndex = 0;

  function collectCurrent() {
    const items = resultsContainer.querySelectorAll('.command-item');
    return Array.from(items);
  }

  function runItem(idx) {
    if (!currentItems[idx]) return;
    closePalette();
    currentItems[idx].action();
  }

  function setActive(el) {
    collectCurrent().forEach((item, i) => {
      const active = item === el;
      item.classList.toggle('bg-surface-container', active);
      item.classList.toggle('border-primary', active);
      item.classList.toggle('border-transparent', !active);
      item.dataset.active = active ? 'true' : '';
    });
    el.scrollIntoView({ block: 'nearest' });
  }

  if (input) {
    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = commands.filter(c => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
      const matches = [];
      if (q) {
        paletteSearchIndex.forEach(page => {
          const terms = page.terms.join(' ').toLowerCase();
          if (terms.includes(q)) {
            matches.push({ section: 'search', name: page.title, desc: page.url, action: () => location.href = page.url });
          }
        });
      }
      currentItems = filtered.concat(matches);
      activeIndex = 0;
      renderCommands(currentItems);
    });
  }

  // Keyboard navigation on the input
  if (input) {
    input.addEventListener('keydown', (e) => {
      const items = collectCurrent();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!items.length) return;
        activeIndex = (activeIndex + 1) % items.length;
        setActive(items[activeIndex]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!items.length) return;
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        setActive(items[activeIndex]);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items.length && activeIndex < items.length) {
          runItem(activeIndex);
        }
      }
    });
  }
}

// 3. WebGL Ambient Background Shader
function initWebGLShaderBackground() {
  const canvas = document.getElementById('shader-canvas-ambient');
  if (!canvas) return;
  if (window.innerWidth < 768) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function syncSize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

  const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    vec3 color = vec3(0.98, 0.98, 0.99);
    
    for(float i = 0.0; i < 4.0; i++) {
        vec2 p = vec2(sin(u_time * 0.3 + i * 1.5), cos(u_time * 0.25 + i * 2.1)) * 0.7;
        float d = length(uv - p);
        float pulse = 0.012 / d;
        color += vec3(0.91, 0.33, 0.13) * pulse * (0.25 + 0.25 * sin(u_time + i));
    }
    color *= 1.0 - 0.015 * sin(v_texCoord.y * 800.0);
    gl_FragColor = vec4(color, 1.0);
}`;

  function cs(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');

  let rafId = null;
  function render(t) {
    syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    rafId = requestAnimationFrame(render);
  }

  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (rafId === null) rafId = requestAnimationFrame(render);
        } else {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    });
    io.observe(canvas);
  } else {
    rafId = requestAnimationFrame(render);
  }
}

// 4. Reveal Scroll Animations & Micro-Interactions
function initTerminalAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('opacity-0', 'translate-y-8');
        entry.target.classList.add('opacity-100', 'translate-y-0');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.project-card, .timeline-item, .reveal-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// 5. Mobile Navigation Menu
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle('hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => {
    setOpen(menu.classList.contains('hidden'));
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
}

// 6. Back to Top Button
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  const toggle = () => btn.classList.toggle('hidden', (window.scrollY || document.documentElement.scrollTop) < 400);
  document.addEventListener('scroll', toggle, { passive: true });
  toggle();
}
