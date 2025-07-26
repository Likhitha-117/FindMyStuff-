// 📁 models/FoundItem.js
const mongoose = require("mongoose");

const foundItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dateFound: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  imagePath: {
    type: String
  }, // File path saved by Multer
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model("FoundItem", foundItemSchema);
