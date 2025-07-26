// 📁 routes/lostItemRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/authMiddleware');
const { createLostItem, getAllLostItems } = require('../controllers/lostItemController');

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/lost-items'); // organized subfolder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `lost-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// ✅ Protected route for reporting lost item
router.post('/', verifyToken, upload.single('imagePath'), createLostItem);

// ✅ Public route for retrieving lost items
router.get('/', getAllLostItems);

module.exports = router;
