import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdSave,
  MdEdit,
  MdClose,
  MdCloudUpload,
  MdPublic,
  MdContactPage,
  MdShare,
  MdDescription,
  MdImage,
  MdLanguage,
  MdSearch,
  MdEmail,
  MdLocationOn,
} from 'react-icons/md';
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaLinkedin,
  FaTelegram,
  FaSnapchat,
  FaTiktok,
  FaTwitter,
} from 'react-icons/fa';
import toast, { getActionMessageKey } from '../../utils/toast';
import { useAppDispatch, useAppSelector, usePermission, useResolvedMediaUrl, useAppReady } from '../../hooks';
import { fetchSettings, updateSettings } from '../../redux/actions/settingsActions';
import { selectSettings } from '../../redux/reducers/settingsReducer';
import { REQUEST_STATUS } from '../../redux/types';
import styles from './Settings.module.css';

const SOCIAL_PLATFORMS = [
  { key: 'facebook',  icon: FaFacebook,  labelKey: 'facebook',  placeholderKey: 'settings_placeholder_facebook' },
  { key: 'instagram', icon: FaInstagram, labelKey: 'instagram', placeholderKey: 'settings_placeholder_instagram' },
  { key: 'whatsapp',  icon: FaWhatsapp,  labelKey: 'whatsapp',  placeholderKey: 'settings_placeholder_whatsapp' },
  { key: 'linkedin',  icon: FaLinkedin,  labelKey: 'linkedin',  placeholderKey: 'settings_placeholder_linkedin' },
  { key: 'telegram',  icon: FaTelegram,  labelKey: 'telegram',  placeholderKey: 'settings_placeholder_telegram' },
  { key: 'snapchat',  icon: FaSnapchat,  labelKey: 'snapchat',  placeholderKey: 'settings_placeholder_snapchat' },
  { key: 'tiktok',    icon: FaTiktok,    labelKey: 'tiktok',    placeholderKey: 'settings_placeholder_tiktok' },
  { key: 'twitter',   icon: FaTwitter,   labelKey: 'twitter',   placeholderKey: 'settings_placeholder_twitter' },
];

const TABS = [
  { id: 'general', icon: MdPublic,       labelKey: 'general_info',      descKey: 'settings_general_desc' },
  { id: 'contact', icon: MdContactPage,  labelKey: 'contact_info',      descKey: 'settings_contact_desc' },
  { id: 'social',  icon: MdShare,        labelKey: 'social_links',      descKey: 'settings_social_desc' },
  { id: 'content', icon: MdDescription,  labelKey: 'localized_content', descKey: 'settings_content_desc' },
  { id: 'media',   icon: MdImage,        labelKey: 'branding',          descKey: 'settings_branding_desc' },
];

const URL_FIELDS = new Set([
  'facebook', 'instagram', 'whatsapp', 'linkedin',
  'telegram', 'snapchat', 'tiktok', 'twitter', 'location_url',
]);

const EMAIL_FIELDS = new Set(['site_email', 'email_support']);

const FIELD_KEY_MAP = {
  site_address: 'site_address[ar]',
  site_address_en: 'site_address[en]',
};

const normalizeUrl = (value) => {
  if (!value || /^https?:\/\//i.test(value)) return value;
  return `https://${value.replace(/^\/+/, '')}`;
};

const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return /^https?:\/\/.+/i.test(value);
  }
};

const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const MAX_FAVICON_SIZE = 2 * 1024 * 1024;

const validateMediaFile = (file, type) => {
  if (!file.type.startsWith('image/')) {
    const err = new Error('invalid_image');
    err.field = type;
    throw err;
  }

  const maxSize = type === 'logo' ? MAX_LOGO_SIZE : MAX_FAVICON_SIZE;
  if (file.size > maxSize) {
    const err = new Error('image_too_large');
    err.field = type;
    throw err;
  }
};

const CARD_FIELDS = {
  identity: [
    'site_name[ar]', 'site_name[en]',
    'site_desc[ar]', 'site_desc[en]',
  ],
  seo: [
    'meta_desc[ar]', 'meta_desc[en]',
  ],
  contact_channels: [
    'site_phone', 'site_email', 'email_support',
  ],
  location: [
    'site_address', 'site_address_en', 'location_url',
    'working_hours[ar]', 'working_hours[en]',
  ],
  social: [
    'facebook', 'instagram', 'whatsapp', 'linkedin',
    'telegram', 'snapchat', 'tiktok', 'twitter',
  ],
  service_text: [
    'service_text[ar]', 'service_text[en]',
  ],
  about_text: [
    'about_us_text[ar]', 'about_us_text[en]',
  ],
  branding: [],
};

const buildSettingsFormData = (formData, { logoFile, faviconFile }, cardId) => {
  const body = new FormData();
  body.append('_method', 'PUT');

  const fieldsToSend = CARD_FIELDS[cardId] || [];

  fieldsToSend.forEach((key) => {
    const raw = formData[key];
    let value = typeof raw === 'string' ? raw.trim() : raw;
    const apiKey = FIELD_KEY_MAP[key] || key;

    if (EMAIL_FIELDS.has(key)) {
      if (!value) return;
    }

    if (URL_FIELDS.has(key)) {
      if (!value) return;
      value = normalizeUrl(value);
      if (!isValidUrl(value)) {
        const err = new Error('invalid_url');
        err.field = key;
        throw err;
      }
    }

    body.append(apiKey, value ?? '');
  });

  if (cardId === 'branding') {
    if (!logoFile && !faviconFile) {
      const err = new Error('no_media_changes');
      throw err;
    }

    if (logoFile) {
      validateMediaFile(logoFile, 'logo');
      body.append('logo', logoFile);
    }

    if (faviconFile) {
      validateMediaFile(faviconFile, 'favicon');
      body.append('favicon', faviconFile);
    }
  }

  return body;
};

const EMPTY_FORM = {
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
};

const mapSettingsToForm = (data) => ({
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

/* ── Reusable field components ── */

const LangBadge = ({ lang }) => (
  <span className={`${styles.langBadge} ${lang === 'ar' ? styles.langBadgeAr : ''}`}>
    {lang.toUpperCase()}
  </span>
);

const TextField = ({ label, name, value, onChange, dir, lang, type = 'text', placeholder, disabled }) => (
  <div className={styles.field}>
    <div className={styles.labelRow}>
      <label className={styles.label} htmlFor={name}>{label}</label>
      {lang && <LangBadge lang={lang} />}
    </div>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={styles.input}
      dir={dir}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={disabled}
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, dir, lang, rows = 3, placeholder, disabled }) => (
  <div className={styles.field}>
    <div className={styles.labelRow}>
      <label className={styles.label} htmlFor={name}>{label}</label>
      {lang && <LangBadge lang={lang} />}
    </div>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={styles.textarea}
      dir={dir}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={disabled}
    />
  </div>
);

const BilingualGroup = ({ title, children }) => (
  <div className={styles.bilingualGroup}>
    {title && <p className={styles.bilingualGroupTitle}>{title}</p>}
    {children}
  </div>
);

const SectionCard = ({
  icon: Icon,
  title,
  description,
  canEdit,
  isEditing,
  saving,
  onEdit,
  onSave,
  onCancel,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderMain}>
          <div className={styles.cardHeaderIcon}>
            <Icon size={20} />
          </div>
          <div className={styles.cardHeaderText}>
            <h3 className={styles.cardTitle}>{title}</h3>
            {description && <p className={styles.cardDesc}>{description}</p>}
          </div>
        </div>
        {canEdit && (
          <div className={styles.cardHeaderActions}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={onCancel}
                  disabled={saving}
                >
                  <MdClose size={16} />
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={onSave}
                  disabled={saving}
                >
                  <MdSave size={16} />
                  {saving ? t('saving') : t('save_changes')}
                </button>
              </>
            ) : (
              <button type="button" className={styles.editBtn} onClick={onEdit}>
                <MdEdit size={16} />
                {t('edit')}
              </button>
            )}
          </div>
        )}
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
};

const UploadZone = ({ preview, isIcon, title, hint, onClick, inputRef, onChange, disabled }) => (
  <div className={styles.mediaCard}>
    <h4 className={styles.mediaCardTitle}>{title}</h4>
    {hint && <p className={styles.mediaCardHint}>{hint}</p>}
    <div
      className={`${styles.uploadZone} ${preview ? styles.uploadZoneHasImage : ''} ${isIcon && preview ? styles.uploadZoneHasIcon : ''} ${disabled ? styles.uploadZoneDisabled : ''}`}
      onClick={disabled ? undefined : onClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => !disabled && e.key === 'Enter' && onClick()}
      aria-disabled={disabled}
    >
      {preview ? (
        <img
          src={preview}
          alt={title}
          className={isIcon ? styles.uploadIconPreview : styles.uploadPreview}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className={styles.uploadPlaceholder}>
          <MdCloudUpload size={36} />
          <span className={styles.uploadLabel}>{title}</span>
        </div>
      )}
      {!disabled && <span className={styles.uploadOverlay}>{title}</span>}
    </div>
    <input type="file" ref={inputRef} onChange={onChange} accept="image/*" hidden disabled={disabled} />
  </div>
);

/* ── Main Component ── */

const Settings = () => {
  const { t } = useTranslation();
  const { can } = usePermission();
  const dispatch = useAppDispatch();
  const canEdit = can('settings.update');

  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const { data: settingsData, status } = useAppSelector(selectSettings);
  const loading = status === REQUEST_STATUS.LOADING && !settingsData;
  const fetchError = status === REQUEST_STATUS.FAILED;

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [editingCard, setEditingCard] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  const serverLogoSrc = useResolvedMediaUrl(settingsData?.logo);
  const serverFaviconSrc = useResolvedMediaUrl(settingsData?.favicon);

  const resetFromServer = useCallback(() => {
    if (!settingsData) return;
    setFormData(mapSettingsToForm(settingsData));
    setLogoPreview(null);
    setFaviconPreview(null);
    setLogoFile(null);
    setFaviconFile(null);
  }, [settingsData]);

  useEffect(() => {
    resetFromServer();
  }, [resetFromServer]);

  useEffect(() => {
    if (fetchError) {
      toast.error(t('fetch_error'));
    }
  }, [fetchError, t]);

  const handleTabChange = (tabId) => {
    if (editingCard) {
      resetFromServer();
      setEditingCard(null);
    }
    setActiveTab(tabId);
  };

  const handleStartEdit = (cardId) => {
    if (editingCard && editingCard !== cardId) {
      resetFromServer();
    }
    setEditingCard(cardId);
  };

  const handleCancelEdit = () => {
    resetFromServer();
    setEditingCard(null);
  };

  const isCardEditing = (cardId) => editingCard === cardId;
  const isCardDisabled = (cardId) => editingCard !== cardId;

  const cardActions = (cardId) => ({
    canEdit,
    isEditing: isCardEditing(cardId),
    saving: saving && isCardEditing(cardId),
    onEdit: () => handleStartEdit(cardId),
    onSave: () => handleSave(cardId),
    onCancel: handleCancelEdit,
  });

  const handleChange = (e) => {
    if (!editingCard) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, type) => {
    if (editingCard !== 'branding') return;
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(reader.result);
      } else {
        setFaviconFile(file);
        setFaviconPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (cardId) => {
    if (!canEdit || !cardId || editingCard !== cardId) return;

    setSaving(true);

    try {
      const body = buildSettingsFormData(formData, { logoFile, faviconFile }, cardId);

      const result = await dispatch(updateSettings(body)).unwrap();
      toast.success(t(getActionMessageKey('save')));
      dispatch(fetchSettings({ force: true }));
      setEditingCard(null);
      setLogoFile(null);
      setFaviconFile(null);
    } catch (err) {
      if (err?.message === 'no_media_changes') {
        toast.info(t('settings_no_media_changes'));
        return;
      }
      if (err?.message === 'invalid_url' && err.field) {
        toast.error(t('settings_invalid_url', { field: t(err.field) }));
        return;
      }
      if (err?.message === 'invalid_image' && err.field) {
        toast.error(t('settings_invalid_image', { field: t(err.field) }));
        return;
      }
      if (err?.message === 'image_too_large' && err.field) {
        toast.error(t('settings_image_too_large', { field: t(err.field) }));
        return;
      }
      if (err?.message === 'read_failed') {
        toast.error(t('settings_image_read_error'));
        return;
      }
      if (typeof err === 'string') {
        toast.error(err || t('save_error'));
        return;
      }
      if (err.response?.status === 422) {
        const errors = err.response.data?.errors || err.response.data?.data?.errors || {};
        const fieldLabels = {
          logo: t('logo'),
          favicon: t('favicon'),
        };
        const messages = Object.entries(errors).flatMap(([field, msgs]) =>
          msgs.map((msg) => (fieldLabels[field] ? `${fieldLabels[field]}: ${msg}` : msg))
        );
        if (messages.length > 0) {
          messages.forEach((msg) => toast.error(msg));
        } else {
          toast.error(err.response.data?.message || t('save_error'));
        }
      } else {
        toast.error(err.response?.data?.message || t('save_error'));
      }
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className={styles.sectionPanel}>
            <SectionCard
              icon={MdLanguage}
              title={t('settings_identity_title')}
              description={t('settings_identity_desc')}
              {...cardActions('identity')}
            >
              <BilingualGroup title={t('site_name')}>
                <TextField label={t('site_name')} name="site_name[ar]" value={formData['site_name[ar]']} onChange={handleChange} dir="rtl" lang="ar" disabled={isCardDisabled('identity')} />
                <TextField label={t('site_name')} name="site_name[en]" value={formData['site_name[en]']} onChange={handleChange} lang="en" disabled={isCardDisabled('identity')} />
              </BilingualGroup>
              <div className={styles.sectionGap}>
                <BilingualGroup title={t('site_description')}>
                  <TextAreaField label={t('site_description')} name="site_desc[ar]" value={formData['site_desc[ar]']} onChange={handleChange} dir="rtl" lang="ar" rows={4} disabled={isCardDisabled('identity')} />
                  <TextAreaField label={t('site_description')} name="site_desc[en]" value={formData['site_desc[en]']} onChange={handleChange} lang="en" rows={4} disabled={isCardDisabled('identity')} />
                </BilingualGroup>
              </div>
            </SectionCard>
            <div className={styles.sectionGap}>
              <SectionCard
                icon={MdSearch}
                title={t('settings_seo_title')}
                description={t('settings_seo_desc')}
                {...cardActions('seo')}
              >
                <BilingualGroup title={t('meta_description')}>
                  <TextAreaField label={t('meta_description')} name="meta_desc[ar]" value={formData['meta_desc[ar]']} onChange={handleChange} dir="rtl" lang="ar" rows={3} placeholder={t('settings_meta_placeholder')} disabled={isCardDisabled('seo')} />
                  <TextAreaField label={t('meta_description')} name="meta_desc[en]" value={formData['meta_desc[en]']} onChange={handleChange} lang="en" rows={3} placeholder={t('settings_meta_placeholder')} disabled={isCardDisabled('seo')} />
                </BilingualGroup>
              </SectionCard>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className={styles.sectionPanel}>
            <SectionCard
              icon={MdEmail}
              title={t('settings_contact_channels')}
              description={t('settings_contact_channels_desc')}
              {...cardActions('contact_channels')}
            >
              <div className={`${styles.fieldGrid} ${styles.fieldGridTriple}`}>
                <TextField label={t('phone')} name="site_phone" value={formData.site_phone} onChange={handleChange} type="tel" placeholder={t('settings_placeholder_phone')} disabled={isCardDisabled('contact_channels')} />
                <TextField label={t('email')} name="site_email" value={formData.site_email} onChange={handleChange} type="email" placeholder={t('settings_placeholder_email')} disabled={isCardDisabled('contact_channels')} />
                <TextField label={t('support_email')} name="email_support" value={formData.email_support} onChange={handleChange} type="email" placeholder={t('settings_placeholder_support_email')} disabled={isCardDisabled('contact_channels')} />
              </div>
            </SectionCard>
            <div className={styles.sectionGap}>
              <SectionCard
                icon={MdLocationOn}
                title={t('settings_location_title')}
                description={t('settings_location_desc')}
                {...cardActions('location')}
              >
                <BilingualGroup title={t('address')}>
                  <TextField label={t('address')} name="site_address" value={formData.site_address} onChange={handleChange} dir="rtl" lang="ar" disabled={isCardDisabled('location')} />
                  <TextField label={t('address')} name="site_address_en" value={formData.site_address_en} onChange={handleChange} lang="en" disabled={isCardDisabled('location')} />
                </BilingualGroup>
                <div className={styles.sectionGap}>
                  <div className={`${styles.fieldGrid} ${styles.fieldGridSingle}`}>
                    <TextField label={t('location_link')} name="location_url" value={formData.location_url} onChange={handleChange} placeholder={t('settings_placeholder_maps')} disabled={isCardDisabled('location')} />
                  </div>
                </div>
                <div className={styles.sectionGap}>
                  <BilingualGroup title={t('working_hours')}>
                    <TextField label={t('working_hours')} name="working_hours[ar]" value={formData['working_hours[ar]']} onChange={handleChange} dir="rtl" lang="ar" placeholder={t('settings_hours_placeholder')} disabled={isCardDisabled('location')} />
                    <TextField label={t('working_hours')} name="working_hours[en]" value={formData['working_hours[en]']} onChange={handleChange} lang="en" placeholder={t('settings_hours_placeholder_en')} disabled={isCardDisabled('location')} />
                  </BilingualGroup>
                </div>
              </SectionCard>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className={`${styles.sectionPanel} ${styles.socialPanel}`}>
            <SectionCard
              icon={MdShare}
              title={t('social_links')}
              description={t('settings_social_desc')}
              {...cardActions('social')}
            >
              <div className={styles.socialGrid}>
                {SOCIAL_PLATFORMS.map(({ key, icon: Icon, labelKey, placeholderKey }) => (
                  <div key={key} className={styles.socialCard}>
                    <div className={styles.socialCardHeader}>
                      <span className={`${styles.socialIcon} ${styles[key]}`}>
                        <Icon />
                      </span>
                      <span className={styles.socialName}>{t(labelKey)}</span>
                    </div>
                    <input
                      type="url"
                      name={key}
                      value={formData[key] || ''}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder={t(placeholderKey)}
                      disabled={isCardDisabled('social')}
                      readOnly={isCardDisabled('social')}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        );

      case 'content':
        return (
          <div className={styles.sectionPanel}>
            <SectionCard
              icon={MdDescription}
              title={t('service_text')}
              description={t('settings_service_text_desc')}
              {...cardActions('service_text')}
            >
              <BilingualGroup>
                <TextAreaField label={t('service_text')} name="service_text[ar]" value={formData['service_text[ar]']} onChange={handleChange} dir="rtl" lang="ar" rows={6} disabled={isCardDisabled('service_text')} />
                <TextAreaField label={t('service_text')} name="service_text[en]" value={formData['service_text[en]']} onChange={handleChange} lang="en" rows={6} disabled={isCardDisabled('service_text')} />
              </BilingualGroup>
            </SectionCard>
            <div className={styles.sectionGap}>
              <SectionCard
                icon={MdDescription}
                title={t('about_us_text')}
                description={t('settings_about_text_desc')}
                {...cardActions('about_text')}
              >
                <BilingualGroup>
                  <TextAreaField label={t('about_us_text')} name="about_us_text[ar]" value={formData['about_us_text[ar]']} onChange={handleChange} dir="rtl" lang="ar" rows={6} disabled={isCardDisabled('about_text')} />
                  <TextAreaField label={t('about_us_text')} name="about_us_text[en]" value={formData['about_us_text[en]']} onChange={handleChange} lang="en" rows={6} disabled={isCardDisabled('about_text')} />
                </BilingualGroup>
              </SectionCard>
            </div>
          </div>
        );

      case 'media':
        return (
          <div className={styles.sectionPanel}>
            <SectionCard
              icon={MdImage}
              title={t('branding')}
              description={t('settings_branding_desc')}
              {...cardActions('branding')}
            >
              <div className={styles.mediaGrid}>
                <UploadZone
                  preview={logoPreview || serverLogoSrc}
                  title={t('logo')}
                  hint={t('settings_logo_hint')}
                  onClick={() => logoInputRef.current?.click()}
                  inputRef={logoInputRef}
                  onChange={(e) => handleImageChange(e, 'logo')}
                  disabled={isCardDisabled('branding')}
                />
                <UploadZone
                  preview={faviconPreview || serverFaviconSrc}
                  isIcon
                  title={t('favicon')}
                  hint={t('settings_favicon_hint')}
                  onClick={() => faviconInputRef.current?.click()}
                  inputRef={faviconInputRef}
                  onChange={(e) => handleImageChange(e, 'favicon')}
                  disabled={isCardDisabled('branding')}
                />
              </div>
            </SectionCard>
          </div>
        );

      default:
        return null;
    }
  };

  useAppReady(!loading);

  if (loading) return null;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <h1 className={styles.pageTitle}>{t('settings')}</h1>
          <p className={styles.pageSubtitle}>{t('settings_subtitle')}</p>
        </div>
      </header>

      <nav className={styles.tabsRow} aria-label={t('settings')}>
        {TABS.map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            type="button"
            className={`${styles.tabChip} ${activeTab === id ? styles.tabChipActive : ''}`}
            onClick={() => handleTabChange(id)}
          >
            <span className={styles.tabChipIcon}>
              <Icon size={18} />
            </span>
            <span className={styles.tabChipLabel}>{t(labelKey)}</span>
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Settings;
