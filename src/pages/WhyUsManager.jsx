import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdHeadsetMic, MdCode, MdRocketLaunch, MdSecurity, MdSpeed, MdVerifiedUser } from 'react-icons/md';
import styles from './WhyUsManager.module.css';

const WhyUsManager = () => {
  const { t } = useTranslation();

  // Page Info State (Why Us Header)
  const [pageInfo, setPageInfo] = useState({
    titleEn: 'Why Us',
    titleAr: 'لماذا نحن',
    shortDescEn: 'Turning your ideas into advanced technical solutions that drive your business forward.',
    shortDescAr: 'نحول أفكارك إلى حلول تقنية متطورة تدفع عملك للأمام.',
    longDescEn: 'We provide exceptional services tailored to your needs, ensuring quality, support, and innovation at every step.',
    longDescAr: 'نقدم خدمات استثنائية مصممة خصيصًا لتلبية احتياجاتك، مع ضمان الجودة والدعم والابتكار في كل خطوة.'
  });

  // Initial Mock Data (3 features based on screenshot)
  const [features, setFeatures] = useState([
    {
      id: 1,
      image: '', 
      iconName: 'MdHeadsetMic',
      titleEn: 'Continuous Support',
      titleAr: 'دعم فني متواصل',
      shortDescEn: 'Technical support team available around the clock to solve any problem.',
      shortDescAr: 'فريق دعم فني متاح على مدار الساعة لحل أي مشكلة.',
      longDescEn: 'Our dedicated support team is always ready to assist you with any technical issues or questions you may have, ensuring minimal downtime for your business.',
      longDescAr: 'فريق الدعم المخصص لدينا جاهز دائمًا لمساعدتك في أي مشاكل تقنية أو أسئلة قد تكون لديك، مما يضمن الحد الأدنى من التوقف عن العمل لشركتك.'
    },
    {
      id: 2,
      image: '',
      iconName: 'MdCode',
      titleEn: 'High Quality',
      titleAr: 'جودة عالية',
      shortDescEn: 'Committing to the highest quality standards in every project we implement.',
      shortDescAr: 'نلتزم بأعلى معايير الجودة في كل مشروع ننفذه.',
      longDescEn: 'We follow strict quality assurance processes and coding standards to deliver robust, scalable, and maintainable software solutions.',
      longDescAr: 'نحن نتبع عمليات صارمة لضمان الجودة ومعايير البرمجة لتقديم حلول برمجية قوية وقابلة للتوسع وقابلة للصيانة.'
    },
    {
      id: 3,
      image: '',
      iconName: 'MdRocketLaunch',
      titleEn: 'Continuous Innovation',
      titleAr: 'ابتكار مستمر',
      shortDescEn: 'Keeping up with the latest technologies and trends in the world of programming and development.',
      shortDescAr: 'نواكب أحدث التقنيات والاتجاهات في عالم البرمجة والتطوير.',
      longDescEn: 'Innovation is at the core of what we do. We constantly explore new technologies to provide cutting-edge solutions for your business.',
      longDescAr: 'الابتكار هو جوهر ما نقوم به. نستكشف باستمرار تقنيات جديدة لتوفير حلول متطورة لعملك.'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'pageInfo', 'addFeature', 'editFeature'
  const [formData, setFormData] = useState({});

  // Map icon names to components for rendering
  const getIcon = (iconName) => {
    const icons = {
      MdHeadsetMic: <MdHeadsetMic />,
      MdCode: <MdCode />,
      MdRocketLaunch: <MdRocketLaunch />, // Assuming recent icon set, fallback might be needed if old version
      MdSecurity: <MdSecurity />,
      MdSpeed: <MdSpeed />,
      MdVerifiedUser: <MdVerifiedUser />
    };
    return icons[iconName] || <MdVerifiedUser />;
  };

  // --- Handlers ---

  const handleEditPageInfo = () => {
    setFormData({ ...pageInfo });
    setModalType('pageInfo');
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    setFormData({
        id: Date.now(),
        image: '',
        iconName: 'MdVerifiedUser',
        titleEn: '', titleAr: '',
        shortDescEn: '', shortDescAr: '',
        longDescEn: '', longDescAr: ''
    });
    setModalType('addFeature');
    setIsModalOpen(true);
  };

  const handleEditFeature = (feature) => {
    setFormData({ ...feature });
    setModalType('editFeature');
    setIsModalOpen(true);
  };

  const handleDeleteFeature = (id) => {
      if(window.confirm('Are you sure you want to delete this item?')) {
          setFeatures(prev => prev.filter(item => item.id !== id));
      }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setFormData({});
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (modalType === 'pageInfo') {
        setPageInfo(formData);
    } else if (modalType === 'addFeature') {
        setFeatures(prev => [...prev, formData]);
    } else if (modalType === 'editFeature') {
        setFeatures(prev => prev.map(item => item.id === formData.id ? formData : item));
    }
    closeModal();
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

  // --- Render Helpers ---

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
                <h1 className={styles.pageTitle}>{pageInfo.titleEn} / {pageInfo.titleAr}</h1>
                <p className={styles.pageSubtitle}>{pageInfo.shortDescEn} / {pageInfo.shortDescAr}</p>
            </div>
            <button className={styles.editInfoBtn} onClick={handleEditPageInfo}>
                <MdEdit /> {t('edit_content')}
            </button>
        </div>
        <div className={styles.pageDescription}>
            <p><strong>EN:</strong> {pageInfo.longDescEn}</p>
            <p><strong>AR:</strong> {pageInfo.longDescAr}</p>
        </div>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>{t('features_list') || 'Features List'}</h2>
        <button className={styles.addButton} onClick={handleAddFeature}>
          <MdAdd size={20} />
          {t('add_feature') || 'Add Feature'}
        </button>
      </div>

      <div className={styles.servicesGrid}>
        {features.map(feature => (
          <div key={feature.id} className={styles.card}>
            {/* Optional Image per card if needed, currently reusing logic but might be icon-heavy */}
            {feature.image && (
                <div className={styles.cardImageContainer}>
                    <img src={feature.image} alt={feature.titleEn} className={styles.cardImage} />
                </div>
            )}
            
            {/* Always show icon overlay/header for Why Us cards as per design usually icons are key */}
            <div style={{position: 'absolute', top: '15px', right: '15px', zIndex: 2}}>
                 <div className={styles.iconOverlay} style={{position: 'static'}}>
                    {getIcon(feature.iconName)}
                </div>
            </div>

            <div className={styles.cardContent} style={{marginTop: feature.image ? '0' : '3rem'}}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>
                      {feature.titleEn}
                  </h3>
                  <div className={styles.cardActions}>
                    <button className={styles.actionBtn} onClick={() => handleEditFeature(feature)} title={t('edit')}>
                      <MdEdit />
                    </button>
                     <button className={styles.actionBtn} onClick={() => handleDeleteFeature(feature.id)} title={t('delete')} style={{color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.3)'}}>
                      <MdDelete />
                    </button>
                  </div>
                </div>
                
                <p className={styles.cardDesc}>
                  {feature.shortDescEn}
                </p>

                <div className={styles.cardFooter}>
                     <span className={styles.badge}>{feature.iconName}</span>
                </div>
            </div>
          </div>
        ))}
      </div>

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
                {/* Page Info Form */}
                {modalType === 'pageInfo' && (
                    <>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t('title')} (EN)</label>
                            <input type="text" name="titleEn" value={formData.titleEn || ''} onChange={handleChange} className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t('short_description')} (EN)</label>
                            <textarea name="shortDescEn" value={formData.shortDescEn || ''} onChange={handleChange} className={styles.textarea} rows="2"/>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t('long_description')} (EN)</label>
                            <textarea name="longDescEn" value={formData.longDescEn || ''} onChange={handleChange} className={styles.textarea} rows="4"/>
                        </div>
                        <hr style={{opacity:0.1, margin: '1rem 0'}}/>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t('title')} (AR)</label>
                            <input type="text" name="titleAr" value={formData.titleAr || ''} onChange={handleChange} className={styles.input} dir="rtl"/>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t('short_description')} (AR)</label>
                            <textarea name="shortDescAr" value={formData.shortDescAr || ''} onChange={handleChange} className={styles.textarea} dir="rtl" rows="2"/>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t('long_description')} (AR)</label>
                            <textarea name="longDescAr" value={formData.longDescAr || ''} onChange={handleChange} className={styles.textarea} dir="rtl" rows="4"/>
                        </div>
                    </>
                )}

                {/* Feature Form */}
                {(modalType === 'addFeature' || modalType === 'editFeature') && (
                  <>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('image') || 'Image (Optional)'}</label>
                        <div className={styles.inputGroup}>
                            <input type="text" value={formData.image || ''} className={styles.input} readOnly placeholder="Upload an image..." />
                            <label className={styles.uploadBtn}>
                                <MdEdit />
                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{display: 'none'}} />
                            </label>
                        </div>
                        {formData.image && <img src={formData.image} alt="Preview" className={styles.imgPreview} />}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t('icon')}</label>
                      <select name="iconName" value={formData.iconName || 'MdVerifiedUser'} onChange={handleChange} className={styles.input}>
                        <option value="MdHeadsetMic">Support (Headset)</option>
                        <option value="MdCode">Quality (Code)</option>
                        <option value="MdRocketLaunch">Innovation (Rocket)</option>
                        <option value="MdSecurity">Security (Shield)</option>
                        <option value="MdSpeed">Performance (Speed)</option>
                        <option value="MdVerifiedUser">Verified (Check)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('title')} (EN)</label>
                        <input type="text" name="titleEn" value={formData.titleEn || ''} onChange={handleChange} className={styles.input} required />
                    </div>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>{t('short_description')} (EN)</label>
                        <textarea name="shortDescEn" value={formData.shortDescEn || ''} onChange={handleChange} className={styles.textarea} rows="2"/>
                    </div>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>{t('long_description')} (EN)</label>
                        <textarea name="longDescEn" value={formData.longDescEn || ''} onChange={handleChange} className={styles.textarea} rows="4"/>
                    </div>
                    
                    <hr style={{opacity:0.1, margin: '1rem 0'}}/>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('title')} (AR)</label>
                        <input type="text" name="titleAr" value={formData.titleAr || ''} onChange={handleChange} className={styles.input} dir="rtl" required />
                    </div>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>{t('short_description')} (AR)</label>
                        <textarea name="shortDescAr" value={formData.shortDescAr || ''} onChange={handleChange} className={styles.textarea} dir="rtl" rows="2"/>
                    </div>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>{t('long_description')} (AR)</label>
                        <textarea name="longDescAr" value={formData.longDescAr || ''} onChange={handleChange} className={styles.textarea} dir="rtl" rows="4"/>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={closeModal}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-primary" style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                  <MdSave />
                  {t('save')}
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
