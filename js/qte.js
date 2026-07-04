/* ============================================================
   MEME-GENICS — qte.js
   20 skill-based mini-games. Every one resolves to a grade
   ('miss' | 'ok' | 'good' | 'perfect') so combat can treat
   attacks and parries uniformly. Each game auto-resolves on
   timeout and always cleans up its listeners / rafs.
   ============================================================ */

const QTE = {
  // canonical list — combat spreads these across attacks & parries
  KINDS: [
    'timing', 'tracer', 'quickdraw', 'mash', 'overload', 'flurry',
    'bullseye', 'pulse', 'zen', 'combo', 'reaction', 'sequence',
    'rhythm', 'aim', 'stopwatch', 'catch', 'dodge', 'whack',
    'balance', 'spinner',
  ],
  // parries want short, reactive games
  PARRY_KINDS: ['reaction', 'timing', 'bullseye', 'dodge', 'tracer', 'quickdraw', 'spinner', 'aim'],
  // gentle, rhythmic games suit heals/support
  SUPPORT_KINDS: ['zen', 'pulse', 'timing', 'rhythm', 'balance'],

  NICE: {
    timing: 'STRIKE', tracer: 'INTERCEPT', quickdraw: 'QUICKDRAW', mash: 'FLURRY',
    overload: 'OVERLOAD', flurry: 'RAPID-FIRE', bullseye: 'FOCUS', pulse: 'DOUBLE TAP',
    zen: 'CHANNEL', combo: 'COMBO', reaction: 'COUNTER', sequence: 'INPUT CHAIN',
    rhythm: 'BEATDOWN', aim: 'SNIPE', stopwatch: 'PRECISION', catch: 'SNATCH',
    dodge: 'WEAVE', whack: 'PURGE', balance: 'STEADY', spinner: 'ROULETTE',
  },
  SUBS: {
    timing: 'stop it dead centre', tracer: 'catch it in the gate', quickdraw: 'wait — then strike',
    mash: 'mash to fill the bar', overload: 'out-mash the decay', flurry: 'alternate left / right',
    bullseye: 'tap when the ring lines up', pulse: 'nail both rings', zen: 'release at full bloom',
    combo: 'time every ring', reaction: 'strike the instant it flashes', sequence: 'repeat the chain',
    rhythm: 'tap on every beat', aim: 'click the target — fast', stopwatch: 'stop on the mark',
    catch: 'grab it high', dodge: 'click the safe node', whack: 'hit the lit pads',
    balance: 'keep the needle centred', spinner: 'stop in the gold',
  },

  /* ---------- grading helpers ---------- */
  gradeBy(d, tol) {            // d = distance from ideal, tol = "ok" boundary
    if (d <= tol * 0.28) return 'perfect';
    if (d <= tol * 0.60) return 'good';
    if (d <= tol) return 'ok';
    return 'miss';
  },
  gradeR(r) {                  // r = 0..1 performance ratio
    if (r >= 0.90) return 'perfect';
    if (r >= 0.68) return 'good';
    if (r >= 0.40) return 'ok';
    return 'miss';
  },

  _hash(s) { let h = 0; s = '' + s; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; },
  forAbility(ab, id) {
    if (ab && ab.qte && this.KINDS.includes(ab.qte)) return ab.qte;
    if (ab && ab.kind === 'heal') return this.SUPPORT_KINDS[this._hash(id) % this.SUPPORT_KINDS.length];
    return this.KINDS[this._hash(id) % this.KINDS.length];
  },
  forParry(seed) { return this.PARRY_KINDS[this._hash(seed) % this.PARRY_KINDS.length]; },

  layerEl() { return document.getElementById('qte-layer'); },

  /* ---------- shared shell ---------- */
  _begin(kind, opts, done) {
    const layer = this.layerEl();
    const wrap = U.el('div', 'qte qm qm-' + kind + (opts.danger ? ' danger' : ''));
    wrap.innerHTML = `<div class="qte-label">${opts.label || this.NICE[kind] || ''}</div>
      <div class="qte-sub">${opts.sub || this.SUBS[kind] || ''}</div>
      <div class="qm-stage"></div>`;
    layer.innerHTML = '';
    layer.appendChild(wrap);
    const stage = wrap.querySelector('.qm-stage');
    const offs = []; let ended = false, timer = 0;
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
    const cleanup = fn => offs.push(fn);
    const after = (ms, fn) => { timer = setTimeout(fn, ms); cleanup(() => clearTimeout(timer)); };
    const finish = grade => {
      if (ended) return; ended = true;
      offs.forEach(f => { try { f(); } catch (e) { } });
      wrap.classList.add('done', 'g-' + grade);
      wrap.appendChild(U.el('div', 'qte-result r-' + grade, grade.toUpperCase()));
      SFX.play(grade === 'perfect' ? 'crit' : grade === 'miss' ? 'error' : 'select');
      setTimeout(() => { wrap.remove(); done(grade); }, 280);
    };
    return { wrap, stage, on, cleanup, after, finish, isEnded: () => ended };
  },

  /* ---------- dispatcher ---------- */
  play(kind, opts = {}) {
    const fn = this['g_' + kind] || this.g_timing;
    return new Promise(resolve => {
      let settled = false;
      const done = g => { if (!settled) { settled = true; resolve(g); } };
      try { fn.call(this, opts || {}, done); }
      catch (e) { console.warn('QTE error in', kind, e); done('ok'); }
    });
  },

  /* ============================================================
     1. TIMING — sweep a marker, stop it dead centre
     ============================================================ */
  g_timing(opts, done) {
    const B = this._begin('timing', opts, done);
    const tol = opts.sweet || 20, speed = opts.speed || 118;
    B.stage.innerHTML = `<div class="qm-track"><div class="qm-sweet" style="width:${tol}%;left:${50 - tol / 2}%"></div><div class="qm-marker"></div></div>`;
    const marker = B.stage.querySelector('.qm-marker');
    let pos = 0, dir = 1, last = performance.now(), raf = 0;
    const step = now => { const dt = (now - last) / 1000; last = now; pos += dir * speed * dt; if (pos >= 100) { pos = 100; dir = -1; } else if (pos <= 0) { pos = 0; dir = 1; } marker.style.left = pos + '%'; raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); B.cleanup(() => cancelAnimationFrame(raf));
    const tap = () => B.finish(this.gradeBy(Math.abs(pos - 50), tol));
    B.on(document, 'keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(); } });
    B.on(B.wrap, 'pointerdown', tap);
    B.after(opts.time || 2600, () => B.finish('miss'));
  },

  /* ============================================================
     2. TRACER — a fast bolt; catch it in an off-centre gate
     ============================================================ */
  g_tracer(opts, done) {
    const B = this._begin('tracer', opts, done);
    const tol = 15, gate = 72, speed = 210;
    B.stage.innerHTML = `<div class="qm-track"><div class="qm-sweet" style="width:${tol}%;left:${gate - tol / 2}%"></div><div class="qm-marker fast"></div></div>`;
    const marker = B.stage.querySelector('.qm-marker');
    let pos = 0, dir = 1, last = performance.now(), raf = 0;
    const step = now => { const dt = (now - last) / 1000; last = now; pos += dir * speed * dt; if (pos >= 100) { pos = 100; dir = -1; } else if (pos <= 0) { pos = 0; dir = 1; } marker.style.left = pos + '%'; raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); B.cleanup(() => cancelAnimationFrame(raf));
    const tap = () => B.finish(this.gradeBy(Math.abs(pos - gate), tol));
    B.on(document, 'keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(); } });
    B.on(B.wrap, 'pointerdown', tap);
    B.after(opts.time || 2400, () => B.finish('miss'));
  },

  /* ============================================================
     3. QUICKDRAW — hold... then a single fast sweep to nail
     ============================================================ */
  g_quickdraw(opts, done) {
    const B = this._begin('quickdraw', opts, done);
    B.stage.innerHTML = `<div class="qm-draw">READY...</div>`;
    const box = B.stage.querySelector('.qm-draw');
    let phase = 0, pos = 0, dir = 1, raf = 0, last = 0;
    const tol = 16;
    const go = () => {
      phase = 1; box.className = 'qm-draw hot'; box.textContent = ''; SFX.play('zap');
      box.innerHTML = `<div class="qm-track"><div class="qm-sweet" style="width:${tol}%;left:${50 - tol / 2}%"></div><div class="qm-marker fast"></div></div>`;
      const marker = box.querySelector('.qm-marker'); last = performance.now();
      const step = now => { const dt = (now - last) / 1000; last = now; pos += dir * 235 * dt; if (pos >= 100) { pos = 100; dir = -1; } else if (pos <= 0) { pos = 0; dir = 1; } marker.style.left = pos + '%'; raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    };
    const dly = 500 + Math.random() * 900;
    B.after(dly, go); B.cleanup(() => cancelAnimationFrame(raf));
    const tap = () => { if (phase === 0) { B.finish('miss'); return; } B.finish(this.gradeBy(Math.abs(pos - 50), tol)); };
    B.on(document, 'keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(); } });
    B.on(B.wrap, 'pointerdown', tap);
    B.after((opts.time || 3200), () => B.finish(phase ? 'ok' : 'miss'));
  },

  /* ============================================================
     4. MASH — hammer to fill the bar before time runs out
     ============================================================ */
  g_mash(opts, done) {
    const B = this._begin('mash', opts, done);
    B.stage.innerHTML = `<div class="qm-track tall"><div class="qm-fill"></div></div>`;
    const fill = B.stage.querySelector('.qm-fill');
    const need = opts.target || 14; let n = 0;
    const bump = () => { n++; fill.style.width = Math.min(100, n / need * 100) + '%'; SFX.play('click'); fill.classList.remove('pump'); void fill.offsetWidth; fill.classList.add('pump'); };
    B.on(document, 'keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); bump(); } });
    B.on(B.wrap, 'pointerdown', bump);
    B.after(opts.time || 1600, () => B.finish(this.gradeR(Math.min(1, n / need))));
  },

  /* ============================================================
     5. OVERLOAD — the bar leaks; out-mash the decay
     ============================================================ */
  g_overload(opts, done) {
    const B = this._begin('overload', opts, done);
    B.stage.innerHTML = `<div class="qm-track tall"><div class="qm-goal"></div><div class="qm-fill hot"></div></div>`;
    const fill = B.stage.querySelector('.qm-fill');
    let v = 8, raf = 0, last = performance.now();
    const step = now => { const dt = (now - last) / 1000; last = now; v = Math.max(0, v - 34 * dt); fill.style.width = v + '%'; raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); B.cleanup(() => cancelAnimationFrame(raf));
    const bump = () => { v = Math.min(100, v + 9); SFX.play('click'); };
    B.on(document, 'keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); bump(); } });
    B.on(B.wrap, 'pointerdown', bump);
    B.after(opts.time || 2200, () => B.finish(this.gradeR(v / 100)));
  },

  /* ============================================================
     6. FLURRY — alternate two inputs as fast as you can
     ============================================================ */
  g_flurry(opts, done) {
    const B = this._begin('flurry', opts, done);
    B.stage.innerHTML = `<div class="qm-flurry"><button class="qm-key" data-k="L">◄</button><div class="qm-flurry-bar"><div class="qm-fill"></div></div><button class="qm-key" data-k="R">►</button></div>`;
    const fill = B.stage.querySelector('.qm-fill');
    const need = opts.target || 16; let n = 0, side = null;
    const hit = s => { if (s === side) return; side = s; n++; fill.style.width = Math.min(100, n / need * 100) + '%'; SFX.play('click'); B.stage.querySelectorAll('.qm-key').forEach(k => k.classList.toggle('lit', k.dataset.k === s)); };
    B.on(document, 'keydown', e => { if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); hit('L'); } else if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); hit('R'); } });
    B.stage.querySelectorAll('.qm-key').forEach(k => B.on(k, 'pointerdown', ev => { ev.stopPropagation(); hit(k.dataset.k); }));
    B.after(opts.time || 2000, () => B.finish(this.gradeR(Math.min(1, n / need))));
  },

  /* ============================================================
     7. BULLSEYE — a ring shrinks; tap when it hits the target
     ============================================================ */
  g_bullseye(opts, done) {
    const B = this._begin('bullseye', opts, done);
    B.stage.innerHTML = `<div class="qm-rings"><div class="qm-target"></div><div class="qm-ring"></div></div>`;
    const ring = B.stage.querySelector('.qm-ring');
    const targetR = 26, tol = 14; let r = 90, raf = 0, last = performance.now();
    const step = now => { const dt = (now - last) / 1000; last = now; r -= 62 * dt; if (r < 6) r = 6; ring.style.width = ring.style.height = (r * 2) + 'px'; raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); B.cleanup(() => cancelAnimationFrame(raf));
    const tap = () => B.finish(this.gradeBy(Math.abs(r - targetR), tol));
    B.on(document, 'keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(); } });
    B.on(B.wrap, 'pointerdown', tap);
    B.after(opts.time || 2400, () => B.finish('miss'));
  },

  /* ============================================================
     8. PULSE — two shrinking rings back to back
     ============================================================ */
  g_pulse(opts, done) { this._ringSeq('pulse', 2, opts, done); },
  /* 10. COMBO — three quick rings */
  g_combo(opts, done) { this._ringSeq('combo', 3, opts, done); },
  _ringSeq(kind, count, opts, done) {
    const B = this._begin(kind, opts, done);
    B.stage.innerHTML = `<div class="qm-rings"><div class="qm-target"></div><div class="qm-ring"></div><div class="qm-pips"></div></div>`;
    const ring = B.stage.querySelector('.qm-ring'), pipBox = B.stage.querySelector('.qm-pips');
    for (let i = 0; i < count; i++) pipBox.appendChild(U.el('div', 'qm-pip'));
    const pips = [...pipBox.children];
    const targetR = 24, tol = 15, speed = kind === 'combo' ? 96 : 74;
    let idx = 0, r = 82, raf = 0, last = performance.now(); const scores = [];
    const reset = () => { r = 82; };
    const step = now => { const dt = (now - last) / 1000; last = now; r -= speed * dt; if (r < 5) { score(tol + 1); } ring.style.width = ring.style.height = (r * 2) + 'px'; raf = requestAnimationFrame(step); };
    const score = d => {
      scores.push(Math.min(d, tol + 1)); if (pips[idx]) pips[idx].classList.add(d <= tol ? 'good' : 'bad');
      idx++;
      if (idx >= count) { cancelAnimationFrame(raf); const avg = scores.reduce((a, b) => a + b, 0) / scores.length; B.finish(this.gradeBy(avg, tol)); }
      else reset();
    };
    raf = requestAnimationFrame(step); B.cleanup(() => cancelAnimationFrame(raf));
    const tap = () => score(Math.abs(r - targetR));
    B.on(document, 'keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(); } });
    B.on(B.wrap, 'pointerdown', tap);
    B.after(opts.time || 3600, () => { while (idx < count) score(tol + 1); });
  },

  /* ============================================================
     9. ZEN — a bloom expands then wilts; release at full bloom
     ============================================================ */
  g_zen(opts, done) {
    const B = this._begin('zen', opts, done);
    B.stage.innerHTML = `<div class="qm-rings"><div class="qm-bloom"></div></div>`;
    const bloom = B.stage.querySelector('.qm-bloom');
    let t = 0, raf = 0, last = performance.now(); const period = 1.6;
    const step = now => { const dt = (now - last) / 1000; last = now; t += dt; const s = Math.sin((t / period) * Math.PI); const size = 20 + Math.max(0, s) * 78; bloom.style.width = bloom.style.height = size + 'px'; bloom.style.opacity = 0.4 + Math.max(0, s) * 0.6; raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); B.cleanup(() => cancelAnimationFrame(raf));
    const tap = () => { const phase = (t / period) % 2; const d = Math.abs(phase - 0.5); B.finish(this.gradeBy(d, 0.34)); };
    B.on(document, 'keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(); } });
    B.on(B.wrap, 'pointerdown', tap);
    B.after(opts.time || 2600, () => B.finish('ok'));
  },

  /* ============================================================
     11. REACTION — wait for the flash, then strike (no early!)
     ============================================================ */
  g_reaction(opts, done) {
    const B = this._begin('reaction', opts, done);
    B.stage.innerHTML = `<div class="qm-react wait">WAIT</div>`;
    const box = B.stage.querySelector('.qm-react');
    let armed = false, goT = 0;
    const go = () => { armed = true; goT = performance.now(); box.className = 'qm-react go'; box.textContent = 'NOW!'; SFX.play('zap'); };
    B.after(600 + Math.random() * 1100, go);
    const tap = () => {
      if (!armed) { B.finish('miss'); return; }
      const rt = performance.now() - goT;      // reaction time (ms)
      B.finish(rt < 260 ? 'perfect' : rt < 420 ? 'good' : rt < 650 ? 'ok' : 'miss');
    };
    B.on(document, 'keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(); } });
    B.on(B.wrap, 'pointerdown', tap);
    B.after(opts.time || 3400, () => B.finish(armed ? 'ok' : 'miss'));
  },

  /* ============================================================
     12. SEQUENCE — memorise a chain of directions, repeat it
     ============================================================ */
  g_sequence(opts, done) {
    const B = this._begin('sequence', opts, done);
    const dirs = ['up', 'down', 'left', 'right'];
    const glyph = { up: '▲', down: '▼', left: '◄', right: '►' };
    const len = opts.len || 4;
    const seq = Array.from({ length: len }, () => dirs[Math.floor(Math.random() * 4)]);
    B.stage.innerHTML = `<div class="qm-seq-show"></div>
      <div class="qm-pad">
        <button class="qm-dir up" data-d="up">▲</button>
        <div class="qm-pad-mid"><button class="qm-dir left" data-d="left">◄</button><button class="qm-dir right" data-d="right">►</button></div>
        <button class="qm-dir down" data-d="down">▼</button>
      </div>`;
    const show = B.stage.querySelector('.qm-seq-show');
    show.innerHTML = seq.map(d => `<span class="qm-seq-g">${glyph[d]}</span>`).join('');
    const gEls = [...show.children];
    let phase = 0, i = 0, correct = 0;
    // flash the chain
    seq.forEach((d, k) => B.after(300 + k * 460, () => { gEls[k].classList.add('flash'); SFX.play('click'); if (k === seq.length - 1) B.after(460, () => { phase = 1; show.classList.add('go'); }); }));
    const press = d => {
      if (phase !== 1) return;
      if (d === seq[i]) { correct++; gEls[i].classList.add('hit'); SFX.play('select'); i++; if (i >= len) B.finish(this.gradeR(correct / len)); }
      else { gEls[i].classList.add('bad'); B.finish(this.gradeR(correct / len)); }
    };
    B.stage.querySelectorAll('.qm-dir').forEach(btn => B.on(btn, 'pointerdown', ev => { ev.stopPropagation(); press(btn.dataset.d); }));
    B.on(document, 'keydown', e => {
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right' };
      if (map[e.code]) { e.preventDefault(); press(map[e.code]); }
    });
    B.after(opts.time || (1600 + len * 460 + 3000), () => B.finish(this.gradeR(correct / len)));
  },

  /* ============================================================
     13. RHYTHM — three notes drop to the line; tap on the beat
     ============================================================ */
  g_rhythm(opts, done) {
    const B = this._begin('rhythm', opts, done);
    B.stage.innerHTML = `<div class="qm-lane"><div class="qm-hitline"></div><div class="qm-notes"></div></div>`;
    const notes = B.stage.querySelector('.qm-notes');
    const N = opts.notes || 3, travel = 1100, gap = 640;
    const list = [];
    for (let k = 0; k < N; k++) { const n = U.el('div', 'qm-note'); notes.appendChild(n); list.push({ el: n, at: 700 + k * gap, hit: false }); }
    const t0 = performance.now(); let raf = 0; const errs = [];
    const step = now => {
      const t = now - t0;
      for (const nt of list) { if (nt.hit) continue; const p = (t - (nt.at - travel)) / travel; nt.el.style.top = Math.min(100, Math.max(-10, p * 100)) + '%'; if (t > nt.at + 260) { nt.hit = true; nt.el.classList.add('miss'); errs.push(260); } }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step); B.cleanup(() => cancelAnimationFrame(raf));
    const tap = () => {
      const t = performance.now() - t0;
      let best = null, bd = 1e9;
      for (const nt of list) if (!nt.hit) { const d = Math.abs(t - nt.at); if (d < bd) { bd = d; best = nt; } }
      if (best && bd < 300) { best.hit = true; best.el.classList.add('hit'); errs.push(bd); SFX.play('click'); if (list.every(n => n.hit)) { cancelAnimationFrame(raf); const avg = errs.reduce((a, b) => a + b, 0) / errs.length; B.finish(this.gradeBy(avg, 220)); } }
    };
    B.on(document, 'keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(); } });
    B.on(B.wrap, 'pointerdown', tap);
    B.after(opts.time || (900 + N * gap + 900), () => { const e = errs.length ? errs.reduce((a, b) => a + b, 0) / errs.length : 300; B.finish(this.gradeBy(e, 220)); });
  },

  /* ============================================================
     14. AIM — a target blinks in; click it, fast
     ============================================================ */
  g_aim(opts, done) {
    const B = this._begin('aim', opts, done);
    B.stage.innerHTML = `<div class="qm-field"></div>`;
    const field = B.stage.querySelector('.qm-field');
    let dot = null, shownAt = 0, armed = false;
    B.after(400 + Math.random() * 800, () => {
      dot = U.el('div', 'qm-dot'); dot.style.left = (12 + Math.random() * 76) + '%'; dot.style.top = (14 + Math.random() * 66) + '%';
      field.appendChild(dot); shownAt = performance.now(); armed = true; SFX.play('pop');
    });
    B.on(field, 'pointerdown', ev => {
      ev.stopPropagation();
      if (!armed) { B.finish('miss'); return; }     // clicked too early
      const rt = performance.now() - shownAt;
      const r = dot.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dist = Math.hypot(ev.clientX - cx, ev.clientY - cy);
      if (dist > r.width * 1.4) { B.finish('ok'); return; }
      B.finish(rt < 340 ? 'perfect' : rt < 560 ? 'good' : 'ok');
    });
    B.after(opts.time || 2800, () => B.finish(armed ? 'ok' : 'miss'));
  },

  /* ============================================================
     15. STOPWATCH — stop the clock on the target time
     ============================================================ */
  g_stopwatch(opts, done) {
    const B = this._begin('stopwatch', opts, done);
    const target = opts.mark || (0.8 + Math.random() * 0.9);
    B.stage.innerHTML = `<div class="qm-watch"><div class="qm-watch-target">STOP @ ${target.toFixed(2)}s</div><div class="qm-watch-time">0.00</div></div>`;
    const disp = B.stage.querySelector('.qm-watch-time');
    const t0 = performance.now(); let raf = 0;
    const step = now => { disp.textContent = ((now - t0) / 1000).toFixed(2); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); B.cleanup(() => cancelAnimationFrame(raf));
    const tap = () => { const t = (performance.now() - t0) / 1000; B.finish(this.gradeBy(Math.abs(t - target), 0.30)); };
    B.on(document, 'keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(); } });
    B.on(B.wrap, 'pointerdown', tap);
    B.after(opts.time || (target * 1000 + 2200), () => B.finish('miss'));
  },

  /* ============================================================
     16. CATCH — an orb drops; snatch it as high as you can
     ============================================================ */
  g_catch(opts, done) {
    const B = this._begin('catch', opts, done);
    B.stage.innerHTML = `<div class="qm-field short"><div class="qm-orb"></div></div>`;
    const orb = B.stage.querySelector('.qm-orb');
    let y = 0, raf = 0, last = performance.now(); const dur = 1.25;
    const step = now => { const dt = (now - last) / 1000; last = now; y += dt / dur; orb.style.top = Math.min(100, y * 100) + '%'; if (y >= 1) { cancelAnimationFrame(raf); B.finish('miss'); return; } raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); B.cleanup(() => cancelAnimationFrame(raf));
    const tap = () => B.finish(this.gradeR(1 - y));   // higher grab = better
    B.on(document, 'keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(); } });
    B.on(B.wrap, 'pointerdown', tap);
  },

  /* ============================================================
     17. DODGE — one safe node drifts among hazards; click it
     ============================================================ */
  g_dodge(opts, done) {
    const B = this._begin('dodge', opts, done);
    B.stage.innerHTML = `<div class="qm-field"></div>`;
    const field = B.stage.querySelector('.qm-field');
    const nodes = [];
    const mk = safe => { const n = U.el('div', 'qm-node' + (safe ? ' safe' : '')); n.x = 10 + Math.random() * 80; n.y = 10 + Math.random() * 70; n.vx = (Math.random() * 2 - 1) * 30; n.vy = (Math.random() * 2 - 1) * 30; n.safe = safe; field.appendChild(n); nodes.push(n); return n; };
    for (let i = 0; i < 4; i++) mk(false); mk(true);
    const t0 = performance.now(); let raf = 0, last = performance.now();
    const step = now => { const dt = (now - last) / 1000; last = now; for (const n of nodes) { n.x += n.vx * dt; n.y += n.vy * dt; if (n.x < 4 || n.x > 92) n.vx *= -1; if (n.y < 4 || n.y > 84) n.vy *= -1; n.x = Math.max(4, Math.min(92, n.x)); n.y = Math.max(4, Math.min(84, n.y)); n.style.left = n.x + '%'; n.style.top = n.y + '%'; } raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); B.cleanup(() => cancelAnimationFrame(raf));
    nodes.forEach(n => B.on(n, 'pointerdown', ev => { ev.stopPropagation(); if (n.safe) { const rt = performance.now() - t0; B.finish(rt < 900 ? 'perfect' : rt < 1500 ? 'good' : 'ok'); } else B.finish('miss'); }));
    B.after(opts.time || 3000, () => B.finish('miss'));
  },

  /* ============================================================
     18. WHACK — pads light up; hit the lit one, repeat
     ============================================================ */
  g_whack(opts, done) {
    const B = this._begin('whack', opts, done);
    const PADS = 6, ROUNDS = opts.rounds || 5;
    B.stage.innerHTML = `<div class="qm-whack">${Array.from({ length: PADS }, () => '<button class="qm-whpad"></button>').join('')}</div>`;
    const pads = [...B.stage.querySelectorAll('.qm-whpad')];
    let round = 0, hits = 0, live = -1, raf = 0, timer = 0;
    const next = () => {
      if (round >= ROUNDS) { finishNow(); return; }
      round++; pads.forEach(p => p.classList.remove('lit')); live = Math.floor(Math.random() * PADS); pads[live].classList.add('lit'); SFX.play('pop');
      timer = setTimeout(next, 720); B.cleanup(() => clearTimeout(timer));
    };
    const finishNow = () => B.finish(this.gradeR(hits / ROUNDS));
    pads.forEach((p, i) => B.on(p, 'pointerdown', ev => { ev.stopPropagation(); if (i === live) { hits++; p.classList.add('bonk'); live = -1; SFX.play('click'); } }));
    B.after(300, next);
    B.after(opts.time || (ROUNDS * 760 + 900), finishNow);
  },

  /* ============================================================
     19. BALANCE — a needle drifts; nudge it to stay centred
     ============================================================ */
  g_balance(opts, done) {
    const B = this._begin('balance', opts, done);
    B.stage.innerHTML = `<div class="qm-balance"><div class="qm-bal-zone"></div><div class="qm-bal-needle"></div></div><div class="qm-bal-keys"><button class="qm-key" data-k="L">◄ push</button><button class="qm-key" data-k="R">push ►</button></div>`;
    const needle = B.stage.querySelector('.qm-bal-needle');
    let pos = 0, vel = (Math.random() * 2 - 1) * 8, raf = 0, last = performance.now();
    let inZone = 0, total = 0;
    const step = now => {
      const dt = (now - last) / 1000; last = now;
      vel += (Math.random() * 2 - 1) * 34 * dt;      // wander
      vel += -pos * 0.6 * dt;                          // mild pull to prevent runaway
      pos += vel * dt * 10; pos = Math.max(-50, Math.min(50, pos));
      needle.style.left = (50 + pos) + '%';
      total += dt; if (Math.abs(pos) < 12) inZone += dt;
      needle.classList.toggle('good', Math.abs(pos) < 12);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step); B.cleanup(() => cancelAnimationFrame(raf));
    const push = d => { vel += d * 9; SFX.play('click'); };
    B.on(document, 'keydown', e => { if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); push(-1); } else if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); push(1); } });
    B.stage.querySelectorAll('.qm-key').forEach(k => B.on(k, 'pointerdown', ev => { ev.stopPropagation(); push(k.dataset.k === 'L' ? -1 : 1); }));
    B.after(opts.time || 2400, () => B.finish(this.gradeR(total ? inZone / total : 0)));
  },

  /* ============================================================
     20. SPINNER — a pointer sweeps a wheel; stop it in the gold
     ============================================================ */
  g_spinner(opts, done) {
    const B = this._begin('spinner', opts, done);
    B.stage.innerHTML = `<div class="qm-wheel"><div class="qm-wedge"></div><div class="qm-needle"></div></div>`;
    const needle = B.stage.querySelector('.qm-needle');
    const wedge = B.stage.querySelector('.qm-wedge');
    const goldCenter = 0, half = 24;                  // gold wedge at top (0deg), ±24deg
    wedge.style.transform = `rotate(${goldCenter - half}deg)`;
    let ang = 180, raf = 0, last = performance.now(); const spd = 240;
    const step = now => { const dt = (now - last) / 1000; last = now; ang = (ang + spd * dt) % 360; needle.style.transform = `rotate(${ang}deg)`; raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); B.cleanup(() => cancelAnimationFrame(raf));
    const tap = () => { let d = Math.abs(((ang - goldCenter + 540) % 360) - 180); d = 180 - d; B.finish(this.gradeBy(d, half)); };
    B.on(document, 'keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(); } });
    B.on(B.wrap, 'pointerdown', tap);
    B.after(opts.time || 2800, () => B.finish('miss'));
  },
};
