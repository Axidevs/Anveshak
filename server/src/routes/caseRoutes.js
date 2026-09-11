const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createCaseFromFIR,
  updateStatus,
  getTimeline,
} = require("../controllers/caseController");
const router = express.Router();

router.post("/", protect, createCaseFromFIR);
router.patch("/status", protect, updateStatus);
router.get("/:caseId/timeline", protect, getTimeline);

module.exports = router;