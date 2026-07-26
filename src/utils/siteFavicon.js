import { resolveMediaUrl } from './mediaUrl';

export function applyDocumentFavicon(url) {
  const href = resolveMediaUrl(url);
  if (!href) return;

  document
    .querySelectorAll('link[rel="icon"], link[rel="alternate icon"], link[rel="shortcut icon"]')
    .forEach((link) => link.remove());

  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = href.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  link.href = href;
  document.head.appendChild(link);
}

let publicFaviconCache;
let publicFaviconPromise;

export async function fetchPublicFavicon() {
  if (publicFaviconCache !== undefined) return publicFaviconCache;

  if (!publicFaviconPromise) {
    const base = import.meta.env.VITE_API_BASE_URL || '';
    publicFaviconPromise = fetch(`${base}settings`, {
      headers: { Accept: 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const raw = json?.data?.favicon ?? null;
        publicFaviconCache = resolveMediaUrl(raw);
        if (publicFaviconCache) applyDocumentFavicon(publicFaviconCache);
        return publicFaviconCache;
      })
      .catch(() => {
        publicFaviconCache = null;
        return null;
      });
  }

  return publicFaviconPromise;
}
