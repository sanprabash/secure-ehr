const Notification = require('../models/Notification');

const createNotification = async (recipientId, recipientRole, title, message, type) => {
  try {
    const notification = new Notification({
      recipientId,
      recipientRole,
      title,
      message,
      type
    });
    await notification.save();
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

module.exports = createNotification;