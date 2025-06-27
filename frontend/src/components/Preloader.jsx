import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TextPlugin } from "gsap/TextPlugin";
import NetworkMascotAnimation from './HomeNetworkAnimation';
import './Preloader.css';
import './HomeNetworkAnimation.css';
import './PreloaderNetworkAnimation.css';

gsap.registerPlugin(TextPlugin);

const Preloader = ({ onComplete }) => {
    const textRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(containerRef.current, { opacity: 0, duration: 0.5, onComplete });
            }
        });
        gsap.set(textRef.current, { autoAlpha: 0 });
        tl.to(textRef.current, { autoAlpha: 1, text: "Detect.......", duration: 1 })
          .to(textRef.current, { autoAlpha: 1, text: "Secure.......", duration: 1 }, "+=0.5")
          .to(textRef.current, { autoAlpha: 1, text: "Monitor.......", duration: 1 }, "+=0.5")
          .to(textRef.current, { autoAlpha: 0, duration: 0.5 }, "+=0.5")
          .to(textRef.current, { autoAlpha: 1, text: "NetAegis", className: "+=main-title", duration: 1 }, "+=0.2")
          .to({}, { duration: 1 });
    }, [onComplete]);

    return (
        <div className="preloader-container" ref={containerRef}>
            <div className="preloader-content">
                <div className="preloader-network-animation">
                    <NetworkMascotAnimation preloaderMode={true} />
                </div>
                <p className="preloader-text" ref={textRef}></p>
            </div>
        </div>
    );
};

export default Preloader; 