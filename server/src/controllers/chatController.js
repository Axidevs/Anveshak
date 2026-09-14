const Message = require("../models/Message");
const Case = require("../models/Case");
const User = require("../models/User");
const { getIo } = require("../utils/socket");
const { createNotification } = require("./notificationController");

const INTERNAL_ROLES = [
  "POLICE",
  "INVESTIGATING_AGENCY",
  "COURT",
  "ADMIN",
];

const canAccessCase = (caseRecord, user) => {
  if (!INTERNAL_ROLES.includes(user.role)) {
    return false;
  }

  // ADMIN can access all internal collaboration
  if (user.role === "ADMIN") {
    return true;
  }

  // Assigned police officer can access the case
  if (user.role === "POLICE") {
    if (!caseRecord.assignedOfficer) {
      return false;
    }

    return (
      caseRecord.assignedOfficer.toString() ===
      user.userId.toString()
    );
  }

  // Authorized internal departments
  return true;
};

// ======================================================
// SEND MESSAGE
// POST /api/chat/case/:caseId
// ======================================================
exports.sendMessage = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Message text is required",
      });
    }

    const caseRecord = await Case.findOne({ caseId });

    if (!caseRecord) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    if (!canAccessCase(caseRecord, req.user)) {
      return res.status(403).json({
        message:
          "You are not authorized to access case collaboration",
      });
    }

    const newMessage = await Message.create({
      caseId,
      senderId: req.user.userId,
      text: text.trim(),
    });

    await newMessage.populate(
      "senderId",
      "name role department"
    );

    // Real-time message
    const io = getIo();

    io.to(`case_${caseId}`).emit(
      "receiveMessage",
      newMessage
    );

    // Notify other authorized internal participants
    const participants = await User.find({
      _id: { $ne: req.user.userId },
      role: { $in: INTERNAL_ROLES },
    }).select("_id role");

    for (const participant of participants) {
      try {
        await createNotification({
          userId: participant._id,
          caseId,
          type: "NEW_MESSAGE",
          message:
            `New internal collaboration message for case ${caseId}`,
        });
      } catch (notificationError) {
        console.error(
          "Notification creation failed:",
          notificationError.message
        );
      }
    }

    return res.status(201).json({
      message: newMessage,
      data: newMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ======================================================
// GET MESSAGES
// GET /api/chat/case/:caseId
// ======================================================
exports.getMessages = async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseRecord = await Case.findOne({ caseId });

    if (!caseRecord) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    if (!canAccessCase(caseRecord, req.user)) {
      return res.status(403).json({
        message:
          "You are not authorized to access case collaboration",
      });
    }

    const messages = await Message.find({
      caseId,
    })
      .sort({ createdAt: 1 })
      .populate(
        "senderId",
        "name role department"
      );

    return res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};