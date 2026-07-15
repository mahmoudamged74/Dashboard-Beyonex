import React from 'react';
import { toast as toastify } from 'react-toastify';
import { InboxToastIcon } from '../components/Toast/ToastIcon';

const TYPE_CLASS = {
  success: 'app-toast app-toast--success',
  error: 'app-toast app-toast--error',
  info: 'app-toast app-toast--info',
  warning: 'app-toast app-toast--warning',
  default: 'app-toast',
};

const ACTION_MESSAGE_KEYS = {
  success: {
    add: 'add_success',
    create: 'add_success',
    edit: 'edit_success',
    update: 'update_success',
    delete: 'delete_success',
    save: 'save_success',
  },
  error: {
    add: 'add_error',
    create: 'add_error',
    edit: 'edit_error',
    update: 'update_error',
    delete: 'delete_error',
    save: 'save_error',
  },
};

/** i18n key for standard action toasts (add / edit / delete / save). */
export const getActionMessageKey = (action, outcome = 'success') => {
  const normalized = String(action || 'save').toLowerCase();
  const bucket = ACTION_MESSAGE_KEYS[outcome] || ACTION_MESSAGE_KEYS.success;
  return bucket[normalized] || bucket.save;
};

const withTypeClass = (type, options = {}) => ({
  className: TYPE_CLASS[type] || TYPE_CLASS.default,
  ...options,
});

/**
 * App toast API — consistent styling across the dashboard.
 */
const toast = {
  success: (message, options) =>
    toastify.success(message, withTypeClass('success', options)),

  error: (message, options) =>
    toastify.error(message, withTypeClass('error', options)),

  info: (message, options) =>
    toastify.info(message, withTypeClass('info', options)),

  warning: (message, options) =>
    toastify.warning(message, withTypeClass('warning', options)),

  /** Rich inbox notification (new messages). */
  inbox: (content, options = {}) =>
    toastify(content, {
      className: 'app-toast app-toast--inbox',
      autoClose: 5000,
      icon: React.createElement(InboxToastIcon),
      ...options,
    }),
};

export default toast;
