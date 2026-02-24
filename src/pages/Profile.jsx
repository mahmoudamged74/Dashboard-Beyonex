import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { MdEdit, MdClose, MdCloudUpload } from 'react-icons/md';
import axiosInstance from '../api/axiosInstance';
import styles from './Profile.module.css';

const Profile = () => {
  const { t } = useTranslation();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('admin/profile');
      const data = res.data.data;
      setAdmin(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        password: '',
        password_confirmation: '',
      });
      setImagePreview(data.image);
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.error_loading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const data = new FormData();
    data.append('_method', 'PUT'); // Laravel/Backend often requires _method for PUT with FormData
    data.append('name', formData.name);
    data.append('email', formData.email);
    if (formData.password) {
      data.append('password', formData.password);
      data.append('password_confirmation', formData.password_confirmation);
    }
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const res = await axiosInstance.post('admin/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(res.data.message || t('profile.update_success'));
      setIsModalOpen(false);
      fetchProfile(); // Refresh data
    } catch (err) {
      const errorMsg = err.response?.data?.message || t('error_generic');
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.center}>
        <span className={styles.spinner} />
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className={styles.page}>
      {/* ── Header (avatar + name + edit button) ───────────────────────── */}
      <div className={styles.header}>
        <img
          src={admin.image}
          alt={admin.name}
          className={styles.avatar}
          onError={(e) => { e.target.src = '/assets/3.png'; }}
        />
        <div style={{ flex: 1 }}>
          <h1 className={styles.name}>{admin.name}</h1>
          <p className={styles.email}>{admin.email}</p>
          <span className={`${styles.badge} ${admin.status ? styles.active : styles.inactive}`}>
            {admin.status ? t('active') : t('inactive')}
          </span>
        </div>
        <button className={styles.editBtn} onClick={() => setIsModalOpen(true)}>
          <MdEdit size={18} />
          <span>{t('profile.edit')}</span>
        </button>
      </div>

      {/* ── Role Card ──────────────────────────────────────────────────── */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>{t('profile.role')}</h2>
        <p className={styles.roleName}>{admin.role?.name}</p>
      </div>

      {/* ── Meta info Card ─────────────────────────────────────────────── */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>{t('profile.member_since')}</h2>
        <p className={styles.metaText}>{admin.created_at}</p>
      </div>

      {/* ── Edit Profile Modal ─────────────────────────────────────────── */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t('profile.edit_title')}</h3>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                <MdClose size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {/* Image Upload */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('profile.image')}</label>
                  <div 
                    className={styles.fileInputWrapper}
                    onClick={() => fileInputRef.current.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                    ) : (
                      <MdCloudUpload size={40} color="var(--primary)" />
                    )}
                    <span className={styles.fileHint}>{t('profile.click_to_upload')}</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      style={{ display: 'none' }} 
                      accept="image/*"
                    />
                  </div>
                </div>

                {/* Name */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('profile.name')}</label>
                  <input
                    type="text"
                    name="name"
                    className={styles.formInput}
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('profile.email')}</label>
                  <input
                    type="email"
                    name="email"
                    className={styles.formInput}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Password */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('profile.password')} ({t('profile.optional')})</label>
                  <input
                    type="password"
                    name="password"
                    className={styles.formInput}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                  />
                </div>

                {/* Password Confirmation */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('profile.password_confirmation')}</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    className={styles.formInput}
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.cancelBtn} 
                  onClick={() => setIsModalOpen(false)}
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  className={styles.saveBtn} 
                  disabled={updating}
                >
                  {updating ? t('saving') : t('save_changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
