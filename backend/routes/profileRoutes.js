const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfileImage } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.post('/image', protect, upload.single('image'), uploadProfileImage);

module.exports = router;
