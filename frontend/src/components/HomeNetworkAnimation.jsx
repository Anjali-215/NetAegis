import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './HomeNetworkAnimation.css';
import './PreloaderNetworkAnimation.css';

const NetworkMascotAnimation = ({ preloaderMode }) => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);

    useEffect(() => {
        if (!preloaderMode) return;
        const container = containerRef.current;
        const svg = svgRef.current;
        // Clean up SVG
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        // Node structure (top to bottom)
        const structure = [
            { type: 'attacker', count: 1, y: 30, size: 44, color: '#ff7043', className: 'attacker' },
            { type: 'bot', count: 4, y: 110, size: 32, color: '#d32f2f', className: 'bot' },
            { type: 'bot', count: 8, y: 190, size: 24, color: '#d32f2f', className: 'bot' },
            { type: 'bot', count: 16, y: 270, size: 16, color: '#d32f2f', className: 'bot' },
            { type: 'server', count: 1, y: 350, size: 44, color: '#43e97b', className: 'server' },
        ];
        
        // Calculate node positions
        let nodePositions = [];
        structure.forEach((level, i) => {
            for (let j = 0; j < level.count; j++) {
                nodePositions.push({
                    x: 210 + (380 / (level.count + 1)) * (j + 1) - 190, // center in 420px
                    y: level.y,
                    type: level.type,
                    size: level.size,
                    color: level.color,
                    className: level.className,
                    level: i,
                    index: j
                });
            }
        });

        // Render nodes as SVG elements
        nodePositions.forEach((node, i) => {
            let svgElement;
            
            if (node.type === 'attacker') {
                // Create user icon (circle with person symbol)
                svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', node.x);
                circle.setAttribute('cy', node.y);
                circle.setAttribute('r', node.size / 2);
                circle.setAttribute('fill', '#2d2323');
                circle.setAttribute('stroke', node.color);
                circle.setAttribute('stroke-width', '2');
                svgElement.appendChild(circle);
                
                // Add person symbol
                const person = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                person.setAttribute('x', node.x);
                person.setAttribute('y', node.y + 4);
                person.setAttribute('text-anchor', 'middle');
                person.setAttribute('fill', node.color);
                person.setAttribute('font-size', node.size * 0.6);
                person.setAttribute('font-family', 'Arial');
                person.textContent = '👤';
                svgElement.appendChild(person);
                
            } else if (node.type === 'bot') {
                // Create laptop icon (rectangle)
                svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                svgElement.setAttribute('x', node.x - node.size / 2);
                svgElement.setAttribute('y', node.y - node.size / 2);
                svgElement.setAttribute('width', node.size);
                svgElement.setAttribute('height', node.size);
                svgElement.setAttribute('fill', '#1b1b1b');
                svgElement.setAttribute('stroke', node.color);
                svgElement.setAttribute('stroke-width', '2');
                svgElement.setAttribute('rx', '4');
                
            } else if (node.type === 'server') {
                // Create server icon (rectangle with circles)
                svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', node.x - node.size / 2);
                rect.setAttribute('y', node.y - node.size / 2);
                rect.setAttribute('width', node.size);
                rect.setAttribute('height', node.size);
                rect.setAttribute('fill', '#1b2d1b');
                rect.setAttribute('stroke', node.color);
                rect.setAttribute('stroke-width', '2');
                rect.setAttribute('rx', '4');
                svgElement.appendChild(rect);
                
                // Add server indicator circles
                for (let k = 0; k < 3; k++) {
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', node.x - node.size / 4 + (k * node.size / 4));
                    circle.setAttribute('cy', node.y);
                    circle.setAttribute('r', '3');
                    circle.setAttribute('fill', node.color);
                    svgElement.appendChild(circle);
                }
                
                // Add NetAegis label
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', node.x);
                label.setAttribute('y', node.y + node.size / 2 + 20);
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('fill', '#90caf9');
                label.setAttribute('font-size', '14');
                label.setAttribute('font-family', 'monospace');
                label.textContent = 'NetAegis';
                svgElement.appendChild(label);
            }
            
            svgElement.setAttribute('class', `preloader-network-node ${node.className}`);
            svg.appendChild(svgElement);
        });

        // Draw lines after nodes are created
        setTimeout(() => {
            // Add marker for arrows
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', 'preloader-arrowhead');
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '7');
            marker.setAttribute('refX', '10');
            marker.setAttribute('refY', '3.5');
            marker.setAttribute('orient', 'auto');
            marker.setAttribute('markerUnits', 'strokeWidth');
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
            polygon.setAttribute('fill', '#ff7043');
            marker.appendChild(polygon);
            defs.appendChild(marker);
            svg.appendChild(defs);
            
            // Draw connection lines
            const nodeElements = Array.from(svg.querySelectorAll('.preloader-network-node'));
            
            // Attacker to level 1 bots
            const attacker = nodeElements[0];
            const level1Bots = nodeElements.slice(1, 5);
            level1Bots.forEach(bot => {
                drawLine(attacker, bot, '#ff7043');
            });
            
            // Level 1 to Level 2
            for (let i = 0; i < 4; i++) {
                const parent = level1Bots[i];
                const children = nodeElements.slice(5 + i * 2, 5 + i * 2 + 2);
                children.forEach(child => {
                    drawLine(parent, child, '#ff7043');
                });
            }
            
            // Level 2 to Level 3
            const level2Bots = nodeElements.slice(5, 13);
            for (let i = 0; i < 8; i++) {
                const parent = level2Bots[i];
                const children = nodeElements.slice(13 + i * 2, 13 + i * 2 + 2);
                children.forEach(child => {
                    drawLine(parent, child, '#ff7043');
                });
            }
            
            // Level 3 to server
            const level3Bots = nodeElements.slice(13, 29);
            const server = nodeElements[nodeElements.length - 1];
            level3Bots.forEach(bot => {
                drawLine(bot, server, '#2196f3');
            });
            
            function drawLine(fromEl, toEl, color) {
                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();
                const svgRect = svg.getBoundingClientRect();
                
                const fromX = fromRect.left - svgRect.left + fromRect.width / 2;
                const fromY = fromRect.top - svgRect.top + fromRect.height / 2;
                const toX = toRect.left - svgRect.left + toRect.width / 2;
                const toY = toRect.top - svgRect.top + toRect.height / 2;
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', fromX);
                line.setAttribute('y1', fromY);
                line.setAttribute('x2', toX);
                line.setAttribute('y2', toY);
                line.setAttribute('stroke', color);
                line.setAttribute('stroke-width', '2');
                line.setAttribute('marker-end', 'url(#preloader-arrowhead)');
                line.setAttribute('opacity', '0.7');
                svg.appendChild(line);
            }
        }, 100);

        // Animate nodes
        setTimeout(() => {
            gsap.fromTo(svg.querySelectorAll('.preloader-network-node'),
                { scale: 0.7, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.2, stagger: 0.04, ease: 'back.out(1.7)' }
            );
            gsap.to(svg.querySelectorAll('.preloader-network-node'), {
                y: 'random(-8,8)',
                x: 'random(-8,8)',
                repeat: -1,
                yoyo: true,
                duration: 2.2,
                ease: 'sine.inOut',
                stagger: { amount: 1.5, grid: 'auto', from: 'center' }
            });
        }, 200);
    }, [preloaderMode]);

    if (preloaderMode) {
        return (
            <div className="preloader-network-animation" ref={containerRef}>
                <svg ref={svgRef} className="preloader-network-svg" width={420} height={420}></svg>
            </div>
        );
    }

    // Home page (non-preloader) logic unchanged
    // ... existing code ...

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