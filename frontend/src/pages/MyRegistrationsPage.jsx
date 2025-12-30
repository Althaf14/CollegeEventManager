import { useEffect, useState } from 'react';
import api from '../api/axios';

const MyRegistrationsPage = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const { data } = await api.get('/registrations/my');
                setRegistrations(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch registrations');
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, []);

    if (loading) return <div className="text-white text-center mt-10">Loading registrations...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold text-blue-400 mb-8">My Registrations</h1>

            {registrations.length === 0 ? (
                <p className="text-gray-400">You have not registered for any events yet.</p>
            ) : (
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-400">
                            <thead className="bg-gray-700 text-gray-200 uppercase text-sm font-bold">
                                <tr>
                                    <th className="py-3 px-6">Event Title</th>
                                    <th className="py-3 px-6">Date & Time</th>
                                    <th className="py-3 px-6">Venue</th>
                                    <th className="py-3 px-6">Status</th>
                                    <th className="py-3 px-6">Attendance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {registrations.map((reg) => (
                                    <tr key={reg._id} className="hover:bg-gray-750">
                                        <td className="py-4 px-6 font-medium text-white">{reg.event?.title || 'Unknown Event'}</td>
                                        <td className="py-4 px-6">
                                            {reg.event?.date ? new Date(reg.event.date).toLocaleDateString() : 'N/A'} - {reg.event?.time || ''}
                                        </td>
                                        <td className="py-4 px-6">{reg.event?.venue || 'N/A'}</td>
                                        <td className="py-4 px-6 capitalize">
                                            <span className={`px-2 py-1 rounded text-xs ${reg.status === 'registered' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                                                {reg.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 flex items-center gap-4">
                                            {reg.attendance ? (
                                                <>
                                                    <span className="text-green-400 font-bold">Present</span>
                                                    <button
                                                        onClick={() => window.open(`/report/${reg._id}`, '_blank')}
                                                        className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold py-1 px-2 rounded"
                                                    >
                                                        View Certificate
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-gray-500">Not Marked</span>
                                            )}
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

export default MyRegistrationsPage;
