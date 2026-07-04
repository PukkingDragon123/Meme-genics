/* ============================================================
   MEME-GENICS — game.js
   Global state, save/load, economy, shop, instant breeding,
   progressive unlocks. No day system — turnover comes from
   retirement and battle deaths.
   ============================================================ */

const Game = {
  SAVE_KEY: 'memegenics_save_v3',
  CAPACITY: 12,

  state: null,

  /* ---------------- new game / persistence ---------------- */

  newState() {
    return {
      coins: 40,
      memes: [],
      graveyard: [],
      inventory: {},
      missionsDone: {},
      cloudWave: 0,
      shopStock: [],
      seenIntro: false,
      unlocks: {},
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
    if (typeof Combat !== 'undefined' && Combat.state && !Combat.state.over) return;
    try { localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.state)); }
    catch (e) { /* storage unavailable */ }
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

  reset() { localStorage.removeItem(this.SAVE_KEY); location.reload(); },

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

  addItem(id, n = 1) { this.unlock('inventory'); this.state.inventory[id] = (this.state.inventory[id] || 0) + n; },
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
    this.state.graveyard.push({ meme, cause, epitaph: U.pick(DATA.EPITAPHS) });
    this.unlock('graveyard');
    Desktop.removeWalker(meme.id);
    Desktop.updateTray();
  },

  // send a meme to the Hall of Fame for coins (roster valve + coin sink)
  donate(meme) {
    const payout = 15 + meme.gen * 8 + meme.level * 6;
    const idx = this.state.memes.indexOf(meme);
    if (idx >= 0) this.state.memes.splice(idx, 1);
    Desktop.removeWalker(meme.id);
    this.addCoins(payout, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    Desktop.updateTray();
    toast(`<b>${U.esc(meme.name)}</b> joined the Hall of Fame. +${payout}`, 3200, 'trophy');
    return payout;
  },

  /* ============================================================
     POST-BATTLE — the between-fights beat (no calendar day).
     Babies grow up, the shop restocks, a stray may show up.
     ============================================================ */
  postBattle() {
    // grow all babies into adults after a fight
    for (const m of this.state.memes) if (!m.matured) m.matured = true;
    if (this.isUnlocked('shop')) this.restockShop();
    if (U.chance(0.4) && this.state.memes.length < this.CAPACITY) this.strayEvent();
    else if (U.chance(0.3)) { const amt = U.randInt(6, 16); this.addCoins(amt, null); toast(`Found ${amt} coins in the cache!`, 2600, 'coin'); }
    this.ensureNotSoftlocked();
    Desktop.refreshWalkers();
    Desktop.refreshAllWindows();
    Desktop.updateTray();
    this.save();
  },

  strayEvent() {
    const wanderer = Genetics.newMeme({});
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
        { label: 'Adopt!', cls: 'good', fn: () => { this.addMeme(wanderer); SFX.play('birth'); toast(`${U.esc(wanderer.name)} moved in!`, 3000, 'gift'); this.save(); } },
        { label: 'No thanks', cls: '' },
      ],
    });
  },

  ensureNotSoftlocked() {
    if (this.state.memes.length === 0) {
      const rescue = Genetics.newMeme({ name: 'Recycle Bin ' + Genetics.randomName() });
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
      case 'xp': {
        const ups = Genetics.grantXp(meme, it.power || 40);
        toast(`<b>${U.esc(meme.name)}</b> gained XP${ups ? ' — LEVEL UP!' : ''}!`, 3000, 'star');
        SFX.play(ups ? 'levelup' : 'heal');
        break;
      }
      case 'grow':
        if (Genetics.stage(meme) !== 'baby') { toast('That meme is already grown!', 3000, 'flower'); SFX.play('error'); return false; }
        meme.matured = true;
        toast(`<b>${U.esc(meme.name)}</b> grew up INSTANTLY!`, 3200, 'flower');
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
        toast(`Cleansed <b>${DATA.TRAITS[t].name}</b> from <b>${U.esc(meme.name)}</b>!`, 3200, 'spray');
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
    m.retired = false;
    m.matured = true;
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
