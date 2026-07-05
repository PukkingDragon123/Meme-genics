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
    // cooler level design — each stage fights in a themed "zone"
    const zi = stage.endless ? 5 : Math.min(4, Math.max(0, (stage.diff || 1) - 1));
    battle.dataset.zone = ['downloads', 'system', 'registry', 'deepweb', 'core', 'cloud'][zi];
    battle.dataset.scene = stage.scene || 'forest';   // themed battlefield scenery
    // first-ever run of the first stage plays as a guided tutorial
    this.tutorial = !stage.endless && !Game.state.tutorialDone && stage.id === DATA.STAGES[0].id;
    this._tutStrike = this._tutParry = this.tutorial;
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
      meme.battles++;
      return {
        id: U.uid('u'), isMeme: true, meme, side: 'L',
        name: meme.name, stats: s, hp: s.hp, hpMax: s.hp,
        statuses: [], abilities: Genetics.abilities(meme), cds: {},
        el: null, body: null, x: 0, homeX: 0, back: false,
      };
    };
    const mkFoe = (fid, i) => {
      const def = DATA.VIRUSES[fid];
      Game.discoverVirus(fid);
      const atk = Math.round(def.atk * scale);
      return {
        id: U.uid('v'), isMeme: false, def, virusId: fid, side: 'R',
        name: def.name,
        stats: { atk, int: atk, spd: def.spd, lck: 3, crit: 4, resist: def.boss ? 30 : 0 },
        hp: Math.round(def.hp * scale), hpMax: Math.round(def.hp * scale),
        statuses: [], abilities: ['bonk'], cds: {},
        el: null, body: null, x: 0, homeX: 0, back: false,
      };
    };

    const memes = squad.map(mkMeme);
    const foes = foeIds.map(mkFoe);
    st.units = [...memes, ...foes];

    this.placeSide(memes, 'L');
    this.placeSide(foes, 'R');
    for (const u of st.units) this.spawnUnit(u);
    // Paladin: Bulwark — starts the fight already shielded
    for (const u of memes) if (u.meme.cls === 'paladin') this.addStatus(u, 'shield', 3, Math.round(u.stats.int * 1.2 + 8));
    this.renderTeamTrack();
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
      <div class="tt-sub">Power ${pw}${u.isMeme ? ' · ' + (u.abilities.length) + ' moves' : ''}</div>`;
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
    if (this.tutorial) await this.tutorialIntro();
    this.loop();
  },

  // one-time pre-battle explainer for the first fight
  tutorialIntro() {
    return new Promise(res => {
      Modal.show({
        title: `${Icon.ico('swords', 22)} How to fight`,
        bodyHTML: `<div style="text-align:center;font-size:13px;line-height:1.6">
          <p>Your memes and the viruses <b>fight automatically</b> — they leap in and clash on their own.</p>
          <p style="margin-top:6px">You jump in with <b>skill</b>. A little <b>mini-game</b> pops up on every action:</p>
          <p style="margin-top:6px">${Icon.ico('fist', 14)} <b>Attacking?</b> Do what it says — stop the marker in the green, hit the target, tap on the beat. Nail it for <b>bonus damage</b>.</p>
          <p style="margin-top:4px">${Icon.ico('shield2', 14)} <b>Being attacked?</b> A red <b>PARRY!</b> game appears — react in time to <b>block</b>. A perfect parry reflects damage.</p>
          <p style="margin-top:6px;opacity:.7;font-size:12px">Tip: you can use your mouse/tap or the SPACE key. Do nothing and it still resolves — but skill wins fights.</p>
        </div>`,
        actions: [{ label: "LET'S FIGHT", cls: 'fun', fn: res }],
      });
    });
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
    st.active = u;
    st.units.forEach(x => x.el && x.el.classList.remove('active-unit'));
    if (u.el) u.el.classList.add('active-unit', 'ready-hop');
    setTimeout(() => u.el && u.el.classList.remove('ready-hop'), 400);
    this.renderTeamTrack();
    this.tickStatuses(u);
    if (u.hp <= 0) { st.busy = false; return; }

    const target = this.pickTarget(u);
    if (!target) { st.busy = false; return; }

    if (u.isMeme) await this.memeTurn(u, target);
    else await this.enemyTurn(u, target);
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
     PLAYER MEME — pick a learned ability & cast it (anime style)
     ============================================================ */
  async memeTurn(u, target) {
    for (const k of Object.keys(u.cds)) if (u.cds[k] > 0) u.cds[k]--;
    const ready = u.abilities.filter(a => a !== 'bonk' && DATA.ABILITIES[a] && !(u.cds[a] > 0));
    const kindOf = a => DATA.ABILITIES[a].kind;
    const lowAlly = this.livingMemes().some(m => m.hp / m.hpMax < 0.45);
    const heals = ready.filter(a => kindOf(a) === 'heal');
    const offense = ready.filter(a => !['heal', 'shield', 'buff', 'debuff'].includes(kindOf(a)));
    let abId = 'bonk';
    if (lowAlly && heals.length) abId = U.pick(heals);
    else if (offense.length) abId = U.pick(offense);
    else if (ready.length) abId = U.pick(ready);
    await this.castAbility(u, abId, target);
  },

  async castAbility(u, abId, target) {
    const ab = DATA.ABILITIES[abId];
    u.cds[abId] = ab.cd + 1;
    const base = ab.mag ? u.stats.int : u.stats.atk;
    const melee = ['strike', 'nuke', 'multi', 'execute', 'lifesteal', 'dot'].includes(ab.kind) && ab.vfx !== 'meteor' && ab.vfx !== 'bullet' && ab.vfx !== 'fireball';
    const support = ['heal', 'buff', 'shield'].includes(ab.kind);

    if (abId !== 'bonk') await this.animeCutIn(u, ab);
    else { this.focusUnit(u, 1.5); await U.wait(280); }

    // QTE — skill layer: each ability maps to one of 20 mini-games
    let mult = 1, hits = 3, perfect = false;
    const mini = abId === 'bonk' ? 'timing' : QTE.forAbility(ab, abId);
    const tut = u.isMeme && this._tutStrike;
    if (tut) this._tutStrike = false;
    const g = await QTE.play(mini, { label: ab.name + '!', tutorial: tut, hint: tut ? 'Do what it says — nail it for BONUS DAMAGE!' : '', time: tut ? 3800 : undefined });
    mult = this.GRADE_MULT[g];
    perfect = g === 'perfect';
    hits = { miss: 2, ok: 3, good: 4, perfect: 5 }[g] || 3;
    const crit = perfect || U.chance((u.stats.crit || 4) / 100);

    const foes = this.livingFoes();
    let targets;
    if (ab.kind === 'aoe') targets = foes;
    else if (support) targets = this.livingMemes();
    else targets = [(target && target.hp > 0) ? target : foes[0]].filter(Boolean);
    if (!support && !targets.length) { await U.wait(120); return; }

    // camera + approach — melee leaps in and clashes mid-air
    const heavy = ['nuke', 'execute'].includes(ab.kind) || perfect;
    if (melee && targets[0]) {
      const tgt = targets[0];
      this.focusMid(u, tgt, 1.4);
      if (tgt.el) tgt.el.classList.add('bracing');       // defender braces to meet the strike
      await this.dash(u, tgt, { spin: heavy });
      if (tgt.el) {
        const cc = centerOf(tgt.el);
        this.clashBurst(cc.x, cc.y - 10, ab.color);      // clash at the point of contact
        this.freeze(heavy ? 150 : 90);
        tgt.el.classList.remove('bracing');
      }
    } else { this.camWide(); this.speedlines(true); await U.wait(120); }

    // unique VFX
    this.playVFX(ab.vfx, u, ab.kind === 'aoe' ? foes : (support ? this.livingMemes() : targets), ab.color);
    await U.wait(130);

    const roll = () => Math.max(1, Math.round(base * ab.power * mult * U.rand(0.92, 1.08) * this.outMult(u)));

    if (ab.kind === 'heal') {
      const allies = this.livingMemes().sort((a, b) => a.hp / a.hpMax - b.hp / b.hpMax);
      const amt = Math.max(1, Math.round(base * ab.power * mult));
      allies.slice(0, 3).forEach((a, i) => this.healUnit(a, Math.round(amt * (i ? 0.5 : 1))));
    } else if (ab.kind === 'buff') {
      this.livingMemes().forEach(a => this.addStatus(a, 'atkUp', 2)); SFX.play('levelup');
    } else if (ab.kind === 'shield') {
      const amt = Math.round(base * 1.5 + 6); this.livingMemes().forEach(a => this.addStatus(a, 'shield', 2, amt)); SFX.play('heal');
    } else if (ab.kind === 'debuff') {
      foes.forEach(t => this.addStatus(t, 'atkDown', 2)); SFX.play('stun');
    } else if (ab.kind === 'multi') {
      for (let i = 0; i < hits; i++) {
        let t = targets[0]; if (!t || t.hp <= 0) { t = this.livingFoes()[0]; if (!t) break; }
        const d = Math.max(1, Math.round(base * ab.power * U.rand(0.9, 1.1) * this.outMult(u)));
        this.impact(t, d, { small: true, crit: i === hits - 1 && crit });
        await U.wait(120);
      }
    } else if (ab.kind === 'aoe') {
      this.flash(this.rgba(ab.color, .28)); Shake.hit(12);
      for (const t of foes) { if (t.hp <= 0) continue; this.impact(t, roll(), { small: true }); await U.wait(70); }
    } else {
      const t = targets[0];
      if (t) {
        let dmg = roll();
        if (ab.kind === 'nuke') { if (crit) dmg = Math.round(dmg * 1.5); this.flash(); Shake.hit(16); this.impact(t, dmg, { big: true }); }
        else if (ab.kind === 'execute') { if (t.hp / t.hpMax <= 0.35) dmg *= 2; if (crit) dmg = Math.round(dmg * 1.7); this.impact(t, dmg, { crit }); }
        else if (ab.kind === 'lifesteal') { if (crit) dmg = Math.round(dmg * 1.7); this.impact(t, dmg, { crit }); if (u.hp > 0) this.healUnit(u, Math.round(dmg * 0.5)); }
        else if (ab.kind === 'dot') { if (crit) dmg = Math.round(dmg * 1.7); this.impact(t, dmg, { crit }); if (t.hp > 0) this.addStatus(t, ab.vfx === 'ice' ? 'slow' : 'burn', 2); }
        else { if (crit) dmg = Math.round(dmg * 1.7); this.impact(t, dmg, { crit }); }
      }
    }
    // Necromancer: Leech — offensive casts drain a little life back
    if (u.isMeme && u.meme.cls === 'necromancer' && u.hp > 0 && !['heal', 'buff', 'shield', 'debuff'].includes(ab.kind)) {
      this.healUnit(u, Math.round(u.hpMax * 0.1));
    }
    this.speedlines(false);
    await U.wait(220);
    if (melee) await this.dashBack(u);
  },

  // colored flash helper
  rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  },

  // anime-style ability cut-in (portrait + name band + camera punch)
  async animeCutIn(u, ab) {
    this.focusUnit(u, 1.7);
    document.getElementById('battle').classList.add('cine');
    const layer = document.getElementById('qte-layer');
    const cut = U.el('div', 'anime-cut');
    cut.style.setProperty('--acol', ab.color);
    cut.innerHTML = `<div class="ac-face">${Sprite.memeSVG(u.meme, { equip: false, size: 56 })}</div>
      <div class="ac-name">${Icon.ico(ab.ico, 22)} <span>${ab.name}</span></div>`;
    layer.appendChild(cut);
    SFX.play('zap'); this.flash('rgba(255,255,255,.22)'); Shake.hit(6);
    await U.wait(620);
    cut.remove();
    document.getElementById('battle').classList.remove('cine');
  },

  // ============================================================
  //  VFX DISPATCHER — each ability's unique on-screen effect
  // ============================================================
  playVFX(name, caster, tgts, color) {
    const cc = caster && caster.el ? centerOf(caster.el) : { x: 0, y: 0 };
    const pts = (tgts || []).filter(t => t.el).map(t => centerOf(t.el));
    const each = fn => pts.forEach(fn);
    switch (name) {
      case 'slash': each(p => { FX.slash(p.x, p.y, color); FX.hit(p.x, p.y); }); break;
      case 'multislash': each(p => { for (let i = 0; i < 4; i++) setTimeout(() => FX.slash(p.x, p.y, color), i * 70); }); break;
      case 'punch': each(p => { FX.boom(p.x, p.y); FX.ring(p.x, p.y, color); }); Shake.hit(8); break;
      case 'fire': each(p => { FX.spawn(p.x, p.y, { count: 14, colors: ['#e0655e', '#d98a3a', '#e6c84d'], up: 2, maxSpd: 5, sizeMin: 3, sizeMax: 7, lifeMax: 34 }); FX.boom(p.x, p.y); }); break;
      case 'fireball': each(p => FX.projectile(cc.x, cc.y, p.x, p.y, '#e0655e', () => { FX.boom(p.x, p.y); FX.spawn(p.x, p.y, { count: 12, colors: ['#e0655e', '#d98a3a'], maxSpd: 5, lifeMax: 30 }); })); break;
      case 'ice': each(p => { FX.spawn(p.x, p.y, { count: 12, colors: ['#4a9fd4', '#a6e0ee', '#e6f4ff'], maxSpd: 4, sizeMin: 3, sizeMax: 6, lifeMax: 34 }); FX.ring(p.x, p.y, '#4a9fd4'); }); break;
      case 'lightning': each(p => { FX.bolt(p.x, p.y, color); }); this.flash('rgba(217,180,95,.28)'); break;
      case 'meteor': each(p => FX.projectile(p.x, -40, p.x, p.y, '#d98a3a', () => { FX.boom(p.x, p.y); FX.ring(p.x, p.y, color); Shake.hit(12); this.flash(); })); break;
      case 'beam': { const fx = caster.side === 'L' ? window.innerWidth + 40 : -40; FX.beam(cc.x, cc.y, fx, cc.y, color); each(p => FX.hit(p.x, p.y)); this.flash(this.rgba(color, .2)); break; }
      case 'poison': each(p => FX.spawn(p.x, p.y, { count: 14, colors: ['#57b18d', '#3a7d5f'], up: 1, grav: -0.02, maxSpd: 2.5, sizeMin: 4, sizeMax: 8, lifeMax: 40 })); break;
      case 'shock': each(p => { FX.ring(p.x, p.y, color); FX.dust(p.x, p.y + 20); }); Shake.hit(10); break;
      case 'heal': each(p => { FX.heal(p.x, p.y); FX.ring(p.x, p.y, '#57b18d'); }); break;
      case 'holy': each(p => { FX.heal(p.x, p.y); FX.ring(p.x, p.y, '#d9b45f'); FX.stars(p.x, p.y); }); this.flash('rgba(217,180,95,.22)'); break;
      case 'buff': each(p => { FX.ring(p.x, p.y, '#d9b45f'); FX.stars(p.x, p.y); }); break;
      case 'curse': each(p => FX.spawn(p.x, p.y, { count: 10, colors: ['#8676a4', '#5f4f7a'], up: -1, grav: 0.08, maxSpd: 2, sizeMin: 3, sizeMax: 6, lifeMax: 34 })); break;
      case 'dome': each(p => FX.dome(p.x, p.y, color)); break;
      case 'drain': each(p => { FX.projectile(p.x, p.y, cc.x, cc.y, '#e070ac'); FX.hit(p.x, p.y); }); break;
      case 'bullet': each(p => FX.projectile(cc.x, cc.y, p.x, p.y, color, () => FX.hit(p.x, p.y))); break;
      case 'starshower': each(p => FX.projectile(p.x, -30, p.x, p.y, '#d9b45f', () => { FX.stars(p.x, p.y); FX.boom(p.x, p.y); })); break;
      case 'rainbow': each(p => { FX.rainbow(p.x, p.y, 12); FX.ring(p.x, p.y, color); }); break;
      case 'music': each(p => FX.spawn(p.x, p.y, { count: 8, colors: ['#8676a4', '#c9a6e0'], up: 1.5, grav: -0.02, maxSpd: 2, sizeMin: 4, sizeMax: 7, lifeMax: 40 })); break;
      case 'dash': this.speedlines(true); each(p => FX.slash(p.x, p.y, color)); break;
      default: each(p => FX.hit(p.x, p.y));
    }
  },

  /* ============================================================
     ENEMY TURN — the player parries
     ============================================================ */
  async enemyTurn(u, target) {
    this.focusUnit(u, 1.45);
    await U.wait(300);
    this.focusMid(u, target, 1.4);
    await this.dash(u, target, { spin: true });
    if (target.el) target.el.classList.add('bracing');   // your meme braces to meet the attack

    const pk = QTE.forParry((u.def && u.def.name || 'v') + '-' + this.state.round + '-' + (target.meme ? target.meme.id.slice(-3) : ''));
    const tut = this._tutParry; if (tut) this._tutParry = false;
    const grade = await QTE.play(pk, { label: 'PARRY!', danger: true, time: tut ? 2800 : 1500, tutorial: tut, hint: tut ? 'REACT to block the hit!' : '' });
    if (target.el) target.el.classList.remove('bracing');
    const block = this.PARRY_BLOCK[grade];
    let dmg = u.stats.atk * U.rand(0.9, 1.12) * this.outMult(u);
    dmg = Math.max(1, Math.round(dmg * (1 - block)));
    const cc = target.el ? centerOf(target.el) : { x: 0, y: 0 };
    if (grade === 'perfect') {
      this.clashBurst(cc.x, cc.y - 10, '#4bc292');
      this.freeze(150);
      floatText(cc.x, cc.y - 60, 'PARRY!', { color: '#4bc292', size: 24 });
      this.flash('rgba(87,177,141,.3)');
      SFX.play('zap');
      // knock the virus back with a spin, and reflect a little
      if (u.el) { u.el.classList.add('knockback'); setTimeout(() => u.el && u.el.classList.remove('knockback'), 420); }
      const rfl = Math.max(1, Math.round(u.stats.atk * 0.4));
      this.impact(u, rfl, { small: true });
    } else if (grade === 'good') {
      // slick dodge — weave the attack for a partial evade
      this.dodgeMove(target);
      floatText(cc.x, cc.y - 56, 'DODGE!', { color: '#4bc292', size: 20 });
      SFX.play('whoosh'); this.freeze(70);
    }
    if (dmg > 0) this.impact(target, dmg, { incoming: true });
    await U.wait(240);
    await this.dashBack(u);
  },

  /* ============================================================
     MOVEMENT / IMPACT
     ============================================================ */
  async dash(u, target, opts = {}) {
    const dir = u.side === 'L' ? -1 : 1;
    const tx = target.x + dir * 9;
    this.speedlines(true);
    // quick run wind-up, then a leap (spinning for heavy hits)
    u.el.classList.add('running');
    await U.wait(95);
    u.el.classList.remove('running');
    u.el.classList.add('dashing', 'jumping');
    if (opts.spin) u.el.classList.add('spin');
    u.el.style.left = tx + '%';
    SFX.play('whoosh');
    await U.wait(360);
    u.el.classList.remove('jumping', 'spin');
    const c = centerOf(u.el); FX.dust(c.x, c.y + 30); Shake.hit(4);
    this.speedlines(false);
  },

  // anime clash: crossed slashes + burst + a bright pop at the point of contact
  clashBurst(x, y, color) {
    FX.slash(x, y, color || '#ffffff');
    FX.slash(x, y, '#ffe07a');
    FX.ring(x, y, '#ffffff');
    FX.stars(x, y);
    FX.spawn(x, y, { count: 16, colors: ['#ffffff', '#ffe07a', color || '#ffd93d'], maxSpd: 7, sizeMin: 2, sizeMax: 5, lifeMax: 22 });
    const pop = U.el('div', 'clash-pop');
    pop.style.left = x + 'px'; pop.style.top = y + 'px';
    document.getElementById('float-layer').appendChild(pop);
    setTimeout(() => pop.remove(), 380);
  },

  // brief hit-stop / freeze-frame for impact weight
  freeze(ms = 120) {
    const b = document.getElementById('battle');
    b.classList.add('hitstop');
    setTimeout(() => b.classList.remove('hitstop'), ms);
  },

  // quick evasive sidestep with a fading afterimage
  dodgeMove(u) {
    if (!u || !u.el) return;
    const body = u.el.querySelector('.au-body');
    if (body) {
      const ghost = body.cloneNode(true);
      ghost.classList.add('dodge-ghost');
      u.el.appendChild(ghost);
      setTimeout(() => ghost.remove(), 360);
    }
    u.el.classList.remove('dodging'); void u.el.offsetWidth; u.el.classList.add('dodging');
    setTimeout(() => u.el && u.el.classList.remove('dodging'), 380);
  },
  async dashBack(u) {
    u.el.classList.add('jumping');
    u.el.classList.remove('dashing');
    u.el.style.left = u.homeX + '%';
    await U.wait(320);
    u.el.classList.remove('jumping');
  },

  impact(target, dmg, opts = {}) {
    if (!target || target.hp <= 0) { if (!opts.incoming) return; }
    // dodge (blessed) — a slick sidestep with an afterimage
    if (target.isMeme && target.meme.traits.includes('blessed') && U.chance(0.14) && !opts.incoming) {
      const c = centerOf(target.el);
      this.dodgeMove(target);
      floatText(c.x, c.y - 50, 'DODGE!', { color: '#4bc292', size: 22 });
      SFX.play('whoosh');
      return;
    }
    // shield absorb
    const sh = target.statuses.find(s => s.id === 'shield');
    if (sh && sh.power > 0) {
      const ab = Math.min(sh.power, dmg); dmg -= ab; sh.power -= ab;
      if (sh.power <= 0) this.removeStatus(target, 'shield');
    }
    if (target.isMeme && target.meme.traits.includes('ratiod')) dmg = Math.round(dmg * 1.12);
    if (target.isMeme && target.meme.cls === 'fighter') dmg = Math.round(dmg * 0.9);   // Fighter: Tough
    dmg = Math.max(0, Math.round(dmg));
    target.hp = Math.max(0, target.hp - dmg);
    this.updateHp(target);

    const c = centerOf(target.el);
    target.el.classList.remove('hurt'); void target.el.offsetWidth; target.el.classList.add('hurt');

    if (opts.crit || opts.big) {
      floatText(c.x, c.y - 48, `${dmg}`, { color: '#e0655e', size: opts.big ? 46 : 38 });
      if (opts.grade === 'perfect' || opts.big) floatText(c.x, c.y - 86, U.pick(DATA.CRIT_WORDS), { color: '#d9b45f', size: 20 });
      FX.boom(c.x, c.y); FX.ring(c.x, c.y, '#d9b45f'); FX.stars(c.x, c.y); SFX.play('crit'); Shake.hit(10);
    } else {
      floatText(c.x, c.y - 46, `${dmg}`, { color: opts.incoming ? '#ffb0aa' : '#fff', size: opts.small ? 22 : 28 });
      FX.hit(c.x, c.y); FX.ring(c.x, c.y, opts.incoming ? '#e0655e' : '#f2f4f4'); SFX.play(target.isMeme ? 'hurt' : 'bonk'); Shake.hit(opts.small ? 3 : 6);
    }
    this.renderTeamTrack();
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
          k.abilities = Genetics.abilities(k.meme);   // pick up any newly learned move
          this.updateHp(k);
          const kc = centerOf(k.el); FX.confetti(kc.x, kc.y, 16);
          floatText(kc.x, kc.y - 80, 'LEVEL UP!', { color: '#d9b45f', size: 20 });
          for (const id of (k.meme._lastLearned || [])) {
            floatText(kc.x, kc.y - 108, 'Learned ' + DATA.ABILITIES[id].name + '!', { color: '#4a9fd4', size: 16 });
            this.log(`${k.name} learned ${DATA.ABILITIES[id].name}!`, true, DATA.ABILITIES[id].ico);
          }
        }
      }
      if (u.def.splits) {
        Game.discoverVirus('miniblob');
        for (let i = 0; i < 2; i++) {
          const mini = { id: U.uid('v'), isMeme: false, def: DATA.VIRUSES.miniblob, virusId: 'miniblob', side: 'R',
            name: DATA.VIRUSES.miniblob.name,
            stats: { atk: DATA.VIRUSES.miniblob.atk, int: DATA.VIRUSES.miniblob.atk, spd: DATA.VIRUSES.miniblob.spd, lck: 3, crit: 4, resist: 0 },
            hp: DATA.VIRUSES.miniblob.hp, hpMax: DATA.VIRUSES.miniblob.hp, statuses: [], abilities: ['bonk'], cds: {},
            el: null, body: null, back: true };
          mini.x = U.clamp(u.x + (i ? 5 : -5), 60, 92); mini.homeX = mini.x;
          st.units.push(mini); this.spawnUnit(mini);
        }
        this.log('The blob split!', false, 'virus');
      }
    }
    setTimeout(() => { if (u.el) u.el.remove(); }, 480);
    this.renderTeamTrack();
  },

  /* ============================================================
     STATUS / STATS
     ============================================================ */
  outMult(u) {
    let m = 1;
    if (u.statuses.some(s => s.id === 'atkUp')) m *= 1.35;
    if (u.statuses.some(s => s.id === 'atkDown')) m *= 0.65;
    if (u.isMeme && u.meme.traits.includes('stale')) m *= 0.9;
    if (u.isMeme) {
      if (u.meme.cls === 'mage') m *= 1.12;                               // Mage: Arcane
      if (u.meme.cls === 'barbarian' && u.hp / u.hpMax < 0.5) m *= 1.3;   // Barbarian: Rage
    }
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
    // Cleric: Faithful — mend the whole team a little each of its turns
    if (u.isMeme && u.meme.cls === 'cleric' && u.hp > 0) {
      for (const a of this.livingMemes()) if (a.hp < a.hpMax) { a.hp = Math.min(a.hpMax, a.hp + 2); this.updateHp(a); }
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
    this.renderTeamTrack();
  },

  // live tracker of YOUR memes (top-left) — "track your memes too"
  renderTeamTrack() {
    const box = document.getElementById('team-track');
    if (!box || !this.state) return;
    const memes = this.state.units.filter(u => u.isMeme);
    box.innerHTML = memes.map(u => {
      const pct = U.clamp(u.hp / u.hpMax * 100, 0, 100);
      const dead = u.hp <= 0;
      const active = u === this.state.active;
      return `<div class="tt-unit${dead ? ' dead' : ''}${active ? ' active' : ''}">
        <div class="tt-face">${Sprite.memeSVG(u.meme, { equip: false, size: 30 })}</div>
        <div class="tt-meta"><span class="tt-name">${U.esc(u.name)}</span>
          <div class="tt-bar"><div style="width:${pct}%"></div></div>
          <span class="tt-hp">${Math.max(0, u.hp)}/${u.hpMax}</span></div>
      </div>`;
    }).join('');
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
        case 'energy': { const t = await pick(false); if (!t) return; Game.removeItem(id); t.cds = {}; toast(`${U.esc(t.name)}'s abilities are ready!`, 2400, 'energycan'); break; }
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
    if (this.tutorial) { Game.state.tutorialDone = true; this.tutorial = false; }
    this.camWide();
    const stage = st.stage;
    const survivors = this.livingMemes();

    for (const u of st.deadMemes) Game.killMeme(u.meme, `deleted in ${stage.name}`);

    let coins = 0, itemDrop = null, xpEach = 0, pack = null;
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
        u.meme.stagesFought = (u.meme.stagesFought || 0) + 1;   // burn a point of energy
        if (Game.energyLeft(u.meme) <= 0 && Game.retire(u.meme)) retiredNames.push(u.meme.name);
      }
      // clearing a stage always drops a skill-card pack (opened back on the desktop)
      pack = Game.awardPack(stage.diff || 0);
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
            ${pack ? `<span class="loot-chip gold">${Icon.ico('cards', 18)} Skill Pack</span>` : ''}
          </div>
          ${pack ? `<p style="font-size:12px;opacity:.75;margin-top:6px">A <b>Skill Card Pack</b> dropped — open it back home to teach your memes.</p>` : ''}
          ${retiredNames.length ? `<p style="font-size:12px;color:var(--gold);margin-top:6px">${Icon.ico('crown', 13)} <b>${retiredNames.map(U.esc).join(', ')}</b> ran out of energy after ${Game.MAX_STAGES} stages and RETIRED — breed them for the next generation.</p>` : ''}`
        : result === 'fled' ? '<p>You grabbed your memes and ran.</p>' : '<p>The viruses took the field... your desktop mourns.</p>'}
        ${deadList.length ? `<p style="margin-top:8px;color:var(--red)"><b>Fallen:</b> ${deadList.map(U.esc).join(', ')}</p>` : ''}
      </div>`,
      actions: [{
        label: 'Back to Desktop', cls: 'good', fn: () => {
          document.getElementById('battle').classList.add('hidden');
          document.getElementById('team-track').innerHTML = '';
          this.camWide();
          Game.postBattle();
          if (typeof Desktop.drainPacks === 'function') Desktop.drainPacks();
        },
      }],
    });
  },
};
