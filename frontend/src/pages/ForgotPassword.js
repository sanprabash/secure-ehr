import React, { useState } from 'react';
import API from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const response = await API.post('/auth/forgot-password', { email });
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.header}>
          <div style={styles.logo}>🏥</div>
          <h1 style={styles.title}>Secure EHR</h1>
          <p style={styles.subtitle}>Reset Your Password</p>
        </div>

        {success ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <p style={styles.successText}>{success}</p>
            <p style={styles.successSub}>Please check your email inbox and spam folder.</p>
            <a href="/login" style={styles.backLink}>← Back to Login</a>
          </div>
        ) : (
          <>
            <p style={styles.description}>
              Enter your registered email address and we will send you a link to reset your password.
            </p>

            {error && <div style={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>✉</span>
                  <input
                    style={styles.input}
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                style={styles.btnSubmit}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <a href="/login" style={styles.backLink}>← Back to Login</a>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '20px' },
  card: { background: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  header: { textAlign: 'center', marginBottom: '28px' },
  logo: { fontSize: '48px', marginBottom: '12px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#2d6b70', margin: '0 0 6px' },
  subtitle: { fontSize: '14px', color: '#888', margin: 0 },
  description: { fontSize: '13px', color: '#666', lineHeight: '1.6', marginBottom: '24px', textAlign: 'center' },
  errorMsg: { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '6px' },
  inputWrapper: { display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: '10px', padding: '0 12px', background: 'white' },
  inputIcon: { fontSize: '16px', marginRight: '8px', color: '#aaa' },
  input: { flex: 1, padding: '11px 0', border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#333' },
  btnSubmit: { width: '100%', padding: '12px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '16px' },
  backLink: { display: 'block', textAlign: 'center', fontSize: '13px', color: '#17a8c4', textDecoration: 'none', fontWeight: '600' },
  successBox: { textAlign: 'center', padding: '10px 0' },
  successIcon: { fontSize: '48px', marginBottom: '16px' },
  successText: { fontSize: '14px', color: '#16a34a', fontWeight: '600', marginBottom: '8px' },
  successSub: { fontSize: '13px', color: '#888', marginBottom: '24px' }
};

export default ForgotPassword;