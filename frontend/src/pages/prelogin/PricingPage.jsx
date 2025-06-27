import React, { useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import './PricingPage.css';
import { FiCheck } from 'react-icons/fi';
import gsap from 'gsap';

const plans = [
  { name: 'Basic', price: '$19', desc: 'For individuals and small teams', features: ['Threat Alerts', 'CSV Upload', 'Basic Support', 'Limited Visualizations'], popular: false },
  { name: 'Pro', price: '$49', desc: 'For growing businesses', features: ['All Basic Features', 'Advanced Visualization', 'Priority Support', 'User Management'], popular: true },
  { name: 'Enterprise', price: 'Contact Us', desc: 'For large-scale organizations', features: ['All Pro Features', 'Custom Integrations', 'Dedicated Manager', '24/7 Support'], popular: false },
];

export default function PricingPage() {
  const pageRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power3.out' });
  }, []);

  return (
    <div className="pricing-page-bg" ref={pageRef}>
      <Navbar />
      <main className="pricing-main">
        <div className="pricing-header">
            <h1 className="pricing-title">Find the Right Plan for Your Team</h1>
            <p className="pricing-subtitle">Start with a free trial, no credit card required.</p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div className={`plan-card${plan.popular ? ' popular' : ''}`} key={i}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h2 className="plan-name">{plan.name}</h2>
              <p className="plan-desc">{plan.desc}</p>
              <div className="plan-price-container">
                <span className="plan-price">{plan.price}</span>
                {plan.price !== 'Contact Us' && <span className="plan-interval">/ month</span>}
              </div>
              <Button variant={plan.popular ? 'primary' : 'secondary'} href="/signup" style={{ width: '100%', marginBottom: '1.5rem' }}>
                {plan.price === 'Contact Us' ? 'Contact Sales' : 'Get Started'}
              </Button>
              <ul className="plan-features">
                {plan.features.map((f, j) => <li key={j}><FiCheck className="feature-check" /><span>{f}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
} 