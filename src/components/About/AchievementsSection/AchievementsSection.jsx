import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    MdEdit,
    MdSave,
    MdClose,
    MdAdd,
    MdDelete,
    MdImage,
    MdEmojiEvents,
    MdStar,
} from 'react-icons/md';
import styles from './AchievementsSection.module.css';
import { usePermission, useResolvedMediaUrl } from '../../../hooks';
import { isMediaPath } from '../../../utils/mediaUrl';
import MediaImage from '../../Media/MediaImage';
import DynamicIcon from '../../Icon/DynamicIcon';
import IconPicker from '../../Icon/IconPicker/IconPicker';
import { ModalPortal } from '../../Modal';

const SectionCard = ({ icon: Icon, title, description, children, actions }) => (
    <section className={styles.card}>
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
            {actions && <div className={styles.cardHeaderActions}>{actions}</div>}
        </div>
        <div className={styles.cardBody}>{children}</div>
    </section>
);

const AchievementsSection = ({
    data,
    achievements,
    onUpdate,
    onAchievementAction,
    onToggleAllStatus,
    mediaVersion,
}) => {
    const { t, i18n } = useTranslation();
    const { can } = usePermission();
    const isRtl = i18n.dir() === 'rtl';

    const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
    const [isTogglingAll, setIsTogglingAll] = useState(null);
    const [achievementFormData, setAchievementFormData] = useState({
        value: '',
        'title[en]': '',
        'title[ar]': '',
        icon: 'rocketLaunch',
        display_order: '0',
        status: '1',
    });
    const [editingId, setEditingId] = useState(null);
    const [iconSearch, setIconSearch] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const resolvedEditImage = useResolvedMediaUrl(
        imagePreview && !imagePreview.startsWith('blob:') ? imagePreview : null,
        mediaVersion
    );
    const modalImageSrc = imagePreview?.startsWith('blob:')
        ? imagePreview
        : resolvedEditImage || imagePreview;

    const sectionTitle = isRtl ? data.achievement_title?.ar : data.achievement_title?.en;
    const sectionDescription = isRtl
        ? data.achievement_subtitle?.ar
        : data.achievement_subtitle?.en;

    const inactiveCount = achievements.filter((item) => !item.status).length;
    const activeCount = achievements.length - inactiveCount;
    const showActivateAll = inactiveCount > 0;
    const showDeactivateAll = activeCount > 0;

    const getIcon = (iconName) => (
        <DynamicIcon name={iconName} size={22} fallback={MdStar} />
    );

    const renderIconOrImage = (icon) => {
        if (!icon) return getIcon(null);
        if (isMediaPath(icon)) {
            return (
                <MediaImage
                    value={icon}
                    cacheBust={mediaVersion}
                    alt=""
                    className={styles.achievementMedia}
                />
            );
        }
        return getIcon(icon);
    };

    const closeAchievementModal = () => {
        setIsAchievementModalOpen(false);
        setImageFile(null);
        setImagePreview(null);
        setIconSearch('');
        setEditingId(null);
    };

    const handleAddAchievement = () => {
        setAchievementFormData({
            value: '',
            'title[en]': '',
            'title[ar]': '',
            icon: 'rocketLaunch',
            display_order: '0',
            status: '1',
        });
        setEditingId(null);
        setImageFile(null);
        setImagePreview(null);
        setIconSearch('');
        setIsAchievementModalOpen(true);
    };

    const handleEditAchievement = (item) => {
        setAchievementFormData({
            value: item.value || '',
            'title[en]': item.title?.en || '',
            'title[ar]': item.title?.ar || '',
            icon: item.icon || 'rocketLaunch',
            display_order: item.display_order || '0',
            status: item.status ? '1' : '0',
        });
        setEditingId(item.id);
        setImageFile(null);
        setImagePreview(item.icon && isMediaPath(item.icon) ? item.icon : null);
        setIconSearch('');
        setIsAchievementModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setAchievementFormData({ ...achievementFormData, icon: '' });
        }
        e.target.value = '';
    };

    const handleAchievementSubmit = (e) => {
        e.preventDefault();
        const submitData = new FormData();
        submitData.append('value', achievementFormData.value);
        submitData.append('title[en]', achievementFormData['title[en]']);
        submitData.append('title[ar]', achievementFormData['title[ar]']);
        submitData.append('display_order', achievementFormData.display_order);
        submitData.append('status', achievementFormData.status);

        if (imageFile) {
            submitData.append('icon', imageFile);
        } else {
            submitData.append('icon', achievementFormData.icon);
        }

        onAchievementAction(editingId ? 'edit' : 'add', editingId, submitData);
        closeAchievementModal();
    };

    const handleBulkStatus = async (targetStatus) => {
        if (
            !can('about_achievements.update') ||
            achievements.length === 0 ||
            isTogglingAll ||
            !onToggleAllStatus
        ) {
            return;
        }

        setIsTogglingAll(targetStatus);
        try {
            await onToggleAllStatus(achievements, targetStatus);
        } finally {
            setIsTogglingAll(null);
        }
    };

    const renderBulkStatusButton = (mode, label, meta, targetStatus) => {
        const isLoading = isTogglingAll === targetStatus;
        const isActivate = mode === 'activate';

        return (
            <button
                key={mode}
                type="button"
                className={`${styles.toggleAllBtn} ${
                    isActivate ? styles.toggleAllBtnActivate : styles.toggleAllBtnDeactivate
                } ${isLoading ? styles.toggleAllBtnLoading : ''}`}
                onClick={() => handleBulkStatus(targetStatus)}
                disabled={Boolean(isTogglingAll)}
                aria-pressed={isActivate}
                title={label}
            >
                <span className={styles.toggleAllContent}>
                    <span className={styles.toggleAllLabel}>
                        {isLoading ? t('saving') : label}
                    </span>
                    {!isLoading && <span className={styles.toggleAllMeta}>{meta}</span>}
                </span>
                <span className={styles.toggleAllSwitch} aria-hidden="true">
                    <span className={styles.toggleAllTrack}>
                        <span className={styles.toggleAllThumb} />
                    </span>
                </span>
            </button>
        );
    };

    const headerActions = (
        <>
            {can('about_achievements.update') && achievements.length > 0 && (
                <div className={styles.toggleAllGroup}>
                    {showActivateAll &&
                        renderBulkStatusButton(
                            'activate',
                            t('activate_all'),
                            `${inactiveCount} ${t('inactive')}`,
                            '1'
                        )}
                    {showDeactivateAll &&
                        renderBulkStatusButton(
                            'deactivate',
                            t('deactivate_all'),
                            `${activeCount} ${t('active')}`,
                            '0'
                        )}
                </div>
            )}
            {can('about_achievements.create') && (
                <button
                    type="button"
                    className={styles.addBtn}
                    onClick={handleAddAchievement}
                >
                    <MdAdd size={18} />
                    {t('add_achievement')}
                </button>
            )}
        </>
    );

    return (
        <div className={styles.container}>
            <SectionCard
                icon={MdEmojiEvents}
                title={sectionTitle}
                description={sectionDescription}
                actions={
                    can('about_achievements.create') || can('about_achievements.update')
                        ? headerActions
                        : null
                }
            >
                {achievements.length === 0 ? (
                    <div className={styles.emptyState}>
                        <MdEmojiEvents size={32} />
                        <p>{t('no_data_found')}</p>
                    </div>
                ) : (
                    <div className={styles.achievementsGrid}>
                        {achievements.map((item) => (
                            <article
                                key={item.id}
                                className={`${styles.achievementCard} ${
                                    !item.status ? styles.achievementCardInactive : ''
                                }`}
                            >
                                <div className={styles.achievementActions}>
                                    {can('about_achievements.update') && (
                                        <button
                                            type="button"
                                            className={styles.actionBtn}
                                            onClick={() => handleEditAchievement(item)}
                                            title={t('edit')}
                                            aria-label={t('edit')}
                                        >
                                            <MdEdit size={15} />
                                        </button>
                                    )}
                                    {can('about_achievements.delete') && (
                                        <button
                                            type="button"
                                            className={`${styles.actionBtn} ${styles.actionDelete}`}
                                            onClick={() => onAchievementAction('delete', item.id)}
                                            title={t('delete')}
                                            aria-label={t('delete')}
                                        >
                                            <MdDelete size={15} />
                                        </button>
                                    )}
                                </div>

                                <span
                                    className={`${styles.statusBadge} ${
                                        item.status
                                            ? styles.statusActive
                                            : styles.statusInactive
                                    }`}
                                >
                                    {item.status ? t('active') : t('inactive')}
                                </span>

                                <div className={styles.achievementContent}>
                                    <div className={styles.achievementLeft}>
                                        <div className={styles.achievementIconWrap}>
                                            {renderIconOrImage(item.icon)}
                                        </div>
                                        <h4 className={styles.achievementTitle}>
                                            {isRtl ? item.title?.ar : item.title?.en}
                                        </h4>
                                    </div>
                                    <div className={styles.achievementValue} dir="ltr">
                                        {item.value}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </SectionCard>

            {isAchievementModalOpen && (
                <ModalPortal>
                <div className={styles.modalOverlay} onClick={closeAchievementModal}>
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {editingId ? t('edit_achievement') : t('add_achievement')}
                            </h3>
                            <button
                                type="button"
                                className={styles.modalClose}
                                onClick={closeAchievementModal}
                            >
                                <MdClose size={20} />
                            </button>
                        </div>

                        <form className={styles.modalForm} onSubmit={handleAchievementSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.langField}>
                                    <label className={styles.label} htmlFor="achievement-value">
                                        {t('value')} ({t('value_example')})
                                    </label>
                                    <input
                                        id="achievement-value"
                                        type="text"
                                        className={styles.input}
                                        value={achievementFormData.value}
                                        onChange={(e) =>
                                            setAchievementFormData({
                                                ...achievementFormData,
                                                value: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className={styles.bilingualInputs}>
                                    <div className={styles.langField}>
                                        <label className={styles.label} htmlFor="achievement-title-en">
                                            {t('about_page.title_en')}
                                        </label>
                                        <input
                                            id="achievement-title-en"
                                            type="text"
                                            className={styles.input}
                                            value={achievementFormData['title[en]']}
                                            onChange={(e) =>
                                                setAchievementFormData({
                                                    ...achievementFormData,
                                                    'title[en]': e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className={styles.langField}>
                                        <label className={styles.label} htmlFor="achievement-title-ar">
                                            {t('about_page.title_ar')}
                                        </label>
                                        <input
                                            id="achievement-title-ar"
                                            type="text"
                                            className={styles.input}
                                            value={achievementFormData['title[ar]']}
                                            onChange={(e) =>
                                                setAchievementFormData({
                                                    ...achievementFormData,
                                                    'title[ar]': e.target.value,
                                                })
                                            }
                                            dir="rtl"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.fieldBlock}>
                                    <label className={styles.label}>
                                        {t('icon')} / {t('image')}
                                    </label>
                                    <IconPicker
                                        value={achievementFormData.icon}
                                        onChange={(icon) => {
                                            setAchievementFormData({ ...achievementFormData, icon });
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }}
                                        search={iconSearch}
                                        onSearchChange={setIconSearch}
                                        searchPlaceholder={t('search_icons')}
                                        selectedLabel={t('selected')}
                                    />
                                    <label className={styles.uploadLabel}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            hidden
                                        />
                                        <MdImage size={20} />
                                        <span>{t('upload_custom_icon')}</span>
                                    </label>
                                    {modalImageSrc && (
                                        <div className={styles.previewThumb}>
                                            <img src={modalImageSrc} alt="" loading="lazy" decoding="async" />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.langField}>
                                    <label className={styles.label} htmlFor="achievement-display-order">
                                        {t('display_order')}
                                    </label>
                                    <input
                                        id="achievement-display-order"
                                        type="number"
                                        className={styles.input}
                                        value={achievementFormData.display_order}
                                        onChange={(e) =>
                                            setAchievementFormData({
                                                ...achievementFormData,
                                                display_order: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className={styles.langField}>
                                    <label className={styles.label}>{t('status')}</label>
                                    <div className={styles.toggleContainer}>
                                        <button
                                            type="button"
                                            className={`${styles.toggleBtn} ${
                                                achievementFormData.status === '1' ? styles.active : ''
                                            }`}
                                            onClick={() =>
                                                setAchievementFormData({
                                                    ...achievementFormData,
                                                    status: '1',
                                                })
                                            }
                                        >
                                            {t('active')}
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.toggleBtn} ${
                                                achievementFormData.status === '0' ? styles.inactive : ''
                                            }`}
                                            onClick={() =>
                                                setAchievementFormData({
                                                    ...achievementFormData,
                                                    status: '0',
                                                })
                                            }
                                        >
                                            {t('inactive')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={closeAchievementModal}
                                >
                                    {t('cancel')}
                                </button>
                                <button type="submit" className={styles.saveBtn}>
                                    <MdSave size={16} />
                                    {editingId ? t('save') : t('add_new')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default AchievementsSection;
