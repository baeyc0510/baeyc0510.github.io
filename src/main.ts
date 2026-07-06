import './styles/main.css';
import { loadProfile, loadProjects } from './data/loadProjects';
import type { Profile, Project } from './data/types';
import { Nav } from './components/Nav';
import { ProjectCard } from './components/ProjectCard';
import { ProjectStage } from './components/ProjectStage';
import { PortfolioWorld } from './scene/PortfolioWorld';
import type { BiomeAnchor } from './scene/PortfolioWorld';
import { ScrollController } from './scene/ScrollController';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

function fillText(selector: string, value: string): void {
  document.querySelectorAll<HTMLElement>(selector).forEach((n) => (n.textContent = value));
}

function renderProfileLinks(container: HTMLElement, profile: Profile, includeProjects: boolean): void {
  container.innerHTML = '';
  if (includeProjects) {
    const a = document.createElement('a');
    a.className = 'btn btn--primary';
    a.href = '#projects';
    a.textContent = 'Projects';
    container.appendChild(a);
  }
  for (const link of profile.links) {
    if (!link.url || !link.url.trim()) continue;
    const a = document.createElement('a');
    a.className = 'btn';
    a.href = link.url;
    if (!link.url.startsWith('mailto:')) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    a.textContent = link.label;
    container.appendChild(a);
  }
}

function setupReveal(): void {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
  );
  document.querySelectorAll('.reveal:not(.is-in)').forEach((n) => io.observe(n));
}

interface StageEntry {
  el: HTMLElement;
  center: number;
  slot: number;
  accent: string;
}

// 스크롤 진행률에 따라 히어로 페이드 + 카드 float-up 갱신. (배경·전경·캐릭터는 캔버스가 담당)
function buildVisualUpdater(stages: StageEntry[]) {
  const hero = document.getElementById('hero');
  const heroEnd = 0.14;

  return (p: number): void => {
    if (hero) {
      const t = clamp01(p / heroEnd);
      hero.style.opacity = String(1 - t);
      hero.style.transform = `translateY(${-t * 40}px)`;
      hero.style.pointerEvents = t > 0.5 ? 'none' : '';
    }
    for (const s of stages) {
      const d = Math.abs((p - s.center) / s.slot);
      const v = clamp01((0.5 - d) / 0.22);
      const e = easeOutCubic(v);
      s.el.style.opacity = String(e);
      // 중앙정렬 transform(translateY -50%)과 분리하기 위해 translate 속성 사용.
      s.el.style.translate = `0 ${(1 - e) * 46}px`;
      s.el.style.pointerEvents = e > 0.6 ? 'auto' : 'none';
    }
  };
}

// 활성 스테이지(가장 중앙)의 accent 로 파티클 색 전환.
function activeAccent(stages: StageEntry[], p: number): string | null {
  let best: StageEntry | null = null;
  let bestD = Infinity;
  for (const s of stages) {
    const d = Math.abs(p - s.center);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best && bestD < best.slot * 0.6 ? best.accent : null;
}

async function initWorld(anchors: BiomeAnchor[], stages: StageEntry[]): Promise<void> {
  const canvas = document.getElementById('world-canvas') as HTMLCanvasElement | null;
  const pin = document.getElementById('world-pin');
  if (!canvas || !pin) return;

  const updateVisuals = buildVisualUpdater(stages);

  if (prefersReducedMotion) {
    document.body.classList.add('no-world');
    return;
  }

  try {
    const world = new PortfolioWorld(canvas);
    await world.init(anchors);
    let lastAccent = '';
    world.onRender = (p) => {
      updateVisuals(p);
      const acc = activeAccent(stages, p);
      if (acc && acc !== lastAccent) {
        lastAccent = acc;
        world.setAccent(acc);
      }
    };
    const scroll = new ScrollController(world, world.character, { pin });
    scroll.start();
  } catch (err) {
    console.warn('월드 초기화 실패, 정적 폴백으로 전환:', err);
    document.body.classList.add('no-world');
  }
}

async function main(): Promise<void> {
  let profile: Profile;
  let projects: Project[];
  try {
    [profile, projects] = await Promise.all([loadProfile(), loadProjects()]);
  } catch (err) {
    console.error('데이터 로드 실패:', err);
    document.getElementById('content')?.insertAdjacentHTML(
      'afterbegin',
      '<p style="padding:2rem;color:#f88">데이터를 불러오지 못했습니다.</p>',
    );
    return;
  }

  document.getElementById('nav-root')?.appendChild(Nav(profile));

  fillText('[data-profile="name"]', profile.name);
  fillText('[data-profile="tagline"]', profile.tagline);
  const heroLinks = document.querySelector<HTMLElement>('.hero-cta[data-profile="links"]');
  if (heroLinks) renderProfileLinks(heroLinks, profile, true);
  const contactLinks = document.querySelector<HTMLElement>('.contact-links[data-profile="links"]');
  if (contactLinks) renderProfileLinks(contactLinks, profile, false);

  // 스테이지 카드(월드 오버레이) + 그리드(일반 흐름) 생성.
  const stageRoot = document.getElementById('stage-cards');
  const grid = document.getElementById('project-grid');
  const pin = document.getElementById('world-pin');

  const heroEnd = 0.14;
  const tail = 0.08;
  const N = projects.length;
  const band = Math.max(0.001, 1 - heroEnd - tail);
  const stages: StageEntry[] = [];
  // 히어로 구간은 첫 프로젝트 biome 으로 시작.
  const anchors: BiomeAnchor[] = [{ biome: projects[0]?.biome ?? 'forest', anchor: 0 }];

  projects.forEach((p, i) => {
    const center = heroEnd + (band * (i + 0.5)) / N;
    if (stageRoot) {
      const card = ProjectStage(p, i + 1);
      card.classList.add('stage-card');
      stageRoot.appendChild(card);
      stages.push({ el: card, center, slot: band / N, accent: p.accent });
    }
    anchors.push({ biome: p.biome, anchor: center });
    if (grid) grid.appendChild(ProjectCard(p, 'grid'));
  });

  if (grid && N === 0) grid.innerHTML = '<p class="empty">표시할 프로젝트가 없습니다.</p>';

  // 핀 구간 높이 = 히어로 + 프로젝트 수 기반. 최소 320vh.
  if (pin) pin.style.height = `${Math.max(320, (1 + N) * 150)}vh`;

  setupReveal();
  await initWorld(anchors, stages);
}

main();
