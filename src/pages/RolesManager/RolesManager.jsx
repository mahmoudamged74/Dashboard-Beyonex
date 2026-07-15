import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  MdEdit,
  MdDelete,
  MdAdd,
  MdClose,
  MdSave,
  MdShield,
  MdSecurity,
  MdCalendarToday,
} from "react-icons/md";
import toast, { getActionMessageKey } from "../../utils/toast";
import { useAppDispatch, useAppSelector, usePermission, useAppReady } from "../../hooks";
import {
  fetchRoles,
  fetchRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../../redux/actions/rolesActions";
import { selectRoles } from "../../redux/reducers/rolesReducer";
import { REQUEST_STATUS } from "../../redux/types";
import { CardGridSkeleton } from "../../components/Loading";
import { getAppLanguage } from "../../i18n";
import styles from "./RolesManager.module.css";

const getGroupKey = (key) => key.split(".")[0];

const groupPermissions = (permissions) => {
  const groups = {};
  permissions.forEach((perm) => {
    const group = getGroupKey(perm.key);
    if (!groups[group]) groups[group] = [];
    groups[group].push(perm);
  });
  return groups;
};

const getGroupLabel = (groupKey, t, permissionGroups, isAr) => {
  const translated = t(`profile.perm_modules.${groupKey}`, {
    defaultValue: "",
  });
  if (translated) return translated;

  const perms = permissionGroups?.[groupKey] || [];
  if (perms.length === 0) return groupKey;
  const nameParts = (isAr ? perms[0].name_ar : perms[0].name_en).split(" ");
  return nameParts.slice(1).join(" ") || groupKey;
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

const PermissionSelector = ({
  permissionGroups,
  formData,
  togglePerm,
  toggleGroup,
  isAr,
  actionMeta,
  t,
}) => (
  <div className={styles.permGrid}>
    {Object.entries(permissionGroups).map(([groupKey, groupPerms]) => {
      const groupKeys = groupPerms.map((p) => p.key);
      const allChecked = groupKeys.every((k) =>
        formData.permissions.includes(k)
      );
      const someChecked = groupKeys.some((k) =>
        formData.permissions.includes(k)
      );

      return (
        <div
          key={groupKey}
          className={`${styles.permCard} ${
            allChecked
              ? styles.permChecked
              : someChecked
                ? styles.permPartial
                : ""
          }`}
        >
          <div
            className={styles.permCardHeader}
            onClick={() => toggleGroup(groupKey)}
          >
            <span className={styles.permIcon}>
              <MdShield size={14} />
            </span>
            <span className={styles.permLabel}>
              {getGroupLabel(groupKey, t, permissionGroups, isAr)}
            </span>
            <span
              className={`${styles.permCheckbox} ${
                allChecked
                  ? styles.permCheckboxOn
                  : someChecked
                    ? styles.permCheckboxPartial
                    : ""
              }`}
            >
              {allChecked ? "✓" : someChecked ? "−" : ""}
            </span>
          </div>

          <div className={styles.permInnerList}>
            {groupPerms.map((perm) => {
              const action = perm.key.split(".")[1];
              const meta = actionMeta[action] || {
                color: "var(--text-muted-gray)",
              };
              const isChecked = formData.permissions.includes(perm.key);

              return (
                <div
                  key={perm.key}
                  className={`${styles.permInnerRow} ${
                    isChecked ? styles.permInnerRowOn : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePerm(perm.key);
                  }}
                >
                  <div
                    className={`${styles.permInnerCheck} ${
                      isChecked ? styles.permInnerCheckOn : ""
                    }`}
                    style={
                      isChecked
                        ? { background: meta.color, borderColor: meta.color }
                        : {}
                    }
                  >
                    {isChecked && "✓"}
                  </div>
                  <span
                    className={styles.permInnerText}
                    style={{ color: isChecked ? meta.color : undefined }}
                  >
                    {isAr ? perm.name_ar : perm.name_en}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);

const RoleFormModal = ({
  isEdit,
  closeModal,
  formData,
  handleChange,
  handleSubmit,
  saving,
  t,
  permissionGroups,
  togglePerm,
  toggleGroup,
  isAr,
  actionMeta,
}) => (
  <div className={styles.modalOverlay} onClick={closeModal}>
    <div
      className={`${styles.modalContent} ${styles.modalWide}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>
          {isEdit ? t("edit_role") : t("add_role")}
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

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.modalBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {t("role_name")} ({isAr ? "إنجليزي" : "EN"})
              </label>
              <input
                type="text"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
                className={styles.input}
                required
                autoFocus
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {t("role_name")} ({isAr ? "عربي" : "AR"})
              </label>
              <input
                type="text"
                name="name_ar"
                value={formData.name_ar}
                onChange={handleChange}
                className={styles.input}
                dir="rtl"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {t("permissions")}
              {formData.permissions.length > 0 && (
                <span className={styles.selectedCount}>
                  {" "}
                  ({formData.permissions.length} {t("selected")})
                </span>
              )}
            </label>
            <PermissionSelector
              permissionGroups={permissionGroups}
              formData={formData}
              togglePerm={togglePerm}
              toggleGroup={toggleGroup}
              isAr={isAr}
              actionMeta={actionMeta}
              t={t}
            />
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
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            <MdSave size={16} />
            {saving ? t("saving") : t("save_changes")}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const DeleteModal = ({
  closeModal,
  selectedRole,
  isAr,
  handleDelete,
  saving,
  t,
}) => (
  <div className={styles.modalOverlay} onClick={closeModal}>
    <div
      className={`${styles.modalContent} ${styles.modalNarrow}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.modalHeader}>
        <h3 className={`${styles.modalTitle} ${styles.modalTitleDanger}`}>
          {t("delete_role")}
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
            {t("delete_role_confirm")}{" "}
            <strong>
              {isAr ? selectedRole?.name_ar : selectedRole?.name_en}
            </strong>
            ?
          </p>
          <p className={styles.deleteWarning}>{t("delete_role_warning")}</p>
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
          {saving ? t("saving") : t("delete")}
        </button>
      </div>
    </div>
  </div>
);

const RolesManager = () => {
  const { t, i18n } = useTranslation();
  const { can } = usePermission();
  const dispatch = useAppDispatch();
  const isAr = getAppLanguage(i18n.language) === "ar";

  useAppReady();

  const { data, status } = useAppSelector(selectRoles);
  const roles = data?.roles || [];
  const allPermissions = data?.permissions || [];
  const loading = status === REQUEST_STATUS.LOADING && roles.length === 0;

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const permissionGroups = groupPermissions(allPermissions);

  const [modal, setModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    permissions: [],
  });

  const refreshRoles = () => dispatch(fetchRoles({ force: true }));

  const closeModal = () => {
    setModal(null);
    setSelectedRole(null);
    setSaving(false);
  };

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    if (modal) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [modal]);

  const openCreate = () => {
    setSelectedRole(null);
    setFormData({ name_ar: "", name_en: "", permissions: [] });
    setModal("create");
  };

  const openEdit = async (role) => {
    try {
      const roleData = await dispatch(fetchRoleById(role.id)).unwrap();
      setSelectedRole(roleData);

      const expandedKeys = (roleData.permissions || []).map((p) =>
        typeof p === "object" ? p.key : p
      );

      setFormData({
        name_ar: roleData.name_ar || "",
        name_en: roleData.name_en || "",
        permissions: expandedKeys,
      });
      setModal("edit");
    } catch (err) {
      toast.error(err || t("error_generic"));
    }
  };

  const openDelete = (role) => {
    setSelectedRole(role);
    setModal("delete");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePerm = (key) => {
    setFormData((prev) => {
      const has = prev.permissions.includes(key);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== key)
          : [...prev.permissions, key],
      };
    });
  };

  const toggleGroup = (groupKey) => {
    const groupKeys = (permissionGroups[groupKey] || []).map((p) => p.key);
    setFormData((prev) => {
      const allSelected = groupKeys.every((k) => prev.permissions.includes(k));
      return {
        ...prev,
        permissions: allSelected
          ? prev.permissions.filter((p) => !groupKeys.includes(p))
          : [...new Set([...prev.permissions, ...groupKeys])],
      };
    });
  };

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await dispatch(createRole(formData)).unwrap();
      toast.success(t(getActionMessageKey("add")));
      closeModal();
      refreshRoles();
    } catch (err) {
      toast.error(err || t(getActionMessageKey("add", "error")));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await dispatch(
        updateRole({ id: selectedRole.id, formData })
      ).unwrap();
      toast.success(t(getActionMessageKey("update")));
      closeModal();
      refreshRoles();
    } catch (err) {
      toast.error(err || t(getActionMessageKey("update", "error")));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await dispatch(deleteRole(selectedRole.id)).unwrap();
      toast.success(t(getActionMessageKey("delete")));
      closeModal();
      refreshRoles();
    } catch (err) {
      toast.error(err || t(getActionMessageKey("delete", "error")));
    } finally {
      setSaving(false);
    }
  };

  const actionMeta = {
    view: {
      color: "#60a5fa",
      label: isAr ? "عرض" : "View",
    },
    create: {
      color: "#4ade80",
      label: isAr ? "إضافة" : "Create",
    },
    update: {
      color: "#facc15",
      label: isAr ? "تعديل" : "Update",
    },
    delete: {
      color: "#f87171",
      label: isAr ? "حذف" : "Delete",
    },
  };

  const getPermissionGroupsPreview = (permissions = []) => {
    const groups = [
      ...new Set(
        permissions.map((perm) =>
          perm?.key ? getGroupKey(perm.key) : String(perm)
        )
      ),
    ];
    return groups;
  };

  return (
    <div className={styles.page} dir={isAr ? "rtl" : "ltr"}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t("roles_manager")}</h1>
        <p className={styles.pageSubtitle}>{t("roles_page.subtitle")}</p>
      </header>

      <SectionCard
        icon={MdSecurity}
        title={t("roles_page.list_title")}
        description={t("roles_page.list_desc", { count: roles.length })}
        actions={
          can("roles.create") ? (
            <button
              type="button"
              className={styles.addBtn}
              onClick={openCreate}
            >
              <MdAdd size={18} />
              {t("add_role")}
            </button>
          ) : null
        }
      >
        {loading ? (
          <CardGridSkeleton count={4} />
        ) : roles.length === 0 ? (
          <div className={styles.emptyState}>
            <MdSecurity size={32} />
            <p>{t("no_roles")}</p>
          </div>
        ) : (
          <div className={styles.rolesGrid}>
            {roles.map((role, index) => {
              const groups = getPermissionGroupsPreview(role.permissions);
              const permCount = role.permissions?.length || 0;

              return (
                <article key={role.id} className={styles.roleCard}>
                  <div className={styles.roleTop}>
                    <div className={styles.roleIdentity}>
                      <div className={styles.roleIconWrap}>
                        <MdShield size={22} />
                      </div>
                      <div className={styles.roleNames}>
                        <h3 className={styles.roleTitle}>
                          {isAr ? role.name_ar : role.name_en}
                        </h3>
                        <p className={styles.roleSubtitle}>
                          {isAr ? role.name_en : role.name_ar}
                        </p>
                      </div>
                    </div>
                    <span className={styles.indexBadge}>{index + 1}</span>
                  </div>

                  <div className={styles.permMeta}>
                    <span className={styles.permCountBadge}>
                      {t("roles_page.perm_count", { count: permCount })}
                    </span>
                  </div>

                  <div className={styles.permTags}>
                    {groups.slice(0, 4).map((group) => (
                      <span key={group} className={styles.permTag}>
                        {getGroupLabel(group, t, permissionGroups, isAr)}
                      </span>
                    ))}
                    {groups.length > 4 && (
                      <span className={styles.permTagMore}>
                        +{groups.length - 4}
                      </span>
                    )}
                    {groups.length === 0 && (
                      <span className={styles.permTagMuted}>
                        {t("roles_page.no_permissions")}
                      </span>
                    )}
                  </div>

                  <div className={styles.roleMeta}>
                    <span className={styles.dateBadge}>
                      <MdCalendarToday size={13} />
                      {role.created_at?.split(" ")[0] || "—"}
                    </span>

                    <div className={styles.roleActions}>
                      {can("roles.update") && (
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => openEdit(role)}
                          title={t("edit")}
                          aria-label={t("edit")}
                        >
                          <MdEdit size={15} />
                        </button>
                      )}
                      {can("roles.delete") && (
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionDelete}`}
                          onClick={() => openDelete(role)}
                          title={t("delete")}
                          aria-label={t("delete")}
                        >
                          <MdDelete size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>

      {modal === "create" && (
        <RoleFormModal
          isEdit={false}
          closeModal={closeModal}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleCreate}
          saving={saving}
          t={t}
          permissionGroups={permissionGroups}
          togglePerm={togglePerm}
          toggleGroup={toggleGroup}
          isAr={isAr}
          actionMeta={actionMeta}
        />
      )}
      {modal === "edit" && (
        <RoleFormModal
          isEdit={true}
          closeModal={closeModal}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleUpdate}
          saving={saving}
          t={t}
          permissionGroups={permissionGroups}
          togglePerm={togglePerm}
          toggleGroup={toggleGroup}
          isAr={isAr}
          actionMeta={actionMeta}
        />
      )}
      {modal === "delete" && (
        <DeleteModal
          closeModal={closeModal}
          selectedRole={selectedRole}
          isAr={isAr}
          handleDelete={handleDelete}
          saving={saving}
          t={t}
        />
      )}
    </div>
  );
};

export default RolesManager;
