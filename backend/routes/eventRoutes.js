const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    getPendingEvents,
    approveEvent,
    rejectEvent,
    getMyEvents,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    checkRegistrationStatus,
    markEventAttendance,
    getEventAttendance,
    generateCertificate
} = require('../controllers/eventController');
const { protect, admin, facultyOrAdmin, adminOrCoordinator } = require('../middleware/authMiddleware');

router.route('/')
    .get(getEvents)
    .post(protect, createEvent);

router.route('/my')
    .get(protect, facultyOrAdmin, getMyEvents);

router.route('/pending')
    .get(protect, admin, getPendingEvents);

router.route('/:id')
    .get(getEventById)
    .put(protect, updateEvent)
    .delete(protect, admin, deleteEvent);

router.route('/:id/approve')
    .put(protect, admin, approveEvent);

router.route('/:id/reject')
    .put(protect, admin, rejectEvent);

router.route('/:id/register')
    .post(protect, registerForEvent);

router.route('/:id/unregister')
    .delete(protect, unregisterFromEvent);

router.route('/:id/registration-status')
    .get(protect, checkRegistrationStatus);

router.route('/:id/attendance')
    .post(protect, markEventAttendance)
    .get(protect, getEventAttendance);

// Certificate Generation
router.get('/:id/certificate', protect, generateCertificate);

module.exports = router;
