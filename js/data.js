/* ============================================================
   MEME-GENICS — data.js
   All static content: genes, traits, abilities, items,
   viruses, missions, names & flavor text
   ============================================================ */

const DATA = {};

/* ============================================================
   GENES — each gene has alleles; higher `dom` wins the phenotype.
   `rare` alleles only appear via mutation or lucky starters.
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
      gold:      { dom: 7, label: 'Doge Gold',   c1: '#ffd86b', c2: '#e8a33d' },
      green:     { dom: 6, label: 'Frog Green',  c1: '#8be86b', c2: '#3dab4a' },
      pink:      { dom: 5, label: 'Blushmallow', c1: '#ffb3d9', c2: '#ff71ce' },
      cyan:      { dom: 4, label: 'Ice Cold',    c1: '#a8ecff', c2: '#01cdfe' },
      purple:    { dom: 3, label: 'Grimace',     c1: '#d9a8ff', c2: '#b967ff' },
      orange:    { dom: 2, label: 'Cheeto Dust', c1: '#ffc47a', c2: '#ff9e3d' },
      gray:      { dom: 2, label: 'Concrete',    c1: '#d8d8e0', c2: '#9a9aad' },
      rainbow:   { dom: 1, label: 'RAINBOW', rare: true, c1: '#ff71ce', c2: '#01cdfe' },
      deepfried: { dom: 1, label: 'Deep-Fried', rare: true, c1: '#ff6a3d', c2: '#b32222' },
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
    label: 'Snout',
    alleles: {
      doge:   { dom: 6, label: 'Doge', ability: 'yeet' },
      frog:   { dom: 5, label: 'Frog', ability: 'touchgrass' },
      catto:  { dom: 5, label: 'Catto', ability: 'nyandash' },
      troll:  { dom: 4, label: 'Troll', ability: 'rickroll' },
      stonks: { dom: 3, label: 'Stonks Guy', ability: 'stonks' },
      chad:   { dom: 2, label: 'Chad', ability: 'banhammer' },
      ghost:  { dom: 1, label: 'Spooky', rare: true, ability: 'unoreverse' },
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
      mlg:     { dom: 1, label: 'MLG Shades', rare: true },
      laser:   { dom: 1, label: 'LASER', rare: true },
    }
  },
  mouth: {
    label: 'Mouth',
    alleles: {
      smile:  { dom: 6, label: 'Smile' },
      open:   { dom: 5, label: ':O' },
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

/* ============================================================
   TRAITS — heritable passives. Hooks are read by combat/game code.
   kind: 'good' | 'bad' | 'weird'
   ============================================================ */
DATA.TRAITS = {
  dank:       { name: 'Dank',            ico: '🔥', kind: 'good', desc: '+15% crit chance. Certified.' },
  wholesome:  { name: 'Wholesome',       ico: '🥰', kind: 'good', desc: 'Regenerates 2 HP at the start of its turn.' },
  viral:      { name: 'Viral',           ico: '🦠', kind: 'good', desc: 'On kill: deals 3 dmg to enemies next to the victim.' },
  gigachad:   { name: 'Gigachad',        ico: '💪', kind: 'good', desc: '+3 BONK (attack).' },
  bigbrain:   { name: 'Big Brain',       ico: '🧠', kind: 'good', desc: '+3 BRAIN (ability power).' },
  zoomer:     { name: 'Zoomer',          ico: '⚡', kind: 'good', desc: '+2 ZOOM (speed).' },
  lucky:      { name: 'Lucky',           ico: '🍀', kind: 'good', desc: '+6 LUCK.' },
  thicc:      { name: 'Thicc',           ico: '🍑', kind: 'good', desc: '+10 max HP, but -1 ZOOM.' },
  hoodclassic:{ name: 'Hood Classic',    ico: '📼', kind: 'good', desc: 'Certified. +1 to ALL stats.' },
  maincharacter:{ name: 'Main Character',ico: '🌟', kind: 'good', desc: '+30% XP earned.' },
  sigma:      { name: 'Sigma',           ico: '🐺', kind: 'good', desc: '35% chance to shrug off debuffs.' },
  blessed:    { name: 'Blessed',         ico: '😇', kind: 'good', desc: '12% chance to completely dodge attacks.' },
  immortalsnail:{ name: 'Immortal Snail',ico: '🐌', kind: 'good', desc: '-2 ZOOM, but lives 10 days longer.' },
  stale:      { name: 'Stale',           ico: '🍞', kind: 'bad',  desc: 'Deals 10% less damage. Needs reheating.' },
  cringe:     { name: 'Cringe',          ico: '😬', kind: 'bad',  desc: 'Adjacent allies deal -2 damage (secondhand embarrassment).' },
  ratiod:     { name: "Ratio'd",         ico: '📉', kind: 'bad',  desc: 'Takes 12% more damage.' },
  boomer:     { name: 'Boomer',          ico: '👴', kind: 'bad',  desc: '-2 ZOOM. Doesn\'t get it.' },
  smoothbrain:{ name: 'Smooth Brain',    ico: '🥚', kind: 'bad',  desc: '-3 BRAIN.' },
  npc:        { name: 'NPC',             ico: '🗿', kind: 'bad',  desc: 'Cannot crit. Ever.' },
  doomer:     { name: 'Doomer',          ico: '🌧️', kind: 'bad',  desc: 'Healing received is halved.' },
  clickbait:  { name: 'Clickbait',       ico: '🖱️', kind: 'weird',desc: 'Viruses can\'t resist attacking this meme first.' },
  cursed:     { name: 'Cursed',          ico: '👁️', kind: 'weird',desc: '6% chance to bonk itself when attacking. Why.' },
  reposted:   { name: 'Reposted',        ico: '♻️', kind: 'bad',  desc: '-2 to ALL stats. Bred from related memes...' },
  zombie:     { name: 'Necroposted',     ico: '🧟', kind: 'weird',desc: 'Back from the archive. -20% max HP, immune to poison & burn.' },
};

DATA.GOOD_TRAITS = Object.keys(DATA.TRAITS).filter(k => DATA.TRAITS[k].kind === 'good' && !['immortalsnail'].includes(k));
DATA.BAD_TRAITS = Object.keys(DATA.TRAITS).filter(k => DATA.TRAITS[k].kind === 'bad' && k !== 'reposted');
DATA.MUTATION_TRAITS = [...DATA.GOOD_TRAITS, 'immortalsnail', 'clickbait', 'cursed', ...DATA.BAD_TRAITS];

/* ============================================================
   ABILITIES — combat actions.
   stat: which stat scales `power` (atk|int). target: enemy|ally|self.
   Optional: status {id,turns,chance}, selfStatus, knockback, pull,
   aoe (radius around target), line (pierce), heal, execute, fullhp,
   summon, extraMove, lucky (LCK-gated).
   ============================================================ */
DATA.ABILITIES = {
  bonk: {
    name: 'BONK', ico: '🔨', cd: 0, range: 1, target: 'enemy', stat: 'atk', power: 1.0,
    desc: 'Classic. Bonk an adjacent virus for ATK damage.'
  },
  yeet: {
    name: 'YEET', ico: '🥏', cd: 2, range: 1, target: 'enemy', stat: 'atk', power: 1.2, knockback: 2,
    desc: 'Bonk a virus and YEET it 2 tiles backwards.'
  },
  deepfry: {
    name: 'Deep Fry', ico: '🍟', cd: 2, range: 3, target: 'enemy', stat: 'int', power: 1.2,
    status: { id: 'burn', turns: 2, chance: 0.9 },
    desc: 'Hurl sizzling fryer oil. Deals BRAIN damage and sets the target on fire.'
  },
  rickroll: {
    name: 'Rickroll', ico: '🎤', cd: 3, range: 3, target: 'enemy', stat: 'int', power: 0.3,
    status: { id: 'confuse', turns: 2, chance: 1 },
    desc: 'Never gonna give you up. Confuses the target — it acts randomly for 2 turns.'
  },
  copypasta: {
    name: 'Copypasta', ico: '📋', cd: 6, range: 0, target: 'self', stat: 'int', power: 0, summon: true,
    desc: 'Paste a cheap clone of yourself into an adjacent tile (40% stats, expires with the battle).'
  },
  touchgrass: {
    name: 'Touch Grass', ico: '🌱', cd: 3, range: 0, target: 'self', stat: 'int', power: 1.2, heal: true, aoe: 1,
    desc: 'Go outside for a second. Heals you and adjacent allies for BRAIN×1.2.'
  },
  stonks: {
    name: 'STONKS', ico: '📈', cd: 3, range: 2, target: 'ally', stat: 'int', power: 0,
    status: { id: 'atkUp', turns: 3, chance: 1 },
    desc: 'Line goes up. An ally gains +50% damage for 3 turns.'
  },
  sadviolin: {
    name: 'Sad Violin', ico: '🎻', cd: 3, range: 3, target: 'enemy', stat: 'int', power: 0.2, aoe: 1,
    status: { id: 'atkDown', turns: 2, chance: 1 },
    desc: 'Plays the world\'s smallest violin. Enemies in the area deal -40% damage for 2 turns.'
  },
  unoreverse: {
    name: 'UNO Reverse', ico: '🔄', cd: 4, range: 0, target: 'self', stat: 'int', power: 0,
    selfStatus: { id: 'reflect', turns: 2 },
    desc: 'No u. The next hit you take is reflected back at the attacker.'
  },
  vibecheck: {
    name: 'Vibe Check', ico: '👋', cd: 3, range: 0, target: 'self', stat: 'atk', power: 0.9, aoe: 1, hitsEnemiesOnly: true,
    status: { id: 'stun', turns: 1, chance: 0.45, luckBoost: true },
    desc: 'Slam the ground. Damages all adjacent viruses, chance to stun (boosted by LUCK).'
  },
  ratio: {
    name: 'Ratio', ico: '💬', cd: 2, range: 4, target: 'enemy', stat: 'int', power: 1.0, fullhp: 1.5,
    desc: 'L + ratio. Ranged BRAIN damage; +50% vs viruses at full HP.'
  },
  zoomies: {
    name: 'Zoomies', ico: '💨', cd: 3, range: 0, target: 'self', stat: 'atk', power: 0, extraMove: true,
    selfStatus: { id: 'spdUp', turns: 2 },
    desc: '3 AM energy. Move again this turn and gain +2 move for 2 turns.'
  },
  banhammer: {
    name: 'Ban Hammer', ico: '⚒️', cd: 4, range: 1, target: 'enemy', stat: 'atk', power: 1.8,
    status: { id: 'stun', turns: 1, chance: 0.8 },
    desc: 'MODS?! Massive damage + likely stun. Straight to horny jail.'
  },
  thoughtsprayers: {
    name: 'Thoughts & Prayers', ico: '🙏', cd: 2, range: 3, target: 'ally', stat: 'int', power: 2.0, heal: true, lucky: true,
    desc: 'Sends support. LUCK% chance of a HUGE heal... otherwise heals 1. One (1) HP.'
  },
  airhorn: {
    name: 'MLG Airhorn', ico: '📯', cd: 3, range: 3, target: 'enemy', stat: 'int', power: 0.8, line: true,
    desc: 'BWAAAAMP. Blasts a straight line, hitting every virus in it.'
  },
  nyandash: {
    name: 'Nyan Dash', ico: '🌈', cd: 3, range: 3, target: 'enemy', stat: 'atk', power: 0.9, dash: true,
    desc: 'Rainbow-dash in a straight line at a virus, leaving sparkles. Ends adjacent to it.'
  },
  cheems: {
    name: 'Cheemsburbger', ico: '🍔', cd: 4, range: 0, target: 'self', stat: 'int', power: 1.5, heal: true,
    selfStatus: { id: 'atkUp', turns: 2 },
    desc: 'Eat a burbger. Big self-heal and +50% damage for 2 turns.'
  },
  ggez: {
    name: 'GG EZ', ico: '🏆', cd: 2, range: 1, target: 'enemy', stat: 'atk', power: 1.0, execute: 0.35,
    desc: 'Finisher taunt. Double damage vs viruses below 35% HP.'
  },
};

// abilities that can appear on the "spice" gene slots
DATA.LEARNABLE = ['yeet', 'deepfry', 'rickroll', 'copypasta', 'touchgrass', 'stonks', 'sadviolin',
  'unoreverse', 'vibecheck', 'ratio', 'zoomies', 'banhammer', 'thoughtsprayers', 'airhorn',
  'nyandash', 'cheems', 'ggez'];

/* ============================================================
   STATUS EFFECTS
   ============================================================ */
DATA.STATUS = {
  burn:    { name: 'Deep-Fried', ico: '🔥', bad: true,  desc: 'Takes 3 damage at the start of its turn.' },
  poison:  { name: 'Malware',    ico: '🤢', bad: true,  desc: 'Takes 2 damage at the start of its turn.' },
  stun:    { name: 'Bonked',     ico: '💫', bad: true,  desc: 'Skips its next turn. Go to sleep.' },
  confuse: { name: 'Rickrolled', ico: '🎶', bad: true,  desc: 'Acts randomly. Never gonna give you up...' },
  slow:    { name: 'Lagging',    ico: '🐌', bad: true,  desc: '-2 movement. 300 ping.' },
  atkUp:   { name: 'STONKS',     ico: '📈', bad: false, desc: '+50% damage dealt.' },
  atkDown: { name: 'Not Stonks', ico: '📉', bad: true,  desc: '-40% damage dealt.' },
  spdUp:   { name: 'Zoomin',     ico: '💨', bad: false, desc: '+2 movement.' },
  reflect: { name: 'No U',       ico: '🔄', bad: false, desc: 'Reflects the next hit back at the attacker.' },
  shield:  { name: 'Blocked',    ico: '🛡️', bad: false, desc: 'Absorbs incoming damage.' },
};

/* ============================================================
   ITEMS
   ============================================================ */
DATA.ITEMS = {
  // ---- hats ----
  tophat:    { name: 'Like a Sir',      ico: '🎩', kind: 'hat', price: 40, stats: { int: 2 },           desc: '+2 BRAIN. *tips fedora* — wait, wrong hat.' },
  mlgcap:    { name: 'MLG Snapback',    ico: '🧢', kind: 'hat', price: 45, stats: { crit: 10 },          desc: '+10% crit. 360 no-scope certified.' },
  crown:     { name: 'Crown of Sheesh', ico: '👑', kind: 'hat', price: 120, stats: { hp: 4, atk: 1, int: 1, spd: 1, lck: 1 }, desc: '+1 to everything, +4 HP. Royalty behavior.' },
  propeller: { name: 'Propeller Cap',   ico: '🚁', kind: 'hat', price: 45, stats: { spd: 2 },            desc: '+2 ZOOM. Nyoooom.' },
  tinfoil:   { name: 'Tinfoil Hat',     ico: '🛸', kind: 'hat', price: 50, stats: { resist: 30 },        desc: '30% chance to resist debuffs. They can\'t read your thoughts now.' },
  partyhat:  { name: 'Party Hat',       ico: '🥳', kind: 'hat', price: 40, stats: { lck: 5 },            desc: '+5 LUCK. It\'s always somebody\'s birthday.' },
  // ---- held ----
  banhammeritem: { name: 'Spare Ban Hammer', ico: '🔨', kind: 'held', price: 60, stats: { atk: 3 },      desc: '+3 BONK. For legal reasons this is a joke.' },
  keyboard:  { name: 'Mechanical Keyboard', ico: '⌨️', kind: 'held', price: 55, stats: { atk: 2, int: 1 }, desc: '+2 BONK, +1 BRAIN. Clacky.' },
  dogecoin:  { name: 'Doge Coin',       ico: '🪙', kind: 'held', price: 50, stats: { lck: 6 },           desc: '+6 LUCK. Much fortune. Wow.' },
  gpu:       { name: 'Hot GPU',         ico: '🎮', kind: 'held', price: 65, stats: { int: 3 },           desc: '+3 BRAIN. Runs Crysis (barely).' },
  gamermouse:{ name: 'Gamer Mouse',     ico: '🖱️', kind: 'held', price: 55, stats: { spd: 2, crit: 5 },  desc: '+2 ZOOM, +5% crit. RGB makes it faster.' },
  popblocker:{ name: 'Pop-up Blocker',  ico: '🛡️', kind: 'held', price: 60, stats: { hp: 10 },           desc: '+10 max HP. NOT TODAY, ADS.' },
  // ---- consumables ----
  pizza:     { name: 'Pizza Slice',     ico: '🍕', kind: 'consumable', price: 15, battle: 'heal', power: 18, desc: 'BATTLE: heal a meme for 18 HP. Pineapple status unknown.' },
  energy:    { name: 'G-Fuel Barrel',   ico: '🧃', kind: 'consumable', price: 20, battle: 'energy', desc: 'BATTLE: the current meme can move again & loses ability cooldowns.' },
  copium:    { name: 'Tank of Copium',  ico: '⛽', kind: 'consumable', price: 80, battle: 'revive', desc: 'BATTLE: revive a fallen meme at 50% HP. Pure copium.' },
  usbstick:  { name: 'Antivirus USB',   ico: '💾', kind: 'consumable', price: 70, battle: 'nuke', power: 10, desc: 'BATTLE: deals 10 damage to EVERY virus. Have you tried turning it off and on?' },
  preservative:{ name: 'Preservatives', ico: '🧪', kind: 'consumable', price: 60, home: 'lifespan', power: 6, desc: 'HOME: a meme stays fresh 6 extra days. Ignore the label.' },
  miraclegro:{ name: 'Miracle-Gro',     ico: '🌻', kind: 'consumable', price: 35, home: 'grow', desc: 'HOME: instantly grows a baby meme into an adult. Ethics? Never heard of it.' },
  dankserum: { name: 'Serum of Dank',   ico: '💉', kind: 'consumable', price: 100, home: 'trait', desc: 'HOME: injects a random GOOD trait into a meme. FDA disapproved.' },
  febreze:   { name: 'Meme Febreze',    ico: '🌬️', kind: 'consumable', price: 90, home: 'cleanse', desc: 'HOME: removes a random BAD trait from a meme. Fresh af.' },
};

/* ============================================================
   VIRUSES (enemies)
   ai: 'melee' | 'ranged' | 'summoner' | 'coward' | 'miner'
   ============================================================ */
DATA.VIRUSES = {
  popup: {
    name: 'Pop-Up Ad', emoji: '🪧', hp: 8, atk: 3, spd: 4, move: 3, ai: 'melee',
    xp: 4, bounty: 3, abilities: ['vbite'],
    flavor: 'CONGRATULATIONS!! You are the 1,000,000th victim.'
  },
  worm: {
    name: 'Worm.exe', emoji: '🪱', hp: 12, atk: 4, spd: 7, move: 4, ai: 'melee',
    xp: 6, bounty: 5, abilities: ['vpoison'],
    flavor: 'It wriggles through your files leaving slime and malware.'
  },
  trojan: {
    name: 'Trojan Pony', emoji: '🎠', hp: 30, atk: 7, spd: 3, move: 2, ai: 'melee',
    xp: 12, bounty: 10, abilities: ['vbite'], tanky: true,
    flavor: 'It said it was a free game. IT SAID IT WAS A FREE GAME.'
  },
  blob: {
    name: 'Bloatware Blob', emoji: '🫠', hp: 26, atk: 5, spd: 2, move: 2, ai: 'melee',
    xp: 10, bounty: 8, abilities: ['vbite'], splits: true,
    flavor: 'Ships pre-installed. Cannot be uninstalled. Splits when deleted.'
  },
  miniblob: {
    name: 'Blob Jr.', emoji: '🧫', hp: 8, atk: 3, spd: 4, move: 3, ai: 'melee',
    xp: 3, bounty: 2, abilities: ['vbite'],
    flavor: 'A smaller, angrier terms-of-service agreement.'
  },
  spyder: {
    name: 'Keylogger Spyder', emoji: '🕷️', hp: 14, atk: 5, spd: 6, move: 3, ai: 'ranged',
    xp: 9, bounty: 8, abilities: ['vweb', 'vsnipe'],
    flavor: 'It knows you typed "how to delete virus" 47 times.'
  },
  ransom: {
    name: 'Ransom-Where', emoji: '🔒', hp: 22, atk: 6, spd: 5, move: 3, ai: 'melee',
    xp: 12, bounty: 12, abilities: ['vencrypt'],
    flavor: 'Your files are encrypted! Send 3 dogecoins to unlock.'
  },
  phish: {
    name: 'Phish', emoji: '🐟', hp: 16, atk: 5, spd: 5, move: 3, ai: 'ranged',
    xp: 10, bounty: 9, abilities: ['vphish', 'vbite'],
    flavor: 'Dear Sir/Madam, you have won a hook to the face.'
  },
  drone: {
    name: 'Botnet Drone', emoji: '🛸', hp: 10, atk: 4, spd: 8, move: 4, ai: 'melee',
    xp: 5, bounty: 4, abilities: ['vbite'],
    flavor: 'One of ten thousand. All named Kevin.'
  },
  adware: {
    name: 'Adware Broadcaster', emoji: '📢', hp: 18, atk: 3, spd: 4, move: 2, ai: 'summoner',
    xp: 14, bounty: 12, abilities: ['vspam', 'vbite'],
    flavor: 'HOT SINGLES IN YOUR AREA want to summon pop-ups.'
  },
  miner: {
    name: 'Crypto Miner', emoji: '⛏️', hp: 20, atk: 2, spd: 3, move: 2, ai: 'miner',
    xp: 12, bounty: 20, abilities: ['vbite'],
    flavor: 'Ignores you. Steals 2 coins from the loot every turn it lives.'
  },
  captcha: {
    name: 'CAPTCHA Golem', emoji: '🚦', hp: 55, atk: 8, spd: 4, move: 2, ai: 'melee', boss: true,
    xp: 40, bounty: 45, abilities: ['vbite', 'vverify'], captcha: true,
    flavor: 'SELECT ALL SQUARES CONTAINING YOUR DOOM. It is invulnerable every other round.'
  },
  bsod: {
    name: 'B.S.O.D.', emoji: '🟦', hp: 70, atk: 9, spd: 5, move: 3, ai: 'melee', boss: true,
    xp: 60, bounty: 70, abilities: ['vbsod', 'vbite', 'vsummon_drone'],
    flavor: 'Your PC ran into a problem: this guy. :('
  },
  spamking: {
    name: 'THE SPAM KING', emoji: '🥫', hp: 90, atk: 10, spd: 6, move: 3, ai: 'summoner', boss: true,
    xp: 100, bounty: 120, abilities: ['vspam', 'vroyalbonk', 'vbsod'],
    flavor: 'RE: RE: FWD: RE: URGENT!!! The final boss of your inbox.'
  },
};

DATA.VIRUS_ABILITIES = {
  vbite:    { name: 'Byte',        ico: '🦷', cd: 0, range: 1, power: 1.0, desc: 'A byte-sized bite.' },
  vpoison:  { name: 'Infect',      ico: '🤢', cd: 0, range: 1, power: 0.8, status: { id: 'poison', turns: 3, chance: 0.8 }, desc: 'Poisonous packet.' },
  vweb:     { name: 'Log Keys',    ico: '🕸️', cd: 2, range: 3, power: 0.6, status: { id: 'slow', turns: 2, chance: 1 }, desc: 'Sticky spyware web.' },
  vsnipe:   { name: 'Data Snipe',  ico: '🎯', cd: 1, range: 4, power: 1.0, desc: 'Long-range packet loss.' },
  vencrypt: { name: 'Encrypt',     ico: '🔒', cd: 3, range: 1, power: 1.1, status: { id: 'stun', turns: 1, chance: 0.7 }, steal: 4, desc: 'Locks a meme and demands coins.' },
  vphish:   { name: 'Phish Hook',  ico: '🪝', cd: 2, range: 4, power: 0.7, pull: 2, desc: 'Reels a meme in. Click here!' },
  vspam:    { name: 'Spam Summon', ico: '📨', cd: 3, range: 0, summon: 'popup', count: 2, desc: 'You have (2) new pop-ups.' },
  vsummon_drone: { name: 'Botnet Call', ico: '🛸', cd: 4, range: 0, summon: 'drone', count: 1, desc: 'Calls a drone named Kevin.' },
  vbsod:    { name: 'Blue Screen', ico: '🟦', cd: 4, range: 0, power: 0.9, aoe: 2, status: { id: 'stun', turns: 1, chance: 0.35 }, desc: 'CRITICAL_PROCESS_DIED for everyone nearby.' },
  vverify:  { name: 'Verify You Are Human', ico: '🚦', cd: 3, range: 2, power: 0.8, status: { id: 'confuse', turns: 1, chance: 0.6 }, desc: 'Identify all traffic lights or take damage.' },
  vroyalbonk: { name: 'Royal Decree', ico: '🥫', cd: 2, range: 2, power: 1.4, desc: 'A can of spam, thrown with authority.' },
};

/* ============================================================
   MISSIONS
   ============================================================ */
DATA.MISSIONS = [
  {
    id: 'downloads', name: 'Downloads Folder', ico: '📁', diff: 1,
    desc: 'Something free-robux-generator.exe shaped is moving in there.',
    foes: ['popup', 'popup', 'worm'],
    reward: [18, 28], itemChance: 0.35,
    bg: ['📁', '📄', '🗂️'], deco: ['📁', '🗑️', '📄'],
  },
  {
    id: 'recycle', name: 'Recycle Bin', ico: '🗑️', diff: 1,
    desc: 'The stuff you deleted is BACK and it is UNIONIZING.',
    foes: ['popup', 'worm', 'worm', 'blob'],
    reward: [25, 38], itemChance: 0.4,
    bg: ['🗑️', '🍌', '🥡'], deco: ['🗑️', '🍌', '🧻'],
  },
  {
    id: 'inbox', name: 'Email Swamp', ico: '📧', diff: 2,
    desc: 'One weird trick to clear 9,999+ unread emails (viruses hate it).',
    foes: ['phish', 'phish', 'popup', 'drone', 'drone'],
    reward: [35, 50], itemChance: 0.45,
    bg: ['📧', '💌', '📮'], deco: ['📧', '🐊', '📮'],
  },
  {
    id: 'system32', name: 'System32', ico: '⚙️', diff: 3,
    desc: 'DO NOT DELETE. The viruses did not read the sign. Boss: CAPTCHA Golem.',
    foes: ['trojan', 'spyder', 'spyder', 'drone', 'captcha'],
    reward: [55, 75], itemChance: 0.6,
    bg: ['⚙️', '🔩', '🖥️'], deco: ['⚙️', '🔧', '🗄️'],
  },
  {
    id: 'gpumines', name: 'The GPU Mines', ico: '⛏️', diff: 3,
    desc: 'Crypto miners are eating your frame rate. Kill them before they drain the loot.',
    foes: ['miner', 'miner', 'ransom', 'blob', 'drone'],
    reward: [70, 95], itemChance: 0.55,
    bg: ['⛏️', '💎', '🪨'], deco: ['⛏️', '💎', '🕳️'],
  },
  {
    id: 'darkweb', name: 'The Dark Web', ico: '🕶️', diff: 4,
    desc: 'It\'s just the regular web wearing sunglasses. Boss: B.S.O.D.',
    foes: ['ransom', 'spyder', 'trojan', 'adware', 'bsod'],
    reward: [90, 120], itemChance: 0.75,
    bg: ['🕶️', '🦇', '🌑'], deco: ['🕶️', '🦇', '⛓️'],
  },
  {
    id: 'spamfort', name: 'Spam Fortress', ico: '🏰', diff: 5,
    desc: 'FINAL: RE: RE: FWD: The Spam King awaits. This email finds you unwell.',
    foes: ['adware', 'ransom', 'drone', 'drone', 'spamking'],
    reward: [140, 180], itemChance: 1,
    bg: ['🥫', '🏰', '📨'], deco: ['🥫', '👑', '📨'],
  },
  {
    id: 'cloud', name: 'The Cloud (Endless)', ico: '☁️', diff: 6, endless: true,
    desc: 'Someone else\'s computer, infinitely infected. Waves scale forever.',
    foes: [], // generated
    reward: [60, 80], itemChance: 0.5,
    bg: ['☁️', '🌩️', '💧'], deco: ['☁️', '🌩️', '🌀'],
  },
];

/* ============================================================
   NAMES & FLAVOR
   ============================================================ */
DATA.NAME_FIRST = ['Doge', 'Chungus', 'Bonk', 'Stonko', 'Kevin', 'Karen', 'Greg', 'Bepis', 'Yeetus',
  'Vibe', 'Dank', 'Smol', 'Chonky', 'Gustavo', 'Beans', 'Pog', 'Sus', 'Gigawatt', 'Milkers',
  'Fredward', 'Bingus', 'Floppa', 'Sneed', 'Grimace', 'Womp', 'Skrunkly', 'Borgir', 'Chad',
  'Debra', 'Gary', 'Nugget', 'Pickle', 'Waffle', 'Gordon', 'Dijon', 'Jorts', 'Jorge', 'Melvin'];
DATA.NAME_LAST = ['the Dank', 'Jr.', 'von Yeet', 'McStonks', 'the Unemployed', 'Deluxe', '2.0',
  'the Third', 'of Ohio', 'Prime', 'the Moist', 'Supreme', 'the Fresh', 'HD', 'the Based',
  'the Menace', 'Lite', 'the Certified', 'the Crusty', 'the Silly', '(Real)', 'the Chosen',
  'from Work', 'the Forbidden', 'NFT', 'the Loud', 'the Damp'];

DATA.PHRASES = [
  'hehe', 'mood', 'no thoughts', 'bonk?', 'yeet!', 'sheeesh', 'vibin\'', 'certified moment',
  'it is wednesday', 'bruh', 'much desktop', 'wow', 'ratio + L', 'skill issue', 'I am 4 parallel universes ahead',
  'gimme burbger', 'touch grass? never', 'stonks 📈', '*visible confusion*', 'poggers', 'F',
  'we live in a society', 'do it for the vine', 'e', 'hello? yes this is meme', 'lorem ipsum lol',
  'perfectly balanced', 'delet this', 'have you seen my keys', 'I can haz?', 'sus', 'real & true',
];
DATA.PET_LINES = ['hehe', 'uwu', ':3', 'much pet, wow', 'sheeesh', '*happy meme noises*', 'pspsps works on me', 'W rizz'];
DATA.EPITAPHS = [
  'gone to the great archive', 'pressed F, got no respects', 'deleted but not forgotten',
  'now trending in heaven', 'reduced to a mere image macro', 'their last words: "bruh"',
  'died doing what they loved: nothing', 'ran out of relevance', '404 meme not found',
  'the algorithm claimed another', 'got ratio\'d by god',
];
DATA.BATTLE_CRIES = ['LESGOOO', 'IT\'S MEMEING TIME', 'AVENGE ME', 'FOR THE DESKTOP!', 'no lag no lag no lag', 'EZ Clap', 'I fear no update'];

DATA.HURT_WORDS = ['BONK', 'OOF', 'OUCH', 'YOWCH', 'BAM', 'THWACK', 'BOP', 'SMACK'];
DATA.CRIT_WORDS = ['CRIT!!', 'DELETED!', 'GET REKT', 'MASSIVE', 'NO SCOPE', 'SHEEESH'];

DATA.FLAVOR_BY_FACE = {
  doge: 'Much meme. Very desktop. Wow.',
  frog: 'It is of frog. It vibes on your taskbar.',
  catto: 'Knocks icons off the desktop for fun.',
  troll: 'Problem? (⌐■_■)',
  stonks: 'Its portfolio is 100% vibes.',
  chad: 'Refuses to elaborate. Leaves.',
  ghost: 'Technically deceased, spiritually thriving.',
};

DATA.WANDERER_INTROS = [
  'A wild meme wandered in from a USB stick nobody remembers plugging in!',
  'A stray meme crawled out of your browser cache!',
  'This meme fell out of a zip file. It seems friendly?',
  'A meme was found hiding in your screenshots folder!',
];
