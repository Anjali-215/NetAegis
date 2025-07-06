import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import apiService from '../../services/api';
import './AuthPage.css';
import gsap from 'gsap';
import { ArrowBack } from '@mui/icons-material';

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power3.out' });
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.company || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const userData = {
        name: form.name,
        company: form.company,
        email: form.email,
        password: form.password
      };
      
      await apiService.register(userData);
      
      // Show success message and redirect to login page
      setError(''); // Clear any previous errors
      alert('Account created successfully! Please login with your credentials.');
      
      // Redirect to login page instead of dashboard
      navigate('/login');
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" ref={pageRef}>
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
          <p>Get started by creating your account.</p>
        </div>
        <div className="auth-form-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h3>Create Your Account</h3>
            <p>Join us to secure your digital assets.</p>
            {error && <div className="form-error">{error}</div>}
            <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} required />
            <InputField label="Company Name" name="company" value={form.company} onChange={handleChange} required />
            <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            <InputField label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
            <InputField label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={handleChange} required />
            <Button variant="primary" type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <div className="auth-switch-link">
              <span>Already have an account? </span>
              <a href="/login">Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 