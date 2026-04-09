import React, { useEffect, useState } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import API from '../../services/api';

function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState({
    patientsWithAccess: 0,
    recordsAccessed: 0,
    clinicalNotesAdded: 0
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 18) return 'good afternoon';
    return 'good evening';
  };

  const getDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await API.get('/doctor/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={styles.container}>
      <DoctorSidebar />

      <div style={styles.main}>
        {/* TOPBAR */}
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>
            Dashboard <span style={styles.greeting}>{getGreeting()}, Dr. {user?.lastName}</span>
          </div>
          <div style={styles.dateBox}>📅 {getDate()}</div>
        </div>

        {/* CONTENT */}
        <div style={styles.content}>

          {/* BANNER */}
          <div style={styles.banner}>
            <h2 style={styles.bannerTitle}>Welcome, Dr. {user?.lastName} 👋</h2>
            <p style={styles.bannerText}>
              You have {stats.patientsWithAccess} patients who have granted you access to their records.<br />
              Your specialisation: {user?.specialisation} · {user?.hospital}
            </p>
          </div>

          {/* STAT CARDS */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>👥</div>
              <div style={styles.statValue}>{stats.patientsWithAccess}</div>
              <div style={styles.statLabel}>Patients with Access</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>☰</div>
              <div style={styles.statValue}>{stats.recordsAccessed}</div>
              <div style={styles.statLabel}>Records Accessed</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📝</div>
              <div style={styles.statValue}>{stats.clinicalNotesAdded}</div>
              <div style={styles.statLabel}>Clinical Notes Added</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f0f0', fontFamily: 'Inter, sans-serif' },
  main: { marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' },
  topbar: { height: '52px', background: '#f0f0f0', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 28px', gap: '10px' },
  topbarTitle: { fontSize: '22px', fontWeight: '400', color: '#222', flex: 1 },
  greeting: { fontSize: '14px', color: '#888', fontWeight: '400' },
  dateBox: { fontSize: '13px', color: '#555', background: 'white', border: '1px solid #ddd', borderRadius: '6px', padding: '5px 12px' },
  content: { padding: '24px' },
  banner: { background: '#2d6b70', borderRadius: '14px', padding: '24px 28px', marginBottom: '22px' },
  bannerTitle: { fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '6px' },
  bannerText: { fontSize: '13.5px', color: 'rgba(255,255,255,0.78)', lineHeight: '1.6' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  statCard: { background: '#e8e8e8', borderRadius: '14px', padding: '28px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  statIcon: { fontSize: '28px' },
  statValue: { fontSize: '34px', fontWeight: '800', color: '#222', lineHeight: '1' },
  statLabel: { fontSize: '13px', fontWeight: '600', color: '#555', textAlign: 'center' }
};

export default DoctorDashboard;