import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="/privacy">Privacy</a>
        <span>|</span>
        <a href="/contact">Contact</a>
        <span>|</span>
        <a href="/about">About Us</a>
      </div>
      <div className="footer-copy">© {new Date().getFullYear()} NetAegis. All rights reserved.</div>
    </footer>
  );
} 