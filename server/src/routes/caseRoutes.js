const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createCaseFromFIR,
} = require("../controllers/caseController");

const router = express.Router();

router.post("/", protect, createCaseFromFIR);

module.exports = router;