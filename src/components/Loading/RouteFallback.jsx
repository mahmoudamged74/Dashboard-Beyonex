import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./Loading.module.css";

const RouteFallback = () => {
  const { t } = useTranslation();
  const text = t("loading_page");

  return (
    <div
      className={`${styles.loader} ${styles.section}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={text}
    >
      <div className={styles.mark} aria-hidden="true">
        <span className={styles.ring} />
        <span className={styles.ringDelay} />
        <span className={styles.core}>
          <span className={styles.coreLetter}>B</span>
        </span>
      </div>

      <div className={styles.indicator} aria-hidden="true">
        <div className={styles.track}>
          <span className={styles.bar} />
        </div>
        <div className={styles.dots}>
          <span />
          <span />
          <span />
        </div>
      </div>

      <span className={styles.label}>{text}</span>
    </div>
  );
};

export default RouteFallback;
