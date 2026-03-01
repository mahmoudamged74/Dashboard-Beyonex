import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MdEdit, 
  MdSave, 
  MdClose, 
  MdAdd, 
  MdDelete, 
  MdFacebook, 
  MdEmail, 
  MdLocationOn, 
  MdPhone, 
  MdAccessTime,
  MdLink
} from 'react-icons/md';
import { FaTwitter, FaInstagram, FaLinkedin, FaSnapchat, FaWhatsapp } from 'react-icons/fa';
import styles from './FooterManager.module.css';

const FooterManager = () => {
  const { t } = useTranslation();

  // State for Main Info
  const [mainInfo, setMainInfo] = useState({
    logo: '/assets/3.png',
    titleEn: 'BEYONEX IT',
    titleAr: 'بيونكس اي تي',
    descEn: 'We provide innovative software solutions that turn your ideas into exceptional digital experiences.',
    descAr: 'نقدم حلول برمجية وتقنية مبتكرة تحول أفكارك إلى تجارب رقمية استثنائية.',
    copyrightEn: 'All Rights Reserved © 2026',
    copyrightAr: 'جميع الحقوق محفوظة © 2026'
  });

  // State for Contact Info
  const [contactInfo, setContactInfo] = useState({
    locationEn: 'Riyadh, Kingdom of Saudi Arabia',
    locationAr: 'الرياض، المملكة العربية السعودية',
    locationLink: 'https://maps.google.com',
    phone: '+966 559544554',
    email: 'info@beyonexit.com',
    hoursEn: 'Sunday - Thursday: 8:00 - 16:00',
    hoursAr: 'الأحد - الخميس: 8:00 - 16:00'
  });

  // State for Social Links
  const [socialLinks, setSocialLinks] = useState([
    { id: 1, platform: 'whatsapp', url: 'https://wa.me/966559544554' },
    { id: 2, platform: 'twitter', url: 'https://twitter.com' },
    { id: 3, platform: 'instagram', url: 'https://instagram.com' },
    { id: 4, platform: 'snapchat', url: 'https://snapchat.com' },
    { id: 5, platform: 'linkedin', url: 'https://linkedin.com' },
    { id: 6, platform: 'facebook', url: 'https://facebook.com' }
  ]);

  const [modalType, setModalType] = useState(null); // 'main', 'contact', 'addSocial', 'editSocial'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  // Icon Helper
  const getSocialIcon = (platform) => {
    switch(platform) {
      case 'facebook': return <MdFacebook />;
      case 'twitter': return <FaTwitter />;
      case 'instagram': return <FaInstagram />;
      case 'linkedin': return <FaLinkedin />;
      case 'snapchat': return <FaSnapchat />;
      case 'whatsapp': return <FaWhatsapp />;
      default: return <MdLink />;
    }
  };

  // --- Handlers ---

  const openModal = (type, data = {}) => {
    setModalType(type);
    setFormData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setModalType(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, logo: imageUrl }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (modalType === 'main') {
      setMainInfo(formData);
      toast.success(t('save_success') || 'Main info updated');
    } else if (modalType === 'contact') {
      setContactInfo(formData);
      toast.success(t('save_success') || 'Contact info updated');
    } else if (modalType === 'addSocial') {
      setSocialLinks(prev => [...prev, { ...formData, id: Date.now() }]);
      toast.success(t('add_success') || 'Social link added');
    } else if (modalType === 'editSocial') {
      setSocialLinks(prev => prev.map(item => item.id === formData.id ? formData : item));
      toast.success(t('update_success') || 'Social link updated');
    }
    closeModal();
  };

  const handleDeleteSocial = (id) => {
    if (window.confirm(t('confirm_delete') || 'Are you sure?')) {
      setSocialLinks(prev => prev.filter(item => item.id !== id));
      toast.success(t('delete_success') || 'Social link deleted');
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Main Info Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('main_info') || 'Main Info'}</h2>
          <button className={styles.editBtn} onClick={() => openModal('main', mainInfo)}>
            <MdEdit /> {t('edit')}
          </button>
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
             <label className={styles.infoLabel}>{t('logo') || 'Logo'}</label>
             <img src={mainInfo.logo} alt="Logo" className={styles.logoPreview} />
          </div>
          <div className={styles.infoItem}>
             <label className={styles.infoLabel}>{t('title')} (EN)</label>
             <div className={styles.infoValue}>{mainInfo.titleEn}</div>
          </div>
           <div className={styles.infoItem}>
             <label className={styles.infoLabel}>{t('title')} (AR)</label>
             <div className={styles.infoValue}>{mainInfo.titleAr}</div>
          </div>
           <div className={styles.infoItem}>
             <label className={styles.infoLabel}>{t('description')} (EN)</label>
             <div className={styles.infoValue}>{mainInfo.descEn}</div>
          </div>
           <div className={styles.infoItem}>
             <label className={styles.infoLabel}>{t('description')} (AR)</label>
             <div className={styles.infoValue}>{mainInfo.descAr}</div>
          </div>
          <div className={styles.infoItem}>
             <label className={styles.infoLabel}>{t('copyright')} (EN)</label>
             <div className={styles.infoValue}>{mainInfo.copyrightEn}</div>
          </div>
           <div className={styles.infoItem}>
             <label className={styles.infoLabel}>{t('copyright')} (AR)</label>
             <div className={styles.infoValue}>{mainInfo.copyrightAr}</div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('contact_info') || 'Contact Info'}</h2>
          <button className={styles.editBtn} onClick={() => openModal('contact', contactInfo)}>
            <MdEdit /> {t('edit')}
          </button>
        </div>
         <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
             <label className={styles.infoLabel}><MdLocationOn/> {t('location')} (EN)</label>
             <div className={styles.infoValue}>{contactInfo.locationEn}</div>
          </div>
          <div className={styles.infoItem}>
             <label className={styles.infoLabel}><MdLocationOn/> {t('location')} (AR)</label>
             <div className={styles.infoValue}>{contactInfo.locationAr}</div>
          </div>
          <div className={styles.infoItem}>
             <label className={styles.infoLabel}><MdLink/> {t('location_link') || 'Location Link'}</label>
             <div className={styles.infoValue}><a href={contactInfo.locationLink} target="_blank" rel="noreferrer" style={{color: 'var(--primary)'}}>{t('view_map') || 'View Map'}</a></div>
          </div>
           <div className={styles.infoItem}>
             <label className={styles.infoLabel}><MdPhone/> {t('phone')}</label>
             <div className={styles.infoValue} dir="ltr">{contactInfo.phone}</div>
          </div>
           <div className={styles.infoItem}>
             <label className={styles.infoLabel}><MdEmail/> {t('email')}</label>
             <div className={styles.infoValue}>{contactInfo.email}</div>
          </div>
           <div className={styles.infoItem}>
             <label className={styles.infoLabel}><MdAccessTime/> {t('working_hours') || 'Working Hours'} (EN)</label>
             <div className={styles.infoValue}>{contactInfo.hoursEn}</div>
          </div>
           <div className={styles.infoItem}>
             <label className={styles.infoLabel}><MdAccessTime/> {t('working_hours') || 'Working Hours'} (AR)</label>
             <div className={styles.infoValue}>{contactInfo.hoursAr}</div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
         <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('social_links') || 'Social Links'}</h2>
          <button className={styles.addBtn} onClick={() => openModal('addSocial', {platform:'facebook', url: ''})}>
            <MdAdd /> {t('add_new')}
          </button>
        </div>

        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>{t('platform') || 'Platform'}</th>
                        <th>{t('link') || 'Link'}</th>
                        <th>{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {socialLinks.map(link => (
                        <tr key={link.id}>
                            <td>
                                <div className={styles.iconPreview}>
                                    {getSocialIcon(link.platform)}
                                    <span style={{fontSize:'0.9rem', margin: '0 0.5rem', color: 'var(--text-main)'}}>{link.platform}</span>
                                </div>
                            </td>
                            <td>
                                <a href={link.url} target="_blank" rel="noreferrer" style={{color: 'var(--text-muted)', textDecoration:'none'}}>{link.url}</a>
                            </td>
                            <td>
                                <div style={{display:'flex', gap:'0.5rem'}}>
                                    <button className={styles.actionBtn} onClick={() => openModal('editSocial', link)}>
                                        <MdEdit />
                                    </button>
                                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteSocial(link.id)}>
                                        <MdDelete />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>
                        {modalType === 'main' && (t('edit_main_info') || 'Edit Main Info')}
                        {modalType === 'contact' && (t('edit_contact_info') || 'Edit Contact Info')}
                        {(modalType === 'addSocial' || modalType === 'editSocial') && (t('social_link') || 'Social Link')}
                    </h3>
                    <button className={styles.closeBtn} onClick={closeModal}><MdClose/></button>
                </div>
                
                <form className={styles.modalForm} onSubmit={handleSave}>
                    <div className={styles.modalBody}>
                        
                        {modalType === 'main' && (
                            <>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('logo')}</label>
                                    <div className={styles.fileInputWrapper}>
                                        <img src={formData.logo} alt="Preview" style={{height:'50px'}} />
                                        <label className={styles.fileBtn}>
                                            <MdEdit /> {t('change_image') || 'Change'}
                                            <input type="file" onChange={handleImageUpload} style={{display:'none'}} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('title')} (EN)</label>
                                    <input className={styles.input} name="titleEn" value={formData.titleEn || ''} onChange={handleChange} />
                                </div>
                                 <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('title')} (AR)</label>
                                    <input className={styles.input} name="titleAr" value={formData.titleAr || ''} onChange={handleChange} dir="rtl"/>
                                </div>
                                 <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('description')} (EN)</label>
                                    <textarea className={styles.textarea} name="descEn" value={formData.descEn || ''} onChange={handleChange} rows="3"/>
                                </div>
                                 <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('description')} (AR)</label>
                                    <textarea className={styles.textarea} name="descAr" value={formData.descAr || ''} onChange={handleChange} dir="rtl" rows="3"/>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('copyright')} (EN)</label>
                                    <input className={styles.input} name="copyrightEn" value={formData.copyrightEn || ''} onChange={handleChange} />
                                </div>
                                 <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('copyright')} (AR)</label>
                                    <input className={styles.input} name="copyrightAr" value={formData.copyrightAr || ''} onChange={handleChange} dir="rtl"/>
                                </div>
                            </>
                        )}

                        {modalType === 'contact' && (
                            <>
                                 <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('location')} (EN)</label>
                                    <input className={styles.input} name="locationEn" value={formData.locationEn || ''} onChange={handleChange} />
                                </div>
                                 <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('location')} (AR)</label>
                                    <input className={styles.input} name="locationAr" value={formData.locationAr || ''} onChange={handleChange} dir="rtl"/>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('location_link')} (URL)</label>
                                    <input className={styles.input} name="locationLink" value={formData.locationLink || ''} onChange={handleChange} dir="ltr"/>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('phone')}</label>
                                    <input className={styles.input} name="phone" value={formData.phone || ''} onChange={handleChange} dir="ltr"/>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('email')}</label>
                                    <input className={styles.input} name="email" value={formData.email || ''} onChange={handleChange} dir="ltr"/>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('working_hours')} (EN)</label>
                                    <input className={styles.input} name="hoursEn" value={formData.hoursEn || ''} onChange={handleChange} />
                                </div>
                                 <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('working_hours')} (AR)</label>
                                    <input className={styles.input} name="hoursAr" value={formData.hoursAr || ''} onChange={handleChange} dir="rtl" />
                                </div>
                            </>
                        )}

                        {(modalType === 'addSocial' || modalType === 'editSocial') && (
                            <>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('platform')}</label>
                                    <select className={styles.select} name="platform" value={formData.platform} onChange={handleChange}>
                                        <option value="facebook">Facebook</option>
                                        <option value="twitter">Twitter</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="snapchat">Snapchat</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="whatsapp">WhatsApp</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('link')}</label>
                                    <input className={styles.input} name="url" value={formData.url || ''} onChange={handleChange} dir="ltr" placeholder="https://..." />
                                </div>
                            </>
                         )}

                    </div>
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelBtn} onClick={closeModal}>{t('cancel')}</button>
                        <button type="submit" className={styles.saveBtn}><MdSave /> {t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default FooterManager;
