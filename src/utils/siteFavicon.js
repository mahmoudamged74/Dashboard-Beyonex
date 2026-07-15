export function applyDocumentFavicon(url) {
  if (!url) return;

  const specs = [
    { rel: 'icon', sizes: '32x32' },
    { rel: 'icon', sizes: '64x64' },
    { rel: 'shortcut icon' },
  ];

  specs.forEach(({ rel, sizes }) => {
    const selector = sizes
      ? `link[rel="${rel}"][sizes="${sizes}"]`
      : `link[rel="${rel}"]:not([sizes])`;

    let link = document.querySelector(selector);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      if (sizes) link.sizes = sizes;
      document.head.appendChild(link);
    }

    link.type = 'image/png';
    link.href = url;
  });
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
        publicFaviconCache = json?.data?.favicon ?? null;
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
