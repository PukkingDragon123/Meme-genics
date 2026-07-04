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
    const meme = {
      id: U.uid('meme'),
      name: opts.name || this.randomName(),
      gen: opts.gen || 1,
      genome,
      pheno: null,
      base: opts.base || {
        hp: U.randInt(24, 34), atk: U.randInt(5, 8), int: U.randInt(4, 8),
        spd: U.randInt(4, 8), lck: U.randInt(3, 10),
      },
      traits: opts.traits || (U.chance(0.7) ? [U.pick(DATA.MUTATION_TRAITS)] : []),
      level: 1, xp: 0,
      matured: opts.matured !== undefined ? opts.matured : true,  // babies grow up after a fight / over time
      bornTime: Date.now(),
      pets: 0,
      equip: { hat: null, held: null },
      parents: opts.parents || null,
      lineage: opts.lineage || [],
      necroposted: false,
      retired: false,        // survives a fight, then only breeds
      kills: 0, battles: 0,
    };
    meme.pheno = this.computePhenotype(genome);
    // ability kit: this type's signature + a random extra (or inherited set)
    if (opts.learned) {
      meme.learned = [...new Set(opts.learned)].slice(0, this.MAX_ABILITIES);
    } else {
      const kit = new Set();
      const sig = DATA.GENES.face.alleles[meme.pheno.face].ability;
      if (sig) kit.add(sig);
      while (kit.size < 2) kit.add(U.pick(DATA.LEARNABLE));
      meme.learned = [...kit];
    }
    meme.hpMax = this.effStats(meme).hp;
    return meme;
  },

  MAX_ABILITIES: 6,
  learnAbility(meme) {
    const pool = DATA.LEARNABLE.filter(a => !meme.learned.includes(a));
    if (!pool.length || meme.learned.length >= this.MAX_ABILITIES) return null;
    const id = U.pick(pool);
    meme.learned.push(id);
    return id;
  },

  starterDoge() {
    return this.newMeme({
      name: 'Doge Prime',
      genome: {
        body: ['round', 'bean'], hue: ['gold', 'gold'], pattern: ['plain', 'belly'],
        face: ['doge', 'doge'], eyes: ['normal', 'derp'], mouth: ['smile', 'tongue'], extra: ['none', 'blush'],
      },
      learned: ['yeet', 'fireball'],
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
      learned: ['touchgrass', 'icespike'],
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

    // abilities: inherit a couple from the parents' pools, may mutate a fresh one
    const parentPool = [...new Set([...(mom.learned || []), ...(dad.learned || [])])];
    const learned = new Set();
    for (const a of U.shuffle(parentPool)) { if (learned.size >= 2) break; learned.add(a); }
    if (U.chance(this.SPICE_MUTATION) || learned.size === 0) learned.add(U.pick(DATA.LEARNABLE));

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
      genome, learned: [...learned], base, traits,
      gen: Math.max(mom.gen, dad.gen) + 1,
      matured: false,
      parents: [mom.id, dad.id],
      lineage,
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

  abilities(meme) {
    const list = ['bonk'];
    for (const a of (meme.learned || [])) if (a !== 'bonk' && DATA.ABILITIES[a] && !list.includes(a)) list.push(a);
    return list;
  },

  // combat identity from the face gene
  special(meme) {
    const a = DATA.GENES.face.alleles[meme.pheno.face];
    return (a && a.special) || { name: 'Focus', kind: 'nuke', cd: 3, mag: false };
  },
  role(meme) {
    const a = DATA.GENES.face.alleles[meme.pheno.face];
    return (a && a.role) || 'striker';
  },

  // the mobile-style power rating
  power(meme) {
    return DATA.power(this.effStats(meme), meme.level);
  },

  // babies mature after a fight, a few pets, or ~20s of roaming — no aging/death by time
  MATURE_MS: 20000,
  stage(meme) {
    if (meme.matured) return 'adult';
    if (meme.pets >= 3 || (Date.now() - (meme.bornTime || 0)) > this.MATURE_MS) meme.matured = true;
    return meme.matured ? 'adult' : 'baby';
  },

  /* ---------------- xp / levels ---------------- */

  xpToLevel(level) { return Math.round(18 * Math.pow(level, 1.4)); },

  // grantXp returns { ups, learned: [ids] } — a new ability may be learned each level
  grantXp(meme, amount) {
    if (meme.traits.includes('maincharacter')) amount = Math.round(amount * 1.3);
    meme.xp += amount;
    let ups = 0;
    const learned = [];
    if (!meme.learned) meme.learned = [];
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
      // learn a new ability roughly every other level
      if (meme.level % 2 === 0 || ups === 1) {
        const id = this.learnAbility(meme);
        if (id) learned.push(id);
      }
    }
    meme.hpMax = this.effStats(meme).hp;
    meme._lastUps = ups;
    meme._lastLearned = learned;
    return ups;
  },

  /* ---------------- descriptions ---------------- */

  describe(meme) {
    const p = meme.pheno;
    const g = DATA.GENES;
    return `${g.hue.alleles[p.hue].label} · ${g.body.alleles[p.body].label} · ${g.face.alleles[p.face].label}`;
  },
};
