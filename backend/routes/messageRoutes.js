const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware'); // assuming you have JWT auth middleware

// Send a new message (POST)
router.post('/send', authMiddleware, messageController.sendMessage);

// Get all messages between logged-in user and another user (GET)
router.get('/:userId', authMiddleware, messageController.getMessages);

module.exports = router;
