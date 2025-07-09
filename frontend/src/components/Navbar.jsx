import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Smooth scroll handler
  const handleNavClick = (e, selector) => {
    e.preventDefault();
    setOpen(false);

    // Use GSAP ScrollSmoother if available
    if (window.ScrollSmoother && window.ScrollSmoother.get && selector !== '#') {
      const el = document.querySelector(selector);
      if (el) {
        const smoother = window.ScrollSmoother.get();
        if (smoother) {
          // Offset by Navbar height (72px)
          const y = el.getBoundingClientRect().top + window.scrollY - 72;
          smoother.scrollTo(y, true);
          // Force GSAP to recalculate scroll area after scroll
          setTimeout(() => {
            smoother.refresh();
          }, 100);
          return;
        }
      }
    }
    if (selector === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className="navbar-header">
      <nav className="navbar">
        <a href="#" className="navbar-logo" onClick={e => handleNavClick(e, '#')}>NetAegis</a>
        <button className="navbar-burger" onClick={() => setOpen(!open)} aria-label="Menu">
          <span className="burger-bar" />
          <span className="burger-bar" />
          <span className="burger-bar" />
        </button>
        <div className={`navbar-menu${open ? ' open' : ''}`}>
          <ul className="navbar-links">
            <li><a href="#" onClick={e => handleNavClick(e, '#')}>Home</a></li>
            <li><a href="#features-section" onClick={e => handleNavClick(e, '.features-section')}>Features</a></li>
            <li><a href="#about" onClick={e => handleNavClick(e, '#about')}>About</a></li>
            <li><a href="#pricing-section" onClick={e => handleNavClick(e, '.pricing-section')}>Pricing</a></li>
            <li><a href="#contact-section" onClick={e => handleNavClick(e, '.contact-section')}>Contact</a></li>
            <li><a href="#faq-fab-section" onClick={e => handleNavClick(e, '.faq-fab-section')}>FAQ</a></li>
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