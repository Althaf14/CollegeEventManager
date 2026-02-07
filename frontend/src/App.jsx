import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import EventsPage from './pages/EventsPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import MyAttendancePage from './pages/MyAttendancePage';
import CreateEventPage from './pages/CreateEventPage';
import EventRegistrationsPage from './pages/EventRegistrationsPage';
import MarkAttendancePage from './pages/MarkAttendancePage';
import ReportPage from './pages/ReportPage';
import ReportsDashboard from './pages/ReportsDashboard';
import ProfilePage from './pages/ProfilePage';
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
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/coordinator/dashboard" element={<Dashboard />} />
          <Route path="/student/dashboard" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} /> {/* Generic fallback */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/my-registrations" element={<MyRegistrationsPage />} />
          <Route path="/my-attendance" element={<MyAttendancePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/report/:registrationId" element={<ReportPage />} />
        </Route>

        {/* Faculty & Admin Only */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'faculty', 'coordinator']} />}>
          <Route path="/events/create" element={<CreateEventPage />} />
          <Route path="/dashboard/event/:eventId/registrations" element={<EventRegistrationsPage />} />
          <Route path="/attendance" element={<MarkAttendancePage />} />
          <Route path="/reports" element={<ReportsDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}

export default App;
