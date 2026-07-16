import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MdEdit,
  MdSave,
  MdClose,
  MdAdd,
  MdDelete,
  MdImage,
  MdDiamond,
} from "react-icons/md";
import styles from "./CoreValuesSection.module.css";
import { usePermission, useResolvedMediaUrl } from "../../../hooks";
import { isMediaPath } from "../../../utils/mediaUrl";
import MediaImage from "../../Media/MediaImage";
import DynamicIcon from "../../Icon/DynamicIcon";
import IconPicker from "../../Icon/IconPicker/IconPicker";
import { ModalPortal } from "../../Modal";

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

const CoreValuesSection = ({ coreValues, onAction, mediaVersion }) => {
  const { t, i18n } = useTranslation();
  const { can } = usePermission();
  const isRtl = i18n.dir() === "rtl";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    "title[en]": "",
    "title[ar]": "",
    "description[en]": "",
    "description[ar]": "",
    icon: "gem",
    display_order: "0",
    status: "1",
  });
  const [iconSearch, setIconSearch] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const resolvedEditImage = useResolvedMediaUrl(
    imagePreview && !imagePreview.startsWith("blob:") ? imagePreview : null,
    mediaVersion
  );
  const modalImageSrc = imagePreview?.startsWith("blob:")
    ? imagePreview
    : resolvedEditImage || imagePreview;

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        "title[en]": item.title?.en || "",
        "title[ar]": item.title?.ar || "",
        "description[en]": item.description?.en || "",
        "description[ar]": item.description?.ar || "",
        icon: item.icon || "gem",
        display_order: item.display_order?.toString() || "0",
        status: item.status ? "1" : "0",
      });
      setEditingId(item.id);
      setImagePreview(
        item.icon && isMediaPath(item.icon) ? item.icon : null
      );
    } else {
      setFormData({
        "title[en]": "",
        "title[ar]": "",
        "description[en]": "",
        "description[ar]": "",
        icon: "gem",
        display_order: "0",
        status: "1",
      });
      setEditingId(null);
      setImagePreview(null);
    }
    setImageFile(null);
    setIconSearch("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setImageFile(null);
    setImagePreview(null);
    setIconSearch("");
    setEditingId(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, icon: "" });
    }
    e.target.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "icon" && imageFile) return;
      submitData.append(key, formData[key]);
    });

    if (imageFile) {
      submitData.append("icon", imageFile);
    } else {
      submitData.append("icon", formData.icon);
    }

    onAction(editingId ? "edit" : "add", editingId, submitData);
    closeModal();
  };

  const renderIcon = (icon) => {
    if (!icon) return null;
    if (isMediaPath(icon)) {
      return (
        <MediaImage
          value={icon}
          cacheBust={mediaVersion}
          alt="icon"
          className={styles.valueMedia}
        />
      );
    }
    return <DynamicIcon name={icon} size={22} fallback={MdDiamond} />;
  };

  return (
    <div className={styles.container}>
      <SectionCard
        icon={MdDiamond}
        title={t("core_values")}
        description={t("about_page.tab_core_values_desc", {
          count: coreValues.length,
        })}
        actions={
          can("about_core_values.create") ? (
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => handleOpenModal()}
            >
              <MdAdd size={18} />
              {t("add_core_value")}
            </button>
          ) : null
        }
      >
        {coreValues.length === 0 ? (
          <div className={styles.emptyState}>
            <MdDiamond size={32} />
            <p>{t("no_data_found")}</p>
          </div>
        ) : (
          <div className={styles.valuesGrid}>
            {coreValues.map((item) => (
              <article key={item.id} className={styles.valueCard}>
                <div className={styles.valueTop}>
                  <div className={styles.valueHeading}>
                    <div className={styles.valueIconWrap}>
                      {renderIcon(item.icon)}
                    </div>
                    <h4 className={styles.valueTitle}>
                      {isRtl ? item.title?.ar : item.title?.en}
                    </h4>
                  </div>
                  <div className={styles.valueActions}>
                    {can("about_core_values.update") && (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => handleOpenModal(item)}
                        title={t("edit")}
                        aria-label={t("edit")}
                      >
                        <MdEdit size={15} />
                      </button>
                    )}
                    {can("about_core_values.delete") && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionDelete}`}
                        onClick={() => onAction("delete", item.id)}
                        title={t("delete")}
                        aria-label={t("delete")}
                      >
                        <MdDelete size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <p className={styles.valueDesc}>
                  {isRtl ? item.description?.ar : item.description?.en}
                </p>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      {isModalOpen && (
        <ModalPortal>
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingId ? t("edit_core_value") : t("add_core_value")}
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeModal}
              >
                <MdClose size={20} />
              </button>
            </div>

            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.bilingualRow}>
                  <div className={styles.langField}>
                    <label className={styles.label}>
                      {t("about_page.title_en")}
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formData["title[en]"]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                      value={formData["title[ar]"]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                      value={formData["description[en]"]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          "description[en]": e.target.value,
                        })
                      }
                      rows={3}
                      required
                    />
                  </div>
                  <div className={styles.langField}>
                    <label className={styles.label}>
                      {t("about_page.description_ar")}
                    </label>
                    <textarea
                      className={styles.textarea}
                      value={formData["description[ar]"]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          "description[ar]": e.target.value,
                        })
                      }
                      dir="rtl"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className={styles.fieldBlock}>
                  <label className={styles.label}>
                    {t("icon")} / {t("image")}
                  </label>
                  <IconPicker
                    value={formData.icon}
                    onChange={(icon) => {
                      setFormData({ ...formData, icon });
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

                <div className={styles.langField}>
                  <label className={styles.label}>{t("display_order")}</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeModal}
                >
                  {t("cancel")}
                </button>
                <button type="submit" className={styles.saveBtn}>
                  <MdSave size={16} />
                  {editingId ? t("save") : t("add_new")}
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

export default CoreValuesSection;
