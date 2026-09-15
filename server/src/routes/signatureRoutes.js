const express = require("express");
const protect = require("../middleware/authMiddleware");
const upload = require("../config/upload");
const {
  signEvidence,
  verifySignature,
  getSignedEvidence
} = require("../controllers/signatureController");
const router = express.Router();

router.post(
  "/:evidenceId/sign",
  protect,
  upload.single("signature"),
  signEvidence
);
router.get(
  "/:evidenceId/signature/verify",
  protect,
  verifySignature
);
router.get(
  "/:evidenceId/signed",
  protect,
  getSignedEvidence
);

module.exports = router;