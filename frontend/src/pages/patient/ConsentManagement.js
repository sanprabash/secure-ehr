import React, { useEffect, useState } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import API from '../../services/api';

function ConsentManagement() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [consents, setConsents] = useState([]);
  const [slmcInput, setSlmcInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [loading, setLoading] = useState(false);
  const [grantLoading, setGrantLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 18) return 'good afternoon';
    return 'good evening';
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  const fetchConsents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/patient/consents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConsents(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!slmcInput.trim()) return;
    setLoading(true);
    setSearchResult(null);
    setSearchError('');

    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`/patient/doctors/search?slmc=${slmcInput}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResult(response.data);
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Doctor not found');
    }
    setLoading(false);
  };

  const handleGrant = async () => {
    setGrantLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/patient/consents',
        { slmcNumber: slmcInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setSlmcInput('');
      setSearchResult(null);
      fetchConsents();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to grant access');
    }
    setGrantLoading(false);
  };

  const handleRevoke = async (consentId) => {
    try {
      const token = localStorage.getItem('token');
      await API.put(`/patient/consents/${consentId}/revoke`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchConsents();
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (doctor) => {
    if (!doctor) return 'DR';
    return `${doctor.firstName?.[0] || ''}${doctor.lastName?.[0] || ''}`;
  };

  return (
    <div style={styles.container}>
      <PatientSidebar />

      <div style={styles.main}>
        {/* TOPBAR */}
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>
            Consent Management <span style={styles.greeting}>{getGreeting()}, {user?.firstName}</span>
          </div>
        </div>

        <div style={styles.content}>

          {/* BANNER */}
          <div style={styles.banner}>
            <h2 style={styles.bannerTitle}>Consent Management</h2>
            <p style={styles.bannerText}>
              No doctor can view your records without your explicit permission. When you grant access, the doctor can view all your uploaded records. Revoking access immediately removes their ability to view your data.
            </p>
          </div>

          <div style={styles.twoCol}>

            {/* LEFT — Active consents */}
            <div>
              <div style={styles.sectionTitle}>
                Active Doctor Access
                <span style={styles.sectionCount}>{consents.length} doctor{consents.length !== 1 ? 's' : ''} can currently view your records</span>
              </div>

              {consents.length === 0 && (
                <div style={styles.emptyMsg}>No active consents. Grant access to a doctor using the panel on the right.</div>
              )}

              {consents.map(consent => (
                <div key={consent._id} style={styles.consentCard}>
                  <div style={styles.doctorHeader}>
                    <div style={styles.doctorAvatar}>{getInitials(consent.doctorId)}</div>
                    <div style={styles.doctorInfo}>
                      <div style={styles.doctorName}>Dr. {consent.doctorId?.firstName} {consent.doctorId?.lastName}</div>
                      <div style={styles.doctorMeta}>{consent.doctorId?.specialisation}</div>
                      <div style={styles.doctorMeta}>{consent.doctorId?.hospital}</div>
                    </div>
                  </div>

                  <div style={styles.consentMeta}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Granted On</span>
                      <span style={styles.metaValue}>{new Date(consent.grantedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>SLMC No.</span>
                      <span style={styles.metaValue}>{consent.doctorId?.slmcNumber}</span>
                    </div>
                  </div>

                  <div style={styles.consentBtns}>
                    <button
                      style={styles.btnRevoke}
                      onClick={() => handleRevoke(consent._id)}
                    >
                      🚫 Revoke Access
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT — Grant new access */}
            <div style={styles.grantPanel}>
              <div style={styles.grantTitle}>Grant New Access</div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Search Doctor *</label>
                <div style={styles.searchRow}>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>🔍</span>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="e.g. SLMC-22891"
                      value={slmcInput}
                      onChange={(e) => {
                        setSlmcInput(e.target.value);
                        setSearchResult(null);
                        setSearchError('');
                      }}
                    />
                  </div>
                  <button style={styles.btnSearch} onClick={handleSearch} disabled={loading}>
                    {loading ? '...' : 'Search'}
                  </button>
                </div>
                <div style={styles.searchHint}>Only doctors registered in the system can be granted access</div>
              </div>

              {searchError && <div style={styles.searchError}>{searchError}</div>}

              {searchResult && (
                <div style={styles.searchResult}>
                  <div style={styles.resultAvatar}>
                    {searchResult.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={styles.resultInfo}>
                    <div style={styles.resultName}>{searchResult.name}</div>
                    <div style={styles.resultMeta}>{searchResult.specialisation}</div>
                    <div style={styles.resultMeta}>{searchResult.hospital}</div>
                    <div style={styles.slmcBadge}>✅ SLMC {searchResult.slmcNumber}</div>
                  </div>
                </div>
              )}

              {message && (
                <div style={message.includes('granted') ? styles.successMsg : styles.errorMsg}>
                  {message}
                </div>
              )}

              {searchResult && (
                <button
                  style={styles.btnGrant}
                  onClick={handleGrant}
                  disabled={grantLoading}
                >
                  🔑 {grantLoading ? 'Granting...' : `Grant Access to ${searchResult.name}`}
                </button>
              )}
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
  banner: { background: '#2d6b70', borderRadius: '14px', padding: '24px 28px', marginBottom: '22px' },
  bannerTitle: { fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '6px' },
  bannerText: { fontSize: '13.5px', color: 'rgba(255,255,255,0.78)', lineHeight: '1.6' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' },
  sectionTitle: { fontSize: '14px', fontWeight: '700', color: '#444', marginBottom: '4px' },
  sectionCount: { display: 'block', fontSize: '12px', color: '#aaa', fontWeight: '400', marginBottom: '14px' },
  emptyMsg: { fontSize: '13px', color: '#aaa', padding: '20px', background: 'white', borderRadius: '12px', textAlign: 'center', border: '1px solid #eee' },
  consentCard: { background: 'white', borderRadius: '12px', padding: '18px 20px', marginBottom: '12px', border: '1px solid #eee' },
  doctorHeader: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' },
  doctorAvatar: { width: '42px', height: '42px', borderRadius: '50%', background: '#17a8c4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0 },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: '15px', fontWeight: '700', color: '#222', marginBottom: '3px' },
  doctorMeta: { fontSize: '12px', color: '#888' },
  consentMeta: { display: 'flex', gap: '24px', marginBottom: '14px' },
  metaItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  metaLabel: { fontSize: '11px', color: '#aaa', fontWeight: '600' },
  metaValue: { fontSize: '13px', color: '#444', fontWeight: '700' },
  consentBtns: { display: 'flex', gap: '8px' },
  btnRevoke: { padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  grantPanel: { background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #eee' },
  grantTitle: { fontSize: '15px', fontWeight: '700', color: '#222', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' },
  formGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '6px' },
  searchRow: { display: 'flex', gap: '8px' },
  inputWrapper: { flex: 1, display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: '9px', padding: '0 12px', background: 'white' },
  inputIcon: { fontSize: '14px', marginRight: '8px', color: '#aaa' },
  input: { flex: 1, padding: '9px 0', border: 'none', outline: 'none', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#333' },
  btnSearch: { padding: '9px 16px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '9px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  searchHint: { fontSize: '11px', color: '#aaa', marginTop: '6px' },
  searchError: { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#dc2626', marginBottom: '12px' },
  searchResult: { background: '#f8f8f8', borderRadius: '10px', padding: '14px', marginBottom: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' },
  resultAvatar: { width: '38px', height: '38px', borderRadius: '50%', background: '#17a8c4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: 'white', flexShrink: 0 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: '14px', fontWeight: '700', color: '#222', marginBottom: '3px' },
  resultMeta: { fontSize: '12px', color: '#888' },
  slmcBadge: { fontSize: '11px', fontWeight: '700', color: '#17a8c4', marginTop: '6px' },
  successMsg: { background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#16a34a', marginBottom: '12px' },
  errorMsg: { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#dc2626', marginBottom: '12px' },
  btnGrant: { width: '100%', padding: '11px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '9px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }
};

export default ConsentManagement;