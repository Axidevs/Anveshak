const express = require("express");
const { createNotification, getMyNotifications, markAsRead } = require("../controllers/notificationController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.patch("/:id/read", protect, markAsRead);

module.exports = router;
