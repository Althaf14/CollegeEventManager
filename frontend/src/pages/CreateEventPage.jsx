import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const CreateEventPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        department: '',
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
            // Optional: Redirect after success
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center">
            <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-blue-400 mb-6">Create New Event</h1>

                {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-500 text-white p-3 rounded mb-4">Event created successfully! Pending approval.</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Event Title</label>
                        <input type="text" name="title" required className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.title} onChange={handleChange} />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Description</label>
                        <textarea name="description" required rows="4" className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.description} onChange={handleChange}></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-400 mb-2">Date</label>
                            <input type="date" name="date" required className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.date} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Time</label>
                            <input type="time" name="time" required className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.time} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-gray-400 mb-2">Venue</label>
                            <input type="text" name="venue" required className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.venue} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Department (Optional)</label>
                            <input type="text" name="department" className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.department} onChange={handleChange} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition duration-200">
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateEventPage;
