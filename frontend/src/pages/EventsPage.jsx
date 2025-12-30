import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Fetch Events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/events');
                setEvents(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch events');
            }
        };

        const fetchMyRegistrations = async () => {
            if (user && user.role === 'student') {
                try {
                    const { data } = await api.get('/registrations/my');
                    setMyRegistrations(data.map(reg => reg.event._id));
                } catch (err) {
                    console.error("Failed to fetch registrations", err);
                }
            }
        };

        Promise.all([fetchEvents(), fetchMyRegistrations()]).then(() => setLoading(false));
    }, [user]);

    const handleRegister = async (eventId) => {
        if (!window.confirm("Confirm registration for this event?")) return;

        try {
            await api.post(`/registrations/${eventId}`);
            alert('Registration Successful!');
            // Update local state to reflect registration
            setMyRegistrations([...myRegistrations, eventId]);
            navigate('/my-registrations');
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed');
        }
    };

    if (loading) return <div className="text-white text-center mt-10">Loading events...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-blue-400">Upcoming Events</h1>
                {user && (
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">Welcome, {user.name}</span>
                        {user.role === 'student' && (
                            <button
                                onClick={() => navigate('/my-registrations')}
                                className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded"
                            >
                                My Registrations
                            </button>
                        )}
                    </div>
                )}
            </header>

            {events.length === 0 ? (
                <p className="text-center text-gray-400">No upcoming events found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => {
                        const isRegistered = myRegistrations.includes(event._id);

                        return (
                            <div key={event._id} className="bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-gray-700 transition duration-200 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-2">{event.title}</h2>
                                    <p className="text-sm text-gray-400 mb-4">{event.department && <span className="bg-blue-900 text-blue-200 py-1 px-2 rounded text-xs mr-2">{event.department}</span>} <span className="text-gray-500">{new Date(event.date).toLocaleDateString()} at {event.time}</span></p>

                                    <p className="text-gray-300 mb-4 line-clamp-3">{event.description}</p>

                                    <div className="flex items-center text-sm text-gray-400 mb-6">
                                        <span className="mr-2">📍 {event.venue}</span>
                                    </div>
                                </div>

                                {user?.role === 'student' && (
                                    <button
                                        className={`w-full font-bold py-2 px-4 rounded transition duration-200 ${isRegistered
                                                ? 'bg-green-700 text-white cursor-not-allowed opacity-75'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                        onClick={() => !isRegistered && handleRegister(event._id)}
                                        disabled={isRegistered}
                                    >
                                        {isRegistered ? 'Registered' : 'Register Now'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EventsPage;
