import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSecret, faLaptop, faServer } from '@fortawesome/free-solid-svg-icons';
import './HomeNetworkAnimation.css';
import './PreloaderNetworkAnimation.css';

const NetworkMascotAnimation = ({ preloaderMode }) => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const svg = svgRef.current;
        const nodes = [];
        const lines = [];

        // Define the network structure
        const structure = [
            { icon: faUserSecret, count: 1, y: 50, size: 40, color: '#000000' },
            { icon: faLaptop, count: 4, y: 150, size: 30, color: '#d9534f' },
            { icon: faLaptop, count: 8, y: 250, size: 20, color: '#d9534f' },
            { icon: faLaptop, count: 16, y: 350, size: 15, color: '#d9534f' },
            { icon: faServer, count: 1, y: 450, size: 40, color: '#000000' }
        ];

        // Set container width wider in preloader mode for more spread
        if (preloaderMode && container) {
            container.style.width = '600px';
        }

        let nodeIndex = 0;
        const nodeElements = [];

        structure.forEach((level, levelIndex) => {
            for (let i = 0; i < level.count; i++) {
                const nodeElement = document.createElement('div');
                nodeElement.classList.add(preloaderMode ? 'preloader-network-node' : 'network-node');
                container.appendChild(nodeElement);
                
                // Spread out nodes more in preloader mode
                const spread = preloaderMode ? 0.85 : 1;
                const x = (container.offsetWidth * spread / (level.count + 1)) * (i + 1) + (preloaderMode ? container.offsetWidth * 0.075 : 0);
                const y = level.y;

                const node = {
                    element: nodeElement,
                    x: x,
                    y: y,
                    icon: level.icon,
                    size: level.size,
                    color: level.color,
                    level: levelIndex,
                    indexInLevel: i
                };
                
                nodes.push(node);
                nodeElements.push(
                    <FontAwesomeIcon
                        key={nodeIndex++}
                        icon={node.icon}
                        style={{
                            position: 'absolute',
                            left: node.x,
                            top: node.y,
                            fontSize: node.size,
                            color: node.color,
                            transform: 'translate(-50%, -50%)',
                            filter: preloaderMode ? 'drop-shadow(0 0 8px #d32f2f)' : undefined
                        }}
                    />
                );
            }
        });

        // Render icons
        const iconContainer = document.createElement('div');
        container.appendChild(iconContainer);
        import('react-dom/client').then(({ createRoot }) => {
            const tempApp = React.createElement('div', null, ...nodeElements);
            const root = createRoot(iconContainer);
            root.render(tempApp);
        });

        // Move SVG to top to ensure lines are above icons
        container.appendChild(svg);

        // Create lines
        // Hacker to level 1
        const hacker = nodes[0];
        const level1Nodes = nodes.slice(1, 5);
        level1Nodes.forEach(node => {
            const line = createLine(hacker.x, hacker.y, node.x, node.y, 'attacker');
            svg.appendChild(line);
            lines.push(line);
        });

        // Level 1 to Level 2
        for(let i = 0; i < 4; i++) {
            const parent = nodes[1 + i];
            for(let j = 0; j < 2; j++) {
                const child = nodes[5 + i * 2 + j];
                const line = createLine(parent.x, parent.y, child.x, child.y, 'attacker');
                svg.appendChild(line);
                lines.push(line);
            }
        }

        // Level 2 to Level 3
        for(let i = 0; i < 8; i++) {
            const parent = nodes[5 + i];
             for(let j = 0; j < 2; j++) {
                const childIndex = 13 + i * 2 + j;
                if(childIndex < nodes.length - 1) { // ensure we dont connect to the server
                    const child = nodes[childIndex];
                    const line = createLine(parent.x, parent.y, child.x, child.y, 'attacker');
                    svg.appendChild(line);
                    lines.push(line);
                }
            }
        }
        
        // Level 3 to Server
        const server = nodes[nodes.length - 1];
        const level3Nodes = nodes.slice(13, 13 + 16);
        level3Nodes.forEach(node => {
            const line = createLine(node.x, node.y, server.x, server.y, 'bot');
            svg.appendChild(line);
            lines.push(line);
        });

        // Animate
        if (preloaderMode) {
            // Animate nodes with extra movement
            gsap.fromTo(container.querySelectorAll('.preloader-network-node'),
                { scale: 0.7, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.2, stagger: 0.04, ease: 'back.out(1.7)' }
            );
            // Floating effect
            gsap.to(container.querySelectorAll('.preloader-network-node'), {
                y: 'random(-8,8)',
                x: 'random(-8,8)',
                repeat: -1,
                yoyo: true,
                duration: 2.2,
                ease: 'sine.inOut',
                stagger: { amount: 1.5, grid: 'auto', from: 'center' }
            });
            gsap.fromTo(svg.querySelectorAll('.preloader-network-line'), { opacity: 0 }, { opacity: 0.85, duration: 1.5, stagger: 0.01, delay: 0.5 });
        } else {
            gsap.fromTo(container.querySelectorAll('.network-node'), 
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.5, stagger: 0.05, ease: 'power3.out' }
            );
            gsap.fromTo(svg.querySelectorAll('.network-line'), { opacity: 0 }, { opacity: 0.5, duration: 2, stagger: 0.02, delay: 1 });
        }

        // Cleanup on unmount
        return () => {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            if (svg) {
                while (svg.firstChild) {
                    svg.removeChild(svg.firstChild);
                }
            }
        };
    }, [preloaderMode]);

    function createLine(x1, y1, x2, y2, type) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        if (preloaderMode) {
            line.classList.add('preloader-network-line');
            line.classList.add(type); // 'attacker' or 'bot' or 'secured'
        } else {
            line.classList.add('network-line');
        }
        return line;
    }

    return (
        <div className={preloaderMode ? 'preloader-network-animation' : 'home-network-animation'} ref={containerRef}>
            <svg ref={svgRef} className={preloaderMode ? 'preloader-network-svg' : 'network-svg'}>
                {preloaderMode && (
                    <defs>
                        <marker id="preloader-arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" markerUnits="strokeWidth">
                            <polygon className="preloader-network-arrowhead" points="0 0, 10 3.5, 0 7" />
                        </marker>
                    </defs>
                )}
            </svg>
        </div>
    );
};

export default NetworkMascotAnimation; 