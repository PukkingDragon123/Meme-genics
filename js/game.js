/* ============================================================
   MEME-GENICS — game.js
   Global state, save/load, economy, shop, instant breeding,
   progressive unlocks. No day system — turnover comes from
   retirement and battle deaths.
   ============================================================ */

const Game = {
  SAVE_KEY: 'memegenics_save_v5',
  CAPACITY: 12,
  HATCH_MS: 18000,      // egg incubation time (seconds)
  BREED_CD_MS: 24000,   // per-parent breeding cooldown (seconds)
  MAX_STAGES: 5,        // energy: a meme retires after this many fights

  state: null,

  /* ---------------- new game / persistence ---------------- */

  newState() {
    return {
      coins: 40,
      day: 1,
      memes: [],
      graveyard: [],
      inventory: {},
      missionsDone: {},
      cloudWave: 0,
      shopStock: [],
      seenIntro: false,
      unlocks: {},
      eggs: [],
      dms: [],            // adoption DMs from people online (retired memes)
      pendingPacks: [],   // skill-card packs earned but not yet opened
      dex: { faces: {}, viruses: {} },
      theme: 'green',
      stats: { battles: 0, wins: 0, virusesDeleted: 0, memesBred: 0, retired: 0 },
    };
  },

  newGame() {
    this.state = this.newState();
    this.state.memes.push(Genetics.starterDoge());
    this.state.memes.push(Genetics.starterFrog());
    this.discoverAll();
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
    this.discover(meme.pheno.face);
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

  /* ---------------- energy / retirement ---------------- */

  // fights left before a meme runs out of energy and retires (breed-only)
  energyLeft(meme) { return Math.max(0, this.MAX_STAGES - (meme.stagesFought || 0)); },

  retire(meme) {
    if (!meme || meme.retired) return false;
    meme.retired = true;
    this.state.stats.retired = (this.state.stats.retired || 0) + 1;
    return true;
  },

  /* ---------------- skill card packs ---------------- */

  rollPack(tier = 0) {
    const cards = [];
    for (let i = 0; i < 4; i++) cards.push(DATA.rollCard(tier));
    return cards;
  },

  // hand a fresh pack to the player (opened from the desktop)
  awardPack(tier = 0) {
    const cards = this.rollPack(tier);
    if (!this.state.pendingPacks) this.state.pendingPacks = [];
    this.state.pendingPacks.push(cards);
    return cards;
  },

  cardTitle(card) {
    if (card.kind === 'stat') return `+${card.amt} ${DATA.STAT_NAME[card.stat]}`;
    if (card.kind === 'trait') return DATA.TRAITS[card.trait] ? DATA.TRAITS[card.trait].name : 'Trait';
    if (card.kind === 'ability') return DATA.ABILITIES[card.id] ? DATA.ABILITIES[card.id].name : 'Skill';
    return 'Card';
  },
  cardIcon(card) {
    if (card.kind === 'stat') return DATA.STAT_ICO[card.stat];
    if (card.kind === 'trait') return (DATA.TRAITS[card.trait] && DATA.TRAITS[card.trait].ico) || 'star';
    if (card.kind === 'ability') return (DATA.ABILITIES[card.id] && DATA.ABILITIES[card.id].ico) || card.id;
    return 'star';
  },
  cardDesc(card) {
    if (card.kind === 'stat') return `Permanently boosts ${DATA.STAT_NAME[card.stat]}.`;
    if (card.kind === 'trait') return (DATA.TRAITS[card.trait] && DATA.TRAITS[card.trait].desc) || 'A passive perk.';
    if (card.kind === 'ability') return (DATA.ABILITIES[card.id] && DATA.ABILITIES[card.id].desc) || 'A new combat skill.';
    return '';
  },

  // apply a card to a meme; returns a reason-string on failure, true on success
  applyCard(card, meme) {
    if (!card || !meme) return 'No target';
    if (card.kind === 'stat') {
      meme.base[card.stat] = (meme.base[card.stat] || 0) + card.amt;
      meme.hpMax = Genetics.effStats(meme).hp;
      return true;
    }
    if (card.kind === 'trait') {
      if (meme.traits.includes(card.trait)) return 'Already has it';
      if (meme.traits.length >= Genetics.MAX_TRAITS) {
        const bad = meme.traits.findIndex(t => DATA.TRAITS[t] && DATA.TRAITS[t].kind === 'bad');
        if (bad === -1) return 'Trait slots full';
        meme.traits.splice(bad, 1);
      }
      meme.traits.push(card.trait);
      meme.hpMax = Genetics.effStats(meme).hp;
      return true;
    }
    if (card.kind === 'ability') {
      if (meme.learned && meme.learned.includes(card.id)) return 'Already knows it';
      if (meme.learned && meme.learned.length >= Genetics.MAX_ABILITIES) return 'Skill slots full';
      return Genetics.teach(meme, card.id) ? true : 'Could not learn';
    }
    return 'Unknown card';
  },

  /* ---------------- online adopters (free money for retired memes) ---------------- */

  rollAdoption() {
    if (!this.state.dms) this.state.dms = [];
    if (this.state.dms.length >= 4) return null;
    const already = new Set(this.state.dms.map(d => d.memeId));
    const pool = this.state.memes.filter(m => m.retired && !already.has(m.id));
    if (!pool.length) return null;
    const m = U.pick(pool);
    const payout = 45 + m.gen * 12 + m.level * 8 + Math.round(Genetics.power(m) / 2);
    const dm = {
      id: U.uid('dm'),
      from: U.pick(DATA.ADOPTER_NAMES),
      memeId: m.id,
      memeName: m.name,
      line: U.pick(DATA.ADOPT_LINES).replace('{n}', m.name),
      coins: payout,
    };
    this.state.dms.push(dm);
    return dm;
  },

  acceptAdoption(dm) {
    if (!dm) return 0;
    const m = this.getMeme(dm.memeId);
    const i = this.state.dms.indexOf(dm);
    if (i >= 0) this.state.dms.splice(i, 1);
    if (m) {
      const idx = this.state.memes.indexOf(m);
      if (idx >= 0) this.state.memes.splice(idx, 1);
      Desktop.removeWalker(m.id);
      this.addCoins(dm.coins, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
    Desktop.updateTray();
    this.save();
    return dm.coins;
  },

  declineAdoption(dm) {
    const i = this.state.dms.indexOf(dm);
    if (i >= 0) this.state.dms.splice(i, 1);
    this.save();
  },

  /* ---------------- sleep / skip a day ---------------- */

  sleep() {
    this.state.day = (this.state.day || 1) + 1;
    const now = Date.now();
    // a good night's rest: eggs finish incubating, parents are ready again
    for (const egg of this.state.eggs) egg.hatchAt = Math.min(egg.hatchAt, now);
    for (const m of this.state.memes) { if (m.breedReadyAt) m.breedReadyAt = 0; if (!m.matured) m.matured = true; }
    // overnight coin trickle + fresh shop
    const trickle = U.randInt(5, 14);
    this.addCoins(trickle, null);
    if (this.isUnlocked('shop')) this.restockShop();
    // people online browse overnight and may DM to adopt a retired meme
    if (U.chance(0.75)) this.rollAdoption();
    this.tickEggs();
    Desktop.refreshAllWindows();
    Desktop.updateTray();
    this.save();
    return { day: this.state.day, coins: trickle };
  },

  /* ---------------- eggs / incubation ---------------- */

  secsLeft(untilMs) { return Math.max(0, Math.ceil((untilMs - Date.now()) / 1000)); },

  tickEggs() {
    if (!this.state.eggs || !this.state.eggs.length) return;
    const now = Date.now();
    let hatched = false;
    for (const egg of this.state.eggs.slice()) {
      if (now >= egg.hatchAt) {
        this.state.eggs.splice(this.state.eggs.indexOf(egg), 1);
        if (this.state.memes.length < this.CAPACITY) {
          this.state.memes.push(egg.baby);
          Desktop.spawnWalker(egg.baby);
          this.discover(egg.baby.pheno.face);
          SFX.play('birth');
          const c = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
          FX.confetti(c.x, c.y, 30); FX.ring(c.x, c.y, '#d9b45f');
          toast(`<b>${U.esc(egg.baby.name)}</b> hatched!`, 3200, 'egg');
        } else {
          toast('An egg hatched but the desktop is full!', 3000, 'warning');
        }
        hatched = true;
      }
    }
    if (hatched) { Desktop.updateTray(); Desktop.refreshWindow('breeder'); Desktop.refreshWindow('squad'); this.save(); }
  },

  /* ---------------- dex / discovery ---------------- */

  discover(face) {
    if (!this.state.dex) this.state.dex = { faces: {}, viruses: {} };
    if (!this.state.dex.faces[face]) {
      this.state.dex.faces[face] = true;
      const lbl = DATA.GENES.face.alleles[face];
      if (lbl && this.state.seenIntro) toast(`Index updated: <b>${lbl.label}</b> type discovered!`, 2800, 'roster');
    }
  },
  discoverVirus(id) {
    if (!this.state.dex) this.state.dex = { faces: {}, viruses: {} };
    this.state.dex.viruses[id] = true;
  },
  discoverAll() {
    for (const m of this.state.memes) this.discover(m.pheno.face);
  },

  /* ---------------- theme ---------------- */

  applyTheme(id) {
    const t = DATA.THEMES[id] || DATA.THEMES.green;
    const r = document.documentElement.style;
    r.setProperty('--felt-1', t.felt[0]);
    r.setProperty('--felt-2', t.felt[1]);
    r.setProperty('--felt-3', t.felt[2]);
    this.state.theme = id;
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
    if (U.chance(0.55)) this.rollAdoption();   // someone online may want to adopt a retiree
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
