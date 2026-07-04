/* ============================================================
   MEME-GENICS — combat.js
   Cinematic auto-battler fought on the desktop. Units act
   automatically by SPEED; the player interjects with skill —
   Timing Strikes to attack, Parries to defend, Mashes for
   specials. Camera zooms & pans; impacts shake & flash.
   ============================================================ */

const Combat = {
  state: null,

  GRADE_MULT: { miss: 0.55, ok: 1.0, good: 1.35, perfect: 1.8 },
  PARRY_BLOCK: { miss: 0.0, ok: 0.2, good: 0.5, perfect: 0.9 },

  /* ============================================================
     SETUP
     ============================================================ */
  start(stage, squad) {
    SFX.play('whoosh');
    const battle = document.getElementById('battle');
    battle.classList.remove('hidden');
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('battle-log').innerHTML = '';
    document.getElementById('qte-layer').innerHTML = '';

    const wave = stage.endless ? Game.state.cloudWave + 1 : 0;
    const scale = stage.endless ? 1 + wave * 0.09 : 1;

    const st = {
      stage, wave, scale,
      units: [], round: 0, over: false, busy: false,
      loot: { coins: 0 }, deadMemes: [],
    };
    this.state = st;

    document.getElementById('battle-stagename').innerHTML =
      `${Icon.ico(stage.ico || 'swords', 20)} ${stage.name.toUpperCase()}`;
    document.getElementById('battle-round').textContent = 'ROUND 1';

    document.getElementById('btn-flee').onclick = () => this.confirmFlee();
    document.getElementById('btn-bag').onclick = () => this.openBag();

    this.buildArena(squad, this.rosterFor(stage), scale);
    this.intro();
  },

  rosterFor(stage) {
    if (!stage.endless) return stage.foes.slice();
    const wave = Game.state.cloudWave + 1;
    const pool = ['popup', 'worm', 'drone', 'blob', 'spyder', 'phish', 'ransom', 'trojan', 'adware'];
    const count = Math.min(5, 2 + Math.floor(wave / 2));
    const foes = [];
    for (let i = 0; i < count; i++) foes.push(U.pick(pool));
    if (wave % 3 === 0) foes[foes.length - 1] = U.pick(['captcha', 'bsod', 'spamking']);
    return foes;
  },

  buildArena(squad, foeIds, scale) {
    const st = this.state;
    const box = document.getElementById('arena-units');
    box.innerHTML = '';

    const mkMeme = (meme, i) => {
      const s = Genetics.effStats(meme);
      const sp = Genetics.special(meme);
      meme.battles++;
      return {
        id: U.uid('u'), isMeme: true, meme, side: 'L',
        name: meme.name, stats: s, hp: s.hp, hpMax: s.hp,
        statuses: [], special: sp, specialCd: 1, mag: !!sp.mag,
        el: null, body: null, x: 0, homeX: 0, back: false,
      };
    };
    const mkFoe = (fid, i) => {
      const def = DATA.VIRUSES[fid];
      const atk = Math.round(def.atk * scale);
      return {
        id: U.uid('v'), isMeme: false, def, virusId: fid, side: 'R',
        name: def.name,
        stats: { atk, int: atk, spd: def.spd, lck: 3, crit: 4, resist: def.boss ? 30 : 0 },
        hp: Math.round(def.hp * scale), hpMax: Math.round(def.hp * scale),
        statuses: [], special: null, specialCd: 99, mag: false,
        el: null, body: null, x: 0, homeX: 0, back: false,
      };
    };

    const memes = squad.map(mkMeme);
    const foes = foeIds.map(mkFoe);
    st.units = [...memes, ...foes];

    this.placeSide(memes, 'L');
    this.placeSide(foes, 'R');
    for (const u of st.units) this.spawnUnit(u);
  },

  placeSide(list, side) {
    const n = list.length;
    list.forEach((u, i) => {
      u.back = i % 2 === 1 && n > 2;
      const step = 7;
      u.x = side === 'L' ? 15 + i * step : 85 - i * step;
      u.homeX = u.x;
    });
  },

  spawnUnit(u) {
    const box = document.getElementById('arena-units');
    const el = U.el('div', 'arena-unit ' + (u.isMeme ? 'meme' : 'foe') + (u.back ? ' back' : ''));
    el.style.left = u.x + '%';
    el.style.bottom = (u.back ? 34 : 22) + '%';
    const body = U.el('div', 'au-body');
    body.innerHTML = u.isMeme ? Sprite.memeSVG(u.meme, { size: 84 }) : Sprite.virusHTML(u.def, true);
    el.appendChild(body);
    el.appendChild(U.el('div', 'au-name', U.esc(u.name)));
    const hp = U.el('div', 'au-hp', '<div style="width:100%"></div>');
    el.appendChild(hp);
    el.appendChild(U.el('div', 'au-status'));
    box.appendChild(el);
    u.el = el; u.body = body;
    Tooltip.bind(el, () => this.unitTip(u));
    const c = centerOf(el);
    FX.poof(c.x, c.y);
  },

  unitTip(u) {
    const pw = u.isMeme ? DATA.power(u.stats, u.meme.level) : DATA.virusPower(u.def, this.state.scale);
    return `<h4>${U.esc(u.name)}</h4>
      <div class="tt-sub">${Icon.ico('heart', 12)}${Math.max(0, u.hp)}/${u.hpMax} · ${Icon.ico('fist', 12)}${u.stats.atk} · ${Icon.ico('bolt', 12)}${u.stats.spd}</div>
      <div class="tt-sub">Power ${pw}${u.isMeme ? ' · ' + u.special.name : ''}</div>`;
  },

  /* ============================================================
     CAMERA
     ============================================================ */
  cam() { return document.getElementById('stage-camera'); },
  focusUnit(u, zoom = 1.5) {
    const c = this.cam();
    c.style.transformOrigin = u.x + '% 60%';
    c.style.transform = `scale(${zoom})`;
  },
  focusMid(a, b, zoom = 1.35) {
    const c = this.cam();
    c.style.transformOrigin = ((a.x + b.x) / 2) + '% 60%';
    c.style.transform = `scale(${zoom})`;
  },
  camWide() {
    const c = this.cam();
    c.style.transformOrigin = '50% 56%';
    c.style.transform = 'scale(1)';
  },
  flash(color = 'rgba(255,255,255,.7)') {
    const f = U.el('div', 'cine-flash');
    f.style.background = color;
    document.getElementById('battle').appendChild(f);
    setTimeout(() => f.remove(), 240);
  },
  speedlines(on) {
    document.getElementById('speedlines').classList.toggle('on', on);
  },

  /* ============================================================
     INTRO
     ============================================================ */
  async intro() {
    const st = this.state;
    document.getElementById('battle').classList.add('cine');
    this.camWide();
    await U.wait(200);
    const memes = this.living(true), foes = this.living(false);
    if (memes[0]) { this.focusUnit(memes[0], 1.5); await U.wait(650); }
    if (foes[0]) { this.focusUnit(foes[0], 1.5); await U.wait(650); }
    this.camWide();
    bigBanner(`${st.stage.name.toUpperCase()}`);
    SFX.play('fanfare');
    await U.wait(700);
    document.getElementById('battle').classList.remove('cine');
    this.loop();
  },

  /* ============================================================
     TURN LOOP  (auto-battler)
     ============================================================ */
  living(isMeme) { return this.state.units.filter(u => u.hp > 0 && u.isMeme === isMeme); },
  livingMemes() { return this.living(true); },
  livingFoes() { return this.living(false); },

  async loop() {
    const st = this.state;
    while (!st.over) {
      st.round++;
      document.getElementById('battle-round').textContent = 'ROUND ' + st.round;
      if (st.round > 1) this.log('Round ' + st.round, true);
      const order = st.units.filter(u => u.hp > 0).sort((a, b) => this.spd(b) - this.spd(a));
      for (const u of order) {
        if (st.over) return;
        if (u.hp <= 0) continue;
        await this.takeTurn(u);
        if (this.checkEnd()) return;
      }
      if (st.round > 40) { this.finish(false); return; }  // safety
    }
  },

  spd(u) {
    let s = u.stats.spd;
    if (u.statuses.some(x => x.id === 'slow')) s -= 2;
    return s + (u._spdJit || (u._spdJit = U.rand(0, 0.9)));
  },

  async takeTurn(u) {
    const st = this.state;
    st.busy = true;
    this.tickStatuses(u);
    if (u.hp <= 0) { st.busy = false; return; }

    const target = this.pickTarget(u);
    if (!target) { st.busy = false; return; }

    if (u.isMeme) {
      if (u.specialCd <= 0) await this.doSpecial(u, target);
      else { u.specialCd--; await this.doBasic(u, target); }
    } else {
      await this.enemyTurn(u, target);
    }
    // decay statuses that live per-turn
    for (const s of u.statuses.slice()) { s.turns--; if (s.turns <= 0) this.removeStatus(u, s.id); }
    this.renderStatus(u);
    this.camWide();
    st.busy = false;
    await U.wait(180);
  },

  pickTarget(u) {
    const foes = this.living(!u.isMeme);
    if (!foes.length) return null;
    if (!u.isMeme) {
      const baited = foes.filter(m => m.meme && m.meme.traits.includes('clickbait'));
      if (baited.length && U.chance(0.6)) return U.pick(baited);
    }
    // prefer lowest hp for a little smarts
    return foes.slice().sort((a, b) => a.hp - b.hp)[0];
  },

  /* ============================================================
     PLAYER MEME — basic attack (Timing Strike)
     ============================================================ */
  async doBasic(u, target) {
    this.focusUnit(u, 1.55);
    await U.wait(360);
    const grade = await this.qteBar({ label: 'STRIKE!', sub: 'tap in the zone', time: 1900, sweet: 20, speed: 118 });
    const mult = this.GRADE_MULT[grade];
    const crit = grade === 'perfect' || U.chance((u.stats.crit || 4) / 100);

    this.focusMid(u, target, 1.4);
    await this.dash(u, target);
    const base = u.stats.atk;
    let dmg = base * mult * U.rand(0.92, 1.08) * this.outMult(u);
    if (crit) dmg *= 1.7;
    dmg = Math.max(1, Math.round(dmg));
    this.impact(target, dmg, { crit, grade });
    await U.wait(240);
    await this.dashBack(u);
  },

  /* ============================================================
     PLAYER MEME — special (kind-dependent + QTE)
     ============================================================ */
  async doSpecial(u, target) {
    u.specialCd = u.special.cd;
    const sp = u.special;
    this.focusUnit(u, 1.5);
    bigBanner(sp.name, 1000);
    SFX.play('zap');
    this.flash('rgba(234,192,88,.35)');
    await U.wait(500);

    const base = u.mag ? u.stats.int : u.stats.atk;

    if (sp.kind === 'multi') {
      const ratio = await this.qteMash({ label: sp.name + '!', sub: 'MASH!', time: 1500, target: 12 });
      const hits = 2 + Math.round(ratio * 3);
      this.focusMid(u, target, 1.4);
      await this.dash(u, target);
      for (let i = 0; i < hits; i++) {
        if (target.hp <= 0) { const nt = this.pickTarget(u); if (!nt) break; target = nt; }
        const dmg = Math.max(1, Math.round(base * 0.7 * U.rand(0.9, 1.1) * this.outMult(u)));
        this.impact(target, dmg, { crit: i === hits - 1, small: true });
        await U.wait(150);
      }
      await this.dashBack(u);

    } else if (sp.kind === 'nuke') {
      const grade = await this.qteBar({ label: sp.name + '!', sub: 'perfect = crit', time: 1900, sweet: 16, speed: 128 });
      const mult = this.GRADE_MULT[grade];
      this.focusMid(u, target, 1.5);
      await this.dash(u, target);
      let dmg = Math.max(1, Math.round(base * 2.4 * mult * this.outMult(u)));
      const crit = grade === 'perfect';
      if (crit) dmg = Math.round(dmg * 1.5);
      this.flash();
      Shake.hit(16);
      this.impact(target, dmg, { crit: true, big: true });
      await U.wait(300);
      await this.dashBack(u);

    } else if (sp.kind === 'aoe') {
      const grade = await this.qteBar({ label: sp.name + '!', sub: 'hit all foes', time: 1900, sweet: 18, speed: 120 });
      const mult = this.GRADE_MULT[grade];
      this.camWide();
      this.speedlines(true);
      await U.wait(150);
      Shake.hit(14);
      this.flash('rgba(74,159,212,.4)');
      for (const t of this.livingFoes()) {
        const dmg = Math.max(1, Math.round(base * 1.15 * mult * this.outMult(u)));
        this.impact(t, dmg, { small: true });
        await U.wait(90);
      }
      this.speedlines(false);

    } else if (sp.kind === 'heal') {
      const grade = await this.qteBar({ label: sp.name + '!', sub: 'time the heal', time: 1900, sweet: 20, speed: 110 });
      const mult = this.GRADE_MULT[grade];
      const allies = this.livingMemes().sort((a, b) => a.hp / a.hpMax - b.hp / b.hpMax);
      const amt = Math.max(1, Math.round(base * 1.7 * mult));
      for (const a of allies.slice(0, 3)) this.healUnit(a, Math.round(amt * (a === allies[0] ? 1 : 0.5)));
      SFX.play('heal');

    } else if (sp.kind === 'buff') {
      await this.qteBar({ label: sp.name + '!', sub: 'pump it up', time: 1500, sweet: 24, speed: 100 });
      for (const a of this.livingMemes()) this.addStatus(a, 'atkUp', 2);
      this.flash('rgba(87,177,141,.35)');
      SFX.play('levelup');

    } else if (sp.kind === 'debuff') {
      await this.qteBar({ label: sp.name + '!', sub: 'weaken them', time: 1500, sweet: 24, speed: 100 });
      for (const t of this.livingFoes()) this.addStatus(t, 'atkDown', 2);
      this.flash('rgba(138,118,168,.35)');
      SFX.play('stun');

    } else if (sp.kind === 'shield') {
      await this.qteBar({ label: sp.name + '!', sub: 'raise guard', time: 1500, sweet: 24, speed: 100 });
      for (const a of this.livingMemes()) this.addStatus(a, 'shield', 2, Math.round(base * 1.4));
      this.flash('rgba(74,159,212,.35)');
      SFX.play('heal');
    }
    await U.wait(200);
  },

  /* ============================================================
     ENEMY TURN — the player parries
     ============================================================ */
  async enemyTurn(u, target) {
    this.focusUnit(u, 1.45);
    await U.wait(300);
    this.focusMid(u, target, 1.4);
    await this.dash(u, target);

    const grade = await this.qteBar({ label: 'PARRY!', sub: 'tap to block', time: 1400, sweet: 20, speed: 150, danger: true });
    const block = this.PARRY_BLOCK[grade];
    let dmg = u.stats.atk * U.rand(0.9, 1.12) * this.outMult(u);
    dmg = Math.max(1, Math.round(dmg * (1 - block)));
    if (grade === 'perfect') {
      floatText(centerOf(target.el).x, centerOf(target.el).y - 60, 'PARRY!', { color: '#4bc292', size: 24 });
      this.flash('rgba(87,177,141,.3)');
      SFX.play('zap');
      // small reflect
      const rfl = Math.max(1, Math.round(u.stats.atk * 0.4));
      this.impact(u, rfl, { small: true });
    }
    if (dmg > 0) this.impact(target, dmg, { incoming: true });
    await U.wait(240);
    await this.dashBack(u);
  },

  /* ============================================================
     MOVEMENT / IMPACT
     ============================================================ */
  async dash(u, target) {
    const dir = u.side === 'L' ? -1 : 1;
    const tx = target.x + dir * 9;
    this.speedlines(true);
    u.el.classList.add('dashing');
    u.el.style.left = tx + '%';
    SFX.play('whoosh');
    await U.wait(230);
    this.speedlines(false);
  },
  async dashBack(u) {
    u.el.classList.remove('dashing');
    u.el.style.left = u.homeX + '%';
    await U.wait(200);
  },

  impact(target, dmg, opts = {}) {
    if (!target || target.hp <= 0) { if (!opts.incoming) return; }
    // dodge (blessed)
    if (target.isMeme && target.meme.traits.includes('blessed') && U.chance(0.12) && !opts.incoming) {
      const c = centerOf(target.el);
      floatText(c.x, c.y - 50, 'DODGE', { color: '#4bc292', size: 20 });
      return;
    }
    // shield absorb
    const sh = target.statuses.find(s => s.id === 'shield');
    if (sh && sh.power > 0) {
      const ab = Math.min(sh.power, dmg); dmg -= ab; sh.power -= ab;
      if (sh.power <= 0) this.removeStatus(target, 'shield');
    }
    if (target.isMeme && target.meme.traits.includes('ratiod')) dmg = Math.round(dmg * 1.12);
    dmg = Math.max(0, Math.round(dmg));
    target.hp = Math.max(0, target.hp - dmg);
    this.updateHp(target);

    const c = centerOf(target.el);
    target.el.classList.remove('hurt'); void target.el.offsetWidth; target.el.classList.add('hurt');

    if (opts.crit || opts.big) {
      floatText(c.x, c.y - 48, `${dmg}`, { color: '#fe5f55', size: opts.big ? 46 : 38 });
      if (opts.grade === 'perfect' || opts.big) floatText(c.x, c.y - 86, U.pick(DATA.CRIT_WORDS), { color: '#eac058', size: 20 });
      FX.boom(c.x, c.y); SFX.play('crit'); Shake.hit(10);
    } else {
      floatText(c.x, c.y - 46, `${dmg}`, { color: opts.incoming ? '#ffb0aa' : '#fff', size: opts.small ? 22 : 28 });
      FX.hit(c.x, c.y); SFX.play(target.isMeme ? 'hurt' : 'bonk'); Shake.hit(opts.small ? 3 : 6);
    }
    if (target.hp <= 0) this.killUnit(target);
  },

  healUnit(u, amt) {
    if (u.hp <= 0) return;
    if (u.meme && u.meme.traits.includes('doomer')) amt = Math.ceil(amt / 2);
    amt = Math.max(1, Math.round(amt));
    u.hp = Math.min(u.hpMax, u.hp + amt);
    this.updateHp(u);
    const c = centerOf(u.el);
    FX.heal(c.x, c.y);
    floatText(c.x, c.y - 46, `+${amt}`, { color: '#4bc292', size: 24 });
  },

  killUnit(u) {
    const st = this.state;
    u.el.classList.add('dying');
    const c = centerOf(u.el);
    SFX.play('death'); FX.boom(c.x, c.y); Shake.hit(8);
    if (u.isMeme) {
      FX.skull(c.x, c.y);
      floatText(c.x, c.y - 60, 'F', { color: '#fff', size: 40 });
      this.log(`${u.name} was deleted... F`, true, 'skull');
      st.deadMemes.push(u);
    } else {
      floatText(c.x, c.y - 56, 'DELETED', { color: '#4bc292', size: 22 });
      st.loot.coins += u.def.bounty;
      Game.state.stats.virusesDeleted++;
      // award XP to a random living meme (auto-battler leveling)
      const memes = this.livingMemes();
      if (memes.length) {
        const k = U.pick(memes);
        k.meme.kills++;
        const ups = Genetics.grantXp(k.meme, u.def.xp);
        if (ups) {
          k.stats = Genetics.effStats(k.meme); k.hpMax = k.stats.hp; k.hp = Math.min(k.hpMax, k.hp + 8);
          this.updateHp(k);
          const kc = centerOf(k.el); FX.confetti(kc.x, kc.y, 16);
          floatText(kc.x, kc.y - 80, 'LEVEL UP!', { color: '#eac058', size: 20 });
        }
      }
      if (u.def.splits) {
        for (let i = 0; i < 2; i++) {
          const mini = { id: U.uid('v'), isMeme: false, def: DATA.VIRUSES.miniblob, virusId: 'miniblob', side: 'R',
            name: DATA.VIRUSES.miniblob.name,
            stats: { atk: DATA.VIRUSES.miniblob.atk, int: DATA.VIRUSES.miniblob.atk, spd: DATA.VIRUSES.miniblob.spd, lck: 3, crit: 4, resist: 0 },
            hp: DATA.VIRUSES.miniblob.hp, hpMax: DATA.VIRUSES.miniblob.hp, statuses: [], special: null, specialCd: 99, mag: false,
            el: null, body: null, back: true };
          mini.x = U.clamp(u.x + (i ? 5 : -5), 60, 92); mini.homeX = mini.x;
          st.units.push(mini); this.spawnUnit(mini);
        }
        this.log('The blob split!', false, 'virus');
      }
    }
    setTimeout(() => { if (u.el) u.el.remove(); }, 480);
  },

  /* ============================================================
     STATUS / STATS
     ============================================================ */
  outMult(u) {
    let m = 1;
    if (u.statuses.some(s => s.id === 'atkUp')) m *= 1.35;
    if (u.statuses.some(s => s.id === 'atkDown')) m *= 0.65;
    if (u.isMeme && u.meme.traits.includes('stale')) m *= 0.9;
    if (u.isMeme && u.meme.traits.includes('gigachad')) m *= 1.0; // already in atk
    return m;
  },
  addStatus(u, id, turns, power) {
    if (u.isMeme && u.meme.traits.includes('sigma') && DATA.STATUS[id].bad && U.chance(0.35)) return;
    const ex = u.statuses.find(s => s.id === id);
    if (ex) { ex.turns = Math.max(ex.turns, turns); if (power) ex.power = power; }
    else u.statuses.push({ id, turns, power: power || 0 });
    this.renderStatus(u);
    const c = centerOf(u.el);
    floatText(c.x, c.y - 58, DATA.STATUS[id].name, { color: DATA.STATUS[id].bad ? '#e0902f' : '#4bc292', size: 15 });
  },
  removeStatus(u, id) {
    const i = u.statuses.findIndex(s => s.id === id);
    if (i >= 0) u.statuses.splice(i, 1);
    this.renderStatus(u);
  },
  tickStatuses(u) {
    if (u.isMeme && u.meme.traits.includes('wholesome') && u.hp > 0 && u.hp < u.hpMax) {
      u.hp = Math.min(u.hpMax, u.hp + 2); this.updateHp(u);
    }
    const burn = u.statuses.find(s => s.id === 'burn');
    if (burn && !(u.isMeme && u.meme.traits.includes('zombie'))) {
      const c = centerOf(u.el);
      u.hp = Math.max(0, u.hp - 3); this.updateHp(u);
      floatText(c.x, c.y - 40, '3', { color: '#e0902f', size: 18 });
      if (u.hp <= 0) this.killUnit(u);
    }
  },
  renderStatus(u) {
    if (!u.el) return;
    const box = u.el.querySelector('.au-status');
    if (box) box.innerHTML = u.statuses.map(s => Icon.ico(DATA.STATUS[s.id].ico, 13)).join('');
  },
  updateHp(u) {
    if (!u.el) return;
    const bar = u.el.querySelector('.au-hp > div');
    if (bar) bar.style.width = U.clamp(u.hp / u.hpMax * 100, 0, 100) + '%';
  },

  /* ============================================================
     QTE MINI-GAMES
     ============================================================ */
  qteBar(opts) {
    return new Promise(resolve => {
      const layer = document.getElementById('qte-layer');
      const wrap = U.el('div', 'qte' + (opts.danger ? ' danger' : ''));
      wrap.innerHTML = `
        <div class="qte-label">${opts.label}</div>
        <div class="qte-sub">${opts.sub || ''}</div>
        <div class="qte-track">
          <div class="qte-sweet" style="width:${opts.sweet}%;left:${50 - opts.sweet / 2}%"></div>
          <div class="qte-marker"></div>
        </div>`;
      layer.innerHTML = '';
      layer.appendChild(wrap);
      const marker = wrap.querySelector('.qte-marker');
      const sweet = opts.sweet, speed = opts.speed || 120;
      let pos = 0, dir = 1, done = false, raf = 0;
      let last = performance.now();
      const startT = last;
      const step = now => {
        const dt = (now - last) / 1000; last = now;
        pos += dir * speed * dt;
        if (pos >= 100) { pos = 100; dir = -1; } else if (pos <= 0) { pos = 0; dir = 1; }
        marker.style.left = pos + '%';
        if (now - startT > opts.time) { finish(true); return; }
        if (!done) raf = requestAnimationFrame(step);
      };
      const grade = () => {
        const d = Math.abs(pos - 50);
        if (d <= sweet * 0.28) return 'perfect';
        if (d <= sweet * 0.6) return 'good';
        if (d <= sweet) return 'ok';
        return 'miss';
      };
      const finish = timeout => {
        if (done) return; done = true;
        cancelAnimationFrame(raf);
        const g = timeout ? 'ok' : grade();
        cleanup();
        wrap.classList.add('done', 'g-' + g);
        marker.style.left = pos + '%';
        const fl = U.el('div', 'qte-result r-' + g, g.toUpperCase());
        wrap.appendChild(fl);
        SFX.play(g === 'perfect' ? 'crit' : g === 'miss' ? 'error' : 'select');
        setTimeout(() => { wrap.remove(); resolve(g); }, 300);
      };
      const onKey = e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); finish(false); } };
      const onTap = () => finish(false);
      const cleanup = () => { document.removeEventListener('keydown', onKey); layer.removeEventListener('pointerdown', onTap); };
      document.addEventListener('keydown', onKey);
      layer.addEventListener('pointerdown', onTap);
      raf = requestAnimationFrame(step);
    });
  },

  qteMash(opts) {
    return new Promise(resolve => {
      const layer = document.getElementById('qte-layer');
      const wrap = U.el('div', 'qte mash');
      wrap.innerHTML = `
        <div class="qte-label">${opts.label}</div>
        <div class="qte-sub">${opts.sub || 'MASH!'}</div>
        <div class="qte-track"><div class="qte-fill"></div></div>`;
      layer.innerHTML = '';
      layer.appendChild(wrap);
      const fill = wrap.querySelector('.qte-fill');
      const targetN = opts.target || 12;
      let count = 0, done = false;
      const bump = () => {
        if (done) return; count++;
        fill.style.width = Math.min(100, count / targetN * 100) + '%';
        SFX.play('click');
        wrap.classList.remove('pump'); void wrap.offsetWidth; wrap.classList.add('pump');
      };
      const onKey = e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); bump(); } };
      const onTap = () => bump();
      document.addEventListener('keydown', onKey);
      layer.addEventListener('pointerdown', onTap);
      setTimeout(() => {
        done = true;
        document.removeEventListener('keydown', onKey);
        layer.removeEventListener('pointerdown', onTap);
        const ratio = Math.min(1, count / targetN);
        wrap.classList.add('done');
        setTimeout(() => { wrap.remove(); resolve(ratio); }, 220);
      }, opts.time || 1500);
    });
  },

  /* ============================================================
     END STATE
     ============================================================ */
  checkEnd() {
    const st = this.state;
    if (st.over) return true;
    if (!this.livingFoes().length) { this.finish(true); return true; }
    if (!this.livingMemes().length) { this.finish(false); return true; }
    return false;
  },

  log(msg, important, icon) {
    const box = document.getElementById('battle-log');
    const ico = icon ? Icon.ico(icon, 13) : '';
    const line = U.el('div', 'log-line' + (important ? ' important' : ''), ico + '<span>' + msg + '</span>');
    box.appendChild(line);
    while (box.children.length > 6) box.firstChild.remove();
  },

  confirmFlee() {
    if (this.state.over) return;
    Modal.show({
      title: `${Icon.ico('boot', 22)} Run away?`,
      bodyHTML: '<p style="text-align:center">Live to meme another day? No loot, no XP — but no retirement either.</p>',
      actions: [
        { label: 'FLEE', cls: 'bad', fn: () => this.finish('fled') },
        { label: 'Keep fighting', cls: 'good' },
      ],
    });
  },

  /* ============================================================
     BAG (battle consumables)
     ============================================================ */
  openBag() {
    const st = this.state;
    if (st.over || st.busy) { SFX.play('error'); toast('Wait for a gap in the action!', 2400, 'bag'); return; }
    const usable = Object.keys(Game.state.inventory).filter(id => DATA.ITEMS[id].battle);
    const node = U.el('div');
    if (!usable.length) node.innerHTML = '<p>No battle consumables! MemeBay sells pizza, copium and more.</p>';
    const grid = U.el('div', 'inv-grid');
    for (const id of usable) {
      const it = DATA.ITEMS[id];
      const cell = U.el('div', 'inv-item',
        `<span class="ii-count">${Game.state.inventory[id]}</span><span class="ii-ico">${Icon.ico(it.ico, 34)}</span><span class="ii-name">${it.name}</span>`);
      cell.onclick = () => { Modal.hide(); this.useBattleItem(id); };
      grid.appendChild(cell);
    }
    node.appendChild(grid);
    Modal.show({ title: `${Icon.ico('bag', 20)} Battle Bag`, bodyNode: node, actions: [{ label: 'Close' }] });
  },

  useBattleItem(id) {
    const st = this.state;
    const it = DATA.ITEMS[id];
    const pick = (dead) => new Promise(resolve => {
      const pool = st.units.filter(u => u.isMeme && (dead ? u.hp <= 0 : u.hp > 0));
      if (!pool.length) { resolve(null); return; }
      const node = U.el('div'); const grid = U.el('div', 'breed-pick-grid');
      for (const u of pool) {
        const cell = U.el('div', 'mini-meme');
        cell.innerHTML = `${Sprite.memeSVG(u.meme, { size: 56 })}<span class="mm-name">${U.esc(u.name)}</span><span class="mm-sub">${Icon.ico('heart', 11)}${Math.max(0, u.hp)}/${u.hpMax}</span>`;
        cell.onclick = () => { Modal.hide(); resolve(u); };
        grid.appendChild(cell);
      }
      node.appendChild(grid);
      Modal.show({ title: `${Icon.ico(it.ico, 20)} Use on...`, bodyNode: node, actions: [{ label: 'Cancel', fn: () => resolve(null) }] });
    });

    (async () => {
      switch (it.battle) {
        case 'heal': { const t = await pick(false); if (!t) return; Game.removeItem(id); this.healUnit(t, it.power); break; }
        case 'energy': { const t = await pick(false); if (!t) return; Game.removeItem(id); t.specialCd = 0; toast(`${U.esc(t.name)} is charged up!`, 2400, 'energycan'); break; }
        case 'revive': {
          const t = await pick(true); if (!t) return; Game.removeItem(id);
          t.hp = Math.round(t.hpMax / 2); t.statuses = [];
          const i = st.deadMemes.indexOf(t); if (i >= 0) st.deadMemes.splice(i, 1);
          if (!t.el || !t.el.isConnected) this.spawnUnit(t);
          t.el.classList.remove('dying'); this.updateHp(t);
          bigBanner('REVIVED!'); SFX.play('fanfare'); break;
        }
        case 'nuke': {
          Game.removeItem(id); SFX.play('zap'); Shake.hit(14); this.flash();
          for (const v of this.livingFoes()) this.impact(v, it.power, { small: true });
          this.checkEnd(); break;
        }
      }
      Game.save();
    })();
  },

  /* ============================================================
     FINISH
     ============================================================ */
  async finish(result) {
    const st = this.state;
    if (st.over) return;
    st.over = true;
    this.camWide();
    const stage = st.stage;
    const survivors = this.livingMemes();

    for (const u of st.deadMemes) Game.killMeme(u.meme, `deleted in ${stage.name}`);

    let coins = 0, itemDrop = null, xpEach = 0;
    const retiredNames = [];
    if (result === true) {
      coins = Math.max(0, U.randInt(stage.reward[0], stage.reward[1]) + st.loot.coins);
      if (U.chance(stage.itemChance)) itemDrop = U.pick(Object.keys(DATA.ITEMS));
      xpEach = 8 + stage.diff * 4;
      Game.state.missionsDone[stage.id] = (Game.state.missionsDone[stage.id] || 0) + 1;
      if (stage.endless) Game.state.cloudWave++;
      Game.state.stats.wins++;
      Game.addCoins(coins, null);
      if (itemDrop) Game.addItem(itemDrop);
      for (const u of survivors) {
        Genetics.grantXp(u.meme, xpEach);
        if (!u.meme.retired) { u.meme.retired = true; Game.state.stats.retired++; retiredNames.push(u.meme.name); }
      }
      Game.unlock('shop'); Game.unlock('inventory');
      if (stage.foes.includes('spamking')) Game.unlock('endless');
      SFX.play('fanfare'); bigBanner(U.pick(['VICTORY!', 'STAGE CLEAR!', 'FLAWLESS!']));
      // cinematic hero zoom
      if (survivors[0]) { document.getElementById('battle').classList.add('cine'); this.focusUnit(survivors[0], 1.6); FX.confetti(window.innerWidth / 2, window.innerHeight / 2, 40); }
    } else if (result === 'fled') {
      SFX.play('sadtrombone'); bigBanner('RETREAT');
    } else {
      SFX.play('sadtrombone'); bigBanner('WASTED');
    }
    Game.state.stats.battles++;

    await U.wait(1500);
    document.getElementById('battle').classList.remove('cine');

    const it = itemDrop ? DATA.ITEMS[itemDrop] : null;
    const deadList = st.deadMemes.map(u => u.meme.name);
    Modal.show({
      title: result === true ? `${Icon.ico('trophy', 22)} STAGE CLEAR!` : result === 'fled' ? `${Icon.ico('boot', 22)} Retreated` : `${Icon.ico('skull', 22)} DEFEAT`,
      bodyHTML: `<div style="text-align:center">
        ${result === true ? `
          <div class="result-loot">
            <span class="loot-chip">${Icon.ico('coin', 18)} +${coins}</span>
            ${it ? `<span class="loot-chip">${Icon.ico(it.ico, 18)} ${it.name}</span>` : ''}
            <span class="loot-chip">${Icon.ico('star', 18)} +${xpEach} XP</span>
          </div>
          ${retiredNames.length ? `<p style="font-size:12px;color:var(--gold);margin-top:6px">${Icon.ico('crown', 13)} <b>${retiredNames.map(U.esc).join(', ')}</b> survived and RETIRED — breed them for the next generation.</p>` : ''}`
        : result === 'fled' ? '<p>You grabbed your memes and ran.</p>' : '<p>The viruses took the field... your desktop mourns.</p>'}
        ${deadList.length ? `<p style="margin-top:8px;color:var(--red)"><b>Fallen:</b> ${deadList.map(U.esc).join(', ')}</p>` : ''}
        <p style="font-size:12px;opacity:.6;margin-top:8px">A day passes on the desktop...</p>
      </div>`,
      actions: [{
        label: 'Back to Desktop', cls: 'good', fn: () => {
          document.getElementById('battle').classList.add('hidden');
          this.camWide();
          Game.advanceDay();
          Desktop.refreshWalkers();
          Desktop.refreshAllWindows();
          Desktop.updateTray();
          Game.save();
        },
      }],
    });
  },
};
