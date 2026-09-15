const mongoose = require("mongoose");

const digitalSignatureSchema = new mongoose.Schema(
  {
    // Evidence being signed
    evidenceId: {
      type: String,
      required: true,
    },

    // SHA-256 hash of the evidence at the time of signing
    evidenceHash: {
      type: String,
      required: true,
    },

    // Uploaded signature image
    signatureImage: {
      type: String,
      required: true,
    },
    signedFilePath: {
      type: String,
      default: null,
    },

    // Officer who signed the evidence
    signedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Time of signing
    signedAt: {
      type: Date,
      default: Date.now,
    },

    // Cryptographic signature
    digitalSignature: {
      type: String,
      required: true,
    },

    // Result of cryptographic verification
    verificationStatus: {
      type: String,
      enum: ["VALID", "INVALID"],
      default: "VALID",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "DigitalSignature",
  digitalSignatureSchema
);