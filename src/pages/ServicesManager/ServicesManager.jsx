import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdSave,
  MdImage,
  MdSettings,
  MdList,
  MdExtension,
  MdDescription,
  MdApps,
} from "react-icons/md";
import styles from "./ServicesManager.module.css";
import toast, { getActionMessageKey } from "../../utils/toast";
import { useAppDispatch, useAppSelector, usePermission, useAppReady } from "../../hooks";
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
} from "../../redux/actions/servicesActions";
import { fetchSettings, updateSettings } from "../../redux/actions/settingsActions";
import { selectServices } from "../../redux/reducers/servicesReducer";
import { selectSettings } from "../../redux/reducers/settingsReducer";
import { REQUEST_STATUS } from "../../redux/types";
import { CardGridSkeleton } from "../../components/Loading";
import { getAppLanguage } from "../../i18n";
import DynamicIcon from "../../components/Icon/DynamicIcon";
import IconPicker from "../../components/Icon/IconPicker/IconPicker";
import { ModalPortal } from "../../components/Modal";

const ReactQuill = lazy(() => import("react-quill"));

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (text, length = 100) => {
  if (!text) return "";
  return text.length > length ? `${text.substring(0, length)}…` : text;
};

const autoResizeTextarea = (el) => {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
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

const ServicesManager = () => {
  const { t, i18n } = useTranslation();
  const { can } = usePermission();
  const dispatch = useAppDispatch();
  const isAr = getAppLanguage(i18n.language) === "ar";

  useAppReady();

  const { items: services = [], status: servicesStatus } = useAppSelector(selectServices);
  const { data: settings } = useAppSelector(selectSettings);
  const servicesLoading = servicesStatus === REQUEST_STATUS.LOADING && services.length === 0;

  useEffect(() => {
    dispatch(fetchServices({ force: true }));
    dispatch(fetchSettings({ force: true }));
  }, [dispatch]);

  const [saving, setSaving] = useState(false);
  const [savingIntro, setSavingIntro] = useState(false);
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'addService', 'editService', 'delete'
  const [selectedService, setSelectedService] = useState(null);

  const [servicePageInfo, setServicePageInfo] = useState({
    "service_text[ar]": "",
    "service_text[en]": "",
  });
  const [introDraft, setIntroDraft] = useState({
    "service_text[ar]": "",
    "service_text[en]": "",
  });

  useEffect(() => {
    if (settings) {
      const next = {
        "service_text[ar]": settings.service_text?.ar || "",
        "service_text[en]": settings.service_text?.en || "",
      };
      setServicePageInfo(next);
      if (!isEditingIntro) {
        setIntroDraft(next);
      }
    }
  }, [settings, isEditingIntro]);

  const refreshServicesData = () => {
    dispatch(fetchServices({ force: true }));
    dispatch(fetchSettings({ force: true }));
  };

  const [formData, setFormData] = useState({
    "title[ar]": "",
    "title[en]": "",
    "short_description[ar]": "",
    "short_description[en]": "",
    "long_description[ar]": "",
    "long_description[en]": "",
    icon: "codeSlash",
    display_order: "0",
    status: "1",
    technologies: [""],
    features: [{ ar: "", en: "" }],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [iconSearch, setIconSearch] = useState("");
  const introEnRef = useRef(null);
  const introArRef = useRef(null);

  useEffect(() => {
    if (!isEditingIntro) return;
    autoResizeTextarea(introEnRef.current);
    autoResizeTextarea(introArRef.current);
  }, [isEditingIntro, introDraft]);

  useEffect(() => {
    if (
      isModalOpen &&
      (modalType === "addService" || modalType === "editService")
    ) {
      import("react-quill/dist/quill.snow.css");
    }
  }, [isModalOpen, modalType]);

  const getIcon = (iconName) => (
    <DynamicIcon name={iconName} size={20} fallback={MdSettings} />
  );

  // --- Handlers ---

  const handleStartEditIntro = () => {
    setIntroDraft({ ...servicePageInfo });
    setIsEditingIntro(true);
  };

  const handleCancelEditIntro = () => {
    setIntroDraft({ ...servicePageInfo });
    setIsEditingIntro(false);
  };

  const handleSaveIntro = async () => {
    setSavingIntro(true);
    try {
      const data = new FormData();
      data.append("_method", "PUT");
      data.append("service_text[ar]", introDraft["service_text[ar]"]);
      data.append("service_text[en]", introDraft["service_text[en]"]);

      await dispatch(updateSettings(data)).unwrap();
      setServicePageInfo({ ...introDraft });
      toast.success(t(getActionMessageKey('save')));
      refreshServicesData();
      setIsEditingIntro(false);
    } catch (err) {
      toast.error(t("save_error"));
    } finally {
      setSavingIntro(false);
    }
  };

  const handleAddService = () => {
    setFormData({
      "title[ar]": "",
      "title[en]": "",
      "short_description[ar]": "",
      "short_description[en]": "",
      "long_description[ar]": "",
      "long_description[en]": "",
      icon: "codeSlash",
      display_order: "0",
      status: "1",
      technologies: [""],
      features: [{ ar: "", en: "" }],
    });
    setImageFile(null);
    setImagePreview(null);
    setModalType("addService");
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setFormData({
      "title[ar]": service.title?.ar || "",
      "title[en]": service.title?.en || "",
      "short_description[ar]": service.short_description?.ar || "",
      "short_description[en]": service.short_description?.en || "",
      "long_description[ar]": service.long_description?.ar || "",
      "long_description[en]": service.long_description?.en || "",
      icon: service.icon || "codeSlash",
      display_order: service.display_order?.toString() || "0",
      status: service.status ? "1" : "0",
      technologies:
        service.technologies && service.technologies.length > 0
          ? service.technologies
          : [""],
      features:
        service.features && service.features.length > 0
          ? service.features.map((f) =>
              typeof f === "object"
                ? { ar: f.ar || "", en: f.en || "" }
                : { ar: f || "", en: f || "" },
            )
          : [{ ar: "", en: "" }],
    });
    setSelectedService(service);
    setImagePreview(service.image);
    setModalType("editService");
    setIsModalOpen(true);
  };

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setModalType("delete");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedService(null);
    setImageFile(null);
    setImagePreview(null);
    setIconSearch("");
  };

  const handleSaveService = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();

      // Basic Fields
      Object.keys(formData).forEach((key) => {
        if (key === "technologies") {
          formData[key].forEach((item, index) => {
            if (item && item.trim()) {
              data.append(`${key}[${index}]`, item);
            }
          });
        } else if (key === "features") {
          formData[key].forEach((item, index) => {
            if (item.ar && item.ar.trim()) {
              data.append(`features[ar][${index}]`, item.ar);
            }
            if (item.en && item.en.trim()) {
              data.append(`features[en][${index}]`, item.en);
            }
          });
        } else {
          data.append(key, formData[key]);
        }
      });

      if (imageFile) data.append("image", imageFile);

      if (modalType === "addService") {
        const result = await dispatch(createService(data)).unwrap();
        toast.success(t(getActionMessageKey("add")));
      } else {
        data.append("_method", "PUT");
        const result = await dispatch(
          updateService({ id: selectedService.id, formData: data })
        ).unwrap();
        toast.success(t(getActionMessageKey("update")));
      }
      refreshServicesData();
      closeModal();
    } catch (err) {
      toast.error(err || t("save_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const result = await dispatch(deleteService(selectedService.id)).unwrap();
      toast.success(t(getActionMessageKey("delete")));
      refreshServicesData();
      closeModal();
    } catch (err) {
      toast.error(t("delete_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file && type === "image") {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleArrayChange = (index, value, type, lang = null) => {
    const updated = [...formData[type]];
    if (lang) {
      updated[index] = { ...updated[index], [lang]: value };
    } else {
      updated[index] = value;
    }
    setFormData({ ...formData, [type]: updated });
  };

  const addArrayItem = (type) => {
    const newItem = type === "features" ? { ar: "", en: "" } : "";
    setFormData({ ...formData, [type]: [...formData[type], newItem] });
  };

  const removeArrayItem = (index, type) => {
    const updated = formData[type].filter((_, i) => i !== index);
    const defaultValue = type === "features" ? { ar: "", en: "" } : "";
    setFormData({
      ...formData,
      [type]: updated.length > 0 ? updated : [defaultValue],
    });
  };

  const introText = isAr
    ? servicePageInfo["service_text[ar]"]
    : servicePageInfo["service_text[en]"];

  return (
    <div className={styles.page} dir={isAr ? "rtl" : "ltr"}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t("our_services")}</h1>
        <p className={styles.pageSubtitle}>{t("services_page.subtitle")}</p>
      </header>

      <SectionCard
        icon={MdDescription}
        title={t("services_page.intro_title")}
        description={t("services_page.intro_desc")}
        actions={
          can("services.update") ? (
            isEditingIntro ? (
              <>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCancelEditIntro}
                  disabled={savingIntro}
                >
                  <MdClose size={16} />
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={handleSaveIntro}
                  disabled={savingIntro}
                >
                  <MdSave size={16} />
                  {savingIntro ? t("saving") : t("save_changes")}
                </button>
              </>
            ) : (
              <button
                type="button"
                className={styles.editBtn}
                onClick={handleStartEditIntro}
              >
                <MdEdit size={16} />
                {t("edit_content")}
              </button>
            )
          ) : null
        }
      >
        {isEditingIntro ? (
          <div className={styles.introEditGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("service_text")} ({t("lang_en")})</label>
              <textarea
                ref={introEnRef}
                value={introDraft["service_text[en]"]}
                onChange={(e) => {
                  setIntroDraft({
                    ...introDraft,
                    "service_text[en]": e.target.value,
                  });
                  autoResizeTextarea(e.target);
                }}
                className={`${styles.textarea} ${styles.autoTextarea}`}
                rows={1}
                dir="ltr"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("service_text")} ({t("lang_ar")})</label>
              <textarea
                ref={introArRef}
                value={introDraft["service_text[ar]"]}
                onChange={(e) => {
                  setIntroDraft({
                    ...introDraft,
                    "service_text[ar]": e.target.value,
                  });
                  autoResizeTextarea(e.target);
                }}
                className={`${styles.textarea} ${styles.autoTextarea}`}
                dir="rtl"
                rows={1}
              />
            </div>
          </div>
        ) : introText ? (
          <p className={styles.introText}>{introText}</p>
        ) : (
          <p className={styles.introEmpty}>{t("services_page.intro_empty")}</p>
        )}
      </SectionCard>

      <SectionCard
        icon={MdApps}
        title={t("services_list")}
        description={t("services_page.list_desc", { count: services.length })}
        actions={
          can("services.create") ? (
            <button
              type="button"
              className={styles.addBtn}
              onClick={handleAddService}
            >
              <MdAdd size={18} />
              {t("add_service")}
            </button>
          ) : null
        }
      >
        {servicesLoading ? (
          <CardGridSkeleton count={6} />
        ) : services.length === 0 ? (
          <div className={styles.emptyState}>
            <MdApps size={32} />
            <p>{t("no_data_found")}</p>
          </div>
        ) : (
          <div className={styles.servicesGrid}>
            {services.map((service, index) => {
              const title = isAr ? service.title?.ar : service.title?.en;
              const desc = truncate(
                stripHtml(
                  isAr
                    ? service.short_description?.ar
                    : service.short_description?.en,
                ),
                120,
              );

              return (
                <article
                  key={service.id}
                  className={`${styles.serviceCard} ${!service.status ? styles.serviceCardInactive : ""}`}
                >
                  <div className={styles.serviceMedia}>
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={title}
                        className={styles.serviceImage}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className={styles.serviceMediaPlaceholder}>
                        <MdImage size={32} />
                      </div>
                    )}
                    <div className={styles.serviceIconBadge}>
                      {getIcon(service.icon)}
                    </div>
                    <span className={styles.indexBadge} aria-label={`#${index + 1}`}>
                      {index + 1}
                    </span>
                  </div>

                  <div className={styles.serviceBody}>
                    <h3 className={styles.serviceTitle}>{title}</h3>
                    {desc && <p className={styles.serviceDesc}>{desc}</p>}
                    <div className={styles.serviceMeta}>
                      <span
                        className={`${styles.statusBadge} ${
                          service.status
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {service.status ? t("active") : t("inactive")}
                      </span>
                      <div className={styles.serviceActions}>
                        {can("services.update") && (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => handleEditService(service)}
                            title={t("edit")}
                            aria-label={t("edit")}
                          >
                            <MdEdit size={15} />
                          </button>
                        )}
                        {can("services.delete") && (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionDelete}`}
                            onClick={() => openDeleteModal(service)}
                            title={t("delete")}
                            aria-label={t("delete")}
                          >
                            <MdDelete size={15} />
                          </button>
                        )}
                      </div>
                    </div>
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
                {modalType === "addService" && t("add_service")}
                {modalType === "editService" && t("edit_service")}
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

            <form
              onSubmit={
                modalType === "delete" ? handleDelete : handleSaveService
              }
              className={styles.form}
            >
              <div className={styles.modalBody}>
                {modalType === "delete" ? (
                  <div className={styles.deleteConfirm}>
                    <p>
                      {t("delete_confirmation")}{" "}
                      <strong>
                        {isAr
                          ? selectedService?.title?.ar
                          : selectedService?.title?.en}
                      </strong>
                      ?
                    </p>
                  </div>
                ) : (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t("image")}</label>
                      <div className={styles.uploadBox}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "image")}
                          id="imageUpload"
                          hidden
                        />
                        <label
                          htmlFor="imageUpload"
                          className={styles.uploadLabel}
                        >
                          <MdImage size={20} />
                          {t("change_image")}
                        </label>
                        {imagePreview && (
                          <img
                            src={imagePreview}
                            alt=""
                            className={styles.imgPreview}
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </div>
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
                        {t("short_description")} ({t("lang_en")})
                      </label>
                      <textarea
                        value={formData["short_description[en]"]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            "short_description[en]": e.target.value,
                          })
                        }
                        className={styles.textarea}
                        rows={2}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        {t("short_description")} ({t("lang_ar")})
                      </label>
                      <textarea
                        value={formData["short_description[ar]"]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            "short_description[ar]": e.target.value,
                          })
                        }
                        className={styles.textarea}
                        dir="rtl"
                        rows={2}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        {t("long_description")} ({t("lang_en")})
                      </label>
                      <div className={styles.quillContainer}>
                        <Suspense
                          fallback={
                            <div className={styles.quillFallback}>
                              {t("loading")}
                            </div>
                          }
                        >
                          <ReactQuill
                            theme="snow"
                            value={formData["long_description[en]"]}
                            onChange={(val) =>
                              setFormData({
                                ...formData,
                                "long_description[en]": val,
                              })
                            }
                          />
                        </Suspense>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        {t("long_description")} ({t("lang_ar")})
                      </label>
                      <div className={styles.quillContainer} dir="rtl">
                        <Suspense
                          fallback={
                            <div className={styles.quillFallback}>
                              {t("loading")}
                            </div>
                          }
                        >
                          <ReactQuill
                            theme="snow"
                            value={formData["long_description[ar]"]}
                            onChange={(val) =>
                              setFormData({
                                ...formData,
                                "long_description[ar]": val,
                              })
                            }
                          />
                        </Suspense>
                      </div>
                    </div>

                    <div className={styles.formGrid}>
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
                            className={`${styles.toggleBtn} ${formData.status === "1" ? styles.active : ""}`}
                            onClick={() =>
                              setFormData({ ...formData, status: "1" })
                            }
                          >
                            {t("active")}
                          </button>
                          <button
                            type="button"
                            className={`${styles.toggleBtn} ${formData.status === "0" ? styles.inactive : ""}`}
                            onClick={() =>
                              setFormData({ ...formData, status: "0" })
                            }
                          >
                            {t("inactive")}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={styles.dynamicList}>
                      <label className={styles.label}>
                        <MdExtension size={16} /> {t("technologies")}
                      </label>
                      {formData.technologies.map((item, idx) => (
                        <div key={idx} className={styles.arrayItem}>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) =>
                              handleArrayChange(
                                idx,
                                e.target.value,
                                "technologies",
                              )
                            }
                            className={styles.input}
                            placeholder={`Tech ${idx + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem(idx, "technologies")}
                            className={styles.removeBtn}
                          >
                            <MdClose />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem("technologies")}
                        className={styles.addArrayBtn}
                      >
                        <MdAdd /> {t("add_new")}
                      </button>
                    </div>

                    <div className={styles.dynamicList}>
                      <label className={styles.label}>
                        <MdList size={16} /> {t("features")}
                      </label>
                      {formData.features.map((item, idx) => (
                        <div key={idx} className={styles.arrayItemColumn}>
                          <div className={styles.arrayItem}>
                            <input
                              type="text"
                              value={item.en || ""}
                              onChange={(e) =>
                                handleArrayChange(
                                  idx,
                                  e.target.value,
                                  "features",
                                  "en",
                                )
                              }
                              className={styles.input}
                              placeholder={t("feature_placeholder", { n: idx + 1, lang: t("lang_en") })}
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayItem(idx, "features")}
                              className={styles.removeBtn}
                            >
                              <MdClose />
                            </button>
                          </div>
                          <div className={styles.arrayItem}>
                            <input
                              type="text"
                              value={item.ar || ""}
                              onChange={(e) =>
                                handleArrayChange(
                                  idx,
                                  e.target.value,
                                  "features",
                                  "ar",
                                )
                              }
                              className={styles.input}
                              dir="rtl"
                              placeholder={t("feature_placeholder", { n: idx + 1, lang: t("lang_ar") })}
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem("features")}
                        className={styles.addArrayBtn}
                      >
                        <MdAdd /> {t("add_new")}
                      </button>
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

export default ServicesManager;
