import { useEffect, useState } from 'react';
import { useAppSelector } from './useRedux';
import { selectSettings } from '../redux/reducers/settingsReducer';
import { useResolvedMediaUrl } from './useResolvedMediaUrl';
import { applyDocumentFavicon, fetchPublicFavicon } from '../utils/siteFavicon';

export function useSiteFavicon({ applyToDocument = false } = {}) {
  const { data: settings, lastUpdated } = useAppSelector(selectSettings);
  const [publicFavicon, setPublicFavicon] = useState(undefined);

  const faviconValue = settings?.favicon ?? publicFavicon ?? null;
  const src = useResolvedMediaUrl(
    faviconValue,
    settings?.favicon ? lastUpdated : null
  );

  useEffect(() => {
    if (settings?.favicon) return undefined;

    let active = true;
    fetchPublicFavicon().then((favicon) => {
      if (active) setPublicFavicon(favicon ?? null);
    });

    return () => {
      active = false;
    };
  }, [settings?.favicon]);

  useEffect(() => {
    if (!applyToDocument || !src) return;
    applyDocumentFavicon(src);
  }, [applyToDocument, src]);

  return src;
}
