import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/About/HeroSection/HeroSection';
import JourneySection from '../components/About/JourneySection/JourneySection';
import AchievementsSection from '../components/About/AchievementsSection/AchievementsSection';
import styles from './AboutManager.module.css';

const AboutManager = () => {
    const { t } = useTranslation();

    // Initial Data
    const [heroData, setHeroData] = useState({
        image: '/assets/about-img.jpg', // Default image or from assets
        titleEn: 'About Beyonex IT',
        titleAr: 'عن بيونكس IT',
        subtitleEn: 'Your Trusted Partner in Digital Innovation',
        subtitleAr: 'شريكك الموثوق في الابتكار الرقمي',
        descEn: 'We are a team of tech enthusiasts committed to transforming businesses through innovative software solutions and cutting-edge technology.',
        descAr: 'نحن فريق من التقنيين المتحمسين الملتزمين بتحويل الأعمال من خلال حلول برمجية مبتكرة وتكنولوجيا متطورة.'
    });

    const handleHeroUpdate = (newData) => {
        setHeroData(newData);
        // Here you would typically send the data to a backend
        console.log('Updated Hero Data:', newData);
    };

    const [achievementsData, setAchievementsData] = useState({
        titleEn: 'Our Achievements',
        titleAr: 'إنجازاتنا',
        subtitleEn: 'Numbers that reflect our commitment to excellence and customer satisfaction.',
        subtitleAr: 'أرقام تعكس التزامنا بالتميز ورضا العملاء.',
        items: {
            excellence: {
                number: '99%',
                labelEn: 'Excellence Rate',
                labelAr: 'معدل التميز'
            },
            experience: {
                number: '+5',
                labelEn: 'Years Experience',
                labelAr: 'سنوات خبرة'
            },
            partners: {
                number: '+50',
                labelEn: 'Success Partners',
                labelAr: 'شركاء النجاح'
            },
            projects: {
                number: '+150',
                labelEn: 'Completed Projects',
                labelAr: 'مشروع مكتمل'
            }
        }
    });

    const handleAchievementsUpdate = (newData) => {
        setAchievementsData(newData);
        console.log('Updated Achievements Data:', newData);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>{t('about_manager') || 'About Us Manager'}</h1>
                <p className={styles.pageSubtitle}>{t('manage_about_content') || 'Manage content for the "Who We Are" page'}</p>
            </div>

            <HeroSection data={heroData} onUpdate={handleHeroUpdate} />
            
            <div style={{margin: '2rem 0'}}></div>
            
            <AchievementsSection data={achievementsData} onUpdate={handleAchievementsUpdate} />

            <div style={{margin: '2rem 0'}}></div>
            <JourneySection />
        </div>
    );
};

export default AboutManager;
