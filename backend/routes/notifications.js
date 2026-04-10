const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

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

//  GET MY NOTIFICATIONS 
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user.userId
    }).sort({ createdAt: -1 }).limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  MARK ALL AS READ 
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  MARK ONE AS READ 
router.put('/:notificationId/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  GET UNREAD COUNT 
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user.userId,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;