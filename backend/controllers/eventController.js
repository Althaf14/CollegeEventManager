const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// @desc    Fetch all approved events (public)
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ status: 'approved' }).populate('createdBy', 'name email');
    res.json(events);
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (event) {
        if (event.status !== 'approved' && (!req.user || req.user.role === 'student')) {
            res.status(401);
            throw new Error('Not authorized to view this event');
        }
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Faculty/Admin)
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, time, venue, department } = req.body;

    const event = new Event({
        title,
        description,
        date,
        time,
        venue,
        department,
        createdBy: req.user._id,
        status: 'pending',
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
});

// @desc    Get all pending events (Admin only)
// @route   GET /api/events/pending
// @access  Private (Admin)
const getPendingEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ status: 'pending' }).populate('createdBy', 'name email');
    res.json(events);
});

// @desc    Approve an event
// @route   PUT /api/events/:id/approve
// @access  Private (Admin)
const approveEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        event.status = 'approved';
        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Reject an event
// @route   PUT /api/events/:id/reject
// @access  Private (Admin)
const rejectEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        event.status = 'rejected';
        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Get logged-in user's created events
// @route   GET /api/events/my
// @access  Private (Faculty/Admin)
const getMyEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(events);
});

module.exports = { getEvents, getEventById, createEvent, getPendingEvents, approveEvent, rejectEvent, getMyEvents };
