import { useEffect } from 'react';
import { signalAppReady } from '../utils/appShell';

/**
 * Hides the HTML app shell once the page is ready to display.
 * Pass `ready=false` while blocking loaders run so only one splash is shown.
 */
export function useAppReady(ready = true) {
  useEffect(() => {
    if (ready) signalAppReady();
  }, [ready]);
}
