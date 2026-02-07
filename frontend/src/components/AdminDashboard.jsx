import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalRegistrations: 0,
        totalStudents: 0,
        recentEvents: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/dashboard/admin');
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch admin dashboard data", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="text-white text-center py-10">Loading Dashboard...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Admin Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase">Total Events</p>
                            <p className="text-3xl font-bold text-white mt-2">{stats.totalEvents}</p>
                        </div>
                        <div className="bg-blue-900/30 p-3 rounded-full">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase">Total Registrations</p>
                            <p className="text-3xl font-bold text-white mt-2">{stats.totalRegistrations}</p>
                        </div>
                        <div className="bg-green-900/30 p-3 rounded-full">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase">Total Students</p>
                            <p className="text-3xl font-bold text-white mt-2">{stats.totalStudents}</p>
                        </div>
                        <div className="bg-purple-900/30 p-3 rounded-full">
                            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 mt-6">
                <button
                    onClick={() => navigate('/events/create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow-lg transition duration-200"
                >
                    + Create New Event
                </button>
                <button
                    onClick={() => navigate('/attendance')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded shadow-lg transition duration-200"
                >
                    Mark Attendance
                </button>
                <button
                    onClick={() => navigate('/events')}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded shadow-lg transition duration-200"
                >
                    Manage Events
                </button>
            </div>

            {/* Recent Events Table */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-700 bg-gray-800">
                    <h3 className="text-lg font-bold text-gray-200">Recent Events</h3>
                </div>
                {stats.recentEvents.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">No events found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-gray-750 text-gray-200 uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-3">Event Title</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Venue</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-center">Registrations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {stats.recentEvents.map((event) => (
                                    <tr key={event._id} className="hover:bg-gray-700 transition duration-150">
                                        <td className="px-6 py-4 font-medium text-white">{event.title}</td>
                                        <td className="px-6 py-4">{new Date(event.eventDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{event.venue}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold
                                                ${event.status === 'Upcoming' ? 'bg-blue-900 text-blue-200' :
                                                    event.status === 'Ongoing' ? 'bg-yellow-900 text-yellow-200' : 'bg-gray-600 text-gray-200'}
                                            `}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-white">
                                            {event.registeredCount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
