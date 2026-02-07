import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const StudentDashboard = () => {
    const [stats, setStats] = useState({
        totalRegistrations: 0,
        upcomingEvents: [],
        attendanceSummary: { present: 0, absent: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const { data } = await api.get('/dashboard/student');
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch student dashboard", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, []);

    if (loading) return <div className="text-gray-400 text-center py-6">Loading your dashboard...</div>;
    if (error) return <div className="text-red-500 text-center py-6">{error}</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-2">My Dashboard</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-green-500">
                    <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Total Registrations</h3>
                    <p className="text-4xl font-bold text-white">{stats.totalRegistrations}</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
                    <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Attendance Summary</h3>
                    <div className="flex gap-6 mt-2">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-green-400">{stats.attendanceSummary.present}</span>
                            <span className="text-xs text-gray-500 uppercase">Present</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-red-400">{stats.attendanceSummary.absent}</span>
                            <span className="text-xs text-gray-500 uppercase">Absent</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700 bg-gray-800">
                    <h3 className="text-lg font-bold text-gray-200">Registered Upcoming Events</h3>
                </div>

                {stats.upcomingEvents.length === 0 ? (
                    <div className="p-8 text-center bg-gray-800">
                        <p className="text-gray-400 mb-4">You have no upcoming events.</p>
                        <button
                            onClick={() => navigate('/events')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition"
                        >
                            Browse Events
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-400">
                            <thead className="bg-gray-750 text-gray-200 uppercase text-xs font-bold">
                                <tr>
                                    <th className="p-4">Event</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Venue</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {stats.upcomingEvents.map((event) => (
                                    <tr key={event._id} className="hover:bg-gray-700 transition">
                                        <td className="p-4 font-medium text-white">{event.title}</td>
                                        <td className="p-4">{new Date(event.eventDate).toLocaleDateString()}</td>
                                        <td className="p-4">{event.venue}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => navigate(`/events/${event._id}`)}
                                                className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-gray-200 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => navigate('/events')}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-6 rounded shadow transition"
                    >
                        Browse All Events
                    </button>
                    <button
                        onClick={() => navigate('/my-registrations')}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-6 rounded shadow transition"
                    >
                        My Registrations
                    </button>
                    <button
                        onClick={() => navigate('/my-attendance')}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-6 rounded shadow transition"
                    >
                        View Full Attendance
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
