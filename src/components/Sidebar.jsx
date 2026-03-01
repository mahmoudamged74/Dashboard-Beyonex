import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  MdDashboard,
  MdHome,
  MdInfo,
  MdDesignServices,
  MdContactMail,
  MdSettings,
  MdLogout,
  MdLanguage,
  MdKeyboardDoubleArrowLeft,
  MdRecommend,
  MdViewAgenda,
  MdPerson,
  MdSecurity,
  MdMessage,
} from 'react-icons/md';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission, clearPermissions } = useAuth();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('admin/logout');
    } catch {
    } finally {
      localStorage.removeItem('token');
      clearPermissions();
      toast.success(t('logout_success'));
      navigate('/login');
    }
  };

  // Each item has an optional `permKey` — if present, the item is hidden when permission is absent
  const navItems = [
    { path: '/',         icon: <MdDashboard />, label: 'dashboard',       permKey: 'dashboard.view' },
    { path: '/home',     icon: <MdHome />,      label: 'home',            permKey: 'hero_section.view' },
    { path: '/about',    icon: <MdInfo />,      label: 'about',           permKey: 'about_page.view' },
    { path: '/services', icon: <MdDesignServices />, label: 'services',   permKey: 'services.view' },
    { path: '/why-us',   icon: <MdRecommend />, label: 'why_us',          permKey: 'why_us.view' },
    { path: '/footer',   icon: <MdViewAgenda />, label: 'footer_manager', permKey: 'settings.view' },
    // { path: '/contact',  icon: <MdContactMail />, label: 'contact',       permKey: null },
    { path: '/roles',    icon: <MdSecurity />,  label: 'roles_manager',   permKey: 'roles.view' },
    { path: '/admins',   icon: <MdPerson />,    label: 'admins_manager',  permKey: 'admins.view' },
    { path: '/messages', icon: <MdMessage />,   label: 'messages_manager', permKey: 'messages.view' },
  ];

  return (
    <aside className={`${styles.sidebar} ${!isOpen ? styles.closed : ''}`}>
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <img src="/assets/3.png" alt="Logo" className={styles.logo} />
          <span className={styles.brandName}>BEYONEX IT</span>
        </div>

        <button onClick={toggleSidebar} className={styles.closeBtn}>
          <MdKeyboardDoubleArrowLeft className={styles.closeIcon} />
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems
          .filter(item => !item.permKey || hasPermission(item.permKey))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{t(item.label)}</span>
            </NavLink>
          ))}

        {/* Settings — visible only if user has settings.view */}
        {hasPermission('settings.view') && (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}><MdSettings /></span>
            <span>{t('settings')}</span>
          </NavLink>
        )}
      </nav>

      <div className={styles.footer}>
        {/* Profile — visible only if user has profile.view */}
        {hasPermission('profile.view') && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}><MdPerson /></span>
            <span>{t('profile.title')}</span>
          </NavLink>
        )}

        {/* Language toggle */}
        <button onClick={toggleLanguage} className={styles.langBtn}>
          <MdLanguage />
          <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Logout */}
        <button onClick={handleLogout} className={`${styles.langBtn} ${styles.logoutBtn}`}>
          <MdLogout />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
