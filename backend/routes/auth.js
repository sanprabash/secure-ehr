const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const sendEmail = require('../utils/sendEmail');

//  REGISTER 
router.post('/register', async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, role,
      dateOfBirth, nationalId, bloodGroup, phoneNumber,
      address, slmcNumber, specialisation, hospital
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName, lastName, email, password: hashedPassword,
      role: role || 'patient', dateOfBirth, nationalId,
      bloodGroup, phoneNumber, address, slmcNumber,
      specialisation, hospital
    });

    await user.save();
    res.status(201).json({ message: 'Account created successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//  LOGIN 
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      'securehrjwtsecret2026',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        nationalId: user.nationalId,
        bloodGroup: user.bloodGroup,
        phoneNumber: user.phoneNumber,
        address: user.address,
        slmcNumber: user.slmcNumber,
        specialisation: user.specialisation,
        hospital: user.hospital,
        emergencyContact: user.emergencyContact
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//  FORGOT PASSWORD 
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If this email is registered you will receive a reset link shortly.' });
    }

    // Delete any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Save token to database — expires in 1 hour
    await PasswordReset.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 3600000)
    });

    // Send reset email
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    await sendEmail.sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetLink
    );

    res.json({ message: 'If this email is registered you will receive a reset link shortly.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//  RESET PASSWORD 
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find the reset token
    const resetRecord = await PasswordReset.findOne({ token });

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset link.' });
    }

    // Check if token has expired
    if (resetRecord.expiresAt < new Date()) {
      await PasswordReset.deleteOne({ token });
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await User.findByIdAndUpdate(resetRecord.userId, { password: hashedPassword });

    // Delete the used token
    await PasswordReset.deleteOne({ token });

    res.json({ message: 'Password reset successfully. You can now login with your new password.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//  VERIFY RESET TOKEN 
router.get('/reset-password/:token', async (req, res) => {
  try {
    const resetRecord = await PasswordReset.findOne({ token: req.params.token });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset link.' });
    }

    res.json({ message: 'Token is valid' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;