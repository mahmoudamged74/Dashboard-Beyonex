import React, { useEffect, useRef, useState } from 'react';
import { useResolvedMediaUrl } from '../../hooks';

/**
 * Renders an API media path/URL in <img>, with lazy loading and optional cache busting after uploads.
 */
const MediaImage = ({
  value,
  cacheBust,
  alt = '',
  className,
  style,
  fallback,
  onError,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  fetchpriority,
  eager = false,
  ...rest
}) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(eager);

  useEffect(() => {
    if (eager) return undefined;

    const node = containerRef.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager]);

  const resolved = useResolvedMediaUrl(isVisible ? value : null, cacheBust);
  const src = resolved || (isVisible ? fallback : null);
  const priority = fetchpriority ?? fetchPriority ?? (eager ? 'high' : 'auto');

  return (
    <img
      ref={containerRef}
      src={src || undefined}
      alt={alt}
      className={className}
      style={style}
      loading={eager ? 'eager' : loading}
      decoding={decoding}
      fetchpriority={priority}
      onError={onError}
      {...rest}
    />
  );
};

export default MediaImage;
