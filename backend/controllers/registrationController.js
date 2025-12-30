const asyncHandler = require('express-async-handler');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Register user for an event
// @route   POST /api/registrations/:eventId
// @access  Private (Student)
const registerEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if event is approved
    if (event.status !== 'approved') {
        res.status(400);
        throw new Error('Cannot register for an unapproved event');
    }

    // Check if user already registered
    const existingRegistration = await Registration.findOne({ user: userId, event: eventId });
    if (existingRegistration) {
        res.status(400);
        throw new Error('User already registered for this event');
    }

    const registration = await Registration.create({
        user: userId,
        event: eventId,
    });

    res.status(201).json(registration);
});

// @desc    Get logged-in user's registrations
// @route   GET /api/registrations/my
// @access  Private
const getMyRegistrations = asyncHandler(async (req, res) => {
    const registrations = await Registration.find({ user: req.user._id })
        .populate('event', 'title date time venue')
        .sort({ registeredAt: -1 });
    res.json(registrations);
});

// @desc    Get all registrations for an event (Faculty/Admin)
// @route   GET /api/registrations/event/:eventId
// @access  Private (Faculty/Admin)
const getEventRegistrations = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const registrations = await Registration.find({ event: eventId })
        .populate('user', 'name email department')
        .sort({ registeredAt: -1 });

    res.json(registrations);
});

// @desc    Mark attendance
// @route   PUT /api/registrations/:id/attendance
// @access  Private (Faculty/Admin)
const markAttendance = asyncHandler(async (req, res) => {
    const registration = await Registration.findById(req.params.id);

    if (registration) {
        registration.attendance = req.body.attendance || !registration.attendance; // Toggle if no body, or set specific
        const updatedRegistration = await registration.save();
        res.json(updatedRegistration);
    } else {
        res.status(404);
        throw new Error('Registration not found');
    }
});

// @desc    Get certificate data
// @route   GET /api/registrations/:id/certificate
// @access  Private
const getCertificate = asyncHandler(async (req, res) => {
    const registration = await Registration.findById(req.params.id)
        .populate('user', 'name')
        .populate('event', 'title date venue');

    if (!registration) {
        res.status(404);
        throw new Error('Registration not found');
    }

    if (registration.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'faculty') {
        res.status(401);
        throw new Error('Not authorized');
    }

    if (!registration.attendance) {
        res.status(400);
        throw new Error('Attendance not marked. Cannot generate certificate.');
    }

    res.json({
        id: registration._id,
        studentName: registration.user.name,
        eventName: registration.event.title,
        date: registration.event.date,
        venue: registration.event.venue,
        issuedDate: new Date(),
    });
});

module.exports = { registerEvent, getMyRegistrations, getEventRegistrations, markAttendance, getCertificate };
