const LostItem = require('../models/LostItem');

// ✅ POST: Create a new lost item (Login required)
exports.createLostItem = async (req, res) => {
  try {
    const { itemName, description, dateLost, location } = req.body;

    const newItem = new LostItem({
      itemName,
      description,
      dateLost,
      location,
      imagePath: req.file ? req.file.path : null,
      user: req.userId
    });

    const savedItem = await newItem.save();

    res.status(201).json({
      message: 'Lost item submitted successfully!',
      item: savedItem
    });
  } catch (err) {
    console.error("❌ Error saving item:", err.message);
    res.status(500).json({ message: 'Server error while saving lost item' });
  }
};

// ✅ GET: Fetch all lost items (with optional filters)
exports.getAllLostItems = async (req, res) => {
  try {
    const { itemName, location, dateLost } = req.query;
    const filter = {};

    if (itemName) {
      filter.itemName = { $regex: itemName, $options: 'i' };
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (dateLost) {
      filter.dateLost = new Date(dateLost);
    }

    const items = await LostItem.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (err) {
    console.error("❌ Error fetching lost items:", err);
    res.status(500).json({ message: 'Error retrieving lost items' });
  }
};

// ✅ GET: Fetch single lost item by ID
exports.getLostItemById = async (req, res) => {
  try {
    const itemId = req.params.id;

    const item = await LostItem.findById(itemId)
      .populate("user", "name email");

    if (!item) {
      return res.status(404).json({ message: "Lost item not found" });
    }

    res.status(200).json(item);
  } catch (err) {
    console.error("❌ Error fetching lost item by ID:", err);
    res.status(500).json({ message: "Server error while retrieving lost item" });
  }
};
//update

// 📌 Update Lost Item
exports.updateLostItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await LostItem.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: "Lost item not found" });
    }

    // ✅ Only owner can update
    if (item.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Build update data safely
    const updateData = {
      itemName: req.body.itemName || item.itemName,
      description: req.body.description || item.description,
      dateLost: req.body.dateLost || item.dateLost,
      location: req.body.location || item.location,
      imagePath: req.file ? req.file.path : item.imagePath, // keep old image if no new one
    };

    const updatedItem = await LostItem.findByIdAndUpdate(
      itemId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Lost item updated successfully",
      item: updatedItem,
    });
  } catch (err) {
  console.error("❌ Update error:", err.message, err.stack); // show real reason
  res.status(500).json({
    message: "Server error while updating lost item",
    error: err.message, // send actual error to frontend
  });
}

};
//delete
exports.deleteLostItem = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Lost item not found" });
    }

    // ✅ Only owner can delete
    if (item.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    await item.deleteOne();

    res.json({ message: "Lost item deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting lost item:", err);
    res.status(500).json({ message: "Server error while deleting lost item", error: err.message });
  }
};
