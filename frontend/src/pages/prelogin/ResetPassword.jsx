import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import apiService from '../../services/api';
import './AuthPage.css';
import gsap from 'gsap';
import NetworkAnimation from '../../components/HeroNetworkAnimation';
import { ArrowBack } from '@mui/icons-material';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const pageRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power3.out' });
    
    // Check if token is present
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    if (!password || !confirmPassword) {
      setError('Please enter both password fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long and contain uppercase, number, and special character.');
      return;
    }
    
    // Validate password complexity (uppercase, number, special character)
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasUppercase || !hasNumber || !hasSpecialChar) {
      setError('Password must be at least 6 characters long and contain uppercase, number, and special character.');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await apiService.resetPassword(token, password);
      setSuccess('Password has been successfully reset! You can now log in with your new password.');
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-bg" ref={pageRef} style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Network animation as background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <NetworkAnimation />
      </div>
      {/* Back to Home Button */}
      <Button
        variant="outlined"
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          padding: '8px 16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <ArrowBack style={{ fontSize: '18px' }} />
        Back to Home
      </Button>
      <div className="auth-container">
        <div className="auth-branding">
          <h2>NetAegis</h2>
          <p>Your shield against digital threats.</p>
        </div>
        <div className="auth-form-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h3>Reset Password</h3>
            <p>Enter your new password below.</p>
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}
            <InputField
              label="New Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={!token}
            />
            <InputField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={!token}
            />
            <Button variant="primary" type="submit" style={{ width: '100%' }} disabled={loading || !token}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
            <div className="auth-switch-link">
              <span>Remember your password? </span>
              <a onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Back to Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 