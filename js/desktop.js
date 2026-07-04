/* ============================================================
   MEME-GENICS — desktop.js
   The fake OS hub: icons, windows, taskbar, roaming walkers,
   Love Nest breeding, squad, shop, graveyard, missions.
   Systems reveal progressively. Pixel icons, no emoji.
   ============================================================ */

const Desktop = {
  windows: {},
  walkers: {},
  zTop: 100,

  /* ============================================================
     INIT
     ============================================================ */
  init() {
    this.buildIcons();
    this.buildStartMenu();
    this.initTray();
    this.updateTray();
    this.startClock();

    document.getElementById('start-btn').onclick = () => {
      SFX.play('click');
      document.getElementById('start-menu').classList.toggle('hidden');
    };
    document.getElementById('desktop').addEventListener('mousedown', e => {
      if (!e.target.closest('#start-menu') && !e.target.closest('#start-btn')) {
        document.getElementById('start-menu').classList.add('hidden');
      }
    });

    document.getElementById('tray-sound').onclick = e => {
      const on = SFX.toggleSound();
      e.currentTarget.classList.toggle('off', !on);
      e.currentTarget.innerHTML = Icon.ico(on ? 'sound' : 'soundoff', 16);
    };
    document.getElementById('tray-music').onclick = e => {
      const on = SFX.toggleMusic();
      e.currentTarget.classList.toggle('off', !on);
    };

    for (const m of Game.state.memes) this.spawnWalker(m);
    this.startWalkerLoop();

    setInterval(() => {
      const ids = Object.keys(this.walkers);
      if (ids.length && U.chance(0.5) && document.getElementById('battle').classList.contains('hidden')) {
        this.sayBubble(U.pick(ids), U.pick(DATA.PHRASES));
      }
    }, 6000);
  },

  initTray() {
    document.getElementById('start-ico').innerHTML = Icon.ico('smiley', 20);
    U.qs('#tray-coins .ci').innerHTML = Icon.ico('coin', 16);
    U.qs('#tray-pop .ci').innerHTML = Icon.ico('roster', 16);
    document.getElementById('tray-sound').innerHTML = Icon.ico('sound', 16);
    document.getElementById('tray-music').innerHTML = Icon.ico('music', 16);
  },

  /* ============================================================
     ICONS + START MENU (gated by unlocks)
     ============================================================ */
  appList() {
    const apps = [
      { ico: 'dna',    label: 'Breeder2000.exe',  fn: () => this.openBreeder() },
      { ico: 'swords', label: 'virus_hunter.exe', fn: () => this.openMissions() },
      { ico: 'roster', label: 'My Memes',         fn: () => this.openSquad() },
      { ico: 'book',   label: 'Meme Index',       fn: () => this.openIndex() },
    ];
    if (Game.isUnlocked('shop'))      apps.push({ ico: 'cart',  label: 'MemeBay',   fn: () => this.openShop() });
    if (Game.isUnlocked('inventory')) apps.push({ ico: 'bag',   label: 'Loot',      fn: () => this.openInventory() });
    if (Game.isUnlocked('graveyard')) apps.push({ ico: 'grave', label: 'Graveyard', fn: () => this.openGraveyard() });
    apps.push({ ico: 'gear', label: 'Customize', fn: () => this.openCustomize() });
    apps.push({ ico: 'doc', label: 'README.txt', fn: () => this.openHelp() });
    return apps;
  },

  buildIcons() {
    const box = document.getElementById('icons');
    box.innerHTML = '';
    for (const d of this.appList()) {
      const el = U.el('div', 'dt-icon');
      el.innerHTML = `<div class="ico">${Icon.ico(d.ico, 34)}</div><div class="lbl">${d.label}</div>`;
      el.onclick = () => { SFX.play('open'); d.fn(); };
      box.appendChild(el);
    }
  },

  buildStartMenu() {
    const sm = document.getElementById('start-menu');
    sm.innerHTML = `<div class="sm-head">MEME-GENICS v5.0</div>`;
    const items = this.appList().slice();
    items.push({ sep: true });
    items.push({ ico: 'reset', label: 'New Game', fn: () => this.confirmReset() });
    for (const it of items) {
      if (it.sep) { sm.appendChild(U.el('div', 'sm-sep')); continue; }
      const el = U.el('div', 'sm-item', `${Icon.ico(it.ico, 20)} ${it.label}`);
      el.onclick = () => { sm.classList.add('hidden'); SFX.play('click'); it.fn(); };
      sm.appendChild(el);
    }
  },

  startClock() {
    const tick = () => {
      const d = new Date();
      let h = d.getHours() % 12; if (h === 0) h = 12;
      document.getElementById('tray-clock').textContent =
        `${h}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
    };
    tick();
    setInterval(tick, 10000);
  },

  updateTray() {
    const s = Game.state;
    U.qs('#tray-coins b').textContent = s.coins;
    U.qs('#tray-pop b').textContent = s.memes.length;
  },

  // playfield (monitor screen) dimensions
  SW() { const e = document.getElementById('screen'); return e ? e.clientWidth : window.innerWidth; },
  SH() { const e = document.getElementById('screen'); return e ? e.clientHeight : window.innerHeight; },

  confirmReset() {
    Modal.show({
      title: `${Icon.ico('reset', 22)} New Game`,
      bodyHTML: `<p style="text-align:center">Delete your whole desktop and start over?<br><b>This cannot be undone!</b></p>`,
      actions: [
        { label: 'Wipe it', cls: 'bad', fn: () => Game.reset() },
        { label: 'Keep my memes', cls: 'good' },
      ],
    });
  },

  /* ============================================================
     WINDOW MANAGER
     ============================================================ */
  openWindow(key, opts) {
    if (this.windows[key]) {
      const w = this.windows[key];
      w.el.style.zIndex = ++this.zTop;
      if (w.refresh) w.refresh();
      return w;
    }
    const el = U.el('div', 'win ' + (opts.cls || ''));
    el.style.zIndex = ++this.zTop;
    const openCount = Object.keys(this.windows).length;
    el.style.left = (opts.x ?? (140 + (openCount % 5) * 44)) + 'px';
    el.style.top = (opts.y ?? (40 + (openCount % 5) * 34)) + 'px';
    if (opts.w) el.style.width = opts.w + 'px';

    const title = U.el('div', 'win-title',
      `<span class="t-ico">${Icon.ico(opts.ico || 'window', 18)}</span><span class="t-label">${opts.title}</span>`);
    const closeBtn = U.el('button', 'win-btn', 'X');
    title.appendChild(closeBtn);
    el.appendChild(title);
    const body = U.el('div', 'win-body');
    el.appendChild(body);
    document.getElementById('windows').appendChild(el);

    const tb = U.el('button', 'task-btn', `${Icon.ico(opts.ico || 'window', 16)} ${opts.title}`);
    tb.onclick = () => { el.style.zIndex = ++this.zTop; SFX.play('click'); };
    document.getElementById('task-buttons').appendChild(tb);

    const win = { el, body, taskBtn: tb, refresh: null };
    this.windows[key] = win;

    closeBtn.onclick = () => this.closeWindow(key);
    el.addEventListener('mousedown', () => { el.style.zIndex = ++this.zTop; });

    title.addEventListener('mousedown', e => {
      if (e.target.closest('.win-btn')) return;
      const startX = e.clientX - el.offsetLeft;
      const startY = e.clientY - el.offsetTop;
      const move = ev => {
        el.style.left = U.clamp(ev.clientX - startX, -el.offsetWidth + 80, this.SW() - 60) + 'px';
        el.style.top = U.clamp(ev.clientY - startY, 0, this.SH() - 90) + 'px';
      };
      const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });

    if (opts.build) {
      win.refresh = () => opts.build(body, win);
      win.refresh();
    }
    return win;
  },

  closeWindow(key) {
    const w = this.windows[key];
    if (!w) return;
    SFX.play('close');
    w.taskBtn.remove();
    w.el.classList.add('closing');
    setTimeout(() => w.el.remove(), 170);
    delete this.windows[key];
  },

  refreshWindow(key) {
    if (this.windows[key] && this.windows[key].refresh) this.windows[key].refresh();
  },

  refreshAllWindows() {
    for (const k of Object.keys(this.windows)) this.refreshWindow(k);
  },

  /* ============================================================
     WALKERS — memes roaming the desktop
     ============================================================ */
  spawnWalker(meme) {
    if (this.walkers[meme.id]) return;
    const el = U.el('div', 'meme-walker');
    el.dataset.memeId = meme.id;
    const box = U.el('div', 'sprite-box');
    box.innerHTML = Sprite.memeSVG(meme, { size: 72 });
    el.appendChild(box);
    el.appendChild(U.el('div', 'name-tag', this.nameTag(meme)));
    document.getElementById('meme-layer').appendChild(el);

    const w = {
      el, meme,
      x: U.rand(150, this.SW() - 200),
      y: U.rand(120, this.SH() - 220),
      tx: 0, ty: 0, state: 'idle', timer: U.rand(0, 3),
    };
    w.tx = w.x; w.ty = w.y;
    el.style.left = w.x + 'px';
    el.style.top = w.y + 'px';
    if (Genetics.stage(meme) === 'baby') el.classList.add('baby');
    this.walkers[meme.id] = w;

    let downAt = 0, moved = false, dragging = false;
    el.addEventListener('mousedown', e => {
      downAt = Date.now(); moved = false;
      const sx = e.clientX, sy = e.clientY;
      const ox = w.x, oy = w.y;
      const move = ev => {
        if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 8) {
          moved = true; dragging = true;
          el.classList.add('dragging');
          w.state = 'dragged';
          w.x = U.clamp(ox + ev.clientX - sx, 0, this.SW() - 90);
          w.y = U.clamp(oy + ev.clientY - sy, 0, this.SH() - 170);
          el.style.left = w.x + 'px'; el.style.top = w.y + 'px';
        }
      };
      const up = () => {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
        if (dragging) {
          dragging = false;
          el.classList.remove('dragging');
          w.state = 'idle'; w.timer = 1;
          w.tx = w.x; w.ty = w.y;
          SFX.play('boing');
          this.sayBubble(meme.id, U.pick(['wheee!', 'YEET', 'I live here now', 'ok', '*lands*']));
        }
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
    el.addEventListener('click', () => { if (!moved) this.petMeme(meme); });
    el.addEventListener('dblclick', () => this.openMemeCard(meme.id));
    Tooltip.bind(el, () => `<h4>${U.esc(meme.name)} <span style="opacity:.6">Lv${meme.level}</span></h4>
      <div class="tt-sub">${U.esc(Genetics.describe(meme))}</div>
      <div class="tt-sub">click = pet · double-click = stats · drag = yeet</div>`);
  },

  nameTag(meme) {
    const crown = meme.retired ? Icon.ico('crown', 11) + ' ' : '';
    return crown + U.esc(meme.name);
  },

  removeWalker(id) {
    const w = this.walkers[id];
    if (!w) return;
    const c = centerOf(w.el);
    FX.poof(c.x, c.y);
    w.el.remove();
    delete this.walkers[id];
  },

  refreshWalkers() {
    for (const m of Game.state.memes) {
      if (!this.walkers[m.id]) this.spawnWalker(m);
      else {
        const w = this.walkers[m.id];
        w.el.querySelector('.sprite-box').innerHTML = Sprite.memeSVG(m, { size: 72 });
        w.el.classList.toggle('baby', Genetics.stage(m) === 'baby');
        w.el.querySelector('.name-tag').innerHTML = this.nameTag(m);
      }
    }
    for (const id of Object.keys(this.walkers)) {
      if (!Game.getMeme(id)) this.removeWalker(id);
    }
  },

  startWalkerLoop() {
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const inBattle = !document.getElementById('battle').classList.contains('hidden');
      if (!inBattle) {
        for (const id of Object.keys(this.walkers)) this.stepWalker(this.walkers[id], dt);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  stepWalker(w, dt) {
    // a baby that just grew up? refresh its look
    if (w.el.classList.contains('baby') && Genetics.stage(w.meme) !== 'baby') {
      w.el.classList.remove('baby');
      w.el.querySelector('.sprite-box').innerHTML = Sprite.memeSVG(w.meme, { size: 72 });
      w.el.querySelector('.name-tag').innerHTML = this.nameTag(w.meme);
    }
    if (w.state === 'dragged') return;
    // occasional happy jump while roaming
    w.jumpTimer = (w.jumpTimer || U.rand(2, 6)) - dt;
    if (w.jumpTimer <= 0 && w.state !== 'sleep') {
      w.jumpTimer = U.rand(3, 8);
      this.walkerJump(w);
    }
    w.timer -= dt;
    if (w.state === 'idle' && w.timer <= 0) {
      if (U.chance(0.18)) {
        w.state = 'sleep'; w.timer = U.rand(4, 8);
        const z = U.el('div', 'zzz', Icon.ico('moon', 16));
        w.el.appendChild(z);
      } else {
        w.state = 'walk';
        w.tx = U.rand(120, this.SW() - 160);
        w.ty = U.rand(100, this.SH() - 230);
        w.el.classList.add('walking');
        w.el.classList.toggle('flip', w.tx < w.x);
      }
    } else if (w.state === 'sleep' && w.timer <= 0) {
      w.state = 'idle'; w.timer = U.rand(1, 4);
      const z = w.el.querySelector('.zzz'); if (z) z.remove();
    } else if (w.state === 'walk') {
      const spd = (Genetics.stage(w.meme) === 'baby' ? 42 : 66) + Genetics.effStats(w.meme).spd * 3;
      const dx = w.tx - w.x, dy = w.ty - w.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 6) {
        w.state = 'idle'; w.timer = U.rand(1.5, 5);
        w.el.classList.remove('walking');
      } else {
        w.x += (dx / dist) * spd * dt;
        w.y += (dy / dist) * spd * dt;
        w.el.style.left = w.x + 'px';
        w.el.style.top = w.y + 'px';
      }
    }
  },

  walkerJump(w) {
    if (w.el.classList.contains('jumping')) return;
    w.el.classList.add('jumping');
    SFX.play('boing');
    const c = centerOf(w.el);
    FX.dust(c.x, c.y + 26);
    setTimeout(() => w.el.classList.remove('jumping'), 520);
  },

  petMeme(meme) {
    const w = this.walkers[meme.id];
    if (!w) return;
    const c = centerOf(w.el);
    FX.hearts(c.x, c.y - 20);
    SFX.play('pet');
    this.sayBubble(meme.id, U.pick(DATA.PET_LINES));
    meme.pets = (meme.pets || 0) + 1;
    const now = Date.now();
    if (now - (meme._lastPet || 0) > 1800) {
      meme._lastPet = now;
      const ups = Genetics.grantXp(meme, 3);
      floatText(c.x, c.y - 50, '+3 XP', { color: '#57b18d', size: 18 });
      if (ups) { SFX.play('levelup'); toast(`<b>${U.esc(meme.name)}</b> leveled up from pure affection!`, 3000, 'star'); }
      Game.save();
    }
    if (meme.pets === 3 && !meme.matured) { meme.matured = true; toast(`<b>${U.esc(meme.name)}</b> grew up!`, 2600, 'sprout'); this.refreshWalkers(); }
  },

  sayBubble(memeId, text) {
    const w = this.walkers[memeId];
    if (!w) return;
    const b = U.el('div', 'speech-bubble', U.esc(text));
    b.style.left = (w.x + 30) + 'px';
    b.style.top = (w.y - 34) + 'px';
    document.getElementById('meme-layer').appendChild(b);
    setTimeout(() => b.remove(), 2400);
  },

  /* ============================================================
     PILLS / SHARED SNIPPETS
     ============================================================ */
  traitPill(traitId) {
    const t = DATA.TRAITS[traitId];
    if (!t) return '';
    const cls = t.kind === 'good' ? 'trait-good' : t.kind === 'bad' ? 'trait-bad' : 'trait-weird';
    return `<span class="pill ${cls}" data-tt="${U.esc(t.desc)}">${Icon.ico(t.ico, 13)} ${t.name}</span>`;
  },

  abilityPill(abId) {
    const a = DATA.ABILITIES[abId];
    if (!a) return '';
    return `<span class="pill" data-tt="${U.esc(a.desc + (a.cd ? ` (cooldown ${a.cd})` : ''))}">${Icon.ico(a.ico, 13)} ${a.name}</span>`;
  },

  bindPillTooltips(root) {
    root.querySelectorAll('[data-tt]').forEach(el => Tooltip.bind(el, () => `<div>${el.dataset.tt}</div>`));
  },

  statRowsHTML(meme) {
    const s = Genetics.effStats(meme);
    const rows = [
      ['HP', 'hp', s.hp, 60, 'heart'], ['BONK', 'atk', s.atk, 20, 'fist'],
      ['BRAIN', 'int', s.int, 20, 'brain'], ['ZOOM', 'spd', s.spd, 20, 'bolt'], ['LUCK', 'lck', s.lck, 20, 'clover'],
    ];
    return `<div class="stat-rows">` + rows.map(([label, key, val, max, ico]) =>
      `<div class="stat-row"><span class="s-name">${Icon.ico(ico, 13)} ${label}</span>
        <div class="stat-bar sb-${key}"><div style="width:${U.clamp(val / max * 100, 4, 100)}%"></div></div>
        <span class="s-val">${val}</span></div>`).join('') + `</div>`;
  },

  /* ============================================================
     MEME CARD WINDOW
     ============================================================ */
  openMemeCard(memeId) {
    const meme = Game.getMeme(memeId);
    if (!meme) return;
    this.openWindow('card_' + memeId, {
      title: meme.name, ico: 'roster', cls: 'w-squad', w: 380,
      build: body => {
        const m = Game.getMeme(memeId);
        if (!m) { this.closeWindow('card_' + memeId); return; }
        const stage = Genetics.stage(m);
        const xpNeed = Genetics.xpToLevel(m.level);
        body.innerHTML = `
        <div class="meme-card">
          <div class="portrait">${Sprite.memeSVG(m, { size: 104 })}<span class="lvl-chip">Lv ${m.level}</span></div>
          <div class="info">
            <h3>${U.esc(m.name)} <span class="gen">GEN ${m.gen}</span>${m.retired ? `<span class="crown-chip">${Icon.ico('crown', 10)} RETIRED</span>` : ''}${stage === 'baby' ? `<span class="crown-chip" style="background:var(--blue);color:#fff">${Icon.ico('egg', 10)} BABY</span>` : ''}</h3>
            <div class="power-chip">${Icon.ico('bolt', 13)} POWER ${Genetics.power(m)}</div>
            <div class="class-chip">${Icon.ico(Genetics.classOf(m).ico, 13)} ${Genetics.classOf(m).name} ${DATA.GENES.face.alleles[m.pheno.face].label}</div>
            <div class="flavor">${U.esc(DATA.FLAVOR_BY_FACE[m.pheno.face] || '')} ${stage === 'baby' ? '<b>(baby — grows up after a fight)</b>' : ''}</div>
            ${this.statRowsHTML(m)}
            <div class="stat-row" style="font-size:11px"><span class="s-name">${Icon.ico('star', 13)} XP</span>
              <div class="stat-bar sb-lck"><div style="width:${U.clamp(m.xp / xpNeed * 100, 0, 100)}%"></div></div>
              <span class="s-val" style="width:52px">${m.xp}/${xpNeed}</span></div>
          </div>
        </div>
        ${m.retired ? `<p style="font-size:11px;color:var(--gold);margin-top:8px">${Icon.ico('crown', 12)} Retired hero — survived an adventure. Now it breeds the next generation.</p>` : ''}
        <div class="card-section-label">Traits</div>
        <div class="trait-list">${m.traits.length ? m.traits.map(t => this.traitPill(t)).join('') : '<span style="font-size:12px;opacity:.5">none — beautifully average</span>'}</div>
        <div class="card-section-label">Abilities</div>
        <div class="ability-list">${Genetics.abilities(m).map(a => this.abilityPill(a)).join('')}</div>
        <div class="card-section-label">${Icon.ico('tophat', 14)} Equipment (click to change)</div>
        <div class="equip-slots">
          <div class="equip-slot ${m.equip.hat ? 'filled' : ''}" data-slot="hat">${m.equip.hat ? Icon.ico(DATA.ITEMS[m.equip.hat].ico, 34) : Icon.ico('tophat', 30)}<span class="slot-hint">hat</span></div>
          <div class="equip-slot ${m.equip.held ? 'filled' : ''}" data-slot="held">${m.equip.held ? Icon.ico(DATA.ITEMS[m.equip.held].ico, 34) : Icon.ico('hand', 30)}<span class="slot-hint">held</span></div>
        </div>
        <div class="card-section-label">${Icon.ico('dna', 14)} DNA</div>
        <div style="font-size:11px;opacity:.75;line-height:1.6">${Object.keys(DATA.GENES).map(g => {
          const [a, b] = m.genome[g];
          const A = DATA.GENES[g].alleles;
          const dom = m.pheno[g];
          const fmt = x => x === dom ? `<b>${A[x].label}</b>` : A[x] ? A[x].label : '?';
          return `${DATA.GENES[g].label}: ${fmt(a)} / ${fmt(b)}`;
        }).join(' &nbsp;·&nbsp; ')}</div>
        <div style="font-size:11px;opacity:.6;margin-top:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <span>${Icon.ico('skull', 12)} ${m.kills} deleted</span><span>${Icon.ico('swords', 12)} ${m.battles} battles</span></div>
        <div class="card-actions">
          <button class="chunky-btn small fun" data-act="pet">${Icon.ico('paw', 16)} Pet</button>
          <button class="chunky-btn small info" data-act="rename">${Icon.ico('pencil', 16)} Rename</button>
          <button class="chunky-btn small warn" data-act="donate">${Icon.ico('trophy', 16)} Hall of Fame</button>
        </div>`;
        this.bindPillTooltips(body);
        body.querySelectorAll('.equip-slot').forEach(slot => {
          slot.onclick = () => this.pickEquip(m, slot.dataset.slot);
        });
        body.querySelector('[data-act=pet]').onclick = () => this.petMeme(m);
        body.querySelector('[data-act=rename]').onclick = () => {
          const name = prompt('New meme name:', m.name);
          if (name && name.trim()) {
            m.name = name.trim().slice(0, 24);
            Game.save();
            this.refreshWalkers();
            this.refreshAllWindows();
            const w = this.windows['card_' + memeId];
            if (w) w.el.querySelector('.t-label').textContent = m.name;
          }
        };
        body.querySelector('[data-act=donate]').onclick = () => {
          const payout = 15 + m.gen * 8 + m.level * 6;
          Modal.show({
            title: `${Icon.ico('trophy', 22)} Hall of Fame`,
            bodyHTML: `<p style="text-align:center">Send <b>${U.esc(m.name)}</b> to the Hall of Fame for <b>${payout}</b> coins?<br><span style="font-size:11px;opacity:.7">They leave the desktop for good — but the payout funds the next generation.</span></p>`,
            actions: [
              { label: `Donate (+${payout})`, cls: 'warn', fn: () => { Game.donate(m); this.closeWindow('card_' + memeId); this.refreshAllWindows(); Game.save(); } },
              { label: 'Keep them', cls: '' },
            ],
          });
        };
      },
    });
  },

  pickEquip(meme, slot) {
    const kind = slot;
    const owned = Object.keys(Game.state.inventory).filter(id => DATA.ITEMS[id].kind === kind);
    const node = U.el('div');
    if (meme.equip[slot]) {
      const cur = DATA.ITEMS[meme.equip[slot]];
      const un = U.el('button', 'chunky-btn small warn', `Remove ${cur.name}`);
      un.onclick = () => {
        Game.addItem(meme.equip[slot]);
        meme.equip[slot] = null;
        meme.hpMax = Genetics.effStats(meme).hp;
        Game.save(); Modal.hide();
        this.refreshAllWindows(); this.refreshWalkers();
      };
      node.appendChild(un);
      node.appendChild(U.el('div', '', '<br>'));
    }
    if (!owned.length) {
      node.appendChild(U.el('p', '', `No ${kind === 'hat' ? 'hats' : 'holdable items'} in your loot. ${Game.isUnlocked('shop') ? 'Buy some on MemeBay!' : 'Win a battle to find some!'}`));
    } else {
      const grid = U.el('div', 'inv-grid');
      for (const id of owned) {
        const it = DATA.ITEMS[id];
        const cell = U.el('div', 'inv-item',
          `<span class="ii-count">${Game.state.inventory[id]}</span><span class="ii-ico">${Icon.ico(it.ico, 34)}</span><span class="ii-name">${it.name}</span>`);
        Tooltip.bind(cell, () => `<h4>${Icon.ico(it.ico, 15)} ${it.name}</h4><div>${it.desc}</div>`);
        cell.onclick = () => {
          if (meme.equip[slot]) Game.addItem(meme.equip[slot]);
          Game.removeItem(id);
          meme.equip[slot] = id;
          meme.hpMax = Genetics.effStats(meme).hp;
          SFX.play('buy');
          Game.save(); Modal.hide();
          this.refreshAllWindows(); this.refreshWalkers();
        };
        grid.appendChild(cell);
      }
      node.appendChild(grid);
    }
    Modal.show({ title: `${Icon.ico(kind === 'hat' ? 'tophat' : 'hand', 20)} Equip on ${U.esc(meme.name)}`, bodyNode: node, actions: [{ label: 'Cancel' }] });
  },

  /* ============================================================
     SQUAD / MY MEMES
     ============================================================ */
  openSquad() {
    this.openWindow('squad', {
      title: 'My Memes', ico: 'roster', cls: 'w-squad', w: 480,
      build: body => {
        const memes = Game.state.memes;
        body.innerHTML = `<p style="font-size:12px;opacity:.7;margin-bottom:8px">
          ${memes.length}/${Game.CAPACITY} memes live on your desktop. Click one for details. Crowned memes are <b>retired</b> (breed only).</p>`;
        const grid = U.el('div', 'squad-grid');
        for (const m of memes) {
          const stage = Genetics.stage(m);
          const cell = U.el('div', 'mini-meme');
          const flag = m.retired ? `<span class="mm-flag">${Icon.ico('crown', 16)}</span>`
            : stage === 'baby' ? `<span class="mm-flag">${Icon.ico('egg', 16)}</span>`
            : stage === 'elder' ? `<span class="mm-flag">${Icon.ico('wilt', 16)}</span>` : '';
          cell.innerHTML = `${flag}${Sprite.memeSVG(m, { size: 60 })}<span class="mm-name">${U.esc(m.name)}</span>
            <span class="mm-sub">Lv${m.level} · Gen${m.gen}</span>`;
          cell.onclick = () => { SFX.play('select'); this.openMemeCard(m.id); };
          grid.appendChild(cell);
        }
        if (!memes.length) grid.innerHTML = "<p>It's quiet... too quiet. No memes!</p>";
        body.appendChild(grid);
      },
    });
  },

  /* ============================================================
     BREEDER 2000 — pick two adults, hatch a baby instantly
     ============================================================ */
  breedSel: [null, null],

  openBreeder() {
    this.openWindow('breeder', {
      title: 'Breeder2000.exe', ico: 'dna', cls: 'w-breed', w: 380,
      build: body => this.renderBreeder(body),
    });
  },

  breedCd(m) { return Game.secsLeft(m.breedReadyAt || 0); },

  renderBreeder(body) {
    const [aId, bId] = this.breedSel;
    const A = aId ? Game.getMeme(aId) : null;
    const B = bId ? Game.getMeme(bId) : null;
    body.innerHTML = '';
    const wrap = U.el('div', 'breed-wrap');

    const parents = U.el('div', 'breed-parents');
    const mkSlot = (meme, idx) => {
      const slot = U.el('div', 'parent-slot' + (meme ? ' filled' : ''));
      const cd = meme ? this.breedCd(meme) : 0;
      slot.innerHTML = meme
        ? `${Sprite.memeSVG(meme, { size: 74 })}<span class="p-name">${U.esc(meme.name)}</span><span class="p-hint">${cd ? Icon.ico('hourglass', 11) + ' ' + cd + 's' : Icon.ico('bolt', 11) + ' ' + Genetics.power(meme)}</span>`
        : `<span class="p-empty">${Icon.ico('plus', 40)}</span><span class="p-hint">choose a meme</span>`;
      slot.onclick = () => { SFX.play('click'); this.breedSel[idx] = null; this.renderBreederPicker(body, idx); };
      return slot;
    };
    parents.appendChild(mkSlot(A, 0));
    parents.appendChild(U.el('div', 'breed-heart', Icon.ico('heart', 30)));
    parents.appendChild(mkSlot(B, 1));
    wrap.appendChild(parents);

    const warn = U.el('div', 'breed-warn');
    let error = null;
    if (A && B) {
      if (A.id === B.id) error = 'A meme cannot breed with itself. It has tried.';
      else if (this.breedCd(A) || this.breedCd(B)) error = 'A parent is on breeding cooldown.';
      else if (Game.state.memes.length + Game.state.eggs.length >= Game.CAPACITY) error = 'No room! (memes + eggs = ' + Game.CAPACITY + ')';
      else if (Genetics.related(A, B)) warn.innerHTML = `${Icon.ico('warning', 14)} REPOST ALERT: related memes. The baby will be <b>Reposted</b> (-2 all stats).`;
    }
    if (error) warn.innerHTML = `${Icon.ico('warning', 14)} ${error}`;
    wrap.appendChild(warn);

    const go = U.el('button', 'chunky-btn fun breed-go', `${Icon.ico('heart', 18)} FUSE THE MEMES`);
    go.disabled = !(A && B) || !!error;
    go.onclick = () => this.doBreed(A, B);
    wrap.appendChild(go);

    // incubating eggs (live countdowns; refreshed each second by the game tick)
    if (Game.state.eggs.length) {
      wrap.appendChild(U.el('div', 'card-section-label', `${Icon.ico('egg', 14)} Incubating`));
      const list = U.el('div', 'egg-list');
      for (const egg of Game.state.eggs) {
        const left = Game.secsLeft(egg.hatchAt);
        const row = U.el('div', 'egg-row');
        row.innerHTML = `${Sprite.eggHTML(left <= 6 ? 1 : 0, 40)}
          <div class="egg-meta"><span>${U.esc(egg.parents[0])} + ${U.esc(egg.parents[1])}</span>
          <span class="egg-timer">${Icon.ico('hourglass', 11)} hatches in ${left}s</span></div>`;
        list.appendChild(row);
      }
      wrap.appendChild(list);
    }

    wrap.appendChild(U.el('p', '', `<span style="font-size:11px;opacity:.6">Fusing lays an <b>egg</b> that hatches in ${Math.round(Game.HATCH_MS / 1000)}s; parents then rest for ${Math.round(Game.BREED_CD_MS / 1000)}s. Kids inherit alleles, a parent's class, and abilities. Babies grow up after a fight.</span>`));
    body.appendChild(wrap);
  },

  renderBreederPicker(body, idx) {
    body.innerHTML = '';
    const wrap = U.el('div', 'breed-wrap');
    wrap.appendChild(U.el('p', '', `<b>Pick parent ${idx === 0 ? 'A' : 'B'}:</b> <span style="font-size:12px;opacity:.6">(adults, off cooldown)</span>`));
    const grid = U.el('div', 'breed-pick-grid');
    for (const m of Game.state.memes) {
      const cd = this.breedCd(m);
      const eligible = Genetics.stage(m) !== 'baby' && !cd && this.breedSel[1 - idx] !== m.id;
      const cell = U.el('div', 'mini-meme' + (eligible ? '' : ' disabled'));
      cell.innerHTML = `${m.retired ? `<span class="mm-flag">${Icon.ico('crown', 16)}</span>` : ''}${Sprite.memeSVG(m, { size: 60 })}<span class="mm-name">${U.esc(m.name)}</span>
        <span class="mm-sub">${Genetics.stage(m) === 'baby' ? 'baby' : cd ? Icon.ico('hourglass', 11) + ' ' + cd + 's' : Icon.ico('bolt', 11) + ' ' + Genetics.power(m)}</span>`;
      if (eligible) cell.onclick = () => { SFX.play('select'); this.breedSel[idx] = m.id; this.renderBreeder(body); };
      grid.appendChild(cell);
    }
    wrap.appendChild(grid);
    const back = U.el('button', 'chunky-btn small', `${Icon.ico('arrowleft', 14)} Back`);
    back.onclick = () => this.renderBreeder(body);
    wrap.appendChild(back);
    body.appendChild(wrap);
  },

  doBreed(A, B) {
    if (Game.state.memes.length + Game.state.eggs.length >= Game.CAPACITY) {
      SFX.play('error'); toast('No room — hatch or clear an egg first!', 3000, 'warning');
      this.refreshWindow('breeder'); return;
    }
    if (this.breedCd(A) || this.breedCd(B)) { SFX.play('error'); toast('A parent is still on cooldown.', 2600, 'hourglass'); return; }
    const { baby, inbred } = Genetics.breed(A, B);
    const now = Date.now();
    A.breedReadyAt = now + Game.BREED_CD_MS;
    B.breedReadyAt = now + Game.BREED_CD_MS;
    Game.state.eggs.push({ baby, inbred, hatchAt: now + Game.HATCH_MS, parents: [A.name, B.name] });
    Game.state.stats.memesBred++;
    this.breedSel = [null, null];
    SFX.play('egg');
    const c = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    FX.hearts(c.x, c.y, 10);
    toast(`An egg is incubating — hatches in ~${Math.round(Game.HATCH_MS / 1000)}s!`, 3400, 'egg');
    Game.save();
    this.refreshWindow('breeder');
  },

  /* ============================================================
     SHOP — MemeBay
     ============================================================ */
  openShop() {
    this.openWindow('shop', {
      title: 'MemeBay', ico: 'cart', cls: 'w-shop', w: 420,
      build: body => {
        body.innerHTML = `<div class="shop-wrap">
          <div class="shop-head"><span>${Icon.ico('coin', 15)} You have <b>${Game.state.coins}</b></span>
          <span style="font-size:11px;opacity:.6">Fresh stock every day!</span></div>
          <div class="shop-grid"></div></div>`;
        const grid = body.querySelector('.shop-grid');
        for (const id of Game.state.shopStock) {
          const it = DATA.ITEMS[id];
          const cell = U.el('div', 'shop-item');
          cell.innerHTML = `<span class="si-ico">${Icon.ico(it.ico, 38)}</span><span class="si-name">${it.name}</span>
            <span class="si-desc">${it.desc}</span>`;
          const buy = U.el('button', 'chunky-btn small warn', `${Icon.ico('coin', 15)} ${it.price}`);
          buy.onclick = () => {
            if (!Game.spend(it.price)) return;
            Game.addItem(id);
            SFX.play('buy');
            const c = centerOf(buy);
            FX.sparkle(c.x, c.y, 6);
            toast(`Bought <b>${it.name}</b>!`, 3000, 'cart');
            Game.save();
            this.refreshWindow('shop');
            this.refreshWindow('inventory');
          };
          cell.appendChild(buy);
          grid.appendChild(cell);
        }
      },
    });
  },

  /* ============================================================
     INVENTORY — Loot
     ============================================================ */
  openInventory() {
    this.openWindow('inventory', {
      title: 'Loot Stash', ico: 'bag', w: 420,
      build: body => {
        const inv = Game.state.inventory;
        const ids = Object.keys(inv);
        body.innerHTML = `<p style="font-size:12px;opacity:.7;margin-bottom:8px">
          Click a consumable to use it. Equip hats & held items from a meme's card.</p>`;
        if (!ids.length) { body.innerHTML += '<p>Empty. Loot viruses or hit MemeBay!</p>'; return; }
        const grid = U.el('div', 'inv-grid');
        for (const id of ids) {
          const it = DATA.ITEMS[id];
          const cell = U.el('div', 'inv-item',
            `<span class="ii-count">${inv[id]}</span><span class="ii-ico">${Icon.ico(it.ico, 34)}</span><span class="ii-name">${it.name}</span>`);
          Tooltip.bind(cell, () => `<h4>${Icon.ico(it.ico, 15)} ${it.name}</h4><div>${it.desc}</div>`);
          cell.onclick = () => {
            if (it.home) this.useItemOnMemePicker(id);
            else if (it.battle) toast(`<b>${it.name}</b> can only be used in battle (the Bag button).`, 3200, 'bag');
            else toast(`Equip <b>${it.name}</b> from a meme's card (double-click a meme).`, 3200, 'tophat');
          };
          grid.appendChild(cell);
        }
        body.appendChild(grid);
      },
    });
  },

  useItemOnMemePicker(itemId) {
    const it = DATA.ITEMS[itemId];
    const node = U.el('div');
    const grid = U.el('div', 'breed-pick-grid');
    for (const m of Game.state.memes) {
      const cell = U.el('div', 'mini-meme');
      cell.innerHTML = `${Sprite.memeSVG(m, { size: 60 })}<span class="mm-name">${U.esc(m.name)}</span>`;
      cell.onclick = () => {
        Modal.hide();
        if (Game.useHomeItem(itemId, m)) { this.refreshAllWindows(); this.refreshWalkers(); }
      };
      grid.appendChild(cell);
    }
    node.appendChild(grid);
    Modal.show({ title: `${Icon.ico(it.ico, 20)} Use ${it.name} on...`, bodyNode: node, actions: [{ label: 'Cancel' }] });
  },

  /* ============================================================
     GRAVEYARD
     ============================================================ */
  openGraveyard() {
    this.openWindow('graveyard', {
      title: 'Meme Graveyard', ico: 'grave', cls: 'w-grave', w: 440,
      build: body => {
        const g = Game.state.graveyard;
        body.innerHTML = `<div class="grave-wrap">
          <p style="font-size:12px;opacity:.7;margin-bottom:8px">Every legend gets archived eventually.
          <b>Necropost</b> brings one back as a zombie meme (once per meme) — ready to fight again.</p></div>`;
        const wrap = body.querySelector('.grave-wrap');
        if (!g.length) { wrap.innerHTML += '<p style="text-align:center;opacity:.6">No dead memes. Yet.</p>'; return; }
        for (const entry of g.slice().reverse()) {
          const row = U.el('div', 'grave-row');
          const cost = Game.necropostCost(entry);
          row.innerHTML = `${Sprite.tombSVG(44)}
            <div class="g-info"><div class="g-name">${Icon.ico('skull', 15)} ${U.esc(entry.meme.name)} <span style="opacity:.5;font-weight:normal">Gen ${entry.meme.gen} · Lv ${entry.meme.level}</span></div>
            <div class="g-sub">${U.esc(entry.cause)} on day ${entry.day} — "${U.esc(entry.epitaph)}"</div></div>`;
          const btn = U.el('button', 'chunky-btn small fun', entry.meme.necroposted ? 'at peace' : `${Icon.ico('coin', 14)} ${cost}`);
          btn.disabled = entry.meme.necroposted;
          btn.onclick = () => {
            if (Game.necropost(entry)) { this.refreshWindow('graveyard'); this.refreshAllWindows(); }
          };
          row.appendChild(btn);
          wrap.appendChild(row);
        }
      },
    });
  },

  /* ============================================================
     STAGE MAP (Candy-Crush style roadmap)
     ============================================================ */
  REGION_ICO: {
    'Downloads': 'doc', 'Recycle Bin': 'recycle', 'Email Swamp': 'mail', 'System32': 'window',
    'GPU Mines': 'gpu', 'Dark Web': 'tinfoil', 'Spam Fortress': 'can', 'The Cloud': 'window',
  },
  stageIco(stage) { return stage.boss ? 'skull' : (this.REGION_ICO[stage.region] || 'swords'); },

  stageUnlocked(idx) {
    const s = DATA.STAGES[idx];
    if (s.endless) return Game.isUnlocked('endless');
    if (idx === 0) return true;
    return !!Game.state.missionsDone[DATA.STAGES[idx - 1].id];
  },

  enemyPower(stage) {
    const scale = stage.endless ? 1 + (Game.state.cloudWave + 1) * 0.09 : 1;
    const foes = stage.endless ? Combat.rosterFor(stage) : stage.foes;
    return foes.reduce((a, f) => a + DATA.virusPower(DATA.VIRUSES[f], scale), 0);
  },
  teamBestPower() {
    return Game.deployable().map(m => Genetics.power(m)).sort((a, b) => b - a).slice(0, 4).reduce((a, b) => a + b, 0);
  },

  openMissions() {
    this.openWindow('missions', {
      title: 'virus_hunter.exe', ico: 'swords', cls: 'w-missions', w: 440,
      build: body => {
        body.innerHTML = `<div class="map-head">
            <div class="map-title">Stage Map</div>
            <div class="map-power">Your power: <b>${this.teamBestPower()}</b></div>
          </div><div class="stage-map"></div>`;
        const map = body.querySelector('.stage-map');
        let curRegion = null;
        // find first uncleared unlocked stage = "current"
        let currentIdx = DATA.STAGES.findIndex((s, i) => this.stageUnlocked(i) && !Game.state.missionsDone[s.id]);
        DATA.STAGES.forEach((stage, idx) => {
          if (stage.endless && !Game.isUnlocked('endless')) return;
          if (stage.region !== curRegion) {
            curRegion = stage.region;
            map.appendChild(U.el('div', 'region-head', `${Icon.ico(this.REGION_ICO[stage.region] || 'swords', 16)} ${stage.region}`));
          }
          const unlocked = this.stageUnlocked(idx);
          const cleared = Game.state.missionsDone[stage.id];
          const side = idx % 2 === 0 ? 'l' : 'r';
          const node = U.el('div', 'stage-node ' + side
            + (unlocked ? '' : ' locked') + (cleared ? ' cleared' : '') + (idx === currentIdx ? ' current' : '') + (stage.boss ? ' boss' : ''));
          node.innerHTML = `
            <div class="sn-badge">${unlocked ? (stage.endless ? Icon.ico('window', 22) : stage.n) : Icon.ico('lock', 20)}
              ${cleared ? `<span class="sn-crown">${Icon.ico('crown', 14)}</span>` : ''}</div>
            <div class="sn-label">${stage.endless ? 'Endless' : stage.name}</div>
            <div class="sn-stars">${Icon.ico('skull', 10).repeat(stage.diff)}</div>`;
          if (unlocked) node.onclick = () => { SFX.play('select'); this.openStage(stage, idx); };
          map.appendChild(node);
        });
      },
    });
  },

  openStage(stage, idx) {
    const foes = stage.endless ? [] : stage.foes;
    const ep = this.enemyPower(stage);
    const tp = this.teamBestPower();
    const cleared = Game.state.missionsDone[stage.id] || 0;
    const foeRow = stage.endless
      ? `<span style="opacity:.7">Wave ${Game.state.cloudWave + 1} — scales forever</span>`
      : foes.map(f => `<span class="foe-chip">${Pixel.img(Sprite.virusSrc(DATA.VIRUSES[f].art), 30, 'virus-px')}</span>`).join('');
    const verdict = tp >= ep ? `<span style="color:var(--green)">You out-power this stage</span>`
      : `<span style="color:var(--red)">Underpowered — breed stronger memes!</span>`;
    Modal.show({
      title: `${Icon.ico(this.stageIco(stage), 20)} ${stage.name}`,
      bodyHTML: `<div style="text-align:center">
        <div class="power-face">
          <div class="pf-col"><div class="pf-lbl">YOUR POWER</div><div class="pf-num good">${tp}</div></div>
          <div class="pf-vs">VS</div>
          <div class="pf-col"><div class="pf-lbl">ENEMY POWER</div><div class="pf-num bad">${ep}</div></div>
        </div>
        <div style="font-size:11px;margin:4px 0 10px">${verdict}</div>
        <div class="card-section-label" style="justify-content:center">Enemies</div>
        <div class="foe-row">${foeRow}</div>
        <div class="card-section-label" style="justify-content:center;margin-top:10px">Rewards</div>
        <div class="result-loot">
          <span class="loot-chip">${Icon.ico('coin', 16)} ${stage.reward[0]}-${stage.reward[1]}</span>
          <span class="loot-chip">${Icon.ico('bag', 16)} ${stage.itemChance >= 1 ? 'item' : Math.round(stage.itemChance * 100) + '% item'}</span>
        </div>
        ${cleared ? `<p style="font-size:11px;color:var(--green);margin-top:8px">${Icon.ico('check', 12)} cleared ${cleared}x</p>` : ''}
      </div>`,
      actions: [
        { label: `${Icon.ico('swords', 16)} Deploy`, cls: 'bad', fn: () => this.openSquadPicker(stage) },
        { label: 'Back', cls: '' },
      ],
    });
  },

  openSquadPicker(stage) {
    const roster = Game.deployable();
    if (!roster.length) {
      SFX.play('error');
      toast("No battle-ready memes! Babies and retired heroes can't fight. Breed a fresh fighter or adopt a stray.", 4200, 'warning');
      return;
    }
    const sel = new Set();
    const ep = this.enemyPower(stage);
    const node = U.el('div');
    node.innerHTML = `<p class="squad-pick-note">Pick up to <b>4</b> memes for <b>${stage.name}</b>.<br>
      <span style="font-size:11px;opacity:.7">Enemy power <b>${ep}</b> · survivors retire afterward.</span></p>
      <div class="pick-power">Team power: <b class="pp-num">0</b></div>`;
    const ppNum = () => node.querySelector('.pp-num');
    const grid = U.el('div', 'breed-pick-grid');
    const goBtn = U.el('button', 'chunky-btn bad', `${Icon.ico('usb', 16)} INSERT FLASH DRIVE`);
    goBtn.disabled = true;
    const recalc = () => {
      const total = [...sel].reduce((a, id) => a + Genetics.power(Game.getMeme(id)), 0);
      const el = ppNum(); if (el) { el.textContent = total; el.style.color = total >= ep ? 'var(--green)' : 'var(--red)'; }
      goBtn.disabled = sel.size === 0;
      goBtn.innerHTML = `${Icon.ico('usb', 16)} INSERT FLASH DRIVE ${sel.size ? '(' + sel.size + ')' : ''}`;
    };
    for (const m of roster) {
      const cell = U.el('div', 'mini-meme');
      cell.innerHTML = `${Sprite.memeSVG(m, { size: 60 })}<span class="mm-name">${U.esc(m.name)}</span>
        <span class="mm-sub">${Icon.ico('bolt', 11)} ${Genetics.power(m)}</span>`;
      cell.onclick = () => {
        if (sel.has(m.id)) { sel.delete(m.id); cell.classList.remove('selected'); }
        else if (sel.size < 4) { sel.add(m.id); cell.classList.add('selected'); SFX.play('select'); }
        recalc();
      };
      grid.appendChild(cell);
    }
    node.appendChild(grid);
    Modal.show({
      title: `${Icon.ico(this.stageIco(stage), 20)} ${stage.name}`,
      bodyNode: node,
      actions: [{ label: 'Cancel' }],
    }).querySelector('.modal-actions').prepend(goBtn);
    goBtn.onclick = () => {
      if (!sel.size) return;
      Modal.hide();
      const squad = [...sel].map(id => Game.getMeme(id));
      this.insertUSB(() => Combat.start(stage, squad));
    };
  },

  /* ============================================================
     MEME INDEX (dex)
     ============================================================ */
  openIndex() {
    this.openWindow('index', {
      title: 'Meme Index', ico: 'book', cls: 'w-index', w: 470,
      build: body => this.renderIndex(body, this._indexTab || 'memes'),
    });
  },

  dexFaceSprite(f) {
    this._dexMemes = this._dexMemes || {};
    if (!this._dexMemes[f]) {
      const genome = {};
      for (const g of Object.keys(DATA.GENES)) {
        const ks = Object.keys(DATA.GENES[g].alleles).filter(k => !DATA.GENES[g].alleles[k].rare);
        genome[g] = [ks[0], ks[0]];
      }
      genome.face = [f, f];
      this._dexMemes[f] = Genetics.newMeme({ genome, matured: true });
    }
    return Sprite.memeSVG(this._dexMemes[f], { equip: false, size: 48 });
  },

  renderIndex(body, tab) {
    this._indexTab = tab;
    const faces = Object.keys(DATA.GENES.face.alleles);
    const seenFaces = faces.filter(f => Game.state.dex.faces[f]).length;
    const seenVir = Object.keys(DATA.VIRUSES).filter(v => Game.state.dex.viruses[v]).length;
    const tabs = [['memes', `Memes ${seenFaces}/${faces.length}`], ['viruses', `Viruses ${seenVir}/${Object.keys(DATA.VIRUSES).length}`], ['abilities', 'Moves'], ['classes', 'Classes']];
    body.innerHTML = `<div class="index-tabs">${tabs.map(([k, l]) => `<button class="idx-tab${k === tab ? ' on' : ''}" data-t="${k}">${l}</button>`).join('')}</div><div class="index-body"></div>`;
    const box = body.querySelector('.index-body');
    body.querySelectorAll('.idx-tab').forEach(b => b.onclick = () => { SFX.play('click'); this.renderIndex(body, b.dataset.t); });

    if (tab === 'memes') {
      box.innerHTML = '<div class="dex-grid">' + faces.map(f => {
        const known = Game.state.dex.faces[f];
        const a = DATA.GENES.face.alleles[f];
        return `<div class="dex-cell${known ? '' : ' locked'}">${known ? this.dexFaceSprite(f) : '<div class="dex-q">?</div>'}<span class="dex-name">${known ? a.label : '???'}</span></div>`;
      }).join('') + '</div>';
    } else if (tab === 'viruses') {
      box.innerHTML = '<div class="dex-grid">' + Object.keys(DATA.VIRUSES).map(v => {
        const known = Game.state.dex.viruses[v]; const d = DATA.VIRUSES[v];
        return `<div class="dex-cell${known ? '' : ' locked'}">${known ? Pixel.img(Sprite.virusSrc(d.art), 42, 'virus-px') : '<div class="dex-q">?</div>'}<span class="dex-name">${known ? d.name : '???'}</span></div>`;
      }).join('') + '</div>';
    } else if (tab === 'abilities') {
      box.innerHTML = '<div class="dex-grid">' + Object.keys(DATA.ABILITIES).map(id => {
        const a = DATA.ABILITIES[id];
        const cell = `<div class="dex-cell" data-tt="${U.esc(a.desc)}"><div class="dex-ico">${Icon.ico(a.ico, 30)}</div><span class="dex-name">${a.name}</span></div>`;
        return cell;
      }).join('') + '</div>';
      this.bindPillTooltips(box);
    } else {
      box.innerHTML = '<div class="dex-grid">' + Object.keys(DATA.CLASSES).map(id => {
        const c = DATA.CLASSES[id];
        return `<div class="dex-cell" data-tt="${U.esc(c.desc)}"><div class="dex-ico">${Icon.ico(c.ico, 30)}</div><span class="dex-name">${c.name}</span></div>`;
      }).join('') + '</div>';
      this.bindPillTooltips(box);
    }
  },

  /* ============================================================
     CUSTOMIZE PC (themes)
     ============================================================ */
  openCustomize() {
    this.openWindow('customize', {
      title: 'Customize PC', ico: 'gear', w: 360,
      build: body => {
        body.innerHTML = `<p style="font-size:12px;opacity:.75;margin-bottom:10px">Pick a desktop wallpaper theme:</p><div class="theme-grid"></div>`;
        const grid = body.querySelector('.theme-grid');
        for (const id of Object.keys(DATA.THEMES)) {
          const t = DATA.THEMES[id];
          const cell = U.el('div', 'theme-cell' + (Game.state.theme === id ? ' on' : ''));
          cell.innerHTML = `<div class="theme-swatch" style="background:linear-gradient(135deg,${t.felt[0]},${t.felt[2]})"></div><span>${t.name}</span>`;
          cell.onclick = () => { SFX.play('click'); Game.applyTheme(id); Game.save(); this.refreshWindow('customize'); };
          grid.appendChild(cell);
        }
      },
    });
  },

  /* ============================================================
     USB — insert the infected flash drive to start a stage
     ============================================================ */
  insertUSB(cb) {
    const ov = U.el('div', 'usb-insert');
    ov.innerHTML = `<div class="usb-slot">${Icon.ico('usbport', 60)}</div>
      <div class="usb-stick">${Icon.ico('usb', 48)}</div>
      <div class="usb-text">INSERTING INFECTED FLASH DRIVE...</div>`;
    document.body.appendChild(ov);
    SFX.play('open');
    setTimeout(() => SFX.play('zap'), 520);
    setTimeout(() => { ov.remove(); cb(); }, 1150);
  },

  /* ============================================================
     HELP / README
     ============================================================ */
  openHelp() {
    this.openWindow('help', {
      title: 'README.txt', ico: 'doc', w: 520,
      build: body => {
        body.innerHTML = `
        <div style="font-size:13px;line-height:1.65">
          <p><b>MEME-GENICS</b> — your desktop is alive with memes, and the viruses want it. It plays like Mewgenics: breed a bloodline, send them to fight, lose them, breed better ones.</p>
          <p style="margin-top:8px"><b>THE LOOP:</b> pair two memes in Breeder2000 &rarr; <b>End Day</b> (a baby hatches overnight, memes age, a stray may show up) &rarr; send up to 4 fighters into a hunt.</p>
          <p style="margin-top:8px"><b>RETIREMENT:</b> any meme that <i>survives</i> a hunt is crowned and <b>retires</b> — it can never fight again, only breed. So you must keep breeding fresh fighters. This is the heart of the game.</p>
          <p style="margin-top:8px"><b>BREEDING:</b> kids inherit one allele per gene from each parent — the dominant one shows. Stats blend with a lucky drift, traits pass down, and mutations sneak in rare genes (RAINBOW! LASER EYES!). Related parents = a <b>Reposted</b> baby. Gross.</p>
          <p style="margin-top:8px"><b>BATTLES:</b> a cinematic auto-battler. Your memes and the viruses fight automatically by ZOOM order — you jump in with skill: <b>time your STRIKE</b> to hit harder, <b>PARRY</b> incoming attacks, and <b>MASH</b> your type's special. Higher stats + clean timing = wins. <b>Memes that die in battle are DEAD</b> — unless you necropost them, or burn Copium mid-fight.</p>
          <p style="margin-top:8px"><b>UNLOCKS:</b> you start with just breeding and the first hunt. MemeBay, your Loot stash, the Graveyard and the endless Cloud open up as you play.</p>
          <p style="margin-top:8px"><b>GOAL:</b> climb the mission list, delete the SPAM KING, then flex on the endless Cloud with a genetically perfected super-bloodline.</p>
          <p style="margin-top:8px;opacity:.6;font-size:11px">A loving parody of Mewgenics-style breeding tactics. No cats were harmed. Several viruses were.</p>
        </div>`;
      },
    });
  },

  /* ============================================================
     INTRO
     ============================================================ */
  showIntro() {
    Modal.show({
      title: `${Icon.ico('dna', 22)} Welcome to MEME-GENICS!`,
      bodyHTML: `<div style="text-align:center">
        <p style="font-size:15px">Your desktop has exactly two (2) memes and a virus problem.</p>
        <div style="display:flex;justify-content:center;gap:10px;margin:10px 0">
          <div style="width:96px">${Sprite.memeSVG(Game.state.memes[0], { size: 96 })}</div>
          <div style="width:96px">${Sprite.memeSVG(Game.state.memes[1], { size: 96 })}</div>
        </div>
        <p style="font-size:13px">Pet your memes. Breed dank bloodlines. Delete evil viruses.<br>
        Fighters <b>retire</b> after one hunt — so keep the bloodline going. Memes don't live forever; their <b>genes</b> do.</p>
        <p style="font-size:12px;opacity:.6;margin-top:6px">(psst: read README.txt on the desktop for the full manual)</p>
      </div>`,
      actions: [{ label: "LET'S GO", cls: 'fun', fn: () => { Game.state.seenIntro = true; Game.save(); SFX.startMusic(); } }],
    });
  },
};
