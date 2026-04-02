const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//  REGISTER (Patient only) 
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, nationalId, bloodGroup, phoneNumber, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new patient
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'patient',
      dateOfBirth,
      nationalId,
      bloodGroup,
      phoneNumber,
      address
    });

    await user.save();

    res.status(201).json({ message: 'Account created successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//  LOGIN (All roles) 
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
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
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;