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

  if (user.role === "ADMIN") {
    return true;
  }

  if (user.role === "POLICE") {
    return (
      caseRecord.assignedOfficer &&
      caseRecord.assignedOfficer.toString() === user.userId
    );
  }

  // Other authorized internal departments can access
  // case-linked collaboration.
  return true;
};

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
        message: "You are not authorized to access case collaboration",
      });
    }

    const newMessage = await Message.create({
      caseId,
      senderId: req.user.userId,
      text: text.trim(),
    });

    await newMessage.populate("senderId", "name role department");

    const io = getIo();

    io.to(`case_${caseId}`).emit("receiveMessage", newMessage);

    // Notify authorized internal participants only.
    const participants = await User.find({
      _id: { $ne: req.user.userId },
      role: { $in: INTERNAL_ROLES },
    }).select("_id");

    for (const participant of participants) {
      await createNotification({
        userId: participant._id,
        caseId,
        type: "NEW_MESSAGE",
        message: `New internal collaboration message for case ${caseId}`,
      });
    }

    res.status(201).json({
      message: "Message sent",
      data: newMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

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
        message: "You are not authorized to access case collaboration",
      });
    }

    const messages = await Message.find({ caseId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name role department");

    res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};