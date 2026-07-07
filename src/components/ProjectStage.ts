import type { Project } from '../data/types';
import { ProjectCard } from './ProjectCard';

const BIOME_LABEL: Record<string, string> = {
  meadow: 'MEADOW',
  kingdom: 'KINGDOM',
  night: 'NIGHT SKY',
  candy: 'CANDY',
};

// 월드 위에 얹히는 프로젝트 스테이지 = 나무 표지판.
// 구조: 기둥(post) + 방향 촉(tip) + 보드(board: 헤더 배너 + 프로젝트 카드).
export function ProjectStage(project: Project, stageNo: number): HTMLElement {
  const section = document.createElement('section');
  section.className = 'stage stage--sign';
  section.dataset.accent = project.accent;
  section.style.setProperty('--accent', project.accent);

  const sign = document.createElement('div');
  sign.className = 'sign';

  // 땅에 박힌 세로 기둥 (보드 뒤).
  const post = document.createElement('span');
  post.className = 'sign-post';
  post.setAttribute('aria-hidden', 'true');
  sign.appendChild(post);

  // 왼쪽 방향 촉 (이정표 느낌, 진행 방향과 일치).
  const tip = document.createElement('span');
  tip.className = 'sign-tip';
  tip.setAttribute('aria-hidden', 'true');
  sign.appendChild(tip);

  // 나무 보드.
  const board = document.createElement('div');
  board.className = 'sign-board';

  const header = document.createElement('div');
  header.className = 'sign-header';
  const no = String(stageNo).padStart(2, '0');
  header.innerHTML = `<span class="sign-no">STAGE ${no}</span><span class="sign-biome">${
    BIOME_LABEL[project.biome] ?? project.biome.toUpperCase()
  }</span>`;
  board.appendChild(header);

  board.appendChild(ProjectCard(project, 'stage'));
  sign.appendChild(board);

  section.appendChild(sign);
  return section;
}
