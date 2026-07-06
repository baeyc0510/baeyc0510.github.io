import * as THREE from 'three';
import { ParallaxLayer } from './ParallaxLayer';
import { Character } from './Character';
import type { Biome } from '../data/types';

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}${p}`.replace(/([^:])\/\//g, '$1/');

// 각 biome 레이어 파일 (뒤 → 앞). 마지막('1')은 전경으로 캐릭터보다 앞에 그려짐.
const BIOME_LAYERS: Record<Biome, string[]> = {
  forest: ['6', '5', '4', '3', '2', '1'],
  caves: ['7', '6', '5', '4', '3', '2', '1'],
  plains: ['8', '7', '6', '5', '4', '3', '2', '1'],
  snowy: ['5', '4', '3', '2', '1'],
};

// biome 별 세로 정렬: scale(확대·크롭), offset(세로 이동, +위). 지면을 캐릭터 발 높이(약 -0.645)에 맞춤.
const BIOME_TUNE: Record<Biome, { scale: number; offset: number }> = {
  forest: { scale: 1.5, offset: 0.0 },
  caves: { scale: 1.5, offset: 0.38 },
  snowy: { scale: 1.5, offset: 0.55 },
  plains: { scale: 1.5, offset: 0.55 },
};

const FG_RENDER_ORDER = 200;
const TRAVEL = 7;

export interface BiomeAnchor {
  biome: Biome;
  anchor: number;
}

function loadTexture(loader: THREE.TextureLoader, url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, () => reject(new Error(`텍스처 로드 실패: ${url}`)));
  });
}

export class PortfolioWorld {
  readonly character = new Character();
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.OrthographicCamera;
  private groups = new Map<Biome, ParallaxLayer[]>();
  private anchors: BiomeAnchor[] = [];
  private particles?: THREE.Points;
  private particleVel: Float32Array = new Float32Array(0);
  private accent = new THREE.Color('#4cc9f0');
  private progress = 0;
  private targetProgress = 0;
  private disposed = false;
  private raf = 0;
  onRender: ((progress: number, weights: Record<string, number>) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    this.camera.position.z = 20;
  }

  async init(anchors: BiomeAnchor[]): Promise<void> {
    this.anchors = [...anchors].sort((a, b) => a.anchor - b.anchor);
    const distinct = Array.from(new Set(this.anchors.map((a) => a.biome)));

    const loader = new THREE.TextureLoader();
    for (const biome of distinct) {
      const files = BIOME_LAYERS[biome];
      const tune = BIOME_TUNE[biome];
      const textures = await Promise.all(
        files.map((f) => loadTexture(loader, asset(`assets/bg/${biome}/${f}.png`))),
      );
      const layers: ParallaxLayer[] = [];
      const lastIdx = files.length - 1;
      textures.forEach((tex, i) => {
        const t = files.length > 1 ? i / lastIdx : 0;
        const speed = (0.05 + 0.5 * t) * TRAVEL;
        const renderOrder = i === lastIdx ? FG_RENDER_ORDER : i;
        const layer = new ParallaxLayer(tex, speed, renderOrder, tune.scale, tune.offset);
        layer.setOpacity(0);
        layers.push(layer);
        this.scene.add(layer.mesh);
      });
      this.groups.set(biome, layers);
    }

    // 캐릭터 (전경보다 뒤, 중경보다 앞).
    await this.character.load(loader);
    this.character.addTo(this.scene);

    this.buildParticles();
    this.resize();
    window.addEventListener('resize', this.resize);
    this.loop();
  }

  private buildParticles(): void {
    const COUNT = 80;
    const positions = new Float32Array(COUNT * 3);
    this.particleVel = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() * 2 - 1) * 2.2;
      positions[i * 3 + 1] = Math.random() * 2 - 1;
      positions[i * 3 + 2] = 0;
      this.particleVel[i] = 0.008 + Math.random() * 0.022;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: this.accent,
      size: 0.02,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      sizeAttenuation: false,
    });
    this.particles = new THREE.Points(geo, mat);
    this.particles.renderOrder = 50; // 배경 앞, 캐릭터(100) 뒤.
    this.scene.add(this.particles);
  }

  private resize = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;
    this.camera.left = -aspect;
    this.camera.right = aspect;
    this.camera.top = 1;
    this.camera.bottom = -1;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    for (const layers of this.groups.values()) {
      for (const layer of layers) layer.resize(aspect);
    }
    this.character.resize(aspect);
  };

  setProgress(p: number): void {
    this.targetProgress = Math.max(0, Math.min(1, p));
  }

  setAccent(hex: string): void {
    this.accent.set(hex);
    if (this.particles) (this.particles.material as THREE.PointsMaterial).color.copy(this.accent);
  }

  private weightsAt(p: number): Record<string, number> {
    const out: Record<string, number> = {};
    const a = this.anchors;
    if (a.length === 0) return out;
    if (p <= a[0].anchor) {
      out[a[0].biome] = 1;
      return out;
    }
    const last = a[a.length - 1];
    if (p >= last.anchor) {
      out[last.biome] = 1;
      return out;
    }
    for (let i = 0; i < a.length - 1; i++) {
      if (p >= a[i].anchor && p <= a[i + 1].anchor) {
        const span = a[i + 1].anchor - a[i].anchor || 1;
        const t = (p - a[i].anchor) / span;
        out[a[i].biome] = (out[a[i].biome] ?? 0) + (1 - t);
        out[a[i + 1].biome] = (out[a[i + 1].biome] ?? 0) + t;
        break;
      }
    }
    return out;
  }

  private loop = (t = 0): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);

    this.progress += (this.targetProgress - this.progress) * 0.09;

    const weights = this.weightsAt(this.progress);
    for (const [biome, layers] of this.groups) {
      const o = weights[biome] ?? 0;
      for (const layer of layers) {
        layer.setProgress(this.progress);
        layer.setOpacity(o);
      }
    }

    this.character.update(t);

    if (this.particles) {
      const pos = this.particles.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < this.particleVel.length; i++) {
        let y = pos.getY(i) + this.particleVel[i] * 0.02;
        if (y > 1.1) y = -1.1;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    this.onRender?.(this.progress, weights);
    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    this.renderer.dispose();
  }
}
