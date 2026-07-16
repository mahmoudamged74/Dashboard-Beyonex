import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdSave,
  MdVerifiedUser,
  MdStar,
} from "react-icons/md";
import styles from "./WhyUsManager.module.css";
import toast, { getActionMessageKey } from "../../utils/toast";
import { useAppDispatch, useAppSelector, usePermission, useAppReady } from "../../hooks";
import {
  fetchWhyUs,
  createWhyUs,
  updateWhyUs,
  deleteWhyUs,
  toggleWhyUsStatus,
} from "../../redux/actions/whyUsActions";
import { selectWhyUs } from "../../redux/reducers/whyUsReducer";
import { REQUEST_STATUS } from "../../redux/types";
import { CardGridSkeleton } from "../../components/Loading";
import { ModalPortal } from "../../components/Modal";
import { getAppLanguage } from "../../i18n";
import DynamicIcon from "../../components/Icon/DynamicIcon";
import IconPicker from "../../components/Icon/IconPicker/IconPicker";

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

const WhyUsManager = () => {
  const { t, i18n } = useTranslation();
  const { can } = usePermission();
  const dispatch = useAppDispatch();
  const isAr = getAppLanguage(i18n.language) === "ar";

  useAppReady();

  const { items: features = [], status } = useAppSelector(selectWhyUs);
  const loading = status === REQUEST_STATUS.LOADING && features.length === 0;

  useEffect(() => {
    dispatch(fetchWhyUs());
  }, [dispatch]);

  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [formData, setFormData] = useState({
    "title[ar]": "",
    "title[en]": "",
    "description[ar]": "",
    "description[en]": "",
    status: "1",
    icon: "starFill",
  });
  const [iconSearch, setIconSearch] = useState("");

  const refreshWhyUs = () => dispatch(fetchWhyUs({ force: true }));

  const handleDelete = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await dispatch(deleteWhyUs(selectedFeature.id)).unwrap();
      toast.success(t(getActionMessageKey("delete")));
      refreshWhyUs();
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

    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (modalType === "addFeature") {
        await dispatch(createWhyUs(data)).unwrap();
        toast.success(t(getActionMessageKey("add")));
      } else {
        data.append("_method", "PUT");
        await dispatch(
          updateWhyUs({ id: selectedFeature.id, formData: data })
        ).unwrap();
        toast.success(t(getActionMessageKey("update")));
      }
      refreshWhyUs();
      closeModal();
    } catch (err) {
      toast.error(
        err ||
          t(
            getActionMessageKey(
              modalType === "addFeature" ? "add" : "update",
              "error"
            )
          )
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (feature) => {
    try {
      const data = new FormData();
      data.append("_method", "PUT");
      data.append("status", feature.status ? "0" : "1");
      await dispatch(toggleWhyUsStatus({ id: feature.id, formData: data })).unwrap();
      toast.success(t(getActionMessageKey("update")));
      refreshWhyUs();
    } catch (err) {
      toast.error(err || t(getActionMessageKey("update", "error")));
    }
  };

  const getIcon = (iconName) => (
    <DynamicIcon name={iconName} size={22} fallback={MdVerifiedUser} />
  );

  const getTitle = (item) =>
    typeof item?.title === "object"
      ? isAr
        ? item.title?.ar
        : item.title?.en
      : item?.title;

  const getDescription = (item) =>
    typeof item?.description === "object"
      ? isAr
        ? item.description?.ar
        : item.description?.en
      : item?.description;

  const handleAddFeature = () => {
    setFormData({
      "title[ar]": "",
      "title[en]": "",
      "description[ar]": "",
      "description[en]": "",
      status: "1",
      icon: "starFill",
    });
    setSelectedFeature(null);
    setIconSearch("");
    setModalType("addFeature");
    setIsModalOpen(true);
  };

  const handleEditFeature = (feature) => {
    setFormData({
      "title[ar]": feature.title?.ar || "",
      "title[en]": feature.title?.en || "",
      "description[ar]": feature.description?.ar || "",
      "description[en]": feature.description?.en || "",
      status: feature.status ? "1" : "0",
      icon: feature.icon || "starFill",
    });
    setSelectedFeature(feature);
    setIconSearch("");
    setModalType("editFeature");
    setIsModalOpen(true);
  };

  const openDeleteModal = (feature) => {
    setSelectedFeature(feature);
    setModalType("delete");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedFeature(null);
    setIconSearch("");
  };

  return (
    <div className={styles.page} dir={isAr ? "rtl" : "ltr"}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t("why_us")}</h1>
        <p className={styles.pageSubtitle}>{t("why_us_page.subtitle")}</p>
      </header>

      <SectionCard
        icon={MdStar}
        title={t("features_list")}
        description={t("why_us_page.list_desc", { count: features.length })}
        actions={
          can("why_us.create") ? (
            <button
              type="button"
              className={styles.addBtn}
              onClick={handleAddFeature}
            >
              <MdAdd size={18} />
              {t("add_why_us")}
            </button>
          ) : null
        }
      >
        {loading ? (
          <CardGridSkeleton count={4} />
        ) : features.length === 0 ? (
          <div className={styles.emptyState}>
            <MdStar size={32} />
            <p>{t("no_data_found")}</p>
          </div>
        ) : (
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <article
                key={feature.id}
                className={`${styles.featureCard} ${
                  !feature.status ? styles.featureCardInactive : ""
                }`}
              >
                <div className={styles.featureTop}>
                  <div className={styles.featureIconWrap}>
                    {getIcon(feature.icon)}
                  </div>
                  <span className={styles.indexBadge}>{index + 1}</span>
                </div>

                <h3 className={styles.featureTitle}>{getTitle(feature)}</h3>
                <p className={styles.featureDesc}>{getDescription(feature)}</p>

                <div className={styles.featureMeta}>
                  <span
                    className={`${styles.statusBadge} ${
                      feature.status
                        ? styles.statusActive
                        : styles.statusInactive
                    }`}
                  >
                    {feature.status ? t("active") : t("inactive")}
                  </span>

                  <div className={styles.featureActions}>
                    {can("why_us.update") && (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => handleEditFeature(feature)}
                        title={t("edit")}
                        aria-label={t("edit")}
                      >
                        <MdEdit size={15} />
                      </button>
                    )}
                    {can("why_us.update") && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${
                          feature.status
                            ? styles.actionStatusOn
                            : styles.actionStatusOff
                        }`}
                        onClick={() => toggleStatus(feature)}
                        title={t("toggle_status")}
                        aria-label={t("toggle_status")}
                      >
                        <MdVerifiedUser size={15} />
                      </button>
                    )}
                    {can("why_us.delete") && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionDelete}`}
                        onClick={() => openDeleteModal(feature)}
                        title={t("delete")}
                        aria-label={t("delete")}
                      >
                        <MdDelete size={15} />
                      </button>
                    )}
                  </div>
                </div>
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
                {modalType === "addFeature" && t("add_feature")}
                {modalType === "editFeature" && t("edit_feature")}
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
                      <strong>{getTitle(selectedFeature)}</strong>?
                    </p>
                  </div>
                ) : (
                  <>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          {t("about_page.title_en")}
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
                          {t("about_page.title_ar")}
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
                        {t("about_page.description_en")}
                      </label>
                      <textarea
                        value={formData["description[en]"]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            "description[en]": e.target.value,
                          })
                        }
                        className={styles.textarea}
                        rows={3}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        {t("about_page.description_ar")}
                      </label>
                      <textarea
                        value={formData["description[ar]"]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            "description[ar]": e.target.value,
                          })
                        }
                        className={styles.textarea}
                        dir="rtl"
                        rows={3}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t("icon")}</label>
                      <IconPicker
                        value={formData.icon}
                        onChange={(icon) => setFormData({ ...formData, icon })}
                        search={iconSearch}
                        onSearchChange={setIconSearch}
                        searchPlaceholder={t("search_icons")}
                        selectedLabel={t("selected")}
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

export default WhyUsManager;
