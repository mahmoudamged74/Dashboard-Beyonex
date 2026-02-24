import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
  MdSearch, 
  MdDelete, 
  MdEmail, 
  MdMarkEmailRead, 
  MdVisibility, 
  MdClose,
  MdPhone,
  MdBusiness,
  MdAccessTime,
  MdNavigateBefore,
  MdNavigateNext
} from 'react-icons/md';
import axiosInstance from '../api/axiosInstance';
import styles from './MessagesManager.module.css';

const MessagesManager = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  const fetchMessages = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`admin/messages?page=${page}`);
      if (res.data.code === 200) {
        setMessages(res.data.data.messages);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      toast.error(t('fetch_error') || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await axiosInstance.put(`admin/messages/${id}`, { read: true });
      if (res.data.code === 200) {
        setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, read: true } : msg));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(prev => ({ ...prev, read: true }));
        }
      }
    } catch (err) {
      toast.error(t('update_error') || 'Failed to update message status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirm_delete') || 'Are you sure you want to delete this message?')) return;
    try {
      const res = await axiosInstance.delete(`admin/messages/${id}`);
      if (res.data.code === 200) {
        toast.success(res.data.message || t('delete_success'));
        fetchMessages(pagination.current_page);
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (err) {
      toast.error(t('delete_error') || 'Failed to delete message');
    }
  };

  const openMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      handleMarkAsRead(msg.id);
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(isAr ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('messages_manager')}</h1>
        <div className={styles.searchWrapper}>
          <MdSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder={t('search') || 'Search messages...'} 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('full_name')}</th>
              <th>{t('subject')}</th>
              <th>{t('status')}</th>
              <th>{t('date')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className={styles.loadingCell}>{t('loading')}...</td></tr>
            ) : filteredMessages.length === 0 ? (
              <tr><td colSpan="5" className={styles.emptyCell}>{t('no_data')}</td></tr>
            ) : (
              filteredMessages.map(msg => (
                <tr key={msg.id} className={!msg.read ? styles.unreadRow : ''}>
                  <td>
                    <div className={styles.nameCell}>
                      {!msg.read && <span className={styles.unreadDot}></span>}
                      <span>{msg.full_name}</span>
                    </div>
                  </td>
                  <td>{t(msg.subject) || msg.subject}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${msg.read ? styles.readBadge : styles.unreadBadge}`}>
                      {msg.read ? t('read') : t('unread')}
                    </span>
                  </td>
                  <td>{formatDate(msg.created_at)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => openMessage(msg)} title={t('view')}>
                        <MdVisibility />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(msg.id)} title={t('delete')}>
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.last_page > 1 && (
        <div className={styles.pagination}>
          <button 
            disabled={pagination.current_page === 1} 
            onClick={() => fetchMessages(pagination.current_page - 1)}
            className={styles.pageBtn}
          >
            <MdNavigateBefore />
          </button>
          <span className={styles.pageInfo}>
            {t('page')} {pagination.current_page} {t('of')} {pagination.last_page}
          </span>
          <button 
            disabled={pagination.current_page === pagination.last_page} 
            onClick={() => fetchMessages(pagination.current_page + 1)}
            className={styles.pageBtn}
          >
            <MdNavigateNext />
          </button>
        </div>
      )}

      {selectedMessage && (
        <div className={styles.modalOverlay} onClick={() => setSelectedMessage(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{t('message_details')}</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedMessage(null)}>
                <MdClose />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <MdEmail className={styles.detailIcon} />
                  <div>
                    <label>{t('email')}</label>
                    <p>{selectedMessage.email}</p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <MdPhone className={styles.detailIcon} />
                  <div>
                    <label>{t('phone')}</label>
                    <p>{selectedMessage.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <MdBusiness className={styles.detailIcon} />
                  <div>
                    <label>{t('company_name')}</label>
                    <p>{selectedMessage.company_name || 'N/A'}</p>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <MdAccessTime className={styles.detailIcon} />
                  <div>
                    <label>{t('date')}</label>
                    <p>{formatDate(selectedMessage.created_at)}</p>
                  </div>
                </div>
              </div>
              <div className={styles.messageContent}>
                <label>{t('message_content')}</label>
                <div className={styles.contentBox}>
                  {selectedMessage.message}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.closeModalBtn} onClick={() => setSelectedMessage(null)}>
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesManager;
