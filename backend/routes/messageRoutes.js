// 📁 routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Message = require("../models/Message");

// ✅ Get all messages for a specific item
router.get("/:itemId/:type", auth, async (req, res) => {
  try {
    const { itemId, type } = req.params;
    const userId = req.userId;

    const messages = await Message.find({
      itemId,
      itemType: type === "lost" ? "LostItem" : "FoundItem",
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
