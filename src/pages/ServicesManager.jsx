import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdDesignServices, MdCode, MdSecurity, MdPhoneIphone, MdDataUsage, MdCloud } from 'react-icons/md';
import styles from './ServicesManager.module.css';

const ServicesManager = () => {
  const { t } = useTranslation();

  // Page Info State
  const [pageInfo, setPageInfo] = useState({
    titleEn: 'Our Services',
    titleAr: 'خدماتنا',
    shortDescEn: 'We offer a wide range of software solutions.',
    shortDescAr: 'نقدم مجموعة واسعة من الحلول البرمجية.',
    longDescEn: 'Explore our comprehensive list of services designed to help your business grow and succeed in the digital age.',
    longDescAr: 'استكشف قائمتنا الشاملة من الخدمات المصممة لمساعدة عملك على النمو والنجاح في العصر الرقمي.'
  });

  // Initial Mock Data (6 services) with Images
  const [services, setServices] = useState([
    {
      id: 1,
      image: '/assets/slide1.jpg', // Placeholder, user can change
      iconName: 'MdCode',
      titleEn: 'Web Development',
      titleAr: 'تطوير المواقع',
      shortDescEn: 'Building responsive and modern websites tailored to your needs.',
      shortDescAr: 'بناء مواقع متجاوبة وحديثة تناسب احتياجاتك.',
      longDescEn: 'We provide full-stack web development services using the latest technologies like React, Node.js, and more. Our websites are fast, secure, and SEO-friendly.',
      longDescAr: 'نقدم خدمات تطوير ويب متكاملة باستخدام أحدث التقنيات مثل React و Node.js والمزيد. مواقعنا سريعة وآمنة وصديقة لمحركات البحث.'
    },
    {
      id: 2,
      image: '/assets/slide1.jpg',
      iconName: 'MdPhoneIphone',
      titleEn: 'Mobile App Development',
      titleAr: 'تطوير تطبيقات الجوال',
      shortDescEn: 'Creating native and cross-platform mobile applications.',
      shortDescAr: 'إنشاء تطبيقات جوال أصلية ومتعددة المنصات.',
      longDescEn: 'From iOS to Android, we build high-quality mobile apps that offer seamless user experiences and robust performance.',
      longDescAr: 'من iOS إلى Android، نقوم ببناء تطبيقات جوال عالية الجودة توفر تجربة مستخدم سلسة وأداء قوي.'
    },
    {
      id: 3,
      image: '/assets/slide1.jpg',
      iconName: 'MdDesignServices',
      titleEn: 'UI/UX Design',
      titleAr: 'تصميم واجهة وتجربة المستخدم',
      shortDescEn: 'Designing intuitive and engaging user interfaces.',
      shortDescAr: 'تصميم واجهات مستخدم بديهية وجذابة.',
      longDescEn: 'Our design team focuses on creating user-centric designs that are not only visually appealing but also easy to navigate and use.',
      longDescAr: 'يركز فريق التصميم لدينا على إنشاء تصميمات تتمحور حول المستخدم، ليست جذابة بصريًا فحسب، بل سهلة التصفح والاستخدام أيضًا.'
    },
    {
      id: 4,
      image: '/assets/slide1.jpg',
      iconName: 'MdSecurity',
      titleEn: 'Cybersecurity',
      titleAr: 'الأمن السيبراني',
      shortDescEn: 'Protecting your digital assets from threats.',
      shortDescAr: 'حماية أصولك الرقمية من التهديدات.',
      longDescEn: 'We offer comprehensive cybersecurity solutions to safeguard your data and infrastructure against potential attacks and breaches.',
      longDescAr: 'نقدم حلولًا umfassende للأمن السيبراني لحماية بياناتك وبنيتك التحتية من الهجمات والانتهاكات المحتملة.'
    },
    {
      id: 5,
      image: '/assets/slide1.jpg',
      iconName: 'MdDataUsage',
      titleEn: 'Data Analytics',
      titleAr: 'تحليل البيانات',
      shortDescEn: 'Turning data into actionable insights.',
      shortDescAr: 'تحويل البيانات إلى رؤى قابلة للتنفيذ.',
      longDescEn: 'Leverage the power of data with our analytics services to make informed business decisions and drive growth.',
      longDescAr: 'استفد من قوة البيانات مع خدمات التحليل لدينا لاتخاذ قرارات عمل مستنيرة ودفع عجلة النمو.'
    },
    {
      id: 6,
      image: '/assets/slide1.jpg',
      iconName: 'MdCloud',
      titleEn: 'Cloud Solutions',
      titleAr: 'الحلول السحابية',
      shortDescEn: 'Scalable cloud infrastructure for your business.',
      shortDescAr: 'بنية تحتية سحابية قابلة للتوسع لعملك.',
      longDescEn: 'We help you migrate, manage, and optimize your cloud infrastructure ensuring scalability and cost-efficiency.',
      longDescAr: 'نساعدك على ترحيل وإدارة وتحسين بنيتك التحتية السحابية لضمان القابلية للتوسع وكفاءة التكلفة.'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'pageInfo', 'addService', 'editService'
  const [formData, setFormData] = useState({});

  // Map icon names to components for rendering
  const getIcon = (iconName) => {
    const icons = {
      MdCode: <MdCode />,
      MdPhoneIphone: <MdPhoneIphone />,
      MdDesignServices: <MdDesignServices />,
      MdSecurity: <MdSecurity />,
      MdDataUsage: <MdDataUsage />,
      MdCloud: <MdCloud />
    };
    return icons[iconName] || <MdDesignServices />;
  };

  // --- Handlers ---

  const handleEditPageInfo = () => {
    setFormData({ ...pageInfo });
    setModalType('pageInfo');
    setIsModalOpen(true);
  };

  const handleAddService = () => {
    setFormData({
        id: Date.now(),
        image: '',
        iconName: 'MdDesignServices',
        titleEn: '', titleAr: '',
        shortDescEn: '', shortDescAr: '',
        longDescEn: '', longDescAr: ''
    });
    setModalType('addService');
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setFormData({ ...service });
    setModalType('editService');
    setIsModalOpen(true);
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
    } else if (modalType === 'addService') {
        setServices(prev => [...prev, formData]);
    } else if (modalType === 'editService') {
        setServices(prev => prev.map(item => item.id === formData.id ? formData : item));
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
        <h2 className={styles.sectionTitle}>{t('services_list')}</h2>
        <button className={styles.addButton} onClick={handleAddService}>
          <MdAdd size={20} />
          {t('add_service')}
        </button>
      </div>

      <div className={styles.servicesGrid}>
        {services.map(service => (
          <div key={service.id} className={styles.card}>
            {service.image && (
                <div className={styles.cardImageContainer}>
                    <img src={service.image} alt={service.titleEn} className={styles.cardImage} />
                    <div className={styles.iconOverlay}>
                        {getIcon(service.iconName)}
                    </div>
                </div>
            )}
            
            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>
                      {service.titleEn}
                  </h3>
                  <div className={styles.cardActions}>
                    <button className={styles.actionBtn} onClick={() => handleEditService(service)} title={t('edit')}>
                      <MdEdit />
                    </button>
                  </div>
                </div>
                
                <p className={styles.cardDesc}>
                  {truncate(service.shortDescEn, 80)}
                </p>
                
                <div className={styles.cardFooter}>
                     <span className={styles.badge}>{service.iconName}</span>
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
                {modalType === 'addService' && t('add_service')}
                {modalType === 'editService' && t('edit_service')}
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

                {/* Service Form */}
                {(modalType === 'addService' || modalType === 'editService') && (
                  <>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('image')}</label>
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
                      <select name="iconName" value={formData.iconName || 'MdDesignServices'} onChange={handleChange} className={styles.input}>
                        <option value="MdCode">Code / Development</option>
                        <option value="MdPhoneIphone">Mobile / App</option>
                        <option value="MdDesignServices">Design</option>
                        <option value="MdSecurity">Security</option>
                        <option value="MdDataUsage">Data / Analytics</option>
                        <option value="MdCloud">Cloud</option>
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

export default ServicesManager;
