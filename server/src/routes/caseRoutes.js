const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createCaseFromFIR,
  updateStatus,
} = require("../controllers/caseController");
const router = express.Router();

router.post("/", protect, createCaseFromFIR);
router.patch("/status", protect, updateStatus);

module.exports = router;