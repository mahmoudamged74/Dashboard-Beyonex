import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MdAdd, MdEdit, MdDelete, MdClose, MdSave, 
  MdImage, MdSearch, MdSettings, MdList, MdExtension 
} from 'react-icons/md';
import styles from './ServicesManager.module.css';
import axiosInstance from '../api/axiosInstance';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { iconMap } from '../utils/iconMap';
import { toast } from 'react-toastify';

const ServicesManager = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isAr = currentLang === 'ar';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'pageInfo', 'addService', 'editService', 'delete'
  const [selectedService, setSelectedService] = useState(null);
  
  // Page Info (from global settings)
  const [servicePageInfo, setServicePageInfo] = useState({
    'service_text[ar]': '',
    'service_text[en]': ''
  });

  const [formData, setFormData] = useState({
    'title[ar]': '',
    'title[en]': '',
    'short_description[ar]': '',
    'short_description[en]': '',
    'long_description[ar]': '',
    'long_description[en]': '',
    icon: 'codeSlash',
    display_order: '0',
    status: '1',
    technologies: [''],
    features: ['']
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [iconSearch, setIconSearch] = useState('');

  useEffect(() => {
    fetchData();
    fetchPageInfo();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('admin/services');
      const fetchedServices = res.data.data.services || [];
      fetchedServices.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
      setServices(fetchedServices);
    } catch (err) {
      toast.error(t('fetch_error') || 'Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  const fetchPageInfo = async () => {
    try {
      const res = await axiosInstance.get('admin/settings');
      const settings = res.data.data;
      setServicePageInfo({
        'service_text[ar]': settings.service_text?.ar || '',
        'service_text[en]': settings.service_text?.en || ''
      });
    } catch (err) {
      console.error('Error fetching service page info', err);
    }
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || MdSettings;
    return <IconComponent />;
  };

  const filteredIcons = Object.keys(iconMap).filter(name => 
    name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  // --- Handlers ---

  const handleEditPageInfo = () => {
    setModalType('pageInfo');
    setIsModalOpen(true);
  };

  const handleAddService = () => {
    setFormData({
      'title[ar]': '',
      'title[en]': '',
      'short_description[ar]': '',
      'short_description[en]': '',
      'long_description[ar]': '',
      'long_description[en]': '',
      icon: 'codeSlash',
      display_order: '0',
      status: '1',
      technologies: [''],
      features: ['']
    });
    setImageFile(null);
    setImagePreview(null);
    setModalType('addService');
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setFormData({
      'title[ar]': service.title?.ar || '',
      'title[en]': service.title?.en || '',
      'short_description[ar]': service.short_description?.ar || '',
      'short_description[en]': service.short_description?.en || '',
      'long_description[ar]': service.long_description?.ar || '',
      'long_description[en]': service.long_description?.en || '',
      icon: service.icon || 'codeSlash',
      display_order: service.display_order?.toString() || '0',
      status: service.status ? '1' : '0',
      technologies: service.technologies && service.technologies.length > 0 ? service.technologies : [''],
      features: service.features && service.features.length > 0 ? service.features.map(f => typeof f === 'object' ? (f.en || '') : f) : ['']
    });
    setSelectedService(service);
    setImagePreview(service.image);
    setModalType('editService');
    setIsModalOpen(true);
  };

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setModalType('delete');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedService(null);
    setImageFile(null);
    setImagePreview(null);
    setIconSearch('');
  };

  const handleSavePageInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('_method', 'PUT');
      data.append('service_text[ar]', servicePageInfo['service_text[ar]']);
      data.append('service_text[en]', servicePageInfo['service_text[en]']);
      
      await axiosInstance.post('admin/settings', data);
      toast.success(t('save_success'));
      fetchPageInfo();
      closeModal();
    } catch (err) {
      toast.error(t('save_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveService = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      
      // Basic Fields
      Object.keys(formData).forEach(key => {
        if (key === 'technologies' || key === 'features') {
          formData[key].forEach((item, index) => {
            if (item && item.trim()) {
              data.append(`${key}[${index}]`, item);
            }
          });
        } else {
          data.append(key, formData[key]);
        }
      });

      if (imageFile) data.append('image', imageFile);

      if (modalType === 'addService') {
        const res = await axiosInstance.post('admin/services', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(res.data.message || t('add_success'));
      } else {
        data.append('_method', 'PUT');
        const res = await axiosInstance.post(`admin/services/${selectedService.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(res.data.message || t('update_success'));
      }
      fetchData();
      closeModal();
    } catch (err) {
      if (err.response?.status === 422) {
        Object.values(err.response.data.errors).flat().forEach(msg => toast.error(msg));
      } else {
        toast.error(t('save_error'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await axiosInstance.delete(`admin/services/${selectedService.id}`);
      toast.success(res.data.message || t('delete_success'));
      fetchData();
      closeModal();
    } catch (err) {
      toast.error(t('delete_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file && type === 'image') {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleArrayChange = (index, value, type) => {
    const updated = [...formData[type]];
    updated[index] = value;
    setFormData({ ...formData, [type]: updated });
  };

  const addArrayItem = (type) => {
    setFormData({ ...formData, [type]: [...formData[type], ''] });
  };

  const removeArrayItem = (index, type) => {
    const updated = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: updated.length > 0 ? updated : [''] });
  };

  const truncate = (text, length = 100) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div className={styles.container}>
      {/* Main Page Info Section */}
      <div className={styles.pageInfoSection}>
        <div className={styles.pageInfoHeader}>
            <div>
                <h1 className={styles.pageTitle}>{t('our_services')}</h1>
                <p className={styles.pageSubtitle}>{truncate(isAr ? servicePageInfo['service_text[ar]'] : servicePageInfo['service_text[en]'], 150)}</p>
            </div>
            <button className={styles.editInfoBtn} onClick={handleEditPageInfo}>
                <MdEdit /> {t('edit_content')}
            </button>
        </div>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>{t('services_list')}</h2>
        <button className={styles.addButton} onClick={handleAddService}>
          <MdAdd size={20} />
          {t('add_service')}
        </button>
      </div>

      {loading && !services.length ? (
        <div className={styles.loading}>{t('loading')}...</div>
      ) : (
        <div className={styles.servicesGrid}>
          {services.map(service => (
            <div key={service.id} className={`${styles.card} ${!service.status ? styles.inactiveCard : ''}`}>
              <div className={styles.cardImageContainer}>
                  <img src={service.image || '/assets/slide1.jpg'} alt={isAr ? service.title?.ar : service.title?.en} className={styles.cardImage} />
                  <div className={styles.iconOverlay}>
                      {getIcon(service.icon)}
                  </div>
              </div>
              
              <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>
                        {isAr ? service.title?.ar : service.title?.en}
                    </h3>
                    <div className={styles.cardActions}>
                      <button className={styles.actionBtn} onClick={() => handleEditService(service)} title={t('edit')}>
                        <MdEdit />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => openDeleteModal(service)} title={t('delete')}>
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                  
                  <p className={styles.cardDesc} dangerouslySetInnerHTML={{ __html: truncate(isAr ? service.short_description?.ar : service.short_description?.en, 120) }}>
                  </p>
                  
                  <div className={styles.cardFooter}>
                       <span className={styles.badge}>{service.icon || 'codeSlash'}</span>
                       <span className={styles.orderBadge}>#{service.display_order}</span>
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
                {modalType === 'addService' && t('add_service')}
                {modalType === 'editService' && t('edit_service')}
                {modalType === 'delete' && t('delete')}
              </h3>
              <button className={styles.closeBtn} onClick={closeModal}>
                <MdClose />
              </button>
            </div>

            <form 
              onSubmit={
                modalType === 'pageInfo' ? handleSavePageInfo : 
                modalType === 'delete' ? handleDelete : 
                handleSaveService
              } 
              className={styles.form}
            >
              <div className={styles.modalBody}>
                {modalType === 'delete' ? (
                  <div className={styles.deleteConfirm}>
                    <p>{t('delete_confirmation')} <strong>{isAr ? selectedService?.title?.ar : selectedService?.title?.en}</strong>?</p>
                  </div>
                ) : modalType === 'pageInfo' ? (
                  <>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('service_text')} (EN)</label>
                        <textarea 
                          value={servicePageInfo['service_text[en]']} 
                          onChange={(e) => setServicePageInfo({...servicePageInfo, 'service_text[en]': e.target.value})} 
                          className={styles.textarea} 
                          rows="4"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('service_text')} (AR)</label>
                        <textarea 
                          value={servicePageInfo['service_text[ar]']} 
                          onChange={(e) => setServicePageInfo({...servicePageInfo, 'service_text[ar]': e.target.value})} 
                          className={styles.textarea} 
                          dir="rtl"
                          rows="4"
                        />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                          <label className={styles.label}>{t('image')}</label>
                          <div className={styles.uploadBox}>
                              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} id="imageUpload" hidden />
                              <label htmlFor="imageUpload" className={styles.uploadLabel}>
                                <MdImage />
                                {t('change_image')}
                              </label>
                              {imagePreview && <img src={imagePreview} alt="Preview" className={styles.imgPreview} />}
                          </div>
                      </div>
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

                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                          <label className={styles.label}>{t('title')} (EN)</label>
                          <input type="text" value={formData['title[en]']} onChange={(e) => setFormData({...formData, 'title[en]': e.target.value})} className={styles.input} required />
                      </div>
                      <div className={styles.formGroup}>
                          <label className={styles.label}>{t('title')} (AR)</label>
                          <input type="text" value={formData['title[ar]']} onChange={(e) => setFormData({...formData, 'title[ar]': e.target.value})} className={styles.input} dir="rtl" required />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('short_description')} (EN)</label>
                        <textarea value={formData['short_description[en]']} onChange={(e) => setFormData({...formData, 'short_description[en]': e.target.value})} className={styles.textarea} rows="2"/>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('short_description')} (AR)</label>
                        <textarea value={formData['short_description[ar]']} onChange={(e) => setFormData({...formData, 'short_description[ar]': e.target.value})} className={styles.textarea} dir="rtl" rows="2"/>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('long_description')} (EN)</label>
                        <div className={styles.quillContainer}>
                          <ReactQuill 
                            theme="snow" 
                            value={formData['long_description[en]']} 
                            onChange={(val) => setFormData({...formData, 'long_description[en]': val})}
                          />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('long_description')} (AR)</label>
                        <div className={styles.quillContainer} dir="rtl">
                          <ReactQuill 
                            theme="snow" 
                            value={formData['long_description[ar]']} 
                            onChange={(val) => setFormData({...formData, 'long_description[ar]': val})}
                          />
                        </div>
                    </div>

                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>{t('display_order')}</label>
                        <input type="number" value={formData.display_order} onChange={(e) => setFormData({...formData, display_order: e.target.value})} className={styles.input} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>{t('status')}</label>
                        <div className={styles.toggleContainer}>
                          <button 
                            type="button" 
                            className={`${styles.toggleBtn} ${formData.status === '1' ? styles.active : ''}`}
                            onClick={() => setFormData({...formData, status: '1'})}
                          >
                            {t('active')}
                          </button>
                          <button 
                            type="button" 
                            className={`${styles.toggleBtn} ${formData.status === '0' ? styles.inactive : ''}`}
                            onClick={() => setFormData({...formData, status: '0'})}
                          >
                            {t('inactive')}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={styles.dynamicList}>
                      <label className={styles.label}><MdExtension /> {t('technologies')}</label>
                      {formData.technologies.map((item, idx) => (
                        <div key={idx} className={styles.arrayItem}>
                          <input type="text" value={item} onChange={(e) => handleArrayChange(idx, e.target.value, 'technologies')} className={styles.input} placeholder={`Tech ${idx + 1}`} />
                          <button type="button" onClick={() => removeArrayItem(idx, 'technologies')} className={styles.removeBtn}><MdClose /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addArrayItem('technologies')} className={styles.addArrayBtn}><MdAdd /> {t('add_new')}</button>
                    </div>

                    <div className={styles.dynamicList}>
                      <label className={styles.label}><MdList /> {t('features')}</label>
                      {formData.features.map((item, idx) => (
                        <div key={idx} className={styles.arrayItem}>
                          <input type="text" value={item} onChange={(e) => handleArrayChange(idx, e.target.value, 'features')} className={styles.input} placeholder={`Feature ${idx + 1}`} />
                          <button type="button" onClick={() => removeArrayItem(idx, 'features')} className={styles.removeBtn}><MdClose /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addArrayItem('features')} className={styles.addArrayBtn}><MdAdd /> {t('add_new')}</button>
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

export default ServicesManager;
