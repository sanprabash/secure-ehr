const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const MedicalRecord = require('../models/MedicalRecord');
const ConsentRecord = require('../models/ConsentRecord');
const User = require('../models/User');

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

//  GET DOCTOR STATS
router.get('/stats', auth, async (req, res) => {
  try {
    const patientsWithAccess = await ConsentRecord.countDocuments({
      doctorId: req.user.userId,
      isActive: true
    });
    const clinicalNotesAdded = await MedicalRecord.countDocuments({
      uploadedBy: req.user.userId,
      uploadedByRole: 'doctor'
    });
    res.json({
      patientsWithAccess,
      recordsAccessed: 0,
      clinicalNotesAdded
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  GET MY PATIENTS 
router.get('/patients', auth, async (req, res) => {
  try {
    const consents = await ConsentRecord.find({
      doctorId: req.user.userId,
      isActive: true
    }).populate('patientId', 'firstName lastName dateOfBirth bloodGroup');

    const patients = consents.map(consent => ({
      consentId: consent._id,
      grantedAt: consent.grantedAt,
      patient: consent.patientId
    }));

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  GET PATIENT RECORDS 
router.get('/patients/:patientId/records', auth, async (req, res) => {
  try {
    // Check consent exists
    const consent = await ConsentRecord.findOne({
      doctorId: req.user.userId,
      patientId: req.params.patientId,
      isActive: true
    });
    if (!consent) {
      return res.status(403).json({ message: 'You do not have consent to view this patient records' });
    }
    const records = await MedicalRecord.find({ patientId: req.params.patientId })
      .sort({ recordDate: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  ADD CLINICAL NOTE 
router.post('/patients/:patientId/records', auth, async (req, res) => {
  try {
    const consent = await ConsentRecord.findOne({
      doctorId: req.user.userId,
      patientId: req.params.patientId,
      isActive: true
    });
    if (!consent) {
      return res.status(403).json({ message: 'No active consent found' });
    }
    const { title, recordType, description, recordDate } = req.body;
    const doctor = await User.findById(req.user.userId);
    const record = new MedicalRecord({
      patientId: req.params.patientId,
      title,
      recordType,
      description,
      healthcareFacility: doctor.hospital,
      recordDate,
      uploadedBy: req.user.userId,
      uploadedByRole: 'doctor'
    });
    await record.save();
    res.status(201).json({ message: 'Record added successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  UPDATE PROFILE 
router.put('/profile', auth, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    await User.findByIdAndUpdate(req.user.userId, { phoneNumber });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  CHANGE PASSWORD 
router.put('/change-password', auth, async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
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