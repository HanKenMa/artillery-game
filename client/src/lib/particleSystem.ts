export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'debris' | 'glow';
}

export class ParticleSystem {
  particles: Particle[] = [];

  createExplosion(x: number, y: number, count: number = 30) {
    const colors = ['#FF1493', '#00FFFF', '#FFD700', '#9D00FF', '#FF6B00'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 3 + Math.random() * 4;

      // Spark particles
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'spark',
      });

      // Glow particles (slower, bigger)
      if (i % 2 === 0) {
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed * 0.5,
          vy: Math.sin(angle) * speed * 0.5,
          life: 1,
          maxLife: 1.5,
          size: 4 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: 'glow',
        });
      }

      // Debris particles (slower fall)
      if (i % 3 === 0) {
        this.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 1,
          life: 1,
          maxLife: 1.2,
          size: 1 + Math.random() * 2,
          color: '#FFD700',
          type: 'debris',
        });
      }
    }
  }

  createScorePopup(x: number, y: number) {
    // Floating score text effect
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 2;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        maxLife: 0.8,
        size: 2,
        color: '#00FF00',
        type: 'spark',
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.life -= 1 / 60; // 60 FPS
      p.x += p.vx;
      p.y += p.vy;

      // Gravity untuk debris
      if (p.type === 'debris') {
        p.vy += 0.15;
      }

      // Friction
      p.vx *= 0.98;
      p.vy *= 0.98;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'glow') {
        // Glow effect dengan shadow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = 'transparent';
    }

    ctx.globalAlpha = 1;
  }

  clear() {
    this.particles = [];
  }

  getActiveParticleCount(): number {
    return this.particles.length;
  }
}
