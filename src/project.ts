import './styles/main.css';
import { marked } from 'marked';
import { loadProfile, loadProjects } from './data/loadProjects';
import type { Project } from './data/types';
import { Nav } from './components/Nav';
import { Starfield } from './scene/Starfield';

const BASE = import.meta.env.BASE_URL;
const home = (hash = '') => `${BASE}index.html${hash}`.replace(/([^:]\/)\/+/g, '$1');

const LINK_LABELS: Record<string, string> = {
  github: 'GitHub',
  video: 'Video',
  pdf: 'PDF',
  demo: 'Demo',
};

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function linksHtml(project: Project): string {
  const entries = Object.entries(project.links).filter(([, url]) => url && url.trim());
  if (!entries.length) return '';
  const items = entries
    .map(
      ([k, url]) =>
        `<a class="btn" href="${esc(url as string)}" target="_blank" rel="noopener">${
          LINK_LABELS[k] ?? k
        }</a>`,
    )
    .join('');
  return `<div class="detail-links">${items}</div>`;
}

function techHtml(project: Project): string {
  if (!project.tech.length) return '';
  return `<div class="card-tech">${project.tech
    .map((t) => `<span class="tech-chip">${esc(t)}</span>`)
    .join('')}</div>`;
}

function navFoot(prev: Project | undefined, next: Project | undefined): string {
  const prevHtml = prev
    ? `<a class="pager pager--prev" href="project.html?id=${encodeURIComponent(prev.id)}">
         <span class="pager-dir">← 이전</span><span class="pager-title">${esc(prev.title)}</span>
       </a>`
    : '<span class="pager pager--empty"></span>';
  const nextHtml = next
    ? `<a class="pager pager--next" href="project.html?id=${encodeURIComponent(next.id)}">
         <span class="pager-dir">다음 →</span><span class="pager-title">${esc(next.title)}</span>
       </a>`
    : '<span class="pager pager--empty"></span>';
  return `<nav class="detail-pager">${prevHtml}${nextHtml}</nav>`;
}

async function main(): Promise<void> {
  const sf = document.getElementById('starfield') as HTMLCanvasElement | null;
  if (sf) new Starfield(sf).start();

  const profile = await loadProfile().catch(() => null);
  if (profile) document.getElementById('nav-root')?.appendChild(Nav(profile));

  const root = document.getElementById('detail');
  if (!root) return;

  const id = new URLSearchParams(location.search).get('id');
  const projects = await loadProjects().catch(() => [] as Project[]);
  const index = projects.findIndex((p) => p.id === id);

  if (!id || index === -1) {
    root.innerHTML = `
      <div class="detail-missing">
        <h1>프로젝트를 찾을 수 없습니다</h1>
        <p>요청한 프로젝트가 없거나 비공개 상태입니다.</p>
        <a class="btn btn--primary" href="${home('#projects')}">← Back to Projects</a>
      </div>`;
    return;
  }

  const project = projects[index];
  const prev = projects[index - 1];
  const next = projects[index + 1];
  document.title = `${project.title} · Portfolio`;

  const bodyHtml = await marked.parse(project.body || '');

  const thumb = project.thumbnail
    ? `<div class="detail-hero-media"><img src="${esc(project.thumbnail)}" alt="${esc(
        project.title,
      )}" onerror="this.parentElement.style.display='none'" /></div>`
    : '';

  const meta: string[] = [];
  if (project.role) meta.push(`<span><b>Role</b> ${esc(project.role)}</span>`);
  if (project.period) meta.push(`<span><b>Period</b> ${esc(project.period)}</span>`);
  if (project.category) meta.push(`<span><b>Category</b> ${esc(project.category)}</span>`);

  root.style.setProperty('--accent', project.accent);
  root.innerHTML = `
    <a class="back-link" href="${home('#projects')}">← Back to Projects</a>
    <header class="detail-hero">
      <div class="detail-hero-body">
        ${project.category ? `<span class="card-tag">${esc(project.category)}</span>` : ''}
        <h1 class="detail-title">${esc(project.title)}</h1>
        ${project.summary ? `<p class="detail-summary">${esc(project.summary)}</p>` : ''}
        ${meta.length ? `<div class="detail-meta">${meta.join('')}</div>` : ''}
        ${techHtml(project)}
        ${linksHtml(project)}
      </div>
      ${thumb}
    </header>
    <article class="detail-body md">${bodyHtml}</article>
    ${navFoot(prev, next)}
    <a class="back-link back-link--foot" href="${home('#projects')}">← Back to Projects</a>
  `;
}

main();
