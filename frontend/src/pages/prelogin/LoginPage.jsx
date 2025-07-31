import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import apiService from '../../services/api';
import './AuthPage.css';
import gsap from 'gsap';
import NetworkAnimation from '../../components/HeroNetworkAnimation';
import { ArrowBack } from '@mui/icons-material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power3.out' });
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await apiService.login({ email, password });
      apiService.setToken(response.access_token);
      
      // Store user information in localStorage
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      navigate('/admin/dashboard');
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
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
            <h3>Welcome Back</h3>
            <p>Enter your credentials to access your account.</p>
            {error && <div className="form-error">{error}</div>}
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <a href="/forgot-password" className="forgot-password-link">Forgot Password?</a>
            <Button variant="primary" type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="auth-switch-link">
              <span>New here? </span>
              <a href="/signup">Create an account</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 