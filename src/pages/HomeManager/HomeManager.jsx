import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdSave,
  MdEdit,
  MdClose,
  MdCloudUpload,
  MdImage,
  MdLanguage,
  MdLock,
} from 'react-icons/md';
import toast, { getActionMessageKey } from '../../utils/toast';
import { useAppDispatch, useAppSelector, usePermission, useResolvedMediaUrl, useAppReady } from '../../hooks';
import { fetchHeroSection, updateHeroSection } from '../../redux/actions/heroActions';
import { selectHero } from '../../redux/reducers/heroReducer';
import { REQUEST_STATUS } from '../../redux/types';
import { getAppLanguage } from '../../i18n';
import styles from './HomeManager.module.css';

const EMPTY_FORM = {
  titleEn: '',
  titleAr: '',
  subtitleEn: '',
  subtitleAr: '',
  descriptionEn: '',
  descriptionAr: '',
};

const mapHeroToForm = (heroData) => ({
  titleEn: heroData?.title?.en || '',
  titleAr: heroData?.title?.ar || '',
  subtitleEn: heroData?.subtitle?.en || '',
  subtitleAr: heroData?.subtitle?.ar || '',
  descriptionEn: heroData?.description?.en || '',
  descriptionAr: heroData?.description?.ar || '',
});

const LangBadge = ({ lang }) => (
  <span className={`${styles.langBadge} ${lang === 'ar' ? styles.langBadgeAr : ''}`}>
    {lang.toUpperCase()}
  </span>
);

const SectionCard = ({ icon: Icon, title, description, children }) => (
  <section className={styles.card}>
    <div className={styles.cardHeader}>
      <div className={styles.cardHeaderIcon}>
        <Icon size={20} />
      </div>
      <div>
        <h3 className={styles.cardTitle}>{title}</h3>
        {description && <p className={styles.cardDesc}>{description}</p>}
      </div>
    </div>
    <div className={styles.cardBody}>{children}</div>
  </section>
);

const HomeManager = () => {
  const { t } = useTranslation();
  const { can } = usePermission();
  const dispatch = useAppDispatch();
  const isAr = getAppLanguage() === 'ar';
  const canEdit = can('hero_section.update');
  const fileInputRef = useRef(null);

  const { data: heroData, status, lastUpdated } = useAppSelector(selectHero);
  const loading = status === REQUEST_STATUS.LOADING && !heroData;

  useEffect(() => {
    dispatch(fetchHeroSection());
  }, [dispatch]);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const previewUrlRef = useRef(null);

  const serverImageSrc = useResolvedMediaUrl(heroData?.image, lastUpdated);
  const fieldsDisabled = !isEditing;

  const resetFromServer = useCallback(() => {
    if (!heroData) return;
    setFormData(mapHeroToForm(heroData));
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImagePreview(null);
    setImageFile(null);
  }, [heroData]);

  useEffect(() => {
    resetFromServer();
  }, [resetFromServer]);

  useEffect(() => () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
  }, []);

  const previewImage = imagePreview || serverImageSrc;

  const handleChange = (e) => {
    if (!isEditing) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (!isEditing) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setImageFile(file);
    setImagePreview(objectUrl);
    e.target.value = '';
  };

  const handleStartEdit = () => setIsEditing(true);

  const handleCancelEdit = () => {
    resetFromServer();
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canEdit || !isEditing) return;
    setSaving(true);

    const body = new FormData();
    body.append('title[ar]', formData.titleAr);
    body.append('title[en]', formData.titleEn);
    body.append('subtitle[ar]', formData.subtitleAr);
    body.append('subtitle[en]', formData.subtitleEn);
    body.append('description[ar]', formData.descriptionAr);
    body.append('description[en]', formData.descriptionEn);
    if (imageFile) {
      body.append('image', imageFile, imageFile.name);
    }

    try {
      const result = await dispatch(updateHeroSection(body)).unwrap();
      toast.success(t(getActionMessageKey('update')));
      await dispatch(fetchHeroSection({ force: true })).unwrap();
      setIsEditing(false);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      toast.error(err || t('error_generic'));
    } finally {
      setSaving(false);
    }
  };

  useAppReady(!loading);

  if (loading) return null;

  if (!heroData) return null;

  return (
    <div className={styles.page} dir={isAr ? 'rtl' : 'ltr'}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t('home')}</h1>
        <p className={styles.pageSubtitle}>{t('home_page.subtitle')}</p>
      </header>

      <div className={styles.toolbar}>
        <span className={`${styles.toolbarBadge} ${isEditing ? styles.toolbarBadgeEdit : ''}`}>
          {isEditing ? <MdEdit size={14} /> : <MdLock size={14} />}
          {isEditing ? t('home_page.editing') : t('home_page.view_mode')}
        </span>
        {canEdit && (
          <div className={styles.toolbarActions}>
            {isEditing ? (
              <>
                <button type="button" className={styles.cancelBtn} onClick={handleCancelEdit} disabled={saving}>
                  <MdClose size={16} />
                  {t('cancel')}
                </button>
                <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  <MdSave size={16} />
                  {saving ? t('saving') : t('save_changes')}
                </button>
              </>
            ) : (
              <button type="button" className={styles.editBtn} onClick={handleStartEdit}>
                <MdEdit size={16} />
                {t('edit')}
              </button>
            )}
          </div>
        )}
      </div>

      <SectionCard
        icon={MdImage}
        title={t('home_page.media')}
        description={t('home_page.media_desc')}
      >
        <div
          className={`${styles.uploadZone} ${fieldsDisabled ? styles.uploadZoneDisabled : ''}`}
          onClick={() => !fieldsDisabled && fileInputRef.current?.click()}
          role="button"
          tabIndex={fieldsDisabled ? -1 : 0}
          onKeyDown={(e) => !fieldsDisabled && e.key === 'Enter' && fileInputRef.current?.click()}
          aria-disabled={fieldsDisabled}
        >
          {previewImage ? (
            <img
              src={previewImage}
              alt={t('image')}
              className={styles.uploadImage}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className={styles.uploadPlaceholder}>
              <MdCloudUpload size={36} />
              <span>{t('change_image')}</span>
            </div>
          )}
          {!fieldsDisabled && (
            <div className={styles.uploadOverlay}>
              <MdCloudUpload size={36} />
              <span>{t('change_image')}</span>
            </div>
          )}
        </div>
        <p className={styles.uploadHint}>{t('home_page.image_hint')}</p>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageChange}
          hidden
          disabled={fieldsDisabled}
        />
      </SectionCard>

      <SectionCard
        icon={MdLanguage}
        title={t('home_page.content')}
        description={t('home_page.content_desc')}
      >
        <div className={styles.bilingualGrid}>
          <div className={styles.langPanel}>
            <div className={styles.langPanelHeader}>
              <span className={styles.langPanelTitle}>{t('english_content')}</span>
              <LangBadge lang="en" />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="titleEn">{t('title')}</label>
              <input
                id="titleEn"
                type="text"
                name="titleEn"
                value={formData.titleEn}
                onChange={handleChange}
                className={styles.input}
                disabled={fieldsDisabled}
                readOnly={fieldsDisabled}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="subtitleEn">{t('subtitle')}</label>
              <input
                id="subtitleEn"
                type="text"
                name="subtitleEn"
                value={formData.subtitleEn}
                onChange={handleChange}
                className={styles.input}
                disabled={fieldsDisabled}
                readOnly={fieldsDisabled}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="descriptionEn">{t('description')}</label>
              <textarea
                id="descriptionEn"
                name="descriptionEn"
                value={formData.descriptionEn}
                onChange={handleChange}
                className={styles.textarea}
                rows={4}
                disabled={fieldsDisabled}
                readOnly={fieldsDisabled}
              />
            </div>
          </div>

          <div className={styles.langPanel} dir="rtl">
            <div className={styles.langPanelHeader}>
              <span className={styles.langPanelTitle}>{t('arabic_content')}</span>
              <LangBadge lang="ar" />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="titleAr">{t('title')}</label>
              <input
                id="titleAr"
                type="text"
                name="titleAr"
                value={formData.titleAr}
                onChange={handleChange}
                className={styles.input}
                dir="rtl"
                disabled={fieldsDisabled}
                readOnly={fieldsDisabled}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="subtitleAr">{t('subtitle')}</label>
              <input
                id="subtitleAr"
                type="text"
                name="subtitleAr"
                value={formData.subtitleAr}
                onChange={handleChange}
                className={styles.input}
                dir="rtl"
                disabled={fieldsDisabled}
                readOnly={fieldsDisabled}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="descriptionAr">{t('description')}</label>
              <textarea
                id="descriptionAr"
                name="descriptionAr"
                value={formData.descriptionAr}
                onChange={handleChange}
                className={styles.textarea}
                rows={4}
                dir="rtl"
                disabled={fieldsDisabled}
                readOnly={fieldsDisabled}
              />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default HomeManager;
