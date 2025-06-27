import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import './AuthPage.css';
import gsap from 'gsap';

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
    <div className="auth-page" ref={pageRef}>
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
            <Button variant="primary" type="submit" style={{ width: '100%' }}>Sign Up</Button>
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