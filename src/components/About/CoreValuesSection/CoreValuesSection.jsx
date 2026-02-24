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
import styles from './CoreValuesSection.module.css';
import { iconMap } from '../../../utils/iconMap';

const CoreValuesSection = ({ coreValues, onAction }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        'title[en]': '',
        'title[ar]': '',
        'description[en]': '',
        'description[ar]': '',
        icon: 'gem',
        display_order: '0',
        status: '1'
    });
    const [iconSearch, setIconSearch] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Filter icons
    const filteredIcons = Object.keys(iconMap).filter(name => 
        name.toLowerCase().includes(iconSearch.toLowerCase())
    );

    const handleOpenModal = (item = null) => {
        if (item) {
            setFormData({
                'title[en]': item.title?.en || '',
                'title[ar]': item.title?.ar || '',
                'description[en]': item.description?.en || '',
                'description[ar]': item.description?.ar || '',
                icon: item.icon || 'gem',
                display_order: item.display_order?.toString() || '0',
                status: item.status ? '1' : '0'
            });
            setEditingId(item.id);
            setImagePreview(item.icon && item.icon.startsWith('http') ? item.icon : null);
        } else {
            setFormData({
                'title[en]': '',
                'title[ar]': '',
                'description[en]': '',
                'description[ar]': '',
                icon: 'gem',
                display_order: '0',
                status: '1'
            });
            setEditingId(null);
            setImagePreview(null);
        }
        setImageFile(null);
        setIconSearch('');
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setFormData({ ...formData, icon: '' });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (key === 'icon' && imageFile) return; 
            submitData.append(key, formData[key]);
        });

        if (imageFile) {
            submitData.append('icon', imageFile);
        } else {
            submitData.append('icon', formData.icon);
        }

        onAction(editingId ? 'edit' : 'add', editingId, submitData);
        setIsModalOpen(false);
    };

    const renderIcon = (icon) => {
        if (!icon) return null;
        if (icon.startsWith('http')) {
            return <img src={icon} alt="icon" style={{width: '30px', height: '30px', objectFit: 'contain'}} />;
        }
        const IconComp = iconMap[icon] || iconMap['gem'];
        return <IconComp />;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.addBtn} onClick={() => handleOpenModal()}>
                    <MdAdd size={20} /> {t('add_core_value')}
                </button>
                <div style={{textAlign: 'center', width: '100%'}}>
                    <h2 className={styles.title}>{t('core_values')}</h2>
                </div>
            </div>

            <div className={styles.grid}>
                {coreValues.map((item) => (
                    <div className={styles.card} key={item.id}>
                        <div className={styles.iconWrapper}>
                            {renderIcon(item.icon)}
                        </div>
                        <h3 className={styles.cardTitle}>
                            {isRtl ? item.title?.ar : item.title?.en}
                        </h3>
                        <p className={styles.cardDesc}>
                            {isRtl ? item.description?.ar : item.description?.en}
                        </p>
                        <div className={styles.cardActions}>
                            <button className={styles.miniBtn} onClick={() => handleOpenModal(item)} title={t('edit')}>
                                <MdEdit />
                            </button>
                            <button className={`${styles.miniBtn} ${styles.deleteBtn}`} onClick={() => onAction('delete', item.id)} title={t('delete')}>
                                <MdDelete />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {editingId ? t('edit_core_value') : t('add_core_value')}
                            </h3>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                                <MdClose />
                            </button>
                        </div>

                        <form className={styles.modalForm} onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('title')} (EN)</label>
                                        <input 
                                            type="text"
                                            className={styles.input}
                                            value={formData['title[en]']}
                                            onChange={(e) => setFormData({...formData, 'title[en]': e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('title')} (AR)</label>
                                        <input 
                                            type="text"
                                            className={styles.input}
                                            value={formData['title[ar]']}
                                            onChange={(e) => setFormData({...formData, 'title[ar]': e.target.value})}
                                            required
                                            dir="rtl"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('description')} (EN)</label>
                                    <textarea 
                                        className={styles.textarea}
                                        value={formData['description[en]']}
                                        onChange={(e) => setFormData({...formData, 'description[en]': e.target.value})}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('description')} (AR)</label>
                                    <textarea 
                                        className={styles.textarea}
                                        value={formData['description[ar]']}
                                        onChange={(e) => setFormData({...formData, 'description[ar]': e.target.value})}
                                        required
                                        dir="rtl"
                                    />
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
                                                        className={`${styles.iconItem} ${formData.icon === iconName ? styles.selectedIcon : ''}`}
                                                        onClick={() => {
                                                            setFormData({...formData, icon: iconName});
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
                                            {t('selected')}: <strong>{formData.icon || t('none')}</strong>
                                        </div>
                                    </div>

                                    <div className={styles.uploadBox}>
                                        <label className={styles.uploadLabel}>
                                            <input type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} />
                                            <MdImage size={24} />
                                            <span>{t('upload_custom_icon')}</span>
                                        </label>
                                        {imagePreview && (
                                            <div className={styles.previewContainer}>
                                                <img src={imagePreview} alt="Preview" style={{width: '60px', height: '60px', objectFit: 'contain', borderRadius: '50%'}} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('display_order')}</label>
                                    <input 
                                        type="number"
                                        className={styles.input}
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
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

export default CoreValuesSection;
