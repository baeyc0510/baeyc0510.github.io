// 월드 상단 중앙 HUD 진행바. 섹션마다 원형 노드, 노드 클릭 시 해당 섹션으로 스크롤 이동.

export interface ProgressStop {
  // 스크롤 진행률(0..1) 상의 위치.
  center: number;
  label: string;
  accent: string;
}

export interface WorldProgressHandle {
  el: HTMLElement;
  update(p: number): void;
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  );
}

export function WorldProgress(
  stops: ProgressStop[],
  onSeek: (center: number) => void,
): WorldProgressHandle {
  const root = document.createElement('nav');
  root.className = 'world-progress';
  root.setAttribute('aria-label', '섹션 진행도');

  // 트랙 오른쪽 끝 = 마지막 노드. 마지막 스테이지 뒤 꼬리 구간은 표시하지 않음.
  const span = stops.length ? stops[stops.length - 1].center : 1;
  const safeSpan = span > 0 ? span : 1;

  const track = document.createElement('div');
  track.className = 'wp-track';

  const fill = document.createElement('span');
  fill.className = 'wp-fill';
  fill.setAttribute('aria-hidden', 'true');
  track.appendChild(fill);

  const dots: HTMLButtonElement[] = [];
  stops.forEach((stop) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'wp-dot';
    dot.style.left = `${(stop.center / safeSpan) * 100}%`;
    dot.style.setProperty('--dot-accent', stop.accent);
    dot.setAttribute('aria-label', `${stop.label} 섹션으로 이동`);
    dot.title = stop.label;
    dot.innerHTML =
      `<span class="wp-dot-core" aria-hidden="true"></span>` +
      `<span class="wp-dot-label">${escapeHtml(stop.label)}</span>`;
    dot.addEventListener('click', () => onSeek(stop.center));
    track.appendChild(dot);
    dots.push(dot);
  });

  root.appendChild(track);

  const update = (p: number): void => {
    const clamped = Math.max(0, Math.min(1, p));
    // 채움도 마지막 노드 기준으로 정규화 → 마지막 스테이지에서 100%.
    fill.style.width = `${Math.min(1, clamped / safeSpan) * 100}%`;

    // 진행률에 가장 가까운 노드를 활성 표시.
    let activeIdx = 0;
    let best = Infinity;
    stops.forEach((s, i) => {
      const d = Math.abs(s.center - clamped);
      if (d < best) {
        best = d;
        activeIdx = i;
      }
    });
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === activeIdx);
      // 지나온 노드는 채워진 상태로 표시.
      d.classList.toggle('is-done', stops[i].center <= clamped + 0.001);
    });
  };

  return { el: root, update };
}
