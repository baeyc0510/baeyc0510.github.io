import type { Profile } from '../data/types';

// 상단 고정 내비게이션.
export function Nav(profile: Profile): HTMLElement {
  const nav = document.createElement('nav');
  nav.className = 'nav';

  const brand = document.createElement('a');
  brand.className = 'nav-brand';
  brand.href = '#hero';
  brand.textContent = profile.name || 'Portfolio';
  nav.appendChild(brand);

  const menu = document.createElement('div');
  menu.className = 'nav-menu';

  const internal: Array<[string, string]> = [
    ['Projects', '#projects'],
    ['Contact', '#contact'],
  ];
  for (const [label, href] of internal) {
    const a = document.createElement('a');
    a.className = 'nav-link';
    a.href = href;
    a.textContent = label;
    menu.appendChild(a);
  }

  for (const link of profile.links) {
    if (!link.url || !link.url.trim()) continue;
    const a = document.createElement('a');
    a.className = 'nav-link nav-link--ext';
    a.href = link.url;
    if (!link.url.startsWith('mailto:')) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    a.textContent = link.label;
    menu.appendChild(a);
  }

  nav.appendChild(menu);
  return nav;
}
