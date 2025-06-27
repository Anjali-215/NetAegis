import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './NetworkAnimation.css';

const AttackerIcon = () => (
    <svg className="node-icon attacker-icon" viewBox="0 0 24 24">
        <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18A8,8,0,1,1,20,12,8,8,0,0,1,12,20Z" />
        <path d="M12,6a3.5,3.5,0,1,0,3.5,3.5A3.5,3.5,0,0,0,12,6Zm0,5a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,12,11Z" />
        <path d="M12,14c-4,0-6,2-6,2v2h12v-2S16,14,12,14Zm-4,2v-0.5c0.5-0.5,1.5-1.5,4-1.5s3.5,1,4,1.5V16Z" />
    </svg>
);

const LaptopIcon = () => (
    <svg className="node-icon laptop-icon" viewBox="0 0 24 24">
        <path d="M20,15H4a2,2,0,0,1-2-2V5A2,2,0,0,1,4,3H20a2,2,0,0,1,2,2v8A2,2,0,0,1,20,15ZM4,5V13H20V5Z" />
        <path d="M22,17H2v2H22V17Z" />
    </svg>
);

const ServerIcon = () => (
    <svg className="node-icon server-icon" viewBox="0 0 24 24">
        <path d="M20,2H4A2,2,0,0,0,2,4V20a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V4A2,2,0,0,0,20,2ZM4,20V4H20V20Z" />
        <line x1="6" y1="8" x2="18" y2="8" stroke="#fff" strokeWidth="1" />
        <line x1="6" y1="12" x2="18" y2="12" stroke="#fff" strokeWidth="1" />
        <line x1="6" y1="16" x2="18" y2="16" stroke="#fff" strokeWidth="1" />
        <circle cx="8" cy="6" r="1" fill="#fff" />
    </svg>
);

const NetworkAnimation = () => {
    const containerRef = useRef(null);
    const linesRef = useRef(null);

    useEffect(() => {
        const nodes = containerRef.current.querySelectorAll('.node');
        const server = containerRef.current.querySelector('.server');
        const attacker = containerRef.current.querySelector('.attacker');
        const bots = Array.from(nodes).filter(node => node.classList.contains('bot'));
        const svgLines = linesRef.current;

        const tl = gsap.timeline();

        // Initial state
        gsap.set([...bots, server, attacker], { opacity: 0, scale: 0.5 });
        gsap.set(svgLines, { opacity: 0 });

        tl.to(attacker, { opacity: 1, scale: 1, duration: 0.5 })
            .to(bots, { opacity: 1, scale: 1, duration: 1, stagger: 0.1 })
            .to(server, { opacity: 1, scale: 1, duration: 0.5 }, "-=0.5")
            .call(() => {
                // Draw lines from attacker to bots
                bots.forEach(bot => {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', attacker.offsetLeft + attacker.offsetWidth / 2);
                    line.setAttribute('y1', attacker.offsetTop + attacker.offsetHeight / 2);
                    line.setAttribute('x2', bot.offsetLeft + bot.offsetWidth / 2);
                    line.setAttribute('y2', bot.offsetTop + bot.offsetHeight / 2);
                    line.setAttribute('class', 'attacker-line');
                    svgLines.appendChild(line);
                });

                // Draw lines from bots to server
                bots.forEach(bot => {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', bot.offsetLeft + bot.offsetWidth / 2);
                    line.setAttribute('y1', bot.offsetTop + bot.offsetHeight / 2);
                    line.setAttribute('x2', server.offsetLeft + server.offsetWidth / 2);
                    line.setAttribute('y2', server.offsetTop + server.offsetHeight / 2);
                    line.setAttribute('class', 'attack-line');
                    svgLines.appendChild(line);
                });
                gsap.to(svgLines, { opacity: 1, duration: 0.5 });
            })
            .to(".attack-line", { stroke: '#2E7D32', duration: 1, delay: 1 })
            .to(".attacker-line", { stroke: '#9E9E9E', duration: 1 }, "<")
            .to(".attacker", { opacity: 0.3, duration: 1 }, "<");

    }, []);

    return (
        <div className="network-animation-container" ref={containerRef}>
            <svg ref={linesRef} className="lines-svg"></svg>

            {/* Nodes */}
            <div className="node attacker"><AttackerIcon /></div>
            <div className="node bot bot-1"><LaptopIcon /></div>
            <div className="node bot bot-2"><LaptopIcon /></div>
            <div className="node bot bot-3"><LaptopIcon /></div>
            <div className="node bot bot-4"><LaptopIcon /></div>
            <div className="node bot bot-5"><LaptopIcon /></div>
            <div className="node server"><ServerIcon /></div>
        </div>
    );
};

export default NetworkAnimation; 