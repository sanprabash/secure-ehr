import React, { useState } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';

function DoctorNotifications() {
  const user = JSON.parse(localStorage.getItem('user'));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 18) return 'good afternoon';
    return 'good evening';
  };

  const [notifications] = useState([
    {
      _id: '1',
      title: 'Sandaru Pathirana uploaded a new record',
      description: 'A new Lab Result (Full Blood Count — Nawaloka Hospital) has been added to Sandaru Pathirana\'s records. You can view it now as you have active consent.',
      time: 'Today, 9:20 AM',
      isRead: false,
      type: 'new_record'
    },
    {
      _id: '2',
      title: 'Ruwini Wickramasinghe granted you access',
      description: 'Ruwini Wickramasinghe has granted you access to her medical records. You can now view her records from the My Patients page.',
      time: 'Today, 8:05 AM',
      isRead: true,
      type: 'consent_granted'
    },
    {
      _id: '3',
      title: 'Kamal Fernando revoked your access',
      description: 'Kamal Fernando has revoked your access to his medical records. You can no longer view his records. This action was taken by the patient.',
      time: 'Yesterday, 3:45 PM',
      isRead: true,
      type: 'consent_revoked'
    }
  ]);

  const getIcon = (type) => {
    switch(type) {
      case 'new_record': return '📋';
      case 'consent_granted': return '🔑';
      case 'consent_revoked': return '🚫';
      case 'account': return '🔐';
      default: return '🔔';
    }
  };

  const getIconBg = (type) => {
    switch(type) {
      case 'new_record': return '#f0fdf4';
      case 'consent_granted': return '#f5f3ff';
      case 'consent_revoked': return '#fee2e2';
      case 'account': return '#f8f8f8';
      default: return '#f0f0f0';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const todayNotifs = notifications.filter(n => n.time.startsWith('Today'));
  const earlierNotifs = notifications.filter(n => !n.time.startsWith('Today'));

  return (
    <div style={styles.container}>
      <DoctorSidebar />

      <div style={styles.main}>
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>
            Notifications <span style={styles.greeting}>{getGreeting()}, Dr. {user?.lastName}</span>
          </div>
        </div>

        <div style={styles.content}>

          <div style={styles.banner}>
            <h2 style={styles.bannerTitle}>Notifications</h2>
            <div style={styles.bannerMeta}>{unreadCount} unread · {notifications.length} total</div>
          </div>

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

          {earlierNotifs.length > 0 && (
            <>
              <div style={styles.dateGroup}>Yesterday</div>
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
  unreadDot: { width: '9px', height: '9px', borderRadius: '50%', background: '#17a8c4', position: 'absolute', top: '18px', right: '18px' },
  notifIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
  notifBody: { flex: 1 },
  notifTitle: { fontSize: '14px', fontWeight: '700', color: '#222', marginBottom: '4px' },
  notifDesc: { fontSize: '13px', color: '#555', lineHeight: '1.55' },
  notifTime: { fontSize: '11.5px', color: '#aaa', marginTop: '7px', fontWeight: '600' }
};

export default DoctorNotifications;