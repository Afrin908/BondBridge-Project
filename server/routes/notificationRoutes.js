const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

const {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);

router.put('/read-all', protect, markAllNotificationsAsRead);
router.put('/:id/read', protect, markNotificationAsRead);

router.delete('/:id', protect, deleteNotification);

module.exports = router;