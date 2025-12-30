import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyDashboard from '../components/FacultyDashboard';
import AdminDashboard from '../components/AdminDashboard';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    if (!user) {
        return <div className="text-white text-center mt-20">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
                <button
                    onClick={logoutHandler}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Role: {user.role.toUpperCase()}</h2>
                    <p className="text-gray-400">
                        You have access to the {user.role} dashboard.
                    </p>
                </div>

                {/* Specific Role Content */}
                {user.role === 'admin' && (
                    <AdminDashboard />
                )}

                {user.role === 'organizer' && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg col-span-1 md:col-span-2">
                        <h2 className="text-xl font-bold mb-4">Organizer Panel</h2>
                        <button
                            onClick={() => navigate('/events/create')}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
                        >
                            Create New Event
                        </button>
                    </div>
                )}

                {user.role === 'faculty' && (
                    <FacultyDashboard />
                )}

                {user.role === 'student' && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg col-span-1 md:col-span-2">
                        <h2 className="text-xl font-bold mb-4">Student Actions</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/events')}
                                className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded flex-1"
                            >
                                Browse Events
                            </button>
                            <button
                                onClick={() => navigate('/my-registrations')}
                                className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded flex-1"
                            >
                                My Registrations
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
