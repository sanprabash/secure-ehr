const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  recordType: {
    type: String,
    enum: ['Lab Result', 'Imaging', 'Prescription', 'Clinical Note'],
    required: true
  },
  description: {
    type: String
  },
  healthcareFacility: {
    type: String
  },
  recordDate: {
    type: Date,
    required: true
  },
  // File storage
  fileData: {
    type: String  // Base64 encoded file
  },
  fileName: {
    type: String
  },
  fileType: {
    type: String
  },
  fileSize: {
    type: Number
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  uploadedByRole: {
    type: String,
    enum: ['patient', 'doctor']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);