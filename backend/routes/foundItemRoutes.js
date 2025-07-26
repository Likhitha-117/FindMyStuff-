// 📁 routes/foundItemRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/authMiddleware'); // ✅ your JWT middleware
const {
  createFoundItem,
  getAllFoundItems,
} = require('../controllers/foundItemController');

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/found-items'); // Save under /uploads/found-items
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `found-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// ✅ Protected route to create a found item (with image)
router.post('/', verifyToken, upload.single('imagePath'), createFoundItem);

// ✅ Public route to get found items
router.get('/', getAllFoundItems);

module.exports = router;
