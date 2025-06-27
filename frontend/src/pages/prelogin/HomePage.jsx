import React, { useLayoutEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import HomeNetworkAnimation from '../../components/HomeNetworkAnimation';
import heroImage from '../../assets/hero_home.png';
import './HomePage.css';
import { FiShield, FiUploadCloud, FiBarChart2 } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, ScrollSmoother);

const features = [
  { 
    icon: <FiShield size={40} />,
    title: 'Real-time Threat Detection', 
    desc: 'Proactively identify and mitigate DDoS, ransomware, and other threats to keep your network secure.' 
  },
  { 
    icon: <FiUploadCloud size={40} />,
    title: 'Easy CSV Upload & Analysis', 
    desc: 'Upload and process your security datasets with a simple, intuitive drag-and-drop interface.' 
  },
  { 
    icon: <FiBarChart2 size={40} />,
    title: 'Modern Visualization', 
    desc: 'Understand your data through interactive charts and reports that are clear and actionable.' 
  },
];

export default function HomePage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

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

    // Features Animation
    // The fromTo animation for features has been removed to allow ScrollSmoother to work.

  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
        <div className="prelogin-bg">
          <Navbar />
          <main className="homepage-main">
            <section className="hero-container">
              <HomeNetworkAnimation />
              <div className="hero-content" ref={heroRef}>
                <h1 className="hero-title">NetAegis</h1>
                <p className="hero-desc">Your shield against digital threats.</p>
                <img src={heroImage} alt="DDoS Attack" className="hero-image"/>
                <div className="cta-buttons">
                  <Button variant="primary" href="/signup">Sign Up</Button>
                  <Button variant="secondary" href="/login">Login</Button>
                </div>
              </div>
            </section>

            <section className="features-section">
              <div className="features-content">
                <h2 className="features-title">Comprehensive Security Features</h2>
                <p className="features-subtitle">Explore our robust suite of cybersecurity tools designed to protect your digital assets.</p>
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

            <section className="cta-section">
                <h2 className="cta-title">Ready to Secure Your Network?</h2>
                <p className="cta-subtitle">Sign up today and take the first step towards proactive digital protection.</p>
                <Button variant="primary" href="/signup">Get Started Now</Button>
            </section>

          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
} 