import React, { useState } from 'react';
import './Navbar.css';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Login', href: '/login' },
  { name: 'Sign Up', href: '/signup' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="navbar">
      <div className="navbar-logo">NetAegis</div>
      <button className="navbar-burger" onClick={() => setOpen(!open)} aria-label="Menu">
        <span className="burger-bar" />
        <span className="burger-bar" />
        <span className="burger-bar" />
      </button>
      <ul className={`navbar-links${open ? ' open' : ''}`}>
        {navLinks.map(link => (
          <li key={link.name}>
            <a href={link.href}>{link.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
} 