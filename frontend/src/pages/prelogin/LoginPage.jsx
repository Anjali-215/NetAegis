import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import './AuthPage.css';
import gsap from 'gsap';
import NetworkAnimation from '../../components/HeroNetworkAnimation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const pageRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power3.out' });
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    // Handle login logic here
  };

  return (
    <div className="auth-page login-bg" ref={pageRef} style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Network animation as background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <NetworkAnimation />
      </div>
      <div className="auth-form-outer" style={{ maxWidth: '400px', padding: '2rem 2rem 1.5rem 2rem', margin: '2.5rem 0', borderRadius: '16px', zIndex: 2, background: 'rgba(24,23,28,0.98)' }}>
        <form className="auth-form auth-form-centered" onSubmit={handleSubmit} style={{ width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#fff', fontWeight: 700 }}>Sign In.</h2>
          <input
            className="auth-input"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="main-auth-btn" type="submit">Sign in.</button>
          <div className="auth-divider">or</div>
          <button type="button" className="social-btn google-btn">
            <span className="social-icon">G</span> Continue with Google
          </button>
          <div className="auth-links">
            <span>don't have an account? <a href="/signup">Create a account</a></span>
            <br />
            <a href="/forgot-password">Forgot password?</a>
          </div>
        </form>
      </div>
    </div>
  );
} 