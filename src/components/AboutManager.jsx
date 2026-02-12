import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdEdit, MdClose, MdSave } from 'react-icons/md';
import styles from '../pages/ContentManager.module.css'; // Reusing styles

const AboutManager = () => {
  const { t } = useTranslation();

  const [aboutData, setAboutData] = useState({
      image: '/assets/about-img.jpg', // Placeholder
      mainTitleEn: 'Who We Are',
      mainTitleAr: 'من نحن',
      subtitleEn: 'Partners in Digital Transformation',
      subtitleAr: 'شركاؤك في رحلة التحول الرقمي',
      descEn: 'Beyonex IT is a leading software solutions company. We believe technology should serve business needs, creating innovative solutions that help companies grow and thrive in the digital age.',
      descAr: 'بيونكس IT هي شركة رائدة في مجال الحلول البرمجية والتقنية. نحن نؤمن بأن التكنولوجيا يجب أن تكون في خدمة الأعمال، ولهذا نعمل على تطوير حلول مبتكرة تساعد الشركات على النمو والازدهار في العصر الرقمي.',
      
      missionTitleEn: 'Our Mission',
      missionTitleAr: 'مهمتنا',
      missionDescEn: 'We aim to empower companies to maximize technology benefits by delivering sophisticated software solutions that meet their unique needs and help achieve strategic goals.',
      missionDescAr: 'نهدف إلى تمكين الشركات من تحقيق أقصى استفادة من التكنولوجيا من خلال تقديم حلول برمجية متطورة تلبي احتياجاتهم الفريدة وتساعدهم على تحقيق أهدافهم الاستراتيجية.',

      visionTitleEn: 'Our Vision',
      visionTitleAr: 'رؤيتنا',
      visionDescEn: 'To be the preferred technical partner for companies in the region by delivering innovative solutions and exceptional services that create real value for our clients.',
      visionDescAr: 'أن نكون الشريك التقني المفضل للشركات في المنطقة من خلال تقديم حلول مبتكرة وخدمات استثنائية تحقق قيمة حقيقية لعملائنا.'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleEdit = () => {
    setFormData({ ...aboutData });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
  };

  const handleSave = (e) => {
    e.preventDefault();
    setAboutData(formData);
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

  return (
    <>
    <div className="fade-in" style={{ marginTop: '3rem' }}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('about_section')}</h2>
      </div>

      <div className={`glass-panel ${styles.tableContainer}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('image')}</th>
              <th>{t('title')} (EN/AR)</th>
              <th>{t('mission')}</th>
              <th>{t('vision')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <img src={aboutData.image} alt="About" className={styles.imgPreview} style={{width: '60px', height:'60px', borderRadius:'50%'}} />
              </td>
              <td>
                <div style={{fontWeight:'bold'}}>{aboutData.mainTitleEn}</div>
                <div style={{color:'var(--text-muted)', fontSize:'0.9em'}}>{aboutData.mainTitleAr}</div>
              </td>
              <td>
                <div style={{fontWeight:'bold'}}>{aboutData.missionTitleEn}</div>
                <div style={{color:'var(--text-muted)', fontSize:'0.9em'}}>{aboutData.missionTitleAr}</div>
              </td>
              <td>
                <div style={{fontWeight:'bold'}}>{aboutData.visionTitleEn}</div>
                <div style={{color:'var(--text-muted)', fontSize:'0.9em'}}>{aboutData.visionTitleAr}</div>
              </td>
              <td>
                <button 
                  className={`${styles.actionBtn} ${styles.editBtn}`} 
                  title={t('edit')}
                  onClick={handleEdit}
                >
                  <MdEdit />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t('edit_about_content')}</h3>
              <button className={styles.closeBtn} onClick={closeModal}>
                <MdClose />
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.modalBody}>
                {/* Image */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('image')}</label>
                    <div className={styles.inputGroup}>
                        <input type="text" value={formData.image || ''} className={styles.input} readOnly placeholder="Upload an image..." />
                        <label className="btn-primary" style={{cursor: 'pointer', padding: '10px 15px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:0, borderRadius: '0 8px 8px 0'}}>
                            <MdEdit style={{marginRight: '0'}}/>
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{display: 'none'}} />
                        </label>
                    </div>
                </div>
                {formData.image && <img src={formData.image} alt="Preview" style={{height:'100px', width: 'auto', borderRadius:'8px', marginTop:'10px', alignSelf: 'center'}} />}

                <h4 style={{color:'var(--primary)', marginTop:'1rem', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'0.5rem'}}>{t('main_info')}</h4>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('title')} (EN)</label>
                    <input type="text" name="mainTitleEn" value={formData.mainTitleEn || ''} onChange={handleChange} className={styles.input} />
                </div>
                 <div className={styles.formGroup}>
                    <label className={styles.label}>{t('subtitle')} (EN)</label>
                    <input type="text" name="subtitleEn" value={formData.subtitleEn || ''} onChange={handleChange} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('description')} (EN)</label>
                    <textarea name="descEn" value={formData.descEn || ''} onChange={handleChange} className={styles.textarea} rows="3"/>
                </div>
                 <div className={styles.formGroup}>
                    <label className={styles.label}>{t('title')} (AR)</label>
                    <input type="text" name="mainTitleAr" value={formData.mainTitleAr || ''} onChange={handleChange} className={styles.input} dir="rtl"/>
                </div>
                 <div className={styles.formGroup}>
                    <label className={styles.label}>{t('subtitle')} (AR)</label>
                    <input type="text" name="subtitleAr" value={formData.subtitleAr || ''} onChange={handleChange} className={styles.input} dir="rtl"/>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('description')} (AR)</label>
                    <textarea name="descAr" value={formData.descAr || ''} onChange={handleChange} className={styles.textarea} dir="rtl" rows="3"/>
                </div>

                <h4 style={{color:'var(--primary)', marginTop:'1rem', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'0.5rem'}}>{t('mission')}</h4>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('title')} (EN)</label>
                    <input type="text" name="missionTitleEn" value={formData.missionTitleEn || ''} onChange={handleChange} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('description')} (EN)</label>
                    <textarea name="missionDescEn" value={formData.missionDescEn || ''} onChange={handleChange} className={styles.textarea} rows="3"/>
                </div>
                 <div className={styles.formGroup}>
                    <label className={styles.label}>{t('title')} (AR)</label>
                    <input type="text" name="missionTitleAr" value={formData.missionTitleAr || ''} onChange={handleChange} className={styles.input} dir="rtl"/>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('description')} (AR)</label>
                    <textarea name="missionDescAr" value={formData.missionDescAr || ''} onChange={handleChange} className={styles.textarea} dir="rtl" rows="3"/>
                </div>

                <h4 style={{color:'var(--primary)', marginTop:'1rem', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'0.5rem'}}>{t('vision')}</h4>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('title')} (EN)</label>
                    <input type="text" name="visionTitleEn" value={formData.visionTitleEn || ''} onChange={handleChange} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('description')} (EN)</label>
                    <textarea name="visionDescEn" value={formData.visionDescEn || ''} onChange={handleChange} className={styles.textarea} rows="3"/>
                </div>
                 <div className={styles.formGroup}>
                    <label className={styles.label}>{t('title')} (AR)</label>
                    <input type="text" name="visionTitleAr" value={formData.visionTitleAr || ''} onChange={handleChange} className={styles.input} dir="rtl"/>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('description')} (AR)</label>
                    <textarea name="visionDescAr" value={formData.visionDescAr || ''} onChange={handleChange} className={styles.textarea} dir="rtl" rows="3"/>
                </div>

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
    </>
  );
};

export default AboutManager;
