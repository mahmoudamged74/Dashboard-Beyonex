import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Loading.module.css';

const PageLoader = ({ message, compact = false, size = 'default' }) => {
  const { t } = useTranslation();

  return (
    <div
      className={`${styles.pageLoader} ${compact ? styles.pageLoaderCompact : ''}`}
      role="status"
      aria-live="polite"
      aria-label={message || t('loading')}
    >
      <div
        className={`${styles.spinnerRing} ${size === 'small' ? styles.spinnerSmall : ''}`}
        aria-hidden="true"
      />
      <p className={styles.loaderText}>
        {message || t('loading')}
        <span className={styles.loaderDots} aria-hidden="true">
          <span /><span /><span />
        </span>
      </p>
    </div>
  );
};

export default PageLoader;
