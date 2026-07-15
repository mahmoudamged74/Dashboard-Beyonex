import React from 'react';
import { useTranslation } from 'react-i18next';
import { ToastContainer, Slide } from 'react-toastify';
import { getAppLanguage } from '../../i18n';
import ToastIcon from './ToastIcon';

const AppToastContainer = () => {
  const { i18n } = useTranslation();
  const isAr = getAppLanguage(i18n.language) === 'ar';

  return (
    <ToastContainer
      position="top-right"
      autoClose={3200}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={isAr}
      pauseOnFocusLoss
      draggable
      draggablePercent={40}
      pauseOnHover
      theme="dark"
      limit={3}
      stacked
      transition={Slide}
      icon={({ type }) => <ToastIcon type={type} />}
      toastClassName="app-toast"
      bodyClassName="app-toast-body"
      progressClassName="app-toast-progress"
    />
  );
};

export default AppToastContainer;
