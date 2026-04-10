import React, { useEffect, useState } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import API from '../../services/api';

function Notifications() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 18) return 'good afternoon';
    return 'good evening';
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const markAsRead = async (notifId) => {
    try {
      const token = localStorage.getItem('token');
      await API.put(`/notifications/${notifId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n =>
        n._id === notifId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await API.put('/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'record_added': return '📋';
      case 'consent_granted': return '🔑';
      case 'consent_revoked': return '🚫';
      case 'new_record': return '📁';
      default: return '🔔';
    }
  };

  const getIconBg = (type) => {
    switch(type) {
      case 'record_added': return '#f5f3ff';
      case 'consent_granted': return '#f0fdf4';
      case 'consent_revoked': return '#fee2e2';
      case 'new_record': return '#f0fdf4';
      default: return '#f0f0f0';
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const todayNotifs = notifications.filter(n => {
    const d = new Date(n.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const earlierNotifs = notifications.filter(n => {
    const d = new Date(n.createdAt);
    const today = new Date();
    return d.toDateString() !== today.toDateString();
  });

  return (
    <div style={styles.container}>
      <PatientSidebar />

      <div style={styles.main}>
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>
            Notifications <span style={styles.greeting}>{getGreeting()}, {user?.firstName}</span>
          </div>
        </div>

        <div style={styles.content}>

          <div style={styles.banner}>
            <div style={styles.bannerLeft}>
              <h2 style={styles.bannerTitle}>Notifications</h2>
              <div style={styles.bannerMeta}>{unreadCount} unread · {notifications.length} total</div>
            </div>
            {unreadCount > 0 && (
              <button style={styles.btnMarkAll} onClick={markAllRead}>
                ✓ Mark all as read
              </button>
            )}
          </div>

          {loading && <p style={styles.emptyMsg}>Loading notifications...</p>}

          {!loading && notifications.length === 0 && (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>🔔</div>
              <div style={styles.emptyText}>No notifications yet</div>
              <div style={styles.emptySub}>You will see notifications here when doctors add records or access your files.</div>
            </div>
          )}

          {todayNotifs.length > 0 && (
            <>
              <div style={styles.dateGroup}>Today — {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              {todayNotifs.map(notif => (
                <div
                  key={notif._id}
                  style={notif.isRead ? styles.notifCard : {...styles.notifCard, ...styles.notifUnread}}
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                >
                  {!notif.isRead && <div style={styles.unreadDot}></div>}
                  <div style={{...styles.notifIcon, background: getIconBg(notif.type)}}>
                    {getIcon(notif.type)}
                  </div>
                  <div style={styles.notifBody}>
                    <div style={styles.notifTitle}>{notif.title}</div>
                    <div style={styles.notifDesc}>{notif.message}</div>
                    <div style={styles.notifTime}>{formatTime(notif.createdAt)}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {earlierNotifs.length > 0 && (
            <>
              <div style={styles.dateGroup}>Earlier</div>
              {earlierNotifs.map(notif => (
                <div
                  key={notif._id}
                  style={notif.isRead ? styles.notifCard : {...styles.notifCard, ...styles.notifUnread}}
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                >
                  {!notif.isRead && <div style={styles.unreadDot}></div>}
                  <div style={{...styles.notifIcon, background: getIconBg(notif.type)}}>
                    {getIcon(notif.type)}
                  </div>
                  <div style={styles.notifBody}>
                    <div style={styles.notifTitle}>{notif.title}</div>
                    <div style={styles.notifDesc}>{notif.message}</div>
                    <div style={styles.notifTime}>{formatTime(notif.createdAt)}</div>
                  </div>
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f0f0', fontFamily: 'Inter, sans-serif' },
  main: { marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' },
  topbar: { height: '52px', background: '#f0f0f0', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 28px' },
  topbarTitle: { fontSize: '22px', fontWeight: '400', color: '#222', flex: 1 },
  greeting: { fontSize: '14px', color: '#888', fontWeight: '400' },
  content: { padding: '24px' },
  banner: { background: '#2d6b70', borderRadius: '14px', padding: '22px 26px', marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  bannerLeft: {},
  bannerTitle: { fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '6px' },
  bannerMeta: { fontSize: '13.5px', color: 'rgba(255,255,255,0.75)' },
  btnMarkAll: { padding: '9px 18px', background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.30)', borderRadius: '9px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  emptyMsg: { fontSize: '14px', color: '#aaa', textAlign: 'center', padding: '40px 0' },
  emptyCard: { background: 'white', borderRadius: '14px', padding: '50px 30px', textAlign: 'center', border: '1px solid #eee' },
  emptyIcon: { fontSize: '40px', marginBottom: '14px' },
  emptyText: { fontSize: '16px', fontWeight: '700', color: '#444', marginBottom: '8px' },
  emptySub: { fontSize: '13px', color: '#aaa', lineHeight: '1.6' },
  dateGroup: { fontSize: '12.5px', color: '#aaa', fontWeight: '600', margin: '18px 0 10px', paddingBottom: '6px', borderBottom: '1px solid #ddd' },
  notifCard: { background: 'white', borderRadius: '12px', padding: '16px 18px', marginBottom: '10px', border: '1px solid #eee', display: 'flex', gap: '14px', alignItems: 'flex-start', position: 'relative', cursor: 'pointer' },
  notifUnread: { borderLeft: '4px solid #17a8c4' },
  unreadDot: { width: '9px', height: '9px', borderRadius: '50%', background: '#17a8c4', position: 'absolute', top: '18px', right: '18px' },
  notifIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
  notifBody: { flex: 1 },
  notifTitle: { fontSize: '14px', fontWeight: '700', color: '#222', marginBottom: '4px' },
  notifDesc: { fontSize: '13px', color: '#555', lineHeight: '1.55' },
  notifTime: { fontSize: '11.5px', color: '#aaa', marginTop: '7px', fontWeight: '600' }
};

export default Notifications;