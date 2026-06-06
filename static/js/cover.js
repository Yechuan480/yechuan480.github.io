(function () {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');

  // Load solar texture
  const sunTexture = new Image();
  sunTexture.src = '20260330_AR14405X14_171A.UTC.00101.png';

  const COLORS = ['#C9A96E', '#D4A574', '#B8956A', '#E8C56D', '#A0784C'];
  const PARTICLE_COUNT = 20;
  const CONNECTION_DIST = 110;
  const MOUSE_RADIUS = 200;
  const MOUSE_STRENGTH = 0.04;

  // Solar system — viewed nearly edge-on
  const TILT_FACTOR = 0.08;
  const ORBIT_ALPHA = 0.05;
  const TRAIL_LENGTH = 25;
  const PLANET_DATA = [
    { name: 'Mercury', radius: 3.0, orbit: 0.10, speed: 0.0016, color: '#c4c0b8' },
    { name: 'Venus',   radius: 4.5, orbit: 0.16, speed: 0.0012, color: '#e6d3a0' },
    { name: 'Earth',   radius: 5.0, orbit: 0.24, speed: 0.0009, color: '#7eb8da' },
    { name: 'Mars',    radius: 3.8, orbit: 0.32, speed: 0.0007, color: '#d4694a' },
    { name: 'Jupiter', radius: 13,  orbit: 0.48, speed: 0.00035, color: '#d4b896' },
    { name: 'Saturn',  radius: 10,  orbit: 0.62, speed: 0.00025, color: '#e8d5a3', hasRing: true },
    { name: 'Uranus',  radius: 7,   orbit: 0.76, speed: 0.00015, color: '#8cc8d8' },
    { name: 'Neptune', radius: 6.5, orbit: 0.88, speed: 0.0001, color: '#5b8eeb' },
  ];

  let width, height;
  let particles = [];
  let sunX, sunY, systemScale;
  let planets = [];
  let mouse = { x: -1000, y: -1000, active: false };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    sunX = Math.min(width, height) * 0.20;
    sunY = Math.min(width, height) * 0.20;
    systemScale = Math.min(width, height) * 11.0;
  }

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 20;
      this.size = Math.random() * 8 + 4;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.vy = (Math.random() - 0.5) * 0.15 - 0.03;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.003;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.opacity = Math.random() * 0.5 + 0.2;
      this._generateAsteroidFeatures();
    }

    _generateAsteroidFeatures() {
      this.hasCrater = Math.random() < 0.5;
      if (this.hasCrater) {
        this.craterAngle = Math.random() * Math.PI * 2;
        this.craterDist = 0.15 + Math.random() * 0.35;
        this.craterR = 0.12 + Math.random() * 0.18;
      }
      this.hasCrater2 = Math.random() < 0.3;
      if (this.hasCrater2) {
        this.crater2Angle = Math.random() * Math.PI * 2;
        this.crater2Dist = 0.1 + Math.random() * 0.3;
        this.crater2R = 0.06 + Math.random() * 0.1;
      }
    }

    update() {
      // Mouse attraction
      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 1) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
      }

      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;

      // Damping to prevent infinite acceleration
      this.vx *= 0.998;
      this.vy *= 0.998;

      // Wrap around edges
      if (this.y < -40) { this.y = height + 40; this.x = Math.random() * width; }
      if (this.y > height + 40) { this.y = -40; this.x = Math.random() * width; }
      if (this.x < -40) this.x = width + 40;
      if (this.x > width + 40) this.x = -40;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      const r = this.size;

      // Main sphere body
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // 3D highlight
      const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.05, 0, 0, r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.03)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Crater 1
      if (this.hasCrater) {
        const cx = Math.cos(this.craterAngle) * this.craterDist * r;
        const cy = Math.sin(this.craterAngle) * this.craterDist * r;
        const cr = this.craterR * r * 0.5;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crater 2
      if (this.hasCrater2) {
        const cx2 = Math.cos(this.crater2Angle) * this.crater2Dist * r;
        const cy2 = Math.sin(this.crater2Angle) * this.crater2Dist * r;
        const cr2 = this.crater2R * r * 0.5;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.arc(cx2, cy2, cr2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // ---- Particle-Particle Elastic Collision ----
  function resolveCollisions() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.size + b.size;

        if (dist < minDist && dist > 0.01) {
          // Normal vector
          const nx = dx / dist;
          const ny = dy / dist;

          // Relative velocity along normal
          const dvx = a.vx - b.vx;
          const dvy = a.vy - b.vy;
          const vn = dvx * nx + dvy * ny;

          // Only resolve if particles are approaching
          if (vn > 0) {
            // Equal mass elastic collision: exchange normal velocity components
            a.vx -= vn * nx;
            a.vy -= vn * ny;
            b.vx += vn * nx;
            b.vy += vn * ny;

            // Separate overlapping particles
            const overlap = minDist - dist;
            const sepX = (overlap / 2 + 0.5) * nx;
            const sepY = (overlap / 2 + 0.5) * ny;
            a.x -= sepX;
            a.y -= sepY;
            b.x += sepX;
            b.y += sepY;
          }
        }
      }
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
          const alpha = (1 - dist / CONNECTION_DIST) * 0.1;
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

  function initSolarSystem() {
    sunX = Math.min(width, height) * 0.20;
    sunY = Math.min(width, height) * 0.20;
    systemScale = Math.min(width, height) * 11.0;
    planets = PLANET_DATA.map(p => ({
      ...p,
      angle: Math.random() * Math.PI * 2,
      trail: [],
    }));
  }

  function drawOrbits() {
    ctx.strokeStyle = `rgba(201, 169, 110, ${ORBIT_ALPHA})`;
    ctx.lineWidth = 0.4;
    for (const p of planets) {
      const rx = p.orbit * systemScale;
      const ry = rx * TILT_FACTOR;
      ctx.beginPath();
      ctx.ellipse(sunX, sunY, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawSun() {
    const sunR = Math.min(width, height) * 0.35;

    // Sun body — real SDO/AIA 171Å texture
    ctx.save();
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.clip();
    if (sunTexture.complete && sunTexture.naturalWidth > 0) {
      const d = sunR * 2;
      ctx.drawImage(sunTexture, sunX - sunR, sunY - sunR, d, d);
    }
    ctx.restore();

    // Soft edge blend — fade black image background into page background
    const blendGrad = ctx.createRadialGradient(sunX, sunY, sunR * 0.78, sunX, sunY, sunR * 1.08);
    blendGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    blendGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.3)');
    blendGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.75)');
    blendGrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = blendGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 1.08, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlanet(p, px, py) {
    // Fading trail
    if (p.trail && p.trail.length > 1) {
      for (let i = 0; i < p.trail.length - 1; i++) {
        const t = p.trail[i];
        const frac = i / p.trail.length;
        const alpha = frac * 0.25;
        const r = p.radius * frac * 0.7;
        if (r < 0.3) continue;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    ctx.save();
    ctx.translate(px, py);

    // Sphere with 3D lighting
    const grad = ctx.createRadialGradient(-p.radius * 0.25, -p.radius * 0.3, p.radius * 0.05, 0, 0, p.radius);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(0.4, p.color);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Saturn's ring
    if (p.hasRing) {
      ctx.save();
      ctx.scale(1, TILT_FACTOR);
      ctx.strokeStyle = 'rgba(212, 165, 116, 0.35)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.radius * 1.7, p.radius * 1.7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(212, 165, 116, 0.18)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.radius * 2.1, p.radius * 2.1, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Planet name label
    const fontSize = Math.max(10, Math.min(p.radius * 1.4, 16));
    ctx.font = `${fontSize}px 'Times New Roman', Georgia, serif`;
    ctx.fillStyle = 'rgba(245, 240, 232, 0.75)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.name, p.radius + 5, 0);

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Solar system background
    drawOrbits();
    drawSun();
    const sunR = Math.min(width, height) * 0.35;
    for (const p of planets) {
      const px = sunX + p.orbit * systemScale * Math.cos(p.angle);
      const py = sunY + p.orbit * systemScale * TILT_FACTOR * Math.sin(p.angle);
      p.trail.push({ x: px, y: py });
      if (p.trail.length > TRAIL_LENGTH) p.trail.shift();
      p.angle += p.speed;
      // Occlusion: planet behind the sun
      const distFromSun = Math.sqrt((px - sunX) ** 2 + (py - sunY) ** 2);
      const behindSun = distFromSun < sunR && Math.sin(p.angle) < 0;
      if (!behindSun) {
        drawPlanet(p, px, py);
      }
    }

    // Update all particles
    for (const p of particles) {
      p.update();
    }

    // Resolve collisions
    resolveCollisions();

    // Draw connections and particles (above solar system)
    drawConnections();
    for (const p of particles) {
      p.draw(ctx);
    }

    requestAnimationFrame(animate);
  }

  // ---- Entrance Animations ----
  function startAnimations() {
    setTimeout(() => {
      document.getElementById('name').classList.add('visible');
    }, 300);

    setTimeout(() => {
      document.getElementById('subtitle').classList.add('visible');
    }, 600);

    setTimeout(() => {
      document.getElementById('enter-btn').classList.add('visible');
      document.getElementById('scroll-hint').classList.add('visible');
    }, 1000);
  }

  // ---- Init ----
  window.addEventListener('resize', () => {
    resize();
    initSolarSystem();
    initParticles();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.active = false;
  });

  resize();
  initSolarSystem();
  initParticles();
  animate();
  startAnimations();

  // ---- Language Toggle ----
  let coverLang = localStorage.getItem('cover-lang') || 'zh';
  function applyCoverLang(lang) {
    coverLang = lang;
    localStorage.setItem('cover-lang', lang);
    document.querySelectorAll('[data-zh][data-en]').forEach(el => {
      el.textContent = el.getAttribute('data-' + lang);
    });
    document.querySelectorAll('[data-cover-lang]').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-cover-lang') === lang);
    });
    document.getElementById('name').classList.toggle('en-font', lang === 'en');
  }
  document.querySelectorAll('[data-cover-lang]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      applyCoverLang(link.getAttribute('data-cover-lang'));
    });
  });
  applyCoverLang(coverLang);
})();
