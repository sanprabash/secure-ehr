import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import API from '../../services/api';

function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    slmcNumber: '',
    specialisation: '',
    hospital: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/admin/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setSuccess('');
    setError('');
    setTempPassword('');

    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/admin/doctors', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(response.data.message);
      setTempPassword(response.data.tempPassword);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        slmcNumber: '',
        specialisation: '',
        hospital: ''
      });
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add doctor');
    }
    setAddLoading(false);
  };

  const handleRemove = async (doctorId, doctorName) => {
    if (!window.confirm(`Are you sure you want to remove Dr. ${doctorName}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/admin/doctors/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDoctors();
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (doctor) => {
    return `${doctor.firstName?.[0] || ''}${doctor.lastName?.[0] || ''}`;
  };

  const avatarColors = ['#17a8c4', '#0f6b7d', '#1389a0', '#3dbfd8', '#0a3d47'];

  return (
    <div style={styles.container}>
      <AdminSidebar />

      <div style={styles.main}>
        {/* TOPBAR */}
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>Manage Doctors <span style={styles.greeting}>good morning</span></div>
          <div style={styles.dateBox}>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>

        <div style={styles.content}>

          {/* BANNER */}
          <div style={styles.banner}>
            <h2 style={styles.bannerTitle}>Manage Doctors</h2>
            <p style={styles.bannerText}>
              Add registered doctors from the Sri Lanka Medical Council registry. Login credentials are automatically sent to the doctor's email address upon adding.
            </p>
          </div>

          <div style={styles.twoCol}>

            {/* LEFT — Doctor list */}
            <div>
              <div style={styles.sectionTitle}>{doctors.length} Registered Doctors</div>

              {loading && <p style={styles.emptyMsg}>Loading doctors...</p>}

              {!loading && doctors.length === 0 && (
                <div style={styles.emptyCard}>No doctors registered yet.</div>
              )}

              {doctors.map((doctor, index) => (
                <div key={doctor._id} style={styles.doctorCard}>
                  <div style={{...styles.doctorAvatar, background: avatarColors[index % avatarColors.length]}}>
                    {getInitials(doctor)}
                  </div>
                  <div style={styles.doctorInfo}>
                    <div style={styles.doctorName}>Dr. {doctor.firstName} {doctor.lastName}</div>
                    <div style={styles.doctorMeta}>
                      <span>❤️ {doctor.specialisation}</span>
                      <span>🏥 {doctor.hospital}</span>
                      <span style={styles.slmcBadge}>{doctor.slmcNumber}</span>
                    </div>
                  </div>
                  <button
                    style={styles.btnRemove}
                    onClick={() => handleRemove(doctor._id, `${doctor.firstName} ${doctor.lastName}`)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* RIGHT — Add Doctor form */}
            <div style={styles.formPanel}>
              <div style={styles.formTitle}>Add New Doctor</div>
              <div style={styles.formSub}>Doctor will receive login credentials by email</div>

              {success && (
                <div style={styles.successMsg}>
                  {success}
                  {tempPassword && (
                    <div style={styles.tempPasswordBox}>
                      Temporary Password: <strong>{tempPassword}</strong>
                    </div>
                  )}
                </div>
              )}
              {error && <div style={styles.errorMsg}>{error}</div>}

              <form onSubmit={handleAddDoctor}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>First Name *</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>👤</span>
                      <input
                        style={styles.input}
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Last Name *</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>👤</span>
                      <input
                        style={styles.input}
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>✉</span>
                    <input
                      style={styles.input}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>SLMC Number *</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>🪪</span>
                    <input
                      style={styles.input}
                      type="text"
                      name="slmcNumber"
                      value={formData.slmcNumber}
                      onChange={handleChange}
                      placeholder="e.g. SLMC-12345"
                      required
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Specialisation *</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>🩺</span>
                    <input
                      style={styles.input}
                      type="text"
                      name="specialisation"
                      value={formData.specialisation}
                      onChange={handleChange}
                      placeholder="e.g. Cardiologist"
                      required
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Hospital / Institution *</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>🏥</span>
                    <input
                      style={styles.input}
                      type="text"
                      name="hospital"
                      value={formData.hospital}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <button style={styles.btnAdd} type="submit" disabled={addLoading}>
                  {addLoading ? 'Adding...' : '➕ Add Doctor & Send Credentials'}
                </button>

                <div style={styles.emailNotice}>
                  Login credentials will be <strong>automatically emailed</strong> to the doctor's address.
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
  topbar: { height: '52px', background: '#f0f0f0', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 28px', gap: '10px' },
  topbarTitle: { fontSize: '22px', fontWeight: '400', color: '#222', flex: 1 },
  greeting: { fontSize: '14px', color: '#888', fontWeight: '400' },
  dateBox: { fontSize: '13px', color: '#555', background: 'white', border: '1px solid #ddd', borderRadius: '6px', padding: '5px 12px' },
  content: { padding: '24px' },
  banner: { background: '#2d6b70', borderRadius: '14px', padding: '24px 28px', marginBottom: '22px' },
  bannerTitle: { fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '6px' },
  bannerText: { fontSize: '13.5px', color: 'rgba(255,255,255,0.78)', lineHeight: '1.6' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#444', marginBottom: '16px' },
  emptyMsg: { fontSize: '14px', color: '#aaa', textAlign: 'center', padding: '40px 0' },
  emptyCard: { background: 'white', borderRadius: '12px', padding: '30px', textAlign: 'center', fontSize: '14px', color: '#aaa', border: '1px solid #eee' },
  doctorCard: { background: 'white', borderRadius: '12px', padding: '16px 18px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #eee' },
  doctorAvatar: { width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0 },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: '14px', fontWeight: '700', color: '#222', marginBottom: '4px' },
  doctorMeta: { fontSize: '12px', color: '#888', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  slmcBadge: { background: '#f3f0ff', color: '#6d28d9', borderRadius: '5px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' },
  btnRemove: { padding: '7px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '7px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  formPanel: { background: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #eee' },
  formTitle: { fontSize: '15px', fontWeight: '700', color: '#222', marginBottom: '4px' },
  formSub: { fontSize: '12px', color: '#888', marginBottom: '18px' },
  successMsg: { background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#16a34a', marginBottom: '16px' },
  tempPasswordBox: { marginTop: '8px', padding: '8px', background: 'white', borderRadius: '6px', fontSize: '13px', color: '#222', border: '1px solid #86efac' },
  errorMsg: { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr', gap: '10px' },
  formGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '6px' },
  inputWrapper: { display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: '9px', padding: '0 12px', background: 'white' },
  inputIcon: { fontSize: '15px', marginRight: '8px', color: '#aaa' },
  input: { flex: 1, padding: '10px 0', border: 'none', outline: 'none', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#333', background: 'transparent' },
  btnAdd: { width: '100%', padding: '12px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '9px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' },
  emailNotice: { fontSize: '12px', color: '#888', textAlign: 'center', lineHeight: '1.5' }
};

export default ManageDoctors;