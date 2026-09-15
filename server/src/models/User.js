const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "CITIZEN",
        "POLICE",
        "INVESTIGATING_AGENCY",
        "COURT",
        "ADMIN",
      ],
      default: "CITIZEN",
    },

    // Current post / rank used for PBAC
    post: {
      type: String,
      enum: [
        "CONSTABLE",
        "HEAD_CONSTABLE",
        "SUB_INSPECTOR",
        "INSPECTOR",
        "DSP_ACP",
        "SP_DCP",
        "CBI_OFFICER",
        "ED_OFFICER",
        "CUSTOMS_OFFICER",
        "JUDGE",
      ],
      default: null,
    },

    department: {
      type: String,
      default: null,
    },

    specialization: {
      type: String,
      default: null,
    },

    // Current jurisdiction / posting
    jurisdiction: {
      type: String,
      default: null,
      trim: true,
    },

    workload: {
      type: Number,
      default: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);