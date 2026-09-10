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

    department: {
      type: String,
      default: null,
    },

    specialization: {
      type: String,
      default: null,
    },

    jurisdiction: {
      type: String,
      default: null,
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