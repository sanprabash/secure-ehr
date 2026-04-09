import React, { useEffect, useState } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

function MyPatients() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 18) return 'good afternoon';
    return 'good evening';
  };

  const getDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/doctor/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getInitials = (patient) => {
    if (!patient) return 'PT';
    return `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`;
  };

  const avatarColors = ['#17a8c4', '#0f6b7d', '#1389a0', '#3dbfd8', '#0a3d47'];

  return (
    <div style={styles.container}>
      <DoctorSidebar />

      <div style={styles.main}>
        {/* TOPBAR */}
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>
            My Patients <span style={styles.greeting}>{getGreeting()}, Dr. {user?.lastName}</span>
          </div>
          <div style={styles.dateBox}>📅 {getDate()}</div>
        </div>

        <div style={styles.content}>

          {/* BANNER */}
          <div style={styles.banner}>
            <h2 style={styles.bannerTitle}>My Patients</h2>
            <p style={styles.bannerText}>
              Patients listed below have granted you access to their medical records.
              Access can be revoked by the patient at any time.
            </p>
          </div>

          {/* PATIENT COUNT */}
          <div style={styles.sectionTitle}>
            {patients.length} Patients with Active Consent
          </div>

          {/* LOADING */}
          {loading && <p style={styles.emptyMsg}>Loading patients...</p>}

          {/* EMPTY */}
          {!loading && patients.length === 0 && (
            <div style={styles.emptyCard}>
              No patients have granted you access yet.
            </div>
          )}

          {/* PATIENT LIST */}
          {patients.map((item, index) => (
            <div key={item.consentId} style={styles.patientCard}>
              <div
                style={{...styles.patientAvatar, background: avatarColors[index % avatarColors.length]}}
              >
                {getInitials(item.patient)}
              </div>

              <div style={styles.patientInfo}>
                <div style={styles.patientName}>
                  {item.patient?.firstName} {item.patient?.lastName}
                </div>
                <div style={styles.patientMeta}>
                  {item.patient?.bloodGroup && <span>🩸 {item.patient.bloodGroup}</span>}
                  {item.patient?.dateOfBirth && (
                    <span>📅 DOB: {new Date(item.patient.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  )}
                </div>
              </div>

              <div style={styles.consentInfo}>
                <div style={styles.consentLabel}>Access Granted</div>
                <div style={styles.consentDate}>
                  {new Date(item.grantedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              <button
                style={styles.btnView}
                onClick={() => navigate(`/doctor/patients/${item.patient?._id}/records`)}
              >
                View Records
              </button>
            </div>
          ))}

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
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#444', marginBottom: '16px' },
  emptyMsg: { fontSize: '14px', color: '#aaa', textAlign: 'center', padding: '40px 0' },
  emptyCard: { background: 'white', borderRadius: '12px', padding: '30px', textAlign: 'center', fontSize: '14px', color: '#aaa', border: '1px solid #eee' },
  patientCard: { background: 'white', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #eee' },
  patientAvatar: { width: '46px', height: '46px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: 'white', flexShrink: 0 },
  patientInfo: { flex: 1 },
  patientName: { fontSize: '15px', fontWeight: '700', color: '#222', marginBottom: '4px' },
  patientMeta: { fontSize: '12.5px', color: '#888', display: 'flex', gap: '16px' },
  consentInfo: { textAlign: 'right', marginRight: '16px' },
  consentLabel: { fontSize: '11px', color: '#aaa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' },
  consentDate: { fontSize: '13px', fontWeight: '700', color: '#444', marginTop: '3px' },
  btnView: { padding: '9px 20px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }
};

export default MyPatients;