/* ============================================================
   MEME-GENICS — data.js
   Static content: genes, traits, specials, items, viruses,
   the stage roadmap, unlocks, names & flavor.
   Icons are NAMES into the pixel atlas (pixel.js / sprites.js).
   No emoji.
   ============================================================ */

const DATA = {};

/* ============================================================
   GENES — higher `dom` wins the phenotype.
   The `face` gene decides a meme's TYPE, its combat ROLE and
   its SPECIAL move. `full:true` faces draw a whole custom body.
   ============================================================ */
DATA.GENES = {
  body: {
    label: 'Body',
    alleles: {
      round:  { dom: 6, label: 'Round Boi' },
      blob:   { dom: 5, label: 'Blob' },
      bean:   { dom: 4, label: 'Bean' },
      square: { dom: 3, label: 'Square' },
      tall:   { dom: 2, label: 'Longboi' },
      star:   { dom: 1, label: 'Star Child', rare: true },
    }
  },
  hue: {
    label: 'Color',
    alleles: {
      gold:      { dom: 7, label: 'Doge Gold',   c1: '#f2cf74', c2: '#d99a3c' },
      green:     { dom: 6, label: 'Frog Green',  c1: '#8fd47a', c2: '#4a9a55' },
      pink:      { dom: 5, label: 'Blushmallow', c1: '#f2a6cf', c2: '#e070ac' },
      cyan:      { dom: 4, label: 'Ice Cold',    c1: '#a6e0ee', c2: '#4ab6d4' },
      purple:    { dom: 3, label: 'Grimace',     c1: '#c9a6e0', c2: '#9a6cc0' },
      orange:    { dom: 2, label: 'Cheeto Dust', c1: '#f0c088', c2: '#e0902f' },
      gray:      { dom: 2, label: 'Concrete',    c1: '#cdd4d6', c2: '#93a0a4' },
      rainbow:   { dom: 1, label: 'RAINBOW', rare: true, c1: '#e070ac', c2: '#4ab6d4' },
      deepfried: { dom: 1, label: 'Deep-Fried', rare: true, c1: '#e06a3d', c2: '#a83a2a' },
    }
  },
  pattern: {
    label: 'Pattern',
    alleles: {
      plain:   { dom: 5, label: 'Plain' },
      spots:   { dom: 4, label: 'Spotted' },
      stripes: { dom: 3, label: 'Stripey' },
      belly:   { dom: 2, label: 'Belly Patch' },
      sparkle: { dom: 1, label: 'Sparkly', rare: true },
    }
  },
  face: {
    label: 'Type',
    alleles: {
      doge:   { dom: 6, label: 'Doge',   ability: 'yeet',       role: 'bruiser',  special: { name: 'YEET',        kind: 'nuke',   cd: 3, mag: false } },
      frog:   { dom: 6, label: 'Frog',   ability: 'touchgrass', role: 'support',  special: { name: 'Touch Grass', kind: 'heal',   cd: 3, mag: true } },
      catto:  { dom: 5, label: 'Catto',  ability: 'zoomies',    role: 'striker',  special: { name: 'Zoomies',     kind: 'multi',  cd: 3, mag: false } },
      troll:  { dom: 4, label: 'Troll',  ability: 'rickroll',   role: 'control',  special: { name: 'Rickroll',    kind: 'debuff', cd: 3, mag: true } },
      stonks: { dom: 4, label: 'Stonks Guy', ability: 'stonks', role: 'support',  special: { name: 'STONKS',      kind: 'buff',   cd: 3, mag: true } },
      chad:   { dom: 3, label: 'Chad',   ability: 'banhammer',  role: 'tank',     special: { name: 'Ban Hammer',  kind: 'nuke',   cd: 3, mag: false } },
      nyan:   { dom: 3, label: 'Nyan',   ability: 'nyandash',   role: 'mage', full: true,  special: { name: 'Rainbow Road', kind: 'aoe', cd: 3, mag: true } },
      tung:   { dom: 3, label: 'Tung Tung Sahur', ability: 'banhammer', role: 'bruiser', full: true, special: { name: 'Sahur Combo', kind: 'multi', cd: 3, mag: false } },
      shark:  { dom: 2, label: 'Tralalero Shark', ability: 'zoomies', role: 'striker', full: true, special: { name: 'Shark Rush', kind: 'multi', cd: 3, mag: false } },
      capp:   { dom: 2, label: 'Cappuccino', ability: 'lastlaugh', role: 'assassin', full: true, special: { name: 'Assassino',  kind: 'nuke',   cd: 3, mag: false } },
      croco:  { dom: 2, label: 'Bombardiro', ability: 'deepfry', role: 'bomber', full: true, special: { name: 'Bombardiro', kind: 'aoe',    cd: 3, mag: true } },
      ghost:  { dom: 1, label: 'Spooky', rare: true, ability: 'unoreverse', role: 'trickster', special: { name: 'UNO Reverse', kind: 'shield', cd: 3, mag: true } },
    }
  },
  eyes: {
    label: 'Eyes',
    alleles: {
      normal:  { dom: 6, label: 'Normal' },
      derp:    { dom: 5, label: 'Derp' },
      angry:   { dom: 4, label: 'Angery' },
      tired:   { dom: 3, label: '3 AM' },
      sparkly: { dom: 2, label: 'UwU' },
      mlg:     { dom: 1, label: 'Shades', rare: true },
      laser:   { dom: 1, label: 'LASER', rare: true },
    }
  },
  mouth: {
    label: 'Mouth',
    alleles: {
      smile:  { dom: 6, label: 'Smile' },
      open:   { dom: 5, label: 'Gasp' },
      tongue: { dom: 4, label: 'Blep' },
      smug:   { dom: 3, label: 'Smug' },
      flat:   { dom: 2, label: 'Bruh' },
      fangs:  { dom: 1, label: 'Fangs', rare: true },
    }
  },
  extra: {
    label: 'Extra',
    alleles: {
      none:      { dom: 6, label: 'None' },
      blush:     { dom: 5, label: 'Blush' },
      eyebrows:  { dom: 4, label: 'Da Eyebrows' },
      tears:     { dom: 3, label: 'Tears of Joy' },
      mustache:  { dom: 2, label: 'Mustachio' },
      halo:      { dom: 1, label: 'Halo', rare: true },
      horns:     { dom: 1, label: 'Lil Horns', rare: true },
    }
  },
};

// which faces draw a full custom sprite
DATA.FULL_FACES = Object.keys(DATA.GENES.face.alleles).filter(k => DATA.GENES.face.alleles[k].full);

/* ============================================================
   TRAITS — heritable passives.
   ============================================================ */
DATA.TRAITS = {
  dank:       { name: 'Dank',            ico: 'fire',      kind: 'good', desc: '+15% crit chance. Certified.' },
  wholesome:  { name: 'Wholesome',       ico: 'heart',     kind: 'good', desc: 'Heals a little each round of battle.' },
  viral:      { name: 'Viral',           ico: 'virus',     kind: 'good', desc: 'Deals bonus splash damage on a kill.' },
  gigachad:   { name: 'Gigachad',        ico: 'fist',      kind: 'good', desc: '+3 BONK (attack).' },
  bigbrain:   { name: 'Big Brain',       ico: 'brain',     kind: 'good', desc: '+3 BRAIN (ability power).' },
  zoomer:     { name: 'Zoomer',          ico: 'bolt',      kind: 'good', desc: '+2 ZOOM (speed).' },
  lucky:      { name: 'Lucky',           ico: 'clover',    kind: 'good', desc: '+6 LUCK.' },
  thicc:      { name: 'Thicc',           ico: 'weight',    kind: 'good', desc: '+10 max HP, but -1 ZOOM.' },
  hoodclassic:{ name: 'Hood Classic',    ico: 'tape',      kind: 'good', desc: 'Certified. +1 to ALL stats.' },
  maincharacter:{ name: 'Main Character',ico: 'star',      kind: 'good', desc: '+30% XP earned.' },
  sigma:      { name: 'Sigma',           ico: 'sigma',     kind: 'good', desc: '35% chance to shrug off debuffs.' },
  blessed:    { name: 'Blessed',         ico: 'halo',      kind: 'good', desc: '12% chance to fully dodge a hit.' },
  immortalsnail:{ name: 'Immortal Snail',ico: 'snail',     kind: 'good', desc: '-2 ZOOM, but lives 10 days longer.' },
  stale:      { name: 'Stale',           ico: 'bread',     kind: 'bad',  desc: 'Deals 10% less damage. Needs reheating.' },
  cringe:     { name: 'Cringe',          ico: 'gritface',  kind: 'bad',  desc: 'Allies deal slightly less damage nearby.' },
  ratiod:     { name: "Ratio'd",         ico: 'chartdown', kind: 'bad',  desc: 'Takes 12% more damage.' },
  boomer:     { name: 'Boomer',          ico: 'hourglass', kind: 'bad',  desc: "-2 ZOOM. Doesn't get it." },
  smoothbrain:{ name: 'Smooth Brain',    ico: 'egg',       kind: 'bad',  desc: '-3 BRAIN.' },
  npc:        { name: 'NPC',             ico: 'npcface',   kind: 'bad',  desc: 'Cannot crit. Ever.' },
  doomer:     { name: 'Doomer',          ico: 'raincloud', kind: 'bad',  desc: 'Healing received is halved.' },
  clickbait:  { name: 'Clickbait',       ico: 'cursor',    kind: 'weird',desc: 'Viruses love to target this meme.' },
  cursed:     { name: 'Cursed',          ico: 'eye',       kind: 'weird',desc: 'Tiny chance to fumble its own attack.' },
  reposted:   { name: 'Reposted',        ico: 'recycle',   kind: 'bad',  desc: '-2 to ALL stats. Bred from related memes...' },
  zombie:     { name: 'Necroposted',     ico: 'skull',     kind: 'weird',desc: 'Back from the archive. -20% max HP, immune to poison & burn.' },
};

DATA.GOOD_TRAITS = Object.keys(DATA.TRAITS).filter(k => DATA.TRAITS[k].kind === 'good' && !['immortalsnail'].includes(k));
DATA.BAD_TRAITS = Object.keys(DATA.TRAITS).filter(k => DATA.TRAITS[k].kind === 'bad' && k !== 'reposted');
DATA.MUTATION_TRAITS = [...DATA.GOOD_TRAITS, 'immortalsnail', 'clickbait', 'cursed', ...DATA.BAD_TRAITS];

/* ============================================================
   ABILITIES — 40 moves. Each has a unique icon + VFX + color.
   Memes learn them on level up. Combat drives them with QTEs.
   kind: strike|magic|nuke|aoe|multi|dot|heal|buff|debuff|shield|execute|lifesteal
   qte:  timing|mash|none   mag: scales off BRAIN instead of BONK
   ============================================================ */
DATA.ABILITIES = {
  bonk:        { name: 'Basic Strike', ico: 'hammer',     kind: 'strike',   mag: 0, power: 1.0, cd: 0, qte: 'timing', vfx: 'slash',      color: '#f2f4f4', desc: 'A timed strike. Nail the timing for a crit.' },
  yeet:        { name: 'YEET',         ico: 'throw',      kind: 'nuke',     mag: 0, power: 2.2, cd: 3, qte: 'timing', vfx: 'punch',      color: '#d9b45f', desc: 'A huge single hit that launches the target.' },
  deepfry:     { name: 'Deep Fry',     ico: 'fries',      kind: 'dot',      mag: 1, power: 1.2, cd: 3, qte: 'timing', vfx: 'fire',       color: '#d98a3a', desc: 'BRAIN damage and sets the target on fire.' },
  rickroll:    { name: 'Rickroll',     ico: 'note',       kind: 'debuff',   mag: 1, power: 0,   cd: 3, qte: 'none',   vfx: 'music',      color: '#8676a4', desc: 'Weakens every enemy. Never gonna give you up.' },
  touchgrass:  { name: 'Touch Grass',  ico: 'sprout',     kind: 'heal',     mag: 1, power: 1.6, cd: 3, qte: 'timing', vfx: 'heal',       color: '#57b18d', desc: 'Heals the team. Go outside for a sec.' },
  stonks:      { name: 'STONKS',       ico: 'chartup',    kind: 'buff',     mag: 1, power: 0,   cd: 3, qte: 'none',   vfx: 'buff',       color: '#57b18d', desc: 'Line goes up — the whole team hits harder.' },
  unoreverse:  { name: 'UNO Reverse',  ico: 'loop',       kind: 'shield',   mag: 1, power: 0,   cd: 3, qte: 'none',   vfx: 'dome',       color: '#4a9fd4', desc: 'Shields the team against the next hits.' },
  zoomies:     { name: 'Zoomies',      ico: 'wind',       kind: 'multi',    mag: 0, power: 0.7, cd: 3, qte: 'mash',   vfx: 'dash',       color: '#d9b45f', desc: 'A rapid multi-hit flurry (mash!).' },
  banhammer:   { name: 'Ban Hammer',   ico: 'hammer2',    kind: 'nuke',     mag: 0, power: 2.4, cd: 4, qte: 'timing', vfx: 'meteor',     color: '#e0655e', desc: 'Massive single hit. Straight to jail.' },
  airhorn:     { name: 'MLG Airhorn',  ico: 'horn',       kind: 'aoe',      mag: 1, power: 0.9, cd: 3, qte: 'timing', vfx: 'beam',       color: '#d9b45f', desc: 'A blaring blast across the enemy line.' },
  nyandash:    { name: 'Rainbow Road', ico: 'rainbow',    kind: 'aoe',      mag: 1, power: 1.1, cd: 3, qte: 'timing', vfx: 'rainbow',    color: '#e070ac', desc: 'Rainbow damage to the whole enemy team.' },
  lastlaugh:   { name: 'Last Laugh',   ico: 'trophy',     kind: 'execute',  mag: 0, power: 1.2, cd: 3, qte: 'timing', vfx: 'slash',      color: '#d9b45f', desc: 'Finisher — double damage vs low-HP foes.' },
  fireball:    { name: 'Fireball',     ico: 'fireball',   kind: 'magic',    mag: 1, power: 1.5, cd: 2, qte: 'timing', vfx: 'fireball',   color: '#e0655e', desc: 'Hurl a flaming orb at one enemy.' },
  icespike:    { name: 'Ice Spike',    ico: 'iceshard',   kind: 'dot',      mag: 1, power: 1.4, cd: 2, qte: 'timing', vfx: 'ice',        color: '#4a9fd4', desc: 'Pierces and slows a single enemy.' },
  thunderclap: { name: 'Thunderclap',  ico: 'bolt2',      kind: 'magic',    mag: 1, power: 1.7, cd: 3, qte: 'timing', vfx: 'lightning',  color: '#d9b45f', desc: 'A bolt of lightning strikes one foe.' },
  meteorstrike:{ name: 'Meteor',       ico: 'meteor',     kind: 'nuke',     mag: 1, power: 2.6, cd: 4, qte: 'timing', vfx: 'meteor',     color: '#e0655e', desc: 'Call down a devastating meteor.' },
  shadowstab:  { name: 'Shadow Stab',  ico: 'dagger',     kind: 'strike',   mag: 0, power: 1.5, cd: 2, qte: 'timing', vfx: 'slash',      color: '#8676a4', desc: 'A fast strike from the shadows.' },
  crossslash:  { name: 'Cross Slash',  ico: 'crossblade', kind: 'multi',    mag: 0, power: 0.9, cd: 3, qte: 'mash',   vfx: 'multislash', color: '#f2f4f4', desc: 'A flurry of blade strikes (mash!).' },
  quakestomp:  { name: 'Quake Stomp',  ico: 'boot2',      kind: 'aoe',      mag: 0, power: 1.0, cd: 3, qte: 'timing', vfx: 'shock',      color: '#d98a3a', desc: 'Shakes the ground — hits all foes.' },
  venombite:   { name: 'Venom Bite',   ico: 'fang',       kind: 'dot',      mag: 0, power: 1.1, cd: 2, qte: 'timing', vfx: 'poison',     color: '#57b18d', desc: 'A poisonous chomp.' },
  laserbeam:   { name: 'Laser Beam',   ico: 'laser2',     kind: 'aoe',      mag: 1, power: 1.2, cd: 3, qte: 'timing', vfx: 'beam',       color: '#e0655e', desc: 'A searing beam across the enemy line.' },
  holylight:   { name: 'Holy Light',   ico: 'halo2',      kind: 'heal',     mag: 1, power: 2.0, cd: 4, qte: 'timing', vfx: 'holy',       color: '#d9b45f', desc: 'A radiant, powerful team heal.' },
  warcry:      { name: 'War Cry',      ico: 'shout',      kind: 'buff',     mag: 0, power: 0,   cd: 3, qte: 'none',   vfx: 'buff',       color: '#e0655e', desc: 'Rally the team to hit harder.' },
  hex:         { name: 'Hex',          ico: 'skullmagic', kind: 'debuff',   mag: 1, power: 0.4, cd: 3, qte: 'none',   vfx: 'curse',      color: '#8676a4', desc: 'Curse all foes to deal less damage.' },
  barrier:     { name: 'Barrier',      ico: 'shield2',    kind: 'shield',   mag: 1, power: 0,   cd: 3, qte: 'none',   vfx: 'dome',       color: '#4a9fd4', desc: 'Raise a protective barrier for the team.' },
  drainkiss:   { name: 'Drain Kiss',   ico: 'lips',       kind: 'lifesteal',mag: 1, power: 1.2, cd: 3, qte: 'timing', vfx: 'drain',      color: '#e070ac', desc: 'Steal HP from an enemy.' },
  comboflurry: { name: 'Combo Flurry', ico: 'fist2',      kind: 'multi',    mag: 0, power: 0.8, cd: 3, qte: 'mash',   vfx: 'punch',      color: '#d9b45f', desc: 'Rapid punches (mash for more!).' },
  groundpound: { name: 'Ground Pound', ico: 'quake',      kind: 'aoe',      mag: 0, power: 1.1, cd: 3, qte: 'timing', vfx: 'shock',      color: '#d98a3a', desc: 'Slam the earth for team-wide damage.' },
  snipeshot:   { name: 'Snipe Shot',   ico: 'scope',      kind: 'nuke',     mag: 0, power: 2.2, cd: 3, qte: 'timing', vfx: 'bullet',     color: '#4a9fd4', desc: 'A precise, heavy long-range shot.' },
  blizzard:    { name: 'Blizzard',     ico: 'snowflake',  kind: 'aoe',      mag: 1, power: 1.1, cd: 4, qte: 'timing', vfx: 'ice',        color: '#4a9fd4', desc: 'A freezing storm hits all foes.' },
  inferno:     { name: 'Inferno',      ico: 'flames',     kind: 'aoe',      mag: 1, power: 1.2, cd: 4, qte: 'timing', vfx: 'fire',       color: '#e0655e', desc: 'Engulf the enemy line in flames.' },
  poisoncloud: { name: 'Poison Cloud', ico: 'cloud2',     kind: 'aoe',      mag: 1, power: 0.9, cd: 3, qte: 'timing', vfx: 'poison',     color: '#57b18d', desc: 'A toxic cloud damages all foes.' },
  megapunch:   { name: 'Mega Punch',   ico: 'megafist',   kind: 'nuke',     mag: 0, power: 2.4, cd: 4, qte: 'timing', vfx: 'punch',      color: '#e0655e', desc: 'One colossal, screen-shaking punch.' },
  healwave:    { name: 'Heal Wave',    ico: 'plus2',      kind: 'heal',     mag: 1, power: 1.4, cd: 3, qte: 'timing', vfx: 'heal',       color: '#57b18d', desc: 'A rolling wave of healing.' },
  rally:       { name: 'Rally',        ico: 'flag',       kind: 'buff',     mag: 0, power: 0,   cd: 3, qte: 'none',   vfx: 'buff',       color: '#d9b45f', desc: 'Plant the flag — team power up.' },
  curse:       { name: 'Evil Eye',     ico: 'eye',        kind: 'debuff',   mag: 1, power: 0.5, cd: 3, qte: 'none',   vfx: 'curse',      color: '#8676a4', desc: 'A withering glare weakens all foes.' },
  ironwall:    { name: 'Iron Wall',    ico: 'wall',       kind: 'shield',   mag: 1, power: 0,   cd: 4, qte: 'none',   vfx: 'dome',       color: '#8a939a', desc: 'A heavy shield for the whole team.' },
  vampstrike:  { name: 'Vamp Strike',  ico: 'vampfang',   kind: 'lifesteal',mag: 0, power: 1.3, cd: 3, qte: 'timing', vfx: 'drain',      color: '#e0655e', desc: 'Bite an enemy and drink its HP.' },
  starfall:    { name: 'Starfall',     ico: 'star2',      kind: 'aoe',      mag: 1, power: 1.2, cd: 4, qte: 'timing', vfx: 'starshower', color: '#d9b45f', desc: 'Rain stars on the whole enemy team.' },
  finalflash:  { name: 'Final Flash',  ico: 'burst',      kind: 'nuke',     mag: 1, power: 3.0, cd: 5, qte: 'timing', vfx: 'beam',       color: '#d9b45f', desc: 'An enormous beam of pure BRAIN.' },
};

// everything except the always-known Basic Strike is learnable / heritable
DATA.LEARNABLE = Object.keys(DATA.ABILITIES).filter(k => k !== 'bonk');

/* ============================================================
   STATUS EFFECTS (used lightly by specials)
   ============================================================ */
DATA.STATUS = {
  burn:    { name: 'Deep-Fried', ico: 'fire',      bad: true,  desc: 'Takes damage each round.' },
  atkUp:   { name: 'STONKS',     ico: 'arrowup',   bad: false, desc: '+35% damage dealt.' },
  atkDown: { name: 'Not Stonks', ico: 'arrowdown', bad: true,  desc: '-35% damage dealt.' },
  shield:  { name: 'Shielded',   ico: 'shield',    bad: false, desc: 'Absorbs incoming damage.' },
  slow:    { name: 'Lagging',    ico: 'snail',     bad: true,  desc: 'Acts later in the round.' },
};

/* ============================================================
   ITEMS
   ============================================================ */
DATA.ITEMS = {
  tophat:    { name: 'Like a Sir',      ico: 'tophat',    kind: 'hat', price: 40, stats: { int: 2 },           desc: '+2 BRAIN. Tips fedora.' },
  mlgcap:    { name: 'Snapback',        ico: 'cap',       kind: 'hat', price: 45, stats: { crit: 10 },          desc: '+10% crit chance.' },
  crown:     { name: 'Crown of Sheesh', ico: 'crown',     kind: 'hat', price: 120, stats: { hp: 4, atk: 1, int: 1, spd: 1, lck: 1 }, desc: '+1 to everything, +4 HP.' },
  propeller: { name: 'Propeller Cap',   ico: 'propeller', kind: 'hat', price: 45, stats: { spd: 2 },            desc: '+2 ZOOM.' },
  tinfoil:   { name: 'Tinfoil Hat',     ico: 'tinfoil',   kind: 'hat', price: 50, stats: { resist: 30 },        desc: '30% chance to resist debuffs.' },
  partyhat:  { name: 'Party Hat',       ico: 'partyhat',  kind: 'hat', price: 40, stats: { lck: 5 },            desc: '+5 LUCK.' },
  banhammeritem: { name: 'Spare Ban Hammer', ico: 'hammer', kind: 'held', price: 60, stats: { atk: 3 },      desc: '+3 BONK.' },
  keyboard:  { name: 'Mech Keyboard',   ico: 'keyboard',  kind: 'held', price: 55, stats: { atk: 2, int: 1 }, desc: '+2 BONK, +1 BRAIN. Clacky.' },
  dogecoin:  { name: 'Doge Coin',       ico: 'coin',      kind: 'held', price: 50, stats: { lck: 6 },           desc: '+6 LUCK. Much fortune.' },
  gpu:       { name: 'Hot GPU',         ico: 'gpu',       kind: 'held', price: 65, stats: { int: 3 },           desc: '+3 BRAIN.' },
  gamermouse:{ name: 'Gamer Mouse',     ico: 'mouse',     kind: 'held', price: 55, stats: { spd: 2, crit: 5 },  desc: '+2 ZOOM, +5% crit.' },
  popblocker:{ name: 'Pop-up Blocker',  ico: 'shield',    kind: 'held', price: 60, stats: { hp: 10 },           desc: '+10 max HP.' },
  pizza:     { name: 'Pizza Slice',     ico: 'pizza',      kind: 'consumable', price: 15, battle: 'heal', power: 18, desc: 'BATTLE: heal a meme for 18 HP.' },
  energy:    { name: 'G-Fuel Barrel',   ico: 'energycan',  kind: 'consumable', price: 20, battle: 'energy', desc: 'BATTLE: clears a meme\'s ability cooldowns.' },
  copium:    { name: 'Tank of Copium',  ico: 'copiumtank', kind: 'consumable', price: 80, battle: 'revive', desc: 'BATTLE: revive a fallen meme at 50% HP.' },
  usbstick:  { name: 'Antivirus USB',   ico: 'usb',        kind: 'consumable', price: 70, battle: 'nuke', power: 12, desc: 'BATTLE: deals 12 damage to EVERY virus.' },
  preservative:{ name: 'Brain Juice',   ico: 'flask',      kind: 'consumable', price: 60, home: 'xp', power: 45, desc: 'HOME: feeds a meme a big chunk of XP.' },
  miraclegro:{ name: 'Miracle-Gro',     ico: 'flower',     kind: 'consumable', price: 35, home: 'grow', desc: 'HOME: instantly grows a baby into an adult.' },
  dankserum: { name: 'Serum of Dank',   ico: 'syringe',    kind: 'consumable', price: 100, home: 'trait', desc: 'HOME: injects a random GOOD trait.' },
  febreze:   { name: 'Meme Febreze',    ico: 'spray',      kind: 'consumable', price: 90, home: 'cleanse', desc: 'HOME: removes a random BAD trait.' },
};

/* ============================================================
   VIRUSES (enemies) — `art` is the pixel sprite key.
   ============================================================ */
DATA.VIRUSES = {
  popup:   { name: 'Pop-Up Ad', hp: 14, atk: 4, spd: 4, xp: 4, bounty: 3, flavor: 'You are the 1,000,000th victim.' },
  worm:    { name: 'Worm.exe', hp: 18, atk: 5, spd: 7, xp: 6, bounty: 5, flavor: 'Wriggles through your files leaving malware.' },
  trojan:  { name: 'Trojan Pony', hp: 44, atk: 8, spd: 3, xp: 12, bounty: 10, tanky: true, flavor: 'It said it was a free game.' },
  blob:    { name: 'Bloatware Blob', hp: 38, atk: 6, spd: 2, xp: 10, bounty: 8, flavor: 'Ships pre-installed. Cannot be uninstalled.' },
  miniblob:{ name: 'Blob Jr.', hp: 12, atk: 4, spd: 4, xp: 3, bounty: 2, flavor: 'A smaller, angrier agreement.' },
  spyder:  { name: 'Keylogger Spyder', hp: 22, atk: 7, spd: 6, xp: 9, bounty: 8, flavor: 'It knows what you typed.' },
  ransom:  { name: 'Ransom-Where', hp: 34, atk: 8, spd: 5, xp: 12, bounty: 12, flavor: 'Your files are encrypted!' },
  phish:   { name: 'Phish', hp: 24, atk: 7, spd: 5, xp: 10, bounty: 9, flavor: 'You have won a hook to the face.' },
  drone:   { name: 'Botnet Drone', hp: 16, atk: 6, spd: 8, xp: 5, bounty: 4, flavor: 'One of ten thousand. All named Kevin.' },
  adware:  { name: 'Adware Broadcaster', hp: 28, atk: 5, spd: 4, xp: 14, bounty: 12, flavor: 'HOT SINGLES IN YOUR AREA.' },
  miner:   { name: 'Crypto Miner', hp: 30, atk: 4, spd: 3, xp: 12, bounty: 20, flavor: 'Steals coins. Eats your frame rate.' },
  captcha: { name: 'CAPTCHA Golem', hp: 90, atk: 10, spd: 4, xp: 40, bounty: 45, boss: true, flavor: 'SELECT ALL SQUARES CONTAINING YOUR DOOM.' },
  bsod:    { name: 'B.S.O.D.', hp: 120, atk: 12, spd: 5, xp: 60, bounty: 70, boss: true, flavor: 'Your PC ran into a problem: this guy.' },
  spamking:{ name: 'THE SPAM KING', hp: 160, atk: 14, spd: 6, xp: 100, bounty: 120, boss: true, flavor: 'The final boss of your inbox.' },
};

/* ============================================================
   STAGE ROADMAP — Candy-Crush style path of nodes.
   ============================================================ */
DATA.STAGES = [
  { region: 'Downloads',     name: 'The Downloads Folder', foes: ['popup', 'popup'],                       reward: [16, 26], itemChance: 0.25 },
  { region: 'Downloads',     name: 'Sketchy .exe',         foes: ['popup', 'worm', 'popup'],               reward: [20, 30], itemChance: 0.3 },
  { region: 'Recycle Bin',   name: 'Recycle Bin',          foes: ['worm', 'worm', 'blob'],                 reward: [26, 38], itemChance: 0.35 },
  { region: 'Recycle Bin',   name: 'Deleted, Not Gone',    foes: ['blob', 'worm', 'drone', 'popup'],       reward: [30, 44], itemChance: 0.4 },
  { region: 'Email Swamp',   name: 'The Inbox',            foes: ['phish', 'phish', 'drone'],              reward: [36, 50], itemChance: 0.45 },
  { region: 'Email Swamp',   name: 'Newsletter Hell',      foes: ['phish', 'adware', 'drone', 'drone'],    reward: [42, 58], itemChance: 0.45 },
  { region: 'System32',      name: 'System32',             foes: ['trojan', 'spyder', 'drone'],            reward: [50, 66], itemChance: 0.5 },
  { region: 'System32',      name: 'DO NOT DELETE',        foes: ['trojan', 'spyder', 'spyder', 'captcha'], reward: [66, 88], itemChance: 0.6, boss: true },
  { region: 'GPU Mines',     name: 'The GPU Mines',        foes: ['miner', 'miner', 'blob'],               reward: [58, 78], itemChance: 0.5 },
  { region: 'GPU Mines',     name: 'Hash Rate Hell',       foes: ['miner', 'ransom', 'drone', 'blob'],     reward: [70, 92], itemChance: 0.55 },
  { region: 'Dark Web',      name: 'The Dark Web',         foes: ['ransom', 'spyder', 'trojan'],           reward: [80, 105], itemChance: 0.6 },
  { region: 'Dark Web',      name: 'Blue Screen',          foes: ['ransom', 'adware', 'trojan', 'bsod'],   reward: [100, 135], itemChance: 0.75, boss: true },
  { region: 'Spam Fortress', name: 'The Gates',            foes: ['adware', 'ransom', 'drone', 'drone'],   reward: [110, 140], itemChance: 0.7 },
  { region: 'Spam Fortress', name: 'THE SPAM KING',        foes: ['adware', 'ransom', 'spamking'],         reward: [150, 200], itemChance: 1, boss: true },
  { region: 'The Cloud',     name: 'The Cloud (Endless)',  foes: [], endless: true,                        reward: [70, 95], itemChance: 0.5 },
];
DATA._REGION_ICO = { 'Downloads': 'doc', 'Recycle Bin': 'recycle', 'Email Swamp': 'mail', 'System32': 'window',
  'GPU Mines': 'gpu', 'Dark Web': 'tinfoil', 'Spam Fortress': 'can', 'The Cloud': 'window' };
DATA.STAGES.forEach((s, i) => {
  s.id = 'stage' + i; s.n = i + 1; s.diff = Math.min(6, 1 + Math.floor(i / 2.5));
  s.ico = s.boss ? 'skull' : (DATA._REGION_ICO[s.region] || 'swords');
});

/* ============================================================
   PROGRESSION — systems reveal as you play.
   ============================================================ */
DATA.UNLOCKS = {
  shop:      { name: 'MemeBay',   ico: 'cart',  desc: 'A daily shop of hats, gear and consumables.' },
  inventory: { name: 'Loot Stash',ico: 'bag',   desc: 'You can now hold loot, equip hats and use consumables.' },
  graveyard: { name: 'Graveyard', ico: 'grave', desc: 'Fallen memes are archived — and can be necroposted back.' },
  endless:   { name: 'The Cloud', ico: 'window',desc: 'An endless, ever-scaling virus gauntlet is now open.' },
};

/* ============================================================
   NAMES & FLAVOR
   ============================================================ */
DATA.NAME_FIRST = ['Doge', 'Chungus', 'Bonk', 'Stonko', 'Kevin', 'Karen', 'Greg', 'Bepis', 'Yeetus',
  'Vibe', 'Dank', 'Smol', 'Chonky', 'Gustavo', 'Beans', 'Pog', 'Sus', 'Gigawatt', 'Milkers',
  'Fredward', 'Bingus', 'Floppa', 'Sneed', 'Grimace', 'Womp', 'Skrunkly', 'Borgir', 'Chad',
  'Debra', 'Gary', 'Nugget', 'Pickle', 'Waffle', 'Gordon', 'Dijon', 'Jorts', 'Jorge', 'Melvin',
  'Tralalero', 'Bombardiro', 'Lirili', 'Tung', 'Sahur', 'Cappuccino', 'Brr Brr', 'Trippi'];
DATA.NAME_LAST = ['the Dank', 'Jr.', 'von Yeet', 'McStonks', 'the Fresh', 'Deluxe', '2.0',
  'the Third', 'of Ohio', 'Prime', 'Supreme', 'HD', 'the Based', 'the Menace', 'Lite',
  'the Certified', 'the Silly', '(Real)', 'the Chosen', 'from Work', 'the Forbidden', 'the Loud'];

DATA.PHRASES = [
  'hehe', 'mood', 'no thoughts', 'bonk?', 'yeet!', 'sheeesh', "vibin'", 'nice',
  'it is wednesday', 'bruh', 'much desktop', 'wow', 'poggers', 'real & true',
  'gimme burbger', 'tralalero tralala', 'tung tung tung', 'sahur', 'brr brr patapim',
  'perfectly balanced', 'have you seen my keys', 'I can haz?', 'sus', 'we vibe',
];
DATA.PET_LINES = ['hehe', 'uwu', ':3', 'much pet, wow', 'sheeesh', '*happy meme noises*', 'pspsps', 'nice'];
DATA.EPITAPHS = [
  'gone to the great archive', 'pressed F, got no respects', 'deleted but not forgotten',
  'now trending in heaven', 'reduced to an image macro', 'their last words: "bruh"',
  'ran out of relevance', '404 meme not found', 'the algorithm claimed another',
];
DATA.BATTLE_CRIES = ['LETS GO!', 'FOR THE DESKTOP!', 'here we go', 'you got this', 'incoming!', 'lock in'];
DATA.HURT_WORDS = ['BONK', 'OOF', 'OUCH', 'YOWCH', 'BAM', 'THWACK', 'BOP', 'SMACK'];
DATA.CRIT_WORDS = ['CRIT!', 'PERFECT!', 'CRITICAL!', 'DIRECT HIT!', 'BOOM!'];

DATA.FLAVOR_BY_FACE = {
  doge: 'Much meme. Very desktop. Wow.',
  frog: 'It is of frog. It vibes on your taskbar.',
  catto: 'Knocks icons off the desktop for fun.',
  troll: 'Problem?',
  stonks: 'Its portfolio is 100% vibes.',
  chad: 'Refuses to elaborate. Leaves.',
  ghost: 'Technically deceased, spiritually thriving.',
  nyan: 'Leaves a rainbow everywhere it goes.',
  tung: 'Tung tung tung tung tung tung sahur.',
  shark: 'Tralalero tralala. Wears three sneakers.',
  capp: 'A cappuccino. An assassin. A cappuccino assassin.',
  croco: 'Half crocodile, half bomber. All problem.',
};

DATA.WANDERER_INTROS = [
  'A wild meme wandered in from a mystery USB stick!',
  'A stray meme crawled out of your browser cache!',
  'This meme fell out of a zip file. It seems friendly?',
  'A meme was found hiding in your screenshots folder!',
];

/* ============================================================
   POWER — the mobile-style rating shown everywhere.
   ============================================================ */
DATA.power = function (stats, level) {
  return Math.round(stats.hp * 0.35 + stats.atk * 2.4 + stats.int * 2.4 + stats.spd * 1.6 + stats.lck * 1.1 + (level || 1) * 4);
};
DATA.virusPower = function (def, scale = 1) {
  return Math.round((def.hp * scale) * 0.35 + (def.atk * scale) * 2.4 + def.spd * 1.6 + (def.boss ? 40 : 0));
};

/* attach art keys so combat/menus can render any virus def */
for (const k of Object.keys(DATA.VIRUSES)) DATA.VIRUSES[k].art = k;
