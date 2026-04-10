import React, { useEffect, useState } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import API from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function ViewPatientRecords() {
  const user = JSON.parse(localStorage.getItem('user'));
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All Records');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    recordType: '',
    description: '',
    recordDate: ''
  });
  const [addSuccess, setAddSuccess] = useState('');
  const [addError, setAddError] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 18) return 'good afternoon';
    return 'good evening';
  };

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`/doctor/patients/${patientId}/records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(response.data);
      setFiltered(response.data);
      if (response.data.length > 0) setSelected(response.data[0]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filterRecords = (type) => {
    setActiveFilter(type);
    if (type === 'All Records') {
      setFiltered(records);
    } else {
      setFiltered(records.filter(r => r.recordType === type));
    }
  };

  const countByType = (type) => records.filter(r => r.recordType === type).length;

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Lab Result': return '🧪';
      case 'Imaging': return '🖼';
      case 'Prescription': return '💊';
      case 'Clinical Note': return '📋';
      default: return '📄';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'Lab Result': return { background: '#e8f8fb', color: '#0f6b7d' };
      case 'Imaging': return { background: '#f0fdf4', color: '#166534' };
      case 'Prescription': return { background: '#fef9c3', color: '#854d0e' };
      case 'Clinical Note': return { background: '#f5f3ff', color: '#6d28d9' };
      default: return { background: '#f0f0f0', color: '#555' };
    }
  };

  const groupByMonth = (records) => {
    const groups = {};
    records.forEach(record => {
      const date = new Date(record.recordDate);
      const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(record);
    });
    return groups;
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    try {
      const token = localStorage.getItem('token');
      await API.post(`/doctor/patients/${patientId}/records`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddSuccess('Record added successfully');
      setFormData({ title: '', recordType: '', description: '', recordDate: '' });
      setShowAddRecord(false);
      fetchRecords();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add record');
    }
  };

  const handleViewFile = async (record) => {
    if (!record.fileName) {
      alert('No file attached to this record.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(
        `/doctor/patients/${patientId}/records/${record._id}/file`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: record.fileType })
      );
      window.open(url, '_blank');
    } catch (err) {
      alert('Could not load file. The patient may have revoked consent.');
    }
  };

  const handleDownloadFile = async (record) => {
    if (!record.fileName) {
      alert('No file attached to this record.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(
        `/doctor/patients/${patientId}/records/${record._id}/file`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = record.fileName;
      link.click();
    } catch (err) {
      alert('Could not download file.');
    }
  };

  const filters = ['All Records', 'Lab Result', 'Imaging', 'Prescription', 'Clinical Note'];
  const grouped = groupByMonth(filtered);

  return (
    <div style={styles.container}>
      <DoctorSidebar />

      <div style={styles.main}>
        {/* TOPBAR */}
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>
            Patient Records <span style={styles.greeting}>{getGreeting()}, Dr. {user?.lastName}</span>
          </div>
        </div>

        <div style={styles.content}>

          {/* PATIENT CONTEXT BAR */}
          <div style={styles.contextBar}>
            <button style={styles.btnBack} onClick={() => navigate('/doctor/patients')}>← Back</button>
            <div style={styles.contextInfo}>
              <div style={styles.contextName}>Patient Records</div>
              <div style={styles.contextBadge}>✅ Consent Active</div>
            </div>
            <button style={styles.btnAddRecord} onClick={() => setShowAddRecord(!showAddRecord)}>
              {showAddRecord ? '✕ Cancel' : '✏ Add Record'}
            </button>
          </div>

          {/* ADD RECORD FORM */}
          {showAddRecord && (
            <div style={styles.addRecordForm}>
              <div style={styles.formTitle}>Add Clinical Note or Prescription</div>
              {addSuccess && <div style={styles.successMsg}>{addSuccess}</div>}
              {addError && <div style={styles.errorMsg}>{addError}</div>}
              <form onSubmit={handleAddRecord}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Record Type *</label>
                    <div style={styles.typeRow}>
                      {['Clinical Note', 'Prescription'].map(type => (
                        <button
                          key={type}
                          type="button"
                          style={formData.recordType === type ? {...styles.typeBtn, ...styles.typeBtnActive} : styles.typeBtn}
                          onClick={() => setFormData({...formData, recordType: type})}
                        >
                          {type === 'Clinical Note' ? '📋' : '💊'}
                          <span style={styles.typeBtnLabel}>{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Record Date *</label>
                    <input
                      style={styles.input}
                      type="date"
                      value={formData.recordDate}
                      onChange={(e) => setFormData({...formData, recordDate: e.target.value})}
                      required
                    />
                  </div>
                  <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                    <label style={styles.label}>Title *</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="e.g. General Consultation Note"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                    <label style={styles.label}>Description / Notes *</label>
                    <textarea
                      style={styles.textarea}
                      rows="4"
                      placeholder="Clinical notes or prescription details..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div style={styles.btnRow}>
                  <button type="submit" style={styles.btnSubmit} disabled={!formData.recordType}>
                    Add Record
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FILTER TABS */}
          <div style={styles.filterRow}>
            {filters.map(f => (
              <button
                key={f}
                style={activeFilter === f ? {...styles.filterBtn, ...styles.filterBtnActive} : styles.filterBtn}
                onClick={() => filterRecords(f)}
              >
                {f === 'All Records' ? records.length : countByType(f)} {f}
              </button>
            ))}
          </div>

          <div style={styles.twoCol}>

            {/* LEFT — Record list */}
            <div>
              {loading && <p style={styles.emptyMsg}>Loading records...</p>}
              {!loading && filtered.length === 0 && (
                <p style={styles.emptyMsg}>No records found.</p>
              )}
              {Object.entries(grouped).map(([month, recs]) => (
                <div key={month}>
                  <div style={styles.monthLabel}>{month}</div>
                  {recs.map(record => (
                    <div
                      key={record._id}
                      style={selected?._id === record._id ? {...styles.recordCard, ...styles.recordCardSelected} : styles.recordCard}
                      onClick={() => setSelected(record)}
                    >
                      <div style={styles.recordThumb}>{getTypeIcon(record.recordType)}</div>
                      <div style={styles.recordInfo}>
                        <div style={styles.recordTitle}>{record.title}</div>
                        <div style={styles.recordMeta}>
                          <span>📅 {new Date(record.recordDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {record.healthcareFacility && <span>🏥 {record.healthcareFacility}</span>}
                          <span style={{...styles.typeBadge, ...getTypeColor(record.recordType)}}>{record.recordType}</span>
                          {record.fileName && <span>📎</span>}
                          <span>🔒</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* RIGHT — Detail panel */}
            {selected && (
              <div style={styles.detailPanel}>
                <div style={styles.detailTitle}>{selected.title}</div>
                <div style={styles.detailSub}>
                  {selected.healthcareFacility} · {new Date(selected.recordDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div style={styles.detailThumb}>{getTypeIcon(selected.recordType)}</div>

                {/* FILE SECTION */}
                <div style={styles.fileSection}>
                  <div style={styles.detailSection}>Attached File</div>
                  {selected.fileName ? (
                    <>
                      <div style={styles.fileNameBox}>📎 {selected.fileName}</div>
                      <div style={styles.detailBtnRow}>
                        <button
                          style={styles.btnDecrypt}
                          onClick={() => handleViewFile(selected)}
                        >
                          🔓 Decrypt & View
                        </button>
                        <button
                          style={styles.btnDownload}
                          onClick={() => handleDownloadFile(selected)}
                        >
                          ⬇ Download
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={styles.noFile}>No file attached to this record</div>
                  )}
                </div>

                {selected.description && (
                  <>
                    <div style={styles.detailSection}>Description</div>
                    <p style={styles.detailDesc}>{selected.description}</p>
                  </>
                )}
                <div style={styles.detailSection}>Added By</div>
                <div style={styles.accessRow}>
                  <div style={styles.accessAvatar}>
                    {selected.uploadedByRole === 'doctor' ? '👨‍⚕️' : '👤'}
                  </div>
                  <div style={styles.accessInfo}>
                    {selected.uploadedByRole === 'doctor' ? 'Doctor' : 'Patient'}
                    <span> · {new Date(selected.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span style={selected.uploadedByRole === 'doctor' ? styles.badgeDoctor : styles.badgePatient}>
                    {selected.uploadedByRole === 'doctor' ? 'Added by Doctor' : 'Uploaded'}
                  </span>
                </div>
              </div>
            )}

            {!selected && !loading && (
              <div style={styles.detailPanel}>
                <p style={styles.emptyMsg}>Select a record to view details.</p>
              </div>
            )}

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
  contextBar: { background: '#2d6b70', borderRadius: '14px', padding: '16px 22px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' },
  btnBack: { padding: '8px 16px', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  contextInfo: { flex: 1 },
  contextName: { fontSize: '16px', fontWeight: '700', color: 'white' },
  contextBadge: { fontSize: '12px', color: 'rgba(255,255,255,0.80)', marginTop: '3px' },
  btnAddRecord: { padding: '9px 18px', background: 'white', color: '#2d6b70', border: 'none', borderRadius: '9px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  addRecordForm: { background: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #eee', marginBottom: '20px' },
  formTitle: { fontSize: '15px', fontWeight: '700', color: '#222', marginBottom: '16px' },
  successMsg: { background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#16a34a', marginBottom: '16px' },
  errorMsg: { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#444' },
  typeRow: { display: 'flex', gap: '10px' },
  typeBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 20px', borderRadius: '10px', background: '#f0f0f0', border: '2px solid transparent', cursor: 'pointer', fontSize: '20px', fontFamily: 'Inter, sans-serif' },
  typeBtnActive: { background: '#e8f8fb', border: '2px solid #17a8c4' },
  typeBtnLabel: { fontSize: '11px', fontWeight: '700', color: '#444' },
  input: { padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#333', outline: 'none' },
  textarea: { padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#333', outline: 'none', resize: 'vertical' },
  btnRow: { display: 'flex', justifyContent: 'flex-end', marginTop: '14px' },
  btnSubmit: { padding: '10px 24px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '9px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  filterRow: { display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' },
  filterBtn: { padding: '8px 14px', borderRadius: '10px', background: '#e0e0e0', border: 'none', fontSize: '13px', fontWeight: '700', color: '#555', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  filterBtnActive: { background: '#2d6b70', color: 'white' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 310px', gap: '20px' },
  monthLabel: { fontSize: '12px', fontWeight: '700', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '16px 0 8px', borderBottom: '1px solid #ddd', paddingBottom: '6px' },
  recordCard: { background: 'white', borderRadius: '12px', padding: '14px 18px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #eee', cursor: 'pointer' },
  recordCardSelected: { borderColor: '#17a8c4', borderWidth: '2px' },
  recordThumb: { width: '44px', height: '44px', borderRadius: '8px', background: '#f0f7f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
  recordInfo: { flex: 1 },
  recordTitle: { fontSize: '14px', fontWeight: '700', color: '#222', marginBottom: '6px' },
  recordMeta: { fontSize: '12px', color: '#888', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  typeBadge: { borderRadius: '5px', padding: '2px 7px', fontSize: '11px', fontWeight: '700' },
  detailPanel: { background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #eee', height: 'fit-content', position: 'sticky', top: '20px' },
  detailTitle: { fontSize: '15px', fontWeight: '700', color: '#222', marginBottom: '4px' },
  detailSub: { fontSize: '12px', color: '#888', marginBottom: '16px' },
  detailThumb: { width: '100%', height: '90px', background: '#f4f8fb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', marginBottom: '14px' },
  fileSection: { marginBottom: '14px' },
  fileNameBox: { fontSize: '12px', color: '#555', background: '#f8f8f8', border: '1px solid #eee', borderRadius: '7px', padding: '8px 12px', marginBottom: '10px', wordBreak: 'break-all' },
  noFile: { fontSize: '12px', color: '#bbb', fontStyle: 'italic', marginBottom: '10px' },
  detailBtnRow: { display: 'flex', gap: '8px', marginBottom: '4px' },
  btnDecrypt: { flex: 1, padding: '9px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  btnDownload: { flex: 1, padding: '9px', background: '#f0f0f0', color: '#444', border: 'none', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  detailSection: { fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', marginTop: '14px' },
  detailDesc: { fontSize: '13px', color: '#555', lineHeight: '1.6' },
  accessRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 0' },
  accessAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: '#17a8c4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 },
  accessInfo: { flex: 1, fontSize: '12px', color: '#444', fontWeight: '600' },
  badgeDoctor: { fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '10px', background: '#f5f3ff', color: '#6d28d9' },
  badgePatient: { fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '10px', background: '#e8f8fb', color: '#0f6b7d' },
  emptyMsg: { fontSize: '14px', color: '#aaa', textAlign: 'center', padding: '40px 0' }
};

export default ViewPatientRecords;