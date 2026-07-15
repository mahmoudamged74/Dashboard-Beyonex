import { useEffect, useRef } from 'react';
import { useAppDispatch } from './useRedux';

const HIDDEN_REFETCH_MS = 30_000;

/**
 * Soft-sync a resource while the tab is visible.
 * Uses { soft: true } so cache TTL is bypassed but state updates only when data changes.
 */
export const usePolling = (fetchAction, intervalMs = 0, enabled = true) => {
  const dispatch = useAppDispatch();
  const hiddenAtRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    dispatch(fetchAction());

    const softRefetch = () => {
      if (document.visibilityState === 'visible') {
        dispatch(fetchAction({ soft: true }));
      }
    };

    const intervalId = intervalMs > 0 ? setInterval(softRefetch, intervalMs) : null;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now();
        return;
      }

      const hiddenAt = hiddenAtRef.current;
      hiddenAtRef.current = null;

      if (hiddenAt && Date.now() - hiddenAt >= HIDDEN_REFETCH_MS) {
        softRefetch();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [dispatch, fetchAction, intervalMs, enabled]);
};
