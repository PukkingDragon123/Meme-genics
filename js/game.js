/* ============================================================
   MEME-GENICS — game.js
   Global state, save/load, the DAY cycle, economy, shop,
   overnight breeding, progressive unlocks. Mewgenics loop.
   ============================================================ */

const Game = {
  SAVE_KEY: 'memegenics_save_v2',
  CAPACITY: 12,

  state: null,

  /* ---------------- new game / persistence ---------------- */

  newState() {
    return {
      day: 1,
      coins: 40,
      memes: [],
      graveyard: [],
      inventory: {},
      missionsDone: {},
      cloudWave: 0,
      shopStock: [],
      shopDay: 0,
      seenIntro: false,
      pairing: null,          // {a, b} — tonight's breeding couple
      unlocks: {},            // shop / inventory / graveyard / endless
      stats: { battles: 0, wins: 0, virusesDeleted: 0, memesBred: 0, retired: 0 },
    };
  },

  newGame() {
    this.state = this.newState();
    this.state.memes.push(Genetics.starterDoge());
    this.state.memes.push(Genetics.starterFrog());
    this.restockShop();
    this.save();
  },

  save() {
    // never persist mid-battle: battle mutations only become canon on Combat.finish()
    if (typeof Combat !== 'undefined' && Combat.state && !Combat.state.over) return;
    try { localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.state)); }
    catch (e) { /* storage unavailable — session play only */ }
  },

  load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      if (!s || !Array.isArray(s.memes)) return false;
      this.state = Object.assign(this.newState(), s);
      return true;
    } catch (e) { return false; }
  },

  reset() {
    localStorage.removeItem(this.SAVE_KEY);
    location.reload();
  },

  /* ---------------- accessors ---------------- */

  getMeme(id) { return this.state.memes.find(m => m.id === id); },
  aliveAdults() { return this.state.memes.filter(m => Genetics.stage(m) !== 'baby'); },
  deployable() { return this.state.memes.filter(m => Genetics.stage(m) !== 'baby' && !m.retired); },

  /* ---------------- unlocks ---------------- */

  isUnlocked(key) { return !!this.state.unlocks[key]; },

  unlock(key) {
    if (this.state.unlocks[key]) return false;
    this.state.unlocks[key] = true;
    const u = DATA.UNLOCKS[key];
    if (u) {
      SFX.play('levelup');
      Modal.show({
        defer: true,
        title: `${Icon.ico(u.ico, 22)} NEW: ${u.name}`,
        bodyHTML: `<div style="text-align:center">
          <div style="margin:6px auto">${Icon.ico(u.ico, 56)}</div>
          <p>${U.esc(u.desc)}</p>
          <p style="font-size:11px;opacity:.6;margin-top:6px">Find it on your desktop or the MEME menu.</p>
        </div>`,
      });
    }
    if (typeof Desktop !== 'undefined') { Desktop.buildIcons(); Desktop.buildStartMenu(); }
    return true;
  },

  /* ---------------- coins ---------------- */

  addCoins(n, fxAt) {
    this.state.coins = Math.max(0, this.state.coins + n);
    Desktop.updateTray();
    if (n > 0 && fxAt) { FX.coins(fxAt.x, fxAt.y, Math.min(12, Math.ceil(n / 5))); SFX.play('coin'); }
  },

  spend(n) {
    if (this.state.coins < n) { SFX.play('error'); toast('Not enough dogecoins! Go delete some viruses.', 3000, 'coin'); return false; }
    this.state.coins -= n;
    Desktop.updateTray();
    SFX.play('coin');
    return true;
  },

  /* ---------------- inventory ---------------- */

  addItem(id, n = 1) {
    this.unlock('inventory');
    this.state.inventory[id] = (this.state.inventory[id] || 0) + n;
  },
  removeItem(id, n = 1) {
    if (!this.state.inventory[id]) return false;
    this.state.inventory[id] -= n;
    if (this.state.inventory[id] <= 0) delete this.state.inventory[id];
    return true;
  },

  /* ---------------- shop ---------------- */

  restockShop() {
    const pool = Object.keys(DATA.ITEMS);
    this.state.shopStock = U.shuffle(pool).slice(0, 6);
    if (!this.state.shopStock.includes('pizza')) this.state.shopStock[0] = 'pizza';
    this.state.shopDay = this.state.day;
  },

  /* ---------------- meme lifecycle ---------------- */

  addMeme(meme) {
    if (this.state.memes.length >= this.CAPACITY) return false;
    this.state.memes.push(meme);
    Desktop.spawnWalker(meme);
    Desktop.updateTray();
    return true;
  },

  killMeme(meme, cause) {
    const idx = this.state.memes.indexOf(meme);
    if (idx >= 0) this.state.memes.splice(idx, 1);
    this.state.graveyard.push({
      meme, cause, day: this.state.day,
      epitaph: U.pick(DATA.EPITAPHS),
    });
    this.unlock('graveyard');
    Desktop.removeWalker(meme.id);
    Desktop.updateTray();
  },

  // voluntary retirement to the Hall of Fame — a coin payout + roster valve
  donate(meme) {
    const payout = 15 + meme.gen * 8 + meme.level * 6;
    const idx = this.state.memes.indexOf(meme);
    if (idx >= 0) this.state.memes.splice(idx, 1);
    Desktop.removeWalker(meme.id);
    this.addCoins(payout, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    Desktop.updateTray();
    SFX.play('coin');
    toast(`<b>${U.esc(meme.name)}</b> joined the Hall of Fame. +${payout}`, 3200, 'trophy');
    return payout;
  },

  /* ============================================================
     THE DAY CYCLE — the core Mewgenics beat.
     Ending the day advances time: overnight breeding resolves,
     memes age, a stray may show up, old memes go stale.
     ============================================================ */
  advanceDay(silent) {
    const s = this.state;
    s.day++;
    const obituaries = [];
    const matured = [];
    const births = [];

    // --- overnight breeding (the paired couple) ---
    if (s.pairing) {
      const A = this.getMeme(s.pairing.a), B = this.getMeme(s.pairing.b);
      s.pairing = null;
      if (A && B && Genetics.stage(A) !== 'baby' && Genetics.stage(B) !== 'baby') {
        const litter = U.chance(0.25) ? 2 : 1;
        for (let i = 0; i < litter && s.memes.length < this.CAPACITY; i++) {
          const res = Genetics.breed(A, B, s.day);
          s.memes.push(res.baby);
          Desktop.spawnWalker(res.baby);
          births.push(res);
          s.stats.memesBred++;
        }
        if (births.length) { A.breedCd = 3; B.breedCd = 3; }
      }
    }

    // --- aging ---
    for (const m of s.memes.slice()) {
      m.age++;
      if (m.breedCd > 0) m.breedCd--;
      if (m.age === Genetics.ADULT_AGE) matured.push(m);
      if (m.age >= Genetics.effLifespan(m)) obituaries.push(m);
    }
    for (const m of obituaries) this.killMeme(m, 'went stale (old age)');

    if (s.day - s.shopDay >= 1 && this.isUnlocked('shop')) this.restockShop();

    Desktop.updateTray();
    Desktop.refreshWalkers();
    Desktop.refreshAllWindows();

    // --- morning births ---
    for (const { baby, inbred } of births) {
      SFX.play('birth');
      Modal.show({
        defer: true,
        title: `${Icon.ico('egg', 22)} A meme was born overnight!`,
        bodyHTML: `<div style="text-align:center">
          <div style="width:120px;margin:0 auto">${Sprite.memeSVG(baby, { size: 120 })}</div>
          <h3>${U.esc(baby.name)} <span class="gen">GEN ${baby.gen}</span></h3>
          <p style="font-size:12px;opacity:.8">${U.esc(Genetics.describe(baby))}</p>
          <div class="trait-list" style="justify-content:center;margin:6px 0">${baby.traits.map(t => Desktop.traitPill(t)).join('') || '<span style="opacity:.5;font-size:12px">no traits — a blank slate</span>'}</div>
          <div class="ability-list" style="justify-content:center">${Genetics.abilities(baby).map(a => Desktop.abilityPill(a)).join('')}</div>
          ${inbred ? '<p style="color:var(--red);font-size:12px"><b>...it is a repost.</b></p>' : ''}
          <p style="font-size:11px;opacity:.6;margin-top:6px">Grows into a fighter tomorrow.</p>
        </div>`,
      });
    }

    // --- announcements ---
    for (const m of matured) {
      toast(`<b>${U.esc(m.name)}</b> grew into a full-size meme!`, 3000, 'sprout');
      SFX.play('levelup');
    }
    for (const m of obituaries) {
      SFX.play('sadtrombone');
      Modal.show({
        defer: true,
        title: `${Icon.ico('skull', 22)} Press F`,
        bodyHTML: `<div style="text-align:center">
          <div style="width:80px;margin:0 auto">${Sprite.tombSVG(80)}</div>
          <p style="margin-top:8px"><b>${U.esc(m.name)}</b> ${U.esc(U.pick(DATA.EPITAPHS))}.</p>
          <p style="font-size:12px;opacity:.7">Survived ${m.age} days · Gen ${m.gen} · ${m.kills} viruses deleted</p>
          <p style="font-size:12px;margin-top:6px">Their genes live on. Visit the Graveyard to necropost them... for a price.</p>
        </div>`,
        actions: [{ label: 'F', cls: 'bad' }],
      });
    }
    for (const m of s.memes) {
      const left = Genetics.effLifespan(m) - m.age;
      if (left === 3) toast(`<b>${U.esc(m.name)}</b> is getting stale... 3 days of freshness left!`, 3000, 'hourglass');
    }

    if (!silent) this.morningEvent();
    this.ensureNotSoftlocked();
    this.save();
  },

  /* ---------------- morning events ---------------- */

  morningEvent() {
    const s = this.state;
    const roll = Math.random();

    // a stray meme shows up at the door (Mewgenics staple)
    if (roll < 0.32 && s.memes.length < this.CAPACITY) {
      const wanderer = Genetics.newMeme({ bornDay: s.day });
      Modal.show({
        defer: true,
        title: `${Icon.ico('gift', 22)} A stray showed up`,
        bodyHTML: `<div style="text-align:center">
          <div style="width:110px;margin:0 auto">${Sprite.memeSVG(wanderer, { size: 110 })}</div>
          <p><b>${U.esc(wanderer.name)}</b></p>
          <p style="font-size:12px;opacity:.75">${U.esc(U.pick(DATA.WANDERER_INTROS))}</p>
          <p style="font-size:12px;margin-top:4px">${U.esc(Genetics.describe(wanderer))}</p>
          <div class="trait-list" style="justify-content:center;margin-top:6px">${wanderer.traits.map(t => Desktop.traitPill(t)).join('')}</div>
        </div>`,
        actions: [
          { label: 'Adopt!', cls: 'good', fn: () => { this.addMeme(wanderer); SFX.play('birth'); toast(`${U.esc(wanderer.name)} moved onto your desktop!`, 3000, 'gift'); this.save(); } },
          { label: 'No thanks', cls: '' },
        ],
      });
    } else if (roll < 0.46) {
      const amt = U.randInt(8, 22);
      this.addCoins(amt, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      toast(`STONKS! The meme market went up. +${amt}`, 3000, 'chartup');
    } else if (roll < 0.56 && s.memes.length) {
      const m = U.pick(s.memes);
      const ups = Genetics.grantXp(m, U.randInt(8, 16));
      toast(`<b>${U.esc(m.name)}</b> had an original thought (rare). +XP${ups ? ' — LEVEL UP!' : ''}`, 3000, 'star');
      if (ups) SFX.play('levelup');
    }
  },

  ensureNotSoftlocked() {
    if (this.state.memes.length === 0) {
      const rescue = Genetics.newMeme({ bornDay: this.state.day, name: 'Recycle Bin ' + Genetics.randomName() });
      this.state.memes.push(rescue);
      Desktop.spawnWalker(rescue);
      Modal.show({
        defer: true,
        title: `${Icon.ico('recycle', 22)} A hero emerges`,
        bodyHTML: `<div style="text-align:center">
          <div style="width:110px;margin:0 auto">${Sprite.memeSVG(rescue, { size: 110 })}</div>
          <p>Your desktop was memeless... but <b>${U.esc(rescue.name)}</b> crawled out of the Recycle Bin to save the day!</p>
        </div>`,
      });
    }
  },

  /* ---------------- home item usage ---------------- */

  useHomeItem(itemId, meme) {
    const it = DATA.ITEMS[itemId];
    if (!it || !it.home) return false;
    switch (it.home) {
      case 'lifespan':
        meme.lifespanBonus = (meme.lifespanBonus || 0) + it.power;
        toast(`<b>${U.esc(meme.name)}</b> will stay fresh ${it.power} extra days!`, 3000, 'flask');
        SFX.play('heal');
        break;
      case 'grow':
        if (Genetics.stage(meme) !== 'baby') { toast('That meme is already fully grown!', 3000, 'flower'); SFX.play('error'); return false; }
        meme.age = Genetics.ADULT_AGE;
        toast(`<b>${U.esc(meme.name)}</b> grew up INSTANTLY. Nature is amazing (this is not nature).`, 3200, 'flower');
        SFX.play('levelup');
        break;
      case 'trait': {
        const options = DATA.GOOD_TRAITS.filter(t => !meme.traits.includes(t));
        if (!options.length) { toast('No room for more dankness!', 3000, 'syringe'); SFX.play('error'); return false; }
        if (meme.traits.length >= Genetics.MAX_TRAITS) {
          const bad = meme.traits.findIndex(t => DATA.TRAITS[t].kind === 'bad');
          if (bad === -1) { toast('Trait slots full!', 3000, 'syringe'); SFX.play('error'); return false; }
          meme.traits.splice(bad, 1);
        }
        const t = U.pick(options);
        meme.traits.push(t);
        toast(`<b>${U.esc(meme.name)}</b> gained <b>${DATA.TRAITS[t].name}</b>!`, 3200, 'syringe');
        SFX.play('levelup');
        break;
      }
      case 'cleanse': {
        const bads = meme.traits.filter(t => DATA.TRAITS[t].kind === 'bad');
        if (!bads.length) { toast('This meme is already fresh af.', 3000, 'spray'); SFX.play('error'); return false; }
        const t = U.pick(bads);
        meme.traits.splice(meme.traits.indexOf(t), 1);
        toast(`Febreze'd the <b>${DATA.TRAITS[t].name}</b> right out of <b>${U.esc(meme.name)}</b>!`, 3200, 'spray');
        SFX.play('heal');
        break;
      }
      default: return false;
    }
    meme.hpMax = Genetics.effStats(meme).hp;
    this.removeItem(itemId);
    this.save();
    return true;
  },

  /* ---------------- necropost (graveyard revive) ---------------- */

  necropostCost(entry) { return 40 + entry.meme.gen * 10 + entry.meme.level * 10; },

  necropost(entry) {
    if (entry.meme.necroposted) { toast('You can only necropost a meme once. Let them rest.', 3000, 'skull'); return false; }
    if (this.state.memes.length >= this.CAPACITY) { toast('Desktop is full!', 3000, 'warning'); SFX.play('error'); return false; }
    const cost = this.necropostCost(entry);
    if (!this.spend(cost)) return false;
    const m = entry.meme;
    m.necroposted = true;
    m.retired = false;   // a fresh un-life, ready to fight again
    m.age = Math.max(Genetics.ADULT_AGE, Math.round(Genetics.effLifespan(m) * 0.5));
    if (!m.traits.includes('zombie')) {
      if (m.traits.length >= Genetics.MAX_TRAITS) m.traits.pop();
      m.traits.push('zombie');
    }
    m.hpMax = Genetics.effStats(m).hp;
    this.state.graveyard.splice(this.state.graveyard.indexOf(entry), 1);
    this.state.memes.push(m);
    Desktop.spawnWalker(m);
    Desktop.updateTray();
    SFX.play('zap');
    bigBanner('NECROPOSTED!');
    toast(`<b>${U.esc(m.name)}</b> rises from the archive!`, 3200, 'skull');
    this.save();
    return true;
  },
};
