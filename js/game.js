/* ============================================================
   MEME-GENICS — game.js
   Global state, save/load, day cycle, economy, shop, events
   ============================================================ */

const Game = {
  SAVE_KEY: 'memegenics_save_v1',
  CAPACITY: 12,

  state: null,

  /* ---------------- new game / persistence ---------------- */

  newState() {
    return {
      day: 1,
      coins: 60,
      memes: [],
      graveyard: [],
      inventory: { pizza: 2 },
      missionsDone: {},
      cloudWave: 0,
      shopStock: [],
      shopDay: 0,
      seenIntro: false,
      stats: { battles: 0, wins: 0, virusesDeleted: 0, memesBred: 0 },
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

  /* ---------------- coins ---------------- */

  addCoins(n, fxAt) {
    this.state.coins = Math.max(0, this.state.coins + n);
    Desktop.updateTray();
    if (n > 0 && fxAt) { FX.coins(fxAt.x, fxAt.y, Math.min(12, Math.ceil(n / 5))); SFX.play('coin'); }
  },

  spend(n) {
    if (this.state.coins < n) { SFX.play('error'); toast('🪙 Not enough dogecoins! Go delete some viruses.'); return false; }
    this.state.coins -= n;
    Desktop.updateTray();
    SFX.play('coin');
    return true;
  },

  /* ---------------- inventory ---------------- */

  addItem(id, n = 1) {
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
    // pizza is a staple, like real life
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
    Desktop.removeWalker(meme.id);
    Desktop.updateTray();
  },

  /* ---------------- day cycle ---------------- */

  advanceDay(silent) {
    const s = this.state;
    s.day++;
    const obituaries = [];
    const matured = [];

    for (const m of s.memes.slice()) {
      m.age++;
      if (m.breedCd > 0) m.breedCd--;
      if (m.age === Genetics.ADULT_AGE) matured.push(m);
      if (m.age >= Genetics.effLifespan(m)) obituaries.push(m);
    }
    for (const m of obituaries) this.killMeme(m, 'went stale (old age)');

    if (s.day - s.shopDay >= 1) this.restockShop();

    Desktop.updateTray();
    Desktop.refreshWalkers();

    // announcements
    for (const m of matured) {
      toast(`🎉 <b>${U.esc(m.name)}</b> grew into a full-size meme!`);
      SFX.play('levelup');
    }
    for (const m of obituaries) {
      SFX.play('sadtrombone');
      Modal.show({
        title: '💀 Press F',
        bodyHTML: `<div style="text-align:center">
          <div style="width:90px;margin:0 auto">${Sprite.tombSVG()}</div>
          <p style="margin-top:8px"><b>${U.esc(m.name)}</b> ${U.esc(U.pick(DATA.EPITAPHS))}.</p>
          <p style="font-size:12px;opacity:.7">Survived ${m.age} days · Gen ${m.gen} · ${m.kills} viruses deleted</p>
          <p style="font-size:12px;margin-top:6px">Their genes live on. Visit the Graveyard to necropost them back... for a price.</p>
        </div>`,
        actions: [{ label: 'F', cls: 'bad' }],
      });
    }

    // warnings for elders
    for (const m of s.memes) {
      const left = Genetics.effLifespan(m) - m.age;
      if (left === 3) toast(`⏳ <b>${U.esc(m.name)}</b> is getting stale... 3 days of freshness left!`);
    }

    if (!silent) this.randomEvent();
    this.ensureNotSoftlocked();
    this.save();
  },

  /* ---------------- random desktop events ---------------- */

  randomEvent() {
    const s = this.state;
    const roll = Math.random();

    if (roll < 0.22 && s.memes.length < this.CAPACITY) {
      // a wandering meme wants to move in
      const wanderer = Genetics.newMeme({ bornDay: s.day });
      Modal.show({
        title: '📦 Special Delivery!',
        bodyHTML: `<div style="text-align:center">
          <div style="width:110px;margin:0 auto">${Sprite.memeSVG(wanderer)}</div>
          <p><b>${U.esc(wanderer.name)}</b></p>
          <p style="font-size:12px;opacity:.75">${U.esc(U.pick(DATA.WANDERER_INTROS))}</p>
          <p style="font-size:12px;margin-top:4px">${U.esc(Genetics.describe(wanderer))}</p>
          <div style="margin-top:6px">${wanderer.traits.map(t => Desktop.traitPill(t)).join(' ')}</div>
        </div>`,
        actions: [
          { label: '🏠 Adopt!', cls: 'good', fn: () => { this.addMeme(wanderer); SFX.play('birth'); toast(`🏠 ${U.esc(wanderer.name)} moved onto your desktop!`); this.save(); } },
          { label: 'No thanks', cls: '' },
        ],
      });
    } else if (roll < 0.34) {
      const amt = U.randInt(8, 25);
      this.addCoins(amt, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      toast(`📈 STONKS! The meme market went up. +${amt} 🪙`);
    } else if (roll < 0.44 && s.memes.length) {
      const m = U.pick(s.memes);
      const ups = Genetics.grantXp(m, U.randInt(8, 18));
      toast(`💡 <b>${U.esc(m.name)}</b> had an original thought (rare). +XP${ups ? ' — LEVEL UP!' : ''}`);
      if (ups) SFX.play('levelup');
    } else if (roll < 0.52) {
      Desktop.spawnScamPopup();
    }
  },

  ensureNotSoftlocked() {
    // no memes and can't afford anything? a rescue meme crawls out of the recycle bin
    if (this.state.memes.length === 0) {
      const rescue = Genetics.newMeme({ bornDay: this.state.day, name: 'Recycle Bin ' + Genetics.randomName() });
      this.state.memes.push(rescue);
      Desktop.spawnWalker(rescue);
      Modal.show({
        title: '🗑️ A hero emerges',
        bodyHTML: `<div style="text-align:center">
          <div style="width:110px;margin:0 auto">${Sprite.memeSVG(rescue)}</div>
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
        toast(`🧪 <b>${U.esc(meme.name)}</b> will stay fresh ${it.power} extra days!`);
        SFX.play('heal');
        break;
      case 'grow':
        if (Genetics.stage(meme) !== 'baby') { toast('🌻 That meme is already fully grown!'); SFX.play('error'); return false; }
        meme.age = Genetics.ADULT_AGE;
        toast(`🌻 <b>${U.esc(meme.name)}</b> grew up INSTANTLY. Nature is amazing (this is not nature).`);
        SFX.play('levelup');
        break;
      case 'trait': {
        const options = DATA.GOOD_TRAITS.filter(t => !meme.traits.includes(t));
        if (!options.length) { toast('💉 No room for more dankness!'); SFX.play('error'); return false; }
        if (meme.traits.length >= Genetics.MAX_TRAITS) {
          // serum overwrites a bad trait if possible, else fails
          const bad = meme.traits.findIndex(t => DATA.TRAITS[t].kind === 'bad');
          if (bad === -1) { toast('💉 Trait slots full!'); SFX.play('error'); return false; }
          meme.traits.splice(bad, 1);
        }
        const t = U.pick(options);
        meme.traits.push(t);
        toast(`💉 <b>${U.esc(meme.name)}</b> gained <b>${DATA.TRAITS[t].ico} ${DATA.TRAITS[t].name}</b>!`);
        SFX.play('levelup');
        break;
      }
      case 'cleanse': {
        const bads = meme.traits.filter(t => DATA.TRAITS[t].kind === 'bad');
        if (!bads.length) { toast('🌬️ This meme is already fresh af.'); SFX.play('error'); return false; }
        const t = U.pick(bads);
        meme.traits.splice(meme.traits.indexOf(t), 1);
        toast(`🌬️ Febreze'd the <b>${DATA.TRAITS[t].name}</b> right out of <b>${U.esc(meme.name)}</b>!`);
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
    if (entry.meme.necroposted) { toast('🧟 You can only necropost a meme once. Let them rest.'); return false; }
    if (this.state.memes.length >= this.CAPACITY) { toast('🏠 Desktop is full!'); SFX.play('error'); return false; }
    const cost = this.necropostCost(entry);
    if (!this.spend(cost)) return false;
    const m = entry.meme;
    m.necroposted = true;
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
    bigBanner('🧟 NECROPOSTED!');
    toast(`🧟 <b>${U.esc(m.name)}</b> rises from the archive!`);
    this.save();
    return true;
  },
};
