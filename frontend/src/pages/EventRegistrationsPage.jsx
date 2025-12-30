import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const EventRegistrationsPage = () => {
    const { eventId } = useParams();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRegistrations = async () => {
        try {
            const { data } = await api.get(`/registrations/event/${eventId}`);
            setRegistrations(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch registrations');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, [eventId]);

    const toggleAttendance = async (id, currentStatus) => {
        try {
            await api.put(`/registrations/${id}/attendance`, { attendance: !currentStatus });
            // Optimistic update or refresh
            setRegistrations(registrations.map(reg =>
                reg._id === id ? { ...reg, attendance: !currentStatus } : reg
            ));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update attendance');
        }
    };

    if (loading) return <div className="text-white text-center mt-10">Loading participants...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold text-blue-400 mb-8">Event Participants</h1>

            {registrations.length === 0 ? (
                <p className="text-gray-400">No registrations found for this event.</p>
            ) : (
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-400">
                            <thead className="bg-gray-700 text-gray-200 uppercase text-sm font-bold">
                                <tr>
                                    <th className="py-3 px-6">Name</th>
                                    <th className="py-3 px-6">Email</th>
                                    <th className="py-3 px-6">Department</th>
                                    <th className="py-3 px-6">Attendance</th>
                                    <th className="py-3 px-6">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {registrations.map((reg) => (
                                    <tr key={reg._id} className="hover:bg-gray-750">
                                        <td className="py-4 px-6 font-medium text-white">{reg.user?.name || 'Unknown'}</td>
                                        <td className="py-4 px-6">{reg.user?.email || 'N/A'}</td>
                                        <td className="py-4 px-6">{reg.user?.department || 'N/A'}</td>
                                        <td className="py-4 px-6">
                                            {reg.attendance ? (
                                                <span className="text-green-400 font-bold">Present</span>
                                            ) : (
                                                <span className="text-red-400">Absent</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => toggleAttendance(reg._id, reg.attendance)}
                                                className={`py-1 px-3 rounded text-xs font-bold ${reg.attendance
                                                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                                    }`}
                                            >
                                                {reg.attendance ? 'Mark Absent' : 'Mark Present'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventRegistrationsPage;
