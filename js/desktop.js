/* ============================================================
   MEME-GENICS — desktop.js
   The fake OS: icons, windows, taskbar, roaming meme walkers,
   breeder, shop, graveyard, missions, inventory
   ============================================================ */

const Desktop = {
  windows: {},      // key -> {el, taskBtn, refresh}
  walkers: {},      // memeId -> walker element
  zTop: 100,
  _walkerLoop: null,

  /* ============================================================
     INIT
     ============================================================ */
  init() {
    this.buildIcons();
    this.buildStartMenu();
    this.buildDoodles();
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
      e.currentTarget.textContent = on ? '🔊' : '🔇';
    };
    document.getElementById('tray-music').onclick = e => {
      const on = SFX.toggleMusic();
      e.currentTarget.classList.toggle('off', !on);
    };

    for (const m of Game.state.memes) this.spawnWalker(m);
    this.startWalkerLoop();

    // ambient speech bubbles
    setInterval(() => {
      const ids = Object.keys(this.walkers);
      if (ids.length && U.chance(0.5) && document.getElementById('battle').classList.contains('hidden')) {
        this.sayBubble(U.pick(ids), U.pick(DATA.PHRASES));
      }
    }, 6000);
  },

  buildDoodles() {
    const box = document.getElementById('wallpaper-doodles');
    const emo = ['😂', '🐸', '💾', '🍕', '🌭', '⭐', '🪙', '👾', '🎮', '🧀'];
    for (let i = 0; i < 10; i++) {
      const d = U.el('div', 'doodle', U.pick(emo));
      d.style.left = U.rand(5, 92) + '%';
      d.style.top = U.rand(5, 80) + '%';
      d.style.animationDelay = -U.rand(0, 9) + 's';
      d.style.fontSize = U.rand(30, 70) + 'px';
      box.appendChild(d);
    }
  },

  buildIcons() {
    const defs = [
      { ico: '🧬', label: 'Breeder2000.exe', fn: () => this.openBreeder() },
      { ico: '⚔️', label: 'virus_hunter.exe', fn: () => this.openMissions() },
      { ico: '📇', label: 'My Memes', fn: () => this.openSquad() },
      { ico: '🛒', label: 'MemeBay', fn: () => this.openShop() },
      { ico: '🎒', label: 'Loot', fn: () => this.openInventory() },
      { ico: '🪦', label: 'Graveyard', fn: () => this.openGraveyard() },
      { ico: '📄', label: 'README.txt', fn: () => this.openHelp() },
    ];
    const box = document.getElementById('icons');
    for (const d of defs) {
      const el = U.el('div', 'dt-icon');
      el.innerHTML = `<div class="ico">${d.ico}</div><div class="lbl">${d.label}</div>`;
      el.onclick = () => { SFX.play('open'); d.fn(); };
      box.appendChild(el);
    }
  },

  buildStartMenu() {
    const sm = document.getElementById('start-menu');
    sm.innerHTML = `<div class="sm-head">MEME-GENICS 🧬 v4.20</div>`;
    const items = [
      { ico: '📇', label: 'My Memes', fn: () => this.openSquad() },
      { ico: '🧬', label: 'Breeder2000.exe', fn: () => this.openBreeder() },
      { ico: '⚔️', label: 'Hunt Viruses', fn: () => this.openMissions() },
      { ico: '🛒', label: 'MemeBay', fn: () => this.openShop() },
      { ico: '🎒', label: 'Loot', fn: () => this.openInventory() },
      { ico: '🪦', label: 'Graveyard', fn: () => this.openGraveyard() },
      { sep: true },
      { ico: '💤', label: 'Nap (skip a day)', fn: () => this.nap() },
      { ico: '📄', label: 'README.txt', fn: () => this.openHelp() },
      { ico: '🔄', label: 'New Game', fn: () => this.confirmReset() },
    ];
    for (const it of items) {
      if (it.sep) { sm.appendChild(U.el('div', 'sm-sep')); continue; }
      const el = U.el('div', 'sm-item', `<span class="ico">${it.ico}</span> ${it.label}`);
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
    U.qs('#tray-day b').textContent = s.day;
    U.qs('#tray-pop b').textContent = s.memes.length;
  },

  nap() {
    SFX.play('close');
    Modal.show({
      title: '💤 Nap time',
      bodyHTML: `<p style="text-align:center">Sleep until tomorrow? Memes age 1 day, breeding cooldowns tick, MemeBay restocks.</p>`,
      actions: [
        { label: '😴 Zzz', cls: 'good', fn: () => { Game.advanceDay(); toast('🌅 A new day on the desktop!'); } },
        { label: 'Stay up', cls: '' },
      ],
    });
  },

  confirmReset() {
    Modal.show({
      title: '🔄 New Game',
      bodyHTML: `<p style="text-align:center">Delete your whole desktop and start over?<br><b>This cannot be undone!</b></p>`,
      actions: [
        { label: '🗑️ Wipe it', cls: 'bad', fn: () => Game.reset() },
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
    el.style.top = (opts.y ?? (60 + (openCount % 5) * 36)) + 'px';
    if (opts.w) el.style.width = opts.w + 'px';

    const title = U.el('div', 'win-title',
      `<span class="t-ico">${opts.ico || '🪟'}</span><span class="t-label">${opts.title}</span>`);
    const closeBtn = U.el('button', 'win-btn', '✕');
    title.appendChild(closeBtn);
    el.appendChild(title);
    const body = U.el('div', 'win-body');
    el.appendChild(body);
    document.getElementById('windows').appendChild(el);

    // taskbar button
    const tb = U.el('button', 'task-btn', `${opts.ico || '🪟'} ${opts.title}`);
    tb.onclick = () => { el.style.zIndex = ++this.zTop; SFX.play('click'); };
    document.getElementById('task-buttons').appendChild(tb);

    const win = { el, body, taskBtn: tb, refresh: null };
    this.windows[key] = win;

    closeBtn.onclick = () => this.closeWindow(key);
    el.addEventListener('mousedown', () => { el.style.zIndex = ++this.zTop; });

    // dragging
    title.addEventListener('mousedown', e => {
      if (e.target.closest('.win-btn')) return;
      const startX = e.clientX - el.offsetLeft;
      const startY = e.clientY - el.offsetTop;
      const move = ev => {
        el.style.left = U.clamp(ev.clientX - startX, -el.offsetWidth + 80, window.innerWidth - 60) + 'px';
        el.style.top = U.clamp(ev.clientY - startY, 0, window.innerHeight - 90) + 'px';
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
    box.innerHTML = Sprite.memeSVG(meme);
    el.appendChild(box);
    el.appendChild(U.el('div', 'name-tag', U.esc(meme.name)));
    document.getElementById('meme-layer').appendChild(el);

    const w = {
      el, meme,
      x: U.rand(150, window.innerWidth - 200),
      y: U.rand(120, window.innerHeight - 220),
      tx: 0, ty: 0, state: 'idle', timer: U.rand(0, 3),
    };
    w.tx = w.x; w.ty = w.y;
    el.style.left = w.x + 'px';
    el.style.top = w.y + 'px';
    if (Genetics.stage(meme) === 'baby') el.classList.add('baby');
    this.walkers[meme.id] = w;

    // click = pet, double-click = stats card, drag = yeet around
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
          w.x = U.clamp(ox + ev.clientX - sx, 0, window.innerWidth - 90);
          w.y = U.clamp(oy + ev.clientY - sy, 0, window.innerHeight - 170);
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
        document.addEventListener('mousemove', move); // no-op guard
        document.removeEventListener('mousemove', move);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
    el.addEventListener('click', () => {
      if (moved) return;
      this.petMeme(meme);
    });
    el.addEventListener('dblclick', () => this.openMemeCard(meme.id));
    Tooltip.bind(el, () => `<h4>${U.esc(meme.name)} <span style="opacity:.6">Lv${meme.level}</span></h4>
      <div class="tt-sub">${U.esc(Genetics.describe(meme))}</div>
      <div class="tt-sub">click = pet · double-click = stats · drag = yeet</div>`);
  },

  removeWalker(id) {
    const w = this.walkers[id];
    if (!w) return;
    FX.poof(...(o => [o.x, o.y])(centerOf(w.el)));
    w.el.remove();
    delete this.walkers[id];
  },

  refreshWalkers() {
    // sync with state
    for (const m of Game.state.memes) {
      if (!this.walkers[m.id]) this.spawnWalker(m);
      else {
        const w = this.walkers[m.id];
        w.el.querySelector('.sprite-box').innerHTML = Sprite.memeSVG(m);
        w.el.classList.toggle('baby', Genetics.stage(m) === 'baby');
        w.el.querySelector('.name-tag').textContent = m.name;
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
    if (w.state === 'dragged') return;
    w.timer -= dt;
    if (w.state === 'idle' && w.timer <= 0) {
      if (U.chance(0.2)) {
        w.state = 'sleep'; w.timer = U.rand(4, 8);
        const z = U.el('div', 'zzz', '💤');
        w.el.appendChild(z);
      } else {
        w.state = 'walk';
        w.tx = U.rand(120, window.innerWidth - 160);
        w.ty = U.rand(100, window.innerHeight - 230);
        w.el.classList.add('walking');
        w.el.classList.toggle('flip', w.tx < w.x);
      }
    } else if (w.state === 'sleep' && w.timer <= 0) {
      w.state = 'idle'; w.timer = U.rand(1, 4);
      const z = w.el.querySelector('.zzz'); if (z) z.remove();
    } else if (w.state === 'walk') {
      const spd = (Genetics.stage(w.meme) === 'baby' ? 40 : 62) + Genetics.effStats(w.meme).spd * 3;
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

  petMeme(meme) {
    const w = this.walkers[meme.id];
    if (!w) return;
    const c = centerOf(w.el);
    FX.hearts(c.x, c.y - 20);
    SFX.play('pet');
    this.sayBubble(meme.id, U.pick(DATA.PET_LINES));
    if (meme.pettedDay !== Game.state.day) {
      meme.pettedDay = Game.state.day;
      const ups = Genetics.grantXp(meme, 4);
      floatText(c.x, c.y - 50, '+4 XP', { color: '#05ffa1', size: 18 });
      if (ups) { SFX.play('levelup'); toast(`⭐ <b>${U.esc(meme.name)}</b> leveled up from pure affection!`); }
      Game.save();
    }
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
    return `<span class="pill ${cls}" data-tt="${U.esc(t.desc)}">${t.ico} ${t.name}</span>`;
  },

  abilityPill(abId) {
    const a = DATA.ABILITIES[abId];
    if (!a) return '';
    return `<span class="pill" data-tt="${U.esc(a.desc + (a.cd ? ` (cooldown ${a.cd})` : ''))}">${a.ico} ${a.name}</span>`;
  },

  bindPillTooltips(root) {
    root.querySelectorAll('[data-tt]').forEach(el => Tooltip.bind(el, () => `<div>${el.dataset.tt}</div>`));
  },

  statRowsHTML(meme) {
    const s = Genetics.effStats(meme);
    const rows = [
      ['HP', 'hp', s.hp, 60, '❤️'], ['BONK', 'atk', s.atk, 20, '🔨'],
      ['BRAIN', 'int', s.int, 20, '🧠'], ['ZOOM', 'spd', s.spd, 20, '⚡'], ['LUCK', 'lck', s.lck, 20, '🍀'],
    ];
    return `<div class="stat-rows">` + rows.map(([label, key, val, max, emo]) =>
      `<div class="stat-row"><span class="s-name">${emo} ${label}</span>
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
      title: meme.name, ico: '🐸', cls: 'w-squad',
      build: body => {
        const m = Game.getMeme(memeId);
        if (!m) { this.closeWindow('card_' + memeId); return; }
        const stage = Genetics.stage(m);
        const life = Genetics.effLifespan(m);
        const agePct = U.clamp(m.age / life * 100, 0, 100);
        const xpNeed = Genetics.xpToLevel(m.level);
        body.innerHTML = `
        <div class="meme-card">
          <div class="portrait">${Sprite.memeSVG(m)}<span class="lvl-chip">Lv ${m.level}</span></div>
          <div class="info">
            <h3>${U.esc(m.name)} <span class="gen">GEN ${m.gen}</span></h3>
            <div class="flavor">${U.esc(DATA.FLAVOR_BY_FACE[m.pheno.face] || '')} ${stage === 'baby' ? '<b>(smol baby — too smol to fight)</b>' : ''}</div>
            <div class="age-meter"><span>${stage === 'elder' ? '🥀' : '🌱'} Age ${m.age}/${life}</span>
              <div class="stat-bar sb-age" style="flex:1"><div style="width:${agePct}%"></div></div></div>
            ${this.statRowsHTML(m)}
            <div class="stat-row" style="font-size:11px"><span class="s-name">⭐ XP</span>
              <div class="stat-bar sb-lck"><div style="width:${U.clamp(m.xp / xpNeed * 100, 0, 100)}%"></div></div>
              <span class="s-val" style="width:52px">${m.xp}/${xpNeed}</span></div>
          </div>
        </div>
        <div class="card-section-label">Traits</div>
        <div class="trait-list">${m.traits.length ? m.traits.map(t => this.traitPill(t)).join('') : '<span style="font-size:12px;opacity:.5">none — beautifully average</span>'}</div>
        <div class="card-section-label">Abilities</div>
        <div class="ability-list">${Genetics.abilities(m).map(a => this.abilityPill(a)).join('')}</div>
        <div class="card-section-label">Equipment (click to change)</div>
        <div class="equip-slots">
          <div class="equip-slot ${m.equip.hat ? 'filled' : ''}" data-slot="hat">${m.equip.hat ? DATA.ITEMS[m.equip.hat].ico : '🎩'}<span class="slot-hint">hat</span></div>
          <div class="equip-slot ${m.equip.held ? 'filled' : ''}" data-slot="held">${m.equip.held ? DATA.ITEMS[m.equip.held].ico : '✋'}<span class="slot-hint">held</span></div>
        </div>
        <div class="card-section-label">DNA 🧬</div>
        <div style="font-size:11px;opacity:.75;line-height:1.6">${Object.keys(DATA.GENES).map(g => {
          const [a, b] = m.genome[g];
          const A = DATA.GENES[g].alleles;
          const dom = m.pheno[g];
          const fmt = x => x === dom ? `<b>${A[x].label}</b>` : A[x] ? A[x].label : '?';
          return `${DATA.GENES[g].label}: ${fmt(a)} / ${fmt(b)}`;
        }).join(' &nbsp;·&nbsp; ')}</div>
        <div style="font-size:11px;opacity:.6;margin-top:4px">💀 ${m.kills} viruses deleted · ⚔️ ${m.battles} battles ${m.breedCd ? `· 💕 breeding cooldown: ${m.breedCd}d` : ''}</div>
        <div class="card-actions">
          <button class="chunky-btn small fun" data-act="pet">🖐️ Pet</button>
          <button class="chunky-btn small info" data-act="rename">✏️ Rename</button>
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
      },
    });
  },

  pickEquip(meme, slot) {
    const kind = slot; // 'hat' | 'held'
    const owned = Object.keys(Game.state.inventory).filter(id => DATA.ITEMS[id].kind === kind);
    const node = U.el('div');
    if (meme.equip[slot]) {
      const cur = DATA.ITEMS[meme.equip[slot]];
      const un = U.el('button', 'chunky-btn small warn', `Remove ${cur.ico} ${cur.name}`);
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
      node.appendChild(U.el('p', '', `No ${kind === 'hat' ? 'hats' : 'holdable items'} in your loot. Buy some on MemeBay!`));
    } else {
      const grid = U.el('div', 'inv-grid');
      for (const id of owned) {
        const it = DATA.ITEMS[id];
        const cell = U.el('div', 'inv-item',
          `<span class="ii-count">${Game.state.inventory[id]}</span><span class="ii-ico">${it.ico}</span><span class="ii-name">${it.name}</span>`);
        Tooltip.bind(cell, () => `<h4>${it.ico} ${it.name}</h4><div>${it.desc}</div>`);
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
    Modal.show({ title: `${kind === 'hat' ? '🎩 Pick a hat' : '✋ Pick an item'} for ${U.esc(meme.name)}`, bodyNode: node, actions: [{ label: 'Cancel' }] });
  },

  /* ============================================================
     SQUAD / MY MEMES
     ============================================================ */
  openSquad() {
    this.openWindow('squad', {
      title: 'My Memes', ico: '📇', cls: 'w-squad', w: 480,
      build: body => {
        const memes = Game.state.memes;
        body.innerHTML = `<p style="font-size:12px;opacity:.7;margin-bottom:8px">
          ${memes.length}/${Game.CAPACITY} memes live on your desktop. Click one for details.</p>`;
        const grid = U.el('div', 'squad-grid');
        for (const m of memes) {
          const stage = Genetics.stage(m);
          const cell = U.el('div', 'mini-meme');
          cell.innerHTML = `${stage === 'baby' ? '<span class="mm-flag">🍼</span>' : stage === 'elder' ? '<span class="mm-flag">🥀</span>' : ''}
            ${Sprite.memeSVG(m)}<span class="mm-name">${U.esc(m.name)}</span>
            <span class="mm-sub">Lv${m.level} · Gen${m.gen}</span>`;
          cell.onclick = () => { SFX.play('select'); this.openMemeCard(m.id); };
          grid.appendChild(cell);
        }
        if (!memes.length) grid.innerHTML = '<p>It\'s quiet... too quiet. No memes!</p>';
        body.appendChild(grid);
      },
    });
  },

  /* ============================================================
     BREEDER 2000
     ============================================================ */
  breedSel: [null, null],

  openBreeder() {
    this.openWindow('breeder', {
      title: 'Breeder2000.exe', ico: '🧬', cls: 'w-breed',
      build: body => this.renderBreeder(body),
    });
  },

  renderBreeder(body) {
    const [aId, bId] = this.breedSel;
    const A = aId ? Game.getMeme(aId) : null;
    const B = bId ? Game.getMeme(bId) : null;
    body.innerHTML = '';
    const wrap = U.el('div', 'breed-wrap');

    const parents = U.el('div', 'breed-parents');
    const mkSlot = (meme, idx) => {
      const slot = U.el('div', 'parent-slot' + (meme ? ' filled' : ''));
      slot.innerHTML = meme
        ? `${Sprite.memeSVG(meme)}<span class="p-name">${U.esc(meme.name)}</span><span class="p-hint">${meme.breedCd ? '💕 cooldown ' + meme.breedCd + 'd' : 'ready to mingle'}</span>`
        : `<span class="p-empty">➕</span><span class="p-hint">choose a meme</span>`;
      slot.onclick = () => { SFX.play('click'); this.breedSel[idx] = null; this.renderBreederPicker(body, idx); };
      return slot;
    };
    parents.appendChild(mkSlot(A, 0));
    parents.appendChild(U.el('div', 'breed-heart', '💘'));
    parents.appendChild(mkSlot(B, 1));
    wrap.appendChild(parents);

    const warn = U.el('div', 'breed-warn');
    let error = null;
    if (A && B) {
      if (A.id === B.id) error = 'A meme cannot breed with itself. It has tried.';
      else if (A.breedCd || B.breedCd) error = 'Somebody is on breeding cooldown. Patience.';
      else if (Game.state.memes.length >= Game.CAPACITY) error = 'Desktop full! (max ' + Game.CAPACITY + ' memes)';
      else if (Genetics.related(A, B)) warn.innerHTML = '⚠️ REPOST ALERT: these memes are related. The baby will be <b>Reposted</b> (-2 all stats).';
    }
    if (error) warn.textContent = '🚫 ' + error;
    wrap.appendChild(warn);

    const go = U.el('button', 'chunky-btn fun breed-go', '💘 FUSE THE MEMES 💘');
    go.disabled = !(A && B) || !!error;
    go.onclick = () => this.doBreed(A, B);
    wrap.appendChild(go);

    wrap.appendChild(U.el('p', '', `<span style="font-size:11px;opacity:.6">Children inherit one random allele per gene from each parent (dominant one shows), blend stats with a lucky drift, and can mutate rare genes. Parents get a 3-day cooldown.</span>`));
    body.appendChild(wrap);
  },

  renderBreederPicker(body, idx) {
    body.innerHTML = '';
    const wrap = U.el('div', 'breed-wrap');
    wrap.appendChild(U.el('p', '', `<b>Pick parent ${idx === 0 ? 'A' : 'B'}:</b> <span style="font-size:12px;opacity:.6">(adults only, no cooldown)</span>`));
    const grid = U.el('div', 'breed-pick-grid');
    for (const m of Game.state.memes) {
      const eligible = Genetics.stage(m) !== 'baby' && !m.breedCd && this.breedSel[1 - idx] !== m.id;
      const cell = U.el('div', 'mini-meme' + (eligible ? '' : ' disabled'));
      cell.innerHTML = `${Sprite.memeSVG(m)}<span class="mm-name">${U.esc(m.name)}</span>
        <span class="mm-sub">${Genetics.stage(m) === 'baby' ? 'baby' : m.breedCd ? 'cooldown ' + m.breedCd + 'd' : 'Gen' + m.gen}</span>`;
      if (eligible) cell.onclick = () => {
        SFX.play('select');
        this.breedSel[idx] = m.id;
        this.renderBreeder(body);
      };
      grid.appendChild(cell);
    }
    wrap.appendChild(grid);
    const back = U.el('button', 'chunky-btn small', '← Back');
    back.onclick = () => this.renderBreeder(body);
    wrap.appendChild(back);
    body.appendChild(wrap);
  },

  doBreed(A, B) {
    const { baby, inbred } = Genetics.breed(A, B, Game.state.day);
    A.breedCd = 3; B.breedCd = 3;
    Game.state.stats.memesBred++;
    this.breedSel = [null, null];
    SFX.play('boing');

    // egg reveal ceremony
    const node = U.el('div', 'egg-reveal');
    node.innerHTML = `<p><b>${U.esc(A.name)}</b> + <b>${U.esc(B.name)}</b> = ???</p>
      <div class="egg">🥚</div><p style="font-size:12px;opacity:.6">click the egg!!</p>`;
    const modal = Modal.show({ title: '🧬 Something is hatching...', bodyNode: node, actions: [], noClose: true });
    let taps = 0;
    const egg = node.querySelector('.egg');
    egg.onclick = () => {
      taps++;
      SFX.play('egg');
      egg.style.transform = `scale(${1 + taps * 0.08}) rotate(${U.rand(-15, 15)}deg)`;
      egg.textContent = taps === 1 ? '🥚' : '🐣';
      const c = centerOf(egg);
      FX.sparkle(c.x, c.y, 4);
      if (taps >= 3) {
        const c2 = centerOf(egg);
        FX.confetti(c2.x, c2.y, 40);
        SFX.play('birth');
        Shake.hit(6);
        Game.addMeme(baby);
        Game.save();
        node.innerHTML = `
          <div style="width:120px">${Sprite.memeSVG(baby)}</div>
          <h3>${U.esc(baby.name)} <span style="font-size:12px;color:var(--grape)">GEN ${baby.gen}</span></h3>
          <p style="font-size:12px;opacity:.75">${U.esc(Genetics.describe(baby))}</p>
          <div class="trait-list" style="justify-content:center">${baby.traits.map(t => this.traitPill(t)).join('') || '<span style="font-size:12px;opacity:.5">no traits — a blank slate</span>'}</div>
          <div class="ability-list" style="justify-content:center">${Genetics.abilities(baby).map(a => this.abilityPill(a)).join('')}</div>
          ${inbred ? '<p style="color:var(--red);font-size:12px"><b>♻️ it is... a repost.</b></p>' : ''}
          <p style="font-size:11px;opacity:.6">It'll be battle-ready in ${Genetics.ADULT_AGE} days.</p>
          <button class="chunky-btn good">Welcome! 🎉</button>`;
        this.bindPillTooltips(node);
        node.querySelector('button').onclick = () => { Modal.hide(); this.refreshAllWindows(); };
      }
    };
  },

  /* ============================================================
     SHOP — MemeBay
     ============================================================ */
  openShop() {
    this.openWindow('shop', {
      title: 'MemeBay™', ico: '🛒', cls: 'w-shop',
      build: body => {
        body.innerHTML = `<div class="shop-wrap">
          <div class="shop-head"><span>🪙 You have <b>${Game.state.coins}</b></span>
          <span style="font-size:11px;opacity:.6">Fresh stock every day!</span></div>
          <div class="shop-grid"></div></div>`;
        const grid = body.querySelector('.shop-grid');
        for (const id of Game.state.shopStock) {
          const it = DATA.ITEMS[id];
          const cell = U.el('div', 'shop-item');
          cell.innerHTML = `<span class="si-ico">${it.ico}</span><span class="si-name">${it.name}</span>
            <span class="si-desc">${it.desc}</span>`;
          const buy = U.el('button', 'chunky-btn small warn', `🪙 ${it.price}`);
          buy.onclick = () => {
            if (!Game.spend(it.price)) return;
            Game.addItem(id);
            SFX.play('buy');
            const c = centerOf(buy);
            FX.sparkle(c.x, c.y, 6);
            toast(`🛒 Bought <b>${it.ico} ${it.name}</b>!`);
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
      title: 'Loot Stash', ico: '🎒', w: 420,
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
            `<span class="ii-count">${inv[id]}</span><span class="ii-ico">${it.ico}</span><span class="ii-name">${it.name}</span>`);
          Tooltip.bind(cell, () => `<h4>${it.ico} ${it.name}</h4><div>${it.desc}</div>`);
          cell.onclick = () => {
            if (it.home) this.useItemOnMemePicker(id);
            else if (it.battle) toast(`⚔️ <b>${it.name}</b> can only be used in battle (from the 🎒 Bag button).`);
            else toast(`👒 Equip <b>${it.name}</b> from a meme's card (double-click a meme).`);
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
      cell.innerHTML = `${Sprite.memeSVG(m)}<span class="mm-name">${U.esc(m.name)}</span>`;
      cell.onclick = () => {
        Modal.hide();
        if (Game.useHomeItem(itemId, m)) {
          this.refreshAllWindows();
          this.refreshWalkers();
        }
      };
      grid.appendChild(cell);
    }
    node.appendChild(grid);
    Modal.show({ title: `${it.ico} Use ${it.name} on...`, bodyNode: node, actions: [{ label: 'Cancel' }] });
  },

  /* ============================================================
     GRAVEYARD
     ============================================================ */
  openGraveyard() {
    this.openWindow('graveyard', {
      title: 'Meme Graveyard', ico: '🪦', cls: 'w-grave',
      build: body => {
        const g = Game.state.graveyard;
        body.innerHTML = `<div class="grave-wrap">
          <p style="font-size:12px;opacity:.7;margin-bottom:8px">Every legend gets archived eventually.
          <b>Necropost</b> brings one back as a zombie meme (once per meme).</p></div>`;
        const wrap = body.querySelector('.grave-wrap');
        if (!g.length) { wrap.innerHTML += '<p style="text-align:center;font-size:32px">🕊️<br><span style="font-size:13px">No dead memes. Yet.</span></p>'; return; }
        for (const entry of g.slice().reverse()) {
          const row = U.el('div', 'grave-row');
          const cost = Game.necropostCost(entry);
          row.innerHTML = `${Sprite.tombSVG()}
            <div class="g-info"><div class="g-name">💀 ${U.esc(entry.meme.name)} <span style="opacity:.5;font-weight:normal">Gen ${entry.meme.gen} · Lv ${entry.meme.level}</span></div>
            <div class="g-sub">${U.esc(entry.cause)} on day ${entry.day} — "${U.esc(entry.epitaph)}"</div></div>`;
          const btn = U.el('button', 'chunky-btn small fun', entry.meme.necroposted ? '⚰️ at peace' : `🧟 ${cost}🪙`);
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
     MISSIONS
     ============================================================ */
  missionUnlocked(idx) {
    if (idx === 0) return true;
    const prev = DATA.MISSIONS[idx - 1];
    return !!Game.state.missionsDone[prev.id];
  },

  openMissions() {
    this.openWindow('missions', {
      title: 'virus_hunter.exe', ico: '⚔️', cls: 'w-missions',
      build: body => {
        body.innerHTML = `<div class="missions-wrap">
          <p style="font-size:12px;opacity:.75">Your drive is INFESTED. Send up to 4 memes per mission. Each hunt takes 1 day. Fallen memes are gone for good (mostly)...</p>
        </div>`;
        const wrap = body.querySelector('.missions-wrap');
        DATA.MISSIONS.forEach((mi, idx) => {
          const unlocked = this.missionUnlocked(idx);
          const done = Game.state.missionsDone[mi.id];
          const row = U.el('div', 'mission-row' + (unlocked ? '' : ' locked') + (done ? ' done' : ''));
          const foes = mi.endless
            ? `wave ${Game.state.cloudWave + 1} — ???`
            : mi.foes.map(f => DATA.VIRUSES[f].emoji).join(' ');
          row.innerHTML = `<span class="m-ico">${mi.ico}</span>
            <div class="m-info">
              <div class="m-name">${mi.name} <span class="skull-diff">${'💀'.repeat(mi.diff)}</span> ${done ? `<span style="color:#12c94b;font-size:12px">✔ cleared ×${done}</span>` : ''}</div>
              <div class="m-desc">${mi.desc}</div>
              <div class="m-foes">${foes}</div>
              <div class="m-reward">Reward: ~${mi.reward[0]}-${mi.reward[1]} 🪙 ${mi.itemChance >= 1 ? '+ guaranteed item' : mi.itemChance > 0.5 ? '+ likely item' : ''}</div>
            </div>`;
          const go = U.el('button', 'chunky-btn ' + (unlocked ? 'bad' : ''), unlocked ? '⚔️ GO' : '🔒');
          go.disabled = !unlocked;
          go.onclick = () => this.openSquadPicker(mi);
          row.appendChild(go);
          wrap.appendChild(row);
        });
      },
    });
  },

  openSquadPicker(mission) {
    const adults = Game.aliveAdults();
    if (!adults.length) {
      SFX.play('error');
      toast('🍼 No battle-ready memes! Babies can\'t fight. Wait for them to grow or adopt.');
      return;
    }
    const sel = new Set();
    const node = U.el('div');
    node.innerHTML = `<p class="squad-pick-note">Choose up to <b>4</b> memes for <b>${mission.ico} ${mission.name}</b>:</p>`;
    const grid = U.el('div', 'breed-pick-grid');
    const goBtn = U.el('button', 'chunky-btn bad', '⚔️ DEPLOY THE MEMES');
    goBtn.disabled = true;
    for (const m of adults) {
      const cell = U.el('div', 'mini-meme');
      const s = Genetics.effStats(m);
      cell.innerHTML = `${Sprite.memeSVG(m)}<span class="mm-name">${U.esc(m.name)}</span>
        <span class="mm-sub">Lv${m.level} ❤️${s.hp} 🔨${s.atk}</span>`;
      cell.onclick = () => {
        if (sel.has(m.id)) { sel.delete(m.id); cell.classList.remove('selected'); }
        else if (sel.size < 4) { sel.add(m.id); cell.classList.add('selected'); SFX.play('select'); }
        goBtn.disabled = sel.size === 0;
        goBtn.textContent = `⚔️ DEPLOY ${sel.size ? sel.size + ' MEME' + (sel.size > 1 ? 'S' : '') : 'THE MEMES'}`;
      };
      grid.appendChild(cell);
    }
    node.appendChild(grid);
    Modal.show({
      title: `${mission.ico} ${mission.name}`,
      bodyNode: node,
      actions: [{ label: 'Cancel' }],
    }).querySelector('.modal-actions').prepend(goBtn);
    goBtn.onclick = () => {
      if (!sel.size) return;
      Modal.hide();
      const squad = [...sel].map(id => Game.getMeme(id));
      Combat.start(mission, squad);
    };
  },

  /* ============================================================
     SCAM POPUP mini-event
     ============================================================ */
  spawnScamPopup(auto) {
    const el = U.el('div', 'win');
    el.style.left = U.rand(150, Math.max(160, window.innerWidth - 460)) + 'px';
    el.style.top = U.rand(80, Math.max(90, window.innerHeight - 320)) + 'px';
    el.style.zIndex = ++this.zTop;
    el.style.width = '300px';
    const prizes = ['1,000,000 DOGECOINS', 'A FREE MEME', 'HOT VIRUSES IN YOUR AREA', 'THE MISSING RAM', 'A REAL EMAIL FROM A PRINCE'];
    el.innerHTML = `<div class="win-title" style="background:linear-gradient(90deg,#ff4d6d,#ff9e3d)">
        <span class="t-ico">🎁</span><span class="t-label">totally_legit.exe</span></div>
      <div class="win-body" style="text-align:center">
        <p style="font-size:15px"><b>🎉 CONGRATULATION!!</b></p>
        <p style="font-size:13px">You are the 1,000,000th user!<br>You won <b>${U.pick(prizes)}</b>!</p>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:10px">
          <button class="chunky-btn warn claim">CLAIM 🤑</button>
        </div>
      </div>`;
    const closeBtn = U.el('button', 'win-btn', '✕');
    el.querySelector('.win-title').appendChild(closeBtn);
    document.getElementById('windows').appendChild(el);
    SFX.play('spawn');
    if (!auto) toast('⚠️ A suspicious pop-up appeared! Close it... or "claim your prize" 🤔');

    closeBtn.onclick = () => {
      el.remove();
      const gain = U.randInt(2, 6);
      Game.addCoins(gain, null);
      SFX.play('coin');
      toast(`🛡️ Pop-up blocked like a pro! +${gain} 🪙`);
      Game.save();
    };
    el.querySelector('.claim').onclick = () => {
      el.remove();
      const loss = Math.min(Game.state.coins, U.randInt(4, 10));
      Game.state.coins -= loss;
      this.updateTray();
      SFX.play('error');
      Shake.hit(8);
      toast(`💸 It was a scam!! -${loss} 🪙 (gasp. shock. horror.)`);
      if (U.chance(0.6)) setTimeout(() => this.spawnScamPopup(true), 600);
      Game.save();
    };
  },

  /* ============================================================
     HELP / README
     ============================================================ */
  openHelp() {
    this.openWindow('help', {
      title: 'README.txt', ico: '📄', w: 520,
      build: body => {
        body.innerHTML = `
        <div style="font-size:13px;line-height:1.65">
          <p><b>🧬 MEME-GENICS</b> — your desktop is alive with memes, and the viruses want it.</p>
          <p style="margin-top:8px"><b>🐸 MEMES:</b> click = pet · double-click = stats · drag = yeet them around.
          They age 1 day per mission/nap and eventually go <i>stale</i> forever. Keep the bloodline going!</p>
          <p style="margin-top:8px"><b>🧬 BREEDING:</b> pick two adults in Breeder2000. Kids inherit one allele per
          gene from each parent — the dominant one shows. Stats blend with a lucky drift, traits pass down,
          and mutations sneak in rare genes (RAINBOW! LASER EYES!). Related parents = <b>Reposted</b> baby. Gross.</p>
          <p style="margin-top:8px"><b>⚔️ BATTLES:</b> hex-grid tactics. Move (green), then act. BONK is free;
          fancy abilities have cooldowns and scale off BONK or BRAIN. ZOOM sets turn order & movement,
          LUCK feeds crits. Viruses you delete drop 🪙 and XP. <b>Memes that die in battle are DEAD.</b>
          (Unless you necropost them at the graveyard. Or burn Copium mid-fight.)</p>
          <p style="margin-top:8px"><b>🛒 ECONOMY:</b> coins buy hats (yes, hats matter), held items and consumables
          on MemeBay. Stock rotates daily.</p>
          <p style="margin-top:8px"><b>🏆 GOAL:</b> climb the mission list, delete the SPAM KING, then flex on
          the endless Cloud with your genetically perfected super-memes.</p>
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
      title: '🧬 Welcome to MEME-GENICS!',
      bodyHTML: `<div style="text-align:center">
        <p style="font-size:15px">Your desktop has exactly two (2) memes and a virus problem.</p>
        <div style="display:flex;justify-content:center;gap:10px;margin:10px 0">
          <div style="width:100px">${Sprite.memeSVG(Game.state.memes[0])}</div>
          <div style="width:100px">${Sprite.memeSVG(Game.state.memes[1])}</div>
        </div>
        <p style="font-size:13px">🖐️ Pet your memes. 🧬 Breed dank bloodlines. ⚔️ Delete evil viruses.<br>
        Memes don't live forever — their <b>genes</b> do.</p>
        <p style="font-size:12px;opacity:.6;margin-top:6px">(psst: read README.txt on the desktop for the full manual)</p>
      </div>`,
      actions: [{ label: 'LESGOOO 🔥', cls: 'fun', fn: () => { Game.state.seenIntro = true; Game.save(); SFX.startMusic(); } }],
    });
  },
};
