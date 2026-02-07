import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const CreateEventPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        department: '',
        venue: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        maxParticipants: '',
        category: '', // Added category as per schema though not explicitly requested in this prompt, it's good practice
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await api.post('/events', formData);
            setSuccess(true);
            setLoading(false);
            // Redirect after success
            setTimeout(() => {
                navigate('/events');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center py-10">
            <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-blue-400 mb-6 border-b border-gray-700 pb-4">Create New Event</h1>

                {error && <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded mb-6">{error}</div>}
                {success && <div className="bg-green-500/20 border border-green-500 text-green-100 p-3 rounded mb-6">Event created successfully! Redirecting...</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 mb-2 font-medium">Event Title *</label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="e.g. Annual Tech Symposium"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-2 font-medium">Description</label>
                        <textarea
                            name="description"
                            rows="4"
                            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Event details..."
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 mb-2 font-medium">Department</label>
                            <input
                                type="text"
                                name="department"
                                className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="e.g. Computer Science"
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 font-medium">Venue</label>
                            <input
                                type="text"
                                name="venue"
                                className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="e.g. Auditorium A"
                                value={formData.venue}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-gray-400 mb-2 font-medium">Date *</label>
                            <input
                                type="date"
                                name="eventDate"
                                required
                                className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.eventDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 font-medium">Start Time</label>
                            <input
                                type="time"
                                name="startTime"
                                className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.startTime}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 font-medium">End Time</label>
                            <input
                                type="time"
                                name="endTime"
                                className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.endTime}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 mb-2 font-medium">Max Participants</label>
                            <input
                                type="number"
                                name="maxParticipants"
                                className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="e.g. 100"
                                value={formData.maxParticipants}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 font-medium">Category</label>
                            <input
                                type="text"
                                name="category"
                                className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="e.g. Workshop"
                                value={formData.category}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || success}
                            className={`w-full font-bold py-3 rounded transition duration-200 ${loading || success ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/30'}`}
                        >
                            {loading ? 'Creating...' : success ? 'Created!' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventPage;
