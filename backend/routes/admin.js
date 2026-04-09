const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const nodemailer = require('nodemailer');

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

//  GET ADMIN STATS 
router.get('/stats', auth, async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalRecords = await MedicalRecord.countDocuments();
    res.json({ totalPatients, totalDoctors, totalRecords });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  GET ALL DOCTORS 
router.get('/doctors', auth, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('firstName lastName email slmcNumber specialisation hospital createdAt');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  ADD DOCTOR 
router.post('/doctors', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, slmcNumber, specialisation, hospital } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingSlmc = await User.findOne({ slmcNumber });
    if (existingSlmc) {
      return res.status(400).json({ message: 'SLMC number already registered' });
    }

    // Generate temporary password
    const tempPassword = `Dr${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const doctor = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'doctor',
      slmcNumber,
      specialisation,
      hospital
    });

    await doctor.save();

    res.status(201).json({
      message: `Doctor account created successfully. Temporary password: ${tempPassword}`,
      tempPassword
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//  REMOVE DOCTOR 
router.delete('/doctors/:doctorId', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.doctorId);
    res.json({ message: 'Doctor removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;