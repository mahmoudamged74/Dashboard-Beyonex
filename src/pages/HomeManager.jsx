import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdEdit, MdAdd, MdDelete, MdClose, MdSave } from 'react-icons/md';
import styles from './ContentManager.module.css';

const HomeManager = () => {
  const { t } = useTranslation();

  // Mock Data
  const [heroSlides, setHeroSlides] = useState([
    {
      id: 1,
      image: '/assets/slide1.jpg',
      titleEn: 'Welcome to Beyonex IT',
      titleAr: 'أهلاً بك في بيونكس اي تي',
      subtitleEn: 'Advanced Software Solutions',
      subtitleAr: 'حلول برمجية متطورة',
      status: 'active'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);

  const handleEdit = (slide) => {
    setCurrentSlide({ ...slide }); // copy object
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSlide(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setHeroSlides((prev) => 
      prev.map((item) => (item.id === currentSlide.id ? currentSlide : item))
    );
    closeModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentSlide({ ...currentSlide, [name]: value });
  };

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  // Handle File Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCurrentSlide({ ...currentSlide, image: imageUrl });
    }
  };

  const Modal = () => (
    <div className={styles.modalOverlay} onClick={closeModal} style={{ zIndex: 9999 }}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t('edit_content')}</h3>
          <button className={styles.closeBtn} onClick={closeModal}><MdClose /></button>
        </div>
        
        <form onSubmit={handleSave}>
          <div className={styles.modalBody}>
            {/* Image Input with Upload Button */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('image_url')}</label>
              <div className={styles.inputGroup}>
                <input 
                  type="text" 
                  name="image" 
                  value={currentSlide.image} 
                  onChange={handleChange} 
                  className={styles.input}
                  readOnly 
                />
                <label className="btn-primary" style={{cursor: 'pointer', padding: '10px 15px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:0, borderRadius: '0 8px 8px 0'}}>
                  <MdEdit style={{marginRight: '0'}}/>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{display: 'none'}} 
                  />
                </label>
              </div>
              {currentSlide.image && (
                <img src={currentSlide.image} alt="Preview" style={{height:'100px', width: '100px', objectFit: 'cover', borderRadius:'8px', marginTop:'10px', alignSelf: 'center'}} />
              )}
            </div>

            {/* English Fields */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('title')} (EN)</label>
              <input 
                type="text" 
                name="titleEn" 
                value={currentSlide.titleEn} 
                onChange={handleChange} 
                className={styles.input} 
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('subtitle')} (EN)</label>
              <input 
                type="text" 
                name="subtitleEn" 
                value={currentSlide.subtitleEn} 
                onChange={handleChange} 
                className={styles.input} 
              />
            </div>

            {/* Arabic Fields */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('title')} (AR)</label>
              <input 
                type="text" 
                name="titleAr" 
                value={currentSlide.titleAr} 
                onChange={handleChange} 
                className={styles.input}
                dir="rtl" 
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('subtitle')} (AR)</label>
              <input 
                type="text" 
                name="subtitleAr" 
                value={currentSlide.subtitleAr} 
                onChange={handleChange} 
                className={styles.input}
                dir="rtl" 
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={closeModal} className={styles.btnCancel}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary">
              <MdSave />
              {t('save_changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className="fade-in">
        <div className={styles.header}>
          <h2 className={styles.title}>{t('hero_section')}</h2>
        </div>

        <div className={`glass-panel ${styles.tableContainer}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('image')}</th>
                <th>{t('title')} (EN)</th>
                <th>{t('title')} (AR)</th>
                <th>{t('status')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {heroSlides.map((slide) => (
                <tr key={slide.id}>
                  <td>
                    <img src={slide.image} alt="Hero" className={styles.imgPreview} />
                  </td>
                  <td>{slide.titleEn}</td>
                  <td>{slide.titleAr}</td>
                  <td>
                    <span className={`${styles.status} ${styles[slide.status]}`}>
                      {t(slide.status)}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`${styles.actionBtn} ${styles.editBtn}`} 
                      title={t('edit')}
                      onClick={() => handleEdit(slide)}
                    >
                      <MdEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && currentSlide && <Modal />}
    </div>
  );
};

export default HomeManager;
