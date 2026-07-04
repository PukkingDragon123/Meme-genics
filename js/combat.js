/* ============================================================
   MEME-GENICS — combat.js
   Hex-grid turn-based tactics: memes vs viruses
   ============================================================ */

const Combat = {
  W: 9, H: 6,
  DIRS: [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]],

  state: null,   // {mission, cells, units, round, queue, qi, loot, over, busy}
  S: 46,         // hex half-width (synced with CSS)
  HEXW: 92, ROWH: 79.6,

  /* ============================================================
     SETUP
     ============================================================ */
  start(mission, squad) {
    SFX.play('whoosh');
    document.getElementById('battle').classList.remove('hidden');
    document.getElementById('start-menu').classList.add('hidden');

    this.S = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hex-size')) || 46;
    this.HEXW = this.S * 2;
    this.ROWH = this.S * 1.732;

    const st = {
      mission,
      cells: new Map(),
      units: [],
      round: 0,
      queue: [], qi: -1,
      loot: { coins: 0, stolen: 0 },
      over: false,
      busy: false,
      mode: 'idle',          // idle | move | target
      selAbility: null,
      deadMemes: [],
    };
    this.state = st;

    document.getElementById('battle-title').textContent = `${mission.ico} ${mission.name.toUpperCase()}`;
    const bg = document.getElementById('battle-bg');
    bg.querySelectorAll('.bg-emoji').forEach(e => e.remove());
    for (let i = 0; i < 8; i++) {
      const e = U.el('div', 'bg-emoji', U.pick(mission.bg));
      e.style.left = U.rand(2, 92) + '%';
      e.style.top = U.rand(5, 85) + '%';
      e.style.animationDelay = -U.rand(0, 8) + 's';
      bg.appendChild(e);
    }

    this.buildField();
    this.placeUnits(squad, this.rosterFor(mission));
    this.renderTurnOrderBar();

    document.getElementById('btn-endturn').onclick = () => this.playerEndTurn();
    document.getElementById('btn-flee').onclick = () => this.confirmFlee();
    document.getElementById('btn-bag').onclick = () => this.openBag();

    bigBanner(U.pick(['⚔️ GET MEMED!', '⚔️ IT\'S MEMEING TIME', '⚔️ DELETE THEM ALL']));
    SFX.play('fanfare');
    setTimeout(() => this.nextRound(), 900);
  },

  rosterFor(mission) {
    if (!mission.endless) return mission.foes.slice();
    // endless cloud: generated waves
    const wave = Game.state.cloudWave + 1;
    const pool = ['popup', 'worm', 'drone', 'blob', 'spyder', 'phish', 'ransom', 'trojan', 'adware', 'miner'];
    const count = Math.min(8, 3 + Math.floor(wave / 2));
    const foes = [];
    for (let i = 0; i < count; i++) foes.push(U.pick(pool));
    if (wave % 4 === 0) foes[foes.length - 1] = U.pick(['captcha', 'bsod', 'spamking']);
    return foes;
  },

  buildField() {
    const st = this.state;
    const field = document.getElementById('battle-field');
    field.innerHTML = '';

    let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
    const coords = [];
    for (let r = 0; r < this.H; r++) {
      const qOff = -Math.floor(r / 2);
      for (let q = qOff; q < qOff + this.W; q++) coords.push([q, r]);
    }
    for (const [q, r] of coords) {
      const { x, y } = this.px(q, r);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
    field.style.width = (maxX - minX + this.HEXW) + 'px';
    field.style.height = (maxY + this.S * 2.31) + 'px';
    st.offsetX = -minX;

    for (const [q, r] of coords) {
      const cell = { q, r, blocked: false, hazard: false, coin: 0, unit: null, el: null };
      const el = U.el('div', 'hex' + ((q + 2 * r) % 2 ? ' alt' : ''));
      const { x, y } = this.px(q, r);
      el.style.left = (x + st.offsetX) + 'px';
      el.style.top = y + 'px';
      el.dataset.k = `${q},${r}`;
      el.onclick = () => this.onHexClick(cell);
      el.onmouseenter = () => this.onHexHover(cell);
      field.appendChild(el);
      cell.el = el;
      st.cells.set(`${q},${r}`, cell);
    }

    // decorate: obstacles, hazards, coins (keep spawn columns clear)
    const deco = this.state.mission.deco;
    const inner = [...st.cells.values()].filter(c => {
      const col = c.q + Math.floor(c.r / 2);
      return col >= 2 && col <= this.W - 3;
    });
    for (const c of U.shuffle(inner).slice(0, U.randInt(3, 5))) {
      c.blocked = true;
      c.el.classList.add('blocked');
      c.el.appendChild(U.el('div', 'hex-deco', U.pick(deco)));
    }
    for (const c of U.shuffle(inner.filter(c => !c.blocked)).slice(0, U.randInt(1, 3))) {
      c.hazard = true;
      c.el.classList.add('hazard');
      c.el.appendChild(U.el('div', 'hex-deco', '🔥'));
    }
    for (const c of U.shuffle(inner.filter(c => !c.blocked && !c.hazard)).slice(0, U.randInt(1, 3))) {
      c.coin = U.randInt(4, 10);
      c.el.appendChild(U.el('div', 'hex-deco', '🪙'));
    }
  },

  px(q, r) { return { x: this.HEXW * (q + r / 2), y: this.ROWH * r }; },
  key(q, r) { return `${q},${r}`; },
  cell(q, r) { return this.state.cells.get(this.key(q, r)); },
  dist(a, b) {
    const dq = a.q - b.q, dr = a.r - b.r;
    return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
  },
  neighbors(c) {
    const out = [];
    for (const [dq, dr] of this.DIRS) {
      const n = this.cell(c.q + dq, c.r + dr);
      if (n) out.push(n);
    }
    return out;
  },

  /* ============================================================
     UNITS
     ============================================================ */
  placeUnits(squad, foeIds) {
    const st = this.state;
    // memes on left columns, viruses on right
    const leftCells = U.shuffle([...st.cells.values()].filter(c => {
      const col = c.q + Math.floor(c.r / 2);
      return col <= 1 && !c.blocked && !c.hazard;
    }));
    const rightCells = U.shuffle([...st.cells.values()].filter(c => {
      const col = c.q + Math.floor(c.r / 2);
      return col >= this.W - 2 && !c.blocked && !c.hazard;
    }));

    squad.forEach((meme, i) => {
      const s = Genetics.effStats(meme);
      const u = {
        id: U.uid('u'), isMeme: true, meme,
        name: meme.name, stats: s,
        hp: s.hp, hpMax: s.hp,
        abilities: Genetics.abilities(meme),
        cds: {}, statuses: [],
        moved: false, acted: false,
        el: null, cell: null,
      };
      meme.battles++;
      this.spawnUnitAt(u, leftCells[i % leftCells.length]);
    });

    const wave = this.state.mission.endless ? Game.state.cloudWave + 1 : 0;
    const scale = 1 + wave * 0.07;
    foeIds.forEach((fid, i) => {
      this.spawnVirus(fid, rightCells[i % rightCells.length], scale);
    });
  },

  spawnVirus(fid, cell, scale = 1) {
    const def = DATA.VIRUSES[fid];
    const u = {
      id: U.uid('v'), isMeme: false, def, virusId: fid,
      name: def.name,
      stats: { atk: Math.round(def.atk * scale), int: def.atk, spd: def.spd, lck: 3, crit: 5, resist: def.boss ? 40 : 0, dodge: 0 },
      hp: Math.round(def.hp * scale), hpMax: Math.round(def.hp * scale),
      abilities: def.abilities.slice(),
      cds: {}, statuses: [],
      moved: false, acted: false,
      el: null, cell: null,
    };
    if (!cell || cell.unit) cell = this.freeCellNear(cell || U.pick([...this.state.cells.values()]));
    if (!cell) return null;
    this.spawnUnitAt(u, cell);
    return u;
  },

  spawnUnitAt(u, cell) {
    const st = this.state;
    const field = document.getElementById('battle-field');
    const el = U.el('div', 'unit ' + (u.isMeme ? 'meme' : 'foe'));
    el.style.width = this.HEXW + 'px';
    el.style.height = this.HEXW + 'px';
    const body = U.el('div', 'u-body');
    body.innerHTML = u.isMeme
      ? Sprite.memeSVG(u.meme)
      : Sprite.virusHTML(u.def);
    el.appendChild(body);
    const hpbar = U.el('div', 'u-hp', '<div style="width:100%"></div>');
    el.appendChild(hpbar);
    el.appendChild(U.el('div', 'u-status'));
    field.appendChild(el);
    u.el = el;
    st.units.push(u);
    this.moveUnitTo(u, cell, true);

    Tooltip.bind(el, () => this.unitTooltip(u));
    el.style.pointerEvents = 'auto';
    el.addEventListener('click', e => {
      const c = u.cell;
      if (c) this.onHexClick(c);
      e.stopPropagation();
    });

    const c = centerOf(el);
    FX.poof(c.x, c.y);
    SFX.play('spawn');
  },

  unitTooltip(u) {
    const sts = u.statuses.map(s => `${DATA.STATUS[s.id].ico} ${DATA.STATUS[s.id].name} (${s.turns})`).join(' ');
    if (u.isMeme) {
      return `<h4>${U.esc(u.name)}</h4><div class="tt-sub">❤️${u.hp}/${u.hpMax} 🔨${u.stats.atk} 🧠${u.stats.int} ⚡${u.stats.spd}</div>${sts ? `<div>${sts}</div>` : ''}`;
    }
    return `<h4>${u.def.emoji} ${U.esc(u.name)}</h4>
      <div class="tt-sub">❤️${u.hp}/${u.hpMax} · 🔨${u.stats.atk} · moves ${u.def.move}</div>
      <div style="font-style:italic;font-size:11px;margin-top:2px">${U.esc(u.def.flavor)}</div>${sts ? `<div>${sts}</div>` : ''}`;
  },

  moveUnitTo(u, cell, instant) {
    if (u.cell) u.cell.unit = null;
    u.cell = cell;
    cell.unit = u;
    const { x, y } = this.px(cell.q, cell.r);
    if (instant) u.el.style.transition = 'none';
    u.el.style.left = (x + this.state.offsetX) + 'px';
    u.el.style.top = (y + this.S * 0.15) + 'px';
    if (instant) requestAnimationFrame(() => { u.el.style.transition = ''; });
  },

  freeCellNear(cell) {
    if (!cell) return null;
    if (!cell.unit && !cell.blocked) return cell;
    const seen = new Set([this.key(cell.q, cell.r)]);
    let frontier = [cell];
    while (frontier.length) {
      const next = [];
      for (const c of frontier) {
        for (const n of this.neighbors(c)) {
          const k = this.key(n.q, n.r);
          if (seen.has(k)) continue;
          seen.add(k);
          if (!n.unit && !n.blocked) return n;
          next.push(n);
        }
      }
      frontier = next;
    }
    return null;
  },

  /* ============================================================
     TURN ENGINE
     ============================================================ */
  livingMemes() { return this.state.units.filter(u => u.isMeme && u.hp > 0); },
  livingFoes() { return this.state.units.filter(u => !u.isMeme && u.hp > 0); },

  nextRound() {
    const st = this.state;
    if (st.over) return;
    st.round++;
    document.getElementById('battle-round').textContent = 'ROUND ' + st.round;
    st.queue = st.units.filter(u => u.hp > 0)
      .sort((a, b) => (b.stats.spd + U.rand(0, 0.9)) - (a.stats.spd + U.rand(0, 0.9)));
    st.qi = -1;
    this.renderTurnOrderBar();
    if (st.round > 1) this.log(`— Round ${st.round} —`, true);
    this.nextTurn();
  },

  async nextTurn() {
    const st = this.state;
    if (st.over) return;
    if (this.checkEnd()) return;

    st.qi++;
    if (st.qi >= st.queue.length) { this.nextRound(); return; }
    const u = st.queue[st.qi];
    if (!u || u.hp <= 0) { this.nextTurn(); return; }

    st.active = u;
    u.moved = false; u.acted = false; u.bonusMove = 0;
    this.renderTurnOrderBar();

    // start-of-turn effects
    st.busy = true;
    const skip = await this.tickTurnStart(u);
    if (st.over) return;
    if (skip || u.hp <= 0) { await U.wait(300); st.busy = false; this.nextTurn(); return; }

    // cooldowns tick
    for (const k of Object.keys(u.cds)) if (u.cds[k] > 0) u.cds[k]--;

    const confused = u.statuses.some(s => s.id === 'confuse');

    if (!u.isMeme || confused) {
      this.setMode('idle');
      this.renderUnitCard(u);
      await U.wait(400);
      if (confused) await this.confusedTurn(u);
      else await this.aiTurn(u);
      if (st.over) return;
      this.endOfTurn(u);
      st.busy = false;
      this.nextTurn();
    } else {
      // player meme turn
      st.busy = false;
      this.renderUnitCard(u);
      this.autoSelectAbility(u);
      this.showMoveRange(u);
      const c = centerOf(u.el);
      if (U.chance(0.25)) floatText(c.x, c.y - 60, U.pick(DATA.BATTLE_CRIES), { color: '#fffb96', size: 16 });
    }
  },

  async tickTurnStart(u) {
    let skip = false;
    const c = () => centerOf(u.el);
    // dots
    for (const s of u.statuses) {
      if (s.id === 'burn' && !(u.isMeme && u.meme.traits.includes('zombie'))) {
        await this.dealRaw(u, 3, '🔥');
      } else if (s.id === 'poison' && !(u.isMeme && u.meme.traits.includes('zombie'))) {
        await this.dealRaw(u, 2, '🤢');
      }
      if (this.state.over || u.hp <= 0) return true;
    }
    // wholesome regen
    if (u.isMeme && u.meme.traits.includes('wholesome') && u.hp > 0 && u.hp < u.hpMax) {
      u.hp = Math.min(u.hpMax, u.hp + 2);
      this.updateHpBar(u);
      floatText(c().x, c().y - 40, '+2', { color: '#7dff9b', size: 16 });
    }
    // miner steals
    if (!u.isMeme && u.def.ai === 'miner') {
      this.state.loot.stolen += 2;
      floatText(c().x, c().y - 50, '⛏️ -2🪙', { color: '#ffd86b', size: 16 });
      this.log(`${u.def.emoji} ${u.name} mined 2 coins out of your loot!`);
    }
    // stun check
    const stun = u.statuses.find(s => s.id === 'stun');
    if (stun) {
      floatText(c().x, c().y - 50, '💫 BONKED', { color: '#b967ff', size: 20 });
      SFX.play('stun');
      this.expireStatus(u, 'stun');
      skip = true;
    }
    // captcha invulnerability announce
    if (!u.isMeme && u.def.captcha) {
      const invuln = this.state.round % 2 === 0;
      if (invuln) this.log(`🚦 ${u.name} is VERIFYING — invulnerable this round!`, true);
    }
    return skip;
  },

  endOfTurn(u) {
    // decrement statuses that tick per own-turn
    for (const s of u.statuses.slice()) {
      s.turns--;
      if (s.turns <= 0) this.expireStatus(u, s.id);
    }
    this.renderStatusIcons(u);
  },

  expireStatus(u, id) {
    const i = u.statuses.findIndex(s => s.id === id);
    if (i >= 0) u.statuses.splice(i, 1);
    this.renderStatusIcons(u);
  },

  checkEnd() {
    const st = this.state;
    if (st.over) return true;
    if (!this.livingFoes().length) { this.finish(true); return true; }
    if (!this.livingMemes().length) { this.finish(false); return true; }
    return false;
  },

  /* ============================================================
     PLAYER INPUT
     ============================================================ */
  setMode(mode) {
    this.state.mode = mode;
    this.clearHighlights();
  },

  clearHighlights() {
    for (const c of this.state.cells.values()) {
      c.el.classList.remove('hl-move', 'hl-attack', 'hl-heal', 'hl-path', 'hl-aoe', 'hoverable');
    }
  },

  showMoveRange(u) {
    if (u.moved) { this.setMode('idle'); return; }
    this.setMode('move');
    const cells = this.reachable(u, this.moveBudget(u));
    for (const c of cells) { c.el.classList.add('hl-move', 'hoverable'); }
  },

  moveBudget(u) {
    let m = u.isMeme ? Genetics.moveRange(u.meme) : u.def.move;
    if (u.statuses.some(s => s.id === 'slow')) m -= 2;
    if (u.statuses.some(s => s.id === 'spdUp')) m += 2;
    return Math.max(1, m);
  },

  reachable(u, budget) {
    const start = u.cell;
    const dist = new Map([[this.key(start.q, start.r), 0]]);
    const out = [];
    let frontier = [start];
    while (frontier.length) {
      const next = [];
      for (const c of frontier) {
        const d = dist.get(this.key(c.q, c.r));
        if (d >= budget) continue;
        for (const n of this.neighbors(c)) {
          const k = this.key(n.q, n.r);
          if (dist.has(k) || n.blocked || n.unit) continue;
          dist.set(k, d + 1);
          out.push(n);
          next.push(n);
        }
      }
      frontier = next;
    }
    u._reach = dist;
    return out;
  },

  pathTo(u, target) {
    // BFS with parent tracking (recompute; cheap on this grid size)
    const start = u.cell;
    const parent = new Map();
    const startK = this.key(start.q, start.r);
    parent.set(startK, null);
    let frontier = [start];
    while (frontier.length) {
      const next = [];
      for (const c of frontier) {
        for (const n of this.neighbors(c)) {
          const k = this.key(n.q, n.r);
          if (parent.has(k) || n.blocked || n.unit) continue;
          parent.set(k, c);
          if (n === target) {
            const path = [n];
            let cur = c;
            while (cur && cur !== start) { path.unshift(cur); cur = parent.get(this.key(cur.q, cur.r)); }
            return path;
          }
          next.push(n);
        }
      }
      frontier = next;
    }
    return null;
  },

  async onHexClick(cell) {
    const st = this.state;
    if (st.busy || st.over || !st.active || !st.active.isMeme) return;
    const u = st.active;

    if (st.mode === 'move' && cell.el.classList.contains('hl-move')) {
      st.busy = true;
      this.clearHighlights();
      const path = this.pathTo(u, cell);
      if (path) await this.walkPath(u, path);
      u.moved = true;
      st.busy = false;
      if (st.over) return;
      if (u.hp <= 0) { this.setMode('idle'); this.nextTurn(); return; } // died on a hazard
      if (u.acted) this.maybeAutoEnd(u);
      else { this.autoSelectAbility(u); }
      this.renderUnitCard(u);
      return;
    }

    if (st.mode === 'target' && (cell.el.classList.contains('hl-attack') || cell.el.classList.contains('hl-heal'))) {
      if (!cell.unit && !st.selAbility) return;
      st.busy = true;
      this.clearHighlights();
      await this.execAbility(u, st.selAbility, cell);
      u.acted = true;
      st.busy = false;
      if (st.over) return;
      if (u.hp <= 0) { this.setMode('idle'); this.nextTurn(); return; } // cursed self-bonk etc.
      this.renderUnitCard(u);
      this.maybeAutoEnd(u);
      return;
    }
  },

  onHexHover(cell) {
    // reserved for path previews; highlights already communicate range
  },

  maybeAutoEnd(u) {
    if (u.acted && u.moved) {
      setTimeout(() => { if (this.state.active === u && !this.state.busy && !this.state.over) this.playerEndTurn(); }, 450);
    } else if (u.acted && !u.moved) {
      this.showMoveRange(u);
    }
  },

  playerEndTurn() {
    const st = this.state;
    if (st.busy || st.over || !st.active || !st.active.isMeme) return;
    SFX.play('click');
    this.setMode('idle');
    this.endOfTurn(st.active);
    this.nextTurn();
  },

  autoSelectAbility(u) {
    const first = u.abilities.find(a => !(u.cds[a] > 0));
    this.selectAbility(u, first || 'bonk');
  },

  selectAbility(u, abId) {
    const st = this.state;
    if (u.cds[abId] > 0 || u.acted) { this.renderUnitCard(u); return; }
    st.selAbility = abId;
    const ab = DATA.ABILITIES[abId];
    this.renderUnitCard(u);

    // self-cast abilities execute instantly on button press? No — need confirm via button double-press.
    // We highlight targets; self abilities get executed via the same button (handled in renderUnitCard).
    this.clearHighlights();
    if (u.moved !== true && st.mode !== 'target') { /* keep */ }
    st.mode = 'target';

    if (ab.target === 'self') {
      // show AoE preview around self
      if (ab.aoe) {
        for (const c of this.state.cells.values()) {
          if (this.dist(c, u.cell) <= ab.aoe && c !== u.cell) c.el.classList.add(ab.heal ? 'hl-heal' : 'hl-aoe');
        }
      }
      u.cell.el.classList.add(ab.heal ? 'hl-heal' : 'hl-aoe');
      return;
    }

    for (const c of this.state.cells.values()) {
      if (!c.unit || c.unit.hp <= 0) continue;
      const inRange = ab.line
        ? this.inLine(u.cell, c) && this.dist(c, u.cell) <= ab.range && this.lineClear(u.cell, c)
        : this.dist(c, u.cell) <= ab.range;
      if (!inRange) continue;
      if (ab.target === 'enemy' && !c.unit.isMeme) c.el.classList.add('hl-attack', 'hoverable');
      if (ab.target === 'ally' && c.unit.isMeme) c.el.classList.add('hl-heal', 'hoverable');
    }
  },

  // true if no blocked hex sits between a and b along their shared line
  lineClear(a, b) {
    const dir = this.dirTowards(a, b);
    if (!dir) return false;
    for (let k = 1; k <= this.dist(a, b); k++) {
      const c = this.cell(a.q + dir[0] * k, a.r + dir[1] * k);
      if (!c) return false;
      if (c === b) return true;
      if (c.blocked) return false;
    }
    return true;
  },

  inLine(a, b) {
    const dq = b.q - a.q, dr = b.r - a.r;
    if (dq === 0 && dr === 0) return false;
    for (const [xq, xr] of this.DIRS) {
      // b = a + k * dir?
      if (xq === 0 && xr === 0) continue;
      const kq = xq !== 0 ? dq / xq : null;
      const kr = xr !== 0 ? dr / xr : null;
      if (xq === 0) { if (dq === 0 && kr > 0 && Number.isInteger(kr)) return true; }
      else if (xr === 0) { if (dr === 0 && kq > 0 && Number.isInteger(kq)) return true; }
      else if (kq !== null && kq === kr && kq > 0 && Number.isInteger(kq)) return true;
    }
    return false;
  },

  async walkPath(u, path) {
    for (const step of path) {
      this.moveUnitTo(u, step);
      SFX.play('step');
      await U.wait(140);
      // coin pickup
      if (step.coin && u.isMeme) {
        this.state.loot.coins += step.coin;
        const c = centerOf(u.el);
        FX.coins(c.x, c.y, 5);
        SFX.play('coin');
        floatText(c.x, c.y - 40, `+${step.coin}🪙`, { color: '#ffd86b', size: 20 });
        step.coin = 0;
        const deco = step.el.querySelector('.hex-deco');
        if (deco) deco.remove();
      }
      // hazard damage on entering
      if (step.hazard) {
        await this.dealRaw(u, 4, '🔥');
        if (u.hp <= 0) break;
      }
    }
    await U.wait(120);
  },

  /* ============================================================
     ABILITY EXECUTION
     ============================================================ */
  async execAbility(u, abId, targetCell) {
    const st = this.state;
    const ab = DATA.ABILITIES[abId];
    u.cds[abId] = ab.cd + 1; // ticks down at start of own turn; net = cd turns
    if (ab.cd === 0) u.cds[abId] = 0;

    u.el.classList.add('attacking');
    setTimeout(() => u.el.classList.remove('attacking'), 320);

    const targets = [];
    if (ab.target === 'self') {
      targets.push(u.cell);
      if (ab.aoe) for (const c of st.cells.values()) if (this.dist(c, u.cell) <= ab.aoe && c !== u.cell) targets.push(c);
    } else if (ab.line) {
      // everything along the line from u to targetCell direction, up to range
      const dir = this.dirTowards(u.cell, targetCell);
      if (dir) {
        for (let k = 1; k <= ab.range; k++) {
          const c = this.cell(u.cell.q + dir[0] * k, u.cell.r + dir[1] * k);
          if (!c) break;
          if (c.blocked) break;
          targets.push(c);
        }
      }
    } else if (ab.aoe) {
      targets.push(targetCell);
      for (const c of st.cells.values()) if (this.dist(c, targetCell) <= ab.aoe && c !== targetCell) targets.push(c);
    } else {
      targets.push(targetCell);
    }

    this.log(`${u.isMeme ? '🐸' : '👾'} ${u.name} used ${ab.ico} ${ab.name}!`);

    // ---- special: summon clone ----
    if (ab.summon) {
      const spot = this.freeCellNear(u.cell);
      if (spot && u.isMeme) {
        const s = u.stats;
        const clone = {
          id: U.uid('c'), isMeme: true, meme: u.meme, isClone: true,
          name: u.name + ' (copy)',
          stats: { ...s, atk: Math.max(1, Math.round(s.atk * 0.4)), int: Math.max(1, Math.round(s.int * 0.4)) },
          hp: Math.max(1, Math.round(u.hpMax * 0.4)), hpMax: Math.max(1, Math.round(u.hpMax * 0.4)),
          abilities: ['bonk'], cds: {}, statuses: [], moved: false, acted: false, el: null, cell: null,
        };
        this.spawnUnitAt(clone, spot);
        clone.el.style.opacity = 0.82;
        this.state.queue.push(clone);
        this.renderTurnOrderBar();
        SFX.play('boing');
      }
      await U.wait(300);
      return;
    }

    // ---- special: dash (nyan) ----
    if (ab.dash) {
      const dir = this.dirTowards(u.cell, targetCell);
      if (dir) {
        SFX.play('whoosh');
        for (let k = 1; k <= ab.range; k++) {
          const c = this.cell(u.cell.q + dir[0], u.cell.r + dir[1]);
          if (!c || c.blocked) break;
          if (c.unit) break; // stop before the victim
          this.moveUnitTo(u, c);
          const cc = centerOf(u.el);
          FX.rainbow(cc.x, cc.y + 20, 6);
          await U.wait(110);
        }
      }
    }

    // ---- special: zoomies ----
    if (ab.extraMove) {
      u.moved = false;
      SFX.play('whoosh');
    }

    if (ab.selfStatus) this.applyStatus(u, u, { ...ab.selfStatus, chance: 1 });

    // ---- hit each target ----
    let any = false;
    for (const c of targets) {
      if (u.hp <= 0) break; // the caster died mid-ability (reflect, hazard...)
      const t = c.unit;
      if (!t || t.hp <= 0) continue;

      if (ab.target === 'ally' && !ab.heal) {
        // pure buff (STONKS et al) — status only, on allies
        if (t.isMeme !== u.isMeme) continue;
        any = true;
        if (ab.status) this.applyStatus(u, t, ab.status);
        await U.wait(150);
      } else if (ab.heal) {
        if (!t.isMeme && u.isMeme) continue;
        if (t.isMeme !== u.isMeme) continue;
        any = true;
        let amount = Math.round(u.stats.int * ab.power);
        if (ab.lucky) {
          const roll = U.chance(U.clamp(u.stats.lck / 100 + 0.35, 0, 0.95));
          amount = roll ? Math.round(u.stats.int * ab.power) : 1;
          if (!roll) this.log('🙏 ...it did basically nothing.');
        }
        await this.healUnit(u, t, amount);
      } else {
        if (t === u) continue;
        if (t.isMeme === u.isMeme) continue; // no friendly fire on damage abilities
        any = true;
        let mult = 1;
        if (ab.fullhp && t.hp >= t.hpMax) mult *= ab.fullhp;
        if (ab.execute && t.hp / t.hpMax <= ab.execute) mult *= 2;
        if (ab.power > 0) {
          await this.attack(u, t, { power: ab.power * mult, stat: ab.stat, noCounter: true });
        }
        if (t.hp > 0 && ab.status) this.applyStatus(u, t, ab.status);
        if (t.hp > 0 && ab.knockback) await this.knockback(t, u.cell, ab.knockback);
      }
      if (this.state.over) return;
    }
    if (!any && ab.target !== 'self' && !ab.line) this.log('...it hit nothing but air.');

    await U.wait(250);
    this.renderTurnOrderBar();
  },

  dirTowards(from, to) {
    const dq = to.q - from.q, dr = to.r - from.r;
    for (const [xq, xr] of this.DIRS) {
      // does dir * k == (dq,dr) for integer k>0?
      let k = null;
      if (xq !== 0 && dq % xq === 0) k = dq / xq;
      else if (xq === 0 && dq === 0 && xr !== 0) k = dr / xr;
      if (k !== null && k > 0 && Number.isInteger(k) && from.q + xq * k === to.q && from.r + xr * k === to.r) return [xq, xr];
    }
    // fallback: nearest direction
    let best = null, bd = Infinity;
    for (const [xq, xr] of this.DIRS) {
      const c = this.cell(from.q + xq, from.r + xr);
      if (!c) continue;
      const d = this.dist(c, to);
      if (d < bd) { bd = d; best = [xq, xr]; }
    }
    return best;
  },

  /* ============================================================
     DAMAGE / HEAL / STATUS
     ============================================================ */
  outgoingMult(u) {
    let m = 1;
    if (u.statuses.some(s => s.id === 'atkUp')) m *= 1.5;
    if (u.statuses.some(s => s.id === 'atkDown')) m *= 0.6;
    if (u.isMeme && u.meme.traits.includes('stale')) m *= 0.9;
    // cringe aura from adjacent allies
    if (u.cell) {
      for (const n of this.neighbors(u.cell)) {
        if (n.unit && n.unit !== u && n.unit.isMeme === u.isMeme && n.unit.isMeme && n.unit.meme.traits.includes('cringe')) { m *= 0.85; break; }
      }
    }
    return m;
  },

  async attack(attacker, target, opts = {}) {
    const st = this.state;
    if (!target || target.hp <= 0) return;

    // cursed self-bonk
    if (attacker.isMeme && attacker.meme.traits.includes('cursed') && U.chance(0.06)) {
      this.log(`👁️ ${attacker.name} bonked ITSELF. classic.`);
      await this.dealRaw(attacker, Math.max(1, Math.round(attacker.stats.atk * 0.5)), '👁️');
      return;
    }

    // captcha invulnerability (even rounds)
    if (!target.isMeme && target.def.captcha && st.round % 2 === 0) {
      const c = centerOf(target.el);
      floatText(c.x, c.y - 50, '🚦 VERIFY FIRST', { color: '#01cdfe', size: 18 });
      SFX.play('error');
      return;
    }

    // dodge
    if (target.stats.dodge && U.chance(target.stats.dodge / 100)) {
      const c = centerOf(target.el);
      floatText(c.x, c.y - 50, '😇 DODGED', { color: '#05ffa1', size: 20 });
      SFX.play('whoosh');
      return;
    }

    const stat = opts.stat === 'int' ? attacker.stats.int : attacker.stats.atk;
    let dmg = stat * (opts.power || 1) * U.rand(0.85, 1.15) * this.outgoingMult(attacker);

    // crit
    const isCrit = U.chance((attacker.stats.crit || 5) / 100);
    if (isCrit) dmg *= 1.75;

    // target modifiers
    if (target.isMeme && target.meme.traits.includes('ratiod')) dmg *= 1.12;

    dmg = Math.max(1, Math.round(dmg));

    // reflect
    const refl = target.statuses.find(s => s.id === 'reflect');
    if (refl) {
      this.expireStatus(target, 'reflect');
      const c = centerOf(target.el);
      floatText(c.x, c.y - 50, '🔄 NO U', { color: '#01cdfe', size: 22 });
      SFX.play('zap');
      await U.wait(200);
      await this.dealRaw(attacker, dmg, '🔄');
      return;
    }

    // shield absorb
    const sh = target.statuses.find(s => s.id === 'shield');
    if (sh) {
      const absorbed = Math.min(sh.power || 5, dmg);
      dmg -= absorbed;
      sh.power -= absorbed;
      if (sh.power <= 0) this.expireStatus(target, 'shield');
    }

    await this.dealRaw(target, dmg, null, { crit: isCrit, attacker });
  },

  async dealRaw(target, dmg, emoji, opts = {}) {
    if (!target || target.hp <= 0) return;
    target.hp = Math.max(0, target.hp - dmg);
    this.updateHpBar(target);
    const c = centerOf(target.el);

    target.el.classList.remove('hurt');
    void target.el.offsetWidth;
    target.el.classList.add('hurt');

    if (opts.crit) {
      floatText(c.x, c.y - 46, `${dmg}`, { color: '#ff4d6d', size: 40 });
      floatText(c.x, c.y - 84, U.pick(DATA.CRIT_WORDS), { color: '#fffb96', size: 22 });
      FX.boom(c.x, c.y);
      SFX.play('crit');
      Shake.hit(10);
    } else {
      floatText(c.x, c.y - 46, `${emoji ? emoji + ' ' : ''}${dmg}`, { color: '#fff', size: 26 });
      FX.hit(c.x, c.y);
      SFX.play(target.isMeme ? 'hurt' : 'bonk');
      Shake.hit(4);
    }

    if (target.hp <= 0) await this.killUnit(target, opts.attacker);
  },

  async healUnit(healer, target, amount) {
    if (target.hp <= 0) return;
    if (target.isMeme && target.meme.traits.includes('doomer')) amount = Math.ceil(amount / 2);
    amount = Math.max(1, Math.round(amount));
    target.hp = Math.min(target.hpMax, target.hp + amount);
    this.updateHpBar(target);
    const c = centerOf(target.el);
    FX.heal(c.x, c.y);
    floatText(c.x, c.y - 46, `+${amount}`, { color: '#7dff9b', size: 26 });
    SFX.play('heal');
    await U.wait(150);
  },

  applyStatus(source, target, spec) {
    if (target.hp <= 0) return;
    let chance = spec.chance !== undefined ? spec.chance : 1;
    if (spec.luckBoost && source.isMeme) chance += source.stats.lck / 150;
    if (!U.chance(chance)) return;

    // resist
    const st = DATA.STATUS[spec.id];
    if (st.bad && target.stats.resist && U.chance(target.stats.resist / 100)) {
      const c = centerOf(target.el);
      floatText(c.x, c.y - 50, '🐺 RESISTED', { color: '#b967ff', size: 16 });
      return;
    }
    // zombie immune to dots
    if (target.isMeme && target.meme.traits.includes('zombie') && (spec.id === 'poison' || spec.id === 'burn')) return;

    const existing = target.statuses.find(s => s.id === spec.id);
    if (existing) existing.turns = Math.max(existing.turns, spec.turns);
    else target.statuses.push({ id: spec.id, turns: spec.turns, power: spec.power || (spec.id === 'shield' ? 8 : 0) });

    const c = centerOf(target.el);
    floatText(c.x, c.y - 62, `${st.ico} ${st.name}!`, { color: st.bad ? '#ff9e3d' : '#05ffa1', size: 16 });
    this.renderStatusIcons(target);
  },

  async knockback(target, fromCell, tiles) {
    const dir = this.dirTowards(fromCell, target.cell);
    if (!dir) return;
    SFX.play('whoosh');
    for (let i = 0; i < tiles; i++) {
      const next = this.cell(target.cell.q + dir[0], target.cell.r + dir[1]);
      if (!next || next.blocked || next.unit) {
        // slam!
        await this.dealRaw(target, 2, '💥');
        break;
      }
      this.moveUnitTo(target, next);
      await U.wait(120);
      if (next.hazard) { await this.dealRaw(target, 4, '🔥'); if (target.hp <= 0) return; }
    }
    const c = centerOf(target.el);
    floatText(c.x, c.y - 60, 'YEET', { color: '#fffb96', size: 20 });
  },

  async killUnit(u, killer) {
    const st = this.state;
    u.el.classList.add('dying');
    const c = centerOf(u.el);
    SFX.play('death');
    FX.boom(c.x, c.y);
    Shake.hit(8);

    if (u.isMeme) {
      FX.skull(c.x, c.y);
      floatText(c.x, c.y - 60, 'F', { color: '#fff', size: 46 });
      this.log(`💀 ${u.name} was DELETED... F in the chat.`, true);
      if (!u.isClone) st.deadMemes.push(u);
    } else {
      floatText(c.x, c.y - 60, 'DELETED', { color: '#05ffa1', size: 24 });
      this.log(`✅ ${u.name} deleted! +${u.def.bounty}🪙`);
      st.loot.coins += u.def.bounty;
      Game.state.stats.virusesDeleted++;
      if (killer && killer.isMeme && !killer.isClone) {
        killer.meme.kills++;
        const ups = Genetics.grantXp(killer.meme, u.def.xp);
        const kc = centerOf(killer.el);
        floatText(kc.x, kc.y - 66, `+${u.def.xp} XP`, { color: '#01cdfe', size: 16 });
        if (ups) {
          SFX.play('levelup');
          FX.confetti(kc.x, kc.y, 20);
          floatText(kc.x, kc.y - 92, 'LEVEL UP!', { color: '#fffb96', size: 24 });
          // heal on level up, refresh stats
          killer.stats = Genetics.effStats(killer.meme);
          killer.hpMax = killer.stats.hp;
          killer.hp = Math.min(killer.hpMax, killer.hp + 8);
          this.updateHpBar(killer);
        }
      }
      // viral spread
      if (killer && killer.isMeme && killer.meme.traits && killer.meme.traits.includes('viral')) {
        for (const n of this.neighbors(u.cell)) {
          if (n.unit && !n.unit.isMeme && n.unit.hp > 0) {
            await this.dealRaw(n.unit, 3, '🦠');
          }
        }
      }
      // blob splits
      if (u.def.splits) {
        await U.wait(400);
        for (let i = 0; i < 2; i++) {
          const spot = this.freeCellNear(u.cell);
          if (spot) {
            const mini = this.spawnVirus('miniblob', spot);
            if (mini) { st.queue.push(mini); }
          }
        }
        this.log('🫠 The blob SPLIT! Ugh.');
        this.renderTurnOrderBar();
      }
    }

    await U.wait(500);
    if (u.cell) { u.cell.unit = null; u.cell = null; }
    u.el.remove();
    this.renderTurnOrderBar();
    this.checkEnd();
  },

  updateHpBar(u) {
    const bar = u.el.querySelector('.u-hp > div');
    if (bar) bar.style.width = U.clamp(u.hp / u.hpMax * 100, 0, 100) + '%';
    this.renderTurnOrderBar();
    if (this.state.active === u) this.renderUnitCard(u);
  },

  renderStatusIcons(u) {
    if (!u.el) return;
    const box = u.el.querySelector('.u-status');
    if (box) box.innerHTML = u.statuses.map(s => DATA.STATUS[s.id].ico).join('');
  },

  /* ============================================================
     ENEMY AI
     ============================================================ */
  pickTarget(u) {
    const memes = this.livingMemes();
    if (!memes.length) return null;
    // clickbait taunt
    const baited = memes.filter(m => !m.isClone && m.meme.traits.includes('clickbait'));
    const pool = baited.length && U.chance(0.7) ? baited : memes;
    // nearest, tiebreak lowest hp
    pool.sort((a, b) => (this.dist(u.cell, a.cell) - this.dist(u.cell, b.cell)) || (a.hp - b.hp));
    return pool[0];
  },

  async aiTurn(u) {
    const st = this.state;
    await U.wait(250);

    if (u.isClone) { await this.cloneTurn(u); return; }

    const def = u.def;
    const target = this.pickTarget(u);
    if (!target) return;

    // pick best usable ability
    const usable = u.abilities.filter(a => !(u.cds[a] > 0));
    const byPriority = usable.sort((a, b) => {
      const A = DATA.VIRUS_ABILITIES[a], B = DATA.VIRUS_ABILITIES[b];
      return ((B.summon ? 3 : 0) + (B.status ? 1 : 0) + B.range / 10) - ((A.summon ? 3 : 0) + (A.status ? 1 : 0) + A.range / 10);
    });

    // summoner: summon first if possible
    for (const abId of byPriority) {
      const ab = DATA.VIRUS_ABILITIES[abId];
      if (ab.summon) {
        await this.virusCast(u, abId, u.cell);
        // then maybe still move away a bit; done
        this.postMoveAI(u, target, def);
        return;
      }
    }

    if (def.ai === 'miner') {
      // shuffles around aimlessly, occasionally bites back if adjacent
      const adj = this.neighbors(u.cell).find(n => n.unit && n.unit.isMeme && n.unit.hp > 0);
      if (adj && !(u.cds['vbite'] > 0)) await this.virusCast(u, 'vbite', adj);
      else await this.aiWander(u);
      return;
    }

    const desiredRange = def.ai === 'ranged' ? this.bestRangedRange(u) : 1;

    // self-centered AoEs (vbsod) have range 0 but reach out to their aoe radius
    const castRange = ab => (ab.aoe && ab.range === 0) ? ab.aoe : ab.range;

    // if any usable ability can hit now, use it
    for (const abId of byPriority) {
      const ab = DATA.VIRUS_ABILITIES[abId];
      if (ab.summon) continue;
      if (this.dist(u.cell, target.cell) <= castRange(ab)) {
        await this.virusCast(u, abId, target.cell);
        return;
      }
    }

    // move toward (or kite away for ranged)
    await this.aiApproach(u, target, desiredRange);
    if (st.over || u.hp <= 0) return;

    // try again after moving
    for (const abId of byPriority) {
      const ab = DATA.VIRUS_ABILITIES[abId];
      if (ab.summon) continue;
      if (this.dist(u.cell, target.cell) <= castRange(ab)) {
        await this.virusCast(u, abId, target.cell);
        return;
      }
    }
  },

  bestRangedRange(u) {
    let r = 1;
    for (const a of u.abilities) {
      const ab = DATA.VIRUS_ABILITIES[a];
      if (ab && ab.range > r) r = ab.range;
    }
    return Math.max(2, r - 1);
  },

  async postMoveAI(u, target, def) {
    // small reposition after summoning
    if (U.chance(0.5)) await this.aiWander(u);
  },

  async aiWander(u) {
    const cells = this.reachable(u, 1).filter(c => !c.hazard);
    if (cells.length) {
      this.moveUnitTo(u, U.pick(cells));
      await U.wait(250);
    }
  },

  async aiApproach(u, target, desiredRange) {
    const budget = this.moveBudget(u);
    const reach = this.reachable(u, budget);
    if (!reach.length) return;
    // choose the reachable cell that best matches desiredRange to target (avoid hazards)
    let best = null, bestScore = Infinity;
    for (const c of reach.concat([u.cell])) {
      const d = this.dist(c, target.cell);
      let score = Math.abs(d - desiredRange) * 10 + (c.hazard ? 50 : 0) + U.rand(0, 3);
      if (score < bestScore) { bestScore = score; best = c; }
    }
    if (best && best !== u.cell) {
      const path = this.pathTo(u, best);
      if (path) {
        for (const step of path) {
          this.moveUnitTo(u, step);
          await U.wait(110);
          if (step.hazard) { await this.dealRaw(u, 4, '🔥'); if (u.hp <= 0) return; }
          if (step.coin) {
            // viruses gobble coins, the monsters
            step.coin = 0;
            const deco = step.el.querySelector('.hex-deco');
            if (deco) deco.remove();
            this.log(`${u.def.emoji} ${u.name} ate the coins. Rude.`);
          }
        }
      }
    }
  },

  async virusCast(u, abId, targetCell) {
    const ab = DATA.VIRUS_ABILITIES[abId];
    u.cds[abId] = ab.cd + 1;
    if (ab.cd === 0) u.cds[abId] = 0;

    u.el.classList.add('attacking');
    setTimeout(() => u.el.classList.remove('attacking'), 320);
    this.log(`👾 ${u.name}: ${ab.ico} ${ab.name}!`);

    if (ab.summon) {
      for (let i = 0; i < (ab.count || 1); i++) {
        const spot = this.freeCellNear(u.cell);
        if (spot) {
          const v = this.spawnVirus(ab.summon, spot);
          if (v) this.state.queue.push(v);
        }
      }
      this.renderTurnOrderBar();
      await U.wait(350);
      return;
    }

    const targets = [];
    if (ab.aoe) {
      // centered on self for vbsod
      for (const c of this.state.cells.values()) {
        if (this.dist(c, u.cell) <= ab.aoe && c.unit && c.unit.isMeme && c.unit.hp > 0) targets.push(c.unit);
      }
    } else {
      const t = targetCell.unit;
      if (t && t.isMeme && t.hp > 0) targets.push(t);
    }

    for (const t of targets) {
      if (u.hp <= 0) break; // caster died mid-cast (UNO Reverse reflect)
      await this.attack(u, t, { power: ab.power, stat: 'atk' });
      if (t.hp > 0 && ab.status) this.applyStatus(u, t, ab.status);
      if (t.hp > 0 && ab.pull && u.cell) await this.pull(t, u.cell, ab.pull);
      if (ab.steal && t.hp > 0) {
        const stolen = Math.min(Game.state.coins, ab.steal);
        if (stolen > 0) {
          Game.state.coins -= stolen;
          Desktop.updateTray();
          const c = centerOf(t.el);
          floatText(c.x, c.y - 70, `-${stolen}🪙`, { color: '#ff9e3d', size: 18 });
          this.log(`🔒 ${u.name} extorted ${stolen} coins!`);
        }
      }
      if (this.state.over) return;
    }
    await U.wait(300);
  },

  async pull(target, towardCell, tiles) {
    SFX.play('whoosh');
    for (let i = 0; i < tiles; i++) {
      const dir = this.dirTowards(target.cell, towardCell);
      if (!dir) break;
      const next = this.cell(target.cell.q + dir[0], target.cell.r + dir[1]);
      if (!next || next.blocked || next.unit || next === towardCell) break;
      this.moveUnitTo(target, next);
      await U.wait(120);
      if (next.hazard) { await this.dealRaw(target, 4, '🔥'); if (target.hp <= 0) return; }
    }
    const c = centerOf(target.el);
    floatText(c.x, c.y - 55, '🪝 HOOKED', { color: '#01cdfe', size: 18 });
  },

  async confusedTurn(u) {
    const c = centerOf(u.el);
    floatText(c.x, c.y - 60, '🎶 never gonna give you up 🎶', { color: '#ff71ce', size: 14 });
    await this.aiWander(u);
    // bonk random adjacent anyone
    const adj = this.neighbors(u.cell).filter(n => n.unit && n.unit.hp > 0);
    if (adj.length && U.chance(0.7)) {
      const victim = U.pick(adj).unit;
      await this.attack(u, victim, { power: 0.8, stat: 'atk' });
    }
    await U.wait(250);
  },

  async cloneTurn(u) {
    // clones: simple melee AI vs viruses
    const foes = this.livingFoes();
    if (!foes.length) return;
    foes.sort((a, b) => this.dist(u.cell, a.cell) - this.dist(u.cell, b.cell));
    const target = foes[0];
    if (this.dist(u.cell, target.cell) > 1) await this.aiApproach(u, target, 1);
    if (this.dist(u.cell, target.cell) <= 1 && target.hp > 0) {
      await this.attack(u, target, { power: 1, stat: 'atk', noCounter: true });
    }
    await U.wait(200);
  },

  /* ============================================================
     BATTLE UI
     ============================================================ */
  renderTurnOrderBar() {
    const st = this.state;
    const box = document.getElementById('turn-order');
    box.innerHTML = '';
    if (!st.queue.length) return;
    st.queue.forEach((u, i) => {
      const chip = U.el('div', 'to-chip' + (u.isMeme ? '' : ' foe') + (i === st.qi ? ' active' : '') + (u.hp <= 0 ? ' dead' : ''));
      chip.innerHTML = (u.isMeme
        ? Sprite.memeSVG(u.meme, { equip: false })
        : `<span class="to-emoji">${u.def.emoji}</span>`)
        + `<div class="to-hp"><div style="width:${U.clamp(u.hp / u.hpMax * 100, 0, 100)}%"></div></div>`;
      Tooltip.bind(chip, () => this.unitTooltip(u));
      box.appendChild(chip);
    });
  },

  renderUnitCard(u) {
    const card = document.getElementById('unit-card');
    const btns = document.getElementById('action-buttons');
    if (!u) { card.innerHTML = ''; btns.innerHTML = ''; return; }

    const isPlayers = u.isMeme && !u.statuses.some(s => s.id === 'confuse');
    card.innerHTML = `
      <div class="uc-face">${u.isMeme ? Sprite.memeSVG(u.meme, { equip: false }) : `<span class="uc-emoji">${u.def.emoji}</span>`}</div>
      <div class="uc-info">
        <span class="uc-name">${U.esc(u.name)}</span>
        <span>❤️ ${u.hp}/${u.hpMax} &nbsp; 🔨 ${u.stats.atk} &nbsp; 🧠 ${u.stats.int}</span>
        <span style="opacity:.7">${u.moved ? '✓ moved' : '🟢 can move'} · ${u.acted ? '✓ acted' : '🟢 can act'}</span>
        <div class="uc-tags">${u.statuses.map(s => `<span class="pill">${DATA.STATUS[s.id].ico} ${DATA.STATUS[s.id].name}</span>`).join('')}</div>
      </div>`;

    btns.innerHTML = '';
    if (!isPlayers || !this.state.active || this.state.active !== u) {
      if (!u.isMeme) btns.innerHTML = `<span style="font-size:13px;font-weight:bold;opacity:.6">😈 virus is plotting...</span>`;
      return;
    }

    for (const abId of u.abilities) {
      const ab = DATA.ABILITIES[abId];
      const onCd = u.cds[abId] > 0;
      const b = U.el('button', 'ability-btn' + (this.state.selAbility === abId ? ' selected' : ''));
      b.innerHTML = `<span class="ab-ico">${ab.ico}</span><span class="ab-name">${ab.name}</span>
        <span class="ab-sub">${ab.target === 'self' ? 'self' : 'rng ' + ab.range}${ab.cd ? ' · cd ' + ab.cd : ''}</span>
        ${onCd ? `<span class="ab-cd">${u.cds[abId]}</span>` : ''}`;
      b.disabled = onCd || u.acted;
      Tooltip.bind(b, () => `<h4>${ab.ico} ${ab.name}</h4><div>${ab.desc}</div>${ab.cd ? `<div class="tt-sub">cooldown: ${ab.cd} turns</div>` : ''}`);
      b.onclick = async () => {
        SFX.play('select');
        if (ab.target === 'self') {
          if (this.state.selAbility === abId) {
            // second press = confirm self-cast
            this.state.busy = true;
            this.clearHighlights();
            await this.execAbility(u, abId, u.cell);
            u.acted = true;
            this.state.busy = false;
            if (this.state.over) return;
            if (u.hp <= 0) { this.setMode('idle'); this.nextTurn(); return; }
            this.renderUnitCard(u);
            this.maybeAutoEnd(u);
          } else {
            this.selectAbility(u, abId);
            toast(`${ab.ico} press again to confirm <b>${ab.name}</b>`, 1600);
          }
        } else {
          this.selectAbility(u, abId);
        }
      };
      btns.appendChild(b);
    }
    const mv = U.el('button', 'ability-btn' + (this.state.mode === 'move' ? ' selected' : ''));
    mv.innerHTML = `<span class="ab-ico">👟</span><span class="ab-name">Move</span><span class="ab-sub">${this.moveBudget(u)} tiles</span>`;
    mv.disabled = u.moved;
    mv.onclick = () => { SFX.play('select'); this.state.selAbility = null; this.showMoveRange(u); this.renderUnitCard(u); };
    btns.prepend(mv);
  },

  log(msg, important) {
    const box = document.getElementById('battle-log');
    const line = U.el('div', 'log-line' + (important ? ' important' : ''), msg);
    box.appendChild(line);
    while (box.children.length > 9) box.firstChild.remove();
  },

  /* ============================================================
     BAG (consumables in battle)
     ============================================================ */
  openBag() {
    const st = this.state;
    if (st.over) return;
    if (st.busy || !st.active || !st.active.isMeme || st.active.isClone
        || st.active.statuses.some(s => s.id === 'confuse')) {
      SFX.play('error');
      toast('🎒 Wait for one of your memes\' turns!');
      return;
    }
    const usable = Object.keys(Game.state.inventory).filter(id => DATA.ITEMS[id].battle);
    const node = U.el('div');
    if (!usable.length) node.innerHTML = '<p>No battle consumables! MemeBay sells pizza, copium and more.</p>';
    const grid = U.el('div', 'inv-grid');
    for (const id of usable) {
      const it = DATA.ITEMS[id];
      const cell = U.el('div', 'inv-item',
        `<span class="ii-count">${Game.state.inventory[id]}</span><span class="ii-ico">${it.ico}</span><span class="ii-name">${it.name}</span>`);
      Tooltip.bind(cell, () => `<h4>${it.ico} ${it.name}</h4><div>${it.desc}</div>`);
      cell.onclick = () => { Modal.hide(); this.useBattleItem(id); };
      grid.appendChild(cell);
    }
    node.appendChild(grid);
    Modal.show({ title: '🎒 Battle Bag', bodyNode: node, actions: [{ label: 'Close' }] });
  },

  async useBattleItem(id) {
    const st = this.state;
    const it = DATA.ITEMS[id];

    const pickAlly = (includeDead) => new Promise(resolve => {
      const pool = st.units.filter(u => u.isMeme && !u.isClone && (includeDead ? u.hp <= 0 : u.hp > 0));
      if (!pool.length) { resolve(null); return; }
      const node = U.el('div');
      const grid = U.el('div', 'breed-pick-grid');
      for (const u of pool) {
        const cell = U.el('div', 'mini-meme');
        cell.innerHTML = `${Sprite.memeSVG(u.meme)}<span class="mm-name">${U.esc(u.name)}</span><span class="mm-sub">❤️${Math.max(0, u.hp)}/${u.hpMax}</span>`;
        cell.onclick = () => { Modal.hide(); resolve(u); };
        grid.appendChild(cell);
      }
      node.appendChild(grid);
      Modal.show({ title: `${it.ico} Use on...`, bodyNode: node, actions: [{ label: 'Cancel', fn: () => resolve(null) }] });
    });

    switch (it.battle) {
      case 'heal': {
        const t = await pickAlly(false);
        if (!t) return;
        Game.removeItem(id);
        await this.healUnit(t, t, it.power);
        this.log(`🍕 ${t.name} scarfed a pizza slice. +${it.power} HP`);
        break;
      }
      case 'energy': {
        const u = st.active;
        if (!u || !u.isMeme) { toast('⚡ Wait for one of your memes\' turn!'); return; }
        Game.removeItem(id);
        u.moved = false;
        u.cds = {};
        SFX.play('levelup');
        const c = centerOf(u.el);
        FX.sparkle(c.x, c.y, 12);
        this.log(`🧃 ${u.name} chugged a whole G-Fuel barrel!!`);
        this.renderUnitCard(u);
        this.showMoveRange(u);
        break;
      }
      case 'revive': {
        const t = await pickAlly(true);
        if (!t) return;
        Game.removeItem(id);
        const spot = this.freeCellNear(this.livingMemes()[0] ? this.livingMemes()[0].cell : [...st.cells.values()][0]);
        if (!spot) return;
        t.hp = Math.round(t.hpMax / 2);
        t.statuses = [];
        const idx = st.deadMemes.indexOf(t);
        if (idx >= 0) st.deadMemes.splice(idx, 1);
        // rebuild the unit element
        this.spawnUnitAt(t, spot);
        st.units = st.units.filter((x, i) => x !== t || st.units.indexOf(x) === i); // dedupe safety
        if (!st.queue.includes(t)) st.queue.push(t);
        this.updateHpBar(t);
        SFX.play('fanfare');
        bigBanner('⛽ COPIUM REVIVAL!');
        this.log(`⛽ ${t.name} is BACK. The copium worked!`, true);
        this.renderTurnOrderBar();
        break;
      }
      case 'nuke': {
        Game.removeItem(id);
        SFX.play('zap');
        Shake.hit(14);
        bigBanner('💾 ANTIVIRUS DEPLOYED');
        for (const v of this.livingFoes()) {
          await this.dealRaw(v, it.power, '💾');
          if (st.over) return;
        }
        break;
      }
    }
    Game.save();
  },

  /* ============================================================
     END OF BATTLE
     ============================================================ */
  confirmFlee() {
    if (this.state.over) return;
    Modal.show({
      title: '🏃 Run away?',
      bodyHTML: '<p style="text-align:center">Live to meme another day?<br>No loot, no XP, and the viruses WILL talk trash.</p>',
      actions: [
        { label: '🏃 FLEE', cls: 'bad', fn: () => this.finish('fled') },
        { label: 'Keep fighting', cls: 'good' },
      ],
    });
  },

  async finish(result) {
    const st = this.state;
    if (st.over) return;
    st.over = true;
    st.active = null;

    const mission = st.mission;
    const survivors = this.livingMemes().filter(u => !u.isClone);

    // permadeath
    for (const u of st.deadMemes) {
      Game.killMeme(u.meme, `deleted by viruses in ${mission.name}`);
    }

    let coins = 0, itemDrop = null, xpEach = 0;
    if (result === true) {
      coins = U.randInt(mission.reward[0], mission.reward[1]) + st.loot.coins - st.loot.stolen;
      coins = Math.max(0, coins);
      if (U.chance(mission.itemChance)) itemDrop = U.pick(Object.keys(DATA.ITEMS));
      xpEach = 8 + mission.diff * 4;
      Game.state.missionsDone[mission.id] = (Game.state.missionsDone[mission.id] || 0) + 1;
      if (mission.endless) Game.state.cloudWave++;
      Game.state.stats.wins++;
      SFX.play('fanfare');
      bigBanner(U.pick(['🏆 VICTORY!', '🏆 GG EZ', '🏆 VIRUSES DELETED']));
    } else if (result === 'fled') {
      SFX.play('sadtrombone');
      bigBanner('🏃 NOPE.');
    } else {
      SFX.play('sadtrombone');
      bigBanner('💀 WASTED');
    }
    Game.state.stats.battles++;

    // grant loot & xp
    const lvlUps = [];
    if (result === true) {
      Game.addCoins(coins, null);
      if (itemDrop) Game.addItem(itemDrop);
      for (const u of survivors) {
        const ups = Genetics.grantXp(u.meme, xpEach);
        if (ups) lvlUps.push(u.meme.name);
      }
    }

    await U.wait(1400);

    // results modal
    const it = itemDrop ? DATA.ITEMS[itemDrop] : null;
    const deadList = st.deadMemes.map(u => u.meme.name);
    Modal.show({
      title: result === true ? '🏆 MISSION CLEAR!' : result === 'fled' ? '🏃 Tactical Retreat' : '💀 DEFEAT',
      bodyHTML: `<div style="text-align:center">
        ${result === true ? `
          <div class="result-loot">
            <span class="loot-chip">🪙 +${coins}</span>
            ${it ? `<span class="loot-chip">${it.ico} ${it.name}</span>` : ''}
            <span class="loot-chip">⭐ +${xpEach} XP each</span>
          </div>
          ${st.loot.stolen ? `<p style="font-size:12px;color:var(--red)">⛏️ miners stole ${st.loot.stolen}🪙 of that loot</p>` : ''}
          ${lvlUps.length ? `<p style="font-size:13px">🎉 LEVEL UP: <b>${lvlUps.map(U.esc).join(', ')}</b></p>` : ''}`
        : result === 'fled'
          ? '<p>You grabbed your memes and ran. The Wi-Fi router judged you silently.</p>'
          : '<p>The viruses have taken the field... your desktop mourns.</p>'}
        ${deadList.length ? `<p style="margin-top:8px;color:var(--red)"><b>💀 Fallen legends:</b> ${deadList.map(U.esc).join(', ')}<br>
          <span style="font-size:11px">(visit the Graveyard to necropost them)</span></p>` : ''}
        <p style="font-size:12px;opacity:.6;margin-top:8px">A day passes on the desktop...</p>
      </div>`,
      actions: [{
        label: '🏠 Back to Desktop', cls: 'good', fn: () => {
          document.getElementById('battle').classList.add('hidden');
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
