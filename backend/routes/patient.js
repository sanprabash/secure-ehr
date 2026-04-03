const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const ConsentRecord = require('../models/ConsentRecord');

//  AUTH MIDDLEWARE 
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, 'securehrjwtsecret2026');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

//  GET PATIENT STATS 
router.get('/stats', auth, async (req, res) => {
  try {
    const totalRecords = await MedicalRecord.countDocuments({ patientId: req.user.userId });
    const lastRecord = await MedicalRecord.findOne({ patientId: req.user.userId }).sort({ createdAt: -1 });
    const lastUpload = lastRecord
      ? new Date(lastRecord.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'No records yet';
    const doctorsWithAccess = await ConsentRecord.countDocuments({ patientId: req.user.userId, isActive: true });
    res.json({ totalRecords, doctorsWithAccess, lastUpload });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  GET ALL RECORDS 
router.get('/records', auth, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patientId: req.user.userId }).sort({ recordDate: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  UPLOAD RECORD 
router.post('/records', auth, async (req, res) => {
  try {
    const { title, recordType, description, healthcareFacility, recordDate } = req.body;
    const record = new MedicalRecord({
      patientId: req.user.userId,
      title,
      recordType,
      description,
      healthcareFacility,
      recordDate,
      uploadedBy: req.user.userId,
      uploadedByRole: 'patient'
    });
    await record.save();
    res.status(201).json({ message: 'Record uploaded successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//  GET ACTIVE CONSENTS 
router.get('/consents', auth, async (req, res) => {
  try {
    const consents = await ConsentRecord.find({
      patientId: req.user.userId,
      isActive: true
    }).populate('doctorId', 'firstName lastName slmcNumber specialisation hospital');
    res.json(consents);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  GRANT CONSENT 
router.post('/consents', auth, async (req, res) => {
  try {
    const { slmcNumber } = req.body;
    const doctor = await User.findOne({ slmcNumber, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found. Please check the SLMC number.' });
    }
    const existing = await ConsentRecord.findOne({
      patientId: req.user.userId,
      doctorId: doctor._id,
      isActive: true
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already granted access to this doctor.' });
    }
    const consent = new ConsentRecord({
      patientId: req.user.userId,
      doctorId: doctor._id,
      isActive: true
    });
    await consent.save();
    res.status(201).json({
      message: `Access granted to ${doctor.firstName} ${doctor.lastName}`,
      doctor: {
        name: `${doctor.firstName} ${doctor.lastName}`,
        specialisation: doctor.specialisation,
        hospital: doctor.hospital,
        slmcNumber: doctor.slmcNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//  REVOKE CONSENT 
router.put('/consents/:consentId/revoke', auth, async (req, res) => {
  try {
    const consent = await ConsentRecord.findOneAndUpdate(
      { _id: req.params.consentId, patientId: req.user.userId },
      { isActive: false, revokedAt: new Date() },
      { new: true }
    );
    if (!consent) {
      return res.status(404).json({ message: 'Consent not found' });
    }
    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  SEARCH DOCTOR BY SLMC 
router.get('/doctors/search', auth, async (req, res) => {
  try {
    const { slmc } = req.query;
    const doctor = await User.findOne({ slmcNumber: slmc, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({
      name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      specialisation: doctor.specialisation,
      hospital: doctor.hospital,
      slmcNumber: doctor.slmcNumber
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  UPDATE PROFILE 
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, dateOfBirth, phoneNumber, nationalId, bloodGroup, address } = req.body;
    await User.findByIdAndUpdate(req.user.userId, {
      firstName, lastName, email, dateOfBirth, phoneNumber, nationalId, bloodGroup, address
    });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  CHANGE PASSWORD 
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.userId, { password: hashedPassword });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;