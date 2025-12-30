import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import EventsPage from './pages/EventsPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import CreateEventPage from './pages/CreateEventPage';
import EventRegistrationsPage from './pages/EventRegistrationsPage';
import ReportPage from './pages/ReportPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

function App() {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navigation />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/admin" element={<Dashboard />} />
          <Route path="/dashboard/faculty" element={<Dashboard />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/my-registrations" element={<MyRegistrationsPage />} />
          <Route path="/report/:registrationId" element={<ReportPage />} />
        </Route>

        {/* Faculty & Admin Only */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'faculty']} />}>
          <Route path="/events/create" element={<CreateEventPage />} />
          <Route path="/dashboard/event/:eventId/registrations" element={<EventRegistrationsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
