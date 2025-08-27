const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    item: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "itemModel", // can be LostItem or FoundItem
    },
    itemModel: {
      type: String,
      enum: ["LostItem", "FoundItem"], // to know where item comes from
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
