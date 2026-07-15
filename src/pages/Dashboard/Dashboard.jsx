import React, { useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MdDesignServices,
  MdArrowForward,
  MdEmail,
  MdGroups,
  MdShield,
} from 'react-icons/md';
import { useAppDispatch, useAppSelector, useCachedFetch, usePolling, usePermission, useAppReady } from '../../hooks';
import { fetchProfile } from '../../redux/actions/profileActions';
import { fetchSettings } from '../../redux/actions/settingsActions';
import { fetchMessages } from '../../redux/actions/messagesActions';
import { fetchServices } from '../../redux/actions/servicesActions';
import { fetchAdmins } from '../../redux/actions/adminsActions';
import { fetchRoles } from '../../redux/actions/rolesActions';
import { selectProfile } from '../../redux/reducers/profileReducer';
import { selectSettings } from '../../redux/reducers/settingsReducer';
import { selectMessages } from '../../redux/reducers/messagesReducer';
import { selectServices } from '../../redux/reducers/servicesReducer';
import { selectAdmins } from '../../redux/reducers/adminsReducer';
import { selectRoles } from '../../redux/reducers/rolesReducer';
import { getAppLanguage } from '../../i18n';
import { POLL_INTERVAL_MS } from '../../redux/cache';
import styles from './Dashboard.module.css';

const StatCard = ({ icon: Icon, label, value, hint, accent }) => (
  <div className={`${styles.statCard} ${accent ? styles[`statCard_${accent}`] : ''}`}>
    <div className={styles.statStart}>
      <div className={styles.statIcon}>
        <Icon size={20} />
      </div>
      <div className={styles.statText}>
        <span className={styles.statLabel}>{label}</span>
        {hint && <span className={styles.statHint}>{hint}</span>}
      </div>
    </div>
    <span className={styles.statValue}>{value}</span>
  </div>
);

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { can } = usePermission();
  const dispatch = useAppDispatch();
  const isAr = getAppLanguage(i18n.language) === 'ar';

  const { data: profile, isLoading: profileLoading } = useCachedFetch(fetchProfile, selectProfile);
  const { data: settings } = useCachedFetch(fetchSettings, selectSettings);
  const messagesState = useAppSelector(selectMessages);
  const servicesState = useAppSelector(selectServices);
  const adminsState = useAppSelector(selectAdmins);
  const rolesState = useAppSelector(selectRoles);

  const services = can('services.view') ? servicesState.items : null;
  const adminsData = can('admins.view') ? adminsState.data : null;
  const rolesData = can('roles.view') ? rolesState.data : null;

  const messagesData = messagesState.byPage[1] || messagesState.data;

  useEffect(() => {
    if (can('services.view')) dispatch(fetchServices());
  }, [dispatch, can]);

  useEffect(() => {
    if (can('admins.view')) dispatch(fetchAdmins());
  }, [dispatch, can]);

  useEffect(() => {
    if (can('roles.view')) dispatch(fetchRoles());
  }, [dispatch, can]);

  usePolling(fetchMessages, POLL_INTERVAL_MS, can('messages.view'));

  const siteName = useMemo(() => {
    const name = settings?.site_name;
    if (!name) return t('welcome');
    if (typeof name === 'object') return (isAr ? name.ar : name.en) || name.ar || name.en || t('welcome');
    return name;
  }, [settings, isAr, t]);

  const roleName = useMemo(() => {
    const role = profile?.role;
    if (!role) return null;
    return (isAr ? role.name_ar : role.name_en) || role.name;
  }, [profile, isAr]);

  const stats = useMemo(() => {
    const items = [];

    if (can('messages.view') && messagesData) {
      const total = messagesData.pagination?.total ?? messagesData.messages?.length ?? 0;
      const unread = messagesData.messages?.filter((m) => !m.read).length ?? 0;
      items.push({
        key: 'messages',
        icon: MdEmail,
        label: t('dashboard_page.stat_messages'),
        value: total,
        hint: unread > 0 ? t('dashboard_page.stat_unread', { count: unread }) : t('dashboard_page.no_unread'),
        accent: unread > 0 ? 'warning' : 'default',
      });
    }

    if (can('services.view') && services) {
      items.push({
        key: 'services',
        icon: MdDesignServices,
        label: t('dashboard_page.stat_services'),
        value: services.length,
        hint: t('dashboard_page.stat_active'),
        accent: 'primary',
      });
    }

    if (can('admins.view') && adminsData) {
      items.push({
        key: 'admins',
        icon: MdGroups,
        label: t('dashboard_page.stat_admins'),
        value: adminsData.admins?.length ?? 0,
        hint: t('dashboard_page.stat_active'),
        accent: 'primary',
      });
    }

    if (can('roles.view') && rolesData) {
      items.push({
        key: 'roles',
        icon: MdShield,
        label: t('dashboard_page.stat_roles'),
        value: rolesData.roles?.length ?? 0,
        hint: t('dashboard_page.stat_active'),
        accent: 'primary',
      });
    }

    return items;
  }, [can, messagesData, services, adminsData, rolesData, t]);

  const recentMessages = useMemo(() => {
    if (!can('messages.view') || !messagesData?.messages) return [];
    return messagesData.messages.slice(0, 4);
  }, [can, messagesData]);

  useAppReady(!profileLoading);

  if (profileLoading) {
    return null;
  }

  const greetingName = profile?.name?.trim();
  const greeting = greetingName
    ? t('dashboard_page.greeting', { name: greetingName })
    : t('dashboard_page.greeting_guest');

  return (
    <div className={styles.page} dir={isAr ? 'rtl' : 'ltr'}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <h1 className={styles.pageTitle}>{t('dashboard')}</h1>
          <p className={styles.pageSubtitle}>{t('dashboard_page.subtitle')}</p>
        </div>
      </header>

      <section className={styles.welcomeCard} aria-label={greeting}>
        <div className={styles.welcomeGlow} aria-hidden="true" />
        <div className={styles.welcomePattern} aria-hidden="true" />
        <div className={styles.welcomeBody}>
          <div className={styles.welcomeText}>
            <p className={styles.greeting}>{greeting}</p>
            <h2 className={styles.welcomeTitle}>{siteName}</h2>
            <p className={styles.welcomeDesc}>{t('software_company')}</p>
          </div>
          {roleName && (
            <span className={styles.roleBadge}>
              <MdShield size={15} />
              {roleName}
            </span>
          )}
        </div>
      </section>

      {stats.length > 0 && (
        <section className={styles.statsSection} aria-label={t('dashboard_page.overview')}>
          <h2 className={styles.sectionTitle}>{t('dashboard_page.overview')}</h2>
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <StatCard
                key={stat.key}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                hint={stat.hint}
                accent={stat.accent}
              />
            ))}
          </div>
        </section>
      )}

      {recentMessages.length > 0 && (
        <section className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <h2 className={styles.sectionTitle}>{t('dashboard_page.recent_messages')}</h2>
            <NavLink to="/messages" className={styles.viewAllLink}>
              {t('dashboard_page.view_all')}
              <MdArrowForward size={16} />
            </NavLink>
          </div>
          <div className={styles.recentGrid}>
            {recentMessages.map((msg) => (
              <NavLink
                key={msg.id}
                to="/messages"
                className={`${styles.recentCard} ${!msg.read ? styles.recentCardUnread : ''}`}
              >
                <div className={styles.recentCardTop}>
                  <span className={styles.recentCardIcon} aria-hidden="true">
                    <MdEmail size={18} />
                  </span>
                  {!msg.read && (
                    <span className={styles.unreadDot} title={t('dashboard_page.stat_unread', { count: 1 })} />
                  )}
                </div>
                <span className={styles.recentName}>{msg.name || msg.email}</span>
                <span className={styles.recentSubject}>
                  {msg.subject || msg.message?.slice(0, 60)}
                </span>
              </NavLink>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
