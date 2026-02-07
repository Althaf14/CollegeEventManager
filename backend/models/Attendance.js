const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event',
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        default: 'Absent',
    },
    markedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Ensure one attendance record per student per event
attendanceSchema.index({ event: 1, student: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
