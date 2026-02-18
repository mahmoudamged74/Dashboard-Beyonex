import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdEdit, MdClose, MdSave, MdImage } from 'react-icons/md';
import styles from './HeroSection.module.css';

const HeroSection = ({ data, onUpdate }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleEdit = () => {
    setFormData({ ...data });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    closeModal();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('hero_section') || 'Hero Section'}</h2>
        <button className={styles.editBtn} onClick={handleEdit}>
          <MdEdit /> {t('edit')}
        </button>
      </div>

      <div className={styles.previewContent}>
        <div className={styles.previewTextWrapper}>
          <div className={styles.previewText} dir="ltr">
             <h4 className={styles.langLabel}>English</h4>
             <h1 className={styles.previewTitle}>{data.titleEn}</h1>
             <h3 className={styles.previewSubtitle}>{data.subtitleEn}</h3>
             <p className={styles.previewDesc}>{data.descEn}</p>
          </div>
          <div className={styles.previewText} dir="rtl">
             <h4 className={styles.langLabel}>العربية</h4>
             <h1 className={styles.previewTitle}>{data.titleAr}</h1>
             <h3 className={styles.previewSubtitle}>{data.subtitleAr}</h3>
             <p className={styles.previewDesc}>{data.descAr}</p>
          </div>
        </div>
        <div className={styles.previewImageContainer}>
          <img src={data.image} alt="Hero" className={styles.previewImage} />
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t('edit_hero_section') || 'Edit Hero Section'}</h3>
              <button className={styles.closeBtn} onClick={closeModal}>
                <MdClose />
              </button>
            </div>

            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {/* Image Section */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('image')}</label>
                  <div className={styles.fileInputWrapper}>
                    <img src={formData.image} alt="Preview" style={{height: '60px', borderRadius:'4px'}} />
                    <label className={styles.fileBtn}>
                      <MdImage /> {t('change_image')}
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
                    </label>
                  </div>
                </div>

                {/* English Content */}
                <h4 style={{marginTop:'1rem', color:'var(--primary)'}}>{t('english_content')}</h4>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('title')} (EN)</label>
                  <input 
                    className={styles.input}
                    name="titleEn"
                    value={formData.titleEn || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('subtitle')} (EN)</label>
                  <input 
                    className={styles.input}
                    name="subtitleEn"
                    value={formData.subtitleEn || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('description')} (EN)</label>
                  <textarea 
                    className={styles.textarea}
                    name="descEn"
                    value={formData.descEn || ''}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>

                {/* Arabic Content */}
                <h4 style={{marginTop:'1rem', color:'var(--primary)'}}>{t('arabic_content')}</h4>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('title')} (AR)</label>
                  <input 
                    className={styles.input}
                    name="titleAr"
                    value={formData.titleAr || ''}
                    onChange={handleChange}
                    dir="rtl"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('subtitle')} (AR)</label>
                  <input 
                    className={styles.input}
                    name="subtitleAr"
                    value={formData.subtitleAr || ''}
                    onChange={handleChange}
                    dir="rtl"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('description')} (AR)</label>
                  <textarea 
                    className={styles.textarea}
                    name="descAr"
                    value={formData.descAr || ''}
                    onChange={handleChange}
                    dir="rtl"
                    rows="4"
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                  {t('cancel')}
                </button>
                <button type="submit" className={styles.saveBtn}>
                  <MdSave /> {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
