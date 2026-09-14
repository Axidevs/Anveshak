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
      ],
      default: "FIR_REGISTERED",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    aiAnalysis: {
      classification: {
        type: String,
        default: null,
      },

      confidence: {
        type: Number,
        default: null,
      },

      summary: {
        type: String,
        default: null,
      },

      severity: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        default: null,
      },

      reasoning: {
        type: String,
        default: null,
      },

      keywords: {
        type: [String],
        default: [],
      },

      aiAvailable: {
        type: Boolean,
        default: false,
      },
    },

    jurisdiction: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Case", caseSchema);