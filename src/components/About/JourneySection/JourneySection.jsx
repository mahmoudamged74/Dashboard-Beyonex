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
    MdStar
} from 'react-icons/md';
import styles from './JourneySection.module.css';
import modalStyles from '../HeroSection/HeroSection.module.css'; // Reusing modal overlay/content structure

const JourneySection = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    // Initial Data State
    const [data, setData] = useState({
        header: {
            titleEn: 'Our Journey',
            titleAr: 'رحلتنا',
            descEn: 'From a small startup to a leading tech company, our journey has been marked by innovation and excellence.',
            descAr: 'من شركة ناشئة صغيرة إلى شركة تقنية رائدة، تميزت رحلتنا بالابتكار والتميز.'
        },
        cards: [
            {
                id: 'mission',
                icon: 'mission', // Helper to resolve icon
                titleEn: 'Our Mission',
                titleAr: 'مهمتنا',
                descEn: 'To empower businesses to maximize technology benefits by delivering sophisticated software solutions.',
                descAr: 'نهدف إلى تمكين الشركات من تحقيق أقصى استفادة من التكنولوجيا من خلال تقديم حلول برمجية متطورة.'
            },
            {
                id: 'vision',
                icon: 'vision',
                titleEn: 'Our Vision',
                titleAr: 'رؤيتنا',
                descEn: 'To be the preferred technical partner for companies in the region by delivering innovative solutions.',
                descAr: 'أن نكون الشريك التقني المفضل للشركات في المنطقة من خلال تقديم حلول مبتكرة.'
            }
        ],
        timeline: [
            {
                id: 1,
                year: '2020',
                icon: 'start',
                titleEn: 'The Beginning',
                titleAr: 'البداية',
                descEn: 'Beyonex IT was founded with a vision to create digital revolution.',
                descAr: 'تأسست بيونكس IT برؤية لإحداث ثورة في الحلول الرقمية في المنطقة.'
            },
            {
                id: 2,
                year: '2021',
                icon: 'team',
                titleEn: 'Team Expansion',
                titleAr: 'توسع الفريق',
                descEn: 'Our team grew to include talented developers and tech experts.',
                descAr: 'وسعنا فريقنا بمطورين ومصممين وخبراء تقنية موهوبين.'
            },
            {
                id: 3,
                year: '2023',
                icon: 'global',
                titleEn: 'Global Reach',
                titleAr: 'الانتشار العالمي',
                descEn: 'Expanded our services globally serving clients in multiple countries.',
                descAr: 'وسعنا خدماتنا دولياً لخدمة العملاء في عدة دول.'
            },
            {
                id: 4,
                year: '2025',
                icon: 'award',
                titleEn: 'Industry Leader',
                titleAr: 'ريادة الصناعة',
                descEn: 'Recognized as a leading provider of technology solutions.',
                descAr: 'معترف بنا كمزود رائد لحلول التكنولوجيا مع العديد من الجوائز.'
            }
        ]
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    // Icon Helper
    const getIcon = (name) => {
        switch(name) {
            case 'mission': return <MdRocketLaunch />;
            case 'vision': return <MdVisibility />;
            case 'start': return <MdFlag />;
            case 'team': return <MdGroups />;
            case 'global': return <MdPublic />;
            case 'award': return <MdStar />;
            default: return <MdStar />;
        }
    };

    // Icon/Image Helper
    const renderIconOrImage = (item) => {
        if (item.image) {
            return <img src={item.image} alt={item.titleEn} style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%'}} />;
        }
        return getIcon(item.icon);
    };

    // Edit Handlers
    const handleEdit = () => {
        setFormData(JSON.parse(JSON.stringify(data))); // Deep copy
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({});
    };

    const handleChange = (section, field, value, index = null) => {
        setFormData(prev => {
            const newData = { ...prev };
            if (section === 'header') {
                newData.header[field] = value;
            } else if (section === 'cards' && index !== null) {
                newData.cards[index][field] = value;
            } else if (section === 'timeline' && index !== null) {
                newData.timeline[index][field] = value;
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

    const handleSave = (e) => {
        e.preventDefault();
        setData(formData); // In real app, API call here
        closeModal();
    };

    return (
        <div className={styles.container}>
            {/* Edit Controls */}
            <div className={styles.controls}>
                <button className={styles.editBtn} onClick={handleEdit} title={t('edit')}>
                    <MdEdit />
                </button>
            </div>

            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.mainTitle}>
                    {isRtl ? data.header.titleAr : data.header.titleEn}
                </h2>
                <p className={styles.mainDesc}>
                    {isRtl ? data.header.descAr : data.header.descEn}
                </p>
            </div>

            {/* Mission & Vision Cards */}
            <div className={styles.cardsGrid}>
                {data.cards.map(card => (
                    <div key={card.id} className={styles.card}>
                        <div className={styles.cardIcon}>
                            {renderIconOrImage(card)}
                        </div>
                        <h3 className={styles.cardTitle}>
                            {isRtl ? card.titleAr : card.titleEn}
                        </h3>
                        <p className={styles.cardDesc}>
                            {isRtl ? card.descAr : card.descEn}
                        </p>
                    </div>
                ))}
            </div>

            {/* Timeline */}
            <div className={styles.timeline}>
                {data.timeline.map((item, index) => (
                    <div key={item.id} className={styles.timelineItem}>
                        <div className={styles.timelineDot}>
                            {renderIconOrImage(item)}
                        </div>
                        <span className={styles.year}>{item.year}</span>
                        <h4 className={styles.itemTitle}>
                            {isRtl ? item.titleAr : item.titleEn}
                        </h4>
                        <p className={styles.itemDesc}>
                            {isRtl ? item.itemDesc :  // Typo check: checking if descAr exists
                             (isRtl ? item.descAr : item.descEn)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className={modalStyles.modalOverlay} onClick={closeModal}>
                    <div className={modalStyles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={modalStyles.modalHeader}>
                            <h3 className={modalStyles.modalTitle}>{t('edit_journey') || 'Edit Journey'}</h3>
                            <button className={modalStyles.closeBtn} onClick={closeModal}><MdClose /></button>
                        </div>
                        
                        <form className={styles.modalForm} onSubmit={handleSave}>
                            <div className={styles.modalBody}>
                                {/* Header Section */}
                                <h4 className={styles.formSectionTitle}>{t('main_info')}</h4>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('title')} (EN)</label>
                                    <input className={modalStyles.input} value={formData.header.titleEn} onChange={(e) => handleChange('header', 'titleEn', e.target.value)} />
                                </div>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('title')} (AR)</label>
                                    <input className={modalStyles.input} value={formData.header.titleAr} onChange={(e) => handleChange('header', 'titleAr', e.target.value)} dir="rtl" />
                                </div>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('description')} (EN)</label>
                                    <textarea className={modalStyles.textarea} value={formData.header.descEn} onChange={(e) => handleChange('header', 'descEn', e.target.value)} rows="2" />
                                </div>
                                <div className={modalStyles.formGroup}>
                                    <label className={modalStyles.label}>{t('description')} (AR)</label>
                                    <textarea className={modalStyles.textarea} value={formData.header.descAr} onChange={(e) => handleChange('header', 'descAr', e.target.value)} dir="rtl" rows="2" />
                                </div>

                                {/* Cards Section */}
                                <h4 className={styles.formSectionTitle}>Mission & Vision</h4>
                                {formData.cards.map((card, idx) => (
                                    <div key={card.id} className={styles.timelineItemEditor} style={{marginBottom:'1rem'}}>
                                        <h5 style={{color:'var(--text-muted)', marginBottom:'0.5rem'}}>{card.id.toUpperCase()}</h5>
                                        
                                        <div className={modalStyles.formGroup}>
                                            <label className={modalStyles.label}>{t('image') || 'Image'}</label>
                                            <div className={styles.fileInputWrapper} style={{display:'flex', alignItems:'center', gap:'1rem', background:'rgba(255,255,255,0.05)', padding:'0.5rem', borderRadius:'8px'}}>
                                                {card.image && <img src={card.image} alt="Preview" style={{width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover'}} />}
                                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cards', idx)} style={{color:'var(--text-muted)'}} />
                                            </div>
                                        </div>

                                        <div className={modalStyles.formGroup}>
                                            <label className={modalStyles.label}>{t('title')} (EN)</label>
                                            <input className={modalStyles.input} value={card.titleEn} onChange={(e) => handleChange('cards', 'titleEn', e.target.value, idx)} />
                                        </div>
                                         <div className={modalStyles.formGroup}>
                                            <label className={modalStyles.label}>{t('title')} (AR)</label>
                                            <input className={modalStyles.input} value={card.titleAr} onChange={(e) => handleChange('cards', 'titleAr', e.target.value, idx)} dir="rtl" />
                                        </div>
                                         <div className={modalStyles.formGroup}>
                                            <label className={modalStyles.label}>{t('description')} (EN)</label>
                                            <textarea className={modalStyles.textarea} value={card.descEn} onChange={(e) => handleChange('cards', 'descEn', e.target.value, idx)} rows="2"/>
                                        </div>
                                         <div className={modalStyles.formGroup}>
                                            <label className={modalStyles.label}>{t('description')} (AR)</label>
                                            <textarea className={modalStyles.textarea} value={card.descAr} onChange={(e) => handleChange('cards', 'descAr', e.target.value, idx)} dir="rtl" rows="2"/>
                                        </div>
                                    </div>
                                ))}

                                {/* Timeline Section */}
                                <h4 className={styles.formSectionTitle}>
                                    {t('timeline') || 'Timeline'}
                                    <button type="button" onClick={addTimelineItem} style={{float: isRtl?'left':'right', background:'transparent', border:'none', color:'var(--primary)', cursor:'pointer', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'0.2rem'}}>
                                        <MdAdd /> {t('add_new')}
                                    </button>
                                </h4>
                                {formData.timeline.map((item, idx) => (
                                    <div key={item.id} className={styles.timelineItemEditor} style={{marginBottom:'1rem'}}>
                                        <button type="button" className={styles.removeTimelineBtn} onClick={() => removeTimelineItem(idx)}><MdDelete/></button>
                                        
                                        <div className={modalStyles.formGroup}>
                                            <label className={modalStyles.label}>{t('image') || 'Image/Icon'}</label>
                                            <div className={styles.fileInputWrapper} style={{display:'flex', alignItems:'center', gap:'1rem', background:'rgba(255,255,255,0.05)', padding:'0.5rem', borderRadius:'8px'}}>
                                                {item.image && <img src={item.image} alt="Preview" style={{width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover'}} />}
                                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'timeline', idx)} style={{color:'var(--text-muted)'}} />
                                            </div>
                                        </div>

                                        <div className={modalStyles.formGroup}>
                                            <label className={modalStyles.label}>{t('year') || 'Year'}</label>
                                            <input className={modalStyles.input} value={item.year} onChange={(e) => handleChange('timeline', 'year', e.target.value, idx)} style={{width:'100px'}} />
                                        </div>
                                        <div className={modalStyles.formGroup}>
                                            <label className={modalStyles.label}>{t('title')} (EN)</label>
                                            <input className={modalStyles.input} value={item.titleEn} onChange={(e) => handleChange('timeline', 'titleEn', e.target.value, idx)} />
                                        </div>
                                        <div className={modalStyles.formGroup}>
                                            <label className={modalStyles.label}>{t('title')} (AR)</label>
                                            <input className={modalStyles.input} value={item.titleAr} onChange={(e) => handleChange('timeline', 'titleAr', e.target.value, idx)} dir="rtl" />
                                        </div>
                                        <div className={modalStyles.formGroup}>
                                            <label className={modalStyles.label}>{t('description')} (EN)</label>
                                            <textarea className={modalStyles.textarea} value={item.descEn} onChange={(e) => handleChange('timeline', 'descEn', e.target.value, idx)} rows="2"/>
                                        </div>
                                        <div className={modalStyles.formGroup}>
                                            <label className={modalStyles.label}>{t('description')} (AR)</label>
                                            <textarea className={modalStyles.textarea} value={item.descAr} onChange={(e) => handleChange('timeline', 'descAr', e.target.value, idx)} dir="rtl" rows="2"/>
                                        </div>
                                    </div>
                                ))}

                            </div>
                            <div className={modalStyles.modalFooter}>
                                <button type="button" className={modalStyles.cancelBtn} onClick={closeModal}>{t('cancel')}</button>
                                <button type="submit" className={modalStyles.saveBtn}><MdSave /> {t('save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JourneySection;
