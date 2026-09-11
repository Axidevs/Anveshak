const Notification = require("../models/Notification");
const { getIo } = require("../utils/socket");

// Internal utility function (not an Express route handler)
exports.createNotification = async ({ userId, caseId, type, message }) => {
  try {
    const newNotification = new Notification({ userId, caseId, type, message });
    const savedNotification = await newNotification.save();

    // Emit real-time notification to the target user's private room
    try {
      const io = getIo();
      io.to(userId.toString()).emit("newNotification", savedNotification);
    } catch (socketError) {
      console.error("Socket emit failed:", socketError.message);
    }

    return savedNotification;
  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
