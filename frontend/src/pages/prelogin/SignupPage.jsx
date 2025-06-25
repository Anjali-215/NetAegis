import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import './SignupPage.css';

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');

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
    <div className="prelogin-bg">
      <Navbar />
      <main className="signup-main">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h1>Sign Up</h1>
          {error && <div className="form-error">{error}</div>}
          <InputField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <InputField
            label="Company Name"
            name="company"
            value={form.company}
            onChange={handleChange}
            required
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <InputField
            label="Confirm Password"
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={handleChange}
            required
          />
          <Button variant="primary" type="submit">Sign Up</Button>
          <div className="signup-links">
            <a href="/login">Already have an account? Login</a>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
} 