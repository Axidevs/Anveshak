const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      unique: true,
      required: true,
    },

    firId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FIR",
      required: true,
    },

    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "FIR_REGISTERED",
        "UNDER_REVIEW",
        "ASSIGNED",
        "INVESTIGATION",
        "EVIDENCE_COLLECTION",
        "FORENSIC_REVIEW",
        "CHARGE_SHEET",
        "COURT_PROCEEDINGS",
        "RESOLVED",
        "DISPOSED"
      ],
      default: "FIR_REGISTERED",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    jurisdiction: {
      type: String,
      default: null,
    },

    // --- Court Module Additions ---
    nextHearingDate: {
      type: Date,
      default: null,
    },
    
    courtProceedings: [
      {
        hearingDate: { type: Date, required: true },
        note: { type: String, required: true },
        nextHearingDate: { type: Date, default: null },
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", default: null },
        signedBy: { type: String, default: null },
        signedAt: { type: Date, default: null }
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Case", caseSchema);