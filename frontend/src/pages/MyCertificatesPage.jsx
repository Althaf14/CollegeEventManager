import { useEffect, useState } from 'react';
import api from '../api/axios';

const MyCertificatesPage = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                // Reuse attendance endpoint, filtering for 'Present'
                const { data } = await api.get('/my-attendance');
                const eligibleEvents = data.filter(record => record.status === 'Present');
                setCertificates(eligibleEvents);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch certificates');
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    const handleDownloadCertificate = async (eventId, eventTitle) => {
        try {
            const response = await api.get(`/events/${eventId}/certificate`, {
                responseType: 'blob',
            });

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

    if (loading) return <div className="text-white text-center mt-10">Loading certificates...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold text-blue-400 mb-8">My Certificates</h1>

            <p className="text-gray-400 mb-6">
                Congratulations on your achievements! Here are the certificates you have earned from participating in events.
            </p>

            {certificates.length === 0 ? (
                <div className="bg-gray-800 p-10 rounded-lg text-center border border-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-xl text-gray-300">No certificates earned yet.</p>
                    <p className="text-gray-500 mt-2">Attend events and ensure your attendance is marked to receive certificates.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((record) => (
                        <div key={record._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition duration-300">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-900 text-blue-200 text-xs font-bold px-2 py-1 rounded">
                                        CERTIFIED
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{record.event?.title}</h3>
                                <p className="text-gray-400 text-sm mb-1">
                                    <span className="font-semibold text-gray-300">Date:</span> {new Date(record.event?.eventDate).toLocaleDateString()}
                                </p>
                                <p className="text-gray-400 text-sm mb-6">
                                    <span className="font-semibold text-gray-300">Venue:</span> {record.event?.venue}
                                </p>

                                <button
                                    onClick={() => handleDownloadCertificate(record.event._id, record.event.title)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCertificatesPage;
