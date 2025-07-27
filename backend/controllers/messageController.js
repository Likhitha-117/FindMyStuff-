const Message = require('../models/Message');
const User = require('../models/User');

// POST: Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, text } = req.body;

    const message = new Message({
      sender: req.userId,
      recipient: recipientId,
      text
    });

    const saved = await message.save();

    res.status(201).json({ message: 'Message sent', data: saved });
  } catch (err) {
    console.error("❌ Error sending message:", err.message);
    res.status(500).json({ error: 'Server error while sending message' });
  }
};

// GET: Get chat messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: userId },
        { sender: userId, recipient: req.userId }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err.message);
    res.status(500).json({ error: 'Server error while retrieving messages' });
  }
};
