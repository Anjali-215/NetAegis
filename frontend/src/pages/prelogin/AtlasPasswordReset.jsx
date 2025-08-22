import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import atlasService from '../../services/atlasService';
import './AuthPage.css';
import gsap from 'gsap';
import NetworkAnimation from '../../components/HeroNetworkAnimation';
import { ArrowBack } from '@mui/icons-material';

export default function AtlasPasswordReset() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const pageRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power3.out' });
    
    // Validate token and email
    validateResetLink();
  }, [token, email]);

  const validateResetLink = async () => {
    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset.');
      setValidating(false);
      return;
    }

    try {
      const validation = await atlasService.validateToken(token, email);
      if (!validation.valid) {
        setError(validation.message);
      }
    } catch (error) {
      setError('Failed to validate reset link. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!token || !email) {
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
      // Send plain password to backend - backend will handle hashing
      const result = await atlasService.updatePasswordInAtlas(email, password, token);
      
      if (result.success) {
        setSuccess('Password has been successfully reset! You can now log in with your new password.');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.message || 'Failed to update password. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An error occurred while resetting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-page login-bg" ref={pageRef} style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <NetworkAnimation />
        </div>
        <div className="auth-container">
          <div className="auth-branding">
            <h2>NetAegis</h2>
            <p>Your shield against digital threats.</p>
          </div>
          <div className="auth-form-container">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '24px', marginBottom: '20px' }}>⏳</div>
              <h3>Validating Reset Link</h3>
              <p>Please wait while we validate your password reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <p>Enter your new password below. This will update your password directly in MongoDB Atlas.</p>
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}
            <InputField
              label="New Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={!token || !email}
            />
            <InputField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={!token || !email}
            />
            <Button variant="primary" type="submit" style={{ width: '100%' }} disabled={loading || !token || !email}>
              {loading ? 'Updating Password in Atlas...' : 'Update Password'}
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