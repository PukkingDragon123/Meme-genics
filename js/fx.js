/* ============================================================
   MEME-GENICS — fx.js
   Canvas pixel particles + floating combat text. Pure juice,
   no emoji — chunky squares in the Balatro palette.
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
    ctx.imageSmoothingEnabled = false;
    const parts = this.parts;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += p.grav;
      p.x += p.vx; p.y += p.vy;
      p.rot += p.vrot;
      p.life--;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      const a = Math.min(1, p.life / 16);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(Math.round(p.x), Math.round(p.y));
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      const s = Math.round(p.size);
      if (p.shape === 'bar') ctx.fillRect(-s, -Math.round(s / 2), s * 2, s);
      else ctx.fillRect(-Math.round(s / 2), -Math.round(s / 2), s, s);   // chunky pixel square
      ctx.restore();
    }
  },

  spawn(x, y, opts = {}) {
    const n = opts.count || 12;
    const colors = opts.colors || ['#ffffff'];
    for (let i = 0; i < n; i++) {
      const ang = opts.angle !== undefined ? opts.angle + U.rand(-0.5, 0.5) : U.rand(0, Math.PI * 2);
      const spd = U.rand(opts.minSpd ?? 2, opts.maxSpd ?? 7);
      this.parts.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - (opts.up ?? 2),
        grav: opts.grav ?? 0.25,
        rot: U.rand(0, Math.PI * 2),
        vrot: U.rand(-0.2, 0.2),
        life: U.randInt(opts.lifeMin ?? 22, opts.lifeMax ?? 46),
        size: U.rand(opts.sizeMin ?? 4, opts.sizeMax ?? 9),
        color: U.pick(colors),
        shape: opts.shape || 'square',
      });
    }
    if (this.parts.length > 600) this.parts.splice(0, this.parts.length - 600);
  },

  /* ---------- presets (palette-driven) ---------- */
  confetti(x, y, n = 24) {
    this.spawn(x, y, { count: n, shape: 'bar', up: 4, maxSpd: 9, sizeMin: 4, sizeMax: 8, lifeMax: 68,
      colors: ['#fe5f55', '#009dff', '#4bc292', '#eac058', '#8867a5', '#ff9a00'] });
  },
  hearts(x, y, n = 7) {
    this.spawn(x, y, { count: n, colors: ['#fe5f55', '#ff8fa5', '#f3b958'], up: 3.2, grav: 0.05, maxSpd: 2.4, sizeMin: 5, sizeMax: 9, lifeMax: 55 });
  },
  hit(x, y, n = 12) {
    this.spawn(x, y, { count: n, colors: ['#ffffff', '#eac058', '#ff9a00'], maxSpd: 8, sizeMin: 3, sizeMax: 6, lifeMax: 28 });
  },
  boom(x, y) {
    this.spawn(x, y, { count: 22, colors: ['#fe5f55', '#ff9a00', '#eac058', '#ffffff'], maxSpd: 10, sizeMin: 4, sizeMax: 9, lifeMax: 38 });
  },
  heal(x, y) {
    this.spawn(x, y, { count: 12, colors: ['#4bc292', '#56a887', '#cdf3e4'], up: 3, grav: -0.02, maxSpd: 2, sizeMin: 4, sizeMax: 8, lifeMax: 52 });
  },
  poof(x, y) {
    this.spawn(x, y, { count: 14, colors: ['#bfc7d5', '#9aa2ab', '#ffffff'], maxSpd: 4, up: 1, grav: -0.03, sizeMin: 5, sizeMax: 10, lifeMax: 38 });
  },
  sparkle(x, y, n = 8) {
    this.spawn(x, y, { count: n, colors: ['#eac058', '#ffffff', '#f3b958'], maxSpd: 3, sizeMin: 3, sizeMax: 6, lifeMax: 42 });
  },
  coins(x, y, n = 8) {
    this.spawn(x, y, { count: n, colors: ['#f3b958', '#eac058', '#c28024'], up: 5, maxSpd: 5, sizeMin: 4, sizeMax: 7, lifeMax: 52 });
  },
  skull(x, y) {
    this.spawn(x, y, { count: 8, colors: ['#bfc7d5', '#9aa2ab', '#5f7377'], up: 3, grav: -0.02, maxSpd: 1.8, sizeMin: 4, sizeMax: 8, lifeMax: 55 });
  },
  rainbow(x, y, n = 10) {
    this.spawn(x, y, { count: n, colors: ['#e0655e', '#d9b45f', '#57b18d', '#4a9fd4', '#8676a4'], maxSpd: 4, grav: 0.05, sizeMin: 3, sizeMax: 7, lifeMax: 34 });
  },
  dust(x, y, n = 9) {
    this.spawn(x, y, { count: n, colors: ['#b7b0a0', '#9aa2ab', '#cdd4d6'], up: 0.3, grav: 0.05, maxSpd: 3, sizeMin: 3, sizeMax: 7, lifeMax: 26, angle: -Math.PI / 2 });
  },
  stars(x, y, n = 6) {
    this.spawn(x, y, { count: n, colors: ['#d9b45f', '#f2f4f4', '#e6c84d'], maxSpd: 4.5, sizeMin: 3, sizeMax: 6, lifeMax: 34 });
  },
  // expanding impact ring (DOM, crisp)
  ring(x, y, color = '#f2f4f4') {
    const layer = document.getElementById('float-layer');
    if (!layer) return;
    const r = U.el('div', 'fx-ring');
    r.style.left = x + 'px'; r.style.top = y + 'px'; r.style.borderColor = color;
    layer.appendChild(r);
    setTimeout(() => r.remove(), 420);
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
