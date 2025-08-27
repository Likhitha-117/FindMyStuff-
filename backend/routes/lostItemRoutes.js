const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/authMiddleware');
const {
  createLostItem,
  getAllLostItems,
  getLostItemById,   // ✅ fixed comma
  updateLostItem,    // ✅
  deleteLostItem     // ✅
} = require('../controllers/lostItemController');

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/lost-items');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `lost-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// ✅ Routes
router.post('/', verifyToken, upload.single('image'), createLostItem);
router.get('/', getAllLostItems);
router.get('/:id', getLostItemById); 
router.put('/:id', verifyToken, upload.single('image'), updateLostItem); // ✅ Update
router.delete('/:id', verifyToken, deleteLostItem); // ✅ Delete

module.exports = router;
