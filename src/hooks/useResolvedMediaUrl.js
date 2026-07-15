import { useEffect, useState } from 'react';
import { resolveMediaUrl, resolveMediaUrlAsync, withCacheBust } from '../utils/mediaUrl';

/**
 * Resolves API media values for <img src>, including oversized base64 data URLs.
 * Optional cacheBust forces browser reload when the same path is reused after upload.
 */
export function useResolvedMediaUrl(value, cacheBust = null) {
  const [src, setSrc] = useState(() => {
    const sync = resolveMediaUrl(value);
    if (!sync || sync.startsWith('data:')) return null;
    return withCacheBust(sync, cacheBust);
  });

  useEffect(() => {
    let blobUrl = null;
    let active = true;

    const sync = resolveMediaUrl(value);
    if (!sync) {
      setSrc(null);
      return undefined;
    }

    if (!sync.startsWith('data:')) {
      setSrc(withCacheBust(sync, cacheBust));
      return undefined;
    }

    setSrc(null);
    resolveMediaUrlAsync(value).then((resolved) => {
      if (!active) return;
      if (resolved?.startsWith('blob:')) blobUrl = resolved;
      setSrc(resolved);
    });

    return () => {
      active = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [value, cacheBust]);

  return src;
}
