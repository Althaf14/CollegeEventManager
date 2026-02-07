const express = require('express');
const router = express.Router();
const {
    getEventParticipationStats,
    getEventAttendanceStats,
    getDepartmentParticipationStats,
    exportReport
} = require('../controllers/reportController');
const { protect, admin, facultyOrAdmin } = require('../middleware/authMiddleware');

// All report routes require authentication and at least Faculty role
router.get('/event-summary', protect, facultyOrAdmin, getEventParticipationStats);
router.get('/attendance-summary', protect, facultyOrAdmin, getEventAttendanceStats);
router.get('/department-summary', protect, facultyOrAdmin, getDepartmentParticipationStats);
router.get('/export', protect, facultyOrAdmin, exportReport);

module.exports = router;
