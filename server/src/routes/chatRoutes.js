const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const protect = require("../middleware/authMiddleware");

// Both citizen, police, and court can access case chat if authenticated
router.use(protect);

router.post("/case/:caseId", chatController.sendMessage);
router.get("/case/:caseId", chatController.getMessages);

module.exports = router;
