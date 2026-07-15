import { Outlet, useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';

export default function PageTransition() {
  const location = useLocation();

  return (
    <div key={location.pathname} className={styles.pageWrap}>
      <Outlet />
    </div>
  );
}
