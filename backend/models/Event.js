const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
    },
    description: {
        type: String,
    },
    category: {
        type: String,
    },
    department: {
        type: String,
    },
    venue: {
        type: String,
    },
    eventDate: {
        type: Date,
        required: [true, 'Please add an event date'],
    },
    startTime: {
        type: String,
    },
    endTime: {
        type: String,
    },
    maxParticipants: {
        type: Number,
    },
    registeredCount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed'],
        default: 'Upcoming',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
