const FoundItem = require('../models/FoundItem');

// ✅ POST: Report a found item (Only logged-in users)
exports.createFoundItem = async (req, res) => {
  try {
    const { itemName, description, location, dateFound } = req.body;
    const imagePath = req.file ? req.file.path : null;

    const foundItem = new FoundItem({
      itemName,
      description,
      location,
      dateFound,
      imagePath,
      user: req.userId // 👈 This comes from auth middleware
    });

    await foundItem.save();

    res.status(201).json({
      message: "Found item reported successfully!",
      foundItem
    });
  } catch (err) {
    console.error("❌ Error saving found item:", err);
    res.status(500).json({ error: "Server error while reporting found item" });
  }
};

// ✅ GET: Retrieve all found items (filters optional)
exports.getAllFoundItems = async (req, res) => {
  try {
    const { itemName, location, dateFound } = req.query;

    const filter = {};
    if (itemName) {
      filter.itemName = { $regex: itemName, $options: 'i' }; // case-insensitive
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (dateFound) {
      filter.dateFound = new Date(dateFound);
    }

    const items = await FoundItem.find(filter)
      .populate("user", "name email") // optional: show name/email of finder
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (err) {
    console.error("❌ Error fetching found items:", err);
    res.status(500).json({ message: "Error retrieving found items" });
  }
};
// ✅ GET: Single found item by ID
exports.getFoundItemById = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id).populate("user", "name email");

    if (!item) {
      return res.status(404).json({ message: 'Found item not found' });
    }

    res.status(200).json(item);
  } catch (err) {
    console.error("❌ Error fetching found item by ID:", err.message);
    res.status(500).json({ message: 'Server error retrieving item' });
  }
};


exports.updateFoundItem = async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);

    if (!foundItem) {
      return res.status(404).json({ message: "Found item not found" });
    }

    // Update fields
    foundItem.itemName = req.body.itemName || foundItem.itemName;
    foundItem.description = req.body.description || foundItem.description;
    foundItem.dateFound = req.body.dateFound || foundItem.dateFound;
    foundItem.location = req.body.location || foundItem.location;

    if (req.file) {
      foundItem.imagePath = req.file.path;
    }

    await foundItem.save();
    res.json({ message: "Found item updated successfully", foundItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating found item" });
  }
};

exports.deleteFoundItem = async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);

    if (!foundItem) {
      return res.status(404).json({ message: "Found item not found" });
    }

    await foundItem.deleteOne();
    res.json({ message: "Found item deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting found item" });
  }
};


exports.deleteFoundItem = async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);

    if (!foundItem) {
      return res.status(404).json({ message: "Found item not found" });
    }

    // ✅ Ensure only the creator can delete
    if (foundItem.user.toString() !== req.userId) { // 👈 use req.userId (from middleware)
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    await foundItem.deleteOne();

    res.json({ message: "Found item deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting found item:", err);
    res.status(500).json({ message: "Server error while deleting found item" });
  }
};
