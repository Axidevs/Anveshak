const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  caseId: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: [
      'FIR_SUBMITTED', 'CASE_CREATED', 'CASE_ASSIGNED', 'EVIDENCE_UPLOADED',
      'EVIDENCE_VERIFIED', 'STATUS_CHANGED', 'COURT_UPDATE',
      'INVESTIGATION_UPDATE', 'GENERAL'
    ] 
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
