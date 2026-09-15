const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getAnalytics,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get(
  "/",
  protect,
  allowRoles(
    "POLICE",
    "ADMIN",
    "INVESTIGATING_AGENCY"
  ),
  getAnalytics
);

module.exports = router;