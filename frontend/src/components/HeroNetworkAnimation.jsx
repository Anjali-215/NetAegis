import React, { useRef, useEffect } from 'react';

const NODE_COUNT = 38;
const LINE_DISTANCE = 180;
const COLOR = '#d32f2f';
const NODE_RADIUS = 3.5;
const LINE_WIDTH = 1.1;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function HeroNetworkAnimation() {
  const canvasRef = useRef(null);
  const nodes = useRef([]);
  const velocities = useRef([]);
  const animationRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Initialize nodes and velocities
    nodes.current = Array.from({ length: NODE_COUNT }, () => ({
      x: randomBetween(0.1, 0.9) * width,
      y: randomBetween(0.1, 0.9) * height,
    }));
    velocities.current = Array.from({ length: NODE_COUNT }, () => ({
      vx: randomBetween(-0.18, 0.18),
      vy: randomBetween(-0.18, 0.18),
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);
      // Draw lines
      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const dx = nodes.current[i].x - nodes.current[j].x;
          const dy = nodes.current[i].y - nodes.current[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINE_DISTANCE) {
            ctx.save();
            ctx.globalAlpha = 0.18 + 0.32 * (1 - dist / LINE_DISTANCE);
            ctx.strokeStyle = COLOR;
            ctx.lineWidth = LINE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(nodes.current[i].x, nodes.current[i].y);
            ctx.lineTo(nodes.current[j].x, nodes.current[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
      // Draw nodes
      for (let i = 0; i < NODE_COUNT; i++) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(nodes.current[i].x, nodes.current[i].y, NODE_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = COLOR;
        ctx.shadowColor = COLOR;
        ctx.shadowBlur = 12;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.restore();
      }
    }

    function animate() {
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.current[i].x += velocities.current[i].vx;
        nodes.current[i].y += velocities.current[i].vy;
        // Bounce off edges
        if (nodes.current[i].x < 0 || nodes.current[i].x > width) velocities.current[i].vx *= -1;
        if (nodes.current[i].y < 0 || nodes.current[i].y > height) velocities.current[i].vy *= -1;
      }
      draw();
      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-network-animation" />;
} 