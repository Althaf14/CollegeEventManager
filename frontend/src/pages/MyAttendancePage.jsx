import { useEffect, useState } from 'react';
import api from '../api/axios';

const MyAttendancePage = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const { data } = await api.get('/my-attendance');
                setAttendance(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch attendance records');
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    const handleDownloadCertificate = async (eventId, eventTitle) => {
        try {
            const response = await api.get(`/events/${eventId}/certificate`, {
                responseType: 'blob', // Important for file download
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate-${eventTitle.replace(/ /g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error(err);
            alert('Failed to download certificate. Please try again.');
        }
    };

    if (loading) return <div className="text-white text-center mt-10">Loading attendance...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold text-blue-400 mb-8">My Attendance History</h1>

            {attendance.length === 0 ? (
                <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-400">
                    You have no marked attendance records yet.
                </div>
            ) : (
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-400">
                            <thead className="bg-gray-700 text-gray-200 uppercase text-sm font-bold">
                                <tr>
                                    <th className="py-3 px-6">Event</th>
                                    <th className="py-3 px-6">Date</th>
                                    <th className="py-3 px-6">Venue</th>
                                    <th className="py-3 px-6">Status</th>
                                    <th className="py-3 px-6">Certificate</th>
                                    <th className="py-3 px-6">Marked On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {attendance.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-750 transition duration-150">
                                        <td className="py-4 px-6 font-medium text-white">
                                            {record.event?.title || 'Unknown Event'}
                                        </td>
                                        <td className="py-4 px-6">
                                            {record.event?.eventDate
                                                ? new Date(record.event.eventDate).toLocaleDateString()
                                                : 'N/A'}
                                        </td>
                                        <td className="py-4 px-6">{record.event?.venue || 'N/A'}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${record.status === 'Present'
                                                ? 'bg-green-900 text-green-200'
                                                : 'bg-red-900 text-red-200'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {record.status === 'Present' ? (
                                                <button
                                                    onClick={() => handleDownloadCertificate(record.event._id, record.event.title)}
                                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded shadow transition"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Download
                                                </button>
                                            ) : (
                                                <span className="text-gray-600 italic text-xs">Not Eligible</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {new Date(record.markedAt).toLocaleString()}
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

export default MyAttendancePage;
