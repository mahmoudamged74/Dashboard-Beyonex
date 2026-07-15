import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MdMenu } from 'react-icons/md';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';
import ScrollToTop from './ScrollToTop';
import PageTransition from './PageTransition/PageTransition';
import SyncIndicator from './SyncIndicator/SyncIndicator';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const location = useLocation();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`${styles.layout} ${!isSidebarOpen ? styles.collapsed : ''}`}>
      <SyncIndicator />
      <ScrollToTop />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className={styles.mainContent}>
        {!isSidebarOpen && (
          <button className={styles.menuBtn} onClick={toggleSidebar}>
            <MdMenu />
          </button>
        )}
        <PageTransition />
      </main>

      {/* Overlay removed as per user request to interact with content */}
    </div>
  );
};

export default Layout;
