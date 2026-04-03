import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../images/secure_ehr_logo.png';

function PatientSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'SP';
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Patient';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.sidebar}>

      {/* BRAND */}
      <div style={styles.brand}>
        <img src={logo} alt="logo" style={styles.logoImg} />
        <div>
          <div style={styles.brandName}>Secure EHR</div>
          <div style={styles.brandSub}>SMART HEALTHCARE RECORD<br />SYSTEM</div>
        </div>
      </div>

      {/* USER CARD */}
      <div style={styles.userCard}>
        <div style={styles.avatar}>{initials}</div>
        <div style={styles.userName}>{fullName}</div>
      </div>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLabel}>MAIN</div>

        <div
          style={isActive('/patient/dashboard') ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}
          onClick={() => navigate('/patient/dashboard')}
        >
          <span style={styles.navIcon}>⊞</span> Dashboard
        </div>

        <div
          style={isActive('/patient/records') ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}
          onClick={() => navigate('/patient/records')}
        >
          <span style={styles.navIcon}>☰</span> Medical Records
        </div>

        <div
          style={isActive('/patient/upload') ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}
          onClick={() => navigate('/patient/upload')}
        >
          <span style={styles.navIcon}>↑</span> Upload Record
        </div>

        <div style={styles.navLabel}>ACCESS</div>

        <div
          style={isActive('/patient/consent') ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}
          onClick={() => navigate('/patient/consent')}
        >
          <span style={styles.navIcon}>🔑</span> Consent Management
        </div>

        <div
          style={isActive('/patient/notifications') ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}
          onClick={() => navigate('/patient/notifications')}
        >
          <span style={styles.navIcon}>🔔</span> Notifications
        </div>

        <div style={styles.navLabel}>ACCOUNT</div>

        <div
          style={isActive('/patient/profile') ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}
          onClick={() => navigate('/patient/profile')}
        >
          <span style={styles.navIcon}>👤</span> My Profile
        </div>

        <div style={styles.navItem} onClick={handleLogout}>
          <span style={styles.navIcon}>🚪</span> Logout
        </div>

      </nav>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#17a8c4',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100
  },
  brand: {
    padding: '20px 18px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.20)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  logoImg: { width: '40px', height: '40px', objectFit: 'contain' },
  brandName: { fontSize: '17px', fontWeight: '800', color: 'white' },
  brandSub: { fontSize: '9px', fontWeight: '600', color: '#000000', letterSpacing: '0.05em', lineHeight: '1.4', marginTop: '2px' },
  userCard: {
    margin: '14px 12px 0',
    background: 'rgba(0,0,0,0.18)',
    borderRadius: '12px',
    padding: '14px'
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: '#0a3d47',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '8px'
  },
  userName: { fontSize: '15px', fontWeight: '700', color: 'white' },
  nav: { flex: 1, padding: '18px 10px', display: 'flex', flexDirection: 'column', gap: '2px' },
  navLabel: { fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.10em', padding: '10px 8px 5px', marginTop: '6px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '700' },
  navItemActive: { background: 'rgba(0,0,0,0.22)' },
  navIcon: { fontSize: '17px', width: '22px', textAlign: 'center' }
};

export default PatientSidebar;