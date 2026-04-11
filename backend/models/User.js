const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  // Patient specific fields
  dateOfBirth: {
    type: Date
  },
  nationalId: {
    type: String
  },
  bloodGroup: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  address: {
    type: String
  },
  // Emergency contact
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  // Doctor specific fields
  slmcNumber: {
    type: String
  },
  specialisation: {
    type: String
  },
  hospital: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);