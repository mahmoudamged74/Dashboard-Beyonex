import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    MdEdit, 
    MdSave, 
    MdClose,
    MdAdd,
    MdDelete,
    MdSearch,
    MdImage
} from 'react-icons/md';
import styles from './AchievementsSection.module.css';
import { iconMap } from '../../../utils/iconMap';
import usePermission from '../../../hooks/usePermission';

const AchievementsSection = ({ data, achievements, onUpdate, onAchievementAction }) => {
    const { t, i18n } = useTranslation();
    const { can } = usePermission();
    const isRtl = i18n.dir() === 'rtl';

    const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
    const [achievementFormData, setAchievementFormData] = useState({
        value: '',
        'title[en]': '',
        'title[ar]': '',
        icon: 'rocketLaunch',
        display_order: '0'
    });
    const [editingId, setEditingId] = useState(null);
    const [iconSearch, setIconSearch] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Filter icons
    const filteredIcons = Object.keys(iconMap).filter(name => 
        name.toLowerCase().includes(iconSearch.toLowerCase())
    );


    // Achievement Modal Handlers
    const handleAddAchievement = () => {
        setAchievementFormData({
            value: '',
            'title[en]': '',
            'title[ar]': '',
            icon: 'rocketLaunch',
            display_order: '0'
        });
        setEditingId(null);
        setImageFile(null);
        setImagePreview(null);
        setIconSearch('');
        setIsAchievementModalOpen(true);
    };

    const handleEditAchievement = (item) => {
        setAchievementFormData({
            value: item.value || '',
            'title[en]': item.title?.en || '',
            'title[ar]': item.title?.ar || '',
            icon: item.icon || 'rocketLaunch',
            display_order: item.display_order || '0'
        });
        setEditingId(item.id);
        setImageFile(null);
        setImagePreview(item.icon && item.icon.startsWith('http') ? item.icon : null);
        setIconSearch('');
        setIsAchievementModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setAchievementFormData({ ...achievementFormData, icon: '' });
        }
    };

    const handleAchievementSubmit = (e) => {
        e.preventDefault();
        const submitData = new FormData();
        submitData.append('value', achievementFormData.value);
        submitData.append('title[en]', achievementFormData['title[en]']);
        submitData.append('title[ar]', achievementFormData['title[ar]']);
        submitData.append('display_order', achievementFormData.display_order);
        
        if (imageFile) {
            submitData.append('icon', imageFile);
        } else {
            submitData.append('icon', achievementFormData.icon);
        }

        onAchievementAction(editingId ? 'edit' : 'add', editingId, submitData);
        setIsAchievementModalOpen(false);
    };

    const renderIconOrImage = (icon) => {
        if (!icon) return null;
        if (icon.startsWith('http')) {
            return <img src={icon} alt="icon" style={{width: '30px', height: '30px', objectFit: 'contain'}} />;
        }
        const IconComp = iconMap[icon] || iconMap['rocketLaunch'];
        return <IconComp />;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.achievementsHeader}>
                    {can('about_achievements.create') && (
                        <button className={styles.addAchievementBtn} onClick={handleAddAchievement}>
                            <MdAdd size={20} /> {t('add_achievement') || 'Add Achievement'}
                        </button>
                    )}
                </div>
                
                <div className={styles.titleWrapper}>
                    <h2 className={styles.title}>
                        {isRtl ? data.achievement_title?.ar : data.achievement_title?.en}
                    </h2>
                    <p className={styles.subtitle}>
                        {isRtl ? data.achievement_subtitle?.ar : data.achievement_subtitle?.en}
                    </p>
                </div>
            </div>

            <div className={styles.grid}>
                {achievements.map((item) => (
                    <div className={styles.card} key={item.id}>
                        <div className={styles.iconWrapper}>
                            {renderIconOrImage(item.icon)}
                        </div>
                        <div className={styles.number} dir="ltr">{item.value}</div>
                        <div className={styles.label}>
                            {isRtl ? item.title?.ar : item.title?.en}
                        </div>
                        <div className={styles.cardActions}>
                            {can('about_achievements.update') && (
                                <button className={styles.miniBtn} onClick={() => handleEditAchievement(item)} title={t('edit')}>
                                    <MdEdit />
                                </button>
                            )}
                            {can('about_achievements.delete') && (
                                <button className={`${styles.miniBtn} ${styles.deleteBtn}`} onClick={() => onAchievementAction('delete', item.id)} title={t('delete')}>
                                    <MdDelete />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>


            {/* Achievement Item Modal */}
            {isAchievementModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsAchievementModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {editingId ? t('edit_achievement') : t('add_achievement')}
                            </h3>
                            <button className={styles.closeBtn} onClick={() => setIsAchievementModalOpen(false)}>
                                <MdClose />
                            </button>
                        </div>

                        <form className={styles.modalForm} onSubmit={handleAchievementSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('value')} (e.g. +50)</label>
                                    <input 
                                        type="text"
                                        className={styles.input}
                                        value={achievementFormData.value}
                                        onChange={(e) => setAchievementFormData({...achievementFormData, value: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('title')} (EN)</label>
                                        <input 
                                            type="text"
                                            className={styles.input}
                                            value={achievementFormData['title[en]']}
                                            onChange={(e) => setAchievementFormData({...achievementFormData, 'title[en]': e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('title')} (AR)</label>
                                        <input 
                                            type="text"
                                            className={styles.input}
                                            value={achievementFormData['title[ar]']}
                                            onChange={(e) => setAchievementFormData({...achievementFormData, 'title[ar]': e.target.value})}
                                            required
                                            dir="rtl"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('icon')} / {t('image')}</label>
                                    <div className={styles.iconSelectorContainer}>
                                        <div className={styles.searchBox}>
                                            <MdSearch />
                                            <input 
                                                type="text" 
                                                placeholder={t('search_icons')} 
                                                value={iconSearch} 
                                                onChange={(e) => setIconSearch(e.target.value)}
                                                className={styles.searchInput}
                                            />
                                        </div>
                                        <div className={styles.iconGrid}>
                                            {filteredIcons.map(iconName => {
                                                const IconComp = iconMap[iconName];
                                                return (
                                                    <button 
                                                        key={iconName}
                                                        type="button" 
                                                        className={`${styles.iconItem} ${achievementFormData.icon === iconName ? styles.selectedIcon : ''}`}
                                                        onClick={() => {
                                                            setAchievementFormData({...achievementFormData, icon: iconName});
                                                            setImageFile(null);
                                                            setImagePreview(null);
                                                        }}
                                                        title={iconName}
                                                    >
                                                        <IconComp />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className={styles.selectedIconName}>
                                            {t('selected')}: <strong>{achievementFormData.icon || 'rocketLaunch'}</strong>
                                        </div>
                                    </div>

                                    <div className={styles.uploadBox}>
                                        <label className={styles.uploadLabel}>
                                            <input type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} />
                                            <MdImage size={24} />
                                            <span>{t('upload_custom_icon')}</span>
                                        </label>
                                        {imagePreview && (
                                            <div className={styles.previewContainer} style={{textAlign: 'center'}}>
                                                <img src={imagePreview} alt="Preview" style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover'}} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('display_order')}</label>
                                    <input 
                                        type="number"
                                        className={styles.input}
                                        value={achievementFormData.display_order}
                                        onChange={(e) => setAchievementFormData({...achievementFormData, display_order: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsAchievementModalOpen(false)}>
                                    {t('cancel')}
                                </button>
                                <button type="submit" className={styles.saveBtn}>
                                    <MdSave /> {editingId ? t('save') : t('add_new')}
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
