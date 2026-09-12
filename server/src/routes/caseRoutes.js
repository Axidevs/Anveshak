const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createCaseFromFIR,
  updateStatus,
  getTimeline,
} = require("../controllers/caseController");
const router = express.Router();

router.post("/", protect, allowRoles("CITIZEN", "POLICE", "ADMIN"), createCaseFromFIR);
router.patch("/status", protect, allowRoles("POLICE", "ADMIN"), updateStatus);
router.get("/:caseId/timeline", protect, getTimeline);

module.exports = router;