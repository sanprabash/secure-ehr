import React, { useState } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import API from '../../services/api';

function MyProfile() {
  const user = JSON.parse(localStorage.getItem('user'));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 18) return 'good afternoon';
    return 'good evening';
  };

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    phoneNumber: user?.phoneNumber || '',
    nationalId: user?.nationalId || '',
    bloodGroup: user?.bloodGroup || '',
    address: user?.address || ''
  });

  const [emergencyContact, setEmergencyContact] = useState({
    name: user?.emergencyContact?.name || '',
    relationship: user?.emergencyContact?.relationship || '',
    phone: user?.emergencyContact?.phone || '',
    email: user?.emergencyContact?.email || ''
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
  const [loading, setLoading] = useState(false);
  const [emergencyMsg, setEmergencyMsg] = useState('');
  const [emergencyError, setEmergencyError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmergencyChange = (e) => {
    setEmergencyContact({ ...emergencyContact, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      await API.put('/patient/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    }
    setLoading(false);
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
      await API.put('/patient/change-password', {
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

  const handleEmergencySave = async () => {
    setEmergencyMsg('');
    setEmergencyError('');
    try {
      const token = localStorage.getItem('token');
      await API.put('/patient/emergency-contact', emergencyContact, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmergencyMsg('Emergency contact saved successfully');
    } catch (err) {
      setEmergencyError('Failed to save emergency contact');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This will permanently delete all your medical records, consents and notifications. This action cannot be undone.'
    );
    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      'This is your final warning. All your data will be permanently deleted. Are you absolutely sure?'
    );
    if (!doubleConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      await API.delete('/patient/account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (err) {
      alert('Failed to delete account. Please try again.');
    }
  };

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'SP';

  return (
    <div style={styles.container}>
      <PatientSidebar />

      <div style={styles.main}>
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>
            My Profile <span style={styles.greeting}>{getGreeting()}, {user?.firstName}</span>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.twoCol}>

            {/* LEFT */}
            <div>
              <div style={styles.profileCard}>
                <div style={styles.avatar}>{initials}</div>
                <div style={styles.profileName}>{user?.firstName} {user?.lastName}</div>
                <div style={styles.profileRole}>Patient</div>
                <div style={styles.profileStats}>
                  <div style={styles.statRow}>
                    <span style={styles.statLabel}>Blood Group</span>
                    <span style={styles.statValue}>{user?.bloodGroup || 'Not set'}</span>
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

              {/* Danger Zone */}
              <div style={styles.dangerCard}>
                <div style={styles.dangerTitle}>⚠ Danger Zone</div>
                <p style={styles.dangerText}>
                  Permanently deleting your account will remove all your medical records, consent history, and personal data from our system. This action cannot be undone. Please download your records before proceeding.
                </p>
                <button style={styles.btnDelete} onClick={handleDeleteAccount}>
                  Delete Account
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Personal Information */}
              <div style={styles.infoCard}>
                <div style={styles.cardTitle}>👤 Personal Information</div>
                <div style={styles.cardSub}>Basic details associated with your account</div>

                {success && <div style={styles.successMsg}>{success}</div>}
                {error && <div style={styles.errorMsg}>{error}</div>}

                <form onSubmit={handleSave}>
                  <div style={styles.formGrid}>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>First Name</label>
                      <div style={styles.inputWrapper}>
                        <span style={styles.inputIcon}>👤</span>
                        <input
                          style={styles.input}
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="First name"
                        />
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Last Name</label>
                      <div style={styles.inputWrapper}>
                        <span style={styles.inputIcon}>👤</span>
                        <input
                          style={styles.input}
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Email Address</label>
                      <div style={styles.inputWrapper}>
                        <span style={styles.inputIcon}>✉</span>
                        <input
                          style={styles.input}
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Date of Birth</label>
                      <div style={styles.inputWrapper}>
                        <span style={styles.inputIcon}>📅</span>
                        <input
                          style={styles.input}
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>National Identity Card (NIC)</label>
                      <div style={styles.inputWrapper}>
                        <span style={styles.inputIcon}>🪪</span>
                        <input
                          style={styles.input}
                          type="text"
                          name="nationalId"
                          value={formData.nationalId}
                          onChange={handleChange}
                          placeholder="982345678V"
                        />
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Blood Group</label>
                      <div style={styles.inputWrapper}>
                        <span style={styles.inputIcon}>🩸</span>
                        <select
                          style={styles.input}
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                        >
                          <option value="">Select blood group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Phone Number</label>
                      <div style={styles.inputWrapper}>
                        <span style={styles.inputIcon}>📞</span>
                        <input
                          style={styles.input}
                          type="text"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          placeholder="+94 77 123 4567"
                        />
                      </div>
                    </div>

                    <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                      <label style={styles.label}>Home Address</label>
                      <div style={styles.inputWrapper}>
                        <span style={styles.inputIcon}>📍</span>
                        <input
                          style={styles.input}
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="No. 14, Galle Road, Colombo 03"
                        />
                      </div>
                    </div>

                  </div>

                  <div style={styles.btnRow}>
                    <button
                      type="button"
                      style={styles.btnCancel}
                      onClick={() => window.location.reload()}
                    >
                      Cancel
                    </button>
                    <button type="submit" style={styles.btnSave} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Emergency Contact */}
              <div style={styles.infoCard}>
                <div style={styles.cardTitle}>🚨 Emergency Contact</div>
                <div style={styles.cardSub}>Person to contact in case of emergency</div>

                {emergencyMsg && <div style={styles.successMsg}>{emergencyMsg}</div>}
                {emergencyError && <div style={styles.errorMsg}>{emergencyError}</div>}

                <div style={styles.formGrid}>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Contact Name</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>👤</span>
                      <input
                        style={styles.input}
                        type="text"
                        name="name"
                        value={emergencyContact.name}
                        onChange={handleEmergencyChange}
                        placeholder="Full name"
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Relationship</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>👨‍👩‍👧</span>
                      <select
                        style={styles.input}
                        name="relationship"
                        value={emergencyContact.relationship}
                        onChange={handleEmergencyChange}
                      >
                        <option value="">Select relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Child">Child</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Contact Phone</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>📞</span>
                      <input
                        style={styles.input}
                        type="text"
                        name="phone"
                        value={emergencyContact.phone}
                        onChange={handleEmergencyChange}
                        placeholder="+94 71 987 6543"
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Contact Email</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>✉</span>
                      <input
                        style={styles.input}
                        type="email"
                        name="email"
                        value={emergencyContact.email}
                        onChange={handleEmergencyChange}
                        placeholder="contact@email.com"
                      />
                    </div>
                  </div>

                </div>

                <div style={styles.btnRow}>
                  <button style={styles.btnSave} onClick={handleEmergencySave}>
                    Save Emergency Contact
                  </button>
                </div>
              </div>

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
  statValue: { fontWeight: '700', color: 'white' },
  securityCard: { background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #eee', marginBottom: '16px' },
  secTitle: { fontSize: '14px', fontWeight: '700', color: '#222', marginBottom: '3px' },
  secSub: { fontSize: '11.5px', color: '#888', marginBottom: '14px' },
  secRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#444' },
  btnChange: { padding: '6px 14px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '7px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  dangerCard: { background: 'white', borderRadius: '14px', padding: '20px', border: '1.5px solid #fca5a5' },
  dangerTitle: { fontSize: '14px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' },
  dangerText: { fontSize: '12px', color: '#666', lineHeight: '1.6', marginBottom: '14px' },
  btnDelete: { width: '100%', padding: '9px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  infoCard: { background: 'white', borderRadius: '14px', padding: '22px 24px', border: '1px solid #eee' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#222', marginBottom: '3px' },
  cardSub: { fontSize: '12px', color: '#888', marginBottom: '18px' },
  successMsg: { background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#16a34a', marginBottom: '16px' },
  errorMsg: { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#444' },
  inputWrapper: { display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: '8px', padding: '0 12px', background: 'white' },
  inputIcon: { fontSize: '15px', marginRight: '8px', color: '#aaa' },
  input: { flex: 1, padding: '9px 0', border: 'none', outline: 'none', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#333', background: 'transparent' },
  btnRow: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' },
  btnCancel: { padding: '10px 22px', background: 'white', color: '#555', border: '1.5px solid #ddd', borderRadius: '9px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  btnSave: { padding: '10px 22px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '9px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }
};

export default MyProfile;