import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import './AuthPage.css';
import gsap from 'gsap';
import NetworkAnimation from '../../components/HeroNetworkAnimation';

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const pageRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power3.out' });
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
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
    // Handle signup logic here
  };

  return (
    <div className="auth-page login-bg" ref={pageRef} style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Network animation as background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <NetworkAnimation />
      </div>
      <div className="auth-form-outer" style={{ maxWidth: '400px', padding: '2rem 2rem 1.5rem 2rem', margin: '2.5rem 0', borderRadius: '16px', zIndex: 2, background: 'rgba(24,23,28,0.98)' }}>
        <form className="auth-form auth-form-centered" onSubmit={handleSubmit} style={{ width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.2rem', color: '#fff', fontWeight: 700 }}>Sign Up.</h2>
          <input
            className="auth-input"
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            name="company"
            type="text"
            placeholder="Company Name"
            value={form.company}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            name="confirm"
            type="password"
            placeholder="Confirm Password"
            value={form.confirm}
            onChange={handleChange}
            required
          />
          <button className="main-auth-btn" type="submit">Sign Up</button>
          <div className="auth-divider">or</div>
          <button type="button" className="social-btn google-btn">
            <span className="social-icon">G</span> Continue with Google
          </button>
          <div className="auth-links">
            <span>Already have an account? <a href="/login">Login</a></span>
          </div>
        </form>
      </div>
    </div>
  );
} 