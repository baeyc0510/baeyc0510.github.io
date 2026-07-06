import * as THREE from 'three';

// 오쏘 카메라 화면을 채우는 한 장의 배경 레이어.
// 텍스처를 수평 반복시키고 offset.x 로 패럴럭스 스크롤.
// yScale(>1)로 확대(크롭), yOffset 으로 세로 이동해 biome 지면을 고정된 캐릭터 발 높이에 정렬.
export class ParallaxLayer {
  readonly mesh: THREE.Mesh;
  private readonly texture: THREE.Texture;
  private readonly imageAspect: number;
  readonly speed: number;
  private readonly yScale: number;
  private readonly yOffset: number;

  constructor(texture: THREE.Texture, speed: number, renderOrder: number, yScale = 1, yOffset = 0) {
    this.texture = texture;
    this.speed = speed;
    this.yScale = yScale;
    this.yOffset = yOffset;

    const img = texture.image as HTMLImageElement;
    this.imageAspect = img.width / img.height;

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    this.mesh.position.z = 0;
    this.mesh.renderOrder = renderOrder;
  }

  // 프러스텀(반높이 1, 반너비 aspect)에 맞춰 크기·반복수·세로위치 갱신.
  resize(halfWidth: number): void {
    const planeW = halfWidth * 2;
    const planeH = 2 * this.yScale;
    this.mesh.scale.set(planeW, planeH, 1);
    this.mesh.position.y = this.yOffset;
    const displayedImgWidth = planeH * this.imageAspect;
    this.texture.repeat.x = planeW / displayedImgWidth;
  }

  setProgress(scroll: number): void {
    this.texture.offset.x = scroll * this.speed;
  }

  // biome 크로스페이드용 그룹 불투명도.
  setOpacity(o: number): void {
    const mat = this.mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = o;
    this.mesh.visible = o > 0.001;
  }
}
