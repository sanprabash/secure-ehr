import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import API from '../../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalRecords: 0
  });

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
        const response = await API.get('/admin/stats', {
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
      <AdminSidebar />

      <div style={styles.main}>
        {/* TOPBAR */}
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>Dashboard <span style={styles.greeting}>good morning</span></div>
          <div style={styles.dateBox}>📅 {getDate()}</div>
        </div>

        <div style={styles.content}>

          {/* BANNER */}
          <div style={styles.banner}>
            <h2 style={styles.bannerTitle}>Dashboard</h2>
            <p style={styles.bannerText}>Ministry of Health · Sri Lanka — Secure EHR System Overview.</p>
          </div>

          {/* STAT CARDS */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>👥</div>
              <div style={styles.statValue}>{stats.totalPatients}</div>
              <div style={styles.statLabel}>Total Patients</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>👨‍⚕️</div>
              <div style={styles.statValue}>{stats.totalDoctors}</div>
              <div style={styles.statLabel}>Registered Doctors</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📋</div>
              <div style={styles.statValue}>{stats.totalRecords}</div>
              <div style={styles.statLabel}>Total Records</div>
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

export default AdminDashboard;