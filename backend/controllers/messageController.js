const Chat = require("../models/Chat");
const Message = require("../models/Message");
const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");

// ✅ Start chat
exports.startChat = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id; // logged-in user

    // Try to find item in both collections
    let item = await LostItem.findById(itemId);
    let itemModel = "LostItem";
    if (!item) {
      item = await FoundItem.findById(itemId);
      itemModel = "FoundItem";
    }
    if (!item) return res.status(404).json({ message: "Item not found" });

    const ownerId = item.user.toString();

    if (ownerId === userId) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [userId, ownerId] },
      item: itemId,
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, ownerId],
        item: itemId,
        itemModel,
      });
      await chat.save();
    }

    res.json({ chatId: chat._id, message: "Chat started", chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while starting chat" });
  }
};

// ✅ Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const sender = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const receiver = chat.participants.find(
      (id) => id.toString() !== sender.toString()
    );

    const message = new Message({
      chatId,
      sender,
      receiver,
      content,
    });

    await message.save();
    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while sending message" });
  }
};

// ✅ Fetch messages
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).populate("sender", "name");
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching messages" });
  }
};
