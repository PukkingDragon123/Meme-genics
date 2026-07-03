/* ============================================================
   MEME-GENICS — genetics.js
   Alleles, dominance, mutation, breeding, stats & aging
   ============================================================ */

const Genetics = {

  MUTATION_RATE: 0.08,       // per-gene chance the inherited allele mutates
  SPICE_MUTATION: 0.12,      // per-slot chance an ability gene mutates
  TRAIT_INHERIT: 0.45,       // chance each parent trait passes down
  TRAIT_MUTATION: 0.18,      // chance of a brand-new trait appearing
  MAX_TRAITS: 4,
  ADULT_AGE: 2,              // days for a baby to grow up
  MAX_LEVEL: 10,

  /* ---------------- allele helpers ---------------- */

  randomAllele(geneKey, allowRare = false) {
    const alleles = DATA.GENES[geneKey].alleles;
    const pool = Object.keys(alleles).filter(k => allowRare || !alleles[k].rare);
    return U.pick(pool);
  },

  dominant(geneKey, pair) {
    const alleles = DATA.GENES[geneKey].alleles;
    const [a, b] = pair;
    const da = alleles[a] ? alleles[a].dom : 0;
    const db = alleles[b] ? alleles[b].dom : 0;
    if (da === db) return U.pick([a, b]);
    return da > db ? a : b;
  },

  computePhenotype(genome) {
    const pheno = {};
    for (const g of Object.keys(DATA.GENES)) pheno[g] = this.dominant(g, genome[g]);
    return pheno;
  },

  /* ---------------- meme construction ---------------- */

  randomName() {
    let name = U.pick(DATA.NAME_FIRST);
    if (U.chance(0.65)) name += ' ' + U.pick(DATA.NAME_LAST);
    return name;
  },

  newMeme(opts = {}) {
    const genome = {};
    for (const g of Object.keys(DATA.GENES)) {
      genome[g] = opts.genome && opts.genome[g]
        ? opts.genome[g].slice()
        : [this.randomAllele(g, U.chance(0.06)), this.randomAllele(g, U.chance(0.06))];
    }
    const spice = opts.spice || [U.pick(DATA.LEARNABLE), U.chance(0.5) ? U.pick(DATA.LEARNABLE) : null];

    const meme = {
      id: U.uid('meme'),
      name: opts.name || this.randomName(),
      gen: opts.gen || 1,
      genome, spice,
      pheno: null,
      base: opts.base || {
        hp: U.randInt(24, 34), atk: U.randInt(5, 8), int: U.randInt(4, 8),
        spd: U.randInt(4, 8), lck: U.randInt(3, 10),
      },
      traits: opts.traits || (U.chance(0.7) ? [U.pick(DATA.MUTATION_TRAITS)] : []),
      level: 1, xp: 0,
      age: opts.age !== undefined ? opts.age : this.ADULT_AGE,
      lifespan: opts.lifespan || Math.max(16, Math.round(U.gauss(26, 4))),
      bornDay: opts.bornDay || 1,
      breedCd: 0,
      equip: { hat: null, held: null },
      hpCur: null,           // battle-only
      parents: opts.parents || null,
      lineage: opts.lineage || [],
      necroposted: false,
      pettedDay: 0,
      kills: 0, battles: 0,
    };
    meme.pheno = this.computePhenotype(genome);
    meme.hpMax = this.effStats(meme).hp;
    return meme;
  },

  starterDoge() {
    return this.newMeme({
      name: 'Doge Prime',
      genome: {
        body: ['round', 'bean'], hue: ['gold', 'gold'], pattern: ['plain', 'belly'],
        face: ['doge', 'doge'], eyes: ['normal', 'derp'], mouth: ['smile', 'tongue'], extra: ['none', 'blush'],
      },
      spice: ['yeet', null],
      base: { hp: 30, atk: 7, int: 5, spd: 6, lck: 7 },
      traits: ['dank'],
    });
  },

  starterFrog() {
    return this.newMeme({
      name: 'Sir Ribbit',
      genome: {
        body: ['blob', 'round'], hue: ['green', 'green'], pattern: ['belly', 'plain'],
        face: ['frog', 'frog'], eyes: ['sparkly', 'normal'], mouth: ['smile', 'open'], extra: ['none', 'none'],
      },
      spice: ['touchgrass', null],
      base: { hp: 28, atk: 5, int: 8, spd: 5, lck: 6 },
      traits: ['wholesome'],
    });
  },

  /* ---------------- breeding ---------------- */

  related(a, b) {
    if (a.parents && a.parents.includes(b.id)) return true;
    if (b.parents && b.parents.includes(a.id)) return true;
    const la = new Set([a.id, ...(a.lineage || [])]);
    const lb = new Set([b.id, ...(b.lineage || [])]);
    for (const x of la) if (lb.has(x)) return true;
    return false;
  },

  breed(mom, dad, day) {
    const genome = {};
    for (const g of Object.keys(DATA.GENES)) {
      let a = U.pick(mom.genome[g]);
      let b = U.pick(dad.genome[g]);
      if (U.chance(this.MUTATION_RATE)) a = this.randomAllele(g, true);
      if (U.chance(this.MUTATION_RATE)) b = this.randomAllele(g, true);
      genome[g] = [a, b];
    }

    // ability genes: one slot from each parent, may mutate
    const momSpice = U.pick(mom.spice.filter(Boolean).length ? mom.spice.filter(Boolean) : [null]);
    const dadSpice = U.pick(dad.spice.filter(Boolean).length ? dad.spice.filter(Boolean) : [null]);
    let spice = [momSpice, dadSpice];
    spice = spice.map(s => U.chance(this.SPICE_MUTATION) ? U.pick(DATA.LEARNABLE) : s);
    if (spice[0] && spice[0] === spice[1]) spice[1] = U.chance(0.5) ? U.pick(DATA.LEARNABLE) : null;

    // stats: blend + drift (slight upward pressure = generational progress)
    const base = {};
    for (const s of ['hp', 'atk', 'int', 'spd', 'lck']) {
      const blend = U.lerp(mom.base[s], dad.base[s], Math.random());
      base[s] = Math.max(1, Math.round(blend + U.gauss(0.5, 1.5)));
    }
    base.hp = Math.max(12, base.hp);

    // traits
    const pool = [...new Set([...mom.traits, ...dad.traits])].filter(t => t !== 'reposted' && t !== 'zombie');
    let traits = pool.filter(() => U.chance(this.TRAIT_INHERIT));
    if (U.chance(this.TRAIT_MUTATION)) traits.push(U.pick(DATA.MUTATION_TRAITS));
    traits = [...new Set(traits)];
    const inbred = this.related(mom, dad);
    if (inbred) traits.unshift('reposted');
    traits = traits.slice(0, this.MAX_TRAITS);

    const lineage = [...new Set([mom.id, dad.id, ...(mom.lineage || []), ...(dad.lineage || [])])].slice(0, 24);

    const baby = this.newMeme({
      genome, spice, base, traits,
      gen: Math.max(mom.gen, dad.gen) + 1,
      age: 0,
      bornDay: day,
      parents: [mom.id, dad.id],
      lineage,
      lifespan: Math.max(16, Math.round(U.gauss(26, 4))),
    });
    return { baby, inbred };
  },

  /* ---------------- effective stats ---------------- */

  effStats(meme) {
    const s = { ...meme.base, crit: 5, resist: 0, dodge: 0 };
    // traits
    const has = t => meme.traits.includes(t);
    if (has('gigachad')) s.atk += 3;
    if (has('bigbrain')) s.int += 3;
    if (has('zoomer')) s.spd += 2;
    if (has('lucky')) s.lck += 6;
    if (has('thicc')) { s.hp += 10; s.spd -= 1; }
    if (has('hoodclassic')) { s.hp += 1; s.atk += 1; s.int += 1; s.spd += 1; s.lck += 1; }
    if (has('boomer')) s.spd -= 2;
    if (has('smoothbrain')) s.int -= 3;
    if (has('reposted')) { s.hp -= 2; s.atk -= 2; s.int -= 2; s.spd -= 2; s.lck -= 2; }
    if (has('immortalsnail')) s.spd -= 2;
    if (has('dank')) s.crit += 15;
    if (has('sigma')) s.resist += 35;
    if (has('blessed')) s.dodge += 12;
    if (has('zombie')) s.hp = Math.round(s.hp * 0.8);
    // equipment
    for (const slot of ['hat', 'held']) {
      const it = meme.equip[slot] && DATA.ITEMS[meme.equip[slot]];
      if (it && it.stats) for (const k of Object.keys(it.stats)) s[k] = (s[k] || 0) + it.stats[k];
    }
    // floors
    for (const k of ['atk', 'int', 'spd', 'lck']) s[k] = Math.max(1, s[k]);
    s.hp = Math.max(5, s.hp);
    s.crit = U.clamp(s.crit + s.lck * 0.8, 0, 80);
    if (has('npc')) s.crit = 0;
    s.resist = U.clamp(s.resist, 0, 85);
    return s;
  },

  effLifespan(meme) {
    let l = meme.lifespan;
    if (meme.traits.includes('immortalsnail')) l += 10;
    return l + (meme.lifespanBonus || 0);
  },

  moveRange(meme) {
    const s = this.effStats(meme);
    return U.clamp(3 + Math.floor(s.spd / 4), 2, 6);
  },

  abilities(meme) {
    const list = ['bonk'];
    const sig = DATA.GENES.face.alleles[meme.pheno.face].ability;
    if (sig) list.push(sig);
    for (const sp of meme.spice) if (sp && !list.includes(sp)) list.push(sp);
    return list.slice(0, 4);
  },

  stage(meme) {
    if (meme.age < this.ADULT_AGE) return 'baby';
    if (meme.age >= this.effLifespan(meme) - 5) return 'elder';
    return 'adult';
  },

  /* ---------------- xp / levels ---------------- */

  xpToLevel(level) { return Math.round(18 * Math.pow(level, 1.4)); },

  grantXp(meme, amount) {
    if (meme.traits.includes('maincharacter')) amount = Math.round(amount * 1.3);
    meme.xp += amount;
    let ups = 0;
    while (meme.level < this.MAX_LEVEL && meme.xp >= this.xpToLevel(meme.level)) {
      meme.xp -= this.xpToLevel(meme.level);
      meme.level++;
      ups++;
      meme.base.hp += 3;
      const stat = U.pickWeighted([
        { v: 'atk', w: meme.base.atk }, { v: 'int', w: meme.base.int },
        { v: 'spd', w: meme.base.spd * 0.6 }, { v: 'lck', w: meme.base.lck * 0.6 },
      ]);
      meme.base[stat] += 1;
    }
    meme.hpMax = this.effStats(meme).hp;
    return ups;
  },

  /* ---------------- descriptions ---------------- */

  describe(meme) {
    const p = meme.pheno;
    const g = DATA.GENES;
    return `${g.hue.alleles[p.hue].label} · ${g.body.alleles[p.body].label} · ${g.face.alleles[p.face].label}`;
  },
};
