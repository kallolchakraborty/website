// Main Interactive JavaScript Engine for Terminal Portfolio

document.addEventListener('DOMContentLoaded', () => {
  const inits = [
    initNavigationHighlighting,
    initCommandPalette,
    initMobileMenu,
    initWebGLShaderBackground,
    initTerminalAnimations
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
function bindPaletteTriggers() {
  document.querySelectorAll('[data-trigger="command-palette"], .terminal-trigger').forEach(btn => {
    if (btn.dataset.paletteBound) return;
    btn.dataset.paletteBound = 'true';
    btn.addEventListener('click', () => {
      const modal = document.getElementById('command-palette');
      if (!modal) return;
      modal.showModal();
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

  const commands = [
    { name: '/home', desc: 'Navigate to Home Overview', action: () => window.location.href = 'index.html' },
    { name: '/experience', desc: 'View Work & Career History', action: () => window.location.href = 'experience.html' },
    { name: '/projects', desc: 'Explore Software & Open Source Projects', action: () => window.location.href = 'projects.html' },
    { name: '/contact', desc: 'Transmit a Direct Message', action: () => window.location.href = 'contact.html' },
    { name: 'download resume', desc: 'Get PDF Resume', action: () => window.open('assets/resume.pdf', '_blank') },
    { name: 'status', desc: 'Check System Health & Latency', action: () => alert('SYSTEM: ALL NODES OPERATIONAL | LATENCY: 12ms | AES-256') }
  ];

  function openPalette() {
    modal.showModal();
    if (input) {
      input.value = '';
      input.focus();
      renderCommands(commands);
    }
  }

  function closePalette() {
    modal.close();
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

  if (input) {
    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = commands.filter(c => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
      renderCommands(filtered);
    });
  }

  function renderCommands(list) {
    if (!resultsContainer) return;
    if (list.length === 0) {
      resultsContainer.innerHTML = '<div class="p-md text-on-surface-variant font-code-sm">No command matches found</div>';
      return;
    }
    resultsContainer.innerHTML = list.map((cmd, idx) => `
      <div class="command-item flex items-center justify-between p-md border-b border-surface-container hover:bg-primary/10 cursor-pointer transition-colors" data-index="${idx}">
        <div class="flex items-center gap-md">
          <span class="material-symbols-outlined text-primary">terminal</span>
          <span class="font-code-sm font-bold text-on-surface">${cmd.name}</span>
        </div>
        <span class="font-code-sm text-xs text-on-surface-variant">${cmd.desc}</span>
      </div>
    `).join('');

    resultsContainer.querySelectorAll('.command-item').forEach((el, idx) => {
      el.addEventListener('click', () => {
        closePalette();
        list[idx].action();
      });
    });
  }
}

// 3. WebGL Ambient Background Shader
function initWebGLShaderBackground() {
  const canvas = document.getElementById('shader-canvas-ambient');
  if (!canvas) return;
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
