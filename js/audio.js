/* ============================================================
   MEME-GENICS — audio.js
   Zero-asset WebAudio: goofy synth SFX + a lofi chiptune loop
   ============================================================ */

const SFX = {
  ctx: null,
  enabled: true,
  musicEnabled: true,
  _musicTimer: null,
  _musicStep: 0,

  ensure() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { this.enabled = false; return false; }
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.32;
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.35;
      this.musicBus.connect(this.master);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  },

  tone({ freq = 440, endFreq = null, type = 'square', dur = 0.12, vol = 0.5, delay = 0, bus = null }) {
    if (!this.enabled || !this.ensure()) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g); g.connect(bus || this.master);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  },

  noise({ dur = 0.15, vol = 0.4, delay = 0, freq = 1200 }) {
    if (!this.enabled || !this.ensure()) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = freq; filter.Q.value = 0.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filter); filter.connect(g); g.connect(this.master);
    src.start(t0);
  },

  play(name) {
    if (!this.enabled) return;
    const S = this;
    const fx = {
      click:   () => S.tone({ freq: 700, endFreq: 900, type: 'square', dur: 0.06, vol: 0.25 }),
      open:    () => { S.tone({ freq: 350, endFreq: 700, type: 'triangle', dur: 0.13, vol: 0.4 }); S.tone({ freq: 700, endFreq: 1050, type: 'triangle', dur: 0.1, vol: 0.3, delay: 0.07 }); },
      close:   () => S.tone({ freq: 600, endFreq: 220, type: 'triangle', dur: 0.14, vol: 0.35 }),
      bonk:    () => { S.tone({ freq: 220, endFreq: 60, type: 'square', dur: 0.13, vol: 0.6 }); S.noise({ dur: 0.08, vol: 0.3, freq: 600 }); },
      crit:    () => { S.tone({ freq: 160, endFreq: 40, type: 'sawtooth', dur: 0.2, vol: 0.7 }); S.noise({ dur: 0.2, vol: 0.5, freq: 900 }); S.tone({ freq: 1200, endFreq: 1800, type: 'square', dur: 0.1, vol: 0.25, delay: 0.05 }); },
      hurt:    () => S.tone({ freq: 300, endFreq: 120, type: 'sawtooth', dur: 0.15, vol: 0.4 }),
      heal:    () => { S.tone({ freq: 520, endFreq: 780, type: 'sine', dur: 0.18, vol: 0.4 }); S.tone({ freq: 780, endFreq: 1040, type: 'sine', dur: 0.18, vol: 0.3, delay: 0.1 }); },
      coin:    () => { S.tone({ freq: 990, type: 'square', dur: 0.07, vol: 0.3 }); S.tone({ freq: 1320, type: 'square', dur: 0.16, vol: 0.3, delay: 0.07 }); },
      buy:     () => { S.play('coin'); S.tone({ freq: 660, endFreq: 880, type: 'triangle', dur: 0.12, vol: 0.3, delay: 0.15 }); },
      pop:     () => S.tone({ freq: 900, endFreq: 300, type: 'square', dur: 0.07, vol: 0.35 }),
      boing:   () => S.tone({ freq: 150, endFreq: 620, type: 'triangle', dur: 0.28, vol: 0.5 }),
      pet:     () => S.tone({ freq: U.rand(800, 1300), endFreq: 1600, type: 'sine', dur: 0.1, vol: 0.3 }),
      levelup: () => [440, 554, 659, 880].forEach((f, i) => S.tone({ freq: f, type: 'square', dur: 0.14, vol: 0.32, delay: i * 0.09 })),
      fanfare: () => [523, 523, 523, 659, 784, 1047].forEach((f, i) => S.tone({ freq: f, type: 'square', dur: i === 5 ? 0.4 : 0.12, vol: 0.35, delay: i * 0.11 })),
      sadtrombone: () => [392, 370, 349, 330].forEach((f, i) => S.tone({ freq: f, endFreq: i === 3 ? 300 : null, type: 'sawtooth', dur: i === 3 ? 0.55 : 0.22, vol: 0.35, delay: i * 0.24 })),
      death:   () => { S.tone({ freq: 400, endFreq: 50, type: 'sawtooth', dur: 0.5, vol: 0.5 }); S.noise({ dur: 0.3, vol: 0.3, freq: 400, delay: 0.1 }); },
      whoosh:  () => S.noise({ dur: 0.18, vol: 0.35, freq: 2000 }),
      zap:     () => { S.tone({ freq: 1600, endFreq: 200, type: 'sawtooth', dur: 0.12, vol: 0.4 }); S.tone({ freq: 1900, endFreq: 300, type: 'square', dur: 0.1, vol: 0.25, delay: 0.03 }); },
      birth:   () => { S.play('boing'); [523, 659, 784].forEach((f, i) => S.tone({ freq: f, type: 'triangle', dur: 0.14, vol: 0.32, delay: 0.25 + i * 0.1 })); },
      egg:     () => S.tone({ freq: U.rand(200, 300), endFreq: 150, type: 'square', dur: 0.08, vol: 0.3 }),
      error:   () => { S.tone({ freq: 220, type: 'square', dur: 0.12, vol: 0.4 }); S.tone({ freq: 185, type: 'square', dur: 0.2, vol: 0.4, delay: 0.13 }); },
      stun:    () => [800, 640, 800, 640].forEach((f, i) => S.tone({ freq: f, type: 'sine', dur: 0.07, vol: 0.25, delay: i * 0.07 })),
      spawn:   () => S.tone({ freq: 150, endFreq: 500, type: 'sawtooth', dur: 0.2, vol: 0.35 }),
      select:  () => S.tone({ freq: 550, endFreq: 660, type: 'square', dur: 0.05, vol: 0.2 }),
      step:    () => S.tone({ freq: U.rand(240, 300), endFreq: 200, type: 'triangle', dur: 0.05, vol: 0.15 }),
    };
    (fx[name] || fx.click)();
  },

  /* ---------- generative lofi chiptune loop ---------- */
  MELODY: [0, 4, 7, 11, 12, 11, 7, 4, 0, 4, 9, 12, 14, 12, 9, 4, -3, 0, 4, 7, 9, 7, 4, 0, 2, 5, 9, 12, 11, 7, 5, 2],
  BASS:   [0, 0, -3, -3, 5, 5, 2, 2],

  startMusic() {
    if (!this.musicEnabled || this._musicTimer || !this.ensure()) return;
    const S = this;
    const base = 220; // A3
    const noteFreq = st => base * Math.pow(2, st / 12);
    const stepDur = 0.22;
    this._musicStep = 0;
    this._musicTimer = setInterval(() => {
      if (!S.musicEnabled) return;
      const i = S._musicStep;
      // melody (soft triangle)
      const m = S.MELODY[i % S.MELODY.length];
      if (m !== null && (i % 2 === 0 || U.chance(0.6))) {
        S.tone({ freq: noteFreq(m + 12), type: 'triangle', dur: stepDur * 1.4, vol: 0.16, bus: S.musicBus });
      }
      // bass every 4 steps
      if (i % 4 === 0) {
        const b = S.BASS[Math.floor(i / 4) % S.BASS.length];
        S.tone({ freq: noteFreq(b - 12), type: 'sine', dur: stepDur * 3.4, vol: 0.3, bus: S.musicBus });
      }
      // hat-ish tick
      if (i % 2 === 1) S.noise({ dur: 0.03, vol: 0.05, freq: 6000 });
      S._musicStep++;
    }, stepDur * 1000);
  },
  stopMusic() {
    clearInterval(this._musicTimer);
    this._musicTimer = null;
  },
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) this.startMusic(); else this.stopMusic();
    return this.musicEnabled;
  },
  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
};
