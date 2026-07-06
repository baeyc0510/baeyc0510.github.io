import type { PortfolioWorld } from './PortfolioWorld';
import type { Character } from './Character';

interface Options {
  // 월드가 핀 고정되는 스크롤 구간 엘리먼트. 이 구간 내 스크롤 = 진행률 0..1.
  pin: HTMLElement;
  onProgress?: (progress: number) => void;
}

// 페이지 세로 스크롤 → 월드 진행률·캐릭터 상태로 변환.
export class ScrollController {
  private readonly world: PortfolioWorld;
  private readonly character: Character;
  private readonly pin: HTMLElement;
  private readonly onProgress?: (p: number) => void;
  private lastProgress = 0;
  private runUntil = 0;
  private raf = 0;
  private disposed = false;

  constructor(world: PortfolioWorld, character: Character, options: Options) {
    this.world = world;
    this.character = character;
    this.pin = options.pin;
    this.onProgress = options.onProgress;
  }

  private computeProgress(): number {
    // 핀 구간 상단부터 (구간높이 - 뷰포트높이) 만큼 스크롤하는 동안 0→1.
    const rect = this.pin.getBoundingClientRect();
    const scrolled = -rect.top; // 핀 상단이 뷰포트 위로 지나간 거리.
    const range = this.pin.offsetHeight - window.innerHeight;
    if (range <= 0) return 0;
    return Math.max(0, Math.min(1, scrolled / range));
  }

  start(): void {
    this.lastProgress = this.computeProgress();
    this.loop(performance.now());
  }

  private loop = (t: number): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);

    const progress = this.computeProgress();
    const delta = progress - this.lastProgress;
    this.lastProgress = progress;

    this.world.setProgress(progress);
    this.onProgress?.(progress);

    if (Math.abs(delta) > 0.0004) {
      this.character.setState('run');
      this.character.setFacing(delta >= 0 ? 1 : -1);
      this.runUntil = t + 140;
    } else if (t > this.runUntil) {
      this.character.setState('idle');
    }
  };

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
  }
}
