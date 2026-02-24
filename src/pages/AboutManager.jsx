import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import HeroSection from '../components/About/HeroSection/HeroSection';
import JourneySection from '../components/About/JourneySection/JourneySection';
import AchievementsSection from '../components/About/AchievementsSection/AchievementsSection';
import CoreValuesSection from '../components/About/CoreValuesSection/CoreValuesSection';
import TeamSection from '../components/About/TeamSection/TeamSection';
import styles from './AboutManager.module.css';

const AboutManager = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [aboutData, setAboutData] = useState(null);
    const [heroFeatures, setHeroFeatures] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [coreValues, setCoreValues] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aboutRes, featuresRes, milestonesRes, achievementsRes, coreValuesRes, teamRes] = await Promise.all([
                    axiosInstance.get('/admin/about-page'),
                    axiosInstance.get('/admin/about/hero-features'),
                    axiosInstance.get('/admin/about/milestones'),
                    axiosInstance.get('/admin/about/achievements'),
                    axiosInstance.get('/admin/about/core-values'),
                    axiosInstance.get('/admin/team-members')
                ]);
                
                if (aboutRes.data.code === 200) {
                    setAboutData(aboutRes.data.data);
                }
                if (featuresRes.data.code === 200) {
                    setHeroFeatures(featuresRes.data.data.about_hero_features || []);
                }
                if (milestonesRes.data.code === 200) {
                    setMilestones(milestonesRes.data.data.about_milestones || []);
                }
                if (achievementsRes.data.code === 200) {
                    setAchievements(achievementsRes.data.data.about_achievements || []);
                }
                if (coreValuesRes.data.code === 200) {
                    setCoreValues(coreValuesRes.data.data.about_core_values || []);
                }
                if (teamRes.data.code === 200) {
                    setTeamMembers(teamRes.data.data.team_members || []);
                }
            } catch (err) {
                console.error('Error fetching about data:', err);
                toast.error(t('error_fetching_data'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [t]);

const handleAchievementAction = async (action, id = null, data = null) => {
    try {
        let res;
        const isFormData = data instanceof FormData;
        
        if (action === 'add') {
            res = await axiosInstance.post('/admin/about/achievements', data, {
                headers: { 'Content-Type': isFormData ? 'multipart/form-data' : 'application/json' }
            });
        } else if (action === 'edit' && id) {
            if (isFormData) {
                data.append('_method', 'PUT');
                res = await axiosInstance.post(`/admin/about/achievements/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await axiosInstance.put(`/admin/about/achievements/${id}`, data);
            }
        } else if (action === 'delete' && id) {
            res = await axiosInstance.delete(`/admin/about/achievements/${id}`);
        }

        if (res && (res.status === 200 || res.status === 201)) {
            toast.success(t(`${action}_success`));
            const achievementsRes = await axiosInstance.get('/admin/about/achievements');
            setAchievements(achievementsRes.data.data.about_achievements || []);
        }
    } catch (err) {
        console.error(`Error during achievement ${action}:`, err);
        toast.error(t(`${action}_error`));
    }
};

    const handleMilestoneAction = async (action, id = null, data = null) => {
    try {
        let res;
        const isFormData = data instanceof FormData;
        
        if (action === 'add') {
            res = await axiosInstance.post('/admin/about/milestones', data, {
                headers: { 'Content-Type': isFormData ? 'multipart/form-data' : 'application/json' }
            });
        } else if (action === 'edit' && id) {
            if (isFormData) {
                data.append('_method', 'PUT');
                res = await axiosInstance.post(`/admin/about/milestones/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await axiosInstance.put(`/admin/about/milestones/${id}`, data);
            }
        } else if (action === 'delete' && id) {
            res = await axiosInstance.delete(`/admin/about/milestones/${id}`);
        }

        if (res && (res.status === 200 || res.status === 201)) {
            toast.success(t(`${action}_success`));
            const milestonesRes = await axiosInstance.get('/admin/about/milestones');
            setMilestones(milestonesRes.data.data.about_milestones || []);
        }
    } catch (err) {
        console.error(`Error during milestone ${action}:`, err);
        toast.error(t(`${action}_error`));
    }
};

const handleAboutUpdate = async (newData) => {
        try {
            // Check if newData is FormData (for image upload) or plain object
            const isFormData = newData instanceof FormData;
            const res = await axiosInstance.post('/admin/about-page', newData, {
                headers: {
                    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
                }
            });

            if (res.status === 200 || res.status === 201) {
                toast.success(t('update_success'));
                // Refresh data
                const aboutRes = await axiosInstance.get('/admin/about-page');
                setAboutData(aboutRes.data.data);
            }
        } catch (err) {
            console.error('Error updating about data:', err);
            toast.error(t('update_error'));
        }
    };

    const handleFeatureAction = async (action, id = null, data = null) => {
        try {
            let res;
            if (action === 'add') {
                res = await axiosInstance.post('/admin/about/hero-features', data);
            } else if (action === 'edit' && id) {
                res = await axiosInstance.put(`/admin/about/hero-features/${id}`, data);
            } else if (action === 'delete' && id) {
                res = await axiosInstance.delete(`/admin/about/hero-features/${id}`);
            }

            if (res && (res.status === 200 || res.status === 201)) {
                toast.success(t(`${action}_success`));
                // Refresh features
                const featuresRes = await axiosInstance.get('/admin/about/hero-features');
                setHeroFeatures(featuresRes.data.data.about_hero_features || []);
            }
        } catch (err) {
            console.error(`Error during feature ${action}:`, err);
            toast.error(t(`${action}_error`));
        }
    };

    const handleCoreValueAction = async (action, id = null, data = null) => {
        try {
            let res;
            const isFormData = data instanceof FormData;
            
            if (action === 'add') {
                res = await axiosInstance.post('/admin/about/core-values', data, {
                    headers: { 'Content-Type': isFormData ? 'multipart/form-data' : 'application/json' }
                });
            } else if (action === 'edit' && id) {
                if (isFormData) {
                    data.append('_method', 'PUT');
                    res = await axiosInstance.post(`/admin/about/core-values/${id}`, data, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } else {
                    res = await axiosInstance.put(`/admin/about/core-values/${id}`, data);
                }
            } else if (action === 'delete' && id) {
                res = await axiosInstance.delete(`/admin/about/core-values/${id}`);
            }

            if (res && (res.status === 200 || res.status === 201)) {
                toast.success(t(`${action}_success`));
                const coreValuesRes = await axiosInstance.get('/admin/about/core-values');
                setCoreValues(coreValuesRes.data.data.about_core_values || []);
            }
        } catch (err) {
            console.error(`Error during core value ${action}:`, err);
            toast.error(t(`${action}_error`));
        }
    };

    const handleTeamAction = async (action, id = null, data = null) => {
        try {
            let res;
            const isFormData = data instanceof FormData;
            
            if (action === 'add') {
                res = await axiosInstance.post('/admin/team-members', data, {
                    headers: { 'Content-Type': isFormData ? 'multipart/form-data' : 'application/json' }
                });
            } else if (action === 'edit' && id) {
                if (isFormData) {
                    data.append('_method', 'PUT');
                    res = await axiosInstance.post(`/admin/team-members/${id}`, data, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } else {
                    res = await axiosInstance.put(`/admin/team-members/${id}`, data);
                }
            } else if (action === 'delete' && id) {
                res = await axiosInstance.delete(`/admin/team-members/${id}`);
            }

            if (res && (res.status === 200 || res.status === 201)) {
                toast.success(t(`${action}_success`));
                const teamRes = await axiosInstance.get('/admin/team-members');
                setTeamMembers(teamRes.data.data.team_members || []);
            }
        } catch (err) {
            console.error(`Error during team member ${action}:`, err);
            toast.error(t(`${action}_error`));
        }
    };

    if (loading) return <div className={styles.loading}>{t('loading')}...</div>;
    if (!aboutData) return <div className={styles.error}>{t('no_data_found')}</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>{t('about_manager') || 'About Us Manager'}</h1>
                <p className={styles.pageSubtitle}>{t('manage_about_content') || 'Manage content for the "Who We Are" page'}</p>
            </div>

            <HeroSection 
                data={aboutData || {}} 
                features={heroFeatures}
                onUpdateAbout={handleAboutUpdate}
                onFeatureAction={handleFeatureAction}
            />
            
            <div style={{margin: '2rem 0'}}></div>
            
            <JourneySection 
                data={aboutData || {}} 
                milestones={milestones}
                onUpdate={handleAboutUpdate}
                onMilestoneAction={handleMilestoneAction}
            />

            <AchievementsSection 
                data={aboutData || {}}
                achievements={achievements}
                onUpdate={handleAboutUpdate}
                onAchievementAction={handleAchievementAction}
            />

            <CoreValuesSection 
                coreValues={coreValues}
                onAction={handleCoreValueAction}
            />

            <TeamSection 
                teamMembers={teamMembers}
                onAction={handleTeamAction}
            />
        </div>
    );
};

export default AboutManager;
