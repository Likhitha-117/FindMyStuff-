const express = require("express");
const router = express.Router();
const { startChat, sendMessage, getMessages } = require("../controllers/messageController");
const auth = require("../middleware/authMiddleware");

// Start chat with item owner
router.post("/chat/start/:itemId", auth, startChat);

// Send a message in a chat
router.post("/chat/:chatId/message", auth, sendMessage);

// Get all messages in a chat
router.get("/chat/:chatId/messages", auth, getMessages);

module.exports = router;
