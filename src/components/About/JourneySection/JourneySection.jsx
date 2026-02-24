import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    MdEdit, 
    MdClose, 
    MdSave, 
    MdAdd,
    MdDelete,
    MdRocketLaunch,
    MdVisibility,
    MdFlag,
    MdPublic,
    MdGroups,
    MdStar,
    MdSearch,
    MdImage
} from 'react-icons/md';
import styles from './JourneySection.module.css';
import modalStyles from '../HeroSection/HeroSection.module.css'; 
import { iconMap } from '../../../utils/iconMap';
import { toast } from 'react-toastify';

const JourneySection = ({ data, milestones, onUpdate, onMilestoneAction }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [missionIconSearch, setMissionIconSearch] = useState('');
    const [visionIconSearch, setVisionIconSearch] = useState('');

    // Milestone Modal State
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
    const [milestoneFormData, setMilestoneFormData] = useState({
        year: new Date().getFullYear().toString(),
        'title[en]': '',
        'title[ar]': '',
        'description[en]': '',
        'description[ar]': '',
        display_order: '0',
        icon: 'starFill'
    });
    const [editingMilestoneId, setEditingMilestoneId] = useState(null);
    const [iconSearch, setIconSearch] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Icon Helper
    const getIcon = (iconName) => {
        // Check if iconName is a key in iconMap
        const IconComponent = iconMap[iconName] || MdStar;
        return <IconComponent />;
    };

    // Icon/Image Helper
    const renderIconOrImage = (item) => {
        // If icon field is a URL (starts with http) or we have an image field
        if (item.icon && (item.icon.startsWith('http') || item.icon.startsWith('blob:'))) {
            return <img src={item.icon} alt={isRtl ? item.title?.ar : item.title?.en} style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%'}} />;
        }
        // Otherwise treat as iconMap key
        return getIcon(item.icon);
    };

    const filteredMissionIcons = Object.keys(iconMap).filter(name => 
        name.toLowerCase().includes(missionIconSearch.toLowerCase())
    );

    const filteredVisionIcons = Object.keys(iconMap).filter(name => 
        name.toLowerCase().includes(visionIconSearch.toLowerCase())
    );

    const filteredIcons = Object.keys(iconMap).filter(name => 
        name.toLowerCase().includes(iconSearch.toLowerCase())
    );

    // Main Edit Handlers
    const handleEditMain = () => {
        setFormData(JSON.parse(JSON.stringify(data)));
        setMissionIconSearch('');
        setVisionIconSearch('');
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setFormData({});
    };

    // Milestone Handlers
    const openAddMilestone = () => {
        setMilestoneFormData({
            year: new Date().getFullYear().toString(),
            'title[en]': '',
            'title[ar]': '',
            'description[en]': '',
            'description[ar]': '',
            display_order: milestones.length.toString(),
            icon: 'starFill'
        });
        setImageFile(null);
        setImagePreview(null);
        setEditingMilestoneId(null);
        setIsMilestoneModalOpen(true);
    };

    const handleMilestoneEdit = (milestone) => {
        setMilestoneFormData({
            year: milestone.year?.toString() || '',
            'title[en]': milestone.title?.en || '',
            'title[ar]': milestone.title?.ar || '',
            'description[en]': milestone.description?.en || '',
            'description[ar]': milestone.description?.ar || '',
            display_order: milestone.display_order?.toString() || '0',
            icon: milestone.icon || 'starFill'
        });
        setImagePreview(milestone.icon && milestone.icon.startsWith('http') ? milestone.icon : null);
        setEditingMilestoneId(milestone.id);
        setIsMilestoneModalOpen(true);
    };

    const closeMilestoneModal = () => {
        setIsMilestoneModalOpen(false);
        setImageFile(null);
        setImagePreview(null);
        setIconSearch('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleMilestoneSubmit = (e) => {
        e.preventDefault();
        const submitData = new FormData();
        
        // Append nested fields
        submitData.append('year', milestoneFormData.year);
        submitData.append('title[en]', milestoneFormData['title[en]']);
        submitData.append('title[ar]', milestoneFormData['title[ar]']);
        submitData.append('description[en]', milestoneFormData['description[en]']);
        submitData.append('description[ar]', milestoneFormData['description[ar]']);
        submitData.append('display_order', milestoneFormData.display_order);
        
        // If we have a file, send it in the icon field. Otherwise send the icon name string.
        if (imageFile) {
            submitData.append('icon', imageFile);
        } else {
            submitData.append('icon', milestoneFormData.icon);
        }

        const action = editingMilestoneId ? 'edit' : 'add';
        onMilestoneAction(action, editingMilestoneId, submitData);
        closeMilestoneModal();
    };

    const handleChange = (section, field, value, lang = null) => {
        setFormData(prev => {
            const newData = { ...prev };
            if (lang) {
                if (!newData[field]) newData[field] = { en: '', ar: '' };
                newData[field][lang] = value;
            } else {
                newData[field] = value;
            }
            return newData;
        });
    };

    const handleImageUpload = (e, section, index) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => {
                const newData = { ...prev };
                if (section === 'cards') {
                    newData.cards[index].image = imageUrl;
                } else if (section === 'timeline') {
                    newData.timeline[index].image = imageUrl;
                }
                return newData;
            });
        }
    };

    const addTimelineItem = () => {
        setFormData(prev => ({
            ...prev,
            timeline: [
                ...prev.timeline,
                {
                    id: Date.now(),
                    year: new Date().getFullYear().toString(),
                    icon: 'star',
                    image: null, // New items have no image by default
                    titleEn: 'New Milestone',
                    titleAr: 'حدث جديد',
                    descEn: 'Description here...',
                    descAr: 'الوصف هنا...'
                }
            ]
        }));
    };

    const removeTimelineItem = (index) => {
        setFormData(prev => {
            const newTimeline = [...prev.timeline];
            newTimeline.splice(index, 1);
            return { ...prev, timeline: newTimeline };
        });
    };

    const handleSaveMain = (e) => {
        e.preventDefault();
        
        // Prepare FormData for submission (AboutManager expects either FormData or plain object)
        const submitData = new FormData();
        
        // Loop through fields and append to FormData
        const fields = [
            'journey_title', 'journey_description', 
            'mission_title', 'mission_content', 'mission_icon',
            'vision_title', 'vision_content', 'vision_icon'
        ];

        fields.forEach(field => {
            if (formData[field]) {
                if (typeof formData[field] === 'object' && !Array.isArray(formData[field])) {
                    // Handle translated fields
                    submitData.append(`${field}[en]`, formData[field].en || '');
                    submitData.append(`${field}[ar]`, formData[field].ar || '');
                } else {
                    // Handle simple fields like icons
                    submitData.append(field, formData[field]);
                }
            }
        });

        onUpdate(submitData);
        closeEditModal();
    };

    return (
        <div className={styles.container}>
            {/* Edit Controls */}
            <div className={styles.controls}>
                <button className={styles.editBtn} onClick={handleEditMain} title={t('edit_journey')}>
                    <MdEdit />
                </button>
            </div>

            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.mainTitle}>
                    {isRtl ? data.journey_title?.ar : data.journey_title?.en}
                </h2>
                <p className={styles.mainDesc}>
                    {isRtl ? data.journey_description?.ar : data.journey_description?.en}
                </p>
            </div>

            {/* Mission & Vision Cards */}
            <div className={styles.cardsGrid}>
                <div className={styles.card}>
                    <div className={styles.cardIcon}>
                        {getIcon(data.mission_icon || 'rocketLaunch')}
                    </div>
                    <h3 className={styles.cardTitle}>
                        {isRtl ? data.mission_title?.ar : data.mission_title?.en}
                    </h3>
                    <p className={styles.cardDesc}>
                        {isRtl ? data.mission_content?.ar : data.mission_content?.en}
                    </p>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon}>
                        {getIcon(data.vision_icon || 'visibility')}
                    </div>
                    <h3 className={styles.cardTitle}>
                        {isRtl ? data.vision_title?.ar : data.vision_title?.en}
                    </h3>
                    <p className={styles.cardDesc}>
                        {isRtl ? data.vision_content?.ar : data.vision_content?.en}
                    </p>
                </div>
            </div>

            {/* Timeline (Milestones) */}
            <div className={styles.milestonesHeader}>
                <h3 className={styles.milestonesTitle}>{t('timeline')}</h3>
                <button className={styles.addMilestoneBtn} onClick={openAddMilestone}>
                    <MdAdd /> {t('add_new')}
                </button>
            </div>
            
            <div className={styles.timeline}>
                {milestones.length > 0 ? milestones.map((item, index) => (
                    <div key={item.id} className={styles.timelineItem}>
                        <div className={styles.timelineDot}>
                            {renderIconOrImage(item)}
                        </div>
                        <span className={styles.year}>{item.year}</span>
                        <h4 className={styles.itemTitle}>
                            {isRtl ? item.title?.ar : item.title?.en}
                        </h4>
                        <p className={styles.itemDesc}>
                            {isRtl ? item.description?.ar : item.description?.en}
                        </p>
                        <div className={styles.milestoneActions}>
                            <button className={styles.miniBtn} onClick={() => handleMilestoneEdit(item)}>
                                <MdEdit />
                            </button>
                            <button className={`${styles.miniBtn} ${styles.deleteBtn}`} onClick={() => onMilestoneAction('delete', item.id)}>
                                <MdDelete />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className={styles.noData}>{t('no_data_found')}</div>
                )}
            </div>

            {/* Main Edit Modal */}
            {isEditModalOpen && (
                <div className={modalStyles.modalOverlay} onClick={closeEditModal}>
                    <div className={modalStyles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={modalStyles.modalHeader}>
                            <h3 className={modalStyles.modalTitle}>{t('edit_journey')}</h3>
                            <button className={modalStyles.closeBtn} onClick={closeEditModal}><MdClose /></button>
                        </div>
                        
                        <form className={styles.modalForm} onSubmit={handleSaveMain}>
                            <div className={styles.modalBody}>
                                {/* Header Section */}
                                <h4 className={styles.formSectionTitle}>{t('journey')}</h4>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('title')} (EN)</label>
                                    <input className={modalStyles.input} value={formData.journey_title?.en || ''} onChange={(e) => handleChange('header', 'journey_title', e.target.value, 'en')} />
                                </div>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('title')} (AR)</label>
                                    <input className={modalStyles.input} value={formData.journey_title?.ar || ''} onChange={(e) => handleChange('header', 'journey_title', e.target.value, 'ar')} dir="rtl" />
                                </div>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('description')} (EN)</label>
                                    <textarea className={modalStyles.textarea} value={formData.journey_description?.en || ''} onChange={(e) => handleChange('header', 'journey_description', e.target.value, 'en')} rows="2" />
                                </div>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('description')} (AR)</label>
                                    <textarea className={modalStyles.textarea} value={formData.journey_description?.ar || ''} onChange={(e) => handleChange('header', 'journey_description', e.target.value, 'ar')} dir="rtl" rows="2" />
                                </div>

                                {/* Mission Section */}
                                <h4 className={styles.formSectionTitle}>{t('mission')}</h4>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('title')} (EN)</label>
                                    <input className={modalStyles.input} value={formData.mission_title?.en || ''} onChange={(e) => handleChange('cards', 'mission_title', e.target.value, 'en')} />
                                </div>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('title')} (AR)</label>
                                    <input className={modalStyles.input} value={formData.mission_title?.ar || ''} onChange={(e) => handleChange('cards', 'mission_title', e.target.value, 'ar')} dir="rtl" />
                                </div>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('content')} (EN)</label>
                                    <textarea className={modalStyles.textarea} value={formData.mission_content?.en || ''} onChange={(e) => handleChange('cards', 'mission_content', e.target.value, 'en')} rows="2" />
                                </div>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('content')} (AR)</label>
                                    <textarea className={modalStyles.textarea} value={formData.mission_content?.ar || ''} onChange={(e) => handleChange('cards', 'mission_content', e.target.value, 'ar')} dir="rtl" rows="2" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('icon')}</label>
                                    <div className={styles.iconSelectorContainer}>
                                        <div className={styles.searchBox}>
                                            <MdSearch />
                                            <input 
                                                type="text" 
                                                placeholder={t('search_icons')} 
                                                value={missionIconSearch} 
                                                onChange={(e) => setMissionIconSearch(e.target.value)}
                                                className={styles.searchInput}
                                            />
                                        </div>
                                        <div className={styles.iconGrid}>
                                            {filteredMissionIcons.map(iconName => {
                                                const IconComp = iconMap[iconName];
                                                return (
                                                    <button 
                                                        key={iconName}
                                                        type="button" 
                                                        className={`${styles.iconItem} ${formData.mission_icon === iconName ? styles.selectedIcon : ''}`}
                                                        onClick={() => setFormData({...formData, mission_icon: iconName})}
                                                        title={iconName}
                                                    >
                                                        <IconComp />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className={styles.selectedIconName}>
                                            {t('selected')}: <strong>{formData.mission_icon || 'rocketLaunch'}</strong>
                                        </div>
                                    </div>
                                </div>

                                <hr className={styles.formDivider} />

                                {/* Vision Section */}
                                <h4 className={styles.formSectionTitle}>{t('vision')}</h4>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('title')} (EN)</label>
                                    <input className={modalStyles.input} value={formData.vision_title?.en || ''} onChange={(e) => handleChange('cards', 'vision_title', e.target.value, 'en')} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('title')} (AR)</label>
                                    <input className={modalStyles.input} value={formData.vision_title?.ar || ''} onChange={(e) => handleChange('cards', 'vision_title', e.target.value, 'ar')} dir="rtl" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('content')} (EN)</label>
                                    <textarea className={modalStyles.textarea} value={formData.vision_content?.en || ''} onChange={(e) => handleChange('cards', 'vision_content', e.target.value, 'en')} rows="2" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('content')} (AR)</label>
                                    <textarea className={modalStyles.textarea} value={formData.vision_content?.ar || ''} onChange={(e) => handleChange('cards', 'vision_content', e.target.value, 'ar')} dir="rtl" rows="2" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('icon')}</label>
                                    <div className={styles.iconSelectorContainer}>
                                        <div className={styles.searchBox}>
                                            <MdSearch />
                                            <input 
                                                type="text" 
                                                placeholder={t('search_icons')} 
                                                value={visionIconSearch} 
                                                onChange={(e) => setVisionIconSearch(e.target.value)}
                                                className={styles.searchInput}
                                            />
                                        </div>
                                        <div className={styles.iconGrid}>
                                            {filteredVisionIcons.map(iconName => {
                                                const IconComp = iconMap[iconName];
                                                return (
                                                    <button 
                                                        key={iconName}
                                                        type="button" 
                                                        className={`${styles.iconItem} ${formData.vision_icon === iconName ? styles.selectedIcon : ''}`}
                                                        onClick={() => setFormData({...formData, vision_icon: iconName})}
                                                        title={iconName}
                                                    >
                                                        <IconComp />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className={styles.selectedIconName}>
                                            {t('selected')}: <strong>{formData.vision_icon || 'visibility'}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* End of Content Sections */}
                            </div>
                            <div className={modalStyles.modalFooter}>
                                <button type="button" className={modalStyles.cancelBtn} onClick={closeEditModal}>{t('cancel')}</button>
                                <button type="submit" className={modalStyles.saveBtn}><MdSave /> {t('save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Milestone Management Modal */}
            {isMilestoneModalOpen && (
                <div className={modalStyles.modalOverlay} onClick={closeMilestoneModal}>
                    <div className={modalStyles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={modalStyles.modalHeader}>
                            <h3 className={modalStyles.modalTitle}>
                                {editingMilestoneId ? t('edit_milestone') : t('add_new')}
                            </h3>
                            <button className={modalStyles.closeBtn} onClick={closeMilestoneModal}>
                                <MdClose />
                            </button>
                        </div>

                        <form className={modalStyles.modalForm} onSubmit={handleMilestoneSubmit}>
                            <div className={modalStyles.modalBody}>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('year')}</label>
                                    <input 
                                        type="text" 
                                        className={modalStyles.input} 
                                        value={milestoneFormData.year} 
                                        onChange={(e) => setMilestoneFormData({...milestoneFormData, year: e.target.value})} 
                                        required 
                                    />
                                </div>

                                <div className={modalStyles.formGrid}>
                                    <div className={modalStyles.formGroup}>
                                        <label className={modalStyles.label}>{t('title')} (EN)</label>
                                        <input 
                                            type="text" 
                                            className={modalStyles.input} 
                                            value={milestoneFormData['title[en]']} 
                                            onChange={(e) => setMilestoneFormData({...milestoneFormData, 'title[en]': e.target.value})} 
                                            required 
                                        />
                                    </div>
                                    <div className={modalStyles.formGroup}>
                                        <label className={modalStyles.label}>{t('title')} (AR)</label>
                                        <input 
                                            type="text" 
                                            className={modalStyles.input} 
                                            value={milestoneFormData['title[ar]']} 
                                            onChange={(e) => setMilestoneFormData({...milestoneFormData, 'title[ar]': e.target.value})} 
                                            dir="rtl" 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('description')} (EN)</label>
                                    <textarea 
                                        className={modalStyles.textarea} 
                                        value={milestoneFormData['description[en]']} 
                                        onChange={(e) => setMilestoneFormData({...milestoneFormData, 'description[en]': e.target.value})} 
                                        rows="2"
                                    />
                                </div>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('description')} (AR)</label>
                                    <textarea 
                                        className={modalStyles.textarea} 
                                        value={milestoneFormData['description[ar]']} 
                                        onChange={(e) => setMilestoneFormData({...milestoneFormData, 'description[ar]': e.target.value})} 
                                        dir="rtl" 
                                        rows="2"
                                    />
                                </div>

                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('icon')} / {t('image')}</label>
                                    
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
                                                        className={`${styles.iconItem} ${milestoneFormData.icon === iconName ? styles.selectedIcon : ''}`}
                                                        onClick={() => {
                                                            setMilestoneFormData({...milestoneFormData, icon: iconName});
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
                                            {t('selected')}: <strong>{milestoneFormData.icon}</strong>
                                        </div>
                                    </div>

                                    <div className={styles.uploadBox} style={{marginTop: '1rem'}}>
                                        <label className={styles.uploadLabel}>
                                            <input type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} />
                                            <MdImage size={24} />
                                            <span>{t('upload_custom_icon')}</span>
                                        </label>
                                        {imagePreview && (
                                            <div className={styles.previewContainer}>
                                                <img src={imagePreview} alt="Preview" style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover'}} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('display_order')}</label>
                                    <input 
                                        type="number" 
                                        className={modalStyles.input} 
                                        value={milestoneFormData.display_order} 
                                        onChange={(e) => setMilestoneFormData({...milestoneFormData, display_order: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className={modalStyles.modalFooter}>
                                <button type="button" className={modalStyles.cancelBtn} onClick={closeMilestoneModal}>
                                    {t('cancel')}
                                </button>
                                <button type="submit" className={modalStyles.saveBtn}>
                                    <MdSave /> {editingMilestoneId ? t('save') : t('add_new')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JourneySection;
