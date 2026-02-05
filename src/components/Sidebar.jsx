import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MdDashboard, 
  MdHome, 
  MdInfo, 
  MdDesignServices, 
  MdContactMail, 
  MdSettings, 
  MdLogout,
  MdLanguage,
  MdKeyboardDoubleArrowLeft
} from 'react-icons/md';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const navItems = [
    { path: '/', icon: <MdDashboard />, label: 'dashboard' },
    { path: '/home', icon: <MdHome />, label: 'home' },
    { path: '/about', icon: <MdInfo />, label: 'about' },
    { path: '/services', icon: <MdDesignServices />, label: 'services' },
    { path: '/contact', icon: <MdContactMail />, label: 'contact' },
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
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{t(item.label)}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        {/* Helper Link for Settings (example) */}
        <NavLink to="/settings" className={styles.navItem} style={{ marginBottom: '1rem' }}>
          <span className={styles.icon}><MdSettings /></span>
          <span>{t('settings')}</span>
        </NavLink>
        
        <button onClick={toggleLanguage} className={styles.langBtn}>
          <MdLanguage />
          <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
