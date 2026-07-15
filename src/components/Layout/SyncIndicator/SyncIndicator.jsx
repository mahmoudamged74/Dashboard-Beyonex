import { useAppSelector } from '../../../hooks/useRedux';
import { selectIsRefreshing } from '../../../redux/selectors/syncSelector';
import styles from './SyncIndicator.module.css';

export default function SyncIndicator() {
  const isRefreshing = useAppSelector(selectIsRefreshing);

  return (
    <div
      className={`${styles.bar} ${isRefreshing ? styles.active : ''}`}
      role="progressbar"
      aria-hidden={!isRefreshing}
      aria-valuetext={isRefreshing ? 'Syncing data' : undefined}
    />
  );
}
