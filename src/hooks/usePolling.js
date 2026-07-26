import { useEffect, useRef } from 'react';
import { useAppDispatch } from './useRedux';

/**
 * Soft-sync a resource while the tab is visible.
 * Uses { soft: true } so cache TTL is bypassed but state updates only when data changes.
 */
export const usePolling = (fetchAction, intervalMs = 0, enabled = true) => {
  const dispatch = useAppDispatch();
  const fetchActionRef = useRef(fetchAction);
  fetchActionRef.current = fetchAction;

  useEffect(() => {
    if (!enabled) return undefined;

    const softRefetch = () => {
      if (document.visibilityState !== 'visible') return;
      dispatch(fetchActionRef.current({ soft: true }));
    };

    // Soft on mount so stale cache never blocks the first live sync.
    softRefetch();

    const intervalId = intervalMs > 0 ? setInterval(softRefetch, intervalMs) : null;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        softRefetch();
      }
    };

    const onFocus = () => softRefetch();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, [dispatch, intervalMs, enabled]);
};
