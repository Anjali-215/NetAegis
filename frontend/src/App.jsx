import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/prelogin/HomePage';
import SignupPage from './pages/prelogin/SignupPage';
import LoginPage from './pages/prelogin/LoginPage';
import ForgotPassword from './pages/prelogin/ForgotPassword';
import ResetPassword from './pages/prelogin/ResetPassword';
import AtlasPasswordReset from './pages/prelogin/AtlasPasswordReset';
import AdminLayout from './components/layout/AdminLayout';
import ErrorBoundary from './components/layout/ErrorBoundary';
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
import { Visualization as UserVisualization, UserDashboard, CSVUpload as UserCSVUpload } from './pages/user';
import UserLayout from './components/layout/UserLayout';
import Chatbot from './pages/admin/PhishingChatbot';
import UserChatbot from './pages/user/PhishingChatbot';
import UserProfile from './pages/user/UserProfile';
import UserDetectionLogs from './pages/user/DetectionLogs';

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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/atlas-reset" element={<AtlasPasswordReset />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ErrorBoundary><AdminLayout><AdminDashboard /></AdminLayout></ErrorBoundary>} />
              <Route path="/admin/dashboard" element={<ErrorBoundary><AdminLayout><AdminDashboard /></AdminLayout></ErrorBoundary>} />
              <Route path="/admin/users" element={<ErrorBoundary><AdminLayout><UserManagement /></AdminLayout></ErrorBoundary>} />
              <Route path="/admin/csv-upload" element={<ErrorBoundary><AdminLayout><CSVUpload /></AdminLayout></ErrorBoundary>} />
              <Route path="/admin/threat-visualization" element={<ErrorBoundary><AdminLayout><ThreatVisualization /></AdminLayout></ErrorBoundary>} />
              <Route path="/admin/detection-logs" element={<ErrorBoundary><AdminLayout><DetectionLogs /></AdminLayout></ErrorBoundary>} />
              <Route path="/admin/notifications" element={<ErrorBoundary><AdminLayout><NotificationsPage /></AdminLayout></ErrorBoundary>} />
              <Route path="/admin/reports" element={<ErrorBoundary><AdminLayout><Reports /></AdminLayout></ErrorBoundary>} />
              <Route path="/admin/subscription" element={<ErrorBoundary><AdminLayout><SubscriptionManagement /></AdminLayout></ErrorBoundary>} />
              <Route path="/admin/settings" element={<ErrorBoundary><AdminLayout><Settings /></AdminLayout></ErrorBoundary>} />
              <Route path="/admin/profile" element={<ErrorBoundary><AdminLayout><Profile /></AdminLayout></ErrorBoundary>} />
              <Route path="/admin/phishing-chatbot" element={<ErrorBoundary><AdminLayout><Chatbot /></AdminLayout></ErrorBoundary>} />
              
              {/* User Routes */}
              <Route path="/user/dashboard" element={<UserLayout><UserDashboard /></UserLayout>} />
              <Route path="/user/csv-upload" element={<UserLayout><UserCSVUpload /></UserLayout>} />
              <Route path="/user/visualization" element={<UserLayout><UserVisualization /></UserLayout>} />
              <Route path="/user/detection-logs" element={<UserLayout><UserDetectionLogs /></UserLayout>} />
              <Route path="/user/profile" element={<UserLayout><UserProfile /></UserLayout>} />
              <Route path="/user/phishing-chatbot" element={<UserLayout><UserChatbot /></UserLayout>} />
            </Routes>
          </Router>
        )}
      </div>
    </>
  );
}

export default App;
