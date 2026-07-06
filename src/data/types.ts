// 프로젝트 데이터 모델. frontmatter 필드는 모두 선택적이며, 없으면 UI 에서 자동 숨김 처리.

export type Biome =  'kingdom' | 'meadow' | 'night' | 'candy';

export interface ProfileLink {
  label: string;
  url: string;
}

export interface Profile {
  name: string;
  tagline: string;
  links: ProfileLink[];
}

export interface ProjectLinks {
  github?: string;
  video?: string;
  pdf?: string;
  demo?: string;
}

export interface Project {
  // 슬러그. index.json 의 파일명과 detailUrl 계산 기준.
  id: string;
  title: string;
  summary: string;
  tech: string[];
  category?: string;
  role?: string;
  period?: string;
  thumbnail?: string;
  featured: boolean;
  visible: boolean;
  order: number;
  // Three 월드 스테이지 분위기.
  biome: Biome;
  accent: string;
  links: ProjectLinks;
  // 상세 페이지 본문 (마크다운 원문).
  body: string;
  detailUrl: string;
}
