const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    getPendingEvents,
    approveEvent,
    rejectEvent,
    getMyEvents
} = require('../controllers/eventController');
const { protect, admin, facultyOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getEvents)
    .post(protect, facultyOrAdmin, createEvent);

router.route('/my')
    .get(protect, facultyOrAdmin, getMyEvents);

router.route('/pending')
    .get(protect, admin, getPendingEvents);

router.route('/:id')
    .get(getEventById);

router.route('/:id/approve')
    .put(protect, admin, approveEvent);

router.route('/:id/reject')
    .put(protect, admin, rejectEvent);

module.exports = router;
