import React, { useState } from 'react';
import API from '../services/api';
import logo from '../images/secure_ehr_logo.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'patient') {
        window.location.href = '/patient/dashboard';
      } else if (user.role === 'doctor') {
        window.location.href = '/doctor/dashboard';
      } else if (user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
          <h1 style={styles.tagline}>Your health records,<br /><span style={styles.taglineLight}>always with you.</span></h1>
          <p style={styles.taglineSub}>Access your complete medical history securely from anywhere. Share records with your doctors — on your terms.</p>
        </div>

        <div style={styles.features}>
          <div style={styles.featureItem}>🔒 Patient-controlled consent</div>
          <div style={styles.featureItem}>☑ AES-256 encrypted records</div>
          <div style={styles.featureItem}>📄 Lifelong medical history</div>
          <div style={styles.featureItem}>🏥 Designed for Sri Lanka</div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.right}>
        <div style={styles.formWrapper}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to your account to access your health records</p>

          <div style={styles.secureNotice}>
            🔒 <strong>secure connection.</strong> your data is encrypted end-to-end with TLS 1.3.
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>✉</span>
                <input
                  style={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔑</span>
                <input
                  style={styles.input}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>New to Secure EHR?</span>
            <span style={styles.dividerLine}></span>
          </div>

          <p style={styles.registerLink}>
            Don't have an account? <a href="/register" style={styles.link}>Create one here</a>
          </p>
        </div>
      </div>

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif"
  },
  // LEFT
  left: {
    width: '42%',
    background: '#17a8c4',
    padding: '40px 44px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  logoImg: {
    width: '52px',
    height: '52px',
    objectFit: 'contain'
  },
  brandName: {
    fontSize: '26px',
    fontWeight: '800',
    color: 'white',
    letterSpacing: '-0.3px'
  },
  brandSub: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#000000',
    letterSpacing: '0.05em',
    lineHeight: '1.4',
    marginTop: '2px'
  },
  taglineSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingTop: '40px'
  },
  tagline: {
    fontSize: '38px',
    fontWeight: '800',
    color: 'white',
    lineHeight: '1.2',
    marginBottom: '20px'
  },
  taglineLight: {
    fontWeight: '400'
  },
  taglineSub: {
    fontSize: '14.5px',
    color: 'rgba(255,255,255,0.80)',
    lineHeight: '1.7'
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingBottom: '10px'
  },
  featureItem: {
    fontSize: '13.5px',
    color: 'rgba(255,255,255,0.85)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  // RIGHT
  right: {
    width: '58%',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  },
  formWrapper: {
    width: '100%',
    maxWidth: '440px'
  },
  title: {
    fontSize: '34px',
    fontWeight: '400',
    color: '#222',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '24px'
  },
  secureNotice: {
    background: '#f8f8f8',
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '12px',
    color: '#666',
    marginBottom: '28px'
  },
  error: {
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#dc2626',
    marginBottom: '16px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#444',
    marginBottom: '7px'
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid #ddd',
    borderRadius: '9px',
    padding: '0 12px',
    background: 'white'
  },
  inputIcon: {
    fontSize: '15px',
    marginRight: '8px',
    color: '#aaa'
  },
  input: {
    flex: 1,
    padding: '11px 0',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    color: '#333'
  },
  button: {
    width: '100%',
    padding: '13px',
    background: '#17a8c4',
    color: 'white',
    border: 'none',
    borderRadius: '9px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    fontFamily: 'Inter, sans-serif'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0 16px'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#eee',
    display: 'block'
  },
  dividerText: {
    fontSize: '12px',
    color: '#aaa',
    whiteSpace: 'nowrap'
  },
  registerLink: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#888'
  },
  link: {
    color: '#17a8c4',
    fontWeight: '700',
    textDecoration: 'none'
  }
};

export default Login;