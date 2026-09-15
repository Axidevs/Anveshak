const express = require("express");

const protect = require("../middleware/authMiddleware");
const upload = require("../config/upload");

const {
  uploadEvidence,
  verifyEvidence,
} = require("../controllers/evidenceController");

const router = express.Router();

router.post(
  "/upload",
  protect,
  upload.single("file"),
  uploadEvidence
);
router.post(
  "/:evidenceId/verify",
  protect,
  upload.single("file"),
  verifyEvidence
);

module.exports = router;