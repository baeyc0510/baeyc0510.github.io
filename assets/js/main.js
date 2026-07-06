'use strict';

/* =========================================================
   설정
   ========================================================= */
const PROJECT_DIR = 'data/projects';

/* =========================================================
   유틸: frontmatter 파싱 (경량, 빌드 스텝 불필요)
   지원: 문자열, [배열] 형태
   ========================================================= */
function parseMarkdown(raw) {
  const meta = {};
  let body = raw;

  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (m) {
    body = m[2];
    for (const line of m[1].split('\n')) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if (!key) continue;

      if (val.startsWith('[') && val.endsWith(']')) {
        // 배열
        val = val.slice(1, -1).split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } else {
        val = val.replace(/^["']|["']$/g, '');
      }
      meta[key] = val;
    }
  }
  return { meta, body };
}

/* =========================================================
   데이터 로딩
   ========================================================= */
async function fetchText(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`fetch 실패: ${url} (${res.status})`);
  return res.text();
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`fetch 실패: ${url} (${res.status})`);
  return res.json();
}

// 프로젝트 슬러그 목록 로드 후 각 md 파싱
async function loadProjects() {
  const manifest = await fetchJson(`${PROJECT_DIR}/index.json`);
  const slugs = manifest.projects || [];
  const list = await Promise.all(slugs.map(async (slug) => {
    const raw = await fetchText(`${PROJECT_DIR}/${slug}.md`);
    const { meta, body } = parseMarkdown(raw);
    return { slug, meta, body };
  }));
  return list;
}

/* =========================================================
   렌더링: 프로필
   ========================================================= */
async function renderProfile() {
  const profile = await fetchJson('data/profile.json');

  document.querySelectorAll('[data-profile="name"]').forEach((el) => {
    el.textContent = profile.name;
  });
  const tag = document.querySelector('[data-profile="tagline"]');
  if (tag) tag.textContent = profile.tagline;

  const wrap = document.getElementById('profile-links');
  wrap.innerHTML = '';
  (profile.links || [])
    .filter((l) => l.url)
    .forEach((l) => {
      const a = document.createElement('a');
      a.className = 'profile-link';
      a.href = l.url;
      a.textContent = l.label;
      if (!l.url.startsWith('mailto:')) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      wrap.appendChild(a);
    });
}

/* =========================================================
   렌더링: 프로젝트 카드 목록
   ========================================================= */
function renderCards(projects) {
  const grid = document.getElementById('project-grid');
  grid.innerHTML = '';

  projects.forEach((p) => {
    const meta = p.meta;
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');

    const tech = Array.isArray(meta.tech) ? meta.tech : (meta.tech ? [meta.tech] : []);
    const thumb = meta.thumbnail
      ? `<div class="card-thumb" style="background-image:url('${meta.thumbnail}')"></div>`
      : `<div class="card-thumb card-thumb--empty">${(meta.title || p.slug)[0]}</div>`;

    card.innerHTML = `
      ${thumb}
      <div class="card-body">
        <h3 class="card-title">${meta.title || p.slug}</h3>
        <p class="card-summary">${meta.summary || ''}</p>
        <div class="card-tags">${tech.map((t) => `<span class="tag">${t}</span>`).join('')}</div>
      </div>`;

    const open = () => navigate(p.slug);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    grid.appendChild(card);
  });
}

/* =========================================================
   렌더링: 프로젝트 상세
   ========================================================= */
function renderDetail(project) {
  const meta = project.meta;
  document.getElementById('detail-title').textContent = meta.title || project.slug;

  const tech = Array.isArray(meta.tech) ? meta.tech : (meta.tech ? [meta.tech] : []);
  document.getElementById('detail-tags').innerHTML =
    tech.map((t) => `<span class="tag">${t}</span>`).join('');

  // 링크 버튼: 값이 있는 것만 노출
  const linkDefs = [
    { key: 'video', label: '▶ 영상' },
    { key: 'github', label: '⌘ GitHub' },
    { key: 'pdf', label: '⤓ PDF' },
  ];
  document.getElementById('detail-links').innerHTML = linkDefs
    .filter((d) => meta[d.key])
    .map((d) => `<a class="btn" href="${meta[d.key]}" target="_blank" rel="noopener">${d.label}</a>`)
    .join('');

  // 마크다운 본문 렌더 + 코드 하이라이트
  const bodyEl = document.getElementById('detail-body');
  bodyEl.innerHTML = window.marked.parse(project.body);
  bodyEl.querySelectorAll('pre code').forEach((block) => {
    if (window.hljs) window.hljs.highlightElement(block);
  });
}

/* =========================================================
   라우팅 (?p=slug 기반 SPA)
   ========================================================= */
let PROJECTS = [];

function showList() {
  document.getElementById('projects').classList.remove('hidden');
  document.getElementById('profile').classList.remove('hidden');
  document.getElementById('project-detail').classList.add('hidden');
}

function showDetail(project) {
  document.getElementById('projects').classList.add('hidden');
  document.getElementById('profile').classList.add('hidden');
  const detail = document.getElementById('project-detail');
  detail.classList.remove('hidden');
  renderDetail(project);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function route() {
  const params = new URLSearchParams(location.search);
  const slug = params.get('p');
  const project = PROJECTS.find((p) => p.slug === slug);
  if (project) showDetail(project);
  else showList();
}

function navigate(slug) {
  const url = slug ? `?p=${encodeURIComponent(slug)}` : location.pathname;
  history.pushState({}, '', url);
  route();
}

/* =========================================================
   히어로: Canvas 파티클 네트워크 (버전 A)
   ========================================================= */
function initHero() {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const NEON = '0, 229, 255';
  let w, h, particles, raf;
  const mouse = { x: -999, y: -999 };

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    const count = Math.min(90, Math.floor((w * h) / 16000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }

    // 노드 간 연결선
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(${NEON}, ${0.12 * (1 - d / 130)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      // 마우스 연결
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 180) {
        ctx.strokeStyle = `rgba(${NEON}, ${0.3 * (1 - dm / 180)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    // 노드
    for (const p of particles) {
      ctx.fillStyle = `rgba(${NEON}, 0.8)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });

  // 화면 밖이면 렌더 정지 (성능)
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) { if (!raf) step(); }
      else { cancelAnimationFrame(raf); raf = null; }
    }
  });
  io.observe(canvas);

  resize();
  step();
}

/* =========================================================
   스크롤 등장 애니메이션
   ========================================================= */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
      }
    }
  }, { threshold: 0.15 });
  document.querySelectorAll('.section').forEach((s) => io.observe(s));
}

/* =========================================================
   초기화
   ========================================================= */
async function main() {
  window.marked.setOptions({ breaks: false, gfm: true });

  initHero();
  initReveal();

  document.getElementById('detail-back').addEventListener('click', () => navigate(null));
  window.addEventListener('popstate', route);

  try {
    await renderProfile();
    PROJECTS = await loadProjects();
    renderCards(PROJECTS);
    route();
  } catch (err) {
    console.error(err);
    document.getElementById('project-grid').innerHTML =
      `<p class="error">데이터 로드 실패. 로컬에서 열 경우 정적 서버 필요.<br>${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', main);
