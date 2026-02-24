import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    MdEdit, 
    MdSave, 
    MdClose,
    MdAdd,
    MdDelete,
    MdImage,
    MdEmail,
    MdPerson
} from 'react-icons/md';
import styles from './TeamSection.module.css';

const TeamSection = ({ teamMembers, onAction }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        'name[en]': '',
        'name[ar]': '',
        'title[en]': '',
        'title[ar]': '',
        email: '',
        display_order: '0',
        status: '1'
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleOpenModal = (item = null) => {
        if (item) {
            setFormData({
                'name[en]': item.name?.en || '',
                'name[ar]': item.name?.ar || '',
                'title[en]': item.title?.en || '',
                'title[ar]': item.title?.ar || '',
                email: item.email || '',
                display_order: item.display_order?.toString() || '0',
                status: item.status ? '1' : '0'
            });
            setEditingId(item.id);
            setImagePreview(item.image_path || null);
        } else {
            setFormData({
                'name[en]': '',
                'name[ar]': '',
                'title[en]': '',
                'title[ar]': '',
                email: '',
                display_order: '0',
                status: '1'
            });
            setEditingId(null);
            setImagePreview(null);
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = new FormData();
        
        Object.keys(formData).forEach(key => {
            submitData.append(key, formData[key]);
        });

        if (imageFile) {
            submitData.append('image', imageFile);
        }

        onAction(editingId ? 'edit' : 'add', editingId, submitData);
        setIsModalOpen(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t('team_members')}</h2>
                <button className={styles.addBtn} onClick={() => handleOpenModal()}>
                    <MdAdd size={20} /> {t('add_team_member')}
                </button>
            </div>

            <div className={styles.grid}>
                {teamMembers.map((item) => (
                    <div className={styles.card} key={item.id}>
                        <div className={styles.cardActions}>
                            <button className={styles.miniBtn} onClick={() => handleOpenModal(item)} title={t('edit')}>
                                <MdEdit />
                            </button>
                            <button className={`${styles.miniBtn} ${styles.deleteBtn}`} onClick={() => onAction('delete', item.id)} title={t('delete')}>
                                <MdDelete />
                            </button>
                        </div>
                        <div className={styles.imageWrapper}>
                            {item.image_path ? (
                                <img src={item.image_path} alt={isRtl ? item.name?.ar : item.name?.en} />
                            ) : (
                                <div className={styles.placeholder}>
                                    <MdPerson />
                                </div>
                            )}
                        </div>
                        <h3 className={styles.memberName}>
                            {isRtl ? item.name?.ar : item.name?.en}
                        </h3>
                        <p className={styles.memberTitle}>
                            {isRtl ? item.title?.ar : item.title?.en}
                        </p>
                        <p className={styles.memberEmail}>
                            <MdEmail size={14} /> {item.email}
                        </p>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {editingId ? t('edit_team_member') : t('add_team_member')}
                            </h3>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                                <MdClose />
                            </button>
                        </div>

                        <form className={styles.modalForm} onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('name')} (EN)</label>
                                        <input 
                                            type="text"
                                            className={styles.input}
                                            value={formData['name[en]']}
                                            onChange={(e) => setFormData({...formData, 'name[en]': e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('name')} (AR)</label>
                                        <input 
                                            type="text"
                                            className={styles.input}
                                            value={formData['name[ar]']}
                                            onChange={(e) => setFormData({...formData, 'name[ar]': e.target.value})}
                                            required
                                            dir="rtl"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('member_title')} (EN)</label>
                                        <input 
                                            type="text"
                                            className={styles.input}
                                            value={formData['title[en]']}
                                            onChange={(e) => setFormData({...formData, 'title[en]': e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('member_title')} (AR)</label>
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
                                    <label className={styles.label}>{t('member_email')}</label>
                                    <input 
                                        type="email"
                                        className={styles.input}
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('member_image')}</label>
                                    <div className={styles.uploadBox}>
                                        <label className={styles.uploadLabel}>
                                            <input type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} />
                                            <MdImage size={24} />
                                            <span>{t('member_image')}</span>
                                        </label>
                                        {imagePreview && (
                                            <div className={styles.previewContainer}>
                                                <img src={imagePreview} alt="Preview" />
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

export default TeamSection;
