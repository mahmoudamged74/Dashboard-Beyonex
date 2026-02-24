import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdEdit, MdClose, MdSave, MdCloudUpload } from 'react-icons/md';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import styles from './ContentManager.module.css';
import AboutManager from '../components/AboutManager';

const HomeManager = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // ── Modal open / close ─────────────────────────────────────────────────────
  const openModal = () => {
    if (!heroData) return;
    setFormData({
      titleEn: heroData.title?.en || '',
      titleAr: heroData.title?.ar || '',
      subtitleEn: heroData.subtitle?.en || '',
      subtitleAr: heroData.subtitle?.ar || '',
      descriptionEn: heroData.description?.en || '',
      descriptionAr: heroData.description?.ar || '',
    });
    setImageFile(null);
    setImagePreview(heroData.image || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setImageFile(null);
    setImagePreview(null);
  };

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') closeModal(); };
    if (isModalOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

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
      closeModal();
      fetchHeroSection(); // refresh table
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_generic'));
    } finally {
      setSaving(false);
    }
  };

  // ── Modal Component ────────────────────────────────────────────────────────
  const Modal = () => (
    <div className={styles.modalOverlay} onClick={closeModal} style={{ zIndex: 9999 }}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t('edit_content')}</h3>
          <button className={styles.closeBtn} onClick={closeModal}><MdClose /></button>
        </div>

        <form onSubmit={handleSave}>
          <div className={styles.modalBody}>

            {/* Image Upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('image')}</label>
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  cursor: 'pointer',
                  border: '2px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ height: '120px', width: '120px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ) : (
                  <MdCloudUpload size={40} color="var(--primary)" />
                )}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {t('click_to_upload') || 'Click to upload'}
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* English Fields */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('title')} (EN)</label>
              <input type="text" name="titleEn" value={formData.titleEn} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('subtitle')} (EN)</label>
              <input type="text" name="subtitleEn" value={formData.subtitleEn} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('description')} (EN)</label>
              <textarea name="descriptionEn" value={formData.descriptionEn} onChange={handleChange} className={styles.input} rows="3" />
            </div>

            {/* Arabic Fields */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('title')} (AR)</label>
              <input type="text" name="titleAr" value={formData.titleAr} onChange={handleChange} className={styles.input} dir="rtl" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('subtitle')} (AR)</label>
              <input type="text" name="subtitleAr" value={formData.subtitleAr} onChange={handleChange} className={styles.input} dir="rtl" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('description')} (AR)</label>
              <textarea name="descriptionAr" value={formData.descriptionAr} onChange={handleChange} className={styles.input} dir="rtl" rows="3" />
            </div>

          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={closeModal} className={styles.btnCancel}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              <MdSave />
              {saving ? t('saving') : t('save_changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

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
          <div className={`glass-panel ${styles.tableContainer}`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('image')}</th>
                  <th>{t('title')} (EN)</th>
                  <th>{t('title')} (AR)</th>
                  <th>{t('subtitle')} (EN)</th>
                  <th>{t('subtitle')} (AR)</th>
                  <th>{t('description')} (EN)</th>
                  <th>{t('description')} (AR)</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {heroData && (
                  <tr>
                    <td>
                      <img
                        src={heroData.image}
                        alt="Hero"
                        className={styles.imgPreview}
                        onError={(e) => { e.target.src = '/assets/3.png'; }}
                      />
                    </td>
                    <td>{heroData.title?.en}</td>
                    <td>{heroData.title?.ar}</td>
                    <td>{heroData.subtitle?.en}</td>
                    <td>{heroData.subtitle?.ar}</td>
                    <td>{truncateText(heroData.description?.en, 5)}</td>
                    <td>{truncateText(heroData.description?.ar, 5)}</td>
                    <td>
                      <button
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        title={t('edit')}
                        onClick={openModal}
                      >
                        <MdEdit />
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && <Modal />}
      
      <AboutManager />
    </div>
  );
};

export default HomeManager;
