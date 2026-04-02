import React, { useState } from 'react';
import API from '../services/api';
import logo from '../images/secure_ehr_logo.png';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    nationalId: '',
    bloodGroup: '',
    phoneNumber: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await API.post('/auth/register', formData);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>

      {/* LEFT PANEL */}
      <div style={styles.left}>
        <div style={styles.brand}>
          <img src={logo} alt="Secure EHR Logo" style={styles.logoImg} />
          <div>
            <div style={styles.brandName}>Secure EHR</div>
            <div style={styles.brandSub}>SMART HEALTHCARE RECORD<br />SYSTEM</div>
          </div>
        </div>

        <div style={styles.taglineSection}>
          <h1 style={styles.tagline}>Take control of your<br /><span style={styles.taglineLight}>health data.</span></h1>
          <p style={styles.taglineSub}>Create your free patient account today. Your records stay with you — not locked inside a single hospital.</p>
        </div>

        <div style={styles.steps}>
          <div style={styles.stepItem}><span style={styles.stepNum}>1</span> Register your account</div>
          <div style={styles.stepItem}><span style={styles.stepNum}>2</span> Upload your medical reports</div>
          <div style={styles.stepItem}><span style={styles.stepNum}>3</span> Share securely with doctors</div>
          <div style={styles.stepItem}><span style={styles.stepNum}>4</span> Revoke access anytime</div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.right}>
        <div style={styles.formWrapper}>
          <h2 style={styles.title}>Create your account</h2>
          <p style={styles.subtitle}>Patient registration</p>

          <div style={styles.secureNotice}>
            🔒 <strong>secure connection.</strong> your data is encrypted end-to-end with TLS 1.3.
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.successMsg}>{success}</div>}

          <form onSubmit={handleRegister}>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name *</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>👤</span>
                  <input style={styles.input} type="text" name="firstName" onChange={handleChange} required />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name *</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>👤</span>
                  <input style={styles.input} type="text" name="lastName" onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address *</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>✉</span>
                <input style={styles.input} type="email" name="email" onChange={handleChange} required />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>National ID (NIC) *</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>🪪</span>
                  <input style={styles.input} type="text" name="nationalId" onChange={handleChange} required />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Birth *</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>📅</span>
                  <input style={styles.input} type="date" name="dateOfBirth" onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Blood Group *</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🩸</span>
                <select style={styles.input} name="bloodGroup" onChange={handleChange} required>
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
              <label style={styles.label}>Password *</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input style={styles.input} type="password" name="password" onChange={handleChange} required />
              </div>
            </div>

            <div style={styles.checkboxRow}>
              <input type="checkbox" required />
              <span style={styles.checkboxText}>I agree to the Terms of Service and Privacy Policy. I understand my medical data will be stored securely and encrypted.</span>
            </div>

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={styles.loginLink}>
            Already have an account? <a href="/login" style={styles.link}>Sign in here</a>
          </p>
        </div>
      </div>

    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  left: { width: '42%', background: '#17a8c4', padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  brand: { display: 'flex', alignItems: 'center', gap: '14px' },
  logoImg: { width: '52px', height: '52px', objectFit: 'contain' },
  brandName: { fontSize: '26px', fontWeight: '800', color: 'white', letterSpacing: '-0.3px' },
  brandSub: { fontSize: '11px', fontWeight: '600', color: '#000000', letterSpacing: '0.05em', lineHeight: '1.4', marginTop: '2px' },
  taglineSection: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '40px' },
  tagline: { fontSize: '38px', fontWeight: '800', color: 'white', lineHeight: '1.2', marginBottom: '20px' },
  taglineLight: { fontWeight: '400' },
  taglineSub: { fontSize: '14.5px', color: 'rgba(255,255,255,0.80)', lineHeight: '1.7' },
  steps: { display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '10px' },
  stepItem: { fontSize: '13.5px', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '12px' },
  stepNum: { width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 },
  right: { width: '58%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflowY: 'auto' },
  formWrapper: { width: '100%', maxWidth: '480px' },
  title: { fontSize: '34px', fontWeight: '400', color: '#222', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: '#888', marginBottom: '20px' },
  secureNotice: { background: '#f8f8f8', border: '1px solid #eee', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#666', marginBottom: '22px' },
  error: { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' },
  successMsg: { background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#16a34a', marginBottom: '16px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' },
  inputWrapper: { display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: '9px', padding: '0 12px', background: 'white' },
  inputIcon: { fontSize: '15px', marginRight: '8px', color: '#aaa' },
  input: { flex: 1, padding: '11px 0', border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#333', background: 'transparent' },
  checkboxRow: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '18px', marginTop: '4px' },
  checkboxText: { fontSize: '12px', color: '#666', lineHeight: '1.5' },
  button: { width: '100%', padding: '13px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '9px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  loginLink: { textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#888' },
  link: { color: '#17a8c4', fontWeight: '700', textDecoration: 'none' }
};

export default Register;
