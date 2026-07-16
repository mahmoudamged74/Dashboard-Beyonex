import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  MdEdit,
  MdClose,
  MdSave,
  MdAdd,
  MdDelete,
  MdTimeline,
  MdFlag,
  MdVisibility,
  MdImage,
  MdStar,
} from "react-icons/md";
import styles from "./JourneySection.module.css";
import { usePermission, useResolvedMediaUrl } from "../../../hooks";
import { isMediaPath } from "../../../utils/mediaUrl";
import MediaImage from "../../Media/MediaImage";
import DynamicIcon from "../../Icon/DynamicIcon";
import IconPicker from "../../Icon/IconPicker/IconPicker";
import { ModalPortal } from "../../Modal";

const mapDataToForm = (data) => ({
  journey_title: {
    en: data?.journey_title?.en || "",
    ar: data?.journey_title?.ar || "",
  },
  journey_description: {
    en: data?.journey_description?.en || "",
    ar: data?.journey_description?.ar || "",
  },
  mission_title: {
    en: data?.mission_title?.en || "",
    ar: data?.mission_title?.ar || "",
  },
  mission_content: {
    en: data?.mission_content?.en || "",
    ar: data?.mission_content?.ar || "",
  },
  mission_icon: data?.mission_icon || "rocketLaunch",
  vision_title: {
    en: data?.vision_title?.en || "",
    ar: data?.vision_title?.ar || "",
  },
  vision_content: {
    en: data?.vision_content?.en || "",
    ar: data?.vision_content?.ar || "",
  },
  vision_icon: data?.vision_icon || "visibility",
});

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

const JourneySection = ({
  data,
  milestones,
  onUpdate,
  onMilestoneAction,
  mediaVersion,
}) => {
  const { t, i18n } = useTranslation();
  const { can } = usePermission();
  const isRtl = i18n.dir() === "rtl";
  const canEdit = can("about_page.update");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(mapDataToForm(data));
  const [missionIconSearch, setMissionIconSearch] = useState("");
  const [visionIconSearch, setVisionIconSearch] = useState("");

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneFormData, setMilestoneFormData] = useState({
    year: new Date().getFullYear().toString(),
    "title[en]": "",
    "title[ar]": "",
    "description[en]": "",
    "description[ar]": "",
    display_order: "0",
    icon: "starFill",
  });
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [iconSearch, setIconSearch] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [milestoneSaving, setMilestoneSaving] = useState(false);

  const resolvedEditImage = useResolvedMediaUrl(
    imagePreview && !imagePreview.startsWith("blob:") ? imagePreview : null,
    mediaVersion
  );
  const modalImageSrc = imagePreview?.startsWith("blob:")
    ? imagePreview
    : resolvedEditImage || imagePreview;

  const fieldsDisabled = !isEditing;

  const resetFromServer = useCallback(() => {
    setFormData(mapDataToForm(data));
    setMissionIconSearch("");
    setVisionIconSearch("");
  }, [data]);

  useEffect(() => {
    resetFromServer();
  }, [resetFromServer]);

  const getIcon = (iconName) => (
    <DynamicIcon name={iconName} size={22} fallback={MdStar} />
  );

  const renderIconOrImage = (item) => {
    if (item.icon && isMediaPath(item.icon)) {
      return (
        <MediaImage
          value={item.icon}
          cacheBust={mediaVersion}
          alt={isRtl ? item.title?.ar : item.title?.en}
          className={styles.milestoneMedia}
        />
      );
    }
    return getIcon(item.icon);
  };

  const handleChange = (field, lang, value) => {
    if (!isEditing) return;
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
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
    const fields = [
      "journey_title",
      "journey_description",
      "mission_title",
      "mission_content",
      "mission_icon",
      "vision_title",
      "vision_content",
      "vision_icon",
    ];

    fields.forEach((field) => {
      const value = formData[field];
      if (value && typeof value === "object") {
        submitData.append(`${field}[en]`, value.en || "");
        submitData.append(`${field}[ar]`, value.ar || "");
      } else {
        submitData.append(field, value || "");
      }
    });

    const result = await onUpdate(submitData);
    if (result?.ok) setIsEditing(false);
    setSaving(false);
  };

  const openAddMilestone = () => {
    setMilestoneFormData({
      year: new Date().getFullYear().toString(),
      "title[en]": "",
      "title[ar]": "",
      "description[en]": "",
      "description[ar]": "",
      display_order: milestones.length.toString(),
      icon: "starFill",
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingMilestoneId(null);
    setIconSearch("");
    setIsMilestoneModalOpen(true);
  };

  const handleMilestoneEdit = (milestone) => {
    setMilestoneFormData({
      year: milestone.year?.toString() || "",
      "title[en]": milestone.title?.en || "",
      "title[ar]": milestone.title?.ar || "",
      "description[en]": milestone.description?.en || "",
      "description[ar]": milestone.description?.ar || "",
      display_order: milestone.display_order?.toString() || "0",
      icon: milestone.icon || "starFill",
    });
    setImagePreview(
      milestone.icon && isMediaPath(milestone.icon) ? milestone.icon : null
    );
    setImageFile(null);
    setEditingMilestoneId(milestone.id);
    setIconSearch("");
    setIsMilestoneModalOpen(true);
  };

  const closeMilestoneModal = () => {
    setIsMilestoneModalOpen(false);
    setImageFile(null);
    setImagePreview(null);
    setIconSearch("");
    setEditingMilestoneId(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const handleMilestoneSubmit = async (e) => {
    e.preventDefault();
    setMilestoneSaving(true);

    const submitData = new FormData();
    submitData.append("year", milestoneFormData.year);
    submitData.append("title[en]", milestoneFormData["title[en]"]);
    submitData.append("title[ar]", milestoneFormData["title[ar]"]);
    submitData.append("description[en]", milestoneFormData["description[en]"]);
    submitData.append("description[ar]", milestoneFormData["description[ar]"]);
    submitData.append("display_order", milestoneFormData.display_order);

    if (imageFile) {
      submitData.append("icon", imageFile);
    } else {
      submitData.append("icon", milestoneFormData.icon);
    }

    const action = editingMilestoneId ? "edit" : "add";
    await onMilestoneAction(action, editingMilestoneId, submitData);
    setMilestoneSaving(false);
    closeMilestoneModal();
  };

  const renderLangInput = (field, lang, dir, rows = 1) => {
    const value = isEditing
      ? formData[field]?.[lang] || ""
      : data[field]?.[lang] || "";
    const id = `${field}-${lang}`;

    let label = t(`about_page.title_${lang}`);
    if (field === "journey_description") {
      label = t(`about_page.description_${lang}`);
    } else if (field === "mission_content" || field === "vision_content") {
      label = t(`about_page.content_${lang}`);
    }

    const commonProps = {
      id,
      className: rows > 1 ? styles.textarea : styles.input,
      value,
      onChange: (e) => handleChange(field, lang, e.target.value),
      dir,
      disabled: fieldsDisabled,
      readOnly: fieldsDisabled,
    };

    return (
      <div className={styles.langField}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {rows > 1 ? (
          <textarea {...commonProps} rows={rows} />
        ) : (
          <input type="text" {...commonProps} />
        )}
      </div>
    );
  };

  const renderBilingualRow = (field, rows = 1, { sideBySide = false } = {}) => (
    <div
      className={
        sideBySide ? styles.bilingualRow : styles.bilingualInputs
      }
    >
      {renderLangInput(field, "en", "ltr", rows)}
      {renderLangInput(field, "ar", "rtl", rows)}
    </div>
  );

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

  const missionIconName = data?.mission_icon || "rocketLaunch";
  const visionIconName = data?.vision_icon || "visibility";

  return (
    <div className={styles.container}>
      <SectionCard
        icon={MdTimeline}
        title={t("about_page.journey_content")}
        description={t("about_page.journey_content_desc")}
        actions={contentActions}
      >
        <div className={styles.fieldsStack}>
          {renderBilingualRow("journey_title", 1, { sideBySide: true })}
          {renderBilingualRow("journey_description", 3, { sideBySide: true })}
        </div>
      </SectionCard>

      <div className={styles.mvGrid}>
        <section className={styles.mvCard}>
          {isEditing ? (
            <div className={styles.fieldsStack}>
              {renderBilingualRow("mission_title")}
              {renderBilingualRow("mission_content", 3)}
              <div className={styles.fieldBlock}>
                <label className={styles.label}>{t("icon")}</label>
                <IconPicker
                  value={formData.mission_icon}
                  onChange={(icon) =>
                    setFormData((prev) => ({ ...prev, mission_icon: icon }))
                  }
                  search={missionIconSearch}
                  onSearchChange={setMissionIconSearch}
                  searchPlaceholder={t("search_icons")}
                  selectedLabel={t("selected")}
                />
              </div>
            </div>
          ) : (
            <div className={styles.previewBlock}>
              <div className={styles.previewHeading}>
                <div className={styles.previewIcon}>
                  <DynamicIcon name={missionIconName} size={22} fallback={MdFlag} />
                </div>
                <h4 className={styles.previewTitle}>
                  {isRtl ? data.mission_title?.ar : data.mission_title?.en}
                </h4>
              </div>
              <p className={styles.previewText}>
                {isRtl ? data.mission_content?.ar : data.mission_content?.en}
              </p>
            </div>
          )}
        </section>

        <section className={styles.mvCard}>
          {isEditing ? (
            <div className={styles.fieldsStack}>
              {renderBilingualRow("vision_title")}
              {renderBilingualRow("vision_content", 3)}
              <div className={styles.fieldBlock}>
                <label className={styles.label}>{t("icon")}</label>
                <IconPicker
                  value={formData.vision_icon}
                  onChange={(icon) =>
                    setFormData((prev) => ({ ...prev, vision_icon: icon }))
                  }
                  search={visionIconSearch}
                  onSearchChange={setVisionIconSearch}
                  searchPlaceholder={t("search_icons")}
                  selectedLabel={t("selected")}
                />
              </div>
            </div>
          ) : (
            <div className={styles.previewBlock}>
              <div className={styles.previewHeading}>
                <div className={styles.previewIcon}>
                  <DynamicIcon name={visionIconName} size={22} fallback={MdVisibility} />
                </div>
                <h4 className={styles.previewTitle}>
                  {isRtl ? data.vision_title?.ar : data.vision_title?.en}
                </h4>
              </div>
              <p className={styles.previewText}>
                {isRtl ? data.vision_content?.ar : data.vision_content?.en}
              </p>
            </div>
          )}
        </section>
      </div>

      <SectionCard
        icon={MdTimeline}
        title={t("timeline")}
        description={t("about_page.timeline_desc", { count: milestones.length })}
        actions={
          can("about_milestones.create") ? (
            <button
              type="button"
              className={styles.addBtn}
              onClick={openAddMilestone}
            >
              <MdAdd size={18} />
              {t("add_new")}
            </button>
          ) : null
        }
      >
        {milestones.length === 0 ? (
          <div className={styles.emptyState}>
            <MdTimeline size={32} />
            <p>{t("no_data_found")}</p>
          </div>
        ) : (
          <div className={styles.milestonesGrid}>
            {milestones.map((item, index) => (
              <article key={item.id} className={styles.milestoneCard}>
                <div className={styles.milestoneTop}>
                  <div className={styles.milestoneIconWrap}>
                    {renderIconOrImage(item)}
                  </div>
                  <div className={styles.milestoneActions}>
                    {can("about_milestones.update") && (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => handleMilestoneEdit(item)}
                        title={t("edit")}
                        aria-label={t("edit")}
                      >
                        <MdEdit size={15} />
                      </button>
                    )}
                    {can("about_milestones.delete") && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionDelete}`}
                        onClick={() => onMilestoneAction("delete", item.id)}
                        title={t("delete")}
                        aria-label={t("delete")}
                      >
                        <MdDelete size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.milestoneMeta}>
                  <span className={styles.milestoneOrder}>{index + 1}</span>
                  <span className={styles.milestoneYear}>{item.year}</span>
                </div>
                <h4 className={styles.milestoneTitle}>
                  {isRtl ? item.title?.ar : item.title?.en}
                </h4>
                <p className={styles.milestoneDesc}>
                  {isRtl ? item.description?.ar : item.description?.en}
                </p>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      {isMilestoneModalOpen && (
        <ModalPortal>
        <div className={styles.modalOverlay} onClick={closeMilestoneModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingMilestoneId ? t("edit_milestone") : t("add_new")}
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeMilestoneModal}
              >
                <MdClose size={20} />
              </button>
            </div>

            <form className={styles.modalForm} onSubmit={handleMilestoneSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.bilingualInputs}>
                  <div className={styles.langField}>
                    <label className={styles.label}>{t("year")}</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={milestoneFormData.year}
                      onChange={(e) =>
                        setMilestoneFormData({
                          ...milestoneFormData,
                          year: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className={styles.langField}>
                    <label className={styles.label}>{t("display_order")}</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={milestoneFormData.display_order}
                      onChange={(e) =>
                        setMilestoneFormData({
                          ...milestoneFormData,
                          display_order: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className={styles.bilingualInputs}>
                  <div className={styles.langField}>
                    <label className={styles.label}>
                      {t("about_page.title_en")}
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      value={milestoneFormData["title[en]"]}
                      onChange={(e) =>
                        setMilestoneFormData({
                          ...milestoneFormData,
                          "title[en]": e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className={styles.langField}>
                    <label className={styles.label}>
                      {t("about_page.title_ar")}
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      value={milestoneFormData["title[ar]"]}
                      onChange={(e) =>
                        setMilestoneFormData({
                          ...milestoneFormData,
                          "title[ar]": e.target.value,
                        })
                      }
                      dir="rtl"
                      required
                    />
                  </div>
                </div>

                <div className={styles.bilingualInputs}>
                  <div className={styles.langField}>
                    <label className={styles.label}>
                      {t("about_page.description_en")}
                    </label>
                    <textarea
                      className={styles.textarea}
                      value={milestoneFormData["description[en]"]}
                      onChange={(e) =>
                        setMilestoneFormData({
                          ...milestoneFormData,
                          "description[en]": e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className={styles.langField}>
                    <label className={styles.label}>
                      {t("about_page.description_ar")}
                    </label>
                    <textarea
                      className={styles.textarea}
                      value={milestoneFormData["description[ar]"]}
                      onChange={(e) =>
                        setMilestoneFormData({
                          ...milestoneFormData,
                          "description[ar]": e.target.value,
                        })
                      }
                      dir="rtl"
                      rows={3}
                    />
                  </div>
                </div>

                <div className={styles.fieldBlock}>
                  <label className={styles.label}>
                    {t("icon")} / {t("image")}
                  </label>
                  <IconPicker
                    value={milestoneFormData.icon}
                    onChange={(icon) => {
                      setMilestoneFormData({ ...milestoneFormData, icon });
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    search={iconSearch}
                    onSearchChange={setIconSearch}
                    searchPlaceholder={t("search_icons")}
                    selectedLabel={t("selected")}
                  />
                  <label className={styles.uploadLabel}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      hidden
                    />
                    <MdImage size={20} />
                    <span>{t("upload_custom_icon")}</span>
                  </label>
                  {modalImageSrc && (
                    <div className={styles.previewThumb}>
                      <img src={modalImageSrc} alt="" loading="lazy" decoding="async" />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeMilestoneModal}
                  disabled={milestoneSaving}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={milestoneSaving}
                >
                  <MdSave size={16} />
                  {milestoneSaving
                    ? t("saving")
                    : editingMilestoneId
                      ? t("save")
                      : t("add_new")}
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

export default JourneySection;
