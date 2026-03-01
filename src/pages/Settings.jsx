import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MdSave, 
  MdCloudUpload, 
  MdPublic, 
  MdContactPage, 
  MdShare, 
  MdDescription,
  MdLocationOn,
  MdAccessTime,
  MdImage
} from 'react-icons/md';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import usePermission from '../hooks/usePermission';
import styles from './Settings.module.css';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { can } = usePermission();
  const isAr = i18n.language === 'ar';
  
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [formData, setFormData] = useState({
    'site_name[ar]': '',
    'site_name[en]': '',
    'site_desc[ar]': '',
    'site_desc[en]': '',
    'meta_desc[ar]': '',
    'meta_desc[en]': '',
    site_phone: '',
    site_address: '',
    site_address_en: '',
    site_email: '',
    email_support: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
    linkedin: '',
    telegram: '',
    snapchat: '',
    tiktok: '',
    twitter: '',
    'service_text[ar]': '',
    'service_text[en]': '',
    'about_us_text[ar]': '',
    'about_us_text[en]': '',
    location_url: '',
    'working_hours[ar]': '',
    'working_hours[en]': '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('admin/settings');
      const data = res.data.data;
      
      // Map API data to localized form structure
      // Assuming the API returns nested objects or flattened localized keys
      // The user's provided postman example shows "site_name": "بيونكس IT" which means they might be using Accept-Language
      // But the PUT example shows site_name[ar] and site_name[en], implying we should manage both.
      
      setFormData({
        'site_name[ar]': data.site_name?.ar || '',
        'site_name[en]': data.site_name?.en || '',
        'site_desc[ar]': data.site_desc?.ar || '',
        'site_desc[en]': data.site_desc?.en || '',
        'meta_desc[ar]': data.meta_desc?.ar || '',
        'meta_desc[en]': data.meta_desc?.en || '',
        site_phone: data.site_phone || '',
        site_address: typeof data.site_address === 'object' ? data.site_address?.ar || '' : data.site_address || '',
        site_address_en: typeof data.site_address === 'object' ? data.site_address?.en || '' : '',
        site_email: data.site_email || '',
        email_support: data.email_support || '',
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        whatsapp: data.whatsapp || '',
        linkedin: data.linkedin || '',
        telegram: data.telegram || '',
        snapchat: data.snapchat || '',
        tiktok: data.tiktok || '',
        twitter: data.twitter || '',
        'service_text[ar]': data.service_text?.ar || '',
        'service_text[en]': data.service_text?.en || '',
        'about_us_text[ar]': data.about_us_text?.ar || '',
        'about_us_text[en]': data.about_us_text?.en || '',
        location_url: data.location_url || '',
        'working_hours[ar]': Array.isArray(data.working_hours) ? '' : data.working_hours?.ar || '',
        'working_hours[en]': Array.isArray(data.working_hours) ? '' : data.working_hours?.en || '',
      });

      setLogoPreview(data.logo);
      setFaviconPreview(data.favicon);
    } catch (err) {
      toast.error(t('fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'logo') {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFaviconPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    const body = new FormData();
    body.append('_method', 'PUT');
    
    // Proper mapping of fields
    Object.keys(formData).forEach(key => {
      let apiKey = key;
      // Handle special cases for address fields
      if (key === 'site_address') apiKey = 'site_address[ar]';
      if (key === 'site_address_en') apiKey = 'site_address[en]';
      
      const value = formData[key];
      // Only append if it's not null/undefined to avoid sending "null" strings
      if (value !== null && value !== undefined) {
        body.append(apiKey, value);
      }
    });

    if (logoFile) body.append('logo', logoFile);
    if (faviconFile) body.append('favicon', faviconFile);

    try {
      const res = await axiosInstance.post('admin/settings', body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message || t('save_success'));
      fetchSettings();
    } catch (err) {
      if (err.response?.status === 422) {
        // Log individual errors for debugging
        const errors = err.response.data.errors || {};
        Object.keys(errors).forEach(field => {
          errors[field].forEach(msg => toast.error(`${field}: ${msg}`));
        });
      } else {
        toast.error(err.response?.data?.message || t('save_error'));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>{t('loading')}...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('settings')}</h1>
        {can('settings.update') && (
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            <MdSave /> {saving ? t('saving') : t('save_changes')}
          </button>
        )}
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <MdPublic /> {t('general_info') || 'General'}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'contact' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <MdContactPage /> {t('contact_info')}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'social' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('social')}
        >
          <MdShare /> {t('social_links')}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'content' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <MdDescription /> {t('localized_content') || 'Content'}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'media' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <MdImage /> {t('branding') || 'Branding'}
        </button>
      </div>

      <form onSubmit={handleSave} className={styles.settingsForm}>
        {activeTab === 'general' && (
          <div className={styles.section}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('site_name')} (AR)</label>
                <input type="text" name="site_name[ar]" value={formData['site_name[ar]']} onChange={handleChange} className={styles.input} dir="rtl" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('site_name')} (EN)</label>
                <input type="text" name="site_name[en]" value={formData['site_name[en]']} onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('site_description')} (AR)</label>
                <textarea name="site_desc[ar]" value={formData['site_desc[ar]']} onChange={handleChange} className={styles.textarea} dir="rtl" rows="3" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('site_description')} (EN)</label>
                <textarea name="site_desc[en]" value={formData['site_desc[en]']} onChange={handleChange} className={styles.textarea} rows="3" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('meta_description')} (AR)</label>
                <textarea name="meta_desc[ar]" value={formData['meta_desc[ar]']} onChange={handleChange} className={styles.textarea} dir="rtl" rows="2" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('meta_description')} (EN)</label>
                <textarea name="meta_desc[en]" value={formData['meta_desc[en]']} onChange={handleChange} className={styles.textarea} rows="2" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className={styles.section}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('phone')}</label>
                <input type="text" name="site_phone" value={formData.site_phone} onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('email')}</label>
                <input type="email" name="site_email" value={formData.site_email} onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('support_email') || 'Support Email'}</label>
                <input type="email" name="email_support" value={formData.email_support} onChange={handleChange} className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('address')} (AR)</label>
                <input type="text" name="site_address" value={formData.site_address} onChange={handleChange} className={styles.input} dir="rtl" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('address')} (EN)</label>
                <input type="text" name="site_address_en" value={formData.site_address_en} onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('location_link')}</label>
                <input type="text" name="location_url" value={formData.location_url} onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                   <label className={styles.label}>{t('working_hours')} (AR)</label>
                   <input type="text" name="working_hours[ar]" value={formData['working_hours[ar]']} onChange={handleChange} className={styles.input} dir="rtl"/>
              </div>
              <div className={styles.formGroup}>
                   <label className={styles.label}>{t('working_hours')} (EN)</label>
                   <input type="text" name="working_hours[en]" value={formData['working_hours[en]']} onChange={handleChange} className={styles.input} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className={styles.section}>
            <div className={styles.formGrid}>
              {['facebook', 'instagram', 'whatsapp', 'linkedin', 'telegram', 'snapchat', 'tiktok', 'twitter'].map(platform => (
                <div key={platform} className={styles.formGroup}>
                  <label className={styles.label}>{t(platform) || platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
                  <input 
                    type="text" 
                    name={platform} 
                    value={formData[platform] || ''} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder={`https://${platform}.com/...`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className={styles.section}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('service_text') || 'Service Page Text'} (AR)</label>
                <textarea name="service_text[ar]" value={formData['service_text[ar]']} onChange={handleChange} className={styles.textarea} dir="rtl" rows="5" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('service_text') || 'Service Page Text'} (EN)</label>
                <textarea name="service_text[en]" value={formData['service_text[en]']} onChange={handleChange} className={styles.textarea} rows="5" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('about_us_text') || 'About Us Page Text'} (AR)</label>
                <textarea name="about_us_text[ar]" value={formData['about_us_text[ar]']} onChange={handleChange} className={styles.textarea} dir="rtl" rows="5" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('about_us_text') || 'About Us Page Text'} (EN)</label>
                <textarea name="about_us_text[en]" value={formData['about_us_text[en]']} onChange={handleChange} className={styles.textarea} rows="5" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className={styles.section}>
            <div className={styles.mediaGrid}>
              <div className={styles.mediaUploadCard}>
                <h3 className={styles.mediaTitle}>{t('logo')}</h3>
                <div className={styles.mediaPreviewContainer} onClick={() => logoInputRef.current.click()}>
                  {logoPreview ? <img src={logoPreview} alt="Logo" className={styles.mediaPreview} /> : <MdCloudUpload size={50} />}
                  <span className={styles.uploadText}>{t('change_image')}</span>
                </div>
                <input type="file" ref={logoInputRef} onChange={(e) => handleImageChange(e, 'logo')} accept="image/*" hidden />
              </div>

              <div className={styles.mediaUploadCard}>
                <h3 className={styles.mediaTitle}>{t('favicon') || 'Favicon'}</h3>
                <div className={styles.mediaPreviewContainer} onClick={() => faviconInputRef.current.click()}>
                  {faviconPreview ? <img src={faviconPreview} alt="Favicon" className={styles.iconPreview} /> : <MdCloudUpload size={50} />}
                  <span className={styles.uploadText}>{t('change_image')}</span>
                </div>
                <input type="file" ref={faviconInputRef} onChange={(e) => handleImageChange(e, 'favicon')} accept="image/*" hidden />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Settings;
