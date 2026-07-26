import { REQUEST_STATUS } from './types';

/** Default cache TTL — 5 minutes */
const CACHE_TTL = 5 * 60 * 1000;

/** Shorter TTL for polled resources on dashboard */
const POLL_CACHE_TTL = 30 * 1000;

/** Background sync interval for inbox / dashboard (default 10s). Override with VITE_API_POLLING_MS. */
export const POLL_INTERVAL_MS = Number(import.meta.env.VITE_API_POLLING_MS) || 10_000;

export const isSamePayload = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  return JSON.stringify(a) === JSON.stringify(b);
};

const parseFetchArg = (arg) => {
  if (typeof arg === 'object' && arg !== null) {
    return {
      force: Boolean(arg.force),
      soft: Boolean(arg.soft),
    };
  }
  return { force: false, soft: false };
};

const isSliceBusy = (slice) =>
  slice?.status === REQUEST_STATUS.LOADING || slice?.refreshing;

const isCacheFresh = (lastUpdated, ttl = CACHE_TTL) =>
  Boolean(lastUpdated && Date.now() - lastUpdated < ttl);

export const sliceHasData = (slice) => {
  if (!slice) return false;
  if (slice.data != null) return true;
  if (Array.isArray(slice.items)) return slice.status === REQUEST_STATUS.SUCCEEDED;
  if (slice.byPage && Object.keys(slice.byPage).length > 0) return true;
  return false;
};

/**
 * Skip duplicate in-flight or fresh cached fetches.
 * Pass { force: true } to bypass cache (polling / manual refresh).
 */
export const createFetchCondition = (selectSlice, ttl = CACHE_TTL) => (arg, { getState }) => {
  const { force, soft } = parseFetchArg(arg);
  if (force || soft) {
    const slice = selectSlice(getState());
    if (isSliceBusy(slice)) return false;
    return true;
  }

  const slice = selectSlice(getState());
  if (!slice) return true;
  if (isSliceBusy(slice)) return false;
  if (sliceHasData(slice) && isCacheFresh(slice.lastUpdated, ttl)) return false;

  return true;
};

export const createMessagesFetchCondition = (arg, { getState }) => {
  const { page, force, soft } = parseMessagesArg(arg);
  if (force || soft) {
    const slice = getState().messages;
    if (isSliceBusy(slice)) return false;
    return true;
  }

  const slice = getState().messages;
  if (isSliceBusy(slice)) return false;
  if (slice.byPage[page] && isCacheFresh(slice.lastUpdated, POLL_CACHE_TTL)) return false;

  return true;
};

export const parseMessagesArg = (arg) => {
  if (typeof arg === 'object' && arg !== null) {
    return {
      page: arg.page ?? 1,
      force: Boolean(arg.force),
      soft: Boolean(arg.soft),
    };
  }
  return { page: arg ?? 1, force: false, soft: false };
};

export const isMessagesPayloadUnchanged = (state, payload) => {
  const existing = state.byPage[payload.page];
  if (!existing) return false;

  return isSamePayload(
    { messages: existing.messages, pagination: existing.pagination },
    { messages: payload.messages, pagination: payload.pagination },
  );
};
