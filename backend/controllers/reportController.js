const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');

// --- Helper Functions for Data Fetching ---

const fetchParticipationData = async (user) => {
    let matchStage = {};
    if (user.role !== 'admin') {
        const myEvents = await Event.find({ createdBy: user._id }).select('_id');
        const myEventIds = myEvents.map(e => e._id);
        matchStage = { event: { $in: myEventIds } };
    }

    return await Registration.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$event',
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'events',
                localField: '_id',
                foreignField: '_id',
                as: 'eventDetails'
            }
        },
        { $unwind: '$eventDetails' },
        {
            $project: {
                _id: 0,
                eventId: '$_id',
                label: '$eventDetails.title',
                value: '$count'
            }
        },
        { $sort: { value: -1 } }
    ]);
};

const fetchAttendanceData = async (user) => {
    let eventQuery = {};
    let attendanceMatch = { status: 'Present' };

    if (user.role !== 'admin') {
        const myEvents = await Event.find({ createdBy: user._id }).select('_id');
        const myEventIds = myEvents.map(e => e._id);
        eventQuery = { _id: { $in: myEventIds } };
        attendanceMatch.status = 'Present';
        attendanceMatch.event = { $in: myEventIds };
    }

    const presentStats = await Attendance.aggregate([
        { $match: attendanceMatch },
        {
            $group: {
                _id: '$event',
                presentCount: { $sum: 1 }
            }
        }
    ]);

    const presentMap = new Map();
    presentStats.forEach(stat => {
        presentMap.set(stat._id.toString(), stat.presentCount);
    });

    const events = await Event.find(eventQuery, 'title registeredCount');

    return events.map(event => {
        const present = presentMap.get(event._id.toString()) || 0;
        const registered = event.registeredCount || 0;
        let percentage = 0;
        if (registered > 0) {
            percentage = Math.round((present / registered) * 100);
        }
        return {
            eventId: event._id,
            label: event.title,
            registered: registered,
            present: present,
            percentage: percentage
        };
    });
};

const fetchDepartmentData = async (user) => {
    let matchStage = {};
    if (user.role !== 'admin') {
        const myEvents = await Event.find({ createdBy: user._id }).select('_id');
        const myEventIds = myEvents.map(e => e._id);
        matchStage = { event: { $in: myEventIds } };
    }

    return await Registration.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: 'users',
                localField: 'student',
                foreignField: '_id',
                as: 'studentDetails'
            }
        },
        { $unwind: '$studentDetails' },
        {
            $group: {
                _id: '$studentDetails.department',
                count: { $sum: 1 }
            }
        },
        { $match: { _id: { $ne: null } } },
        {
            $project: {
                _id: 0,
                label: '$_id',
                value: '$count'
            }
        },
        { $sort: { value: -1 } }
    ]);
};

// --- Controllers ---

// @desc    Get Event Participation Stats
// @route   GET /api/reports/event-summary
const getEventParticipationStats = asyncHandler(async (req, res) => {
    const data = await fetchParticipationData(req.user);
    res.json(data);
});

// @desc    Get Event Attendance Stats
// @route   GET /api/reports/attendance-summary
const getEventAttendanceStats = asyncHandler(async (req, res) => {
    const data = await fetchAttendanceData(req.user);
    res.json(data);
});

// @desc    Get Department Participation Stats
// @route   GET /api/reports/department-summary
const getDepartmentParticipationStats = asyncHandler(async (req, res) => {
    const data = await fetchDepartmentData(req.user);
    res.json(data);
});

// @desc    Export Report
// @route   GET /api/reports/export?type=...&format=...
// @access  Private (Admin/Faculty)
const exportReport = asyncHandler(async (req, res) => {
    const { type, format } = req.query;
    let data = [];
    let title = '';
    let columns = [];

    // 1. Fetch Data
    switch (type) {
        case 'participation':
            data = await fetchParticipationData(req.user);
            title = 'Event Participation Report';
            columns = ['Event Name', 'Registrations'];
            break;
        case 'attendance':
            data = await fetchAttendanceData(req.user);
            title = 'Event Attendance Report';
            columns = ['Event Name', 'Registered', 'Present', 'Percentage (%)'];
            break;
        case 'department':
            data = await fetchDepartmentData(req.user);
            title = 'Department Participation Report';
            columns = ['Department', 'Students'];
            break;
        default:
            res.status(400);
            throw new Error('Invalid report type');
    }

    // 2. Format & Send Response
    if (format === 'pdf') {
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${title.replace(/ /g, '_')}.pdf`);
        doc.pipe(res);

        // PDF Header
        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Simple Table Logic for PDF
        let y = doc.y;
        const xStart = 50;

        // Headers
        doc.font('Helvetica-Bold');
        columns.forEach((col, i) => {
            doc.text(col, xStart + (i * 150), y);
        });
        y += 20;
        doc.lineWidth(1).moveTo(xStart, y).lineTo(550, y).stroke();
        y += 10;

        // Rows
        doc.font('Helvetica');
        data.forEach(row => {
            if (type === 'participation' || type === 'department') {
                doc.text(row.label, xStart, y);
                doc.text(row.value.toString(), xStart + 150, y);
            } else if (type === 'attendance') {
                doc.text(row.label, xStart, y, { width: 140, ellipsis: true });
                doc.text(row.registered.toString(), xStart + 150, y);
                doc.text(row.present.toString(), xStart + 300, y);
                doc.text(row.percentage + '%', xStart + 450, y);
            }
            y += 20;

            // New Page check
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
        });

        doc.end();

    } else if (format === 'excel') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        worksheet.columns = columns.map(col => ({ header: col, key: col, width: 30 }));

        // Add Data
        data.forEach(row => {
            if (type === 'participation' || type === 'department') {
                worksheet.addRow([row.label, row.value]);
            } else if (type === 'attendance') {
                worksheet.addRow([row.label, row.registered, row.present, row.percentage + '%']);
            }
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${title.replace(/ /g, '_')}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } else {
        res.status(400);
        throw new Error('Invalid export format');
    }
});

module.exports = {
    getEventParticipationStats,
    getEventAttendanceStats,
    getDepartmentParticipationStats,
    exportReport
};
