const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const patientRoutes = require('./routes/patient');
app.use('/api/patient', patientRoutes);

const doctorRoutes = require('./routes/doctor');
app.use('/api/doctor', doctorRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Secure EHR API is running' });
});

// Connect to MongoDB
const MONGO_URI = 'mongodb://10952985_db_user:AvBbxArsAIZnchm8@ac-oyd1ssp-shard-00-00.ak33s2v.mongodb.net:27017,ac-oyd1ssp-shard-00-01.ak33s2v.mongodb.net:27017,ac-oyd1ssp-shard-00-02.ak33s2v.mongodb.net:27017/secureEHR?authSource=admin&tls=true&directConnection=false';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch((error) => {
    console.log('MongoDB connection error:', error);
  });

  const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);