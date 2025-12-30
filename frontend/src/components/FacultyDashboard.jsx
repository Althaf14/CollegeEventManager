import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const FacultyDashboard = () => {
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                const { data } = await api.get('/events/my');
                setMyEvents(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch events');
                setLoading(false);
            }
        };

        fetchMyEvents();
    }, []);

    return (
        <div className="col-span-1 md:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-purple-400">Faculty Dashboard</h2>

            <div className="mb-6">
                <button
                    onClick={() => navigate('/events/create')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
                >
                    + Create New Event
                </button>
            </div>

            <h3 className="text-lg font-bold mb-3 text-gray-200">My Events</h3>

            {loading && <p className="text-gray-400">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && myEvents.length === 0 ? (
                <p className="text-gray-400">You haven't created any events yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-400">
                        <thead className="bg-gray-700 text-gray-200">
                            <tr>
                                <th className="p-3">Title</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {myEvents.map((event) => (
                                <tr key={event._id}>
                                    <td className="p-3 font-medium">{event.title}</td>
                                    <td className="p-3">{new Date(event.date).toLocaleDateString()}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs capitalize ${event.status === 'approved' ? 'bg-green-900 text-green-200' :
                                                event.status === 'rejected' ? 'bg-red-900 text-red-200' :
                                                    'bg-yellow-900 text-yellow-200'
                                            }`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => navigate(`/dashboard/event/${event._id}/registrations`)}
                                            className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
                                        >
                                            View Registrations
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

export default FacultyDashboard;
