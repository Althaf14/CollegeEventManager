const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const PDFDocument = require('pdfkit');
const { checkCertificateEligibility } = require('../utils/certificateUtils');

// @desc    Fetch all approved events (public)
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({}).sort({ eventDate: 1 }).populate('createdBy', 'name email');
    res.json(events);
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (event) {
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
    const {
        title,
        description,
        category,
        department,
        venue,
        eventDate,
        startTime,
        endTime,
        maxParticipants
    } = req.body;

    if (!title || !eventDate) {
        res.status(400);
        throw new Error('Please provide title and event date');
    }

    // Determine status based on role
    // Students -> Pending
    // Admin/Faculty/Coordinator -> Upcoming (Approved)
    let initialStatus = 'Upcoming';
    if (req.user.role === 'student') {
        initialStatus = 'pending';
    }

    const event = new Event({
        title,
        description,
        category,
        department,
        venue,
        eventDate,
        startTime,
        endTime,
        maxParticipants,
        createdBy: req.user._id,
        status: initialStatus
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
        event.status = 'Upcoming';
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

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin or Event Coordinator)
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        // Check authorization: Admin or Event Creator
        if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this event');
        }

        const {
            title,
            description,
            category,
            department,
            venue,
            eventDate,
            startTime,
            endTime,
            maxParticipants,
            status
        } = req.body;

        event.title = title || event.title;
        event.description = description || event.description;
        event.category = category || event.category;
        event.department = department || event.department;
        event.venue = venue || event.venue;
        event.eventDate = eventDate || event.eventDate;
        event.startTime = startTime || event.startTime;
        event.endTime = endTime || event.endTime;
        event.maxParticipants = maxParticipants || event.maxParticipants;
        event.status = status || event.status;

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private (Student)
const registerForEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if user is a student
    if (req.user.role !== 'student') {
        res.status(403); // Forbidden
        throw new Error('Only students can register for events');
    }

    // Check if event is upcoming or approved
    if (event.status !== 'Upcoming' && event.status !== 'approved') {
        res.status(400);
        throw new Error('Cannot register. Event is not Upcoming or Approved');
    }

    // Check capacity
    if (event.maxParticipants && event.registeredCount >= event.maxParticipants) {
        res.status(400);
        throw new Error('Event is full');
    }

    // Check validation for duplicate registration handled by database unique index, 
    // but explicit check is friendlier.
    const existingRegistration = await Registration.findOne({
        event: event._id,
        student: req.user._id
    });

    if (existingRegistration) {
        res.status(400);
        throw new Error('You are already registered for this event');
    }

    // Create Registration
    const registration = await Registration.create({
        event: event._id,
        student: req.user._id,
    });

    if (registration) {
        // Increment registered count
        event.registeredCount = (event.registeredCount || 0) + 1;
        await event.save();

        res.status(201).json({
            message: 'Registration successful',
            registration
        });
    } else {
        res.status(400);
        throw new Error('Invalid registration data');
    }
});

// @desc    Unregister from an event
// @route   DELETE /api/events/:id/unregister
// @access  Private (Student)
const unregisterFromEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if user is a student
    if (req.user.role !== 'student') {
        res.status(403);
        throw new Error('Only students can unregister from events');
    }

    // Check if registration exists
    const registration = await Registration.findOne({
        event: event._id,
        student: req.user._id
    });

    if (!registration) {
        res.status(400);
        throw new Error('You are not registered for this event');
    }

    // Delete Registration
    await registration.deleteOne();

    // Decrement registered count
    if (event.registeredCount > 0) {
        event.registeredCount = event.registeredCount - 1;
        await event.save();
    }

    res.json({ message: 'Successfully unregistered from event' });
});

// @desc    Check if user is registered for an event
// @route   GET /api/events/:id/registration-status
// @access  Private (Student)
const checkRegistrationStatus = asyncHandler(async (req, res) => {
    const registration = await Registration.findOne({
        event: req.params.id,
        student: req.user._id
    });

    res.json({ registered: !!registration });
});

// @desc    Mark attendance for an event
// @route   POST /api/events/:id/attendance
// @access  Private (Admin or Event Creator)
const markEventAttendance = asyncHandler(async (req, res) => {
    const { attendance } = req.body; // Expects [{ studentId, status }]
    const eventId = req.params.id;

    const event = await Event.findById(eventId);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Authorization: Admin or Creator
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to mark attendance for this event');
    }

    if (!attendance || !Array.isArray(attendance)) {
        res.status(400);
        throw new Error('Invalid attendance data');
    }

    const results = [];

    for (const record of attendance) {
        const { studentId, status } = record;

        // Verify registration
        const isRegistered = await Registration.findOne({ event: eventId, student: studentId });

        if (isRegistered) {
            const att = await Attendance.findOneAndUpdate(
                { event: eventId, student: studentId },
                { status: status || 'Present', markedAt: Date.now() },
                { new: true, upsert: true }
            );
            results.push(att);
        }
    }

    res.json({ message: `Attendance marked for ${results.length} students`, results });
});

// @desc    Get attendance list for an event
// @route   GET /api/events/:id/attendance
// @access  Private (Admin, Faculty, Event Creator)
const getEventAttendance = asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Auth Check
    if (req.user.role !== 'admin' && req.user.role !== 'faculty' && event.createdBy.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to view attendance for this event');
    }

    // Get all registrations to know who SHOULD be there
    const registrations = await Registration.find({ event: eventId })
        .populate('student', 'name department email'); // Assuming User model has these fields

    // Get existing attendance records
    const attendanceRecords = await Attendance.find({ event: eventId });

    // Merge data
    const attendanceList = registrations.map(reg => {
        const record = attendanceRecords.find(
            ar => ar.student.toString() === reg.student._id.toString()
        );

        return {
            studentId: reg.student._id,
            name: reg.student.name,
            email: reg.student.email,
            department: reg.student.department,
            status: record ? record.status : 'Not Marked', // Distinct from 'Absent' if not yet processed
            markedAt: record ? record.markedAt : null
        };
    });

    res.json(attendanceList);
});

// @desc    Get logged-in student's attendance history
// @route   GET /api/my-attendance
// @access  Private (Student)
const getMyAttendance = asyncHandler(async (req, res) => {
    const attendance = await Attendance.find({ student: req.user._id })
        .populate('event', 'title eventDate startTime venue status')
        .sort({ markedAt: -1 });
    res.json(attendance);
});



// @desc    Generate Certificate
// @route   GET /api/events/:id/certificate
// @access  Private (Student Only)
// @desc    Generate Certificate
// @route   GET /api/events/:id/certificate
// @access  Private (Student Only)
const generateCertificate = asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const studentId = req.user._id;

    // 1. Check Eligibility
    const { eligible, message } = await checkCertificateEligibility(studentId, eventId);

    if (!eligible) {
        res.status(400);
        throw new Error(message || 'Not eligible for certificate');
    }

    const event = await Event.findById(eventId);
    const student = await require('../models/User').findById(studentId);

    // 2. Create PDF
    const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 50
    });

    // 3. Set Response Headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate-${event.title.replace(/ /g, '_')}.pdf`);

    // 4. Pipe Response
    doc.pipe(res);

    // --- PDF Design ---
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // double border
    doc.lineWidth(3).strokeColor('#1F2937').rect(20, 20, pageWidth - 40, pageHeight - 40).stroke();
    doc.lineWidth(1).strokeColor('#E5E7EB').rect(25, 25, pageWidth - 50, pageHeight - 50).stroke();

    // Header
    doc.moveDown(2);
    doc.font('Times-Bold').fontSize(36).fillColor('#111827').text('COLLEGE EVENT MANAGEMENT', { align: 'center' });

    doc.moveDown(0.5);
    doc.font('Times-Roman').fontSize(14).fillColor('#6B7280').text('ESTD. 2024 | EXCELLENCE IN EDUCATION', { align: 'center', characterSpacing: 2 });

    doc.moveDown(2.5);

    // Title
    doc.font('Times-BoldItalic').fontSize(42).fillColor('#1E40AF').text('Certificate of Participation', { align: 'center' });

    doc.moveDown(1.5);

    // Body Text
    doc.font('Times-Roman').fontSize(18).fillColor('#374151').text('This is to certify that', { align: 'center' });

    doc.moveDown(0.8);
    // Student Name (Underlined style visual)
    doc.font('Times-Bold').fontSize(32).fillColor('#111827').text(student.name, { align: 'center' });

    doc.moveDown(0.8);
    doc.font('Times-Roman').fontSize(18).fillColor('#374151').text('has successfully participated in the event', { align: 'center' });

    doc.moveDown(0.8);
    // Event Title
    doc.font('Times-Bold').fontSize(28).fillColor('#1F2937').text(event.title, { align: 'center' });

    doc.moveDown(0.5);
    doc.font('Times-Italic').fontSize(16).fillColor('#4B5563').text(`held on ${new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });

    // Signatures
    const bottomY = pageHeight - 130;

    // Line specifics
    doc.lineWidth(1).strokeColor('#111827');

    // Coordinator Sig
    doc.moveTo(150, bottomY).lineTo(350, bottomY).stroke();
    doc.font('Times-Bold').fontSize(12).fillColor('#111827').text('Event Coordinator', 150, bottomY + 10, { width: 200, align: 'center' });

    // Principal Sig
    doc.moveTo(pageWidth - 350, bottomY).lineTo(pageWidth - 150, bottomY).stroke();
    doc.text('Principal', pageWidth - 350, bottomY + 10, { width: 200, align: 'center' });

    // Date Generated Footer
    doc.font('Times-Roman').fontSize(10).fillColor('#9CA3AF').text(
        `Issued on: ${new Date().toLocaleDateString()}`,
        50,
        pageHeight - 50,
        { align: 'center' }
    );

    doc.end();
});

module.exports = {
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
    getMyAttendance,
    generateCertificate
};
