const Message = require("../models/Message");
const Case = require("../models/Case");
const { getIo } = require("../utils/socket");

exports.sendMessage = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const caseRecord = await Case.findOne({ caseId });
    if (!caseRecord) {
      return res.status(404).json({ message: "Case not found" });
    }

    const newMessage = await Message.create({
      caseId,
      senderId: req.user.userId,
      text
    });

    await newMessage.populate("senderId", "name role");

    // Real-time emission to the specific case room
    try {
      const io = getIo();
      io.to(`case_${caseId}`).emit("receiveMessage", newMessage);
      
      // Also emit a notification to the assigned officer and citizen if not the sender
      if (caseRecord.citizenId && caseRecord.citizenId.toString() !== req.user.userId) {
         io.to(caseRecord.citizenId.toString()).emit("newNotification", { type: "NEW_MESSAGE", message: `New message in case ${caseId}` });
      }
      if (caseRecord.assignedOfficer && caseRecord.assignedOfficer.toString() !== req.user.userId) {
         io.to(caseRecord.assignedOfficer.toString()).emit("newNotification", { type: "NEW_MESSAGE", message: `New message in case ${caseId}` });
      }
    } catch (socketError) {
      console.error("Socket emit failed:", socketError.message);
    }

    res.status(201).json({ message: "Message sent", data: newMessage });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { caseId } = req.params;
    const messages = await Message.find({ caseId })
                                  .sort({ createdAt: 1 })
                                  .populate("senderId", "name role");
    res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
