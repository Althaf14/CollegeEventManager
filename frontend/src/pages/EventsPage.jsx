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
            await api.post(`/events/${eventId}/register`);
            alert('Registration Successful!');
            // Update local state to reflect registration
            setMyRegistrations([...myRegistrations, eventId]);
            // Optimistically update event count (optional, but good UX)
            setEvents(events.map(ev =>
                ev._id === eventId
                    ? { ...ev, registeredCount: (ev.registeredCount || 0) + 1 }
                    : ev
            ));
            navigate('/my-registrations');
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleUnregister = async (eventId) => {
        if (!window.confirm("Are you sure you want to unregister from this event?")) return;

        try {
            await api.delete(`/events/${eventId}/unregister`);
            alert('Unregistered Successfully');
            setMyRegistrations(myRegistrations.filter(id => id !== eventId));
            setEvents(events.map(ev =>
                ev._id === eventId
                    ? { ...ev, registeredCount: Math.max((ev.registeredCount || 0) - 1, 0) }
                    : ev
            ));
        } catch (err) {
            alert(err.response?.data?.message || 'Unregistration failed');
        }
    };

    const getStatusBadge = (status) => {
        let colorClass = 'bg-gray-600 text-gray-200';
        switch (status) {
            case 'Upcoming':
                colorClass = 'bg-green-900 text-green-200';
                break;
            case 'Ongoing':
                colorClass = 'bg-blue-900 text-blue-200';
                break;
            case 'Completed':
                colorClass = 'bg-gray-700 text-gray-400';
                break;
            default:
                break;
        }
        return <span className={`py-1 px-2 rounded text-xs font-semibold ${colorClass}`}>{status}</span>;
    };

    if (loading) return <div className="text-white text-center mt-10">Loading events...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-blue-400">Events</h1>
                    <p className="text-gray-400 mt-1">Discover and register for upcoming college events.</p>
                </div>
                {user && (
                    <div className="flex items-center gap-4">
                        {(user.role === 'admin' || user.role === 'coordinator' || user.role === 'faculty') && (
                            <button
                                onClick={() => navigate('/events/create')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center"
                            >
                                <span className="mr-2">+</span> Create Event
                            </button>
                        )}
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
                <div className="text-center py-20 bg-gray-800 rounded-lg">
                    <p className="text-gray-400 text-xl">No events found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => {
                        const isRegistered = myRegistrations.includes(event._id);

                        return (
                            <div key={event._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:bg-gray-750 transition duration-200 flex flex-col h-full border border-gray-700">
                                <div className="p-6 flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-xl font-bold text-white leading-tight">{event.title}</h2>
                                        {getStatusBadge(event.status)}
                                    </div>

                                    <div className="mb-4 space-y-2 text-sm text-gray-400">
                                        {event.department && (
                                            <div className="inline-block bg-blue-900/30 text-blue-300 py-0.5 px-2 rounded text-xs mb-2">
                                                {event.department}
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <span className="mr-2">📅</span>
                                            <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                                            <span className="mx-2">•</span>
                                            <span>{event.startTime}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mr-2">📍</span>
                                            <span>{event.venue}</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-300 mb-4 line-clamp-3 text-sm">{event.description}</p>
                                </div>

                                <div className="p-6 pt-0 mt-auto">
                                    {user?.role === 'student' ? (
                                        (() => {
                                            const isFull = event.maxParticipants && event.registeredCount >= event.maxParticipants;
                                            const isUpcoming = event.status === 'Upcoming';

                                            if (!isUpcoming && !isRegistered) {
                                                return <button disabled className="w-full bg-gray-700 text-gray-400 font-bold py-2 px-4 rounded cursor-not-allowed">
                                                    {event.status}
                                                </button>;
                                            }

                                            return (
                                                <div className="flex flex-col gap-2">
                                                    {isRegistered ? (
                                                        <button
                                                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 shadow-lg shadow-red-900/20"
                                                            onClick={() => handleUnregister(event._id)}
                                                        >
                                                            Unregister
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className={`w-full font-bold py-2 px-4 rounded transition duration-200 flex justify-center items-center ${isFull
                                                                    ? 'bg-red-900/50 text-red-200 cursor-not-allowed border border-red-800'
                                                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
                                                                }`}
                                                            onClick={() => !isFull && handleRegister(event._id)}
                                                            disabled={isFull}
                                                        >
                                                            {isFull ? 'Event Full' : 'Register Now'}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <button
                                            // onClick={() => navigate(`/events/${event._id}`)} 
                                            // Details page not fully requested yet, but keeping placeholder
                                            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                                        >
                                            {event.registeredCount} / {event.maxParticipants || '∞'} Participants
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EventsPage;
