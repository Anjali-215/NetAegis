import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import './PricingPage.css';

const plans = [
  { name: 'Basic', price: '$19/mo', features: ['Threat Alerts', 'CSV Upload', 'Basic Support'], popular: false },
  { name: 'Pro', price: '$49/mo', features: ['All Basic Features', 'Advanced Visualization', 'Priority Support'], popular: true },
  { name: 'Enterprise', price: 'Contact Us', features: ['All Pro Features', 'Custom Integrations', 'Dedicated Manager'], popular: false },
];

export default function PricingPage() {
  return (
    <div className="prelogin-bg">
      <Navbar />
      <main className="pricing-main">
        <h1 className="pricing-title">Choose Your Plan</h1>
        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div className={`plan-card${plan.popular ? ' popular' : ''}`} key={i}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h2>{plan.name}</h2>
              <p className="plan-price">{plan.price}</p>
              <ul>
                {plan.features.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
              <Button variant="primary" href="/signup">Sign Up</Button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
} 