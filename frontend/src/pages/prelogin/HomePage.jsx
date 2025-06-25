import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import './HomePage.css';

const features = [
  { title: 'Real-time Threat Detection', desc: 'Detect DDoS, ransomware, and more instantly.' },
  { title: 'Easy CSV Upload', desc: 'Upload threat data with a simple drag-and-drop.' },
  { title: 'Modern Visualization', desc: 'Interactive charts and reports for your data.' },
];

export default function HomePage() {
  return (
    <div className="prelogin-bg">
      <Navbar />
      <main className="homepage-main">
        <section className="hero-section">
          <h1 className="hero-title">NetAegis</h1>
          <p className="hero-desc">Next-gen Cybersecurity Platform for Proactive Threat Defense</p>
          <div className="cta-buttons">
            <Button variant="secondary" href="/signup">Sign Up</Button>
            <Button variant="primary" href="/pricing">View Pricing</Button>
          </div>
        </section>
        <section className="features-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 