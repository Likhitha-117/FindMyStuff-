// 📁 routes/foundItemRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/authMiddleware');

const {
  createFoundItem,
  getAllFoundItems,
  getFoundItemById, // 👈 add this
   updateFoundItem,   // 👈 add this
  deleteFoundItem    // 👈 add this
} = require('../controllers/foundItemController'); // 👈 make sure it's exported

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/found-items');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `found-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// ✅ Create found item (login required)
router.post('/', verifyToken, upload.single('image'), createFoundItem);

// ✅ Get all found items (public)
router.get('/', getAllFoundItems);

// ✅ Get a single found item by ID (public)
router.get('/:id', getFoundItemById); // 👈 this route
router.put("/:id", verifyToken, upload.single('image'),updateFoundItem);   // ✅ Update
router.delete("/:id", verifyToken, deleteFoundItem); // ✅ Delete

module.exports = router;
