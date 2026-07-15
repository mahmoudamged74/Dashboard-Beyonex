import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast, { getActionMessageKey } from "../../utils/toast";
import {
  MdSearch,
  MdDelete,
  MdEmail,
  MdVisibility,
  MdClose,
  MdPhone,
  MdBusiness,
  MdAccessTime,
  MdNavigateBefore,
  MdNavigateNext,
  MdMessage,
  MdPerson,
  MdMarkEmailUnread,
  MdMarkEmailRead,
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
import { getAppLanguage } from "../../i18n";
import styles from "./MessagesManager.module.css";

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

    const arabicToKey = {
      "استفسار عام": "general_inquiry",
      "دعم فني": "technical_support",
      "توظيف": "hiring",
      "أخرى": "other",
    };

    const normalized = arabicToKey[subject] || subject;
    const key = `messages_page.subjects.${normalized}`;
    const translated = t(key, { defaultValue: "" });
    if (translated) return translated;

    const legacy = t(normalized, { defaultValue: "" });
    if (legacy) return legacy;

    return subject;
  };

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
        <div className="app-toast-content">
          <span className="app-toast-eyebrow">
            {t("messages_page.new_message_eyebrow")}
          </span>
          <strong className="app-toast-title">
            {newest
              ? t("messages_page.new_message_title", {
                  name: newest.full_name || t("messages_page.unknown_sender"),
                })
              : t("messages_page.new_message_generic_title")}
          </strong>
          <span className="app-toast-text">
            {newest
              ? t("messages_page.new_message_body")
              : t("messages_page.new_message_generic_body")}
          </span>
          {subjectLabel && subjectLabel !== "—" && (
            <span className="app-toast-meta">{subjectLabel}</span>
          )}
        </div>
      );
    }

    inboxSnapshotRef.current = { ids: new Set(ids), total };
  }, [inboxData, currentPage, t, isAr]);

  const handleMarkAsRead = async (id) => {
    try {
      await dispatch(markMessageRead({ id, read: true })).unwrap();
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage((prev) => ({ ...prev, read: true }));
      }
    } catch (err) {
      toast.error(err || t("update_error") || t("error_generic"));
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
      handleMarkAsRead(msg.id);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (statusFilter === "read" && !msg.read) return false;
    if (statusFilter === "unread" && msg.read) return false;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      msg.full_name?.toLowerCase().includes(term) ||
      msg.email?.toLowerCase().includes(term) ||
      msg.subject?.toLowerCase().includes(term) ||
      translateSubject(msg.subject).toLowerCase().includes(term)
    );
  });

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
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t("messages_manager")}</h1>
        <p className={styles.pageSubtitle}>{t("messages_page.subtitle")}</p>
      </header>

      <SectionCard
        icon={MdMessage}
        title={t("messages_page.list_title")}
        description={t("messages_page.list_desc", {
          total: pagination.total || messages.length,
          unread: unreadCount,
        })}
        actions={
          <div className={styles.headerTools}>
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
        }
      >
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
          <div className={styles.messagesGrid}>
            {filteredMessages.map((msg, index) => (
              <article
                key={msg.id}
                className={`${styles.messageCard} ${
                  !msg.read ? styles.messageCardUnread : ""
                }`}
                onClick={() => openMessage(msg)}
              >
                <div className={styles.cardTop}>
                  <div className={styles.cardIdentity}>
                    <div className={styles.avatar}>
                      <MdPerson size={20} />
                      {!msg.read && <span className={styles.unreadDot} />}
                    </div>
                    <div className={styles.nameMeta}>
                      <h3 className={styles.nameText}>{msg.full_name}</h3>
                      <p className={styles.emailText}>
                        <MdEmail size={12} />
                        <span>{msg.email}</span>
                      </p>
                    </div>
                  </div>
                  <span className={styles.indexBadge}>{index + 1}</span>
                </div>

                <div className={styles.cardBadges}>
                  <span className={styles.subjectText}>
                    {translateSubject(msg.subject)}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${
                      msg.read ? styles.readBadge : styles.unreadBadge
                    }`}
                  >
                    {msg.read ? (
                      <MdMarkEmailRead size={14} />
                    ) : (
                      <MdMarkEmailUnread size={14} />
                    )}
                    {msg.read ? t("read") : t("unread")}
                  </span>
                </div>

                {msg.message && (
                  <p className={styles.messagePreview}>{msg.message}</p>
                )}

                <div className={styles.cardMeta}>
                  <span className={styles.dateText}>
                    <MdAccessTime size={13} />
                    {formatDate(msg.created_at)}
                  </span>

                  <div
                    className={styles.actions}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => openMessage(msg)}
                      title={t("view")}
                      aria-label={t("view")}
                    >
                      <MdVisibility size={15} />
                    </button>
                    {can("messages.delete") && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => setDeleteTarget(msg)}
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
      </SectionCard>

      {selectedMessage && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  {t("message_details")}
                </h3>
                <p className={styles.modalSubject}>
                  {translateSubject(selectedMessage.subject)}
                </p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setSelectedMessage(null)}
                aria-label={t("close")}
              >
                <MdClose size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.senderCard}>
                <div className={styles.senderAvatar}>
                  <MdPerson size={22} />
                </div>
                <div>
                  <p className={styles.senderName}>
                    {selectedMessage.full_name}
                  </p>
                  <p className={styles.senderEmail}>{selectedMessage.email}</p>
                </div>
                <span
                  className={`${styles.statusBadge} ${
                    selectedMessage.read
                      ? styles.readBadge
                      : styles.unreadBadge
                  }`}
                >
                  {selectedMessage.read ? t("read") : t("unread")}
                </span>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <MdEmail className={styles.detailIcon} size={18} />
                  <div>
                    <label>{t("email")}</label>
                    <p>{selectedMessage.email}</p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <MdPhone className={styles.detailIcon} size={18} />
                  <div>
                    <label>{t("phone")}</label>
                    <p>{selectedMessage.phone || t("messages_page.na")}</p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <MdBusiness className={styles.detailIcon} size={18} />
                  <div>
                    <label>{t("company_name")}</label>
                    <p>
                      {selectedMessage.company_name || t("messages_page.na")}
                    </p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <MdAccessTime className={styles.detailIcon} size={18} />
                  <div>
                    <label>{t("date")}</label>
                    <p>{formatDate(selectedMessage.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className={styles.messageContent}>
                <label>{t("message_content")}</label>
                <div className={styles.contentBox}>
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              {can("messages.delete") && (
                <button
                  type="button"
                  className={styles.deleteConfirmBtn}
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
      )}

      {deleteTarget && (
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
      )}
    </div>
  );
};

export default MessagesManager;
