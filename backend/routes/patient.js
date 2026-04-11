const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const ConsentRecord = require('../models/ConsentRecord');
const { encryptFile, decryptFile } = require('../utils/encryption');
const createNotification = require('../utils/createNotification');

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
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/records', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, recordType, description, healthcareFacility, recordDate } = req.body;

    let fileData = null;
    let fileName = null;
    let fileType = null;
    let fileSize = null;

    if (req.file) {
  const base64Data = req.file.buffer.toString('base64');
  fileData = encryptFile(base64Data); // Encrypt before storing
  fileName = req.file.originalname;
  fileType = req.file.mimetype;
  fileSize = req.file.size;
  }

    const record = new MedicalRecord({
      patientId: req.user.userId,
      title,
      recordType,
      description,
      healthcareFacility,
      recordDate,
      fileData,
      fileName,
      fileType,
      fileSize,
      uploadedBy: req.user.userId,
      uploadedByRole: 'patient'
    });

    await record.save();

// Notify all doctors with active consent
const activeConsents = await ConsentRecord.find({
  patientId: req.user.userId,
  isActive: true
});

const patient = await User.findById(req.user.userId);

for (const consent of activeConsents) {
  await createNotification(
    consent.doctorId,
    'doctor',
    'New Medical Record Uploaded',
    `${patient.firstName} ${patient.lastName} has uploaded a new ${recordType} record. You can view it as you have active consent.`,
    'new_record'
  );
}

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
      return res.status(404).json({ message: 'Doctor not found with that SLMC number' });
    }

    const existing = await ConsentRecord.findOne({
      patientId: req.user.userId,
      doctorId: doctor._id
    });

    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({ message: 'Consent already granted to this doctor' });
      }
      existing.isActive = true;
      existing.grantedAt = new Date();
      await existing.save();
    } else {
      const consent = new ConsentRecord({
        patientId: req.user.userId,
        doctorId: doctor._id,
        isActive: true
      });
      await consent.save();
    }

    // Get patient name for notification
    const patient = await User.findById(req.user.userId);

    // Notify the doctor
    await createNotification(
      doctor._id,
      'doctor',
      'New Patient Access Granted',
      `${patient.firstName} ${patient.lastName} has granted you access to their medical records.`,
      'consent_granted'
    );

    res.json({ message: `Consent granted to Dr. ${doctor.firstName} ${doctor.lastName}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//  REVOKE CONSENT 
router.put('/consents/:consentId/revoke', auth, async (req, res) => {
  try {
    const consent = await ConsentRecord.findOne({
      _id: req.params.consentId,
      patientId: req.user.userId
    });

    if (!consent) {
      return res.status(404).json({ message: 'Consent not found' });
    }

    consent.isActive = false;
    await consent.save();

    // Get patient name and doctor for notification
    const patient = await User.findById(req.user.userId);
    const doctor = await User.findById(consent.doctorId);

    if (doctor) {
      await createNotification(
        doctor._id,
        'doctor',
        'Patient Access Revoked',
        `${patient.firstName} ${patient.lastName} has revoked your access to their medical records.`,
        'consent_revoked'
      );
    }

    res.json({ message: 'Consent revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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

//  GET FILE 
router.get('/records/:recordId/file', auth, async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({
      _id: req.params.recordId,
      patientId: req.user.userId
    });

    if (!record || !record.fileData) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Decrypt the file data
    const decryptedBase64 = decryptFile(record.fileData);
    const fileBuffer = Buffer.from(decryptedBase64, 'base64');
    
    res.set('Content-Type', record.fileType);
    res.set('Content-Disposition', `inline; filename="${record.fileName}"`);
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  DELETE ACCOUNT 
router.delete('/account', auth, async (req, res) => {
  try {
    // Delete all patient records
    await MedicalRecord.deleteMany({ patientId: req.user.userId });

    // Delete all consents
    await ConsentRecord.deleteMany({ patientId: req.user.userId });

    // Delete all notifications
    const Notification = require('../models/Notification');
    await Notification.deleteMany({ recipientId: req.user.userId });

    // Delete the user
    await User.findByIdAndDelete(req.user.userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//  GET ACCESS LOG FOR RECORD 
router.get('/records/:recordId/access-log', auth, async (req, res) => {
  try {
    const AccessLog = require('../models/AccessLog');
    const logs = await AccessLog.find({
      recordId: req.params.recordId,
      patientId: req.user.userId
    }).sort({ accessedAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;