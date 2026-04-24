import React, { useState } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import API from '../../services/api';

function DoctorMyProfile() {
  const user = JSON.parse(localStorage.getItem('user'));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 18) return 'good afternoon';
    return 'good evening';
  };

  const [formData, setFormData] = useState({
    phoneNumber: user?.phoneNumber || ''
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      await API.put('/doctor/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await API.put('/doctor/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswordMsg('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const getHospitalDisplay = () => {
    if (Array.isArray(user?.hospital)) return user.hospital.join(', ');
    return user?.hospital || '';
  };

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'DR';

  return (
    <div style={styles.container}>
      <DoctorSidebar />

      <div style={styles.main}>
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>
            My Profile <span style={styles.greeting}>{getGreeting()}, Dr. {user?.lastName}</span>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.twoCol}>

            {/* LEFT */}
            <div>
              <div style={styles.profileCard}>
                <div style={styles.avatar}>{initials}</div>
                <div style={styles.profileName}>Dr. {user?.firstName} {user?.lastName}</div>
                <div style={styles.profileRole}>{user?.specialisation}</div>
                <div style={styles.profileStats}>
                  <div style={styles.statRow}>
                    <span style={styles.statLabel}>Hospital</span>
                    <span style={styles.statValue}>{getHospitalDisplay()}</span>
                  </div>
                  <div style={styles.statRow}>
                    <span style={styles.statLabel}>SLMC No.</span>
                    <span style={styles.statValue}>{user?.slmcNumber}</span>
                  </div>
                  <div style={styles.statRow}>
                    <span style={styles.statLabel}>Last login</span>
                    <span style={styles.statValue}>Today</span>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div style={styles.securityCard}>
                <div style={styles.secTitle}>🔐 Security Settings</div>
                <div style={styles.secSub}>Manage your account security</div>
                <div style={styles.secRow}>
                  <span>Password</span>
                  <button
                    style={styles.btnChange}
                    onClick={() => {
                      setShowPasswordForm(!showPasswordForm);
                      setPasswordMsg('');
                      setPasswordError('');
                    }}
                  >
                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                  </button>
                </div>

                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} style={{ marginTop: '16px' }}>
                    {passwordMsg && <div style={styles.successMsg}>{passwordMsg}</div>}
                    {passwordError && <div style={styles.errorMsg}>{passwordError}</div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={styles.inputWrapper}>
                        <span style={styles.inputIcon}>🔒</span>
                        <input
                          style={styles.input}
                          type="password"
                          placeholder="Current password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div style={styles.inputWrapper}>
                        <span style={styles.inputIcon}>🔑</span>
                        <input
                          style={styles.input}
                          type="password"
                          placeholder="New password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div style={styles.inputWrapper}>
                        <span style={styles.inputIcon}>🔑</span>
                        <input
                          style={styles.input}
                          type="password"
                          placeholder="Confirm new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          required
                        />
                      </div>
                      <button type="submit" style={styles.btnSave}>Update Password</button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div style={styles.infoCard}>
              <div style={styles.cardTitle}>🩺 Professional Information</div>
              <div style={styles.cardSub}>Official details set by Ministry of Health — contact admin to update</div>

              {success && <div style={styles.successMsg}>{success}</div>}
              {error && <div style={styles.errorMsg}>{error}</div>}

              <form onSubmit={handleSave}>
                <div style={styles.formGrid}>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name 🔒</label>
                    <div style={styles.lockedInput}>
                      <span>Dr. {user?.firstName} {user?.lastName}</span>
                      <span style={styles.lockedBadge}>Locked</span>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>SLMC Number 🔒</label>
                    <div style={styles.lockedInput}>
                      <span>{user?.slmcNumber}</span>
                      <span style={styles.lockedBadge}>Locked</span>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Specialisation 🔒</label>
                    <div style={styles.lockedInput}>
                      <span>{user?.specialisation}</span>
                      <span style={styles.lockedBadge}>Locked</span>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address 🔒</label>
                    <div style={styles.lockedInput}>
                      <span>{user?.email}</span>
                      <span style={styles.lockedBadge}>Locked</span>
                    </div>
                  </div>

                  <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                    <label style={styles.label}>Hospital / Institution 🔒</label>
                    {Array.isArray(user?.hospital) && user.hospital.length > 1 ? (
                      user.hospital.map((h, i) => (
                        <div
                          key={i}
                          style={{...styles.lockedInput, marginBottom: i < user.hospital.length - 1 ? '6px' : '0'}}
                        >
                          <span>{h}</span>
                          <span style={styles.lockedBadge}>
                            {i === 0 ? 'Primary' : 'Secondary'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div style={styles.lockedInput}>
                        <span>{Array.isArray(user?.hospital) ? user.hospital[0] : user?.hospital}</span>
                        <span style={styles.lockedBadge}>Locked</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>📞</span>
                      <input
                        style={styles.input}
                        type="text"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        placeholder="+94 77 456 7890"
                      />
                    </div>
                  </div>

                </div>

                <div style={styles.lockNotice}>
                  🔒 Locked fields are set by the Ministry of Health IT Department. To request a change, contact your system administrator.
                </div>

                <div style={styles.btnRow}>
                  <button type="button" style={styles.btnCancel} onClick={() => window.location.reload()}>Cancel</button>
                  <button type="submit" style={styles.btnSave}>Save Changes</button>
                </div>
              </form>
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
  topbar: { height: '52px', background: '#f0f0f0', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 28px' },
  topbarTitle: { fontSize: '22px', fontWeight: '400', color: '#222', flex: 1 },
  greeting: { fontSize: '14px', color: '#888', fontWeight: '400' },
  content: { padding: '24px' },
  twoCol: { display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' },
  profileCard: { background: '#2d6b70', borderRadius: '14px', padding: '24px 20px', textAlign: 'center', marginBottom: '16px' },
  avatar: { width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: 'white', margin: '0 auto 14px' },
  profileName: { fontSize: '17px', fontWeight: '700', color: 'white', marginBottom: '4px' },
  profileRole: { fontSize: '13px', color: 'rgba(255,255,255,0.72)', marginBottom: '16px' },
  profileStats: { borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' },
  statRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px' },
  statLabel: { color: 'rgba(255,255,255,0.65)' },
  statValue: { fontWeight: '700', color: 'white', textAlign: 'right', maxWidth: '150px' },
  securityCard: { background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #eee' },
  secTitle: { fontSize: '14px', fontWeight: '700', color: '#222', marginBottom: '3px' },
  secSub: { fontSize: '11.5px', color: '#888', marginBottom: '14px' },
  secRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#444' },
  btnChange: { padding: '6px 14px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '7px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  infoCard: { background: 'white', borderRadius: '14px', padding: '22px 24px', border: '1px solid #eee' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#222', marginBottom: '3px' },
  cardSub: { fontSize: '12px', color: '#888', marginBottom: '18px' },
  successMsg: { background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#16a34a', marginBottom: '16px' },
  errorMsg: { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#444' },
  lockedInput: { padding: '9px 12px', border: '1.5px solid #eee', borderRadius: '8px', fontSize: '13px', color: '#999', background: '#f8f8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  lockedBadge: { fontSize: '10px', fontWeight: '700', background: '#f0f0f0', color: '#aaa', borderRadius: '5px', padding: '2px 7px', flexShrink: 0, marginLeft: '8px' },
  inputWrapper: { display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: '8px', padding: '0 12px', background: 'white' },
  inputIcon: { fontSize: '15px', marginRight: '8px', color: '#aaa' },
  input: { flex: 1, padding: '9px 0', border: 'none', outline: 'none', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#333', background: 'transparent' },
  lockNotice: { background: '#f8f8f8', border: '1.5px solid #ebebeb', borderRadius: '9px', padding: '10px 14px', fontSize: '12px', color: '#888', marginTop: '14px' },
  btnRow: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' },
  btnCancel: { padding: '10px 22px', background: 'white', color: '#555', border: '1.5px solid #ddd', borderRadius: '9px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  btnSave: { padding: '10px 22px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '9px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }
};

export default DoctorMyProfile;