import type { Profile, Project, Biome, ProjectLinks } from './types';

const BASE = import.meta.env.BASE_URL; // '/'

// data 파일 경로 헬퍼.
const dataUrl = (p: string) => `${BASE}data/${p}`.replace(/\/{2,}/g, '/');

export async function loadProfile(): Promise<Profile> {
  const res = await fetch(dataUrl('profile.json'));
  if (!res.ok) throw new Error(`profile.json 로드 실패: ${res.status}`);
  return res.json();
}

interface FrontMatter {
  data: Record<string, string>;
  body: string;
}

// 아주 단순한 frontmatter 파서. `---` 블록의 key: value 만 처리.
function parseFrontMatter(raw: string): FrontMatter {
  const text = raw.replace(/^﻿/, '');
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(text);
  if (!match) return { data: {}, body: text };

  const data: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const kv = /^([A-Za-z0-9_]+)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    data[kv[1].trim()] = kv[2].trim();
  }
  return { data, body: match[2] ?? '' };
}

// "[Unreal Engine 5, C++, GAS]" 또는 "a, b" → string[]
function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((s) => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return /^(true|1|yes)$/i.test(value.trim());
}

const BIOMES: Biome[] = ['forest', 'caves', 'snowy', 'plains'];
function normalizeBiome(value: string | undefined): Biome {
  const v = value?.trim() as Biome | undefined;
  return v && BIOMES.includes(v) ? v : 'forest';
}

function toProject(id: string, fm: FrontMatter, indexOrder: number): Project {
  const d = fm.data;
  const links: ProjectLinks = {};
  if (d.github) links.github = d.github;
  if (d.video) links.video = d.video;
  if (d.pdf) links.pdf = d.pdf;
  if (d.demo) links.demo = d.demo;

  const thumbnail = d.thumbnail ? `${BASE}${d.thumbnail}`.replace(/\/{2,}/g, '/') : undefined;

  return {
    id,
    title: d.title || id,
    summary: d.summary || '',
    tech: parseList(d.tech),
    category: d.category || undefined,
    role: d.role || undefined,
    period: d.period || undefined,
    thumbnail,
    featured: parseBool(d.featured, false),
    visible: parseBool(d.visible, true),
    order: d.order ? Number(d.order) : indexOrder,
    biome: normalizeBiome(d.biome || d.worldType),
    accent: d.accent || '#4cc9f0',
    links,
    body: fm.body,
    detailUrl: `project.html?id=${encodeURIComponent(id)}`,
  };
}

export async function loadProjects(): Promise<Project[]> {
  const idxRes = await fetch(dataUrl('projects/index.json'));
  if (!idxRes.ok) throw new Error(`index.json 로드 실패: ${idxRes.status}`);
  const idx: { projects: string[] } = await idxRes.json();

  const loaded = await Promise.all(
    idx.projects.map(async (id, i) => {
      const res = await fetch(dataUrl(`projects/${id}.md`));
      if (!res.ok) return null;
      const fm = parseFrontMatter(await res.text());
      return toProject(id, fm, (i + 1) * 10);
    }),
  );

  return loaded
    .filter((p): p is Project => p !== null && p.visible)
    .sort((a, b) => a.order - b.order);
}

// 단일 프로젝트 (상세 페이지용).
export async function loadProject(id: string): Promise<Project | null> {
  const res = await fetch(dataUrl(`projects/${id}.md`));
  if (!res.ok) return null;
  const fm = parseFrontMatter(await res.text());
  return toProject(id, fm, 0);
}
