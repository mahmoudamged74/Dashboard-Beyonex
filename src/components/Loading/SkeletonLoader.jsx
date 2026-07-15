import React from 'react';
import styles from './Loading.module.css';

const Skeleton = ({ width = '100%', height = '16px', style = {} }) => (
  <div className={styles.skeleton} style={{ width, height, ...style }} aria-hidden="true" />
);

export const CardGridSkeleton = ({ count = 6 }) => (
  <div className={styles.cardGrid} aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.cardSkeleton}>
        <Skeleton height="120px" />
        <Skeleton height="18px" width="70%" />
        <Skeleton height="14px" width="90%" />
        <Skeleton height="14px" width="60%" />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <Skeleton height="32px" width="80px" />
          <Skeleton height="32px" width="80px" />
        </div>
      </div>
    ))}
  </div>
);

export const FormSkeleton = () => (
  <div className={styles.formSkeleton} aria-hidden="true">
    <Skeleton height="200px" />
    <div className={styles.formRow}>
      <Skeleton height="42px" />
      <Skeleton height="42px" />
    </div>
    <div className={styles.formRow}>
      <Skeleton height="42px" />
      <Skeleton height="42px" />
    </div>
    <Skeleton height="100px" />
    <Skeleton height="44px" width="160px" />
  </div>
);

export const SectionSkeleton = ({ count = 3 }) => (
  <div aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.sectionSkeleton}>
        <Skeleton height="24px" width="40%" style={{ marginBottom: '1rem' }} />
        <Skeleton height="14px" width="80%" style={{ marginBottom: '0.5rem' }} />
        <Skeleton height="14px" width="65%" style={{ marginBottom: '1rem' }} />
        <div className={styles.formRow}>
          <Skeleton height="42px" />
          <Skeleton height="42px" />
        </div>
      </div>
    ))}
  </div>
);
