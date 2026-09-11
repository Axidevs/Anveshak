const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  caseId: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['CASE_ASSIGNED', 'EVIDENCE_UPLOADED', 'COURT_UPDATE', 'GENERAL'] 
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
