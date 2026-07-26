import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdSave,
  MdHandshake,
  MdCloudUpload,
  MdImage,
  MdVerifiedUser,
} from "react-icons/md";
import styles from "./PartnersManager.module.css";
import toast, { getActionMessageKey } from "../../utils/toast";
import {
  useAppDispatch,
  useAppSelector,
  usePermission,
  useAppReady,
  useResolvedMediaUrl,
} from "../../hooks";
import {
  fetchPartners,
  createPartner,
  updatePartner,
  deletePartner,
  togglePartnerStatus,
} from "../../redux/actions/partnersActions";
import { selectPartners } from "../../redux/reducers/partnersReducer";
import { REQUEST_STATUS } from "../../redux/types";
import { CardGridSkeleton } from "../../components/Loading";
import { ModalPortal } from "../../components/Modal";
import MediaImage from "../../components/Media/MediaImage";
import { getAppLanguage } from "../../i18n";

const EMPTY_FORM = {
  "title[en]": "",
  "title[ar]": "",
  display_order: "0",
  status: "1",
};

const SectionCard = ({ icon: Icon, title, description, actions, children }) => (
  <section className={styles.sectionCard}>
    <div className={styles.sectionHeader}>
      <div className={styles.sectionHeaderMain}>
        <div className={styles.sectionHeaderIcon}>
          <Icon size={20} />
        </div>
        <div>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {description && <p className={styles.sectionDesc}>{description}</p>}
        </div>
      </div>
      {actions && <div className={styles.sectionHeaderActions}>{actions}</div>}
    </div>
    <div className={styles.sectionBody}>{children}</div>
  </section>
);

const PartnersManager = () => {
  const { t, i18n } = useTranslation();
  const { can } = usePermission();
  const dispatch = useAppDispatch();
  const isAr = getAppLanguage(i18n.language) === "ar";

  useAppReady();

  const { items: partners = [], status } = useAppSelector(selectPartners);
  const loading = status === REQUEST_STATUS.LOADING && partners.length === 0;

  useEffect(() => {
    dispatch(fetchPartners());
  }, [dispatch]);

  const [saving, setSaving] = useState(false);
  const [mediaVersion, setMediaVersion] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
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

  const refreshPartners = () => {
    setMediaVersion((v) => v + 1);
    return dispatch(fetchPartners({ force: true }));
  };

  const getTitle = (item) =>
    typeof item?.title === "object"
      ? isAr
        ? item.title?.ar
        : item.title?.en
      : item?.title;

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(false);
  };

  const handleAddPartner = () => {
    resetForm();
    setSelectedPartner(null);
    setModalType("addPartner");
    setIsModalOpen(true);
  };

  const handleEditPartner = (partner) => {
    setFormData({
      "title[en]": partner.title?.en || "",
      "title[ar]": partner.title?.ar || "",
      display_order: partner.display_order?.toString() || "0",
      status: partner.status ? "1" : "0",
    });
    setSelectedPartner(partner);
    setImageFile(null);
    setImagePreview(partner.image_path || null);
    setImageRemoved(false);
    setModalType("editPartner");
    setIsModalOpen(true);
  };

  const openDeleteModal = (partner) => {
    setSelectedPartner(partner);
    setModalType("delete");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setIsModalOpen(false);
    setModalType(null);
    setSelectedPartner(null);
    resetForm();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("partners_page.image_too_large"));
        e.target.value = "";
        return;
      }
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

  const buildFormData = () => {
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (imageFile) {
      data.append("image", imageFile);
    } else if (imageRemoved) {
      data.append("remove_image", "1");
    }

    return data;
  };

  const handleDelete = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await dispatch(deletePartner(selectedPartner.id)).unwrap();
      toast.success(t(getActionMessageKey("delete")));
      await refreshPartners();
      closeModal();
    } catch (err) {
      toast.error(err || t(getActionMessageKey("delete", "error")));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (modalType === "delete") {
      await handleDelete(e);
      return;
    }

    const hasExistingImage =
      !imageRemoved && (imageFile || selectedPartner?.image_path);
    if (modalType === "addPartner" && !imageFile) {
      toast.error(t("partners_page.image_required"));
      return;
    }
    if (modalType === "editPartner" && !hasExistingImage && !imageFile) {
      toast.error(t("partners_page.image_required"));
      return;
    }

    setSaving(true);
    try {
      const data = buildFormData();

      if (modalType === "addPartner") {
        await dispatch(createPartner(data)).unwrap();
        toast.success(t(getActionMessageKey("add")));
      } else {
        await dispatch(
          updatePartner({ id: selectedPartner.id, formData: data })
        ).unwrap();
        toast.success(t(getActionMessageKey("update")));
      }
      await refreshPartners();
      closeModal();
    } catch (err) {
      toast.error(
        err ||
          t(
            getActionMessageKey(
              modalType === "addPartner" ? "add" : "update",
              "error"
            )
          )
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (partner) => {
    try {
      const data = new FormData();
      data.append("_method", "PUT");
      data.append("status", partner.status ? "0" : "1");
      await dispatch(
        togglePartnerStatus({ id: partner.id, formData: data })
      ).unwrap();
      toast.success(t(getActionMessageKey("update")));
      await refreshPartners();
    } catch (err) {
      toast.error(err || t(getActionMessageKey("update", "error")));
    }
  };

  const sortedPartners = [...partners].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  return (
    <div className={styles.page} dir={isAr ? "rtl" : "ltr"}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t("partners")}</h1>
        <p className={styles.pageSubtitle}>{t("partners_page.subtitle")}</p>
      </header>

      <SectionCard
        icon={MdHandshake}
        title={t("partners_page.list_title")}
        description={t("partners_page.list_desc", {
          count: sortedPartners.length,
        })}
        actions={
          can("partners.create") ? (
            <button
              type="button"
              className={styles.addBtn}
              onClick={handleAddPartner}
            >
              <MdAdd size={18} />
              {t("add_partner")}
            </button>
          ) : null
        }
      >
        {loading ? (
          <CardGridSkeleton count={4} />
        ) : sortedPartners.length === 0 ? (
          <div className={styles.emptyState}>
            <MdHandshake size={32} />
            <p>{t("no_data_found")}</p>
          </div>
        ) : (
          <div className={styles.partnersGrid}>
            {sortedPartners.map((partner, index) => {
              const title = getTitle(partner);

              return (
                <article
                  key={partner.id}
                  className={`${styles.partnerCard} ${
                    !partner.status ? styles.partnerCardInactive : ""
                  }`}
                >
                  <div className={styles.partnerTop}>
                    <span className={styles.indexBadge}>{index + 1}</span>
                    <div className={styles.partnerActions}>
                      {can("partners.update") && (
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleEditPartner(partner)}
                          title={t("edit")}
                          aria-label={t("edit")}
                        >
                          <MdEdit size={15} />
                        </button>
                      )}
                      {can("partners.update") && (
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${
                            partner.status
                              ? styles.actionStatusOn
                              : styles.actionStatusOff
                          }`}
                          onClick={() => toggleStatus(partner)}
                          title={t("toggle_status")}
                          aria-label={t("toggle_status")}
                        >
                          <MdVerifiedUser size={15} />
                        </button>
                      )}
                      {can("partners.delete") && (
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionDelete}`}
                          onClick={() => openDeleteModal(partner)}
                          title={t("delete")}
                          aria-label={t("delete")}
                        >
                          <MdDelete size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.logoWrap}>
                    {partner.image_path ? (
                      <MediaImage
                        value={partner.image_path}
                        alt={title}
                        className={styles.logoImage}
                        cacheBust={mediaVersion}
                      />
                    ) : (
                      <div className={styles.logoPlaceholder}>
                        <MdImage size={28} />
                      </div>
                    )}
                  </div>

                  <div className={styles.partnerFooter}>
                    <h3 className={styles.partnerName}>{title}</h3>
                    <span
                      className={`${styles.statusBadge} ${
                        partner.status
                          ? styles.statusActive
                          : styles.statusInactive
                      }`}
                    >
                      {partner.status ? t("active") : t("inactive")}
                    </span>
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
                  {modalType === "addPartner" && t("add_partner")}
                  {modalType === "editPartner" && t("edit_partner")}
                  {modalType === "delete" && t("delete")}
                </h3>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={closeModal}
                >
                  <MdClose size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.modalBody}>
                  {modalType === "delete" ? (
                    <div className={styles.deleteConfirm}>
                      <p>
                        {t("delete_confirmation")}{" "}
                        <strong>{getTitle(selectedPartner)}</strong>?
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          {t("partner_logo")}
                        </label>
                        <div
                          className={`${styles.logoUpload} ${
                            modalImageSrc ? styles.logoUploadHasImage : ""
                          }`}
                        >
                          {modalImageSrc ? (
                            <>
                              <img
                                src={modalImageSrc}
                                alt=""
                                className={styles.logoPreview}
                                loading="lazy"
                                decoding="async"
                              />
                              <div className={styles.logoOverlay}>
                                <button
                                  type="button"
                                  className={styles.logoOverlayBtn}
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <MdEdit size={14} />
                                  <span>{t("change_image")}</span>
                                </button>
                                <button
                                  type="button"
                                  className={`${styles.logoOverlayBtn} ${styles.logoOverlayBtnDanger}`}
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
                              className={styles.logoUploadPlaceholder}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <MdCloudUpload size={28} />
                              <span>{t("click_to_upload")}</span>
                            </button>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                            onChange={handleFileChange}
                            hidden
                          />
                        </div>
                      </div>

                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            {t("partner_name")} ({t("lang_en")})
                          </label>
                          <input
                            type="text"
                            value={formData["title[en]"]}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                "title[en]": e.target.value,
                              })
                            }
                            className={styles.input}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            {t("partner_name")} ({t("lang_ar")})
                          </label>
                          <input
                            type="text"
                            value={formData["title[ar]"]}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                "title[ar]": e.target.value,
                              })
                            }
                            className={styles.input}
                            dir="rtl"
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          {t("display_order")}
                        </label>
                        <input
                          type="number"
                          value={formData.display_order}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              display_order: e.target.value,
                            })
                          }
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGroup}>
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
                    </>
                  )}
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={closeModal}
                    disabled={saving}
                  >
                    {t("cancel")}
                  </button>
                  {modalType === "delete" ? (
                    <button
                      type="submit"
                      className={styles.deleteConfirmBtn}
                      disabled={saving}
                    >
                      {saving ? t("saving") : t("confirm_delete")}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className={styles.saveBtn}
                      disabled={saving}
                    >
                      <MdSave size={16} />
                      {saving ? t("saving") : t("save")}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default PartnersManager;
