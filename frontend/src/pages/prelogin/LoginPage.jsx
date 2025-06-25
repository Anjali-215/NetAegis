import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    <div className="prelogin-bg">
      <Navbar />
      <main className="login-main">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Login</h1>
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
          <Button variant="primary" type="submit">Login</Button>
          <div className="login-links">
            <a href="/forgot-password">Forgot Password?</a>
            <span> | </span>
            <a href="/signup">New here? Sign up</a>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
} 