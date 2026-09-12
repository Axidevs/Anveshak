const express = require("express");

const {
  assignCase,
} = require("../controllers/assignmentController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createCaseFromFIR,
  updateStatus,
  getAllCases,
  getSingleCase,
  getAssignedCases,
  getCaseAuditLogs,
  getCaseStats,
  getTimeline,
  analyzeCaseWithAI,
} = require("../controllers/caseController");

const router = express.Router();


// Create case from FIR
router.post(
  "/",
  protect,
  allowRoles("CITIZEN", "POLICE", "ADMIN"),
  createCaseFromFIR
);

// Analyze case with AI

router.post(
  "/analyze",
  protect,
  allowRoles(
    "POLICE",
    "ADMIN",
    "INVESTIGATING_AGENCY"
  ),
  analyzeCaseWithAI
);
router.get(
  "/",
  protect,
  allowRoles(
    "CITIZEN",
    "POLICE",
    "INVESTIGATING_AGENCY",
    "COURT",
    "ADMIN"
  ),
  getAllCases
);


// Get assigned cases
router.get(
  "/assigned-to-me",
  protect,
  allowRoles("POLICE"),
  getAssignedCases
);


// Dashboard statistics
router.get(
  "/stats",
  protect,
  allowRoles("POLICE", "ADMIN", "INVESTIGATING_AGENCY"),
  getCaseStats
);


// Update case status
router.patch(
  "/status",
  protect,
  allowRoles("POLICE", "ADMIN"),
  updateStatus
);


// Case timeline
router.get(
  "/:caseId/timeline",
  protect,
  allowRoles(
    "CITIZEN",
    "POLICE",
    "INVESTIGATING_AGENCY",
    "COURT",
    "ADMIN"
  ),
  getTimeline
);


// Case audit history
router.get(
  "/:caseId/audit",
  protect,
  allowRoles(
    "CITIZEN",
    "POLICE",
    "INVESTIGATING_AGENCY",
    "COURT",
    "ADMIN"
  ),
  getCaseAuditLogs
);


// Single case
router.get(
  "/:caseId",
  protect,
  allowRoles(
    "CITIZEN",
    "POLICE",
    "INVESTIGATING_AGENCY",
    "COURT",
    "ADMIN"
  ),
  getSingleCase
);


// Smart case assignment
router.patch(
  "/assign",
  protect,
  allowRoles("POLICE", "ADMIN"),
  assignCase
);


module.exports = router;