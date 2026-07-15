import { useEffect, useCallback } from 'react';
import { REQUEST_STATUS } from '../redux/types';
import { useAppDispatch, useAppSelector } from './useRedux';
import { sliceHasData } from '../redux/cache';

/**
 * Fetch once on mount — skips if Redux cache is fresh (via thunk condition).
 */
export const useCachedFetch = (fetchAction, selector, deps = []) => {
  const dispatch = useAppDispatch();
  const slice = useAppSelector(selector);

  useEffect(() => {
    dispatch(fetchAction());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, ...deps]);

  const isLoading = slice.status === REQUEST_STATUS.LOADING && !sliceHasData(slice);
  const isError = slice.status === REQUEST_STATUS.FAILED && !sliceHasData(slice);

  return {
    ...slice,
    isLoading,
    isError,
    isRefreshing: slice.refreshing,
    refetch: useCallback(
      (forceArg) => dispatch(fetchAction(forceArg ?? { force: true })),
      [dispatch, fetchAction]
    ),
  };
};
