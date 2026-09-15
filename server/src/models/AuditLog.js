const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    caseId: {
      type: String,
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
    },

    oldValue: {
      type: String,
      default: null,
    },

    newValue: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    verificationStatus: {
      type: String,
      enum: ["VERIFIED", "PENDING"],
      default: "VERIFIED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);