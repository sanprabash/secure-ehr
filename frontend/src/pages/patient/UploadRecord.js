import React, { useState, useRef } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

function UploadRecord() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    recordType: '',
    description: '',
    healthcareFacility: '',
    recordDate: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 18) return 'good afternoon';
    return 'good evening';
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (file) => {
    if (file) setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleBrowse = () => {
    fileInputRef.current.click();
  };

  const handleFileInput = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  const removeFile = () => {
    setSelectedFile(null);
    fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await API.post('/patient/records', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Record uploaded successfully!');
      setTimeout(() => {
        navigate('/patient/records');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    }

    setLoading(false);
  };

  const recordTypes = ['Lab Result', 'Imaging', 'Prescription', 'Clinical Note'];

  return (
    <div style={styles.container}>
      <PatientSidebar />

      <div style={styles.main}>
        {/* TOPBAR */}
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>
            Upload Record <span style={styles.greeting}>{getGreeting()}, {user?.firstName}</span>
          </div>
        </div>

        <div style={styles.content}>

          {/* BANNER */}
          <div style={styles.banner}>
            <h2 style={styles.bannerTitle}>Upload Record</h2>
            <p style={styles.bannerText}>Securely upload your medical documents. All files are encrypted with AES-256 before storage.</p>
          </div>

          <div style={styles.formCard}>

            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.successMsg}>{success}</div>}

            <form onSubmit={handleSubmit}>

              {/* FILE UPLOAD AREA */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Select File</label>

                {/* Drop zone */}
                {!selectedFile && (
                  <div
                    style={dragOver ? {...styles.dropZone, ...styles.dropZoneActive} : styles.dropZone}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={handleBrowse}
                  >
                    <div style={styles.dropIcon}>📁</div>
                    <div style={styles.dropText}><strong>Select File</strong></div>
                    <div style={styles.dropSub}>Drag and drop or browse your device</div>
                  </div>
                )}

                {/* Selected file */}
                {selectedFile && (
                  <div style={styles.fileSelected}>
                    <div style={styles.fileIcon}>📄</div>
                    <div style={styles.fileInfo}>
                      <div style={styles.fileName}>{selectedFile.name}</div>
                      <div style={styles.fileMeta}>{selectedFile.type || 'Document'} · {formatFileSize(selectedFile.size)}</div>
                    </div>
                    <button
                      type="button"
                      style={styles.removeBtn}
                      onClick={removeFile}
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileInput}
                />
              </div>

              {/* RECORD TYPE */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Record Type *</label>
                <div style={styles.typeRow}>
                  {recordTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      style={formData.recordType === type ? {...styles.typeBtn, ...styles.typeBtnActive} : styles.typeBtn}
                      onClick={() => setFormData({ ...formData, recordType: type })}
                    >
                      {type === 'Lab Result' && '🧪'}
                      {type === 'Imaging' && '🖼'}
                      {type === 'Prescription' && '💊'}
                      {type === 'Clinical Note' && '📋'}
                      <span style={styles.typeBtnLabel}>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* RECORD TITLE & DATE */}
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Record Title *</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>📄</span>
                    <input
                      style={styles.input}
                      type="text"
                      name="title"
                      placeholder="e.g. Full Blood Count — Nawaloka Hospital"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Record Date *</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>📅</span>
                    <input
                      style={styles.input}
                      type="date"
                      name="recordDate"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* HEALTHCARE FACILITY */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Healthcare Facility *</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>🏥</span>
                  <input
                    style={styles.input}
                    type="text"
                    name="healthcareFacility"
                    placeholder="e.g. Nawaloka Hospital"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Description / Notes *</label>
                <textarea
                  style={styles.textarea}
                  name="description"
                  rows="4"
                  placeholder="Brief description of this record..."
                  onChange={handleChange}
                  required
                />
              </div>

              {/* ENCRYPT NOTICE */}
              <div style={styles.encryptNotice}>
                🔒 This record will be encrypted with AES-256 before storage
              </div>

              {/* BUTTONS */}
              <div style={styles.btnRow}>
                <button
                  type="button"
                  style={styles.btnCancel}
                  onClick={() => navigate('/patient/records')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.btnUpload}
                  disabled={loading || !formData.recordType}
                >
                  {loading ? 'Uploading...' : '🔒 Encrypt & Upload Record'}
                </button>
              </div>

            </form>
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
  formCard: { background: 'white', borderRadius: '14px', padding: '28px', border: '1px solid #eee' },
  error: { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' },
  successMsg: { background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#16a34a', marginBottom: '16px' },
  formGroup: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '7px' },
  dropZone: { border: '2px dashed #ddd', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', background: '#fafafa', transition: 'all 0.2s' },
  dropZoneActive: { border: '2px dashed #17a8c4', background: '#e8f8fb' },
  dropIcon: { fontSize: '32px', marginBottom: '10px' },
  dropText: { fontSize: '15px', color: '#444', marginBottom: '6px' },
  dropSub: { fontSize: '13px', color: '#aaa' },
  fileSelected: { border: '1.5px solid #17a8c4', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', background: '#f0fdff' },
  fileIcon: { fontSize: '28px', flexShrink: 0 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: '14px', fontWeight: '700', color: '#222' },
  fileMeta: { fontSize: '12px', color: '#888', marginTop: '3px' },
  removeBtn: { padding: '6px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '7px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  typeRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  typeBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 20px', borderRadius: '10px', background: '#f0f0f0', border: '2px solid transparent', cursor: 'pointer', fontSize: '20px', fontFamily: 'Inter, sans-serif', minWidth: '90px' },
  typeBtnActive: { background: '#e8f8fb', border: '2px solid #17a8c4' },
  typeBtnLabel: { fontSize: '11px', fontWeight: '700', color: '#444' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  inputWrapper: { display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: '9px', padding: '0 12px', background: 'white' },
  inputIcon: { fontSize: '15px', marginRight: '8px', color: '#aaa' },
  input: { flex: 1, padding: '11px 0', border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#333', background: 'transparent' },
  textarea: { width: '100%', padding: '12px', border: '1.5px solid #ddd', borderRadius: '9px', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#333', resize: 'vertical', boxSizing: 'border-box', outline: 'none' },
  encryptNotice: { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#166534', marginBottom: '20px' },
  btnRow: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  btnCancel: { padding: '11px 24px', background: 'white', color: '#555', border: '1.5px solid #ddd', borderRadius: '9px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  btnUpload: { padding: '11px 24px', background: '#17a8c4', color: 'white', border: 'none', borderRadius: '9px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }
};

export default UploadRecord;