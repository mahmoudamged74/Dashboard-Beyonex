import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "../../utils/toast";
import {
  MdDashboard,
  MdHome,
  MdInfo,
  MdDesignServices,
  MdSettings,
  MdLogout,
  MdLanguage,
  MdKeyboardDoubleArrowLeft,
  MdRecommend,
  MdHandshake,
  MdPerson,
  MdSecurity,
  MdMessage,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";
import {
  useAppDispatch,
  useAppSelector,
  useCachedFetch,
  usePermission,
  usePolling,
  useSiteFavicon,
  useTheme,
} from "../../hooks";
import { logoutUser } from "../../redux/actions/authActions";
import { fetchSettings } from "../../redux/actions/settingsActions";
import { fetchMessages } from "../../redux/actions/messagesActions";
import { selectSettings } from "../../redux/reducers/settingsReducer";
import { selectMessages } from "../../redux/reducers/messagesReducer";
import { POLL_INTERVAL_MS } from "../../redux/cache";
import { toggleAppLanguage } from "../../i18n";
import styles from "./Sidebar.module.css";

const isMessageUnread = (msg) => {
  const flag = msg?.read ?? msg?.is_read ?? msg?.isRead;
  return !(flag === true || flag === 1 || flag === "1" || flag === "true");
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { can } = usePermission();
  const canViewMessages = can("messages.view");

  useCachedFetch(fetchSettings, selectSettings);
  usePolling(fetchMessages, POLL_INTERVAL_MS, canViewMessages);

  const messagesState = useAppSelector(selectMessages);
  const unreadCount = useMemo(() => {
    if (!canViewMessages) return 0;
    const inbox = messagesState.byPage?.[1] || messagesState.data;
    const list = inbox?.messages;
    if (!Array.isArray(list) || list.length === 0) return 0;
    return list.filter(isMessageUnread).length;
  }, [canViewMessages, messagesState]);

  const faviconSrc = useSiteFavicon();
  const { isDark, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    toggleAppLanguage();
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
    } finally {
      toast.success(t("logout_success"));
      navigate("/login");
    }
  };

  // Each item has an optional `permKey` — if present, the item is hidden when permission is absent
  const navItems = [
    {
      path: "/",
      icon: <MdDashboard />,
      label: "dashboard",
      permKey: "dashboard.view",
    },
    {
      path: "/home",
      icon: <MdHome />,
      label: "home",
      permKey: "hero_section.view",
    },
    {
      path: "/about",
      icon: <MdInfo />,
      label: "about",
      permKey: "about_page.view",
    },
    {
      path: "/services",
      icon: <MdDesignServices />,
      label: "services",
      permKey: "services.view",
    },
    {
      path: "/why-us",
      icon: <MdRecommend />,
      label: "why_us",
      permKey: "why_us.view",
    },
    {
      path: "/partners",
      icon: <MdHandshake />,
      label: "partners",
      permKey: "partners.view",
    },
    {
      path: "/roles",
      icon: <MdSecurity />,
      label: "roles_manager",
      permKey: "roles.view",
    },
    {
      path: "/admins",
      icon: <MdPerson />,
      label: "admins_manager",
      permKey: "admins.view",
    },
    {
      path: "/messages",
      icon: <MdMessage />,
      label: "messages_manager",
      permKey: "messages.view",
      badge: unreadCount,
    },
  ];

  return (
    <aside className={`${styles.sidebar} ${!isOpen ? styles.closed : ""}`}>
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          {faviconSrc && (
            <img
              src={faviconSrc}
              alt=""
              className={styles.siteIcon}
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
          )}
        </div>

        <button onClick={toggleSidebar} className={styles.closeBtn}>
          <MdKeyboardDoubleArrowLeft className={styles.closeIcon} />
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems
          .filter((item) => !item.permKey || can(item.permKey))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.navLabel}>{t(item.label)}</span>
              {item.badge > 0 ? (
                <span
                  key={item.badge}
                  className={styles.navBadge}
                  aria-label={t("dashboard_page.stat_unread", {
                    count: item.badge,
                  })}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </NavLink>
          ))}

        {/* Settings — visible only if user has settings.view */}
        {can("settings.view") && (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.icon}>
              <MdSettings />
            </span>
            <span className={styles.navLabel}>{t("settings")}</span>
          </NavLink>
        )}
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerActions}>
          {can("profile.view") && (
            <NavLink
              to="/profile"
              title={t("profile.title")}
              aria-label={t("profile.title")}
              className={({ isActive }) =>
                `${styles.footerAction} ${isActive ? styles.footerActionActive : ""}`
              }
            >
              <MdPerson size={20} />
            </NavLink>
          )}

          <button
            type="button"
            onClick={toggleLanguage}
            className={styles.footerAction}
            title={t("language")}
            aria-label={t("language")}
          >
            <MdLanguage size={20} />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className={styles.footerAction}
            title={isDark ? t("theme_light") : t("theme_dark")}
            aria-label={isDark ? t("theme_light") : t("theme_dark")}
          >
            {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className={`${styles.footerAction} ${styles.footerActionLogout}`}
            title={t("logout")}
            aria-label={t("logout")}
          >
            <MdLogout size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
