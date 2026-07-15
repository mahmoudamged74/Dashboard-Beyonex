import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  MdEdit,
  MdDelete,
  MdAdd,
  MdClose,
  MdSave,
  MdPerson,
  MdEmail,
  MdCloudUpload,
  MdVisibility,
  MdVisibilityOff,
  MdVerifiedUser,
  MdPeople,
  MdShield,
  MdKeyboardArrowDown,
  MdCheck,
} from "react-icons/md";
import toast, { getActionMessageKey } from "../../utils/toast";
import { useAppDispatch, useAppSelector, usePermission, useAppReady } from "../../hooks";
import {
  fetchAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
} from "../../redux/actions/adminsActions";
import { selectAdmins } from "../../redux/reducers/adminsReducer";
import { REQUEST_STATUS } from "../../redux/types";
import { CardGridSkeleton } from "../../components/Loading";
import { getAppLanguage } from "../../i18n";
import styles from "./AdminsManager.module.css";

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

const AdminsManager = () => {
  const { t, i18n } = useTranslation();
  const { can } = usePermission();
  const dispatch = useAppDispatch();
  const isAr = getAppLanguage(i18n.language) === "ar";
  const fileInputRef = useRef(null);

  useAppReady();

  const { data, status } = useAppSelector(selectAdmins);
  const admins = data?.admins || [];
  const roles = data?.roles || [];
  const loading = status === REQUEST_STATUS.LOADING && admins.length === 0;

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  const [modal, setModal] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleSelectRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role_id: "",
    status: "1",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const refreshAdmins = () => dispatch(fetchAdmins({ force: true }));

  const closeModal = () => {
    setModal(null);
    setSelectedAdmin(null);
    setSaving(false);
    setImagePreview(null);
    setRoleMenuOpen(false);
  };

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") {
        if (roleMenuOpen) {
          setRoleMenuOpen(false);
          return;
        }
        closeModal();
      }
    };
    if (modal) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [modal, roleMenuOpen]);

  useEffect(() => {
    if (!roleMenuOpen) return;
    const onClickOutside = (e) => {
      if (
        roleSelectRef.current &&
        !roleSelectRef.current.contains(e.target)
      ) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [roleMenuOpen]);

  const getRoleName = (role) => {
    if (!role) return "—";
    if (role.name) return role.name;
    return isAr ? role.name_ar || role.name_en : role.name_en || role.name_ar;
  };

  const selectedRole =
    roles.find((role) => String(role.id) === String(formData.role_id)) || null;

  const openCreate = () => {
    setSelectedAdmin(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role_id: roles.length > 0 ? roles[0].id : "",
      status: "1",
      image: null,
    });
    setImagePreview(null);
    setShowPassword(false);
    setRoleMenuOpen(false);
    setModal("create");
  };

  const openEdit = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
      password_confirmation: "",
      role_id: admin.role?.id || "",
      status: admin.status ? "1" : "0",
      image: null,
    });
    setImagePreview(admin.image);
    setShowPassword(false);
    setRoleMenuOpen(false);
    setModal("edit");
  };

  const openDelete = (admin) => {
    setSelectedAdmin(admin);
    setModal("delete");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleStatus = async (admin) => {
    try {
      const formDataUpdate = new FormData();
      formDataUpdate.append("_method", "PUT");
      formDataUpdate.append("name", admin.name);
      formDataUpdate.append("email", admin.email);
      formDataUpdate.append("role_id", admin.role?.id);
      formDataUpdate.append("status", admin.status ? "0" : "1");

      await dispatch(
        toggleAdminStatus({ id: admin.id, formData: formDataUpdate })
      ).unwrap();
      toast.success(t(getActionMessageKey("update")));
      refreshAdmins();
    } catch (err) {
      toast.error(err || t("error_generic"));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.role_id) {
      toast.error(t("select_role"));
      return;
    }
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      });

      await dispatch(createAdmin(data)).unwrap();
      toast.success(t(getActionMessageKey("add")));
      closeModal();
      refreshAdmins();
    } catch (err) {
      toast.error(err || t(getActionMessageKey("add", "error")));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.role_id) {
      toast.error(t("select_role"));
      return;
    }
    setSaving(true);
    try {
      const data = new FormData();
      data.append("_method", "PUT");
      Object.keys(formData).forEach((key) => {
        if (
          (key === "password" || key === "password_confirmation") &&
          !formData[key]
        ) {
          return;
        }
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      await dispatch(
        updateAdmin({ id: selectedAdmin.id, formData: data })
      ).unwrap();
      toast.success(t(getActionMessageKey("update")));
      closeModal();
      refreshAdmins();
    } catch (err) {
      toast.error(err || t(getActionMessageKey("update", "error")));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await dispatch(deleteAdmin(selectedAdmin.id)).unwrap();
      toast.success(t(getActionMessageKey("delete")));
      closeModal();
      refreshAdmins();
    } catch (err) {
      toast.error(err || t(getActionMessageKey("delete", "error")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page} dir={isAr ? "rtl" : "ltr"}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t("admins_manager")}</h1>
        <p className={styles.pageSubtitle}>{t("admins_page.subtitle")}</p>
      </header>

      <SectionCard
        icon={MdPeople}
        title={t("admins_page.list_title")}
        description={t("admins_page.list_desc", { count: admins.length })}
        actions={
          can("admins.create") ? (
            <button
              type="button"
              className={styles.addBtn}
              onClick={openCreate}
            >
              <MdAdd size={18} />
              {t("add_admin")}
            </button>
          ) : null
        }
      >
        {loading ? (
          <CardGridSkeleton count={4} />
        ) : admins.length === 0 ? (
          <div className={styles.emptyState}>
            <MdPeople size={32} />
            <p>{t("no_admins")}</p>
          </div>
        ) : (
          <div className={styles.adminsGrid}>
            {admins.map((admin, index) => (
              <article
                key={admin.id}
                className={`${styles.adminCard} ${
                  !admin.status ? styles.adminCardInactive : ""
                }`}
              >
                <div className={styles.adminTop}>
                  <div className={styles.adminIdentity}>
                    <div className={styles.avatarRing}>
                      {admin.image ? (
                        <img
                          src={admin.image}
                          alt={admin.name}
                          className={styles.avatarImg}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className={styles.avatarFallback}>
                          <MdPerson size={22} />
                        </div>
                      )}
                    </div>
                    <div className={styles.adminNames}>
                      <h3 className={styles.adminName}>{admin.name}</h3>
                      <p className={styles.adminEmail}>
                        <MdEmail size={13} />
                        <span>{admin.email}</span>
                      </p>
                    </div>
                  </div>
                  <span className={styles.indexBadge}>{index + 1}</span>
                </div>

                <div className={styles.adminBadges}>
                  <span className={styles.roleTag}>
                    {getRoleName(admin.role)}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${
                      admin.status
                        ? styles.statusActive
                        : styles.statusInactive
                    }`}
                  >
                    {admin.status ? t("active") : t("inactive")}
                  </span>
                </div>

                <div className={styles.adminMeta}>
                  <div className={styles.adminActions}>
                    {can("admins.update") && (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => openEdit(admin)}
                        title={t("edit")}
                        aria-label={t("edit")}
                      >
                        <MdEdit size={15} />
                      </button>
                    )}
                    {can("admins.update") && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${
                          admin.status
                            ? styles.actionStatusOn
                            : styles.actionStatusOff
                        }`}
                        onClick={() => toggleStatus(admin)}
                        title={t("toggle_status")}
                        aria-label={t("toggle_status")}
                      >
                        <MdVerifiedUser size={15} />
                      </button>
                    )}
                    {can("admins.delete") && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionDelete}`}
                        onClick={() => openDelete(admin)}
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

      {(modal === "create" || modal === "edit") && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={`${styles.modalContent} ${styles.modalForm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modal === "edit" ? t("edit_admin") : t("add_admin")}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={closeModal}
                aria-label={t("cancel")}
              >
                <MdClose size={20} />
              </button>
            </div>

            <form
              onSubmit={modal === "edit" ? handleUpdate : handleCreate}
              className={styles.form}
            >
              <div className={styles.modalBody}>
                <div
                  className={styles.imageUpload}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={styles.uploadPreview}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <MdCloudUpload size={28} />
                      <span>{t("click_to_upload")}</span>
                    </div>
                  )}
                  <div className={styles.uploadIcon}>
                    <MdAdd size={16} />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className={styles.hiddenInput}
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("admin_name")}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("admin_email")}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("admin_password")}</label>
                  <div className={styles.passwordGroup}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={styles.input}
                      required={modal === "create"}
                    />
                    <button
                      type="button"
                      className={styles.togglePass}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <MdVisibilityOff size={18} />
                      ) : (
                        <MdVisibility size={18} />
                      )}
                    </button>
                  </div>
                  {modal === "edit" && (
                    <p className={styles.helpText}>{t("password_help")}</p>
                  )}
                </div>

                {(modal === "create" || formData.password) && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      {t("profile.password_confirmation")}
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("admin_role")}</label>
                  <div className={styles.roleSelect} ref={roleSelectRef}>
                    <button
                      type="button"
                      className={`${styles.roleSelectTrigger} ${
                        roleMenuOpen ? styles.roleSelectOpen : ""
                      } ${!selectedRole ? styles.roleSelectPlaceholder : ""}`}
                      onClick={() => setRoleMenuOpen((prev) => !prev)}
                      aria-haspopup="listbox"
                      aria-expanded={roleMenuOpen}
                    >
                      <span className={styles.roleSelectValue}>
                        <span className={styles.roleSelectIcon}>
                          <MdShield size={16} />
                        </span>
                        <span>
                          {selectedRole
                            ? getRoleName(selectedRole)
                            : t("select_role")}
                        </span>
                      </span>
                      <MdKeyboardArrowDown
                        size={20}
                        className={`${styles.roleSelectChevron} ${
                          roleMenuOpen ? styles.roleSelectChevronOpen : ""
                        }`}
                      />
                    </button>

                    {roleMenuOpen && (
                      <div className={styles.roleSelectMenu} role="listbox">
                        {roles.length === 0 ? (
                          <div className={styles.roleSelectEmpty}>
                            {t("no_roles")}
                          </div>
                        ) : (
                          roles.map((role) => {
                            const isSelected =
                              String(role.id) === String(formData.role_id);
                            return (
                              <button
                                key={role.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                className={`${styles.roleSelectOption} ${
                                  isSelected
                                    ? styles.roleSelectOptionActive
                                    : ""
                                }`}
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    role_id: role.id,
                                  }));
                                  setRoleMenuOpen(false);
                                }}
                              >
                                <span className={styles.roleSelectOptionMain}>
                                  <span className={styles.roleSelectIcon}>
                                    <MdShield size={15} />
                                  </span>
                                  <span className={styles.roleSelectOptionText}>
                                    <span className={styles.roleSelectOptionName}>
                                      {getRoleName(role)}
                                    </span>
                                    {(isAr ? role.name_en : role.name_ar) && (
                                      <span className={styles.roleSelectOptionSub}>
                                        {isAr ? role.name_en : role.name_ar}
                                      </span>
                                    )}
                                  </span>
                                </span>
                                {isSelected && (
                                  <MdCheck
                                    size={16}
                                    className={styles.roleSelectCheck}
                                  />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("admin_status")}</label>
                  <button
                    type="button"
                    className={`${styles.statusSwitch} ${
                      formData.status === "1"
                        ? styles.statusSwitchOn
                        : styles.statusSwitchOff
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        status: prev.status === "1" ? "0" : "1",
                      }))
                    }
                    aria-pressed={formData.status === "1"}
                  >
                    <div className={styles.statusSwitchInfo}>
                      <span className={styles.statusSwitchIcon}>
                        <MdVerifiedUser size={16} />
                      </span>
                      <div className={styles.statusSwitchText}>
                        <span className={styles.statusSwitchTitle}>
                          {formData.status === "1"
                            ? t("active")
                            : t("inactive")}
                        </span>
                        <span className={styles.statusSwitchHint}>
                          {formData.status === "1"
                            ? t("admins_page.status_active_hint")
                            : t("admins_page.status_inactive_hint")}
                        </span>
                      </div>
                    </div>
                    <span className={styles.switchTrack} aria-hidden="true">
                      <span className={styles.switchThumb} />
                    </span>
                  </button>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={styles.cancelBtn}
                  disabled={saving}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={saving}
                >
                  <MdSave size={16} />
                  {saving ? t("saving") : t("save_changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "delete" && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={`${styles.modalContent} ${styles.modalNarrow}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={`${styles.modalTitle} ${styles.modalTitleDanger}`}>
                {t("delete_admin")}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={closeModal}
                aria-label={t("cancel")}
              >
                <MdClose size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteConfirm}>
                <p>
                  {t("delete_admin_confirm")}{" "}
                  <strong>{selectedAdmin?.name}</strong>?
                </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={closeModal}
                className={styles.cancelBtn}
                disabled={saving}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={handleDelete}
                disabled={saving}
              >
                <MdDelete size={16} />
                {saving ? t("deleting") : t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsManager;
