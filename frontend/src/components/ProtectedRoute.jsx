import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="text-white text-center mt-20">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard if role doesn't match
        if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
        if (user.role === 'faculty') return <Navigate to="/dashboard/faculty" replace />;
        return <Navigate to="/events" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
