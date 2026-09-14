const Notification = require("../models/Notification");
const { getIo } = require("../utils/socket");

// ======================================================
// INTERNAL UTILITY
// Used by backend services/controllers to create
// notifications for a specific user.
// ======================================================
const createNotification = async ({ userId, caseId, type, message }) => {
  try {
    if (!userId || !caseId || !type || !message) {
      throw new Error(
        "userId, caseId, type and message are required"
      );
    }

    const newNotification = new Notification({
      userId,
      caseId,
      type,
      message,
    });

    const savedNotification = await newNotification.save();

    // Emit real-time notification to target user's private room
    try {
      const io = getIo();

      io.to(userId.toString()).emit(
        "newNotification",
        savedNotification
      );
    } catch (socketError) {
      console.error(
        "Socket emit failed:",
        socketError.message
      );
    }

    return savedNotification;
  } catch (error) {
    throw new Error(
      `Failed to create notification: ${error.message}`
    );
  }
};

// ======================================================
// EXPRESS ROUTE HANDLER
// POST /api/notifications
// ======================================================
const createNotificationHandler = async (req, res) => {
  try {
    const { caseId, type, message } = req.body;

    if (!caseId || !type || !message) {
      return res.status(400).json({
        message: "caseId, type and message are required",
      });
    }

    const notification = await createNotification({
      userId: req.user.userId,
      caseId,
      type,
      message,
    });

    return res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);

    return res.status(500).json({
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// ======================================================
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// ======================================================
// MARK NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// ======================================================
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      {
        isRead: true,
      },
      {
        returnDocument: "after",
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json(notification);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================
module.exports = {
  createNotification,
  createNotificationHandler,
  getMyNotifications,
  markAsRead,
};