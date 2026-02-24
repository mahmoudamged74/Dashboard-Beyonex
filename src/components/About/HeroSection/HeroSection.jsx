import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdEdit, MdClose, MdSave, MdImage, MdAdd, MdDelete } from 'react-icons/md';
import styles from './HeroSection.module.css';

const HeroSection = ({ data, features, onUpdateAbout, onFeatureAction }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [featureFormData, setFeatureFormData] = useState({ title: { en: '', ar: '' }, display_order: 0 });
  const [editingFeatureId, setEditingFeatureId] = useState(null);

  const handleEdit = () => {
    setFormData({ ...data });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
  };

  const handleChange = (e, lang = null) => {
    const { name, value } = e.target;
    if (lang) {
      setFormData(prev => ({
        ...prev,
        [name]: { ...prev[name], [lang]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo_file: file, logo_preview: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();
    if (formData.logo_file) {
        submitData.append('logo_path', formData.logo_file);
    }
    
    // Append translated fields and icons
    ['hero_title', 'hero_subtitle', 'hero_description', 'journey_title', 'journey_description', 'vision_title', 'vision_content', 'mission_title', 'mission_content'].forEach(field => {
        if (formData[field]) {
            submitData.append(`${field}[en]`, formData[field].en || '');
            submitData.append(`${field}[ar]`, formData[field].ar || '');
        }
    });

    ['mission_icon', 'vision_icon'].forEach(field => {
        if (formData[field]) {
            submitData.append(field, formData[field]);
        }
    });

    onUpdateAbout(submitData);
    closeModal();
  };

  // Feature Handlers
  const handleFeatureEdit = (feature) => {
    setEditingFeatureId(feature.id);
    setFeatureFormData({ ...feature });
    setIsFeatureModalOpen(true);
  };

  const openAddFeature = () => {
    setEditingFeatureId(null);
    setFeatureFormData({ title: { en: '', ar: '' }, display_order: features.length });
    setIsFeatureModalOpen(true);
  };

  const closeFeatureModal = () => {
    setIsFeatureModalOpen(false);
    setFeatureFormData({ title: { en: '', ar: '' }, display_order: 0 });
  };

  const handleFeatureSubmit = (e) => {
    e.preventDefault();
    if (editingFeatureId) {
        onFeatureAction('edit', editingFeatureId, featureFormData);
    } else {
        onFeatureAction('add', null, featureFormData);
    }
    closeFeatureModal();
  };

  const handleFeatureChange = (e, lang = null) => {
    const { name, value } = e.target;
    if (lang) {
        setFeatureFormData(prev => ({
            ...prev,
            title: { ...prev.title, [lang]: value }
        }));
    } else {
        setFeatureFormData(prev => ({ ...prev, [name]: value }));
    }
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
             <h1 className={styles.previewTitle}>{data.hero_title?.en}</h1>
             <h3 className={styles.previewSubtitle}>{data.hero_subtitle?.en}</h3>
             <p className={styles.previewDesc}>{data.hero_description?.en}</p>
          </div>
          <div className={styles.previewText} dir="rtl">
             <h4 className={styles.langLabel}>العربية</h4>
             <h1 className={styles.previewTitle}>{data.hero_title?.ar}</h1>
             <h3 className={styles.previewSubtitle}>{data.hero_subtitle?.ar}</h3>
             <p className={styles.previewDesc}>{data.hero_description?.ar}</p>
          </div>
        </div>
        <div className={styles.previewImageContainer}>
          <div className={styles.logoLabel}>{t('main_logo')}</div>
          <img src={data.logo_path || '/assets/logo.png'} alt="Logo" className={styles.previewImage} />
        </div>
      </div>

      <div className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
            <h3 className={styles.featuresTitle}>{t('hero_features')}</h3>
            <button className={styles.addFeatureBtn} onClick={openAddFeature}>
                <MdAdd /> {t('add_feature')}
            </button>
        </div>
        <div className={styles.featuresGrid}>
            {features.map(feature => (
                <div key={feature.id} className={styles.featureItem}>
                    <div className={styles.featureName}>
                        {isRtl ? feature.title?.ar : feature.title?.en}
                    </div>
                    <div className={styles.featureActions}>
                        <button className={styles.miniBtn} onClick={() => handleFeatureEdit(feature)}>
                            <MdEdit />
                        </button>
                        <button className={`${styles.miniBtn} ${styles.deleteBtn}`} onClick={() => onFeatureAction('delete', feature.id)}>
                            <MdDelete />
                        </button>
                    </div>
                </div>
            ))}
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
                  <label className={styles.label}>{t('main_logo')}</label>
                  <div className={styles.fileInputWrapper}>
                    <img src={formData.logo_preview || formData.logo_path || '/assets/logo.png'} alt="Preview" style={{height: '60px', borderRadius:'4px'}} />
                    <label className={styles.fileBtn}>
                      <MdImage /> {t('change_logo')}
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
                    name="hero_title"
                    value={formData.hero_title?.en || ''}
                    onChange={(e) => handleChange(e, 'en')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('subtitle')} (EN)</label>
                  <input 
                    className={styles.input}
                    name="hero_subtitle"
                    value={formData.hero_subtitle?.en || ''}
                    onChange={(e) => handleChange(e, 'en')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('description')} (EN)</label>
                  <textarea 
                    className={styles.textarea}
                    name="hero_description"
                    value={formData.hero_description?.en || ''}
                    onChange={(e) => handleChange(e, 'en')}
                    rows="4"
                  />
                </div>

                {/* Arabic Content */}
                <h4 style={{marginTop:'1rem', color:'var(--primary)'}}>{t('arabic_content')}</h4>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('title')} (AR)</label>
                  <input 
                    className={styles.input}
                    name="hero_title"
                    value={formData.hero_title?.ar || ''}
                    onChange={(e) => handleChange(e, 'ar')}
                    dir="rtl"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('subtitle')} (AR)</label>
                  <input 
                    className={styles.input}
                    name="hero_subtitle"
                    value={formData.hero_subtitle?.ar || ''}
                    onChange={(e) => handleChange(e, 'ar')}
                    dir="rtl"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('description')} (AR)</label>
                  <textarea 
                    className={styles.textarea}
                    name="hero_description"
                    value={formData.hero_description?.ar || ''}
                    onChange={(e) => handleChange(e, 'ar')}
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

      {/* Feature Modal */}
      {isFeatureModalOpen && (
        <div className={styles.modalOverlay} onClick={closeFeatureModal}>
          <div className={`${styles.modalContent} ${styles.smallModal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editingFeatureId ? t('edit_feature') : t('add_feature')}</h3>
              <button className={styles.closeBtn} onClick={closeFeatureModal}>
                <MdClose />
              </button>
            </div>

            <form className={styles.modalForm} onSubmit={handleFeatureSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('title')} (EN)</label>
                  <input 
                    className={styles.input}
                    name="title_en"
                    value={featureFormData.title?.en || ''}
                    onChange={(e) => handleFeatureChange(e, 'en')}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('title')} (AR)</label>
                  <input 
                    className={styles.input}
                    name="title_ar"
                    value={featureFormData.title?.ar || ''}
                    onChange={(e) => handleFeatureChange(e, 'ar')}
                    dir="rtl"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('display_order')}</label>
                  <input 
                    type="number"
                    className={styles.input}
                    name="display_order"
                    value={featureFormData.display_order || 0}
                    onChange={handleFeatureChange}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeFeatureModal}>
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
