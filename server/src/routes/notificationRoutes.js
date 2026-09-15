const express = require("express");

const {
  createNotificationHandler,
  getMyNotifications,
  markAsRead,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create notification
router.post("/", protect, createNotificationHandler);

// Get logged-in user's notifications
router.get("/", protect, getMyNotifications);

// Mark notification as read
router.patch("/:id/read", protect, markAsRead);

module.exports = router;