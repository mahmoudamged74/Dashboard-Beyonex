import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  MdEdit,
  MdClose,
  MdSave,
  MdAdd,
  MdDelete,
  MdCloudUpload,
  MdImage,
  MdLanguage,
  MdViewModule,
} from "react-icons/md";
import { usePermission, useResolvedMediaUrl } from "../../../hooks";
import { resolveMediaUrl, withCacheBust } from "../../../utils/mediaUrl";
import styles from "./HeroSection.module.css";

const mapDataToForm = (data) => ({
  hero_title: {
    en: data?.hero_title?.en || "",
    ar: data?.hero_title?.ar || "",
  },
  hero_subtitle: {
    en: data?.hero_subtitle?.en || "",
    ar: data?.hero_subtitle?.ar || "",
  },
  hero_description: {
    en: data?.hero_description?.en || "",
    ar: data?.hero_description?.ar || "",
  },
  logo_path: data?.logo_path || "",
  mission_icon: data?.mission_icon || "",
  vision_icon: data?.vision_icon || "",
});

const SectionCard = ({ icon: Icon, title, description, children, actions, className = "" }) => (
  <section className={`${styles.card} ${className}`}>
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

const HeroSection = ({
  data,
  features,
  onUpdateAbout,
  onFeatureAction,
  mediaVersion,
}) => {
  const { t, i18n } = useTranslation();
  const { can } = usePermission();
  const isRtl = i18n.dir() === "rtl";
  const canEdit = can("about_page.update");
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(mapDataToForm(data));
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [localLogoPreview, setLocalLogoPreview] = useState(null);
  const [logoBroken, setLogoBroken] = useState(false);
  const prevLogoSourceRef = useRef(null);

  const [editingFeatureId, setEditingFeatureId] = useState(null);
  const [featureFormData, setFeatureFormData] = useState({
    title: { en: "", ar: "" },
    display_order: 0,
  });
  const [featureSaving, setFeatureSaving] = useState(false);

  const logoSource = data?.logo_path || data?.logo;
  const resolvedLogo = useResolvedMediaUrl(logoSource, mediaVersion);
  const syncLogoSrc = withCacheBust(resolveMediaUrl(logoSource), mediaVersion);
  const fieldsDisabled = !isEditing;

  const resetFromServer = useCallback(() => {
    setFormData(mapDataToForm(data));
    setLogoFile(null);
    setLogoPreview(null);
  }, [data]);

  useEffect(() => {
    resetFromServer();
  }, [resetFromServer]);

  useEffect(() => {
    if (prevLogoSourceRef.current !== logoSource && logoSource) {
      setLocalLogoPreview(null);
    }
    prevLogoSourceRef.current = logoSource;
  }, [logoSource]);

  useEffect(() => {
    setLogoBroken(false);
  }, [logoSource, mediaVersion, logoPreview, localLogoPreview]);

  const displayLogo =
    logoPreview || localLogoPreview || syncLogoSrc || resolvedLogo || null;

  const handleLogoError = (e) => {
    const img = e.currentTarget;
    const raw = resolveMediaUrl(logoSource);
    if (raw && img.src !== raw && !img.dataset.rawFallback) {
      img.dataset.rawFallback = "1";
      img.src = raw;
      return;
    }
    setLogoBroken(true);
  };

  const handleChange = (e, lang) => {
    if (!isEditing) return;
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: { ...prev[name], [lang]: value },
    }));
  };

  const handleImageUpload = (e) => {
    if (!isEditing) return;
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleStartEdit = () => setIsEditing(true);

  const handleCancelEdit = () => {
    resetFromServer();
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!canEdit || !isEditing) return;
    setSaving(true);

    const submitData = new FormData();
    if (logoFile) {
      submitData.append("logo", logoFile);
    }

    ["hero_title", "hero_subtitle", "hero_description"].forEach((field) => {
      submitData.append(`${field}[en]`, formData[field]?.en || "");
      submitData.append(`${field}[ar]`, formData[field]?.ar || "");
    });

    const preview = logoPreview;
    const result = await onUpdateAbout(submitData);
    if (result?.ok) {
      const savedPath = result.aboutPage?.logo_path || result.aboutPage?.logo;
      if (preview) {
        setLocalLogoPreview(preview);
      } else if (savedPath) {
        prevLogoSourceRef.current = null;
      }
      setIsEditing(false);
      setLogoFile(null);
      setLogoPreview(null);
    }
    setSaving(false);
  };

  const openAddFeature = () => {
    setEditingFeatureId("new");
    setFeatureFormData({
      title: { en: "", ar: "" },
      display_order: features.length,
    });
  };

  const handleFeatureEdit = (feature) => {
    setEditingFeatureId(feature.id);
    setFeatureFormData({ ...feature });
  };

  const cancelFeatureEdit = () => {
    setEditingFeatureId(null);
    setFeatureFormData({ title: { en: "", ar: "" }, display_order: 0 });
  };

  const handleFeatureChange = (e, lang = null) => {
    const { name, value } = e.target;
    if (lang) {
      setFeatureFormData((prev) => ({
        ...prev,
        title: { ...prev.title, [lang]: value },
      }));
    } else {
      setFeatureFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFeatureSave = async (e) => {
    e.preventDefault();
    setFeatureSaving(true);
    try {
      if (editingFeatureId === "new") {
        await onFeatureAction("add", null, featureFormData);
      } else {
        await onFeatureAction("edit", editingFeatureId, featureFormData);
      }
      cancelFeatureEdit();
    } finally {
      setFeatureSaving(false);
    }
  };

  const getLangFieldLabel = (name, lang) => {
    const key =
      name === "hero_title"
        ? `about_page.title_${lang}`
        : name === "hero_subtitle"
          ? `about_page.subtitle_${lang}`
          : `about_page.description_${lang}`;
    return t(key);
  };

  const renderLangInput = (name, lang, dir, rows = 1) => {
    const value = isEditing
      ? formData[name]?.[lang] || ""
      : data[name]?.[lang] || "";
    const id = `${name}-${lang}`;
    const commonProps = {
      id,
      className: rows > 1 ? styles.textarea : styles.input,
      name,
      value,
      onChange: (e) => handleChange(e, lang),
      dir,
      disabled: fieldsDisabled,
      readOnly: fieldsDisabled,
    };

    return (
      <div className={styles.langField}>
        <label className={styles.label} htmlFor={id}>
          {getLangFieldLabel(name, lang)}
        </label>
        {rows > 1 ? (
          <textarea {...commonProps} rows={rows} />
        ) : (
          <input type="text" {...commonProps} />
        )}
      </div>
    );
  };

  const renderBilingualRow = (name, rows = 1) => (
    <div className={styles.bilingualInputs}>
      {renderLangInput(name, "en", "ltr", rows)}
      {renderLangInput(name, "ar", "rtl", rows)}
    </div>
  );

  const showLogo = Boolean(displayLogo && !logoBroken);

  const contentActions = canEdit ? (
    isEditing ? (
      <>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={handleCancelEdit}
          disabled={saving}
        >
          <MdClose size={16} />
          {t("cancel")}
        </button>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
        >
          <MdSave size={16} />
          {saving ? t("saving") : t("save_changes")}
        </button>
      </>
    ) : (
      <button
        type="button"
        className={styles.editBtn}
        onClick={handleStartEdit}
      >
        <MdEdit size={16} />
        {t("edit")}
      </button>
    )
  ) : null;

  return (
    <div className={styles.container}>
      <SectionCard
        icon={MdLanguage}
        title={t("about_page.hero_content")}
        description={t("about_page.hero_content_desc")}
        actions={contentActions}
      >
        <div className={styles.contentLayout}>
          <div className={styles.logoBlock}>
            <div className={styles.logoBlockHeader}>
              <span className={styles.logoBlockTitle}>{t("about_page.hero_media")}</span>
              <span className={styles.logoBlockHint}>{t("about_page.hero_media_desc")}</span>
            </div>

            {isEditing ? (
              <>
                <div
                  className={styles.uploadZone}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && fileInputRef.current?.click()
                  }
                >
                  {showLogo ? (
                    <>
                      <img
                        key={`hero-logo-${mediaVersion}`}
                        src={displayLogo}
                        alt={t("main_logo")}
                        className={styles.uploadImage}
                        loading="lazy"
                        decoding="async"
                        onError={handleLogoError}
                      />
                      <div className={styles.uploadOverlay}>
                        <MdCloudUpload size={28} />
                        <span>{t("change_logo")}</span>
                      </div>
                    </>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <MdCloudUpload size={32} />
                      <span>{t("change_logo")}</span>
                    </div>
                  )}
                </div>
                <p className={styles.uploadHint}>{t("about_page.hero_logo_hint")}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </>
            ) : showLogo ? (
              <div className={styles.logoView}>
                <img
                  key={`hero-logo-${mediaVersion}`}
                  src={displayLogo}
                  alt={t("main_logo")}
                  className={styles.logoViewImage}
                  loading="lazy"
                  decoding="async"
                  onError={handleLogoError}
                />
              </div>
            ) : (
              <div className={styles.logoEmpty}>
                <MdImage size={28} />
                <span>{t("about_page.no_logo")}</span>
              </div>
            )}
          </div>

          <div className={styles.fieldsStack}>
            {renderBilingualRow("hero_title")}
            {renderBilingualRow("hero_subtitle")}
            {renderBilingualRow("hero_description", 4)}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={MdViewModule}
        title={t("hero_features")}
        description={t("hero_features_desc", { count: features.length })}
      >
        {can("about_hero_features.create") && !editingFeatureId && (
          <div className={styles.featuresActions}>
            <button
              type="button"
              className={styles.addFeatureBtn}
              onClick={openAddFeature}
            >
              <MdAdd size={18} />
              {t("add_feature")}
            </button>
          </div>
        )}

        <div className={styles.featuresGrid}>
          {editingFeatureId === "new" && (
            <article
              className={`${styles.featureCard} ${styles.featureCardEditing}`}
            >
              <form onSubmit={handleFeatureSave} className={styles.featureForm}>
                <div className={styles.field}>
                  <label className={styles.label}>{t("about_page.title_en")}</label>
                  <input
                    className={styles.input}
                    value={featureFormData.title?.en || ""}
                    onChange={(e) => handleFeatureChange(e, "en")}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t("about_page.title_ar")}</label>
                  <input
                    className={styles.input}
                    value={featureFormData.title?.ar || ""}
                    onChange={(e) => handleFeatureChange(e, "ar")}
                    dir="rtl"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t("display_order")}</label>
                  <input
                    type="number"
                    className={styles.input}
                    name="display_order"
                    value={featureFormData.display_order ?? 0}
                    onChange={handleFeatureChange}
                  />
                </div>
                <div className={styles.featureFormActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={cancelFeatureEdit}
                    disabled={featureSaving}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={featureSaving}
                  >
                    {featureSaving ? t("saving") : t("add_feature")}
                  </button>
                </div>
              </form>
            </article>
          )}

          {features.length === 0 && editingFeatureId !== "new" ? (
            <div className={styles.featuresEmpty}>
              <MdViewModule size={32} />
              <p>{t("no_features_yet")}</p>
            </div>
          ) : (
            features.map((feature, index) => (
              <article
                key={feature.id}
                className={`${styles.featureCard} ${editingFeatureId === feature.id ? styles.featureCardEditing : ""}`}
              >
                {editingFeatureId === feature.id ? (
                  <form
                    onSubmit={handleFeatureSave}
                    className={styles.featureForm}
                  >
                    <div className={styles.field}>
                      <label className={styles.label}>{t("about_page.title_en")}</label>
                      <input
                        className={styles.input}
                        value={featureFormData.title?.en || ""}
                        onChange={(e) => handleFeatureChange(e, "en")}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>{t("about_page.title_ar")}</label>
                      <input
                        className={styles.input}
                        value={featureFormData.title?.ar || ""}
                        onChange={(e) => handleFeatureChange(e, "ar")}
                        dir="rtl"
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        {t("display_order")}
                      </label>
                      <input
                        type="number"
                        className={styles.input}
                        name="display_order"
                        value={featureFormData.display_order ?? 0}
                        onChange={handleFeatureChange}
                      />
                    </div>
                    <div className={styles.featureFormActions}>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={cancelFeatureEdit}
                        disabled={featureSaving}
                      >
                        {t("cancel")}
                      </button>
                      <button
                        type="submit"
                        className={styles.saveBtn}
                        disabled={featureSaving}
                      >
                        {featureSaving ? t("saving") : t("save")}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className={styles.featureCardTop}>
                      <div className={styles.featureActions}>
                        {can("about_hero_features.update") &&
                          !editingFeatureId && (
                            <button
                              type="button"
                              className={styles.featureActionBtn}
                              onClick={() => handleFeatureEdit(feature)}
                              title={t("edit")}
                              aria-label={t("edit")}
                            >
                              <MdEdit size={15} />
                            </button>
                          )}
                        {can("about_hero_features.delete") &&
                          !editingFeatureId && (
                            <button
                              type="button"
                              className={`${styles.featureActionBtn} ${styles.featureActionDelete}`}
                              onClick={() =>
                                onFeatureAction("delete", feature.id)
                              }
                              title={t("delete")}
                              aria-label={t("delete")}
                            >
                              <MdDelete size={15} />
                            </button>
                          )}
                      </div>
                    </div>
                    <div className={styles.featureNameRow}>
                      <span className={styles.featureOrder}>
                        {(feature.display_order ?? index) + 1}
                      </span>
                      <h4 className={styles.featureTitlePrimary}>
                        {isRtl ? feature.title?.ar : feature.title?.en}
                      </h4>
                    </div>
                    <p
                      className={styles.featureTitleSecondary}
                      dir={isRtl ? "ltr" : "rtl"}
                    >
                      {isRtl ? feature.title?.en : feature.title?.ar}
                    </p>
                  </>
                )}
              </article>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
};

export default HeroSection;
