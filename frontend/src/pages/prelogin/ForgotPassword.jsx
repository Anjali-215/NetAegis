import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import apiService from '../../services/api';
import './AuthPage.css';
import gsap from 'gsap';
import NetworkAnimation from '../../components/HeroNetworkAnimation';
import { ArrowBack } from '@mui/icons-material';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power3.out' });
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await apiService.forgotPassword(email);
      setSuccess('If an account with that email exists, a password reset link has been sent to your email.');
    } catch (error) {
      setError(error.message || 'Failed to send reset email. Please try again.');
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
            <h3>Forgot Password</h3>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button variant="primary" type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
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