const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    evidenceId: {
      type: String,
      unique: true,
      required: true,
    },

    caseId: {
      type: String,
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileHash: {
      type: String,
      required: true,
    },

    custodyStatus: {
      type: String,
      enum: [
        "IN_CUSTODY",
        "TRANSFERRED",
        "RELEASED",
      ],
      default: "IN_CUSTODY",
    },

    verificationStatus: {
      type: String,
      enum: [
        "PENDING",
        "VERIFIED",
        "TAMPERED",
      ],
      default: "PENDING",
    },

    // Blockchain fields
    blockchainStatus: {
      type: String,
      enum: [
        "NOT_ANCHORED",
        "ANCHORED",
        "FAILED",
      ],
      default: "NOT_ANCHORED",
    },

    blockchainTxHash: {
      type: String,
      default: null,
    },

    blockchainAnchoredHash: {
      type: String,
      default: null,
    },

    blockchainAnchoredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Evidence", evidenceSchema);