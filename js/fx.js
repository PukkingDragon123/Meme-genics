/* ============================================================
   MEME-GENICS — fx.js
   Canvas particles + floating combat text. Pure juice.
   ============================================================ */

const FX = {
  canvas: null, ctx: null,
  parts: [],

  init() {
    this.canvas = document.getElementById('fx-canvas');
    this.ctx = this.canvas.getContext('2d');
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    const loop = () => { this.step(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  },

  step() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const parts = this.parts;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += p.grav;
      p.x += p.vx; p.y += p.vy;
      p.rot += p.vrot;
      p.life--;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      const a = Math.min(1, p.life / 20);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.emoji) {
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
      } else if (p.shape === 'rect') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },

  spawn(x, y, opts = {}) {
    const n = opts.count || 12;
    for (let i = 0; i < n; i++) {
      const ang = opts.angle !== undefined
        ? opts.angle + U.rand(-0.5, 0.5)
        : U.rand(0, Math.PI * 2);
      const spd = U.rand(opts.minSpd ?? 2, opts.maxSpd ?? 7);
      this.parts.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - (opts.up ?? 2),
        grav: opts.grav ?? 0.25,
        rot: U.rand(0, Math.PI * 2),
        vrot: U.rand(-0.2, 0.2),
        life: U.randInt(opts.lifeMin ?? 25, opts.lifeMax ?? 50),
        size: U.rand(opts.sizeMin ?? 5, opts.sizeMax ?? 11),
        color: opts.colors ? U.pick(opts.colors) : '#fff',
        emoji: opts.emojis ? U.pick(opts.emojis) : null,
        shape: opts.shape || 'circle',
      });
    }
    if (this.parts.length > 600) this.parts.splice(0, this.parts.length - 600);
  },

  /* ---------- presets ---------- */
  confetti(x, y, n = 26) {
    this.spawn(x, y, { count: n, shape: 'rect', up: 4, maxSpd: 9, sizeMin: 6, sizeMax: 12, lifeMax: 70,
      colors: ['#ff71ce', '#01cdfe', '#05ffa1', '#fffb96', '#b967ff', '#ff9e3d'] });
  },
  hearts(x, y, n = 7) {
    this.spawn(x, y, { count: n, emojis: ['💖', '💕', '❤️'], up: 3.4, grav: 0.06, maxSpd: 2.5, sizeMin: 13, sizeMax: 22, lifeMax: 60 });
  },
  hit(x, y, n = 12) {
    this.spawn(x, y, { count: n, colors: ['#fff', '#fffb96', '#ff9e3d'], maxSpd: 8, sizeMin: 3, sizeMax: 8, lifeMax: 30 });
  },
  boom(x, y) {
    this.spawn(x, y, { count: 22, colors: ['#ff4d6d', '#ff9e3d', '#fffb96', '#fff'], maxSpd: 10, sizeMin: 5, sizeMax: 14, lifeMax: 40 });
    this.spawn(x, y, { count: 5, emojis: ['💥', '⭐'], maxSpd: 5, sizeMin: 16, sizeMax: 26, lifeMax: 35 });
  },
  heal(x, y) {
    this.spawn(x, y, { count: 10, emojis: ['✨', '💚', '➕'], up: 3, grav: -0.02, maxSpd: 2, sizeMin: 12, sizeMax: 18, lifeMax: 55 });
  },
  poof(x, y) {
    this.spawn(x, y, { count: 14, colors: ['#ddd', '#fff', '#bbb'], maxSpd: 4, up: 1, grav: -0.03, sizeMin: 8, sizeMax: 16, lifeMax: 40 });
  },
  sparkle(x, y, n = 8) {
    this.spawn(x, y, { count: n, emojis: ['✨', '⭐', '💫'], maxSpd: 3, sizeMin: 10, sizeMax: 16, lifeMax: 45 });
  },
  coins(x, y, n = 8) {
    this.spawn(x, y, { count: n, emojis: ['🪙'], up: 5, maxSpd: 5, sizeMin: 14, sizeMax: 20, lifeMax: 55 });
  },
  skull(x, y) {
    this.spawn(x, y, { count: 4, emojis: ['💀', '👻'], up: 3, grav: -0.04, maxSpd: 1.6, sizeMin: 16, sizeMax: 24, lifeMax: 60 });
  },
  rainbow(x, y, n = 10) {
    this.spawn(x, y, { count: n, colors: ['#ff71ce', '#fffb96', '#05ffa1', '#01cdfe', '#b967ff'], maxSpd: 4, grav: 0.05, sizeMin: 5, sizeMax: 9, lifeMax: 35 });
  },
};

/* ============================================================
   Floating combat / feedback text
   ============================================================ */
function floatText(x, y, text, opts = {}) {
  const layer = document.getElementById('float-layer');
  const t = U.el('div', 'float-text', U.esc(text));
  t.style.left = x + 'px';
  t.style.top = y + 'px';
  t.style.color = opts.color || '#fff';
  t.style.fontSize = (opts.size || 26) + 'px';
  if (opts.rot !== false) t.style.rotate = U.rand(-9, 9) + 'deg';
  layer.appendChild(t);
  setTimeout(() => t.remove(), 1150);
}

/* screen-position helper for any element */
function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
