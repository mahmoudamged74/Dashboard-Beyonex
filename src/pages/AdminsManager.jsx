import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MdEdit, 
  MdDelete, 
  MdAdd, 
  MdClose, 
  MdSave, 
  MdPerson, 
  MdEmail, 
  MdLock, 
  MdVisibility, 
  MdVisibilityOff, 
  MdCloudUpload,
  MdCheckCircle,
  MdCancel
} from 'react-icons/md';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import styles from './ContentManager.module.css';
import adminStyles from './AdminsManager.module.css';

const AdminsManager = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const fileInputRef = useRef(null);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    status: '1',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [adminsRes, rolesRes] = await Promise.all([
        axiosInstance.get('admin/admins'),
        axiosInstance.get('admin/roles'),
      ]);
      setAdmins(adminsRes.data.data.admins || []);
      setRoles(rolesRes.data.data.items || []);
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
    setSelectedAdmin(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role_id: roles.length > 0 ? roles[0].id : '',
      status: '1',
      image: null,
    });
    setImagePreview(null);
    setShowPassword(false);
    setModal('create');
  };

  const openEdit = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name || '',
      email: admin.email || '',
      password: '',
      password_confirmation: '',
      role_id: admin.role?.id || '',
      status: admin.status ? '1' : '0',
      image: null,
    });
    setImagePreview(admin.image);
    setShowPassword(false);
    setModal('edit');
  };

  const openDelete = (admin) => {
    setSelectedAdmin(admin);
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelectedAdmin(null);
    setSaving(false);
    setImagePreview(null);
  };

  // ── Form change ────────────────────────────────────────────────────────────
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
      // Create form data for partial update if API supports it, 
      // but usually status flip is a PUT with limited fields.
      // Based on user provided PUT, it takes many fields.
      const formDataUpdate = new FormData();
      formDataUpdate.append('_method', 'PUT'); // For spoofing PUT in multipart
      formDataUpdate.append('name', admin.name);
      formDataUpdate.append('email', admin.email);
      formDataUpdate.append('role_id', admin.role?.id);
      formDataUpdate.append('status', admin.status ? '0' : '1');
      
      const res = await axiosInstance.post(`admin/admins/${admin.id}`, formDataUpdate);
      toast.success(res.data.message);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_generic'));
    }
  };

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      const res = await axiosInstance.post('admin/admins', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
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
      const data = new FormData();
      data.append('_method', 'PUT'); // Typical Laravel pattern for multipart PUT
      Object.keys(formData).forEach(key => {
        // Only append password if it's provided
        if ((key === 'password' || key === 'password_confirmation') && !formData[key]) {
          return;
        }
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      const res = await axiosInstance.post(`admin/admins/${selectedAdmin.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
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
      const res = await axiosInstance.delete(`admin/admins/${selectedAdmin.id}`);
      toast.success(res.data.message);
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_generic'));
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className="fade-in">
        <div className={styles.header}>
          <h2 className={styles.title}>{t('admins_manager')}</h2>
          <button className="btn-primary" onClick={openCreate}>
            <MdAdd />
            {t('add_admin')}
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
                  <th>{t('image')}</th>
                  <th>{t('admin_name')}</th>
                  <th>{t('admin_email')}</th>
                  <th>{t('admin_role')}</th>
                  <th>{t('admin_status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      {t('no_admins')}
                    </td>
                  </tr>
                ) : (
                  admins.map((admin, idx) => (
                    <tr key={admin.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <img 
                          src={admin.image || '/assets/default-avatar.png'} 
                          alt={admin.name} 
                          className={adminStyles.adminImage} 
                        />
                      </td>
                      <td>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>
                        <span className={adminStyles.roleTag}>
                           {admin.role?.name || (isAr ? admin.role?.name_ar : admin.role?.name_en) || '—'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`${adminStyles.statusBtn} ${admin.status ? adminStyles.statusActive : adminStyles.statusInactive}`}
                          onClick={() => toggleStatus(admin)}
                          title={admin.status ? t('active') : t('inactive')}
                        >
                          {admin.status ? <MdCheckCircle /> : <MdCancel />}
                        </button>
                      </td>
                      <td>
                        <button
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          title={t('edit')}
                          onClick={() => openEdit(admin)}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title={t('delete')}
                          onClick={() => openDelete(admin)}
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

      {(modal === 'create' || modal === 'edit') && (
        <div className={styles.modalOverlay} onClick={closeModal} style={{ zIndex: 9999 }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modal === 'edit' ? t('edit_admin') : t('add_admin')}
              </h3>
              <button className={styles.closeBtn} onClick={closeModal}><MdClose /></button>
            </div>

            <form onSubmit={modal === 'edit' ? handleUpdate : handleCreate}>
              <div className={styles.modalBody}>
                {/* Profile Image Upload */}
                <div 
                  className={adminStyles.imageUpload} 
                  onClick={() => fileInputRef.current.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className={adminStyles.uploadPreview} />
                  ) : (
                    <div className={adminStyles.uploadPlaceholder}>
                      <MdCloudUpload size={30} />
                      <span style={{ fontSize: '0.7rem' }}>{t('click_to_upload')}</span>
                    </div>
                  )}
                  <div className={adminStyles.uploadIcon}><MdAdd /></div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className={adminStyles.hiddenInput} 
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </div>

                {/* Name */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('admin_name')}</label>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('admin_email')}</label>
                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('admin_password')}</label>
                  <div className={`${styles.inputGroup} ${adminStyles.passwordGroup}`}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={styles.input}
                      required={modal === 'create'}
                    />
                    <button 
                      type="button" 
                      className={adminStyles.togglePass}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>
                  </div>
                  {modal === 'edit' && (
                    <p className={adminStyles.helpText}>{t('password_help')}</p>
                  )}
                </div>

                {/* Confirm Password (only for create/update with pass) */}
                {(modal === 'create' || formData.password) && (
                   <div className={styles.formGroup}>
                   <label className={styles.label}>{t('profile.password_confirmation')}</label>
                   <div className={styles.inputGroup}>
                     <input
                       type={showPassword ? 'text' : 'password'}
                       name="password_confirmation"
                       value={formData.password_confirmation}
                       onChange={handleChange}
                       className={styles.input}
                       required
                     />
                   </div>
                 </div>
                )}

                {/* Role Select */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('admin_role')}</label>
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  >
                    <option value="">{t('select_role') || 'Select Role'}</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{isAr ? role.name_ar : role.name_en}</option>
                    ))}
                  </select>
                </div>

                {/* Status Toggle */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('admin_status')}</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={styles.input}
                  >
                    <option value="1">{t('active')}</option>
                    <option value="0">{t('inactive')}</option>
                  </select>
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
      )}

      {modal === 'delete' && (
        <div className={styles.modalOverlay} onClick={closeModal} style={{ zIndex: 9999 }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle} style={{ color: '#ff4d4d' }}>
                {t('delete_admin')}
              </h3>
              <button className={styles.closeBtn} onClick={closeModal}><MdClose /></button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {t('delete_admin_confirm')}{' '}
                <strong style={{ color: 'var(--text-main)' }}>
                  {selectedAdmin?.name}
                </strong>?
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
                {saving ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsManager;
