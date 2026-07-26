import React, { useMemo, useState, useEffect, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdHome,
  MdTimeline,
  MdEmojiEvents,
  MdDiamond,
  MdGroups,
} from 'react-icons/md';
import { useAppDispatch, useAppSelector, useAppReady } from '../../hooks';
import {
  fetchAboutData,
  updateAboutPage,
  aboutHeroFeatureAction,
  aboutMilestoneAction,
  aboutAchievementAction,
  aboutCoreValueAction,
  aboutTeamAction,
} from '../../redux/actions/aboutActions';
import { selectAbout, mergeAboutPage } from '../../redux/reducers/aboutReducer';
import { REQUEST_STATUS } from '../../redux/types';
import { getAppLanguage } from '../../i18n';
import toast, { getActionMessageKey } from '../../utils/toast';
import { SectionSkeleton } from '../../components/Loading';
import styles from './AboutManager.module.css';

const HeroSection = lazy(() => import('../../components/About/HeroSection/HeroSection'));
const JourneySection = lazy(() => import('../../components/About/JourneySection/JourneySection'));
const AchievementsSection = lazy(() => import('../../components/About/AchievementsSection/AchievementsSection'));
const CoreValuesSection = lazy(() => import('../../components/About/CoreValuesSection/CoreValuesSection'));
const TeamSection = lazy(() => import('../../components/About/TeamSection/TeamSection'));

const SECTIONS = [
  { id: 'hero', icon: MdHome, labelKey: 'about_page.tab_hero', descKey: 'about_page.tab_hero_desc', countKey: 'features' },
  { id: 'journey', icon: MdTimeline, labelKey: 'about_page.tab_journey', descKey: 'about_page.tab_journey_desc', countKey: 'milestones' },
  { id: 'achievements', icon: MdEmojiEvents, labelKey: 'about_page.tab_achievements', descKey: 'about_page.tab_achievements_desc', countKey: 'achievements' },
  { id: 'core_values', icon: MdDiamond, labelKey: 'about_page.tab_core_values', descKey: 'about_page.tab_core_values_desc', countKey: 'coreValues' },
  { id: 'team', icon: MdGroups, labelKey: 'about_page.tab_team', descKey: 'about_page.tab_team_desc', countKey: 'teamMembers' },
];

const formDataHasFile = (payload) => {
  if (!(payload instanceof FormData)) return false;
  return [...payload.entries()].some(([, value]) => value instanceof File);
};

const AboutManager = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isAr = getAppLanguage() === 'ar';
  const [activeTab, setActiveTab] = useState('hero');
  const [mediaRevision, setMediaRevision] = useState(0);

  const { data, status, lastUpdated } = useAppSelector(selectAbout);
  const isLoading = status === REQUEST_STATUS.LOADING && !data;
  const isError = status === REQUEST_STATUS.FAILED;

  useEffect(() => {
    dispatch(fetchAboutData());
  }, [dispatch]);

  const mediaVersion = `${lastUpdated}-${mediaRevision}`;

  const bumpMediaRevision = () => setMediaRevision((v) => v + 1);

  const refreshAbout = async (hasFile = false, savedAboutPage = null) => {
    if (hasFile) {
      bumpMediaRevision();
      if (savedAboutPage) {
        dispatch(mergeAboutPage(savedAboutPage));
      }
    }
    await dispatch(fetchAboutData({ force: true })).unwrap();
    if (hasFile && savedAboutPage) {
      dispatch(mergeAboutPage(savedAboutPage));
    }
  };

  const counts = useMemo(() => ({
    features: data?.heroFeatures?.length ?? 0,
    milestones: data?.milestones?.length ?? 0,
    achievements: data?.achievements?.length ?? 0,
    coreValues: data?.coreValues?.length ?? 0,
    teamMembers: data?.teamMembers?.length ?? 0,
  }), [data]);

  const handleAchievementAction = async (action, id = null, formData = null) => {
    try {
      await dispatch(aboutAchievementAction({ action, id, formData })).unwrap();
      toast.success(t(getActionMessageKey(action)));
      await refreshAbout(formDataHasFile(formData));
    } catch (err) {
      console.error(`Error during achievement ${action}:`, err);
      toast.error(t(getActionMessageKey(action, 'error')));
    }
  };

  const handleMilestoneAction = async (action, id = null, formData = null) => {
    try {
      await dispatch(aboutMilestoneAction({ action, id, formData })).unwrap();
      toast.success(t(getActionMessageKey(action)));
      await refreshAbout(formDataHasFile(formData));
    } catch (err) {
      console.error(`Error during milestone ${action}:`, err);
      toast.error(t(getActionMessageKey(action, 'error')));
    }
  };

  const handleAboutUpdate = async (newData) => {
    try {
      const result = await dispatch(updateAboutPage(newData)).unwrap();
      const aboutPage = result?.aboutPage ?? result?.data?.about_page ?? result?.data;
      const hadFile = formDataHasFile(newData);
      if (aboutPage && typeof aboutPage === 'object') {
        dispatch(mergeAboutPage(aboutPage));
      }
      await refreshAbout(hadFile, hadFile ? aboutPage : null);
      toast.success(t(getActionMessageKey('update')));
      return { ok: true, aboutPage };
    } catch (err) {
      console.error('Error updating about data:', err);
      toast.error(t(getActionMessageKey('update', 'error')));
      return { ok: false };
    }
  };

  const handleFeatureAction = async (action, id = null, formData = null) => {
    try {
      await dispatch(aboutHeroFeatureAction({ action, id, formData })).unwrap();
      toast.success(t(getActionMessageKey(action)));
      await refreshAbout(formDataHasFile(formData));
    } catch (err) {
      console.error(`Error during feature ${action}:`, err);
      toast.error(t(getActionMessageKey(action, 'error')));
    }
  };

  const handleCoreValueAction = async (action, id = null, formData = null) => {
    try {
      await dispatch(aboutCoreValueAction({ action, id, formData })).unwrap();
      toast.success(t(getActionMessageKey(action)));
      await refreshAbout(formDataHasFile(formData));
    } catch (err) {
      console.error(`Error during core value ${action}:`, err);
      toast.error(t(getActionMessageKey(action, 'error')));
    }
  };

  const handleTeamAction = async (action, id = null, formData = null) => {
    try {
      await dispatch(aboutTeamAction({ action, id, formData })).unwrap();
      toast.success(t(getActionMessageKey(action)));
      await refreshAbout(formDataHasFile(formData));
    } catch (err) {
      console.error(`Error during team member ${action}:`, err);
      toast.error(t(getActionMessageKey(action, 'error')));
    }
  };

  const handleToggleAllTeamStatus = async (members, targetStatus) => {
    const newStatus = targetStatus === '1' ? '1' : '0';
    const toUpdate = members.filter(
      (member) => Boolean(member.status) !== (newStatus === '1')
    );

    if (toUpdate.length === 0) return;

    try {
      await Promise.all(
        toUpdate.map((member) => {
          const formData = new FormData();
          formData.append('_method', 'PUT');
          formData.append('name[en]', member.name?.en || '');
          formData.append('name[ar]', member.name?.ar || '');
          formData.append('title[en]', member.title?.en || '');
          formData.append('title[ar]', member.title?.ar || '');
          formData.append('email', member.email || '');
          formData.append('display_order', String(member.display_order ?? 0));
          formData.append('status', newStatus);

          return dispatch(
            aboutTeamAction({ action: 'edit', id: member.id, formData })
          ).unwrap();
        })
      );
      toast.success(t(getActionMessageKey('update')));
      await refreshAbout(false);
    } catch (err) {
      console.error('Error toggling all team member statuses:', err);
      toast.error(t(getActionMessageKey('update', 'error')));
    }
  };

  const handleToggleAllAchievementStatus = async (items, targetStatus) => {
    const newStatus = targetStatus === '1' ? '1' : '0';
    const toUpdate = items.filter(
      (item) => Boolean(item.status) !== (newStatus === '1')
    );

    if (toUpdate.length === 0) return;

    try {
      await Promise.all(
        toUpdate.map((item) => {
          const formData = new FormData();
          formData.append('_method', 'PUT');
          formData.append('value', item.value || '');
          formData.append('title[en]', item.title?.en || '');
          formData.append('title[ar]', item.title?.ar || '');
          formData.append('icon', item.icon || '');
          formData.append('display_order', String(item.display_order ?? 0));
          formData.append('status', newStatus);

          return dispatch(
            aboutAchievementAction({ action: 'edit', id: item.id, formData })
          ).unwrap();
        })
      );
      toast.success(t(getActionMessageKey('update')));
      await refreshAbout(false);
    } catch (err) {
      console.error('Error toggling all achievement statuses:', err);
      toast.error(t(getActionMessageKey('update', 'error')));
    }
  };

  const renderActiveSection = () => {
    if (!data?.aboutData) return null;
    const { aboutData, heroFeatures, milestones, achievements, coreValues, teamMembers } = data;

    switch (activeTab) {
      case 'hero':
        return (
          <HeroSection
            data={aboutData}
            features={heroFeatures}
            onUpdateAbout={handleAboutUpdate}
            onFeatureAction={handleFeatureAction}
            mediaVersion={mediaVersion}
          />
        );
      case 'journey':
        return (
          <JourneySection
            data={aboutData}
            milestones={milestones}
            onUpdate={handleAboutUpdate}
            onMilestoneAction={handleMilestoneAction}
            mediaVersion={mediaVersion}
          />
        );
      case 'achievements':
        return (
          <AchievementsSection
            data={aboutData}
            achievements={achievements}
            onUpdate={handleAboutUpdate}
            onAchievementAction={handleAchievementAction}
            onToggleAllStatus={handleToggleAllAchievementStatus}
            mediaVersion={mediaVersion}
          />
        );
      case 'core_values':
        return (
          <CoreValuesSection
            coreValues={coreValues}
            onAction={handleCoreValueAction}
            mediaVersion={mediaVersion}
          />
        );
      case 'team':
        return (
          <TeamSection
            teamMembers={teamMembers}
            onAction={handleTeamAction}
            onToggleAllStatus={handleToggleAllTeamStatus}
            mediaVersion={mediaVersion}
          />
        );
      default:
        return null;
    }
  };

  useAppReady(!isLoading);

  if (isLoading) {
    return null;
  }

  if (isError || !data?.aboutData) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>{t('no_data_found')}</div>
      </div>
    );
  }

  return (
    <div className={styles.page} dir={isAr ? 'rtl' : 'ltr'}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t('about')}</h1>
        <p className={styles.pageSubtitle}>{t('about_page.subtitle')}</p>
      </header>

      <div className={styles.statsRow}>
        {SECTIONS.map(({ id, icon: Icon, labelKey, countKey }) => (
          <button
            key={id}
            type="button"
            className={`${styles.statChip} ${activeTab === id ? styles.statChipActive : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <span className={styles.statChipStart}>
              <span className={styles.statChipIcon}><Icon size={18} /></span>
              <span className={styles.statChipLabel}>{t(labelKey)}</span>
            </span>
            <span className={styles.statChipValue}>{counts[countKey]}</span>
          </button>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.sectionPanel} key={activeTab}>
          <Suspense fallback={<SectionSkeleton count={2} />}>
            {renderActiveSection()}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AboutManager;
