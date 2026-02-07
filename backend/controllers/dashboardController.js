const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminStats = asyncHandler(async (req, res) => {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });

    const recentEvents = await Event.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title eventDate venue status registeredCount');

    res.json({
        totalEvents,
        totalRegistrations,
        totalStudents,
        recentEvents
    });
});

// @desc    Get Coordinator Dashboard Stats
// @route   GET /api/dashboard/coordinator
// @access  Private (Coordinator/Faculty/Admin)
const getCoordinatorStats = asyncHandler(async (req, res) => {
    // If admin, maybe show all? But requirement says "Events created by coordinator". 
    // Admin likely has their own dashboard, so this endpoint might be strictly for "My Created Events" view.
    const myEvents = await Event.find({ createdBy: req.user._id })
        .sort({ eventDate: -1 });

    // Enhance events with attendance status? 
    // Requirement: "Attendance completion status"
    // We can check if any attendance records exist for the event.

    const enhancedEvents = await Promise.all(myEvents.map(async (event) => {
        const attendanceCount = await Attendance.countDocuments({ event: event._id });
        const attendanceMarked = attendanceCount > 0;

        return {
            _id: event._id,
            title: event.title,
            eventDate: event.eventDate,
            registeredCount: event.registeredCount,
            status: event.status,
            attendanceMarked
        };
    }));

    res.json({
        myEvents: enhancedEvents
    });
});

// @desc    Get Student Dashboard Stats
// @route   GET /api/dashboard/student
// @access  Private (Student)
const getStudentStats = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    const totalRegistrations = await Registration.countDocuments({ student: studentId });

    // Upcoming Events
    // Need to join with Event to check status
    // OR fetch registrations, populate event, filter in JS (might be slower but easier with Mongoose)
    // Better: Aggregate or query Registration with populated event match.

    // Simplest: Fetch all registrations, populate, filter.
    const registrations = await Registration.find({ student: studentId })
        .populate('event', 'title eventDate venue status');

    const upcomingEvents = registrations
        .filter(reg => reg.event && reg.event.status === 'Upcoming')
        .map(reg => reg.event);

    const attendanceStats = await Attendance.aggregate([
        { $match: { student: studentId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    let presentCount = 0;
    let absentCount = 0;

    attendanceStats.forEach(stat => {
        if (stat._id === 'Present') presentCount = stat.count;
        if (stat._id === 'Absent') absentCount = stat.count;
    });

    res.json({
        totalRegistrations,
        upcomingEvents,
        attendanceSummary: {
            present: presentCount,
            absent: absentCount
        }
    });
});

module.exports = {
    getAdminStats,
    getCoordinatorStats,
    getStudentStats
};
