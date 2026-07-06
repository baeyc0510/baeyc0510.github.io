import type { Project } from '../data/types';

const BASE = import.meta.env.BASE_URL;

const LINK_LABELS: Record<string, string> = {
  github: 'GitHub',
  video: 'Video',
  pdf: 'PDF',
  demo: 'Demo',
};

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function thumbNode(project: Project): HTMLElement {
  const wrap = el('div', 'card-thumb');
  if (project.thumbnail) {
    const img = el('img');
    img.loading = 'lazy';
    img.alt = project.title;
    img.src = project.thumbnail;
    // 썸네일이 없으면 플레이스홀더로 대체.
    img.addEventListener('error', () => {
      wrap.classList.add('is-placeholder');
      img.remove();
      wrap.appendChild(placeholder(project));
    });
    wrap.appendChild(img);
  } else {
    wrap.classList.add('is-placeholder');
    wrap.appendChild(placeholder(project));
  }
  return wrap;
}

function placeholder(project: Project): HTMLElement {
  const ph = el('div', 'card-thumb-ph');
  ph.textContent = (project.category || project.title).slice(0, 2).toUpperCase();
  return ph;
}

function linksNode(project: Project): HTMLElement | null {
  const entries = Object.entries(project.links).filter(([, url]) => url && url.trim());
  if (entries.length === 0) return null;
  const box = el('div', 'card-links');
  for (const [key, url] of entries) {
    const a = el('a', 'card-link', LINK_LABELS[key] ?? key);
    a.href = url as string;
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', (e) => e.stopPropagation());
    box.appendChild(a);
  }
  return box;
}

// variant: 'stage'(월드 대형 카드) | 'grid'(목록 카드)
export function ProjectCard(project: Project, variant: 'stage' | 'grid'): HTMLElement {
  const card = el('article', `card card--${variant}`);
  card.style.setProperty('--accent', project.accent);
  card.tabIndex = 0;
  card.setAttribute('role', 'link');
  card.setAttribute('aria-label', `${project.title} 상세 보기`);

  const go = () => {
    window.location.href = `${BASE}${project.detailUrl}`.replace(/\/{2,}/g, '/');
  };
  card.addEventListener('click', go);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      go();
    }
  });

  card.appendChild(thumbNode(project));

  const body = el('div', 'card-body');
  if (project.category) body.appendChild(el('span', 'card-tag', project.category));
  body.appendChild(el('h3', 'card-title', project.title));
  if (project.summary) body.appendChild(el('p', 'card-summary', project.summary));

  if (project.tech.length) {
    const tech = el('div', 'card-tech');
    for (const t of project.tech) tech.appendChild(el('span', 'tech-chip', t));
    body.appendChild(tech);
  }

  const foot = el('div', 'card-foot');
  const detail = el('span', 'card-cta', '상세 보기');
  foot.appendChild(detail);
  const links = linksNode(project);
  if (links) foot.appendChild(links);
  body.appendChild(foot);

  card.appendChild(body);
  return card;
}
