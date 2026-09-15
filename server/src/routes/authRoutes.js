const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getMe,
  demoIdentityLogin,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/demo-login", demoIdentityLogin);

router.get("/me", protect, getMe);

module.exports = router;