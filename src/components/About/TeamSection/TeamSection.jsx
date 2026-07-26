import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MdEdit,
  MdSave,
  MdClose,
  MdAdd,
  MdDelete,
  MdCloudUpload,
  MdEmail,
  MdPerson,
  MdGroups,
} from "react-icons/md";
import styles from "./TeamSection.module.css";
import { usePermission, useResolvedMediaUrl } from "../../../hooks";
import MediaImage from "../../Media/MediaImage";
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

const TeamSection = ({ teamMembers, onAction, onToggleAllStatus, mediaVersion }) => {
  const { t, i18n } = useTranslation();
  const { can } = usePermission();
  const isRtl = i18n.dir() === "rtl";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTogglingAll, setIsTogglingAll] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    "name[en]": "",
    "name[ar]": "",
    "title[en]": "",
    "title[ar]": "",
    email: "",
    display_order: "0",
    status: "1",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileInputRef = useRef(null);

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
        "name[en]": item.name?.en || "",
        "name[ar]": item.name?.ar || "",
        "title[en]": item.title?.en || "",
        "title[ar]": item.title?.ar || "",
        email: item.email || "",
        display_order: item.display_order?.toString() || "0",
        status: item.status ? "1" : "0",
      });
      setEditingId(item.id);
      setImagePreview(item.image_path || null);
    } else {
      setFormData({
        "name[en]": "",
        "name[ar]": "",
        "title[en]": "",
        "title[ar]": "",
        email: "",
        display_order: "0",
        status: "1",
      });
      setEditingId(null);
      setImagePreview(null);
    }
    setImageFile(null);
    setImageRemoved(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(false);
    setEditingId(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageRemoved(false);
    }
    e.target.value = "";
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();

    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });

    if (imageFile) {
      submitData.append("image", imageFile);
    } else if (imageRemoved) {
      submitData.append("remove_image", "1");
    }

    onAction(editingId ? "edit" : "add", editingId, submitData);
    closeModal();
  };

  const inactiveCount = teamMembers.filter((member) => !member.status).length;
  const activeCount = teamMembers.length - inactiveCount;
  const showActivateAll = inactiveCount > 0;
  const showDeactivateAll = activeCount > 0;

  const handleBulkStatus = async (targetStatus) => {
    if (
      !can("team_members.update") ||
      teamMembers.length === 0 ||
      isTogglingAll
    ) {
      return;
    }

    setIsTogglingAll(targetStatus);
    try {
      await onToggleAllStatus(teamMembers, targetStatus);
    } finally {
      setIsTogglingAll(null);
    }
  };

  const renderBulkStatusButton = (mode, label, meta, targetStatus) => {
    const isLoading = isTogglingAll === targetStatus;
    const isActivate = mode === "activate";

    return (
      <button
        key={mode}
        type="button"
        className={`${styles.toggleAllBtn} ${
          isActivate ? styles.toggleAllBtnActivate : styles.toggleAllBtnDeactivate
        } ${isLoading ? styles.toggleAllBtnLoading : ""}`}
        onClick={() => handleBulkStatus(targetStatus)}
        disabled={Boolean(isTogglingAll)}
        aria-pressed={isActivate}
        title={label}
      >
        <span className={styles.toggleAllContent}>
          <span className={styles.toggleAllLabel}>
            {isLoading ? t("saving") : label}
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
      {can("team_members.update") && teamMembers.length > 0 && (
        <div className={styles.toggleAllGroup}>
          {showActivateAll &&
            renderBulkStatusButton(
              "activate",
              t("activate_all"),
              `${inactiveCount} ${t("inactive")}`,
              "1"
            )}
          {showDeactivateAll &&
            renderBulkStatusButton(
              "deactivate",
              t("deactivate_all"),
              `${activeCount} ${t("active")}`,
              "0"
            )}
        </div>
      )}
      {can("team_members.create") && (
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => handleOpenModal()}
        >
          <MdAdd size={18} />
          {t("add_team_member")}
        </button>
      )}
    </>
  );

  return (
    <div className={styles.container}>
      <SectionCard
        icon={MdGroups}
        title={t("team_members")}
        description={t("about_page.tab_team_desc", {
          count: teamMembers.length,
        })}
        actions={
          can("team_members.create") || can("team_members.update")
            ? headerActions
            : null
        }
      >
        {teamMembers.length === 0 ? (
          <div className={styles.emptyState}>
            <MdGroups size={32} />
            <p>{t("no_data_found")}</p>
          </div>
        ) : (
          <div className={styles.membersGrid}>
            {teamMembers.map((item, index) => {
              const name = isRtl ? item.name?.ar : item.name?.en;
              const title = isRtl ? item.title?.ar : item.title?.en;

              return (
                <article
                  key={item.id}
                  className={`${styles.memberCard} ${
                    !item.status ? styles.memberCardInactive : ""
                  }`}
                >
                  <div className={styles.memberActions}>
                    {can("team_members.update") && (
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
                    {can("team_members.delete") && (
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

                  <div className={styles.avatarRing}>
                    {item.image_path ? (
                      <MediaImage
                        value={item.image_path}
                        cacheBust={mediaVersion}
                        alt={name}
                        className={styles.avatarImage}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <MdPerson size={32} />
                      </div>
                    )}
                    <span className={styles.memberOrder}>{index + 1}</span>
                  </div>

                  <div className={styles.memberInfo}>
                    <span
                      className={`${styles.statusBadge} ${
                        item.status
                          ? styles.statusActive
                          : styles.statusInactive
                      }`}
                    >
                      {item.status ? t("active") : t("inactive")}
                    </span>
                    <h4 className={styles.memberName}>{name}</h4>
                    {title && (
                      <span className={styles.memberRole}>{title}</span>
                    )}
                    {item.email && (
                      <a
                        href={`mailto:${item.email}`}
                        className={styles.memberEmail}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MdEmail size={14} />
                        <span>{item.email}</span>
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
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
                {editingId ? t("edit_team_member") : t("add_team_member")}
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
                <div className={styles.fieldBlock}>
                  <label className={styles.label}>{t("member_image")}</label>
                  <div className={styles.avatarUploadWrap}>
                    <div
                      className={`${styles.avatarUpload} ${
                        modalImageSrc ? styles.avatarUploadHasImage : ""
                      }`}
                    >
                      {modalImageSrc ? (
                        <>
                          <img
                            src={modalImageSrc}
                            alt=""
                            className={styles.avatarPreview}
                            loading="lazy"
                            decoding="async"
                          />
                          <div className={styles.avatarOverlay}>
                            <button
                              type="button"
                              className={styles.avatarOverlayBtn}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <MdEdit size={14} />
                              <span>{t("change_image")}</span>
                            </button>
                            <button
                              type="button"
                              className={`${styles.avatarOverlayBtn} ${styles.avatarOverlayBtnDanger}`}
                              onClick={handleRemoveImage}
                            >
                              <MdDelete size={14} />
                              <span>{t("delete")}</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          className={styles.avatarPlaceholder}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <MdCloudUpload size={28} />
                          <span>{t("click_to_upload")}</span>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        hidden
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.bilingualInputs}>
                  <div className={styles.langField}>
                    <label className={styles.label}>
                      {t("member_name")} ({t("lang_en")})
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formData["name[en]"]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          "name[en]": e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className={styles.langField}>
                    <label className={styles.label}>
                      {t("member_name")} ({t("lang_ar")})
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formData["name[ar]"]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          "name[ar]": e.target.value,
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
                      {t("member_title")} ({t("lang_en")})
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
                      {t("member_title")} ({t("lang_ar")})
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

                <div className={styles.emailOrderRow}>
                  <div className={styles.langField}>
                    <label className={styles.label}>{t("member_email")}</label>
                    <input
                      type="email"
                      className={styles.input}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
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

                <div className={styles.langField}>
                  <label className={styles.label}>{t("status")}</label>
                  <div className={styles.toggleContainer}>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${
                        formData.status === "1" ? styles.active : ""
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, status: "1" })
                      }
                    >
                      {t("active")}
                    </button>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${
                        formData.status === "0" ? styles.inactive : ""
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, status: "0" })
                      }
                    >
                      {t("inactive")}
                    </button>
                  </div>
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

export default TeamSection;
