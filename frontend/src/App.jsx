import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Protected Route Components
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!token || !userInfo) {
    return <Navigate to="/" replace />;
  }
  
  if (userInfo.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />;
  }
  
  return children;
};

const UserRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!token || !userInfo) {
    return <Navigate to="/" replace />;
  }
  
  if (userInfo.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  // Simply render the children (pre-login pages) regardless of auth status
  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  const [appVisible, setAppVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && userInfo) {
      setIsAuthenticated(true);
      setUserRole(userInfo.role);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }

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
              {/* Public Routes */}
              <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
              <Route path="/atlas-reset" element={<PublicRoute><AtlasPasswordReset /></PublicRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><ErrorBoundary><AdminLayout><AdminDashboard /></AdminLayout></ErrorBoundary></AdminRoute>} />
              <Route path="/admin/dashboard" element={<AdminRoute><ErrorBoundary><AdminLayout><AdminDashboard /></AdminLayout></ErrorBoundary></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><ErrorBoundary><AdminLayout><UserManagement /></AdminLayout></ErrorBoundary></AdminRoute>} />
              <Route path="/admin/csv-upload" element={<AdminRoute><ErrorBoundary><AdminLayout><CSVUpload /></AdminLayout></ErrorBoundary></AdminRoute>} />
              <Route path="/admin/threat-visualization" element={<AdminRoute><ErrorBoundary><AdminLayout><ThreatVisualization /></AdminLayout></ErrorBoundary></AdminRoute>} />
              <Route path="/admin/detection-logs" element={<AdminRoute><ErrorBoundary><AdminLayout><DetectionLogs /></AdminLayout></ErrorBoundary></AdminRoute>} />
              <Route path="/admin/notifications" element={<AdminRoute><ErrorBoundary><AdminLayout><NotificationsPage /></AdminLayout></ErrorBoundary></AdminRoute>} />
              <Route path="/admin/reports" element={<AdminRoute><ErrorBoundary><AdminLayout><Reports /></AdminLayout></ErrorBoundary></AdminRoute>} />
              <Route path="/admin/subscription" element={<AdminRoute><ErrorBoundary><AdminLayout><SubscriptionManagement /></AdminLayout></ErrorBoundary></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><ErrorBoundary><AdminLayout><Settings /></AdminLayout></ErrorBoundary></AdminRoute>} />
              <Route path="/admin/profile" element={<AdminRoute><ErrorBoundary><AdminLayout><Profile /></AdminLayout></ErrorBoundary></AdminRoute>} />
              <Route path="/admin/phishing-chatbot" element={<AdminRoute><ErrorBoundary><AdminLayout><Chatbot /></AdminLayout></ErrorBoundary></AdminRoute>} />
              
              {/* User Routes */}
              <Route path="/user/dashboard" element={<UserRoute><UserLayout><UserDashboard /></UserLayout></UserRoute>} />
              <Route path="/user/csv-upload" element={<UserRoute><UserLayout><UserCSVUpload /></UserLayout></UserRoute>} />
              <Route path="/user/visualization" element={<UserRoute><UserLayout><UserVisualization /></UserLayout></UserRoute>} />
              <Route path="/user/detection-logs" element={<UserRoute><UserLayout><UserDetectionLogs /></UserLayout></UserRoute>} />
              <Route path="/user/profile" element={<UserRoute><UserLayout><UserProfile /></UserLayout></UserRoute>} />
              <Route path="/user/phishing-chatbot" element={<UserRoute><UserLayout><UserChatbot /></UserLayout></UserRoute>} />
              
              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        )}
      </div>
    </>
  );
}

export default App;
