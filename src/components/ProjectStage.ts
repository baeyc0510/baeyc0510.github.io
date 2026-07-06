import type { Project } from '../data/types';
import { ProjectCard } from './ProjectCard';

const BIOME_LABEL: Record<string, string> = {
  meadow: 'MEADOW',
  kingdom: 'KINGDOM',
  night: 'NIGHT SKY',
  candy: 'CANDY',
};

// 월드 위에 얹히는 프로젝트 스테이지 패널.
export function ProjectStage(project: Project, stageNo: number): HTMLElement {
  const section = document.createElement('section');
  section.className = 'stage';
  section.dataset.accent = project.accent;
  section.style.setProperty('--accent', project.accent);

  const inner = document.createElement('div');
  inner.className = 'stage-inner';

  const label = document.createElement('div');
  label.className = 'stage-label';
  const no = String(stageNo).padStart(2, '0');
  label.innerHTML = `<span class="stage-no">STAGE ${no}</span><span class="stage-biome">${
    BIOME_LABEL[project.biome] ?? project.biome.toUpperCase()
  }</span>`;
  inner.appendChild(label);

  inner.appendChild(ProjectCard(project, 'stage'));
  section.appendChild(inner);
  return section;
}
