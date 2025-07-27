const Message = require('../models/Message');
const User = require('../models/User');

// 📩 POST: Send a message
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

// 💬 GET: Get chat messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: userId },
        { sender: userId, recipient: req.userId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name')
      .populate('recipient', 'name');

    const formattedMessages = messages.map((msg) => ({
      _id: msg._id,
      text: msg.text,
      senderName: msg.sender.name,
      recipientName: msg.recipient.name,
      timestamp: msg.createdAt?.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }) || 'Time Unknown',
    }));

    res.status(200).json(formattedMessages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err.message);
    res.status(500).json({ error: 'Server error while retrieving messages' });
  }
};

// 🗂️ GET: List of all users the current user has chatted with
exports.getChatList = async (req, res) => {
  try {
    const userId = req.userId;

    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name')
      .populate('recipient', 'name');

    const chatMap = new Map();

    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === userId
          ? msg.recipient
          : msg.sender;

      const otherUserId = otherUser._id.toString();

      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, {
          userId: otherUserId,
          name: otherUser.name,
          lastMessage: msg.text,
          timestamp: msg.createdAt?.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }) || 'Time Unknown',
        });
      }
    });

    const chatList = Array.from(chatMap.values());

    res.status(200).json(chatList);
  } catch (err) {
    console.error('❌ Error fetching chat list:', err.message);
    res.status(500).json({ error: 'Server error while fetching chat list' });
  }
};
