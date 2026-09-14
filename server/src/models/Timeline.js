const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      index: true,
    },

    status: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Timeline", timelineSchema);