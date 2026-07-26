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

const SUBJECT_AR_TO_KEY = {
  'استفسار عام': 'general_inquiry',
  'تطوير المواقع': 'web_development',
  'تطبيقات الموبايل': 'mobile_applications',
  'أنظمة ERP': 'erp_systems',
  'دعم فني': 'technical_support',
  'الدعم الفني': 'technical_support',
  توظيف: 'hiring',
  أخرى: 'other',
};

const translateMessageSubject = (subject, t) => {
  if (!subject) return '—';

  const normalized = SUBJECT_AR_TO_KEY[subject] || subject;
  const key = `messages_page.subjects.${normalized}`;
  const translated = t(key, { defaultValue: '' });
  if (translated) return translated;

  const legacy = t(normalized, { defaultValue: '' });
  if (legacy) return legacy;

  return subject;
};

const StatCard = ({ icon: Icon, label, value, hint, accent }) => (
  <article className={`${styles.statCard} ${accent ? styles[`statCard_${accent}`] : ''}`}>
    <div className={styles.statRow}>
      <div className={styles.statLead}>
        <div className={styles.statIcon} aria-hidden="true">
          <Icon size={18} />
        </div>
        <div className={styles.statCopy}>
          <span className={styles.statLabel}>{label}</span>
          {hint ? <span className={styles.statHint}>{hint}</span> : null}
        </div>
      </div>
      <p className={styles.statValue}>{value}</p>
    </div>
  </article>
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

  const todayParts = useMemo(() => {
    const now = new Date();
    const locale = isAr ? 'ar-EG-u-nu-latn' : 'en-US';

    try {
      return {
        weekday: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(now),
        day: new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(now),
        month: new Intl.DateTimeFormat(locale, { month: 'long' }).format(now),
        year: new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(now),
        iso: now.toISOString().slice(0, 10),
        full: new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(now),
      };
    } catch {
      return {
        weekday: '',
        day: String(now.getDate()),
        month: '',
        year: String(now.getFullYear()),
        iso: now.toISOString().slice(0, 10),
        full: now.toLocaleDateString(),
      };
    }
  }, [isAr]);

  const stats = useMemo(() => {
    const items = [];

    if (can('messages.view') && messagesData) {
      const total = messagesData.pagination?.total ?? messagesData.messages?.length ?? 0;
      const unread = messagesData.messages?.filter((m) => {
        const flag = m?.read ?? m?.is_read ?? m?.isRead;
        return !(flag === true || flag === 1 || flag === '1' || flag === 'true');
      }).length ?? 0;
      items.push({
        key: 'messages',
        icon: MdEmail,
        label: t('dashboard_page.stat_messages'),
        value: total,
        hint: unread > 0 ? t('dashboard_page.stat_unread', { count: unread }) : t('dashboard_page.no_unread'),
        accent: unread > 0 ? 'danger' : 'default',
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

  const unreadMessages = useMemo(() => {
    if (!can('messages.view') || !messagesData?.messages?.length) return [];

    const isUnread = (msg) => {
      const flag = msg?.read ?? msg?.is_read ?? msg?.isRead;
      if (flag === true || flag === 1 || flag === '1' || flag === 'true') return false;
      return true;
    };

    return [...messagesData.messages]
      .filter(isUnread)
      .sort((a, b) => {
        const aTime = new Date(a.created_at || a.createdAt || 0).getTime();
        const bTime = new Date(b.created_at || b.createdAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 6);
  }, [can, messagesData]);

  const showMessagesSection = can('messages.view');

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
      <section className={styles.heroCard} aria-label={t('dashboard')}>
        <aside className={styles.dateWatermark} aria-label={t('dashboard_page.today')}>
          <span className={styles.dateWeekday}>{todayParts.weekday}</span>
          <span className={styles.dateDay}>{todayParts.day}</span>
          <span className={styles.dateMeta}>
            {todayParts.month}
            <span className={styles.dateYear}>{todayParts.year}</span>
          </span>
          <time className={styles.dateSrOnly} dateTime={todayParts.iso}>
            {todayParts.full}
          </time>
        </aside>

        <div className={styles.heroTop}>
          <span className={styles.heroEyebrow}>{t('dashboard')}</span>
          <span className={styles.heroTopRule} aria-hidden="true" />
        </div>

        <div className={styles.heroBody}>
          <div className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>{greeting}</h1>
            <p className={styles.heroSite}>{siteName}</p>
            <p className={styles.heroSubtitle}>{t('dashboard_page.subtitle')}</p>
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className={styles.statsSection} aria-label={t('dashboard_page.overview')}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionTitleBar} aria-hidden="true" />
              {t('dashboard_page.overview')}
            </h2>
            <span className={styles.sectionHeadRule} aria-hidden="true" />
          </div>
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

      {showMessagesSection ? (
        <section className={styles.recentSection} aria-label={t('dashboard_page.unread_messages')}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionTitleBar} aria-hidden="true" />
              {t('dashboard_page.unread_messages')}
            </h2>
            {unreadMessages.length > 0 ? (
              <span
                className={styles.unreadCount}
                aria-label={t('dashboard_page.stat_unread', { count: unreadMessages.length })}
              >
                {unreadMessages.length}
              </span>
            ) : null}
            <span className={styles.sectionHeadRule} aria-hidden="true" />
            <NavLink to="/messages" className={styles.viewAllLink}>
              {t('dashboard_page.view_all')}
              <MdArrowForward size={15} />
            </NavLink>
          </div>

          {unreadMessages.length > 0 ? (
            <div className={styles.unreadList}>
              {unreadMessages.map((msg) => (
                <NavLink
                  key={msg.id}
                  to="/messages"
                  className={styles.unreadCard}
                >
                  <div className={styles.unreadCardMain}>
                    <span className={styles.unreadDot} aria-hidden="true" />
                    <div className={styles.unreadCardBody}>
                      <span className={styles.unreadCardName}>
                        {msg.name || msg.full_name || msg.email}
                      </span>
                      <p className={styles.unreadCardSubject}>
                        {translateMessageSubject(msg.subject, t)}
                      </p>
                      {msg.message ? (
                        <p className={styles.unreadCardPreview}>
                          {msg.message.replace(/\s+/g, ' ').trim()}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span className={styles.unreadCardAction} aria-hidden="true">
                    <MdArrowForward size={16} />
                  </span>
                </NavLink>
              ))}
            </div>
          ) : (
            <p className={styles.emptyUnread}>{t('dashboard_page.no_unread')}</p>
          )}
        </section>
      ) : null}
    </div>
  );
};

export default Dashboard;
