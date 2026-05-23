const express = require('express');
const router = express.Router();
const {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
