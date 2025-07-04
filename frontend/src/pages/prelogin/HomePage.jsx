import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import HomeNetworkAnimation from '../../components/HomeNetworkAnimation';
import HeroNetworkAnimation from '../../components/HeroNetworkAnimation';
import heroImage from '../../assets/hero_home.png';
import './HomePage.css';
import { FiShield, FiUploadCloud, FiBarChart2, FiUsers, FiCloud, FiFileText, FiLock, FiCheck, FiStar, FiChevronDown, FiMail, FiTwitter, FiLinkedin, FiSend, FiHelpCircle, FiX } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { FaBeer } from 'react-icons/fa';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, ScrollSmoother);

const features = [
  {
    icon: <FiUsers size={40} />,
    title: 'Role-Based Access',
    desc: 'Secure access for admins and teams.'
  },
  {
    icon: <FiUploadCloud size={40} />,
    title: 'Upload Logs',
    desc: 'Upload and analyze network CSV files.'
  },
  {
    icon: <FiBarChart2 size={40} />,
    title: 'Threat Dashboard',
    desc: 'Visual insights of attacks detected.'
  },
  {
    icon: <FiShield size={40} />,
    title: 'ML Detection Engine',
    desc: 'Detect ransomware, DDoS, anomalies.'
  },
  {
    icon: <FiFileText size={40} />,
    title: 'Auto Reports',
    desc: 'Download summaries and alerts.'
  },
  {
    icon: <FiLock size={40} />,
    title: 'Secure Authentication',
    desc: 'Multi-factor authentication for safe access.'
  }
];

const aboutStatements = [
  {
    title: 'The Problem',
    text: 'Modern organizations face relentless cyber threats. Manual detection is slow, error-prone, and often misses sophisticated attacks.'
  },
  {
    title: 'Our Solution',
    text: 'NetAegis automates threat detection, monitoring, and response—empowering teams to stay ahead of attackers with real-time insights.'
  },
  {
    title: 'What Makes Us Different?',
    text: 'ML-powered detection, role-based access, and intuitive dashboards set NetAegis apart for both security teams and business leaders.'
  }
];

const pricingPlans = [
  {
    name: 'Starter',
    prices: {
      monthly: '₹499',
      yearly: '₹4,999',
    },
    descriptions: {
      monthly: 'Affordable protection for individuals and small teams',
      yearly: 'Save more with annual billing for individuals and small teams',
    },
    features: [
      'Up to 5 users',
      'Threat detection',
      '1GB log storage',
      'Email support',
      'Standard reports',
      '24/7 support'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'secondary',
    popular: false
  },
  {
    name: 'Pro',
    prices: {
      monthly: '₹1999',
      yearly: '₹19,999',
    },
    descriptions: {
      monthly: 'Advanced protection for growing organizations',
      yearly: 'Save more with annual billing for growing organizations',
    },
    features: [
      'Up to 25 users',
      'Threat detection',
      '10GB log storage',
      'Priority support',
      'Standard reports',
      '24/7 support',
      'Custom reports',
      'Real-time alerts'
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'primary',
    popular: true
  }
];

// Map feature text to icons for pricing section
const pricingFeatureIcons = {
  users: <FiUsers size={18} className="feature-icon" />,
  detection: <FiShield size={18} className="feature-icon" />,
  storage: <FiUploadCloud size={18} className="feature-icon" />,
  support: <FiCloud size={18} className="feature-icon" />,
  reports: <FiFileText size={18} className="feature-icon" />,
  alerts: <FiBarChart2 size={18} className="feature-icon" />,
  api: <FiLock size={18} className="feature-icon" />,
  analytics: <FiBarChart2 size={18} className="feature-icon" />,
  integrations: <FiCloud size={18} className="feature-icon" />,
  sla: <FiShield size={18} className="feature-icon" />,
  onprem: <FiLock size={18} className="feature-icon" />,
};

function getPricingFeatureIcon(feature) {
  const f = feature.toLowerCase();
  if (f.includes('user')) return pricingFeatureIcons.users;
  if (f.includes('detect')) return pricingFeatureIcons.detection;
  if (f.includes('storage')) return pricingFeatureIcons.storage;
  if (f.includes('support')) return pricingFeatureIcons.support;
  if (f.includes('report')) return pricingFeatureIcons.reports;
  if (f.includes('alert')) return pricingFeatureIcons.alerts;
  if (f.includes('api')) return pricingFeatureIcons.api;
  if (f.includes('analytic')) return pricingFeatureIcons.analytics;
  if (f.includes('integration')) return pricingFeatureIcons.integrations;
  if (f.includes('sla')) return pricingFeatureIcons.sla;
  if (f.includes('premise')) return pricingFeatureIcons.onprem;
  return <FiShield size={18} className="feature-icon" />;
}

const faqs = [
  {
    question: 'What is included in the Starter and Pro plans?',
    answer: 'Both plans include threat detection, log storage, reports, and 24/7 support. The Pro plan offers more users, storage, and advanced features.'
  },
  {
    question: 'Can I upgrade or downgrade my plan later?',
    answer: 'Yes, you can change your plan at any time from your account dashboard.'
  },
  {
    question: 'Is my data secure with NetAegis?',
    answer: 'Absolutely. We use industry-standard encryption and best practices to keep your data safe.'
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Yes, the Pro plan comes with a free trial. You can try all features before committing.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit/debit cards and UPI payments.'
  }
];

export default function HomePage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  const animatedTextRef = useRef(null);
  const [aboutIndex, setAboutIndex] = useState(0);
  const aboutCarouselRef = useRef(null);
  const pricingRef = useRef(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [pricingInView, setPricingInView] = useState(false);
  const pricingCardsRef = useRef([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [fabIntroDone, setFabIntroDone] = useState(false);
  const bigQRef = useRef(null);
  const fabRef = useRef(null);
  const faqSectionRef = useRef(null);

  // Add refs for each question mark
  const qRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleContactChange = e => setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  const handleContactSubmit = e => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => setContactSent(false), 3000);
    setContactForm({ name: '', email: '', message: '' });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAboutIndex((prev) => (prev + 1) % aboutStatements.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useLayoutEffect(() => {
    const smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 2,
      effects: true,
    });

    // Hero Animation
    const heroTitle = heroRef.current.querySelector('.hero-title');
    const heroDesc = heroRef.current.querySelector('.hero-desc');
    const ctaButtons = heroRef.current.querySelector('.cta-buttons');
    const animatedWords = heroRef.current.querySelectorAll('.animated-word');
    
    const tl = gsap.timeline({delay: 0.5});

    tl.to(heroTitle, {
        duration: 2.5,
        scrambleText: {
            text: "NetAegis",
            chars: "10",
            speed: 0.4,
            ease: "power3.inOut"
        }
    })
    .from([heroDesc, ctaButtons], {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out'
    }, "-=1.5");

    // Animated words fall-down animation
    gsap.fromTo(animatedWords, 
      {
        y: -50,
        opacity: 0,
        rotationX: -90
      },
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 0.8,
        stagger: 0.3,
        ease: "back.out(1.7)",
        delay: 2.5
      }
    );

    // Rainbow Scroll Animation
    const pageContainer = document.querySelector('.prelogin-bg');
    
    gsap.timeline({
        scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
        }
    })
    .to(pageContainer, { '--primary-r': 251, '--primary-g': 192, '--primary-b': 45 }) // Yellow
    .to(pageContainer, { '--primary-r': 25,  '--primary-g': 118, '--primary-b': 210 }) // Blue
    .to(pageContainer, { '--primary-r': 46,  '--primary-g': 125, '--primary-b': 50 });  // Green

    // Features Animation removed for visibility fix
    // CTA Animation
    if (ctaRef.current) {
      gsap.from(ctaRef.current, {
        scale: 0.92,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 85%',
        }
      });
    }

    // Animate About carousel
    if (aboutCarouselRef.current) {
      gsap.fromTo(
        aboutCarouselRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }

    // Pricing Section Animations removed
  }, [aboutIndex]);

  useEffect(() => {
    // Minimal GSAP animation for pricing cards
    if (pricingInView && pricingCardsRef.current.length) {
      gsap.set(pricingCardsRef.current, { opacity: 0, y: 40, scale: 0.98 });
      gsap.to(
        pricingCardsRef.current,
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out' }
      );
    }
  }, [pricingInView]);

  useEffect(() => {
    // Minimal animation for pricing cards (IntersectionObserver)
    const section = pricingRef.current;
    if (!section) return;
    const handleIntersect = (entries) => {
      if (entries[0].isIntersecting) {
        setPricingInView(true);
      }
    };
    const observer = new window.IntersectionObserver(handleIntersect, { threshold: 0.2 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.gsap) {
      qRefs.forEach((ref, i) => {
        window.gsap.to(ref.current, {
          y: -30,
          repeat: -1,
          yoyo: true,
          duration: 2 + i * 0.5,
          ease: "power1.inOut",
          opacity: 0.22,
          delay: i * 0.3
        });
      });
    }
  }, [qRefs]);

  useEffect(() => {
    let observer;
    let hasAnimated = false;
    if (faqSectionRef.current && !fabIntroDone) {
      observer = new window.IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            !hasAnimated &&
            bigQRef.current &&
            fabRef.current
          ) {
            hasAnimated = true;
            // Get bounding rects relative to the viewport
            const fabRect = fabRef.current.getBoundingClientRect();
            const qRect = bigQRef.current.getBoundingClientRect();
            const dx = fabRect.left + fabRect.width / 2 - (qRect.left + qRect.width / 2);
            const dy = fabRect.top + fabRect.height / 2 - (qRect.top + qRect.height / 2);
            gsap.to(bigQRef.current, {
              x: dx,
              y: dy,
              scale: 0.3,
              duration: 1.2,
              ease: 'power2.inOut',
              onComplete: () => setFabIntroDone(true)
            });
            observer.disconnect();
          }
        },
        { threshold: 0.7 }
      );
      observer.observe(faqSectionRef.current);
    }
    return () => observer && observer.disconnect();
  }, [fabIntroDone]);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
        <div className="prelogin-bg">
          <Navbar />
          <main className="homepage-main">
            <section className="hero-container">
              {/* Red network/graph animation background */}
              <HeroNetworkAnimation />
              <div className="hero-content" ref={heroRef}>
                <h1 className="hero-title">NetAegis</h1>
                <p className="hero-desc">Your shield against digital threats.</p>
                
                <div className="animated-text-container">
                  <span className="animated-word">Monitor</span>
                  <span className="animated-word">Detect</span>
                  <span className="animated-word">Secure</span>
                </div>
                
                <div className="cta-buttons">
                  <Button variant="secondary" href="/demo">View Demo</Button>
                  <Button variant="primary" href="/signup">Sign Up</Button>
                </div>
              </div>
            </section>

            <section className="features-section">
              <div className="features-content">
                <h2 className="features-title"> Features</h2>
                <p className="features-subtitle">Powerful tools to protect, monitor, and analyze your digital assets in real time.</p>
                <div className="features-grid" ref={featuresRef}>
                  {features.map((f, i) => (
                    <div className="feature-card" key={i} data-speed={['0.9', '1.1', '1.0'][i % 3]}>
                      <div className="feature-icon">{f.icon}</div>
                      <h3 className="feature-title">{f.title}</h3>
                      <p className="feature-desc">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* About Section Carousel */}
            <section className="about-section" id="about">
              <div className="about-carousel-container">
                <div className="about-carousel-quote" ref={aboutCarouselRef}>
                  <div className="about-carousel-title">{aboutStatements[aboutIndex].title}</div>
                  <div className="about-carousel-text">{aboutStatements[aboutIndex].text}</div>
                </div>
                <div className="about-carousel-dots">
                  {aboutStatements.map((_, i) => (
                    <span
                      key={i}
                      className={`about-carousel-dot${i === aboutIndex ? ' active' : ''}`}
                      onClick={() => setAboutIndex(i)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Pricing Section */}
            <section className="pricing-section" ref={pricingRef}>
              <div className="pricing-content modern-pricing">
                <h2 className="pricing-title">Find Your Perfect Plan</h2>
                <p className="pricing-subtitle">Discover the ideal plan to fuel your business growth. Our pricing options are carefully crafted to cater to businesses.</p>
                <div className="pricing-toggle">
                  <button className={billingPeriod === 'monthly' ? 'active' : ''} onClick={() => setBillingPeriod('monthly')}>Monthly</button>
                  <button className={billingPeriod === 'yearly' ? 'active' : ''} onClick={() => setBillingPeriod('yearly')}>Yearly</button>
                </div>
                <div className="pricing-grid modern-grid">
                  {pricingPlans.map((plan, index) => (
                    <div 
                      key={index} 
                      className={`modern-pricing-card${plan.popular ? ' best-offer' : ''}`}
                      ref={el => pricingCardsRef.current[index] = el}
                    >
                      {plan.popular && (
                        <div className="best-offer-badge">Best offer</div>
                      )}
                      <div className="modern-plan-header">
                        <h3 className="modern-plan-name">{plan.name}</h3>
                        <div className="modern-plan-price-row">
                          <span className="modern-plan-price">{plan.prices[billingPeriod]}</span>
                          <span className="modern-plan-period">per {billingPeriod}</span>
                        </div>
                        <p className="modern-plan-desc">{plan.descriptions[billingPeriod]}</p>
                      </div>
                      <div className="modern-features-list">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="modern-feature">
                            <FiCheck size={18} className="modern-feature-check" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pricing-action">
                        <Button 
                          variant={plan.buttonVariant} 
                          href={plan.name === 'Free' ? '/signup' : '/signup'}
                        >
                          {plan.buttonText}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="contact-section">
              <h2 className="contact-title">Contact Us</h2>
              <div className="contact-content">
                <form className="contact-form" onSubmit={handleContactSubmit} autoComplete="off">
                  <div className="contact-fields">
                    <input type="text" name="name" placeholder="Your Name" value={contactForm.name} onChange={handleContactChange} required />
                    <input type="email" name="email" placeholder="Your Email" value={contactForm.email} onChange={handleContactChange} required />
                  </div>
                  <textarea name="message" placeholder="Your Message" value={contactForm.message} onChange={handleContactChange} required rows={4} />
                  <button type="submit" className="contact-send-btn">
                    <FiSend style={{ marginRight: 8 }} /> Send Message
                  </button>
                  {contactSent && <div className="contact-success">Thank you! We'll get back to you soon.</div>}
                </form>
                <div className="contact-info">
                  <div className="contact-support">
                    <FiMail className="contact-icon" />
                    <span>support@netaegis.com</span>
                  </div>
                  <div className="contact-socials">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FiTwitter /></a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FiLinkedin /></a>
                  </div>
                  <a href="#" className="contact-demo-btn">Request a Demo</a>
                </div>
              </div>
            </section>
          </main>

          {/* FAQ FAB Section - moved outside main for true floating behavior */}
          <section
            ref={faqSectionRef}
            className="faq-fab-section"
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '220px',
              overflow: 'hidden'
            }}
          >
            <div className="faq-bg-animated" />
            {/* Big ? intro animation */}
            {!fabIntroDone && (
              <span
                ref={bigQRef}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '7rem',
                  color: '#fff',
                  fontFamily: 'cursive, Arial, sans-serif',
                  zIndex: 20,
                  pointerEvents: 'none',
                  transition: 'opacity 0.3s'
                }}
              >
                ?
              </span>
            )}
            <div
              style={{
                opacity: fabIntroDone ? 1 : 0,
                transition: 'opacity 0.4s',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <div style={{ textAlign: 'center', fontStyle: 'italic', fontWeight: 300, fontSize: '2.4rem', color: '#fff', marginBottom: '18px', fontFamily: 'cursive, Arial, sans-serif', letterSpacing: '0.5px', width: '70%' }}>
                Frequently Asked Questions?
              </div>
              <button ref={fabRef} className="faq-fab" onClick={() => setFaqModalOpen(true)} aria-label="Open FAQs">
                ?
              </button>
            </div>
            {faqModalOpen && (
              <div className="faq-modal-overlay" onClick={() => setFaqModalOpen(false)}>
                <div className="faq-modal" onClick={e => e.stopPropagation()}>
                  <div className="faq-modal-header">
                    <span>Frequently Asked Questions</span>
                    <button className="faq-modal-close" onClick={() => setFaqModalOpen(false)} aria-label="Close FAQ">
                      <FiX size={24} />
                    </button>
                  </div>
                  <div className="faq-modal-list">
                    {faqs.map((faq, idx) => (
                      <div className={`faq-modal-item${openFaq === idx ? ' open' : ''}`} key={idx}>
                        <button className="faq-modal-question" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                          <span>{faq.question}</span>
                          <FiChevronDown className="faq-modal-chevron" />
                        </button>
                        <div className="faq-modal-answer" style={{ maxHeight: openFaq === idx ? '200px' : '0', opacity: openFaq === idx ? 1 : 0, transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s' }}>
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          <Footer />
        </div>
      </div>
      <div style={{ color: 'white', fontSize: 40 }}>
        <FaBeer />
        <span>ICON TEST</span>
      </div>
    </div>
  );
} 