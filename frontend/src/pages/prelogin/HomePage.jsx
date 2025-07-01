import React, { useLayoutEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import HomeNetworkAnimation from '../../components/HomeNetworkAnimation';
import HeroNetworkAnimation from '../../components/HeroNetworkAnimation';
import heroImage from '../../assets/hero_home.png';
import './HomePage.css';
import { FiShield, FiUploadCloud, FiBarChart2, FiUsers, FiCloud, FiFileText, FiLock } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

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

export default function HomePage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  const animatedTextRef = useRef(null);

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
  }, []);

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

            {/* About Section */}
            <section className="about-section">
              <div className="about-content">
                <h2 className="about-title">Why NetAegis?</h2>
                <div className="about-grid">
                  <div className="about-card">
                    <div className="about-icon">🛡️</div>
                    <h3 className="about-card-title">The Problem</h3>
                    <p className="about-card-desc">Modern organizations face relentless cyber threats. Manual detection is slow, error-prone, and often misses sophisticated attacks.</p>
                  </div>
                  <div className="about-card">
                    <div className="about-icon">🚀</div>
                    <h3 className="about-card-title">Our Solution</h3>
                    <p className="about-card-desc">NetAegis automates threat detection, monitoring, and response—empowering teams to stay ahead of attackers with real-time insights.</p>
                  </div>
                  <div className="about-card">
                    <div className="about-icon">💡</div>
                    <h3 className="about-card-title">What Makes Us Different?</h3>
                    <p className="about-card-desc">ML-powered detection, role-based access, and intuitive dashboards set NetAegis apart for both security teams and business leaders.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="cta-section" ref={ctaRef}>
                <h2 className="cta-title">Ready to Secure Your Network?</h2>
                <p className="cta-subtitle">Sign up and take the first step toward proactive digital protection.</p>
                <Button variant="primary" href="/signup">Get Started Now</Button>
            </section>

          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
} 