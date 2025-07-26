const mongoose = require("mongoose");

const lostItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: String,
  dateLost: Date,
  location: String,
  imagePath: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("LostItem", lostItemSchema);
