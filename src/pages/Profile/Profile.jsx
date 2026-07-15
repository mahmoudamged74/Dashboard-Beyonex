import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import toast, { getActionMessageKey } from '../../utils/toast';
import {
  MdEdit,
  MdClose,
  MdCloudUpload,
  MdSave,
  MdShield,
  MdCalendarToday,
  MdEmail,
  MdPerson,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';
import { useAppDispatch, useAppSelector, usePermission, useResolvedMediaUrl, useAppReady } from '../../hooks';
import { fetchProfile, updateProfile } from '../../redux/actions/profileActions';
import { selectProfile } from '../../redux/reducers/profileReducer';
import { REQUEST_STATUS } from '../../redux/types';
import { getAppLanguage } from '../../i18n';
import styles from './Profile.module.css';

const getGroupKey = (key) => String(key).split('.')[0];

const normalizePermission = (perm) => {
  if (typeof perm === 'string') return { key: perm, name_ar: '', name_en: '' };
  return {
    key: perm.key,
    name_ar: perm.name_ar || '',
    name_en: perm.name_en || '',
  };
};

const groupPermissions = (permissions) => {
  const groups = {};
  permissions.forEach((raw) => {
    const perm = normalizePermission(raw);
    if (!perm.key) return;
    const group = getGroupKey(perm.key);
    if (!groups[group]) groups[group] = [];
    groups[group].push(perm);
  });
  return groups;
};

const formatMemberDate = (dateStr, locale) => {
  if (!dateStr) return null;
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

const humanizeModuleKey = (key) =>
  String(key)
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const MetaItem = ({ icon: Icon, label, value, highlight, status }) => (
  <div className={styles.metaItem}>
    <div className={styles.metaItemHeader}>
      <span className={styles.metaIcon}><Icon size={16} /></span>
      <span className={styles.metaLabel}>{label}</span>
    </div>
    <span
      className={`${styles.metaValue} ${highlight ? styles.metaHighlight : ''} ${
        status === true ? styles.metaActive : status === false ? styles.metaInactive : ''
      }`}
    >
      {value}
    </span>
  </div>
);

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { can } = usePermission();
  const dispatch = useAppDispatch();
  const isAr = getAppLanguage(i18n.language) === 'ar';
  const locale = isAr ? 'ar' : 'en';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const { data: admin, status } = useAppSelector(selectProfile);
  const loading = status === REQUEST_STATUS.LOADING && !admin;

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const resolvedAvatar = useResolvedMediaUrl(admin?.image);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const resolvedPreview = useResolvedMediaUrl(
    imagePreview && !String(imagePreview).startsWith('data:') ? imagePreview : null
  );

  const emptyValue = t('profile.not_available');

  const getRoleName = useCallback((role) => {
    if (!role) return emptyValue;
    return (isAr ? role.name_ar : role.name_en) || role.name || emptyValue;
  }, [isAr, emptyValue]);

  const getModuleLabel = useCallback((moduleKey) => {
    const key = `profile.perm_modules.${moduleKey}`;
    if (i18n.exists(key)) return t(key);
    return humanizeModuleKey(moduleKey);
  }, [t, i18n]);

  const getActionLabel = useCallback((action) => {
    const key = `profile.perm_actions.${action}`;
    if (i18n.exists(key)) return t(key);
    return humanizeModuleKey(action);
  }, [t, i18n]);

  const getPermissionLabel = useCallback((perm) => {
    const normalized = normalizePermission(perm);
    const [module, action] = normalized.key.split('.');
    const moduleLabel = getModuleLabel(module);
    const actionLabel = getActionLabel(action);
    return isAr ? `${actionLabel} — ${moduleLabel}` : `${actionLabel} ${moduleLabel}`;
  }, [isAr, getModuleLabel, getActionLabel]);

  const getGroupLabel = useCallback((groupKey) => getModuleLabel(groupKey), [getModuleLabel]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setShowPassword(false);
    setShowPasswordConfirm(false);
    if (admin) {
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
        password: '',
        password_confirmation: '',
      });
      setImagePreview(admin.image);
      setImageFile(null);
    }
  }, [admin]);

  const openModal = useCallback(() => {
    if (admin) {
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
        password: '',
        password_confirmation: '',
      });
      setImagePreview(admin.image);
      setImageFile(null);
    }
    setIsModalOpen(true);
  }, [admin]);

  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
        password: '',
        password_confirmation: '',
      });
      setImagePreview(admin.image);
    }
  }, [admin]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isModalOpen) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isModalOpen, closeModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const data = new FormData();
    data.append('_method', 'PUT');
    data.append('name', formData.name);
    data.append('email', formData.email);
    if (formData.password) {
      data.append('password', formData.password);
      data.append('password_confirmation', formData.password_confirmation);
    }
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const result = await dispatch(updateProfile(data)).unwrap();
      toast.success(t(getActionMessageKey('update')));
      closeModal();
      dispatch(fetchProfile({ force: true }));
    } catch (err) {
      toast.error(err || t('error_generic'));
    } finally {
      setUpdating(false);
    }
  };

  const permissionGroups = useMemo(() => {
    const raw = admin?.role?.permissions || admin?.permissions || [];
    return groupPermissions(raw);
  }, [admin]);

  const permissionCount = useMemo(
    () => Object.values(permissionGroups).reduce((sum, group) => sum + group.length, 0),
    [permissionGroups]
  );

  useAppReady(!loading);

  if (loading) {
    return null;
  }

  if (!admin) return null;

  const avatarSrc = resolvedAvatar || null;
  const previewSrc = imagePreview?.startsWith('data:')
    ? imagePreview
    : resolvedPreview || imagePreview || avatarSrc;

  const roleName = getRoleName(admin.role);
  const memberDate = formatMemberDate(admin.created_at, locale) || emptyValue;
  const statusLabel = admin.status ? t('active') : t('inactive');

  return (
    <div className={styles.page} dir={isAr ? 'rtl' : 'ltr'}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <h1 className={styles.pageTitle}>{t('profile.title')}</h1>
          <p className={styles.pageSubtitle}>{t('profile.subtitle')}</p>
        </div>
        {can('profile.update') && (
          <button type="button" className={styles.headerEditBtn} onClick={openModal}>
            <MdEdit size={18} />
            <span>{t('profile.edit')}</span>
          </button>
        )}
      </header>

      <section className={styles.profileCard} aria-label={t('profile.account_overview')}>
        <div className={styles.profileTop}>
          <div className={styles.avatarWrapper}>
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={admin.name}
                className={styles.avatar}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className={styles.avatarPlaceholder} aria-hidden="true">
                <MdPerson size={48} />
              </div>
            )}
            <span
              className={`${styles.statusDot} ${admin.status ? styles.statusDotActive : styles.statusDotInactive}`}
              title={statusLabel}
            />
          </div>

          <div className={styles.profileIdentity}>
            <h2 className={styles.name}>{admin.name}</h2>
            <p className={styles.email}>
              <MdEmail size={16} className={styles.emailIcon} />
              {admin.email}
            </p>
          </div>
        </div>

        <div className={styles.profileMeta}>
          <MetaItem icon={MdShield} label={t('profile.role')} value={roleName} highlight />
          <MetaItem
            icon={MdPerson}
            label={t('profile.account_status')}
            value={statusLabel}
            status={admin.status}
          />
          <MetaItem icon={MdCalendarToday} label={t('profile.member_since')} value={memberDate} />
        </div>
      </section>

      {permissionCount > 0 && (
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <MdLock size={20} />
            </div>
            <div className={styles.cardHeaderText}>
              <h3 className={styles.cardTitle}>{t('profile.permissions')}</h3>
              <p className={styles.cardDesc}>
                {t('profile.permissions_desc', { count: permissionCount })}
              </p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.permGroupGrid}>
              {Object.entries(permissionGroups).map(([groupKey, groupPerms]) => (
                <div key={groupKey} className={styles.permGroup}>
                  <div className={styles.permGroupHeader}>
                    <MdShield size={16} />
                    <span>{getGroupLabel(groupKey)}</span>
                    <span className={styles.permGroupCount}>{groupPerms.length}</span>
                  </div>
                  <div className={styles.permissionsGrid}>
                    {groupPerms.map((perm) => (
                      <span key={perm.key} className={styles.permTag} title={perm.key}>
                        {getPermissionLabel(perm)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal} role="presentation">
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-edit-title"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 id="profile-edit-title" className={styles.modalTitle}>
                  {t('profile.edit_title')}
                </h3>
                <p className={styles.modalSubtitle}>{t('profile.edit_desc')}</p>
              </div>
              <button type="button" className={styles.closeButton} onClick={closeModal} aria-label={t('cancel')}>
                <MdClose size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formSection}>
                  <p className={styles.formSectionTitle}>
                    <MdPerson size={16} />
                    {t('profile.personal_info')}
                  </p>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('profile.image')}</label>
                    <div
                      className={`${styles.uploadZone} ${imagePreview ? styles.uploadZoneHasImage : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                      aria-label={t('profile.click_to_upload')}
                    >
                      {imagePreview ? (
                        <img src={previewSrc} alt="" className={styles.previewImage} loading="lazy" decoding="async" />
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <MdCloudUpload size={36} />
                        </div>
                      )}
                      <span className={styles.uploadOverlay}>{t('profile.change_photo')}</span>
                      <span className={styles.fileHint}>{t('profile.click_to_upload')}</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        hidden
                        accept="image/*"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="profile-name">{t('profile.name')}</label>
                      <input
                        id="profile-name"
                        type="text"
                        name="name"
                        className={styles.formInput}
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        dir={isAr ? 'rtl' : 'ltr'}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="profile-email">{t('profile.email')}</label>
                      <input
                        id="profile-email"
                        type="email"
                        name="email"
                        className={styles.formInput}
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <p className={styles.formSectionTitle}>
                    <MdLock size={16} />
                    {t('profile.security')}
                    <span className={styles.optionalTag}>{t('profile.optional')}</span>
                  </p>
                  <p className={styles.passwordHint}>{t('profile.password_hint')}</p>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="profile-password">{t('profile.password')}</label>
                      <div className={styles.passwordField}>
                        <input
                          id="profile-password"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          className={styles.formInput}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder={t('profile.password_placeholder')}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? t('profile.hide_password') : t('profile.show_password')}
                        >
                          {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="profile-password-confirm">
                        {t('profile.password_confirmation')}
                      </label>
                      <div className={styles.passwordField}>
                        <input
                          id="profile-password-confirm"
                          type={showPasswordConfirm ? 'text' : 'password'}
                          name="password_confirmation"
                          className={styles.formInput}
                          value={formData.password_confirmation}
                          onChange={handleInputChange}
                          placeholder={t('profile.password_placeholder')}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPasswordConfirm((v) => !v)}
                          aria-label={showPasswordConfirm ? t('profile.hide_password') : t('profile.show_password')}
                        >
                          {showPasswordConfirm ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal} disabled={updating}>
                  <MdClose size={16} />
                  {t('cancel')}
                </button>
                <button type="submit" className={styles.saveBtn} disabled={updating}>
                  <MdSave size={16} />
                  {updating ? t('saving') : t('save_changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
