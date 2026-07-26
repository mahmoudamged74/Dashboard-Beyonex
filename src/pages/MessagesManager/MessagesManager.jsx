import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast, { getActionMessageKey } from "../../utils/toast";
import {
  MdSearch,
  MdDelete,
  MdVisibility,
  MdClose,
  MdAccessTime,
  MdNavigateBefore,
  MdNavigateNext,
  MdMessage,
  MdPerson,
  MdMarkEmailRead,
  MdMarkEmailUnread,
  MdOutlineTopic,
} from "react-icons/md";
import { useAppDispatch, useAppSelector, usePolling, usePermission, useAppReady } from "../../hooks";
import {
  fetchMessages,
  markMessageRead,
  deleteMessage,
} from "../../redux/actions/messagesActions";
import {
  selectMessages,
  setMessagesPage,
} from "../../redux/reducers/messagesReducer";
import { REQUEST_STATUS } from "../../redux/types";
import { POLL_INTERVAL_MS } from "../../redux/cache";
import { CardGridSkeleton } from "../../components/Loading";
import { ModalPortal } from "../../components/Modal";
import { getAppLanguage } from "../../i18n";
import styles from "./MessagesManager.module.css";

const SUBJECT_AR_TO_KEY = {
  "استفسار عام": "general_inquiry",
  "تطوير المواقع": "web_development",
  "تطبيقات الموبايل": "mobile_applications",
  "أنظمة ERP": "erp_systems",
  "دعم فني": "technical_support",
  "الدعم الفني": "technical_support",
  توظيف: "hiring",
  أخرى: "other",
};

const SUBJECT_KEYS = [
  "general_inquiry",
  "web_development",
  "mobile_applications",
  "erp_systems",
  "technical_support",
  "hiring",
  "other",
];

const normalizeSubjectKey = (subject) => {
  if (!subject) return "";
  return SUBJECT_AR_TO_KEY[subject] || subject;
};

const MessagesManager = () => {
  const { t, i18n } = useTranslation();
  const { can } = usePermission();
  const dispatch = useAppDispatch();
  const isAr = getAppLanguage(i18n.language) === "ar";
  const inboxSnapshotRef = useRef(null);

  useAppReady();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | read | unread
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { status, byPage, refreshing } = useAppSelector(selectMessages);
  const inboxData = byPage[1];
  const pageData = byPage[currentPage];
  const data = currentPage === 1 ? inboxData : pageData;
  const loading = status === REQUEST_STATUS.LOADING && !data;
  const isFetching = refreshing;

  usePolling(fetchMessages, POLL_INTERVAL_MS, can('messages.view'));

  useEffect(() => {
    dispatch(setMessagesPage(currentPage));
    if (currentPage !== 1) {
      dispatch(fetchMessages({ page: currentPage }));
    }
  }, [dispatch, currentPage]);

  const messages = data?.messages || [];
  const pagination = data?.pagination || {
    current_page: 1,
    last_page: 1,
    total: 0,
  };

  const translateSubject = (subject) => {
    if (!subject) return "—";

    const normalized = normalizeSubjectKey(subject);
    const key = `messages_page.subjects.${normalized}`;
    const translated = t(key, { defaultValue: "" });
    if (translated) return translated;

    const legacy = t(normalized, { defaultValue: "" });
    if (legacy) return legacy;

    return subject;
  };

  const subjectOptions = (() => {
    const fromMessages = messages
      .map((msg) => normalizeSubjectKey(msg.subject))
      .filter(Boolean);

    const keys = [...new Set([...SUBJECT_KEYS, ...fromMessages])];

    return keys.map((key) => ({
      value: key,
      label: translateSubject(key),
    }));
  })();

  const filteredMessages = messages
    .filter((msg) => {
      if (statusFilter === "read" && !msg.read) return false;
      if (statusFilter === "unread" && msg.read) return false;

      if (subjectFilter !== "all") {
        if (normalizeSubjectKey(msg.subject) !== subjectFilter) return false;
      }

      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;

      return (
        msg.full_name?.toLowerCase().includes(term) ||
        msg.name?.toLowerCase().includes(term) ||
        msg.email?.toLowerCase().includes(term) ||
        msg.phone?.toLowerCase().includes(term) ||
        msg.company_name?.toLowerCase().includes(term) ||
        msg.subject?.toLowerCase().includes(term) ||
        translateSubject(msg.subject).toLowerCase().includes(term)
      );
    })
    .slice()
    .sort((a, b) => {
      const aUnread = !a.read ? 1 : 0;
      const bUnread = !b.read ? 1 : 0;
      if (aUnread !== bUnread) return bUnread - aUnread;

      const aTime = new Date(a.created_at || a.createdAt || 0).getTime();
      const bTime = new Date(b.created_at || b.createdAt || 0).getTime();
      return bTime - aTime;
    });

  useEffect(() => {
    if (!inboxData) return;

    const inboxMessages = inboxData.messages || [];
    const ids = inboxMessages.map((msg) => msg.id);
    const total = inboxData.pagination?.total ?? ids.length;

    if (!inboxSnapshotRef.current) {
      inboxSnapshotRef.current = { ids: new Set(ids), total };
      return;
    }

    const { ids: prevIds, total: prevTotal } = inboxSnapshotRef.current;
    const newMessages = inboxMessages.filter((msg) => !prevIds.has(msg.id));
    const hasNew =
      newMessages.length > 0 ||
      (typeof prevTotal === "number" && total > prevTotal);

    if (hasNew) {
      if (currentPage !== 1) {
        setCurrentPage(1);
      }

      const newest = newMessages[0];
      const subjectLabel = newest ? translateSubject(newest.subject) : "";

      toast.inbox(
        <div className="app-toast-inbox">
          <div className="app-toast-inbox-head">
            <span className="app-toast-eyebrow">
              {t("messages_page.new_message_eyebrow")}
            </span>
          </div>
          <strong className="app-toast-title">
            {newest
              ? t("messages_page.new_message_title", {
                  name: newest.full_name || t("messages_page.unknown_sender"),
                })
              : t("messages_page.new_message_generic_title")}
          </strong>
          <p className="app-toast-text">
            {newest
              ? t("messages_page.new_message_body")
              : t("messages_page.new_message_generic_body")}
          </p>
          {subjectLabel && subjectLabel !== "—" ? (
            <span className="app-toast-meta">{subjectLabel}</span>
          ) : null}
        </div>
      );
    }

    inboxSnapshotRef.current = { ids: new Set(ids), total };
  }, [inboxData, currentPage, t, isAr]);

  const handleSetReadStatus = async (id, read, { silent = false } = {}) => {
    try {
      await dispatch(markMessageRead({ id, read })).unwrap();
      setSelectedMessage((prev) =>
        prev && prev.id === id ? { ...prev, read } : prev
      );
      if (!silent) {
        toast.success(
          t(read ? "messages_page.marked_read" : "messages_page.marked_unread")
        );
      }
    } catch (err) {
      if (!silent) {
        toast.error(err || t("update_error") || t("error_generic"));
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await dispatch(deleteMessage(deleteTarget.id)).unwrap();
      toast.success(t(getActionMessageKey("delete")));
      dispatch(fetchMessages({ page: currentPage, force: true }));
      dispatch(fetchMessages({ page: 1, force: true }));
      if (selectedMessage && selectedMessage.id === deleteTarget.id) {
        setSelectedMessage(null);
      }
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err || t("delete_error"));
    } finally {
      setDeleting(false);
    }
  };

  const openMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      handleSetReadStatus(msg.id, true, { silent: true });
    }
  };

  const unreadCount = messages.filter((msg) => !msg.read).length;
  const readCount = messages.filter((msg) => msg.read).length;
  const allCount = messages.length;

  const statusFilters = [
    {
      key: "all",
      label: t("messages_page.filter_all"),
      count: allCount,
    },
    {
      key: "unread",
      label: t("unread"),
      count: unreadCount,
    },
    {
      key: "read",
      label: t("read"),
      count: readCount,
    },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(isAr ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.page} dir={isAr ? "rtl" : "ltr"}>
      <section className={styles.inboxPanel} aria-label={t("messages_page.list_title")}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionTitleBar} aria-hidden="true" />
            {t("messages_page.list_title")}
          </h2>
          {unreadCount > 0 ? (
            <span
              className={styles.unreadCount}
              aria-label={t("dashboard_page.stat_unread", { count: unreadCount })}
            >
              {unreadCount}
            </span>
          ) : null}
          <span className={styles.sectionHeadRule} aria-hidden="true" />
          <div className={styles.inboxStats}>
            <span className={styles.inboxStat}>
              {t("messages_page.filter_all")}: {allCount}
            </span>
            <span className={styles.inboxStatDivider} aria-hidden="true" />
            <span className={`${styles.inboxStat} ${unreadCount > 0 ? styles.inboxStatUnread : ""}`}>
              {t("unread")}: {unreadCount}
            </span>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.filterGroup} role="tablist">
            {statusFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                role="tab"
                aria-selected={statusFilter === filter.key}
                className={`${styles.filterChip} ${
                  statusFilter === filter.key ? styles.filterChipActive : ""
                } ${
                  filter.key === "unread" ? styles.filterChipUnread : ""
                } ${filter.key === "read" ? styles.filterChipRead : ""}`}
                onClick={() => setStatusFilter(filter.key)}
              >
                <span>{filter.label}</span>
                <span className={styles.filterCount}>{filter.count}</span>
              </button>
            ))}
          </div>

          <div className={styles.toolbarEnd}>
            <div className={styles.subjectSelectWrap}>
              <MdOutlineTopic className={styles.subjectSelectIcon} size={17} aria-hidden="true" />
              <select
                className={`${styles.subjectSelect} ${
                  subjectFilter !== "all" ? styles.subjectSelectActive : ""
                }`}
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                aria-label={t("messages_page.filter_subject")}
              >
                <option value="all">{t("messages_page.filter_subject_all")}</option>
                {subjectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.searchWrapper}>
              <MdSearch className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder={t("messages_page.search_placeholder")}
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.sectionBodyPad}>
            <CardGridSkeleton count={4} />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className={styles.emptyState}>
            <MdMessage size={32} />
            <p>{t("messages_page.no_messages")}</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <colgroup>
                <col className={styles.colName} />
                <col className={styles.colEmail} />
                <col className={styles.colSubject} />
                <col className={styles.colPhone} />
                <col className={styles.colCompany} />
                <col className={styles.colStatus} />
                <col className={styles.colActions} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">{t("messages_page.col_name")}</th>
                  <th scope="col">{t("messages_page.col_email")}</th>
                  <th scope="col">{t("messages_page.col_subject")}</th>
                  <th scope="col">{t("messages_page.col_phone")}</th>
                  <th scope="col">{t("messages_page.col_company")}</th>
                  <th scope="col" className={styles.thCenter}>
                    {t("messages_page.col_status")}
                  </th>
                  <th scope="col" className={styles.thCenter}>
                    {t("messages_page.col_actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg) => {
                  const name =
                    msg.full_name || msg.name || t("messages_page.unknown_sender");
                  const email = msg.email || "";
                  const phone = msg.phone || "";
                  const company = msg.company_name || "";

                  return (
                    <tr
                      key={msg.id}
                      className={!msg.read ? styles.rowUnread : undefined}
                      onClick={() => openMessage(msg)}
                    >
                      <td>
                        <span className={styles.cellPrimary} title={name}>
                          {name}
                        </span>
                      </td>
                      <td>
                        {email ? (
                          <span className={styles.cellSecondary} title={email} dir="ltr">
                            {email}
                          </span>
                        ) : (
                          <span className={styles.cellEmpty}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={styles.subjectChip}>
                          {translateSubject(msg.subject)}
                        </span>
                      </td>
                      <td>
                        {phone ? (
                          <span className={styles.cellPhone} dir="ltr">
                            {phone}
                          </span>
                        ) : (
                          <span className={styles.cellEmpty}>
                            {t("messages_page.na")}
                          </span>
                        )}
                      </td>
                      <td>
                        {company ? (
                          <span className={styles.cellSecondary} title={company}>
                            {company}
                          </span>
                        ) : (
                          <span className={styles.cellEmpty}>
                            {t("messages_page.na")}
                          </span>
                        )}
                      </td>
                      <td className={styles.tdCenter}>
                        <span
                          className={`${styles.statusBadge} ${
                            msg.read ? styles.readBadge : styles.unreadBadge
                          }`}
                          role="button"
                          tabIndex={0}
                          title={
                            msg.read
                              ? t("messages_page.mark_unread")
                              : t("messages_page.mark_read")
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetReadStatus(msg.id, !msg.read);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSetReadStatus(msg.id, !msg.read);
                            }
                          }}
                        >
                          {msg.read ? t("read") : t("unread")}
                        </span>
                      </td>
                      <td className={styles.tdCenter}>
                        <div
                          className={styles.actions}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                            onClick={() => openMessage(msg)}
                            title={t("view")}
                            aria-label={t("view")}
                          >
                            <MdVisibility size={16} />
                          </button>
                          {can("messages.delete") && (
                            <button
                              type="button"
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => setDeleteTarget(msg)}
                              title={t("delete")}
                              aria-label={t("delete")}
                            >
                              <MdDelete size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.last_page > 1 && (
          <div className={styles.pagination}>
            <button
              type="button"
              disabled={pagination.current_page === 1 || isFetching}
              onClick={() => setCurrentPage(pagination.current_page - 1)}
              className={styles.pageBtn}
              aria-label={t("messages_page.prev")}
            >
              {isAr ? <MdNavigateNext /> : <MdNavigateBefore />}
            </button>
            <span className={styles.pageInfo}>
              {t("page")} {pagination.current_page} {t("of")}{" "}
              {pagination.last_page}
            </span>
            <button
              type="button"
              disabled={
                pagination.current_page === pagination.last_page || isFetching
              }
              onClick={() => setCurrentPage(pagination.current_page + 1)}
              className={styles.pageBtn}
              aria-label={t("messages_page.next")}
            >
              {isAr ? <MdNavigateBefore /> : <MdNavigateNext />}
            </button>
          </div>
        )}
      </section>

      {selectedMessage && (
        <ModalPortal>
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t("message_details")}</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setSelectedMessage(null)}
                aria-label={t("close")}
              >
                <MdClose size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.senderCard}>
                <div className={styles.senderAvatar} aria-hidden="true">
                  <MdPerson size={20} />
                </div>
                <div className={styles.senderInfo}>
                  <p className={styles.senderName}>
                    {selectedMessage.full_name ||
                      selectedMessage.name ||
                      t("messages_page.unknown_sender")}
                  </p>
                  <p className={styles.senderEmail}>{selectedMessage.email}</p>
                </div>
              </div>

              <div className={styles.subjectBlock}>
                <span className={styles.metaLabel}>{t("subject")}</span>
                <span className={styles.subjectChip}>
                  {translateSubject(selectedMessage.subject)}
                </span>
              </div>

              <div className={styles.metaList}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t("phone")}</span>
                  <span className={styles.metaValue} dir="ltr">
                    {selectedMessage.phone || t("messages_page.na")}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t("company_name")}</span>
                  <span className={styles.metaValue}>
                    {selectedMessage.company_name || t("messages_page.na")}
                  </span>
                </div>
              </div>

              <div className={styles.messageBlock}>
                <span className={styles.messageLabel}>
                  {t("message_content")}
                </span>
                <div className={styles.contentBox}>
                  {selectedMessage.message || "—"}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <div className={styles.modalFooterStart}>
                <span
                  className={`${styles.statusBadge} ${
                    selectedMessage.read
                      ? styles.readBadge
                      : styles.unreadBadge
                  }`}
                  role="button"
                  tabIndex={0}
                  title={
                    selectedMessage.read
                      ? t("messages_page.mark_unread")
                      : t("messages_page.mark_read")
                  }
                  onClick={() =>
                    handleSetReadStatus(
                      selectedMessage.id,
                      !selectedMessage.read
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSetReadStatus(
                        selectedMessage.id,
                        !selectedMessage.read
                      );
                    }
                  }}
                >
                  {selectedMessage.read ? (
                    <MdMarkEmailRead size={14} />
                  ) : (
                    <MdMarkEmailUnread size={14} />
                  )}
                  {selectedMessage.read ? t("read") : t("unread")}
                </span>

                <span className={styles.footerDate}>
                  <MdAccessTime size={14} />
                  {formatDate(selectedMessage.created_at)}
                </span>
              </div>

              <div className={styles.modalFooterActions}>
                {can("messages.delete") && (
                  <button
                    type="button"
                    className={styles.deleteOutlineBtn}
                    onClick={() => {
                      setDeleteTarget(selectedMessage);
                      setSelectedMessage(null);
                    }}
                  >
                    <MdDelete size={16} />
                    {t("delete")}
                  </button>
                )}
                <button
                  type="button"
                  className={styles.closeModalBtn}
                  onClick={() => setSelectedMessage(null)}
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {deleteTarget && (
        <ModalPortal>
        <div
          className={styles.modalOverlay}
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className={`${styles.modalContent} ${styles.modalNarrow}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={`${styles.modalTitle} ${styles.modalTitleDanger}`}>
                {t("delete")}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                aria-label={t("close")}
              >
                <MdClose size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteConfirm}>
                <p>
                  {t("messages_page.delete_confirm")}{" "}
                  <strong>{deleteTarget.full_name}</strong>?
                </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={handleDelete}
                disabled={deleting}
              >
                <MdDelete size={16} />
                {deleting ? t("deleting") : t("delete")}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default MessagesManager;
