let initialLoadPending = true;
let readySignaled = false;

export function isInitialLoad() {
  return initialLoadPending;
}

export function signalAppReady() {
  if (readySignaled) return;
  readySignaled = true;
  initialLoadPending = false;
  window.dispatchEvent(new Event('dashboard:ready'));
}
