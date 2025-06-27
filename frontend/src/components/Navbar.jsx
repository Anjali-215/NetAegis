import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import './Navbar.css';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Pricing', href: '/pricing' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="navbar-header">
      <nav className="navbar">
        <Link to="/" className="navbar-logo">NetAegis</Link>
        <button className="navbar-burger" onClick={() => setOpen(!open)} aria-label="Menu">
          <span className="burger-bar" />
          <span className="burger-bar" />
          <span className="burger-bar" />
        </button>
        <div className={`navbar-menu${open ? ' open' : ''}`}>
          <ul className="navbar-links">
            {navLinks.map(link => (
              <li key={link.name}>
                <Link to={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
          <div className="navbar-auth-buttons">
            <Button variant="secondary" href="/login">Login</Button>
            <Button variant="primary" href="/signup">Sign Up</Button>
          </div>
        </div>
      </nav>
    </header>
  );
} 