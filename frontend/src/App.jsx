import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/prelogin/HomePage';
import SignupPage from './pages/prelogin/SignupPage';
import LoginPage from './pages/prelogin/LoginPage';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CSVUpload from './pages/admin/CSVUpload';
import ThreatVisualization from './pages/admin/ThreatVisualization';
import DetectionLogs from './pages/admin/DetectionLogs';
import NotificationsPage from './pages/admin/Notifications';
import Reports from './pages/admin/Reports';
import SubscriptionManagement from './pages/admin/SubscriptionManagement';
import Settings from './pages/admin/Settings';
import Profile from './pages/admin/Profile';
import Preloader from './components/Preloader';

function App() {
  const [loading, setLoading] = useState(true);
  const [appVisible, setAppVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setAppVisible(true), 100);
    }
  }, [loading]);

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <div className={`app-container ${appVisible ? 'visible' : ''}`}>
        {!loading && (
      <Router>
        <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
              <Route path="/admin/csv-upload" element={<AdminLayout><CSVUpload /></AdminLayout>} />
              <Route path="/admin/threat-visualization" element={<AdminLayout><ThreatVisualization /></AdminLayout>} />
              <Route path="/admin/detection-logs" element={<AdminLayout><DetectionLogs /></AdminLayout>} />
              <Route path="/admin/notifications" element={<AdminLayout><NotificationsPage /></AdminLayout>} />
              <Route path="/admin/reports" element={<AdminLayout><Reports /></AdminLayout>} />
              <Route path="/admin/subscription" element={<AdminLayout><SubscriptionManagement /></AdminLayout>} />
              <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
              <Route path="/admin/profile" element={<AdminLayout><Profile /></AdminLayout>} />
        </Routes>
      </Router>
        )}
      </div>
    </>
  );
}

export default App;
