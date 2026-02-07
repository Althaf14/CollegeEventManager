import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
                <Link
                    to={user.role === 'admin' ? '/admin/dashboard' :
                        user.role === 'student' ? '/student/dashboard' :
                            (user.role === 'faculty' || user.role === 'coordinator') ? '/coordinator/dashboard' :
                                '/dashboard'}
                    className="text-xl font-bold text-blue-400 hover:text-blue-300"
                >
                    CampusEvent<span className="text-white">Manager</span>
                </Link>

                {/* Role Based Links */}
                <div className="hidden md:flex gap-4">
                    <Link to="/profile" className="text-gray-300 hover:text-white transition">Profile</Link>
                    {user.role === 'student' && (
                        <>
                            <Link to="/events" className="text-gray-300 hover:text-white transition">Browse Events</Link>
                            <Link to="/my-registrations" className="text-gray-300 hover:text-white transition">My Registrations</Link>
                            <Link to="/my-attendance" className="text-gray-300 hover:text-white transition">My Attendance</Link>
                        </>
                    )}
                    {(user.role === 'faculty' || user.role === 'admin') && (
                        <Link to="/events/create" className="text-gray-300 hover:text-white transition">Create Event</Link>
                    )}
                    {(user.role === 'admin' || user.role === 'faculty' || user.role === 'coordinator') && (
                        <>
                            <Link to="/attendance" className="text-gray-300 hover:text-white transition">Attendance</Link>
                            <Link to="/reports" className="text-gray-300 hover:text-white transition">Reports</Link>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Link to="/profile" className="text-sm text-gray-400 hidden sm:inline hover:text-white transition">
                    {user.name} ({user.role})
                </Link>
                <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded transition"
                >
                    Logout
                </button>
            </div>
        </nav >
    );
};

export default Navigation;
