

const Message = require("../models/Message");
const Case = require("../models/Case");
const { getIo } = require("../utils/socket");
const { createNotification } = require("./notificationController");

const canAccessCase = (caseRecord, user) => {
  if (user.role === "ADMIN") {
    return true;
  }

  if (user.role === "CITIZEN") {
    return caseRecord.citizenId.toString() === user.userId;
  }

  if (user.role === "POLICE") {
    return (
      caseRecord.assignedOfficer &&
      caseRecord.assignedOfficer.toString() === user.userId
    );
  }

  return false;
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
        message: "You are not authorized to access this case",
      });
    }

    const newMessage = await Message.create({
      caseId,
      senderId: req.user.userId,
      text: text.trim(),
    });

    await newMessage.populate("senderId", "name role");

    const io = getIo();

    io.to(`case_${caseId}`).emit("receiveMessage", newMessage);
        // Notify the other participant
    let recipientId = null;

    if (
      req.user.role === "POLICE" &&
      caseRecord.citizenId
    ) {
      recipientId = caseRecord.citizenId;
    } else if (
      req.user.role === "CITIZEN" &&
      caseRecord.assignedOfficer
    ) {
      recipientId = caseRecord.assignedOfficer;
    }

    if (recipientId) {
      await createNotification({
        userId: recipientId,
        caseId,
        type: "NEW_MESSAGE",
        message: `New message received for case ${caseId}`,
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
        message: "You are not authorized to access this case",
      });
    }

    const messages = await Message.find({ caseId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name role");

    res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};