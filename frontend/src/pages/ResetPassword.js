import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      await API.get(`/auth/reset-password/${token}`);
      setTokenValid(true);
    } catch (err) {
      setTokenValid(false);
    }
    setVerifying(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/auth/reset-password', { token, newPassword });
      setSuccess(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (verifying) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.verifyingText}>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.logo}>🏥</div>
            <h1 style={styles.title}>Secure EHR</h1>
          </div>
          <div style={styles.errorBox}>
            <div style={styles.errorIcon}>❌</div>
            <p style={styles.errorTitle}>Invalid or Expired Link</p>
            <p style={styles.errorSub}>This password reset link is invalid or has expired. Please request a new one.</p>
            <a href="/forgot-password" style={styles.btnLink}>Request New Reset Link</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.header}>
          <div style={styles.logo}>🏥</div>
          <h1 style={styles.title}>Secure EHR</h1>
          <p style={styles.subtitle}>Set New Password</p>
        </div>

        {success ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <p style={styles.successText}>{success}</p>
            <p style={styles.successSub}>Redirecting to login page in 3 seconds...</p>
          </div>
        ) : (
          <>
            {error && <div style={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>New Password</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>🔑</span>
                  <input
                    style={styles.input}
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>🔑</span>
                  <input
                    style={styles.input}
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                style={styles.btnSubmit}
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
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
  verifyingText: { textAlign: 'center', color: '#888', fontSize: '14px' },
  errorBox: { textAlign: 'center' },
  errorIcon: { fontSize: '48px', marginBottom: '16px' },
  errorTitle: { fontSize: '16px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' },
  errorSub: { fontSize: '13px', color: '#888', marginBottom: '24px', lineHeight: '1.6' },
  btnLink: { display: 'inline-block', padding: '12px 24px', background: '#17a8c4', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' },
  errorMsg: { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '6px' },
  inputWrapper: { display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: '10px', padding: '0 12px', background: 'white' },
  inputIcon: { fontSize: '16px', marginRight: '8px', color: '#aaa' },
  input: { flex: 1, padding: '11px 0', border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#333' },
  btnSubmit: { width: '100%', padding: '12px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  successBox: { textAlign: 'center', padding: '10px 0' },
  successIcon: { fontSize: '48px', marginBottom: '16px' },
  successText: { fontSize: '14px', color: '#16a34a', fontWeight: '600', marginBottom: '8px' },
  successSub: { fontSize: '13px', color: '#888' }
};

export default ResetPassword;