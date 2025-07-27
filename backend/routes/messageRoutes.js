const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

// 📩 Send a message
router.post('/send', authMiddleware, messageController.sendMessage);

router.get('/chatlist', authMiddleware, messageController.getChatList);
router.get('/:userId', authMiddleware, messageController.getMessages);


module.exports = router;
