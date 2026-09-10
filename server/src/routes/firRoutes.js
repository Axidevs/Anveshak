const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createFIR,
  getFIR,
  getMyFIRs,
} = require("../controllers/firController");

const router = express.Router();

router.post("/", protect, createFIR);

router.get("/my", protect, getMyFIRs);

router.get("/:firId", protect, getFIR);

module.exports = router;