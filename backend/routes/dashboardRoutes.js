const express = require('express');
const router = express.Router();
const { getAdminStats, getCoordinatorStats, getStudentStats } = require('../controllers/dashboardController');
const { protect, admin, adminOrCoordinator } = require('../middleware/authMiddleware');

router.get('/admin', protect, admin, getAdminStats);
router.get('/coordinator', protect, adminOrCoordinator, getCoordinatorStats);
router.get('/student', protect, getStudentStats);

module.exports = router;
