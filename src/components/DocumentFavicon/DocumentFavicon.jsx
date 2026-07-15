import { useSiteFavicon } from '../../hooks/useSiteFavicon';

const DocumentFavicon = () => {
  useSiteFavicon({ applyToDocument: true });
  return null;
};

export default DocumentFavicon;
