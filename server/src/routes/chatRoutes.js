const express = require("express");

const router = express.Router();

const chatController = require("../controllers/chatController");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.post("/case/:caseId", chatController.sendMessage);

router.get("/case/:caseId", chatController.getMessages);

module.exports = router;