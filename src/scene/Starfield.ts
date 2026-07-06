// 전역 고정 배경: 네온 별자리(점 + 근접 연결선). 사이트 전체 뒤에 깔림.
interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

const CYAN = '76, 201, 240';
const PURPLE = '177, 76, 240';
const LINK_DIST = 130; // 연결선이 그려지는 최대 거리(px)

export class Starfield {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private stars: Star[] = [];
  private dpr = 1;
  private w = 0;
  private h = 0;
  private raf = 0;
  private disposed = false;
  private readonly reduced: boolean;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  private resize = (): void => {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // 화면 면적 기준 별 개수 (밀도 일정, 상한).
    const count = Math.min(120, Math.round((this.w * this.h) / 16000));
    if (this.stars.length < count) {
      for (let i = this.stars.length; i < count; i++) this.stars.push(this.makeStar());
    } else {
      this.stars.length = count;
    }
  };

  private makeStar(): Star {
    const speed = this.reduced ? 0 : 0.12;
    return {
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      vx: (Math.random() * 2 - 1) * speed,
      vy: (Math.random() * 2 - 1) * speed,
      r: 0.8 + Math.random() * 1.6,
    };
  }

  start(): void {
    this.loop();
  }

  private loop = (): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    const stars = this.stars;
    for (const s of stars) {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < -5) s.x = this.w + 5;
      else if (s.x > this.w + 5) s.x = -5;
      if (s.y < -5) s.y = this.h + 5;
      else if (s.y > this.h + 5) s.y = -5;
    }

    // 연결선 (근접 별끼리).
    for (let i = 0; i < stars.length; i++) {
      const a = stars[i];
      for (let j = i + 1; j < stars.length; j++) {
        const b = stars[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > LINK_DIST * LINK_DIST) continue;
        const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.32;
        ctx.strokeStyle = `rgba(${CYAN}, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // 별 (네온 글로우).
    ctx.shadowBlur = 6;
    for (const s of stars) {
      const hue = s.r > 1.6 ? PURPLE : CYAN;
      ctx.shadowColor = `rgba(${hue}, 0.9)`;
      ctx.fillStyle = `rgba(${hue}, 0.9)`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  };

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
  }
}
