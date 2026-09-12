const express = require("express");
const router = express.Router();
const courtController = require("../controllers/courtController");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Route protection: Must be authenticated and have COURT role
// NOTE: I am keeping ADMIN as well just in case they need to test it without logging in as court
router.use(authMiddleware);

// POST: Add Order / Next Hearing
router.post(
  "/case/:caseId/order",
  allowRoles("COURT", "ADMIN"),
  upload.single("file"), // the field name sent from frontend should be 'file'
  courtController.addHearingOrder
);

// POST: Upload Final Judgment
router.post(
  "/case/:caseId/judgment",
  allowRoles("COURT", "ADMIN"),
  upload.single("file"),
  courtController.uploadFinalJudgment
);

// POST: Upload General Court Document
router.post(
  "/case/:caseId/document",
  allowRoles("COURT", "ADMIN"),
  upload.single("file"),
  courtController.uploadCourtDocument
);

// GET: Fetch all documents for a case
router.get(
  "/case/:caseId/documents",
  allowRoles("COURT", "ADMIN"),
  courtController.getCaseDocuments
);



// POST: Record Audit Log
router.post(
  "/case/:caseId/audit",
  allowRoles("COURT", "ADMIN"),
  courtController.addAuditLog
);

// GET: Fetch Audit Logs
router.get(
  "/case/:caseId/audit",
  allowRoles("COURT", "ADMIN"),
  courtController.getAuditLogs
);


module.exports = router;
