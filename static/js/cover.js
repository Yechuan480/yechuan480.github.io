(function () {
  // ---- Canvas Particle System ----
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');

  const COLORS = ['#C9A96E', '#D4A574', '#B8956A', '#E8C56D', '#A0784C'];
  const PARTICLE_COUNT = 100;
  const CONNECTION_DIST = 110;
  const MOUSE_RADIUS = 80;

  let width, height;
  let particles = [];
  let mouse = { x: -1000, y: -1000 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 20;
      this.size = Math.random() * 4 + 2;
      this.speedY = Math.random() * 0.3 + 0.1;
      this.speedX = Math.random() * 0.2 - 0.1;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.005;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.opacity = Math.random() * 0.5 + 0.2;
      // 0 = diamond, 1 = triangle
      this.shape = Math.random() > 0.5 ? 0 : 1;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotSpeed;

      // Mouse interaction: gentle repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        this.x += (dx / dist) * force * 1.5;
        this.y += (dy / dist) * force * 1.5;
      }

      // Wrap around edges
      if (this.y < -20) { this.y = height + 20; this.x = Math.random() * width; }
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;

      const s = this.size;
      ctx.beginPath();
      if (this.shape === 0) {
        // Diamond
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.6, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.6, 0);
      } else {
        // Triangle
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.7, s * 0.5);
        ctx.lineTo(-s * 0.7, s * 0.5);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
          ctx.strokeStyle = `rgba(201, 169, 110, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    drawConnections();
    for (const p of particles) {
      p.update();
      p.draw(ctx);
    }
    requestAnimationFrame(animate);
  }

  // ---- Typewriter Effect ----
  const subtitleEl = document.getElementById('subtitle');
  const texts = [
    'Geology Student  ·  Zhejiang University',
    'Cosmochemistry  ·  Meteoritics  ·  Mineralogy',
    '地质学学生  ·  浙江大学'
  ];
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let cursorSpan = null;

  function ensureCursor() {
    if (!cursorSpan) {
      cursorSpan = document.createElement('span');
      cursorSpan.className = 'cursor';
      subtitleEl.appendChild(cursorSpan);
    }
  }

  function typewriter() {
    const currentText = texts[textIndex];

    if (!isDeleting) {
      charIndex++;
      subtitleEl.childNodes.forEach(n => {
        if (n.nodeType === 3 || (n.nodeType === 1 && n.classList && !n.classList.contains('cursor'))) {
          // text node, we rebuild
        }
      });
      // Rebuild text content
      const display = currentText.substring(0, charIndex);
      // Remove all non-cursor children
      while (subtitleEl.firstChild) {
        if (subtitleEl.firstChild === cursorSpan) break;
        subtitleEl.removeChild(subtitleEl.firstChild);
      }
      // Insert text before cursor
      const textNode = document.createTextNode(display);
      if (cursorSpan) {
        subtitleEl.insertBefore(textNode, cursorSpan);
      } else {
        subtitleEl.appendChild(textNode);
      }

      if (charIndex === currentText.length) {
        // Pause at full text, then start deleting
        setTimeout(() => { isDeleting = true; typewriter(); }, 2500);
        ensureCursor();
        return;
      }
    } else {
      charIndex--;
      while (subtitleEl.firstChild) {
        if (subtitleEl.firstChild === cursorSpan) break;
        subtitleEl.removeChild(subtitleEl.firstChild);
      }
      const display = currentText.substring(0, charIndex);
      const textNode = document.createTextNode(display);
      if (cursorSpan) {
        subtitleEl.insertBefore(textNode, cursorSpan);
      } else {
        subtitleEl.appendChild(textNode);
      }

      if (charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(() => typewriter(), 400);
        ensureCursor();
        return;
      }
    }

    ensureCursor();
    const speed = isDeleting ? 30 : 50 + Math.random() * 30;
    setTimeout(typewriter, speed);
  }

  // ---- Entrance Animations ----
  function startAnimations() {
    // Name fade-in after 300ms
    setTimeout(() => {
      document.getElementById('name').classList.add('visible');
    }, 300);

    // Typewriter after 800ms
    setTimeout(() => {
      typewriter();
    }, 800);

    // Enter button and scroll hint after 1200ms
    setTimeout(() => {
      document.getElementById('enter-btn').classList.add('visible');
      document.getElementById('scroll-hint').classList.add('visible');
    }, 1200);
  }

  // ---- Init ----
  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: true });

  resize();
  initParticles();
  animate();
  startAnimations();
})();
