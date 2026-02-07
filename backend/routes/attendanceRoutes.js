const express = require('express');
const router = express.Router();
const { getMyAttendance } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyAttendance);

module.exports = router;
