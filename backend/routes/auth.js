const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//  REGISTER 
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      dateOfBirth,
      nationalId,
      bloodGroup,
      phoneNumber,
      address,
      slmcNumber,
      specialisation,
      hospital
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || 'patient',
      dateOfBirth,
      nationalId,
      bloodGroup,
      phoneNumber,
      address,
      slmcNumber,
      specialisation,
      hospital
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
        hospital: user.hospital
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;