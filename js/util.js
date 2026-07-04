/* ============================================================
   MEME-GENICS — util.js
   RNG, math, DOM helpers, tooltips, toasts, modals
   ============================================================ */

const U = {
  // ---------- random ----------
  rand(min, max) { return Math.random() * (max - min) + min; },
  randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  pickWeighted(entries) {
    // entries: [{v, w}] -> v
    let total = 0;
    for (const e of entries) total += e.w;
    let roll = Math.random() * total;
    for (const e of entries) { roll -= e.w; if (roll <= 0) return e.v; }
    return entries[entries.length - 1].v;
  },
  chance(p) { return Math.random() < p; },
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  gauss(mean, sd) {
    // Box–Muller
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  },

  // ---------- math ----------
  clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },
  lerp(a, b, t) { return a + (b - a) * t; },

  // ---------- ids ----------
  _idCounter: 0,
  uid(prefix) { return `${prefix || 'id'}_${Date.now().toString(36)}_${(U._idCounter++).toString(36)}`; },

  // ---------- DOM ----------
  el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  },
  esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  },
  qs(sel, root) { return (root || document).querySelector(sel); },

  wait(ms) { return new Promise(r => setTimeout(r, ms)); },
};

/* ============================================================
   Tooltip
   ============================================================ */
const Tooltip = {
  node: null,
  init() {
    this.node = document.getElementById('tooltip');
    document.addEventListener('mousemove', e => {
      if (!this.node.classList.contains('hidden')) this.place(e.clientX, e.clientY);
    });
  },
  show(html, x, y) {
    this.node.innerHTML = html;
    this.node.classList.remove('hidden');
    this.place(x, y);
  },
  place(x, y) {
    const r = this.node.getBoundingClientRect();
    let px = x + 16, py = y + 16;
    if (px + r.width > window.innerWidth - 8) px = x - r.width - 12;
    if (py + r.height > window.innerHeight - 8) py = y - r.height - 12;
    this.node.style.left = px + 'px';
    this.node.style.top = py + 'px';
  },
  hide() { this.node.classList.add('hidden'); },
  // convenience binder
  bind(el, htmlFn) {
    el.addEventListener('mouseenter', e => Tooltip.show(typeof htmlFn === 'function' ? htmlFn() : htmlFn, e.clientX, e.clientY));
    el.addEventListener('mouseleave', () => Tooltip.hide());
    el.addEventListener('mousedown', () => Tooltip.hide());
  }
};

/* ============================================================
   Toasts
   ============================================================ */
function toast(html, ms = 3200, icon) {
  const box = document.getElementById('toasts');
  const ico = (icon && typeof Icon !== 'undefined') ? Icon.ico(icon, 15) : '';
  const t = U.el('div', 'toast', ico + '<span>' + html + '</span>');
  box.appendChild(t);
  while (box.children.length > 5) box.firstChild.remove();
  setTimeout(() => {
    t.classList.add('leaving');
    setTimeout(() => t.remove(), 320);
  }, ms);
}

/* ============================================================
   Modal (single-slot; queued would be overkill)
   opts: { title, bodyHTML | bodyNode, actions: [{label, cls, fn, keep}], noClose }
   ============================================================ */
const Modal = {
  layer: null,
  _queue: [],
  init() { this.layer = document.getElementById('modal-layer'); },
  show(opts) {
    // opts.defer: if a modal is already open, wait in line instead of replacing it
    if (opts.defer && !this.layer.classList.contains('hidden')) {
      this._queue.push(opts);
      return null;
    }
    this.layer.innerHTML = '';
    this.layer.classList.remove('hidden');
    const m = U.el('div', 'modal');
    if (opts.title) m.appendChild(U.el('div', 'modal-head', opts.title));
    const body = U.el('div', 'modal-body');
    if (opts.bodyNode) body.appendChild(opts.bodyNode);
    else body.innerHTML = opts.bodyHTML || '';
    m.appendChild(body);
    const acts = U.el('div', 'modal-actions');
    (opts.actions || [{ label: 'OK', cls: 'good' }]).forEach(a => {
      const b = U.el('button', 'chunky-btn ' + (a.cls || ''), a.label);
      b.onclick = () => {
        if (!a.keep) Modal.hide();
        if (a.fn) a.fn();
        if (typeof SFX !== 'undefined') SFX.play('click');
      };
      acts.appendChild(b);
    });
    m.appendChild(acts);
    this.layer.appendChild(m);
    return m;
  },
  hide() {
    this.layer.classList.add('hidden');
    this.layer.innerHTML = '';
    const next = this._queue.shift();
    if (next) setTimeout(() => Modal.show(next), 180);
  }
};

/* ============================================================
   Big meme banner ("FIGHT!", "VICTORY!", "F")
   ============================================================ */
function bigBanner(text, ms = 1400) {
  const b = document.getElementById('big-banner');
  b.innerHTML = '';
  b.classList.remove('hidden');
  b.appendChild(U.el('div', 'banner-text', text));
  clearTimeout(bigBanner._t);
  bigBanner._t = setTimeout(() => b.classList.add('hidden'), ms);
}

/* ============================================================
   Screen shake
   ============================================================ */
const Shake = {
  power: 0,
  init() {
    const root = document.getElementById('shake-root');
    const step = () => {
      if (Shake.power > 0.4) {
        const p = Shake.power;
        root.style.transform = `translate(${U.rand(-p, p)}px, ${U.rand(-p, p)}px) rotate(${U.rand(-p, p) * 0.04}deg)`;
        Shake.power *= 0.88;
      } else if (root.style.transform) {
        root.style.transform = '';
        Shake.power = 0;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },
  hit(power) { Shake.power = Math.min(26, Shake.power + power); }
};
