const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createCustodyLog,
  getCustodyLogs
} = require("../controllers/custodyController");

const router = express.Router();

router.post(
  "/custody",
  protect,
  createCustodyLog
);
router.get("/:evidenceId/custody", protect, getCustodyLogs);
module.exports = router;