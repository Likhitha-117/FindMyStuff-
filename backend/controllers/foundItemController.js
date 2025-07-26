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
