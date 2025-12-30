import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ReportPage = () => {
    const { registrationId } = useParams();
    const [certificateData, setCertificateData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const { data } = await api.get(`/registrations/${registrationId}/certificate`);
                setCertificateData(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to generate certificate');
                setLoading(false);
            }
        };

        fetchCertificate();
    }, [registrationId]);

    if (loading) return <div className="text-white text-center mt-20">Generating certificate...</div>;

    if (error) return (
        <div className="text-center mt-20 text-white">
            <h2 className="text-2xl text-red-500 mb-4">{error}</h2>
            <button onClick={() => navigate('/my-registrations')} className="bg-blue-600 px-4 py-2 rounded">Back to Registrations</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center py-10">
            <div className="flex gap-4 mb-6 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
                >
                    Print / Save as PDF
                </button>
                <button
                    onClick={() => navigate('/my-registrations')}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
                >
                    Back
                </button>
            </div>

            <div className="bg-white text-black p-10 md:p-20 shadow-2xl w-full max-w-4xl border-8 border-double border-gray-800 text-center relative print:shadow-none print:w-full">
                <div className="absolute top-0 left-0 w-full h-full border-2 border-yellow-600 m-2 pointer-events-none"></div>

                <h1 className="text-5xl font-serif font-bold text-gray-800 mb-4 uppercase tracking-widest">Certificate</h1>
                <h2 className="text-2xl font-serif text-gray-600 mb-8 uppercase tracking-widest">of Participation</h2>

                <p className="text-lg text-gray-500 mb-2">This is to certify that</p>
                <h3 className="text-4xl font-cursive font-bold text-blue-800 mb-6 underline decoration-yellow-500 decoration-2 underline-offset-8">
                    {certificateData.studentName}
                </h3>

                <p className="text-lg text-gray-500 mb-4">has successfully participated in the event</p>
                <h4 className="text-3xl font-bold text-gray-800 mb-6">
                    "{certificateData.eventName}"
                </h4>

                <p className="text-gray-600 text-lg mb-12">
                    Held on <span className="font-bold">{new Date(certificateData.date).toLocaleDateString()}</span> at <span className="font-bold">{certificateData.venue}</span>
                </p>

                <div className="flex justify-between items-end mt-20 px-10">
                    <div className="text-center">
                        <div className="border-t-2 border-gray-400 w-48 mx-auto mb-2"></div>
                        <p className="font-bold text-gray-600">Event Coordinator</p>
                    </div>
                    <div className="text-center">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Seal_of_the_Department_of_Homeland_Security.svg/1200px-Seal_of_the_Department_of_Homeland_Security.svg.png" alt="Seal" className="h-20 opacity-20 mx-auto" />
                    </div>
                    <div className="text-center">
                        <div className="border-t-2 border-gray-400 w-48 mx-auto mb-2"></div>
                        <p className="font-bold text-gray-600">Principal / HOD</p>
                    </div>
                </div>

                <div className="mt-10 text-xs text-gray-400">
                    Certificate ID: {certificateData.id} | Issued Date: {new Date(certificateData.issuedDate).toLocaleDateString()}
                </div>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:hidden {
                        display: none;
                    }
                    .bg-white, .bg-white * {
                        visibility: visible;
                    }
                    .bg-white {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                        border: 4px double #000;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReportPage;
