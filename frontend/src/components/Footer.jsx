import React from 'react';
import './Footer.css';
import mainlogo from '../assets/mainlogo.svg';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <img 
            src={mainlogo} 
            alt="NetAegis" 
            style={{ 
              height: '40px', 
              width: 'auto',
              marginBottom: '8px'
            }} 
          />
          {/* <span className="footer-logo">NetAegis</span> */}
        </div>
        <div className="footer-links-col">
          <h4>Product</h4>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#how">How it Works</a>
        </div>
        <div className="footer-links-col">
          <h4>Company</h4>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
        <div className="footer-social">
          <h4>Connect</h4>
          <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
          <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
          <a href="mailto:info@netaegis.com" aria-label="Email"><i className="fas fa-envelope"></i></a>
        </div>
      </div>
      <div className="footer-copy">© {new Date().getFullYear()} NetAegis. All rights reserved.</div>
    </footer>
  );
} 