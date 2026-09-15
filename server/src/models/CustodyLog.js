const mongoose = require("mongoose");

const custodyLogSchema = new mongoose.Schema(
  {
    evidenceId: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      enum: ["UPLOADED", "TRANSFERRED", "RECEIVED", "RELEASED"],
      required: true,
    },

    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CustodyLog", custodyLogSchema);