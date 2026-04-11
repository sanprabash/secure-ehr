import React, { useEffect, useState } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import API from '../../services/api';

function MedicalRecords() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All Records');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessLogs, setAccessLogs] = useState([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 18) return 'good afternoon';
    return 'good evening';
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (selected) fetchAccessLogs(selected._id);
  }, [selected]);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/patient/records', {
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

  const fetchAccessLogs = async (recordId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`/patient/records/${recordId}/access-log`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccessLogs(response.data);
    } catch (err) {
      console.error(err);
      setAccessLogs([]);
    }
  };

  const filterRecords = (type) => {
    setActiveFilter(type);
    if (type === 'All Records') {
      setFiltered(records);
    } else {
      setFiltered(records.filter(r => r.recordType === type));
    }
  };

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

  const handleViewFile = async (record) => {
    if (!record.fileName) {
      alert('No file attached to this record.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`/patient/records/${record._id}/file`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: record.fileType }));
      window.open(url, '_blank');
    } catch (err) {
      alert('Could not load file.');
    }
  };

  const handleDownloadFile = async (record) => {
    if (!record.fileName) {
      alert('No file attached to this record.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`/patient/records/${record._id}/file`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = record.fileName;
      link.click();
    } catch (err) {
      alert('Could not download file.');
    }
  };

  const handleDeleteRecord = async (record) => {
    if (record.uploadedByRole !== 'patient') {
      alert('You can only delete records you uploaded. Doctor-added records cannot be deleted.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${record.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await API.delete(`/patient/records/${record._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove from state
      const updatedRecords = records.filter(r => r._id !== record._id);
      setRecords(updatedRecords);
      setFiltered(updatedRecords.filter(r =>
        activeFilter === 'All Records' ? true : r.recordType === activeFilter
      ));
      // Select next record or clear
      setSelected(updatedRecords.length > 0 ? updatedRecords[0] : null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' · ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const getDoctorInitials = (name) => {
    const parts = name.replace('Dr. ', '').split(' ');
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  };

  const countByType = (type) => records.filter(r => r.recordType === type).length;

  const filters = ['All Records', 'Lab Result', 'Imaging', 'Prescription', 'Clinical Note'];
  const grouped = groupByMonth(filtered);

  return (
    <div style={styles.container}>
      <PatientSidebar />

      <div style={styles.main}>
        {/* TOPBAR */}
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>
            Medical History <span style={styles.greeting}>{getGreeting()}, {user?.firstName}</span>
          </div>
        </div>

        <div style={styles.content}>

          {/* BANNER */}
          <div style={styles.banner}>
            <h2 style={styles.bannerTitle}>Medical History</h2>
            <p style={styles.bannerText}>All your medical documents — securely encrypted and stored in chronological order.</p>
          </div>

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
            <div style={styles.recordList}>
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
                <div style={styles.detailFilename}>
                  {selected.fileName ? `📎 ${selected.fileName}` : 'No file attached'}
                </div>
                <div style={styles.detailBtnRow}>
                  <button style={styles.btnDecrypt} onClick={() => handleViewFile(selected)}>
                    🔓 Decrypt & View
                  </button>
                  <button style={styles.btnDownload} onClick={() => handleDownloadFile(selected)}>
                    ⬇ Download
                  </button>
                </div>

                {selected.description && (
                  <>
                    <div style={styles.detailSection}>Description</div>
                    <p style={styles.detailDesc}>{selected.description}</p>
                  </>
                )}

                {/* DELETE BUTTON — only for patient uploaded records */}
                {selected.uploadedByRole === 'patient' && (
                  <button
                    style={styles.btnDelete}
                    onClick={() => handleDeleteRecord(selected)}
                  >
                    🗑 Delete This Record
                  </button>
                )}

                {selected.uploadedByRole === 'doctor' && (
                  <div style={styles.doctorRecordNote}>
                    📋 This record was added by a doctor and cannot be deleted.
                  </div>
                )}

                {/* WHO ACCESSED THIS RECORD */}
                <div style={styles.detailSection}>
                  Who Accessed This Record
                  {accessLogs.length > 0 && (
                    <span style={styles.accessCount}>{accessLogs.length} view{accessLogs.length !== 1 ? 's' : ''}</span>
                  )}
                </div>

                {/* Uploader row */}
                <div style={styles.accessRow}>
                  <div style={styles.accessAvatar}>
                    {user?.firstName[0]}{user?.lastName[0]}
                  </div>
                  <div style={styles.accessInfo}>
                    {user?.firstName} {user?.lastName}
                    <span style={styles.accessTime}> · {new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <span style={styles.badgeUploaded}>Uploaded</span>
                </div>

                {/* Doctor access logs */}
                {accessLogs.length === 0 ? (
                  <div style={styles.noAccess}>No doctor has viewed this record yet</div>
                ) : (
                  accessLogs.map((log, index) => (
                    <div key={index} style={styles.accessRow}>
                      <div style={{...styles.accessAvatar, background: '#6d28d9'}}>
                        {getDoctorInitials(log.doctorName)}
                      </div>
                      <div style={styles.accessInfo}>
                        {log.doctorName}
                        <span style={styles.accessTime}> · {formatTime(log.accessedAt)}</span>
                      </div>
                      <span style={styles.badgeDoctor}>Viewed</span>
                    </div>
                  ))
                )}
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
  banner: { background: '#2d6b70', borderRadius: '14px', padding: '24px 28px', marginBottom: '20px' },
  bannerTitle: { fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '6px' },
  bannerText: { fontSize: '13.5px', color: 'rgba(255,255,255,0.78)', lineHeight: '1.6' },
  filterRow: { display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' },
  filterBtn: { padding: '8px 14px', borderRadius: '10px', background: '#e0e0e0', border: 'none', fontSize: '13px', fontWeight: '700', color: '#555', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  filterBtnActive: { background: '#2d6b70', color: 'white' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 310px', gap: '20px' },
  recordList: { display: 'flex', flexDirection: 'column' },
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
  detailFilename: { fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '10px' },
  detailBtnRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  btnDecrypt: { flex: 1, padding: '9px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  btnDownload: { flex: 1, padding: '9px', background: '#f0f0f0', color: '#444', border: 'none', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  btnDelete: { width: '100%', padding: '9px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '700', cursor: 'pointer', marginTop: '10px', marginBottom: '4px' },
  doctorRecordNote: { fontSize: '11.5px', color: '#aaa', background: '#f8f8f8', borderRadius: '8px', padding: '8px 12px', marginTop: '10px', marginBottom: '4px', textAlign: 'center' },
  detailSection: { fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  accessCount: { fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: '#f0f0f0', color: '#666', textTransform: 'none', letterSpacing: '0' },
  detailDesc: { fontSize: '13px', color: '#555', lineHeight: '1.6' },
  accessRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 0', borderBottom: '1px solid #f0f0f0' },
  accessAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: '#17a8c4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: 'white', flexShrink: 0 },
  accessInfo: { flex: 1, fontSize: '12px', color: '#444', fontWeight: '600' },
  accessTime: { fontWeight: '400', color: '#aaa' },
  noAccess: { fontSize: '12px', color: '#bbb', fontStyle: 'italic', padding: '8px 0' },
  badgeUploaded: { fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '10px', background: '#e8f8fb', color: '#0f6b7d' },
  badgeDoctor: { fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '10px', background: '#f5f3ff', color: '#6d28d9' },
  emptyMsg: { fontSize: '14px', color: '#aaa', textAlign: 'center', padding: '40px 0' }
};

export default MedicalRecords;