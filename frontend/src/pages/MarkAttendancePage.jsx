import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MarkAttendancePage = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch Events (Admin sees all, others see created/relevant)
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Determine endpoint based on role? 
                // For simplicity assuming /events returns what is relevant or all public
                // Ideally backend should provide a filter for "My Created Events" or "Manageable Events"
                // Using /events for now, client-side filter might be needed if public api returns everything
                const { data } = await api.get('/events');
                setEvents(data);
            } catch (err) {
                console.error("Failed to fetch events", err);
                setError("Failed to load events");
            }
        };
        fetchEvents();
    }, []);

    // Fetch students when event is selected
    useEffect(() => {
        if (!selectedEventId) {
            setStudents([]);
            return;
        }

        const fetchStudents = async () => {
            setLoading(true);
            setError('');
            setSuccessMessage('');
            try {
                const { data } = await api.get(`/events/${selectedEventId}/attendance`);
                setStudents(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch student list');
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [selectedEventId]);

    const handleStatusChange = (studentId, newStatus) => {
        setStudents(students.map(student =>
            student.studentId === studentId ? { ...student, status: newStatus } : student
        ));
    };

    const handleCheckboxChange = (studentId, checked) => {
        handleStatusChange(studentId, checked ? 'Present' : 'Absent');
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const attendanceData = students.map(s => ({
                studentId: s.studentId,
                status: s.status === 'Not Marked' ? 'Absent' : s.status // Default to Absent if submitting untouched "Not Marked"
            }));

            await api.post(`/events/${selectedEventId}/attendance`, { attendance: attendanceData });
            setSuccessMessage('Attendance saved successfully!');

            // Refresh list to show updated timestamps/definitive status
            const { data } = await api.get(`/events/${selectedEventId}/attendance`);
            setStudents(data);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit attendance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold text-blue-400 mb-8">Mark Attendance</h1>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <label className="block text-gray-400 mb-2 font-bold">Select Event</label>
                <select
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                >
                    <option value="">-- Choose an Event --</option>
                    {events.map(event => (
                        <option key={event._id} value={event._id}>
                            {event.title} ({new Date(event.eventDate).toLocaleDateString()})
                        </option>
                    ))}
                </select>
            </div>

            {error && <div className="text-red-500 bg-red-900/20 border border-red-500 p-4 rounded mb-4">{error}</div>}
            {successMessage && <div className="text-green-500 bg-green-900/20 border border-green-500 p-4 rounded mb-4">{successMessage}</div>}

            {selectedEventId && (
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    {loading && students.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">Loading student list...</div>
                    ) : students.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No students registered for this event.</div>
                    ) : (
                        <>
                            <div className="p-4 bg-gray-700 flex justify-between items-center">
                                <h2 className="font-bold text-lg">Registered Students ({students.length})</h2>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Saving...' : 'Save Attendance'}
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-gray-400">
                                    <thead className="bg-gray-900 text-gray-200 uppercase text-xs font-bold">
                                        <tr>
                                            <th className="py-3 px-6">Student Name</th>
                                            <th className="py-3 px-6">Department</th>
                                            <th className="py-3 px-6">Current Status</th>
                                            <th className="py-3 px-6 text-center">Mark Present</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {students.map((student) => (
                                            <tr key={student.studentId} className="hover:bg-gray-750 transition-colors">
                                                <td className="py-4 px-6 font-medium text-white">{student.name}</td>
                                                <td className="py-4 px-6">{student.department || 'N/A'}</td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold
                                                        ${student.status === 'Present' ? 'bg-green-900/50 text-green-200' :
                                                            student.status === 'Absent' ? 'bg-red-900/50 text-red-200' : 'bg-gray-600 text-gray-300'}
                                                    `}>
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 bg-gray-700 border-gray-600 cursor-pointer"
                                                        checked={student.status === 'Present'}
                                                        onChange={(e) => handleCheckboxChange(student.studentId, e.target.checked)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-gray-700 flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Saving...' : 'Save Attendance'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default MarkAttendancePage;
