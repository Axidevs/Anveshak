const mongoose = require("mongoose");
const crypto = require("crypto");

const auditLogSchema = new mongoose.Schema(
  {
    caseId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., "VIEWED_CASE", "UPLOADED_DOCUMENT"
    details: { type: String, required: true }, // e.g., "Viewed court dashboard for ANV-..."
    ipAddress: { type: String, default: "unknown" },
    logHash: { type: String, required: true } // Cryptographic hash of this log entry to prevent tampering
  },
  { timestamps: true }
);

// Pre-save hook to generate the cryptographic hash of the log
auditLogSchema.pre("validate", function (next) {
  if (!this.logHash) {
    const payload = `${this.caseId}|${this.userId}|${this.action}|${this.details}|${Date.now()}`;
    this.logHash = crypto.createHmac("sha256", process.env.JWT_SECRET || "audit_secret")
      .update(payload)
      .digest("hex");
  }
  next();
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
