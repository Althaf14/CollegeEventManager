import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CoordinatorDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCoordinatorData = async () => {
            try {
                const { data } = await api.get('/dashboard/coordinator');
                setEvents(data.myEvents || []);
            } catch (err) {
                console.error("Failed to fetch coordinator dashboard", err);
                setError("Failed to load your events");
            } finally {
                setLoading(false);
            }
        };

        fetchCoordinatorData();
    }, []);

    if (loading) return <div className="text-gray-400">Loading your events...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="col-span-1 md:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-purple-400">Coordinator Dashboard</h2>

            <div className="mb-6 flex gap-4">
                <button
                    onClick={() => navigate('/events/create')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition duration-200"
                >
                    + Create New Event
                </button>
                <button
                    onClick={() => navigate('/attendance')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded shadow transition duration-200"
                >
                    Mark Attendance
                </button>
            </div>

            <h3 className="text-lg font-bold mb-4 text-gray-200">My Created Events</h3>

            {events.length === 0 ? (
                <div className="p-6 bg-gray-750 rounded text-center text-gray-400 border border-gray-700">
                    You haven't created any events yet.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-left text-gray-400">
                        <thead className="bg-gray-900 text-gray-200 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4">Event Title</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Registrations</th>
                                <th className="p-4 text-center">Attendance</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800">
                            {events.map((event) => (
                                <tr key={event._id} className="hover:bg-gray-750 transition duration-150">
                                    <td className="p-4 font-medium text-white">{event.title}</td>
                                    <td className="p-4">{new Date(event.eventDate).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold capitalize
                                            ${event.status === 'Upcoming' ? 'bg-blue-900 text-blue-200' :
                                                event.status === 'Ongoing' ? 'bg-yellow-900 text-yellow-200' :
                                                    'bg-green-900 text-green-200'}
                                        `}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center font-bold text-white">{event.registeredCount}</td>
                                    <td className="p-4 text-center">
                                        {event.attendanceMarked ? (
                                            <span className="bg-green-900/50 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-800">
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="bg-yellow-900/50 text-yellow-400 text-xs font-bold px-2 py-1 rounded border border-yellow-800">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 flex gap-3 text-sm">
                                        <button
                                            onClick={() => navigate(`/dashboard/event/${event._id}/registrations`)}
                                            className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                                        >
                                            View List
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CoordinatorDashboard;
