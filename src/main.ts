import './styles/main.css';
import { loadProfile, loadProjects } from './data/loadProjects';
import type { Profile, Project } from './data/types';
import { Nav } from './components/Nav';
import { ProjectCard } from './components/ProjectCard';
import { ProjectStage } from './components/ProjectStage';
import { WorldProgress } from './components/WorldProgress';
import type { ProgressStop, WorldProgressHandle } from './components/WorldProgress';
import { PortfolioWorld } from './scene/PortfolioWorld';
import type { BiomeAnchor } from './scene/PortfolioWorld';
import { ScrollController } from './scene/ScrollController';
import { Starfield } from './scene/Starfield';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function setLoading(progress: number, text: string): void {
  const bar = document.getElementById('loading-bar');
  const label = document.getElementById('loading-text');
  if (bar) bar.style.width = `${Math.round(clamp01(progress) * 100)}%`;
  if (label) label.textContent = text;
}

async function hideLoading(): Promise<void> {
  setLoading(1, '준비 완료');
  await sleep(180);
  document.body.classList.remove('is-loading');
  document.getElementById('loading-screen')?.classList.add('is-hidden');
}

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
function buildVisualUpdater(stages: StageEntry[], progress?: WorldProgressHandle) {
  const hero = document.getElementById('hero');
  const skip = document.getElementById('skip-btn');
  const heroEnd = 0.14;

  return (p: number): void => {
    if (progress) {
      // 월드 구간 동안만 진행바 노출. 마지막 꼬리 구간에선 숨김.
      progress.el.classList.toggle('is-visible', p < 0.985);
      progress.update(p);
    }
    if (hero) {
      const t = clamp01(p / heroEnd);
      hero.style.opacity = String(1 - t);
      hero.style.transform = `translateY(${-t * 40}px)`;
      hero.style.pointerEvents = t > 0.5 ? 'none' : '';
    }
    // 히어로 SCROLL 이 사라진 뒤(월드 탐색 중) Skip 노출, 끝 부근에선 숨김.
    if (skip) skip.classList.toggle('is-visible', p > 0.12 && p < 0.98);
    // 카드 가로 통과: 오른쪽 밖(등장) → 중앙(선명) → 왼쪽(퇴장). 정지 구간 없이 스크롤에 연동.
    const span = Math.min(window.innerWidth, (window.innerHeight * 4) / 3);
    for (const s of stages) {
      // t: 카드 중심 기준 부호 있는 진행량(slot 단위). 0 에서 가장 선명.
      const t = (p - s.center) / s.slot;
      const tc = Math.max(-1, Math.min(1, t));
      const v = clamp01((0.55 - Math.abs(t)) / 0.28);
      const e = easeOutCubic(v);
      s.el.style.opacity = String(e);
      // 가로 흐름(주): 스크롤 진행 시 왼쪽으로 흘러감. 세로(부): 살짝 부유감만 남김.
      // 중앙정렬 transform(translateY -50%)과 분리하기 위해 translate 속성 사용.
      const driftX = -tc * span * 0.2;
      const floatY = (1 - e) * 18;
      s.el.style.translate = `${driftX}px ${floatY}px`;
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

async function initWorld(
  anchors: BiomeAnchor[],
  stages: StageEntry[],
  progress?: WorldProgressHandle,
): Promise<void> {
  const canvas = document.getElementById('world-canvas') as HTMLCanvasElement | null;
  const pin = document.getElementById('world-pin');
  if (!canvas || !pin) return;

  const updateVisuals = buildVisualUpdater(stages, progress);

  if (prefersReducedMotion) {
    document.body.classList.add('no-world');
    return;
  }

  try {
    const world = new PortfolioWorld(canvas, {
      onAssetProgress: (loaded, total) => {
        const assetProgress = total > 0 ? loaded / total : 0;
        setLoading(0.35 + assetProgress * 0.58, '월드 에셋 로딩 중');
      },
    });
    await world.init(anchors);
    setLoading(0.96, '월드 렌더링 준비 중');
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

function startStarfield(): void {
  const canvas = document.getElementById('starfield') as HTMLCanvasElement | null;
  if (canvas) new Starfield(canvas).start();
}

async function main(): Promise<void> {
  setLoading(0.08, '배경을 준비하는 중');
  startStarfield();

  let profile: Profile;
  let projects: Project[];
  try {
    setLoading(0.18, '프로필과 프로젝트 데이터를 불러오는 중');
    [profile, projects] = await Promise.all([loadProfile(), loadProjects()]);
    setLoading(0.35, '프로젝트 카드를 구성하는 중');
  } catch (err) {
    console.error('데이터 로드 실패:', err);
    setLoading(1, '데이터를 불러오지 못했습니다');
    await sleep(500);
    document.body.classList.remove('is-loading');
    document.getElementById('loading-screen')?.classList.add('is-hidden');
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
  // tail 0 = 마지막 카드 뒤 빈 여백 없음. 마지막 카드가 흘러나가는 시점에 핀이 풀려
  // 곧바로 All Projects 로 이어짐(빈 구간 스크롤 제거).
  const tail = 0;
  const N = projects.length;
  const band = Math.max(0.001, 1 - heroEnd - tail);
  const stages: StageEntry[] = [];
  // 히어로 구간은 첫 프로젝트 biome 으로 시작.
  const anchors: BiomeAnchor[] = [{ biome: projects[0]?.biome ?? 'forest', anchor: 0 }];
  // 진행바 노드: 인트로(히어로) + 각 프로젝트 섹션.
  const stops: ProgressStop[] = [{ center: 0, label: 'Intro', accent: '#8fa0c8' }];

  projects.forEach((p, i) => {
    const center = heroEnd + (band * (i + 0.5)) / N;
    if (stageRoot) {
      const card = ProjectStage(p, i + 1);
      card.classList.add('stage-card');
      stageRoot.appendChild(card);
      stages.push({ el: card, center, slot: band / N, accent: p.accent });
    }
    stops.push({ center, label: p.title, accent: p.accent });
    anchors.push({ biome: p.biome, anchor: center });
    if (grid) grid.appendChild(ProjectCard(p, 'grid'));
  });

  if (grid && N === 0) grid.innerHTML = '<p class="empty">표시할 프로젝트가 없습니다.</p>';

  // 핀 구간 높이 = 히어로 + 프로젝트 수 기반. 섹션당 SECTION_VH.
  // 낮출수록 끝까지 필요한 스크롤 양이 줄어듦(쾌적). 높이면 각 섹션을 더 천천히 훑음.
  const SECTION_VH = 100;
  if (pin) pin.style.height = `${Math.max(240, (1 + N) * SECTION_VH)}vh`;

  // Skip → All Projects 로 바로 이동.
  document.getElementById('skip-btn')?.addEventListener('click', () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  });

  // 진행바 노드 클릭 → 해당 섹션의 스크롤 위치로 이동.
  // 진행률 center 는 핀 구간 내에서 (핀상단 + center*range) 로 역산.
  const seekTo = (center: number): void => {
    if (!pin) return;
    const pinTop = pin.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(0, pin.offsetHeight - window.innerHeight);
    window.scrollTo({ top: pinTop + center * range, behavior: 'smooth' });
  };
  const progress = N > 0 ? WorldProgress(stops, seekTo) : undefined;
  if (progress) document.body.appendChild(progress.el);

  setupReveal();
  await initWorld(anchors, stages, progress);
  await hideLoading();
}

main();
