import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "../../utils/toast";
import { MdLanguage, MdEmail, MdLockOutline, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useAppDispatch, useAppReady, useSiteFavicon } from "../../hooks";
import { loginUser } from "../../redux/actions/authActions";
import { normalizeLanguage, toggleAppLanguage } from "../../i18n";
import { getRememberMe, getRememberedEmail } from "../../utils/authStorage";
import styles from "./Login.module.css";

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useAppReady();
  const faviconSrc = useSiteFavicon();

  const isRtl = i18n.dir() === "rtl";
  const lang = normalizeLanguage(i18n.language);

  const [email, setEmail] = useState(() => getRememberedEmail());
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => getRememberMe());
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState(null);

  const errorMessage =
    errorType === "invalid"
      ? t("login.error_invalid_credentials")
      : errorType === "generic"
        ? t("login.error_generic")
        : "";

  const toggleLanguage = () => {
    toggleAppLanguage();
  };

  const resolveLoginErrorType = (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 422) return "invalid";
    return "generic";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorType(null);
    setLoading(true);

    try {
      await dispatch(loginUser({ email, password, rememberMe })).unwrap();
      toast.success(t("login.success"));
      navigate("/");
    } catch (err) {
      const type = resolveLoginErrorType(err);
      setErrorType(type);
      toast.error(
        type === "invalid"
          ? t("login.error_invalid_credentials")
          : t("login.error_generic"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage} dir={isRtl ? "rtl" : "ltr"} lang={lang}>
      <button
        type="button"
        className={styles.langSwitch}
        onClick={toggleLanguage}
        aria-label={t("login.switch_language")}
      >
        <MdLanguage aria-hidden="true" />
        <span>{t("language")}</span>
      </button>

      <div className={styles.bgDecor} aria-hidden="true">
        <div className={styles.bgGrid} />
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgOrb3} />
      </div>
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.card}>
        <div className={styles.cardGlow} aria-hidden="true" />

        <header className={styles.brandHeader}>
          {faviconSrc && (
            <img
              src={faviconSrc}
              alt=""
              className={styles.brandLogo}
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
          )}
          <p className={styles.subtitle}>{t("login.sign_in_account")}</p>
        </header>

        {errorMessage && (
          <p className={styles.errorMsg} role="alert">
            <span className={styles.errorIcon} aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            {errorMessage}
          </p>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              {t("login.email_label")}
            </label>
            <div
              className={`${styles.inputShell} ${email ? styles.filled : ""} ${errorType ? styles.hasError : ""}`}
            >
              <span className={styles.inputIcon} aria-hidden="true">
                <MdEmail />
              </span>
              <span className={styles.inputDivider} aria-hidden="true" />
              <input
                id="email"
                type="email"
                className={`${styles.input} ${styles.inputField}`}
                placeholder={t("login.email_placeholder")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorType) setErrorType(null);
                }}
                required
                autoComplete="email"
                disabled={loading}
                spellCheck={false}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              {t("login.password_label")}
            </label>
            <div
              className={`${styles.inputShell} ${styles.inputShellPassword} ${password ? styles.filled : ""} ${errorType ? styles.hasError : ""}`}
            >
              <span className={styles.inputIcon} aria-hidden="true">
                <MdLockOutline />
              </span>
              <span className={styles.inputDivider} aria-hidden="true" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`${styles.input} ${styles.inputField} ${styles.passwordField}`}
                placeholder={t("login.password_placeholder")}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorType) setErrorType(null);
                }}
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className={`${styles.togglePassword} ${showPassword ? styles.toggleActive : ""}`}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? t("login.toggle_password_hide")
                    : t("login.toggle_password_show")
                }
                aria-pressed={showPassword}
                disabled={loading}
              >
                {showPassword ? (
                  <MdVisibilityOff aria-hidden="true" />
                ) : (
                  <MdVisibility aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <label className={styles.rememberRow}>
            <input
              type="checkbox"
              className={styles.rememberCheckbox}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            <span className={styles.rememberBox} aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className={styles.rememberLabel}>
              {t("login.remember_me")}
            </span>
          </label>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                {t("login.signing_in")}
              </>
            ) : (
              t("login.sign_in")
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
