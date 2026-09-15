const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createFIR,
  getFIR,
  getMyFIRs,
} = require("../controllers/firController");

const router = express.Router();


// Create FIR
router.post(
  "/",
  protect,
  allowRoles("CITIZEN"),
  createFIR
);


// Get my FIRs
router.get(
  "/my",
  protect,
  allowRoles("CITIZEN"),
  getMyFIRs
);


// Get single FIR
router.get(
  "/:firId",
  protect,
  allowRoles(
    "CITIZEN",
    "POLICE",
    "INVESTIGATING_AGENCY",
    "COURT",
    "ADMIN"
  ),
  getFIR
);


module.exports = router;