const mongoose = require("mongoose");

const firSchema = new mongoose.Schema(
  {
    firNumber: {
      type: String,
      unique: true,
      required: true,
    },

    complainant: {
      type: String,
      required: true,
      trim: true,
    },

    incidentDescription: {
      type: String,
      required: true,
      trim: true,
    },

    incidentDate: {
      type: Date,
      required: true,
    },

    incidentLocation: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["SUBMITTED", "UNDER_REVIEW", "REGISTERED", "CLOSED"],
      default: "SUBMITTED",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    aiAnalysis: {
      classification: { type: String },
      confidence: { type: Number },
      summary: { type: String },
      severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
      reasoning: { type: String },
      keywords: [{ type: String }],
      aiAvailable: { type: Boolean, default: false }
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FIR", firSchema);