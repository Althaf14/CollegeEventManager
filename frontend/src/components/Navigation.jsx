import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
                <Link to="/dashboard" className="text-xl font-bold text-blue-400 hover:text-blue-300">
                    CampusEvent<span className="text-white">Manager</span>
                </Link>

                {/* Role Based Links */}
                <div className="hidden md:flex gap-4">
                    {user.role === 'student' && (
                        <>
                            <Link to="/events" className="text-gray-300 hover:text-white transition">Browse Events</Link>
                            <Link to="/my-registrations" className="text-gray-300 hover:text-white transition">My Registrations</Link>
                        </>
                    )}
                    {(user.role === 'faculty' || user.role === 'admin') && (
                        <>
                            <Link to="/events/create" className="text-gray-300 hover:text-white transition">Create Event</Link>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 hidden sm:inline">
                    {user.name} ({user.role})
                </span>
                <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded transition"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navigation;
