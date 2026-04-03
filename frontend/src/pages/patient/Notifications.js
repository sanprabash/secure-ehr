import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';

function Notifications() {
  const user = JSON.parse(localStorage.getItem('user'));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 18) return 'good afternoon';
    return 'good evening';
  };

  // For now using dummy notifications
  // These will be replaced with real API data later
  const [notifications] = useState([
    {
      _id: '1',
      title: 'Dr. Pradeep Perera viewed your record',
      description: 'Dr. Perera accessed your Full Blood Count (Mar 2026) report today at 9:42 AM. This access is covered by the consent you granted on 14 Feb 2026.',
      time: 'Today, 9:42 AM',
      isRead: false,
      type: 'record_access'
    },
    {
      _id: '2',
      title: 'New prescription uploaded by Dr. Perera',
      description: 'A new prescription for Metformin 500mg has been added to your records. Valid until 7 Sep 2026. Please collect from your pharmacy.',
      time: 'Today, 9:50 AM',
      isRead: true,
      type: 'new_record'
    },
    {
      _id: '3',
      title: 'You granted access to Dr. Kumari Silva',
      description: 'You successfully granted Dr. Kumari Silva (Cardiologist, Asiri Central) access to your medical records. You can revoke this at any time from Consent Management.',
      time: 'Today, 8:15 AM',
      isRead: true,
      type: 'consent_granted'
    }
  ]);

  const getIcon = (type) => {
    switch(type) {
      case 'record_access': return '👁';
      case 'new_record': return '📋';
      case 'consent_granted': return '🔑';
      case 'consent_revoked': return '🚫';
      case 'account': return '🔐';
      default: return '🔔';
    }
  };

  const getIconBg = (type) => {
    switch(type) {
      case 'record_access': return '#e8f8fb';
      case 'new_record': return '#f0fdf4';
      case 'consent_granted': return '#f5f3ff';
      case 'consent_revoked': return '#fee2e2';
      case 'account': return '#f8f8f8';
      default: return '#f0f0f0';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Group by date
  const todayNotifs = notifications.filter(n => n.time.startsWith('Today'));
  const earlierNotifs = notifications.filter(n => !n.time.startsWith('Today'));

  return (
    <div style={styles.container}>
      <PatientSidebar />

      <div style={styles.main}>
        {/* TOPBAR */}
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>
            Notifications <span style={styles.greeting}>{getGreeting()}, {user?.firstName}</span>
          </div>
        </div>

        <div style={styles.content}>

          {/* BANNER */}
          <div style={styles.banner}>
            <h2 style={styles.bannerTitle}>Notifications</h2>
            <div style={styles.bannerMeta}>{unreadCount} unread · {notifications.length} total</div>
          </div>

          {/* TODAY */}
          {todayNotifs.length > 0 && (
            <>
              <div style={styles.dateGroup}>Today — {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              {todayNotifs.map(notif => (
                <div key={notif._id} style={notif.isRead ? styles.notifCard : {...styles.notifCard, ...styles.notifUnread}}>
                  {!notif.isRead && <div style={styles.unreadDot}></div>}
                  <div style={{...styles.notifIcon, background: getIconBg(notif.type)}}>
                    {getIcon(notif.type)}
                  </div>
                  <div style={styles.notifBody}>
                    <div style={styles.notifTitle}>{notif.title}</div>
                    <div style={styles.notifDesc}>{notif.description}</div>
                    <div style={styles.notifTime}>{notif.time}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* EARLIER */}
          {earlierNotifs.length > 0 && (
            <>
              <div style={styles.dateGroup}>Earlier</div>
              {earlierNotifs.map(notif => (
                <div key={notif._id} style={notif.isRead ? styles.notifCard : {...styles.notifCard, ...styles.notifUnread}}>
                  {!notif.isRead && <div style={styles.unreadDot}></div>}
                  <div style={{...styles.notifIcon, background: getIconBg(notif.type)}}>
                    {getIcon(notif.type)}
                  </div>
                  <div style={styles.notifBody}>
                    <div style={styles.notifTitle}>{notif.title}</div>
                    <div style={styles.notifDesc}>{notif.description}</div>
                    <div style={styles.notifTime}>{notif.time}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {notifications.length === 0 && (
            <div style={styles.emptyMsg}>No notifications yet.</div>
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
  banner: { background: '#2d6b70', borderRadius: '14px', padding: '22px 26px', marginBottom: '22px' },
  bannerTitle: { fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '6px' },
  bannerMeta: { fontSize: '13.5px', color: 'rgba(255,255,255,0.75)' },
  dateGroup: { fontSize: '12.5px', color: '#aaa', fontWeight: '600', margin: '18px 0 10px', paddingBottom: '6px', borderBottom: '1px solid #ddd' },
  notifCard: { background: 'white', borderRadius: '12px', padding: '16px 18px', marginBottom: '10px', border: '1px solid #eee', display: 'flex', gap: '14px', alignItems: 'flex-start', position: 'relative' },
  notifUnread: { borderLeft: '4px solid #17a8c4' },
  unreadDot: { width: '9px', height: '9px', borderRadius: '50%', background: '#17a8c4', position: 'absolute', top: '18px', right: '18px', flexShrink: 0 },
  notifIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
  notifBody: { flex: 1 },
  notifTitle: { fontSize: '14px', fontWeight: '700', color: '#222', marginBottom: '4px' },
  notifDesc: { fontSize: '13px', color: '#555', lineHeight: '1.55' },
  notifTime: { fontSize: '11.5px', color: '#aaa', marginTop: '7px', fontWeight: '600' },
  emptyMsg: { fontSize: '14px', color: '#aaa', textAlign: 'center', padding: '40px 0' }
};

export default Notifications;