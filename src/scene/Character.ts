import * as THREE from 'three';

const BASE = import.meta.env.BASE_URL;
const frameUrl = (name: string) => `${BASE}assets/character/${name}.png`.replace(/([^:])\/\//g, '$1/');

type State = 'idle' | 'run';

const FRAMES: Record<State, string[]> = {
  idle: ['character_idle_0', 'character_idle_1', 'character_idle_2', 'character_idle_3'],
  run: ['character_run_0', 'character_run_1', 'character_run_2', 'character_run_3'],
};
const FPS: Record<State, number> = { idle: 5, run: 9 };

// 화면 좌측에 고정된 캐릭터 스프라이트 (캔버스 내부, 중경 앞 / 전경 뒤).
// 배경이 이동해 지면이 이 캐릭터 발 높이에 맞춰짐.
const CHAR_HEIGHT = 0.72; // 오쏘 단위 (반높이 1 기준).
const BASE_Y = -0.4; // 발이 지면선(약 -0.62)에 오도록 중심 위치.
const X_RATIO = 0.5; // 화면 좌측 (aspect 대비).

export class Character {
  readonly mesh: THREE.Mesh;
  private readonly material: THREE.MeshBasicMaterial;
  private textures: Record<State, THREE.Texture[]> = { idle: [], run: [] };
  private state: State = 'idle';
  private facing: 1 | -1 = 1;
  private index = 0;
  private last = 0;

  constructor() {
    this.material = new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, depthWrite: false });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material);
    this.mesh.renderOrder = 100; // 배경(<100) 앞, 전경(200) 뒤.
    this.mesh.position.set(0, BASE_Y, 0);
    this.mesh.visible = false;
  }

  async load(loader: THREE.TextureLoader): Promise<void> {
    const load = (name: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(frameUrl(name), (t) => {
          t.magFilter = THREE.LinearFilter;
          t.minFilter = THREE.LinearFilter;
          t.generateMipmaps = false;
          resolve(t);
        }, undefined, () => reject(new Error(`캐릭터 프레임 로드 실패: ${name}`)));
      });
    this.textures.idle = await Promise.all(FRAMES.idle.map(load));
    this.textures.run = await Promise.all(FRAMES.run.map(load));
    this.material.map = this.textures.idle[0];
    this.material.needsUpdate = true;
    this.mesh.visible = true;
  }

  addTo(scene: THREE.Scene): void {
    scene.add(this.mesh);
  }

  // 프러스텀에 맞춰 위치·크기 갱신 (화면 좌측 고정).
  resize(halfWidth: number): void {
    this.mesh.position.x = -halfWidth * X_RATIO;
    this.mesh.scale.set(CHAR_HEIGHT * this.facing, CHAR_HEIGHT, 1);
  }

  setState(state: State): void {
    if (state === this.state) return;
    this.state = state;
    this.index = 0;
    this.last = 0;
  }

  setFacing(dir: 1 | -1): void {
    if (dir === this.facing) return;
    this.facing = dir;
    this.mesh.scale.x = CHAR_HEIGHT * dir;
  }

  update(t: number): void {
    const frames = this.textures[this.state];
    if (frames.length === 0) return;
    const interval = 1000 / FPS[this.state];
    if (t - this.last >= interval) {
      this.last = t;
      this.index = (this.index + 1) % frames.length;
      this.material.map = frames[this.index];
      this.material.needsUpdate = true;
    }
    // 가벼운 상하 흔들림.
    this.mesh.position.y = BASE_Y + Math.sin(t * 0.0016) * 0.015;
  }
}
