import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSiteFavicon } from '../../hooks';
import styles from './Loading.module.css';

const RouteFallback = () => {
  const { t } = useTranslation();
  const faviconSrc = useSiteFavicon();

  return (
    <div className={styles.routeFallback} role="status" aria-live="polite">
      {faviconSrc && (
        <img
          src={faviconSrc}
          alt=""
          className={styles.routeLogo}
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
      )}
      <div className={styles.spinnerRing} aria-hidden="true" />
      <p className={styles.loaderText}>
        {t('loading_page')}
        <span className={styles.loaderDots} aria-hidden="true">
          <span /><span /><span />
        </span>
      </p>
    </div>
  );
};

export default RouteFallback;
