import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [pendingEvents, setPendingEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchPendingEvents = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/events/pending');
            setPendingEvents(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch pending events');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingEvents();
    }, []);

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this event?`)) return;
        try {
            await api.put(`/events/${id}/${action}`);
            setPendingEvents(pendingEvents.filter(event => event._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${action} event`);
        }
    };

    return (
        <div className="col-span-1 md:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Pending Approvals</h2>

            {loading && <p className="text-gray-400">Loading...</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {!loading && pendingEvents.length === 0 ? (
                <p className="text-gray-400">No pending events to approve.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-400">
                        <thead className="bg-gray-700 text-gray-200">
                            <tr>
                                <th className="p-3">Title</th>
                                <th className="p-3">Organizer</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {pendingEvents.map((event) => (
                                <tr key={event._id}>
                                    <td className="p-3">{event.title}</td>
                                    <td className="p-3">{event.createdBy?.name || 'Unknown'}</td>
                                    <td className="p-3">{new Date(event.date).toLocaleDateString()}</td>
                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => handleAction(event._id, 'approve')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(event._id, 'reject')}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-8 border-t border-gray-700 pt-6">
                <button
                    onClick={() => navigate('/events/create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
                >
                    Create New Event (Admin)
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
