const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');

/**
 * Normalizes logo/favicon URLs from the API for use in <img src>.
 * Handles storage paths, absolute URLs, data URLs, and backend-wrapped data URLs
 * (e.g. https://backend.example.com/data:image/png;base64,...).
 */
export const resolveMediaUrl = (value) => {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const dataIndex = trimmed.indexOf('data:');
  if (dataIndex !== -1) return trimmed.slice(dataIndex);

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (!API_ORIGIN) return trimmed;

  return trimmed.startsWith('/')
    ? `${API_ORIGIN}${trimmed}`
    : `${API_ORIGIN}/${trimmed}`;
};

/** True when value is a URL/path (not an icon-map key like "rocketLaunch"). */
export const isMediaPath = (value) => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return true;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (trimmed.startsWith('/') || trimmed.includes('/')) return true;
  return false;
};

/** Append or replace cache-bust query param so browsers reload after upload. */
export const withCacheBust = (url, bust) => {
  if (!url || !bust) return url;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  const bustStr = encodeURIComponent(String(bust));
  if (/[?&]v=/.test(url)) {
    return url.replace(/([?&])v=[^&]*/, `$1v=${bustStr}`);
  }

  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${bustStr}`;
};

/**
 * Large data URLs often fail in <img src>; convert them to blob: URLs for display.
 */
export const resolveMediaUrlAsync = async (value) => {
  const url = resolveMediaUrl(value);
  if (!url) return null;
  if (!url.startsWith('data:')) return url;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
};
