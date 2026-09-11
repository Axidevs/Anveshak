const express = require("express");
const { assignCase } = require("../controllers/assignmentController");


const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createCaseFromFIR,
  updateStatus,
  getTimeline,
} = require("../controllers/caseController");
const router = express.Router();

router.post("/", protect, createCaseFromFIR);
router.patch("/status", protect, updateStatus);
router.get("/:caseId/timeline", protect, getTimeline);
router.patch(
  "/assign",
  protect,
  allowRoles("POLICE", "ADMIN"),
  assignCase
);

module.exports = router;