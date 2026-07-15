import React from 'react';
import {
  MdCheckCircle,
  MdError,
  MdInfo,
  MdWarning,
  MdMarkEmailUnread,
} from 'react-icons/md';
import styles from './ToastIcon.module.css';

const ICONS = {
  success: MdCheckCircle,
  error: MdError,
  info: MdInfo,
  warning: MdWarning,
  default: MdInfo,
};

const VARIANTS = {
  success: styles.success,
  error: styles.error,
  info: styles.info,
  warning: styles.warning,
  default: styles.default,
};

const ToastIcon = ({ type = 'default' }) => {
  const Icon = ICONS[type] || ICONS.default;
  const variant = VARIANTS[type] || VARIANTS.default;

  return (
    <span className={`${styles.iconWrap} ${variant}`} aria-hidden="true">
      <Icon size={18} />
    </span>
  );
};

export const InboxToastIcon = () => (
  <span className={`${styles.iconWrap} ${styles.inbox}`} aria-hidden="true">
    <MdMarkEmailUnread size={18} />
  </span>
);

export default ToastIcon;
