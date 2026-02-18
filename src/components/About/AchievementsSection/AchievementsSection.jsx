import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    MdEdit, 
    MdSave, 
    MdClose,
    MdSentimentVerySatisfied,
    MdAccessTimeFilled,
    MdGroups,
    MdAccountTree
} from 'react-icons/md';
import styles from './AchievementsSection.module.css';

const AchievementsSection = ({ data, onUpdate }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    // Map keys to icons
    const getIcon = (key) => {
        switch (key) {
            case 'excellence': return <MdSentimentVerySatisfied />;
            case 'experience': return <MdAccessTimeFilled />;
            case 'partners': return <MdGroups />;
            case 'projects': return <MdAccountTree />;
            default: return null;
        }
    };

    const handleEdit = () => {
        setFormData(JSON.parse(JSON.stringify(data))); // Deep copy
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({});
    };

    const handleChange = (e, section, field) => {
        const { value } = e.target;
        setFormData(prev => {
            if (section === 'main') {
                return { ...prev, [field]: value };
            } else {
                return {
                    ...prev,
                    items: {
                        ...prev.items,
                        [section]: {
                            ...prev.items[section],
                            [field]: value
                        }
                    }
                };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
        closeModal();
    };

    // Helper to render card
    const renderCard = (key, item) => (
        <div className={styles.card} key={key}>
            <div className={styles.iconWrapper}>
                {getIcon(key)}
            </div>
            <div className={styles.number} dir="ltr">{item.number}</div>
            <div className={styles.label}>
                {isRtl ? item.labelAr : item.labelEn}
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.editBtn} onClick={handleEdit}>
                    <MdEdit /> {t('edit') || 'Edit'}
                </button>
                <div className={styles.titleWrapper}>
                    <h2 className={styles.title}>
                        {isRtl ? data.titleAr : data.titleEn}
                    </h2>
                    <p className={styles.subtitle}>
                        {isRtl ? data.subtitleAr : data.subtitleEn}
                    </p>
                </div>
                <div style={{width: '80px'}}></div> {/* Spacer for alignment */}
            </div>

            <div className={styles.grid}>
                {data.items && Object.entries(data.items).map(([key, item]) => renderCard(key, item))}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>{t('edit_achievements') || 'Edit Achievements'}</h3>
                            <button className={styles.closeBtn} onClick={closeModal}>
                                <MdClose />
                            </button>
                        </div>

                        <form className={styles.modalForm} onSubmit={handleSubmit}>
                            <div className={styles.modalScroll}>
                                {/* Main Title & Subtitle */}
                                <div className={styles.formSection}>
                                    <h4 className={styles.sectionTitle}>{t('main_titles') || 'Main Titles'}</h4>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>{t('box_title')} (En)</label>
                                            <input 
                                                className={styles.input}
                                                value={formData.titleEn || ''}
                                                onChange={(e) => handleChange(e, 'main', 'titleEn')}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>{t('box_title')} (Ar)</label>
                                            <input 
                                                className={styles.input}
                                                value={formData.titleAr || ''}
                                                onChange={(e) => handleChange(e, 'main', 'titleAr')}
                                                dir="rtl"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>{t('subtitle')} (En)</label>
                                            <input 
                                                className={styles.input}
                                                value={formData.subtitleEn || ''}
                                                onChange={(e) => handleChange(e, 'main', 'subtitleEn')}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>{t('subtitle')} (Ar)</label>
                                            <input 
                                                className={styles.input}
                                                value={formData.subtitleAr || ''}
                                                onChange={(e) => handleChange(e, 'main', 'subtitleAr')}
                                                dir="rtl"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                {formData.items && Object.entries(formData.items).map(([key, item]) => (
                                    <div className={styles.formSection} key={key} style={{ marginTop: '1rem' }}>
                                        <h4 className={styles.sectionTitle} style={{textTransform: 'capitalize'}}>
                                            {key}
                                        </h4>
                                        <div className={styles.formGrid}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>{t('number')} (e.g. +50)</label>
                                                <input 
                                                    className={styles.input}
                                                    value={item.number || ''}
                                                    onChange={(e) => handleChange(e, key, 'number')}
                                                    dir="ltr"
                                                />
                                            </div>
                                            <div className={styles.formGroup}></div> {/* Empty spacer */}
                                            
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>{t('label')} (En)</label>
                                                <input 
                                                    className={styles.input}
                                                    value={item.labelEn || ''}
                                                    onChange={(e) => handleChange(e, key, 'labelEn')}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>{t('label')} (Ar)</label>
                                                <input 
                                                    className={styles.input}
                                                    value={item.labelAr || ''}
                                                    onChange={(e) => handleChange(e, key, 'labelAr')}
                                                    dir="rtl"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                                    {t('cancel') || 'Cancel'}
                                </button>
                                <button type="submit" className={styles.saveBtn}>
                                    <MdSave /> {t('save') || 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementsSection;
