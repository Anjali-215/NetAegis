import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import './AuthPage.css';
import gsap from 'gsap';

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
    <div className="auth-page" ref={pageRef}>
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
            <Button variant="primary" type="submit" style={{ width: '100%' }}>Login</Button>
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