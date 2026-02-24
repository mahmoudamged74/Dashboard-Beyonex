import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdEdit, MdDelete, MdAdd, MdClose, MdSave, MdShield } from 'react-icons/md';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import styles from './ContentManager.module.css';
import roleStyles from './RolesManager.module.css';

// ── Helpers ──────────────────────────────────────────────────────────────────
// The API accepts permission group prefixes like "roles", "admins", etc.
// We derive these by splitting "roles.view" → "roles"
const getGroupKey = (key) => key.split('.')[0];

const groupPermissions = (permissions) => {
  const groups = {};
  permissions.forEach((perm) => {
    const group = getGroupKey(perm.key);
    if (!groups[group]) groups[group] = [];
    groups[group].push(perm);
  });
  return groups;
};

// ── Component ─────────────────────────────────────────────────────────────────
const RolesManager = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  // ── Data state ─────────────────────────────────────────────────────────────
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [permissionGroups, setPermissionGroups] = useState({});
  const [loading, setLoading] = useState(true);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selectedRole, setSelectedRole] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    permissions: [], // array of group strings e.g. ["roles", "admins"]
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        axiosInstance.get('admin/roles'),
        axiosInstance.get('admin/roles/permissions'),
      ]);
      setRoles(rolesRes.data.data.items || []);
      const perms = permsRes.data.data || [];
      setAllPermissions(perms);
      setPermissionGroups(groupPermissions(perms));
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── ESC to close ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') closeModal(); };
    if (modal) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [modal]);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setSelectedRole(null);
    setFormData({ name_ar: '', name_en: '', permissions: [] });
    setModal('create');
  };

  const openEdit = async (role) => {
    try {
      const res = await axiosInstance.get(`admin/roles/${role.id}`);
      const data = res.data.data;
      setSelectedRole(data);

      // Extract permission keys. The API returns an array of objects: { key, name_ar, name_en }
      const expandedKeys = (data.permissions || []).map(p => (typeof p === 'object' ? p.key : p));

      setFormData({
        name_ar: data.name_ar || '',
        name_en: data.name_en || '',
        permissions: expandedKeys,
      });
      setModal('edit');
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_generic'));
    }
  };

  const openDelete = (role) => {
    setSelectedRole(role);
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelectedRole(null);
    setSaving(false);
  };

  // ── Form change ────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle a single individual permission key
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

  // Toggle ALL permissions in a group (select-all / deselect-all for that group)
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

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axiosInstance.post('admin/roles', formData);
      toast.success(res.data.message);
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_generic'));
    } finally {
      setSaving(false);
    }
  };

  // ── Update ─────────────────────────────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axiosInstance.put(`admin/roles/${selectedRole.id}`, formData);
      toast.success(res.data.message);
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_generic'));
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await axiosInstance.delete(`admin/roles/${selectedRole.id}`);
      toast.success(res.data.message);
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_generic'));
    } finally {
      setSaving(false);
    }
  };

  // ── Permission group label ─────────────────────────────────────────────────
  // Use the first permission in the group to derive a display name
  const getGroupLabel = (groupKey) => {
    const perms = permissionGroups[groupKey] || [];
    if (perms.length === 0) return groupKey;
    // e.g. "View Dashboard" → take after first word = "Dashboard"
    const nameParts = (isAr ? perms[0].name_ar : perms[0].name_en).split(' ');
    return nameParts.slice(1).join(' ') || groupKey;
  };

  // ── Action type colors ─────────────────────────────────────────────────────
  const actionMeta = {
    view:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  label: isAr ? 'عرض'   : 'View'   },
    create: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  label: isAr ? 'إضافة' : 'Create' },
    update: { color: '#facc15', bg: 'rgba(250,204,21,0.12)',  label: isAr ? 'تعديل' : 'Update' },
    delete: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: isAr ? 'حذف'   : 'Delete' },
  };

  // ── Permission Selector (create & edit modal) ─────────────────────────────
  const PermissionSelector = () => (
    <div className={roleStyles.permGrid}>
      {Object.entries(permissionGroups).map(([groupKey, groupPerms]) => {
        const groupKeys = groupPerms.map((p) => p.key);
        const allChecked = groupKeys.every((k) => formData.permissions.includes(k));
        const someChecked = groupKeys.some((k) => formData.permissions.includes(k));
        return (
          <div key={groupKey} className={`${roleStyles.permCard} ${allChecked ? roleStyles.permChecked : someChecked ? roleStyles.permPartial : ''}`}>
            {/* Group header — click = select all/none in group */}
            <div className={roleStyles.permCardHeader} onClick={() => toggleGroup(groupKey)}>
              <span className={roleStyles.permIcon}><MdShield size={14} /></span>
              <span className={roleStyles.permLabel}>{getGroupLabel(groupKey)}</span>
              <span className={`${roleStyles.permCheckbox} ${allChecked ? roleStyles.permCheckboxOn : someChecked ? roleStyles.permCheckboxPartial : ''}`}>
                {allChecked ? '✓' : someChecked ? '−' : ''}
              </span>
            </div>

            {/* Individual permission checkboxes */}
            <div className={roleStyles.permInnerList}>
              {groupPerms.map((perm) => {
                const action = perm.key.split('.')[1];
                const meta = actionMeta[action] || { color: '#a0a0a0', bg: 'rgba(160,160,160,0.1)' };
                const isChecked = formData.permissions.includes(perm.key);
                return (
                  <div
                    key={perm.key}
                    className={`${roleStyles.permInnerRow} ${isChecked ? roleStyles.permInnerRowOn : ''}`}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      togglePerm(perm.key); 
                    }}
                  >
                    <div
                      className={`${roleStyles.permInnerCheck} ${isChecked ? roleStyles.permInnerCheckOn : ''}`}
                      style={isChecked ? { background: meta.color, borderColor: meta.color } : {}}
                    >
                      {isChecked && '✓'}
                    </div>
                    <span className={roleStyles.permInnerText} style={{ color: isChecked ? meta.color : undefined }}>
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

  // ── Role Form Modal ────────────────────────────────────────────────────────
  const RoleFormModal = ({ isEdit }) => (
    <div className={styles.modalOverlay} onClick={closeModal} style={{ zIndex: 9999 }}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {isEdit ? t('edit_role') || 'Edit Role' : t('add_role') || 'Add Role'}
          </h3>
          <button className={styles.closeBtn} onClick={closeModal}><MdClose /></button>
        </div>

        <form onSubmit={isEdit ? handleUpdate : handleCreate}>
          <div className={styles.modalBody}>
            {/* Name EN */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('role_name')} (EN)</label>
              <input
                type="text"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            {/* Name AR */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('role_name')} (AR)</label>
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

            {/* Permissions */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {t('permissions') || 'Permissions'}
                {formData.permissions.length > 0 && (
                  <span className={roleStyles.selectedCount}>
                    {' '}({formData.permissions.length} {t('selected') || 'selected'})
                  </span>
                )}
              </label>
              <PermissionSelector />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={closeModal} className={styles.btnCancel}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              <MdSave />
              {saving ? t('saving') : t('save_changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ── Delete Confirm Modal ───────────────────────────────────────────────────
  const DeleteModal = () => (
    <div className={styles.modalOverlay} onClick={closeModal} style={{ zIndex: 9999 }}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle} style={{ color: '#ff4d4d' }}>
            {t('delete_role') || 'Delete Role'}
          </h3>
          <button className={styles.closeBtn} onClick={closeModal}><MdClose /></button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {t('delete_role_confirm') || 'Are you sure you want to delete the role'}{' '}
            <strong style={{ color: 'var(--text-main)' }}>
              {isAr ? selectedRole?.name_ar : selectedRole?.name_en}
            </strong>?
          </p>
          <p style={{ color: '#ff4d4d', fontSize: '0.85rem' }}>
            {t('delete_role_warning') || 'This action cannot be undone. Roles linked to admins cannot be deleted.'}
          </p>
        </div>
        <div className={styles.modalFooter}>
          <button type="button" onClick={closeModal} className={styles.btnCancel}>
            {t('cancel')}
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ background: '#ff4d4d', borderColor: '#ff4d4d' }}
            onClick={handleDelete}
            disabled={saving}
          >
            <MdDelete />
            {saving ? t('deleting') || 'Deleting...' : t('delete')}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className="fade-in">
        <div className={styles.header}>
          <h2 className={styles.title}>{t('roles_manager') || 'Roles Manager'}</h2>
          <button className="btn-primary" onClick={openCreate}>
            <MdAdd />
            {t('add_role') || 'Add Role'}
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <span className="spinner" />
          </div>
        ) : (
          <div className={`glass-panel ${styles.tableContainer}`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('role_name')} (EN)</th>
                  <th>{t('role_name')} (AR)</th>
                  <th>{t('permissions') || 'Permissions'}</th>
                  <th>{t('created_at') || 'Created At'}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      {t('no_roles') || 'No roles found'}
                    </td>
                  </tr>
                ) : (
                  roles.map((role, idx) => (
                    <tr key={role.id}>
                      <td>{idx + 1}</td>
                      <td>{role.name_en}</td>
                      <td>{role.name_ar}</td>
                      <td>
                        <div className={roleStyles.permTags}>
                          {role.permissions?.slice(0, 4).map((perm) => (
                            <span key={perm.key || perm} className={roleStyles.permTag}>
                              {perm.key ? getGroupKey(perm.key) : perm}
                            </span>
                          ))}
                          {role.permissions?.length > 4 && (
                            <span className={roleStyles.permTagMore}>
                              +{role.permissions.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {role.created_at?.split(' ')[0] || '—'}
                      </td>
                      <td>
                        <button
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          title={t('edit')}
                          onClick={() => openEdit(role)}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title={t('delete')}
                          onClick={() => openDelete(role)}
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(modal === 'create') && <RoleFormModal isEdit={false} />}
      {(modal === 'edit') && <RoleFormModal isEdit={true} />}
      {(modal === 'delete') && <DeleteModal />}
    </div>
  );
};

export default RolesManager;
