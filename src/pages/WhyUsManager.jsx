import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdVerifiedUser, MdSearch } from 'react-icons/md';
import styles from './WhyUsManager.module.css';
import axiosInstance from '../api/axiosInstance';
import { iconMap } from '../utils/iconMap';
import { toast } from 'react-toastify';

const WhyUsManager = () => {
  const { t } = useTranslation();

  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'addFeature', 'editFeature', 'delete'
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [formData, setFormData] = useState({
    'title[ar]': '',
    'title[en]': '',
    'description[ar]': '',
    'description[en]': '',
    status: '1',
    icon: 'starFill'
  });
  const [iconSearch, setIconSearch] = useState('');

  const currentLang = localStorage.getItem('i18nextLng') || 'ar';
  const isAr = currentLang === 'ar';

  useEffect(() => {
    fetchData();
  }, [currentLang]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('admin/why-us');
      setFeatures(res.data.data.why_us || []);
    } catch (err) {
      toast.error(t('fetch_error') || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || MdVerifiedUser;
    return <IconComponent />;
  };

  const filteredIcons = Object.keys(iconMap).filter(name => 
    name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  // --- Handlers ---

  const handleAddFeature = () => {
    setFormData({
      'title[ar]': '',
      'title[en]': '',
      'description[ar]': '',
      'description[en]': '',
      status: '1',
      icon: 'starFill'
    });
    setModalType('addFeature');
    setIsModalOpen(true);
  };

  const handleEditFeature = async (feature) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`admin/why-us/${feature.id}`);
      const data = res.data.data;
      setFormData({
        'title[ar]': data.title?.ar || '',
        'title[en]': data.title?.en || '',
        'description[ar]': data.description?.ar || '',
        'description[en]': data.description?.en || '',
        status: data.status ? '1' : '0',
        icon: data.icon || 'starFill'
      });
      setSelectedFeature(feature);
      setModalType('editFeature');
      setIsModalOpen(true);
    } catch (err) {
      toast.error(t('fetch_error') || 'Error fetching details');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (feature) => {
    setSelectedFeature(feature);
    setModalType('delete');
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await axiosInstance.delete(`admin/why-us/${selectedFeature.id}`);
      toast.success(t('delete_success') || 'Deleted successfully');
      fetchData();
      closeModal();
    } catch (err) {
      toast.error(t('delete_error') || 'Error deleting item');
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedFeature(null);
    setIconSearch('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (modalType === 'addFeature') {
        await axiosInstance.post('admin/why-us', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(t('add_success') || 'Added successfully');
      } else {
        // Spoofing PUT because Laravel + FormData
        data.append('_method', 'PUT');
        await axiosInstance.post(`admin/why-us/${selectedFeature.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(t('update_success') || 'Updated successfully');
      }
      fetchData();
      closeModal();
    } catch (err) {
       if (err.response?.status === 422) {
        Object.values(err.response.data.errors).flat().forEach(msg => toast.error(msg));
      } else {
        toast.error(t('save_error') || 'Error saving changes');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (feature) => {
    try {
      const data = new FormData();
      data.append('_method', 'PUT');
      data.append('status', feature.status ? '0' : '1');
      // Backend might require other fields for update, but typically status toggles are leaner.
      // If it fails, we'll need to send the whole object.
      await axiosInstance.post(`admin/why-us/${feature.id}`, data);
      toast.success(t('update_success'));
      fetchData();
    } catch (err) {
      toast.error(t('save_error'));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>{t('why_us_manager') || 'Why Us Manager'}</h2>
        <button className={styles.addButton} onClick={handleAddFeature}>
          <MdAdd size={20} />
          {t('add_why_us') || 'Add Item'}
        </button>
      </div>

      {loading && !features.length ? (
        <div className={styles.loading}>{t('loading')}...</div>
      ) : (
        <div className={styles.servicesGrid}>
          {features.map(feature => (
            <div key={feature.id} className={`${styles.card} ${!feature.status ? styles.inactiveCard : ''}`}>
              <div className={styles.iconOverlay}>
                  {getIcon(feature.icon)}
              </div>

              <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>
                        {typeof feature.title === 'object' ? (isAr ? feature.title.ar : feature.title.en) : feature.title}
                    </h3>
                  </div>
                  
                  <p className={styles.cardDesc}>
                    {typeof feature.description === 'object' ? (isAr ? feature.description.ar : feature.description.en) : feature.description}
                  </p>

                  <div className={styles.cardFooter}>
                      <div className={styles.cardActions}>
                        <button className={styles.actionBtn} onClick={() => handleEditFeature(feature)} title={t('edit')}>
                          <MdEdit />
                        </button>
                        <button className={styles.actionBtn} onClick={() => openDeleteModal(feature)} title={t('delete')} style={{color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.3)'}}>
                          <MdDelete />
                        </button>
                        <button 
                          className={`${styles.actionBtn} ${feature.status ? styles.statusActive : styles.statusInactive}`} 
                          onClick={() => toggleStatus(feature)} 
                          title={t('toggle_status')}
                        >
                          <MdVerifiedUser />
                        </button>
                      </div>
                      <span className={styles.badge}>{feature.icon}</span>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modalType === 'pageInfo' && t('edit_content')}
                {modalType === 'addFeature' && (t('add_feature') || 'Add Feature')}
                {modalType === 'editFeature' && (t('edit_feature') || 'Edit Feature')}
              </h3>
              <button className={styles.closeBtn} onClick={closeModal}>
                <MdClose />
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.modalBody}>
                {modalType === 'delete' ? (
                  <div className={styles.deleteConfirm}>
                    <p>{t('delete_confirmation')} <strong>{typeof selectedFeature?.title === 'object' ? (isAr ? selectedFeature.title.ar : selectedFeature.title.en) : selectedFeature?.title}</strong>?</p>
                  </div>
                ) : (
                  <>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('title')} (EN)</label>
                        <input 
                          type="text" 
                          value={formData['title[en]']} 
                          onChange={(e) => setFormData({...formData, 'title[en]': e.target.value})} 
                          className={styles.input} 
                          required 
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('description')} (EN)</label>
                        <textarea 
                          value={formData['description[en]']} 
                          onChange={(e) => setFormData({...formData, 'description[en]': e.target.value})} 
                          className={styles.textarea} 
                          rows="3"
                          required
                        />
                    </div>
                    
                    <hr className={styles.formDivider} />

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('title')} (AR)</label>
                        <input 
                          type="text" 
                          value={formData['title[ar]']} 
                          onChange={(e) => setFormData({...formData, 'title[ar]': e.target.value})} 
                          className={styles.input} 
                          dir="rtl" 
                          required 
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('description')} (AR)</label>
                        <textarea 
                          value={formData['description[ar]']} 
                          onChange={(e) => setFormData({...formData, 'description[ar]': e.target.value})} 
                          className={styles.textarea} 
                          dir="rtl" 
                          rows="3"
                          required
                        />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t('icon')}</label>
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
                                 onClick={() => setFormData({...formData, icon: iconName})}
                                 title={iconName}
                               >
                                 <IconComp />
                               </button>
                             );
                          })}
                        </div>
                        <div className={styles.selectedIconName}>
                           {t('selected')}: <strong>{formData.icon}</strong>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t('status')}</label>
                      <select 
                        value={formData.status} 
                        onChange={(e) => setFormData({...formData, status: e.target.value})} 
                        className={styles.input}
                      >
                        <option value="1">{t('active')}</option>
                        <option value="0">{t('inactive')}</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={closeModal} disabled={saving}>
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{display:'flex', alignItems:'center', gap:'0.5rem'}} 
                  disabled={saving}
                  onClick={modalType === 'delete' ? handleDelete : handleSave}
                >
                  {saving ? t('saving') : (modalType === 'delete' ? t('confirm_delete') : t('save'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhyUsManager;
