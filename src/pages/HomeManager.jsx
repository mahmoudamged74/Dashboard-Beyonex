import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose, MdSave, MdCloudUpload } from 'react-icons/md';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import styles from './ContentManager.module.css';

const HomeManager = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    titleEn: '',
    titleAr: '',
    subtitleEn: '',
    subtitleAr: '',
    descriptionEn: '',
    descriptionAr: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const truncateText = (text, wordLimit) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const fetchHeroSection = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('admin/hero-section');
      const data = res.data.data;
      setHeroData(data);
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroSection();
  }, []);

  // Update formData when heroData is fetched
  useEffect(() => {
    if (heroData) {
      setFormData({
        titleEn: heroData.title?.en || '',
        titleAr: heroData.title?.ar || '',
        subtitleEn: heroData.subtitle?.en || '',
        subtitleAr: heroData.subtitle?.ar || '',
        descriptionEn: heroData.description?.en || '',
        descriptionAr: heroData.description?.ar || '',
      });
      setImagePreview(heroData.image || null);
    }
  }, [heroData]);


  // ── Field change ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Image change ───────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Save (PUT) ─────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const body = new FormData();
    body.append('_method', 'PUT');
    body.append('title[ar]', formData.titleAr);
    body.append('title[en]', formData.titleEn);
    body.append('subtitle[ar]', formData.subtitleAr);
    body.append('subtitle[en]', formData.subtitleEn);
    body.append('description[ar]', formData.descriptionAr);
    body.append('description[en]', formData.descriptionEn);
    if (imageFile) {
      body.append('image', imageFile);
    }

    try {
      const res = await axiosInstance.post('admin/hero-section', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(res.data.message || t('save_success'));
      fetchHeroSection(); // refresh
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_generic'));
    } finally {
      setSaving(false);
    }
  };


  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className="fade-in">
        <div className={styles.header}>
          <h2 className={styles.title}>{t('hero_section')}</h2>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <span className="spinner" />
          </div>
        ) : (
          heroData && (
            <div className={styles.heroCard}>
              {/* Image Section */}
              <div 
                className={styles.heroImageSection} 
                onClick={() => fileInputRef.current.click()}
                title={t('click_to_upload')}
              >
                <img
                  src={imagePreview || heroData.image}
                  alt="Hero"
                  className={styles.heroMainImage}
                  onError={(e) => { e.target.src = '/assets/3.png'; }}
                />
                <div className={styles.imageOverlay}>
                  <MdCloudUpload size={48} />
                  <span>{t('change_image')}</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Content Grid */}
              <div className={styles.contentGrid}>
                {/* English Section */}
                <div className={styles.languageSection}>
                  <div className={styles.langHeader}>
                    <span className={styles.langTitle}>English Content</span>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('title')} (EN)</label>
                    <input 
                      type="text" 
                      name="titleEn" 
                      value={formData.titleEn} 
                      onChange={handleChange} 
                      className={styles.input} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('subtitle')} (EN)</label>
                    <input 
                      type="text" 
                      name="subtitleEn" 
                      value={formData.subtitleEn} 
                      onChange={handleChange} 
                      className={styles.input} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('description')} (EN)</label>
                    <textarea 
                      name="descriptionEn" 
                      value={formData.descriptionEn} 
                      onChange={handleChange} 
                      className={styles.input} 
                      rows="4" 
                    />
                  </div>
                </div>

                {/* Arabic Section */}
                <div className={styles.languageSection} dir="rtl">
                  <div className={styles.langHeader}>
                    <span className={styles.langTitle}>المحتوى العربي</span>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('title')} (AR)</label>
                    <input 
                      type="text" 
                      name="titleAr" 
                      value={formData.titleAr} 
                      onChange={handleChange} 
                      className={styles.input} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('subtitle')} (AR)</label>
                    <input 
                      type="text" 
                      name="subtitleAr" 
                      value={formData.subtitleAr} 
                      onChange={handleChange} 
                      className={styles.input} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('description')} (AR)</label>
                    <textarea 
                      name="descriptionAr" 
                      value={formData.descriptionAr} 
                      onChange={handleChange} 
                      className={styles.input} 
                      rows="4" 
                    />
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className={styles.cardActionArea}>
                <button 
                  className={styles.saveBtn} 
                  onClick={handleSave} 
                  disabled={saving}
                >
                  {saving ? <span className="spinner-small" /> : <MdSave size={20} />}
                  {saving ? t('saving') : t('save_changes')}
                </button>
              </div>
            </div>
          )
        )}
      </div>

    </div>
  );
};

export default HomeManager;
