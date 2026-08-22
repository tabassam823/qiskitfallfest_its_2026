/**
 * Qiskit Fall Fest ITS 2026 - Quantum Canvas Engine
 * Interactive background canvas with floating qubits, entanglement lines, and mouse interaction
 */

(function () {
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.id = 'quantum-bg-canvas';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: -1000, y: -1000, radius: 160 };

  const COLORS = [
    { r: 0, g: 163, b: 255 },    // ITS Cyan
    { r: 1, g: 56, b: 128 },     // ITS Primary Blue
    { r: 138, g: 63, b: 252 },   // IBM Quantum Purple
    { r: 255, g: 126, b: 182 },  // Qiskit Pink / Magenta
    { r: 0, g: 229, b: 255 },    // Bright Cyan
    { r: 255, g: 199, b: 44 }    // ITS Gold
  ];

  const QUANTUM_STATES = ['|0⟩', '|1⟩', '|+⟩', '|−⟩', '|ψ⟩', 'H', 'X', 'CX', '⊕'];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  }

  class QuantumParticle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.5 + 1.2;
      this.baseX = this.x;
      this.baseY = this.y;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.6 + 0.2;
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.pulseAngle = Math.random() * Math.PI * 2;
      
      // Some particles render as quantum Dirac bra-ket notations or gates
      this.isSymbol = Math.random() < 0.22;
      this.symbol = QUANTUM_STATES[Math.floor(Math.random() * QUANTUM_STATES.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Pulse alpha for idle glow effect
      this.pulseAngle += this.pulseSpeed;
      this.currentAlpha = this.alpha + Math.sin(this.pulseAngle) * 0.2;
      if (this.currentAlpha < 0.1) this.currentAlpha = 0.1;
      if (this.currentAlpha > 0.85) this.currentAlpha = 0.85;

      // Screen boundary wrap
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;

      // Mouse interactive physics (soft quantum field deflection)
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (1 - dist / mouse.radius) * 3;
        const angle = Math.atan2(dy, dx);
        this.x -= Math.cos(angle) * force;
        this.y -= Math.sin(angle) * force;
      }
    }

    draw() {
      if (this.isSymbol) {
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentAlpha * 0.7})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, this.x, this.y);
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentAlpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }
  }

  function initParticles() {
    particles = [];
    const density = Math.floor((width * height) / 14000);
    const count = Math.min(Math.max(density, 45), 110);
    for (let i = 0; i < count; i++) {
      particles.push(new QuantumParticle());
    }
  }

  function connectParticles() {
    const maxDist = 135;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.22;
          const p1 = particles[i];
          const p2 = particles[j];

          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          grad.addColorStop(0, `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, ${alpha})`);
          grad.addColorStop(1, `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${alpha})`);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    connectParticles();

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', function () {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Touch support for mobile devices
  window.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', function () {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  resize();
  animate();
})();
