/* ============================================================
   MEME-GENICS — sprites.js
   All game art, hand-drawn pixel grids + a procedural pixel
   renderer that draws every meme from its genome, so children
   visibly inherit their parents' looks.
   ============================================================ */

/* ============================================================
   EXTRA ICONS — abilities, virus moves, items
   (registered into the shared atlas from pixel.js)
   ============================================================ */
Object.assign(ICONS, {

  /* ---------- ability glyphs ---------- */
  hammer: { p: { k: '#6f6c88', s: '#9a97b0', h: '#a06a3c' }, g: [
    '..oooooo..',
    '.okkkkkko.',
    '.okskkkko.',
    '.okkkkkko.',
    '..oooooo..',
    '....oho...',
    '....oho...',
    '....oho...',
    '....oho...',
    '.....o....',
  ]},
  throw: { p: { c: '#7ec8ff' }, g: [
    '..occcco..',
    '.oco..oco.',
    'oco....oco',
    'oc......oc',
    'oc........',
    'oc....o...',
    '.c...oco..',
    '.c..occco.',
    '....occcco',
    '....ooooo.',
  ]},
  fries: { p: { y: '#ffd93d', r: '#e6482e', c: '#fff3a8' }, g: [
    '..o.o.o...',
    '.ocoyoco..',
    '.oyocoyo..',
    '.oyoyoyo..',
    'oooooooo..',
    'orrrrrro..',
    'orwrrrro..',
    'orrrrrro..',
    '.orrrro...',
    '..oooo....',
  ]},
  clipboard: { p: { b: '#a06a3c', c: '#f5efdf', d: '#b9b2a0' }, g: [
    '...oooo...',
    '.oobkkboo.',
    '.obbbbbbo.',
    '.obccccbo.',
    '.obcddcbo.',
    '.obccccbo.',
    '.obcddcbo.',
    '.obccccbo.',
    '.obbbbbbo.',
    '..oooooo..',
  ]},
  chartup: { p: { g: '#5fae5f', c: '#f5efdf' }, g: [
    'oooooooooo',
    'occcccccco',
    'occccccggo',
    'occcccggco',
    'occccggcco',
    'ocggcgccco',
    'ocgggcccco',
    'ocggccccco',
    'occcccccco',
    'oooooooooo',
  ]},
  violin: { p: { h: '#a06a3c', d: '#7c4f28', s: '#f5efdf' }, g: [
    '.......oo.',
    '......oso.',
    '......oso.',
    '..oo..oso.',
    '.ohhooso..',
    'ohhhhoso..',
    'ohhdhhso..',
    'ohhhhho...',
    '.ohhho....',
    '..ooo.....',
  ]},
  bubble: { p: { c: '#f2f0f7' }, g: [
    '.oooooooo.',
    'occcccccco',
    'ockcckccko',
    'occcccccco',
    'occcccccco',
    '.oooooooo.',
    '..oco.....',
    '.oco......',
    '.oo.......',
    '..........',
  ]},
  horn: { p: { r: '#e6482e', s: '#9a97b0', c: '#ffd93d' }, g: [
    '........c.',
    '......c...',
    '....oo..c.',
    '..oorro...',
    'oorrrrо.c.'.replace('о','o'),
    'orrrrrro..',
    'oorrrrо...'.replace('о','o'),
    '..oorro...',
    '....oo....',
    '.oso......',
  ]},
  rainbow: { p: { r: '#ff4d6d', y: '#ffd93d', g: '#5fae5f', b: '#4fc4e8' }, g: [
    '...rrrr...',
    '..ryyyyr..',
    '.ryggggyr.',
    'rygbbbbgyr',
    'rygb..bgyr',
    'ygb....bgy',
    '..........',
    '..........',
    '..........',
    '..........',
  ]},
  burger: { p: { b: '#e8b05c', g: '#5fae5f', r: '#e6482e', y: '#ffd93d' }, g: [
    '..oooooo..',
    '.obbbbbbo.',
    'obbwbwbbbo',
    'oggggggggo',
    'orrrrrrrro',
    'oyyyyyyyyo',
    'obbbbbbbbo',
    '.obbbbbbo.',
    '..oooooo..',
    '..........',
  ]},
  trophy: { p: { y: '#f0b541', l: '#ffe07a', d: '#c28024' }, g: [
    'oooooooooo',
    'oyyyyyyyyo',
    '.oyylyyo..',
    '.oyylyyo..',
    '..oyyyo...',
    '...oyo....',
    '...oyo....',
    '..oyyyo...',
    '.oyyyyyo..',
    '.ooooooo..',
  ]},
  pray: { p: { s: '#f2b988', y: '#ffd93d' }, g: [
    '....y.....',
    '...y.y....',
    '....o.....',
    '...oso....',
    '...osso...',
    '..ossso...',
    '..ossso...',
    '..osssо...'.replace('о','o'),
    '...oso....',
    '...oo.....',
  ]},

  /* ---------- virus move glyphs ---------- */
  bite: { p: { c: '#f2f0f7' }, g: [
    'o.o.o.o.o.',
    'ococococo.',
    'occcccccо.'.replace('о','o'),
    '.occccco..',
    '..........',
    '.occccco..',
    'occcccccо.'.replace('о','o'),
    'ococococo.',
    'o.o.o.o.o.',
    '..........',
  ]},
  web: { p: { c: '#c8d0dd' }, g: [
    'c...cc...c',
    '.c..cc..c.',
    '..c.cc.c..',
    '...cccc...',
    'cccc..cccc',
    'cccc..cccc',
    '...cccc...',
    '..c.cc.c..',
    '.c..cc..c.',
    'c...cc...c',
  ]},
  hook: { p: { s: '#c8d0dd' }, g: [
    '....oo....',
    '....oso...',
    '....oso...',
    '....oso...',
    '....oso...',
    '.o..oso...',
    'oso.oso...',
    'osooso....',
    '.ossso....',
    '..ooo.....',
  ]},
  mail: { p: { c: '#f5efdf', r: '#e6482e' }, g: [
    '..........',
    'oooooooooo',
    'occcccccco',
    'ocоccccоco'.replace(/о/g,'c'),
    'occoccocco',
    'ocococococ'.slice(0,9)+'o',
    'occcccccco',
    'ocrrcccrco',
    'occcccccco',
    'oooooooooo',
  ]},
  trafficlight: { p: { k: '#3a3450', r: '#e6482e', y: '#ffd93d', g: '#5fae5f' }, g: [
    '..oooooo..',
    '..okkkko..',
    '..okrrko..',
    '..okkkko..',
    '..okyyko..',
    '..okkkko..',
    '..okggko..',
    '..okkkko..',
    '..oooooo..',
    '....oo....',
  ]},
  can: { p: { b: '#2f6ff2', y: '#ffd93d', s: '#c8d0dd' }, g: [
    '..........',
    '.oooooooo.',
    '.ossssssо.'.replace('о','o'),
    '.obbbbbbo.',
    '.obbbbbbo.',
    '.oyyyyyyo.',
    '.obbbbbbo.',
    '.obbbbbbo.',
    '.ossssssо.'.replace('о','o'),
    '.oooooooo.',
  ]},

  /* ---------- item art ---------- */
  tophat: { p: { k: '#3a3450', r: '#e6482e' }, g: [
    '..........',
    '..oooooo..',
    '..okkkko..',
    '..okkkko..',
    '..okkkko..',
    '..orrrro..',
    'oooooooooo',
    'okkkkkkkko',
    'oooooooooo',
    '..........',
  ]},
  cap: { p: { r: '#e6482e', d: '#b53222' }, g: [
    '..........',
    '...oooo...',
    '..orrrro..',
    '.orrrrrro.',
    '.orrwrrro.',
    '.orrrrrro.',
    '.oooooooo.',
    '....odddoo',
    '.....oooo.',
    '..........',
  ]},
  crown: { p: { y: '#f0b541', r: '#e6482e', l: '#ffe07a' }, g: [
    '..........',
    'o...oo...o',
    'oy..ly..yo',
    'oyy.yy.yyo',
    'oylyyyylyo',
    'oyrryyrryo',
    'oyyyyyyyyo',
    'oooooooooo',
    '..........',
    '..........',
  ]},
  propeller: { p: { r: '#e6482e', b: '#4fc4e8', y: '#ffd93d' }, g: [
    '.oo....oo.',
    'orro..obbo',
    '.oroyyobо.'.replace('о','o'),
    '...oyyo...',
    '..oooooo..',
    '.obbrbbro.',
    '.obrbbrbo.',
    'obbrbbrbbo',
    'oooooooooo',
    '..........',
  ]},
  tinfoil: { p: { s: '#c8d0dd', l: '#f2f6fa' }, g: [
    '....oo....',
    '...osso...',
    '...oslo...',
    '..osssso..',
    '..oslsso..',
    '.osssssso.',
    '.oslsssso.',
    'osssssssso',
    'oooooooooo',
    '..........',
  ]},
  partyhat: { p: { p: '#ff6ba9', y: '#ffd93d' }, g: [
    '....ww....',
    '...owwo...',
    '....oo....',
    '...oppo...',
    '...oppo...',
    '..oyyyyo..',
    '..oyyyyo..',
    '.oppppppo.',
    '.oppppppo.',
    '..oooooo..',
  ]},
  keyboard: { p: { k: '#3a3450' }, g: [
    '..........',
    '..........',
    'oooooooooo',
    'okkkkkkkko',
    'okwkwkwkko',
    'okkkkkkkko',
    'okwwwwwkko',
    'okkkkkkkko',
    'oooooooooo',
    '..........',
  ]},
  gpu: { p: { g: '#5fae5f', k: '#3a3450' }, g: [
    '..........',
    'ooooooooo.',
    'ogggggggо.'.replace('о','o'),
    'ogokkoggo.',
    'ogkookggo.',
    'ogkookggo.',
    'ogokkoggo.',
    'ogggggggо.'.replace('о','o'),
    'ooooooooo.',
    '..o.o.o...',
  ]},
  mouse: { p: { b: '#c8d0dd', r: '#ff4d6d' }, g: [
    '...oooo...',
    '..obbbbo..',
    '.obbobbbo.',
    '.obbobbbo.',
    '.obbbbbbo.',
    '.obrrbbbo.',
    '.obbbbbbo.',
    '..obbbbo..',
    '...oooo...',
    '..........',
  ]},
  pizza: { p: { c: '#ffd93d', r: '#e6482e', b: '#c98b52' }, g: [
    '.oooooooo.',
    'obbbbbbbbo',
    'occrccrcco',
    '.occcccco.',
    '.ocrccrco.',
    '..occcco..',
    '..ocrcco..',
    '...occo...',
    '...occo...',
    '....oo....',
  ]},
  energycan: { p: { g: '#5fae5f', y: '#ffd93d', s: '#c8d0dd' }, g: [
    '..oooooo..',
    '..osssso..',
    '.oggggggo.',
    '.oggoyggo.',
    '.ogoyyogо.'.replace('о','o'),
    '.oggyoggo.',
    '.oggoyggо.'.replace('о','o'),
    '.oggggggo.',
    '..osssso..',
    '..oooooo..',
  ]},
  copiumtank: { p: { b: '#4fc4e8', l: '#a8e4f7' }, g: [
    '...oo.....',
    '..oooo....',
    '...oo.....',
    '..obbbo...',
    '.obbbbbo..',
    '.oblbbbo..',
    '.obbbbbo..',
    '.obwwbbo..',
    '.obbbbbo..',
    '..ooooo...',
  ]},
  usb: { p: { s: '#c8d0dd', b: '#4fc4e8' }, g: [
    '...oooo...',
    '...osso...',
    '...osso...',
    '..oooooo..',
    '..obbbbo..',
    '..obbbbo..',
    '..obwbbo..',
    '..obbbbo..',
    '..oooooo..',
    '..........',
  ]},
  flask: { p: { g: '#7dc95e', c: '#f2f0f7' }, g: [
    '...oooo...',
    '...o..o...',
    '...o..o...',
    '..o....o..',
    '..o.gg.o..',
    '.o.gggg.o.',
    '.oggggggo.',
    'oggggggggo',
    'oooooooooo',
    '..........',
  ]},
  flower: { p: { y: '#ffd93d', r: '#e6482e', g: '#5fae5f', b: '#c98b52' }, g: [
    '...oooo...',
    '..oyryyo..',
    '..oyyryo..',
    '...oooo...',
    '....og....',
    '....og....',
    '..oooooo..',
    '..obbbbo..',
    '...obbo...',
    '....oo....',
  ]},
  syringe: { p: { c: '#f2f0f7', p: '#ff6ba9' }, g: [
    '.......oo.',
    '......oko.',
    '.....oko..',
    '....okko..',
    '...occо...'.replace('о','o'),
    '..ocpco...',
    '.ocpco....',
    'occco.....',
    'oooo......',
    '.o........',
  ]},
  spray: { p: { b: '#7ec8ff', c: '#a8e4f7' }, g: [
    '.oo....c..',
    'okko..c.c.',
    '.oo....c..',
    'oooo......',
    'obbbo.....',
    'obwbo.....',
    'obbbo.....',
    'obbbo.....',
    'obbbo.....',
    'ooooo.....',
  ]},
});

/* ============================================================
   VIRUS PIXEL SPRITES
   ============================================================ */
const VIRUS_ART = {
  popup: { p: { r: '#e6482e', c: '#f5efdf' }, g: [
    'oooooooooooo',
    'orrrrrrrrowo',
    'oooooooooooo',
    'occcccccccco',
    'ockkccckkcco',
    'ockkccckkcco',
    'occcccccccco',
    'occokkkkocco',
    'occcccccccco',
    'oooooooooooo',
    '..oo....oo..',
    '..oo....oo..',
  ]},
  worm: { p: { g: '#8ed07f', d: '#4d9142' }, g: [
    '..ooooo.....',
    '.ogggggo....',
    'ogwkgwkgо...'.replace('о','o'),
    'oggggggggo..',
    'ogddgogggo..',
    '.ooo..oggo..',
    '.......oggo.',
    '..ooo..oggo.',
    '.ogggo.oggo.',
    '.ogdggoggo..',
    '..ogggggo...',
    '...ooooo....',
  ]},
  trojan: { p: { h: '#b5793c', d: '#8a5426', s: '#6f6c88' }, g: [
    '..oo........',
    '.ohho.......',
    'ohhkho......',
    'ohhhhooooo..',
    '.ohhhhhhhho.',
    '.ohdhhhdhho.',
    '.ohhhhhhhho.',
    '.oohhhhhoo..',
    '..oso..oso..',
    '..oso..oso..',
    '...o....o...',
    '............',
  ]},
  blob: { p: { b: '#a86ae8', d: '#7c46b8' }, g: [
    '....oooo....',
    '..oobbbboo..',
    '.obbbbbbbbo.',
    '.obwkbbwkbo.',
    'obbbbbbbbbbo',
    'obbbokkobbbo',
    'obbbbbbbbbbo',
    '.obbbbbbbbo.',
    '.obdobbodbo.',
    '..obo.obbo..',
    '..obo..obo..',
    '...o....o...',
  ]},
  miniblob: { p: { b: '#a86ae8' }, g: [
    '..oooo..',
    '.obbbbo.',
    'obkbbkbo',
    'obbbbbbo',
    'obbkkbbo',
    '.obbbbo.',
    '.obobbo.',
    '..o..o..',
  ]},
  spyder: { p: { k: '#3a3450', r: '#ff4d6d' }, g: [
    '.o..o..o..o.',
    '..o.o..o.o..',
    '...oooooo...',
    '..okkkkkko..',
    '.okrkkkkrko.',
    '..okkkkkko..',
    '...okokko...',
    '...oooooo...',
    '..o.o..o.o..',
    '.o..o..o..o.',
    '............',
    '............',
  ]},
  ransom: { p: { y: '#f0b541', d: '#c28024' }, g: [
    '...oooooo...',
    '..oo....oo..',
    '..o......o..',
    '..o......o..',
    '.oooooooooo.',
    '.oyyyyyyyydo',
    '.oykyyyykydo',
    '.oyyyyyyyydo',
    '.oyyokkoyydo',
    '.oyyyokyyydo',
    '.oyyyyyyyydo',
    '.oooooooooo.',
  ]},
  phish: { p: { b: '#4fc4e8', d: '#2f8cb3', s: '#c8d0dd' }, g: [
    '........os..',
    '........oso.',
    '....ooooosо.'.replace('о','o'),
    '..oobbbbo.o.',
    '.obwkbbbbo..',
    'obbbbbbbbbo.',
    'obbbbbbbdboo',
    '.obbbbbbdbdo',
    '..oobbbbooo.',
    '....oooo.о..'.replace('о','.'),
    '............',
    '............',
  ]},
  drone: { p: { s: '#9a97b0', b: '#a8e4f7', g: '#5fae5f' }, g: [
    '....oooo....',
    '...obbbbo...',
    '..obbwbbbo..',
    '.oossssssoo.',
    'osssssssssso',
    'osgssggssgso',
    '.oossssssoo.',
    '...o.oo.o...',
    '..o......o..',
    '............',
    '............',
    '............',
  ]},
  adware: { p: { a: '#ff8a3d', c: '#ffd93d', k: '#3a3450' }, g: [
    'oooooooo..c.',
    'oaaaaaao.c..',
    'oakaakao..c.',
    'oaaaaaao.c.c',
    'oaokkoao..c.',
    'oaokkoao.c..',
    'oaaaaaao..c.',
    'oooooooo.c..',
    '..oo.oo.....',
    '..oo.oo.....',
    '............',
    '............',
  ]},
  miner: { p: { s: '#6f6c88', y: '#ffd93d', h: '#a06a3c', m: '#c8d0dd' }, g: [
    '.........mm.',
    '....oooo.omm',
    '...ossssooh.',
    '..ossssssoh.',
    '..osykysoho.',
    '..osssssoh..',
    '...ossssoh..',
    '..ossssoho..',
    '..osssso.o..',
    '...oooo.....',
    '....o..o....',
    '............',
  ]},
  captcha: { p: { k: '#3a3450', r: '#e6482e', y: '#ffd93d', g: '#5fae5f' }, g: [
    '...oooooooo...',
    '...okkkkkko...',
    '..ookorrokoo..',
    '.okokorrokoko.',
    '.oko.kkkk.oko.',
    '.oo.okoyyoko..'.replace('.o','.o'),
    '....okoyyoko..',
    '....okkkkkko..',
    '....okoggoko..',
    '....okoggoko..',
    '....okkkkkko..',
    '....oooooooo..',
    '.....oo..oo...',
    '.....oo..oo...',
  ]},
  bsod: { p: { b: '#2f6ff2', l: '#6f9ff7' }, g: [
    '.oooooooooooo.',
    '.obbbbbbbbbbo.',
    '.oblbbbbbblbo.',
    '.obkbbbbbbkbo.',
    '.obkbbbbbbkbo.',
    '.obbbbbbbbbbo.',
    '.obbokkkkobbo.',
    '.obokbbbbkobo.',
    '.obbbbbbbbbbo.',
    '.obwwbwwwbbbo.',
    '.obwwwbwbbbbo.',
    '.oooooooooooo.',
    '....oo..oo....',
    '....oo..oo....',
  ]},
  spamking: { p: { b: '#2f6ff2', y: '#ffd93d', s: '#c8d0dd', r: '#e6482e' }, g: [
    '..y..y.y..y...',
    '..yyyyyyyyy...',
    '..oyyryryyo...',
    '.ooooooooooo..',
    '.osssssssssо..'.replace('о','o'),
    '.obbbbbbbbbo..',
    '.obkbbbbkbbo..',
    '.obbbbbbbbbo..',
    '.oyyyyyyyyyo..',
    '.obbokkobbbo..',
    '.obbbbbbbbbo..',
    '.osssssssssо..'.replace('о','o'),
    '.ooooooooooo..',
    '...oo...oo....',
  ]},
};

/* ============================================================
   ABILITY ICONS (batch) — colored silhouettes; the renderer's
   auto-outline gives each a uniform black border.
   ============================================================ */
Object.assign(ICONS, {
  hammer2: { p: { s: '#9aa2ab', S: '#5f6d70', h: '#a06a3c' }, g: [
    '...ssss...','..sSssSs..','..ssssss..','...ssss...','....hh....','....hh....','....hh....','....hh....','....hh....','..........',
  ]},
  fireball: { p: { y: '#e6c84d', o: '#d98a3a', r: '#e0655e', R: '#8f3228' }, g: [
    '....y.....','...yoy....','..orRro...','.orRRRro..','.rRRyRRr..','.rRRRRRr..','..rRRRr...','...rrr....','..r.r.r...','..........',
  ]},
  iceshard: { p: { b: '#4a9fd4', B: '#2f6a94', w: '#e6f4ff' }, g: [
    '....b.....','...bBb....','..bBBBb...','.bBwwBBb..','.bBBBBBb..','..bBBBb...','...bBb....','....b.....','..........','..........',
  ]},
  bolt2: { p: { y: '#e6c84d', o: '#d98a3a' }, g: [
    '....yy....','...yy.....','..yy......','.yyyyy....','...yyo....','..yy......','.yy.......','yy........','..........','..........',
  ]},
  meteor: { p: { S: '#5f6d70', s: '#9aa2ab', o: '#d98a3a', y: '#e6c84d' }, g: [
    '........oy','.......oo.','......yo..','..SSS.o...','.SssSSo...','.SssssS...','.SSssSS...','..SSSS....','...SS.....','..........',
  ]},
  dagger: { p: { s: '#c8d0dd', S: '#5f6d70', h: '#a06a3c' }, g: [
    '.......ss.','......ss..','.....ss...','....sS....','...ss.....','..hsh.....','.hhh......','.hh.......','.h........','..........',
  ]},
  crossblade: { p: { s: '#c8d0dd', S: '#5f6d70' }, g: [
    's........s','.s......s.','..s....s..','...s..s...','....ss....','...s..s...','..s....s..','.s......s.','s........s','..........',
  ]},
  boot2: { p: { h: '#a06a3c', S: '#5f6d70' }, g: [
    '..........','..hh......','..hh......','..hh......','..hhhhh...','..hhhhhh..','..hhhhhh..','.SSSSSSSS.','.SSSSSSSS.','..........',
  ]},
  fang: { p: { w: '#f2f4f4' }, g: [
    '.wwwwww...','.wwwwww...','.wwwwww...','..wwww....','..wwww....','...ww.....','...ww.....','....w.....','..........','..........',
  ]},
  laser2: { p: { r: '#e0655e', R: '#8f3228' }, g: [
    '..........','..r.......','.rRr......','rrrrrrrrrr','.rRr......','..r.......','..........','..........','..........','..........',
  ]},
  halo2: { p: { y: '#d9b45f', Y: '#e6c84d' }, g: [
    '..yyyy....','.yYYYYy...','yY....Yy..','yY....Yy..','yY....Yy..','.yYYYYy...','..yyyy....','..........','..........','..........',
  ]},
  shout: { p: { w: '#f2f4f4', k: '#26203a', s: '#9aa2ab' }, g: [
    '..kk......','.kwwk..s..','kwwwwk.s.s','kwwwwk..s.','kwwwwk.s.s','.kwwk..s..','..kk......','..........','..........','..........',
  ]},
  skullmagic: { p: { p: '#8676a4', P: '#5f4f7a', k: '#26203a' }, g: [
    '..pppp....','.pPPPPp...','pPpppPPp..','pPkPPkPp..','pPPPPPPp..','pPpPPpPp..','.pPPPPp...','..p..p....','..........','..........',
  ]},
  shield2: { p: { b: '#4a9fd4', B: '#2f6a94' }, g: [
    '.bbbbbbb..','.bBBBBBb..','.bBBBBBb..','.bBBBBBb..','.bBBBBBb..','..bBBBb...','...bBb....','....b.....','..........','..........',
  ]},
  lips: { p: { p: '#e070ac', R: '#a83a5a' }, g: [
    '..........','.pp....pp.','pRRppppRRp','pRRRRRRRRp','.pRRRRRRp.','..pRRRRp..','...pppp...','..........','..........','..........',
  ]},
  fist2: { p: { f: '#f2b988', d: '#d99559' }, g: [
    '..........','.ffff.....','ffffff....','fdffdf....','ffffff....','fffffff...','ffffff....','.fffff....','..........','..........',
  ]},
  scope: { p: { k: '#26203a', r: '#e0655e' }, g: [
    '....k.....','..kkkkk...','.k.rrr.k..','k.r...r.k.','k.r.k.r.k.','k.r...r.k.','.k.rrr.k..','..kkkkk...','....k.....','..........',
  ]},
  snowflake: { p: { b: '#4a9fd4', w: '#e6f4ff' }, g: [
    '....b.....','..b.b.b...','...bwb....','bbbwwwbbb.','...bwb....','..b.b.b...','....b.....','..........','..........','..........',
  ]},
  flames: { p: { r: '#e0655e', o: '#d98a3a', Y: '#e6c84d' }, g: [
    '..r.r.r...','.rroorr...','roooooor..','roYYYYor..','roYYYYor..','.rooooor..','..rrrrr...','..........','..........','..........',
  ]},
  cloud2: { p: { g: '#57b18d', G: '#3a7d5f' }, g: [
    '...ggg....','..ggggg...','.ggGgggg..','gggggggGg.','.gGgggGg..','..g.g.g...','.g.g.g.g..','..........','..........','..........',
  ]},
  plus2: { p: { g: '#57b18d', G: '#3a7d5f' }, g: [
    '...gg.....','...gg.....','...gg.....','gggggggg..','ggggGggg..','...gg.....','...gg.....','...gg.....','..........','..........',
  ]},
  flag: { p: { r: '#e0655e', h: '#a06a3c' }, g: [
    '.hrrrrrr..','.hrrrrr...','.hrrrr....','.hrrrrr...','.hrrrrrr..','.h........','.h........','.h........','.hh.......','..........',
  ]},
  wall: { p: { s: '#9aa2ab', S: '#5f6d70' }, g: [
    'ssssssss..','sSsSsSsS..','ssssssss..','SsSsSsSs..','ssssssss..','sSsSsSsS..','ssssssss..','SsSsSsSs..','..........','..........',
  ]},
  star2: { p: { y: '#d9b45f', Y: '#e6c84d' }, g: [
    '....y.....','....y.....','...yYy....','yyyYYYyyy.','.yYYYYYy..','..yYYYy...','..yY.Yy...','.yy...yy..','..........','..........',
  ]},
  burst: { p: { y: '#d9b45f', Y: '#e6c84d', w: '#f2f4f4' }, g: [
    '..y.y.y...','y.yYYYy.y.','.yYYYYYy..','yYYwwwYYy.','yYYwwwYYy.','.yYYYYYy..','y.yYYYy.y.','..y.y.y...','..........','..........',
  ]},
  quake: { p: { s: '#9aa2ab', S: '#5f6d70', o: '#d98a3a' }, g: [
    '...o..o...','..o.oo.o..','..........','ssssssss..','sSsSsSsS..','ss.sss.s..','s.sSs.sS..','ss..sss...','sSs..sSs..','..........',
  ]},
  vampfang: { p: { w: '#f2f4f4', r: '#e0655e' }, g: [
    '.wwww.....','.wwww.....','.wwww.....','..ww......','..ww......','...w......','...r......','..rr......','...r......','..........',
  ]},
  megafist: { p: { f: '#f2b988', d: '#d99559', y: '#d9b45f' }, g: [
    'y....y....','.y.ffff...','..ffffff..','y.fdffdf..','..ffffff.y','..fffffff.','..ffffff..','y.fffff.y.','.y......y.','..........',
  ]},
  book: { p: { r: '#e0655e', c: '#f5efdf', d: '#b53222' }, g: [
    '.oooooooo.','.orrrrrro.','.orcccdro.','.orcccdro.','.orcccdro.','.orcccdro.','.orcccdro.','.orrrrrro.','.oooooooo.','..........',
  ]},
  gear: { p: { s: '#9aa2ab', S: '#5f6d70' }, g: [
    '...s..s...','.s.ssss.s.','.ssSSSSss.','ssSSooSSss','..So..oS..','..So..oS..','ssSSooSSss','.ssSSSSss.','.s.ssss.s.','...s..s...',
  ]},
  usbport: { p: { k: '#26203a', s: '#5f6d70' }, g: [
    '..........','oooooooooo','osssssssso','oskkkkkkso','osssssssso','oooooooooo','..o....o..','..o....o..','..........','..........',
  ]},
});

/* ============================================================
   FULL-BODY MEME SPRITES (brainrot types) — the `face` gene
   with full:true draws one of these instead of the generic body.
   ============================================================ */
const MEME_FULL = {
  // Nyan Cat — pop-tart body, grey cat head, rainbow trail
  nyan: { p: { r: '#e05a54', a: '#e0902f', y: '#e6c84d', g: '#5fae5f', b: '#4a9fd4', v: '#8a76a8',
               T: '#f2a6cf', k: '#c98b52', s: '#4ab6d4', G: '#c9cfd6', o: '#26203a', c: '#f28fb0' }, g: [
    '........GG..GG....',
    '.......GGGGGGGG...',
    '.......GoGGGGoG...',
    '.......GGGGGGGG...',
    '.......GcGooGcG...',
    '.......GGGGGGGG...',
    'r.....kkkkkkkkkk..',
    'a.....kTsTTTTsTTk.',
    'y.....kTTTsTTTTTk.',
    'g.....kTTTTTsTTTk.',
    'b.....kTsTTTTTTTk.',
    'v.....kkkkkkkkkk..',
    '.......G......G...',
    '.......G......G...',
  ]},
  // Tung Tung Tung Sahur — wooden club guy
  tung: { p: { W: '#b5844d', D: '#8a5f30', o: '#26203a' }, g: [
    '.......WWWW.....',
    '......WWWWWW....',
    '......WoWWoW....',
    '......WWWWWW....',
    '......WooooW....',
    '......WWWWWW....',
    '..oo..WWDWWW.oo.',
    '.o....WWWDWW...o',
    '......WWDWWW....',
    '......WWWWWW....',
    '......WDWWWW....',
    '......WWWWDW....',
    '......WWWWWW....',
    '......WDWWWW....',
    '......WWWWWW....',
    '......WWWWDW....',
    '......WWWWWW....',
    '......oo..oo....',
    '......oo..oo....',
  ]},
  // Tralalero Tralala — blue shark with three sneakers
  shark: { p: { B: '#4a86c8', D: '#2f5f9c', w: '#ffffff', o: '#26203a', s: '#e6e6ee' }, g: [
    '.........D.......',
    '........DD.......',
    '.......DDDB......',
    '......BBBBBB.....',
    '.....BBBBBBBB....',
    '....BBoBBBBoBB...',
    '....BBBBBBBBBB...',
    '....BwwwwwwwwB...',
    '....BwoooooowB...',
    '....BBBBBBBBBB...',
    '...BBBBBBBBBBBB..',
    '...BBBBBBBBBBBB..',
    '...BBBBBBBBBBBB..',
    '....BBBBBBBBBB...',
    '.....BB.BB.BB....',
    '.....BB.BB.BB....',
    '.....ss.ss.ss....',
    '....sssssssss....',
  ]},
  // Cappuccino Assassino — coffee cup ninja
  capp: { p: { R: '#c94a3a', F: '#e8d8b0', C: '#8a5a34', w: '#b7b0a0', W: '#f2efe6', o: '#26203a' }, g: [
    '...RRRRRRRR.....',
    '...FFFFFFFF.....',
    '..FFFCCCCFFF....',
    '..wwwwwwwwww....',
    '..woWWWWWWow....',
    '..wWWWWWWWWw.ww.',
    '..wWWooooWWw.wow',
    '..wWWWWWWWWw.ww.',
    '..wWWWWWWWWw....',
    '..wWWWWWWWWw....',
    '...wWWWWWWw.....',
    '...wWWWWWWw.....',
    '....wwwwww......',
    '.....wwww.......',
  ]},
  // Bombardiro Crocodilo — crocodile-bomber plane
  croco: { p: { G: '#6f8a5a', D: '#4f6540', g: '#8a939a', o: '#26203a', w: '#ffffff' }, g: [
    '.........GG.......',
    '........GGGG......',
    '........GoGoG.....',
    '.......GGGGGGG....',
    '.......GwwwwwG....',
    'g......GGGGGGG....g',
    'gg....gGGGGGGGg..gg',
    'gggggggGGGGGGgggggg',
    'gggggggGGGDGGgggggg',
    'gg....gGGGGGGGg..gg',
    'g......gggGgggg...g',
    '.......ggGGGgg....',
    '........gGGGg.....',
    '........gg.gg.....',
  ]},
};

/* ============================================================
   PROCEDURAL MEME PIXEL RENDERER
   ============================================================ */
const Sprite = {
  INK: '#26203a',
  W: 24, H: 26,
  _cache: new Map(),

  /* ---------- small color helpers ---------- */
  _hex(c) {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  },
  mix(a, b, t) {
    const A = this._hex(a), B = this._hex(b);
    const m = A.map((v, i) => Math.round(v + (B[i] - v) * t));
    return `rgb(${m[0]},${m[1]},${m[2]})`;
  },
  lighten(c, t = 0.35) { return this.mix(c, '#ffffff', t); },
  darken(c, t = 0.3) { return this.mix(c, '#26203a', t); },

  // deterministic tiny rng from a string (deep-fried noise etc.)
  _seeded(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => {
      h = Math.imul(h ^ (h >>> 15), 2246822519);
      h = Math.imul(h ^ (h >>> 13), 3266489917);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  },

  /* ------------------------------------------------------------
     Main entry — returns an <img> HTML string (pixel canvas)
     opts: { equip: bool, stage: 'baby'|'adult'|'elder', size: px }
     ------------------------------------------------------------ */
  memeSVG(meme, opts = {}) {
    const stage = opts.stage || (typeof Genetics !== 'undefined' ? Genetics.stage(meme) : 'adult');
    const zombie = meme.traits && meme.traits.includes('zombie');
    const equip = opts.equip !== false ? (meme.equip || {}) : {};
    const key = JSON.stringify([meme.pheno, stage, zombie, equip.hat, equip.held, meme.id.slice(-4)]);
    let url = this._cache.get(key);
    if (!url) {
      url = this._render(meme, stage, zombie, equip);
      this._cache.set(key, url);
      if (this._cache.size > 400) this._cache.delete(this._cache.keys().next().value);
    }
    const size = opts.size || 72;
    return `<img class="px meme-px" src="${url}" style="width:${size}px" alt="" draggable="false">`;
  },

  _render(meme, stage, zombie, equip) {
    const p = meme.pheno;
    if (DATA.GENES.face.alleles[p.face] && DATA.GENES.face.alleles[p.face].full) {
      return this._renderFull(p, stage, zombie, equip);
    }
    const hue = DATA.GENES.hue.alleles[p.hue];
    const W = this.W, H = this.H;
    const px = new Array(W * H).fill(null);   // color strings
    const body = new Set();                    // body-mask indices
    const idx = (x, y) => y * W + x;
    const inB = (x, y) => x >= 0 && x < W && y >= 0 && y < H;
    const set = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (inB(x, y)) px[idx(x, y)] = c; };
    const addBody = (x, y) => { x = Math.round(x); y = Math.round(y); if (inB(x, y)) body.add(idx(x, y)); };
    const ellipse = (cx, cy, rx, ry, fn) => {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          const dx = (x - cx) / rx, dy = (y - cy) / ry;
          if (dx * dx + dy * dy <= 1) fn(x, y);
        }
    };
    const rng = this._seeded(meme.id);

    /* ---- 1. body mask ---- */
    const isGhost = p.face === 'ghost';
    let bodyTop = 8;
    if (isGhost) {
      ellipse(11.5, 12, 7.5, 5, addBody);
      for (let y = 12; y <= 20; y++) for (let x = 4; x <= 19; x++) addBody(x, y);
      // wavy hem
      for (let x = 4; x <= 19; x++) if ((x - 4) % 4 < 2) addBody(x, 21);
    } else {
      switch (p.body) {
        case 'round': ellipse(11.5, 15, 7.6, 7.6, addBody); bodyTop = 8; break;
        case 'blob':
          ellipse(11.5, 13.5, 7, 5.5, addBody);
          ellipse(11.5, 17, 8.2, 5.6, addBody); bodyTop = 8; break;
        case 'bean':
          ellipse(13, 13, 6, 5.2, addBody);
          ellipse(10.5, 17.5, 7, 5.4, addBody); bodyTop = 8; break;
        case 'square':
          for (let y = 9; y <= 22; y++) for (let x = 5; x <= 18; x++) {
            const corner = (x <= 6 || x >= 17) && (y <= 10 || y >= 21);
            if (!corner) addBody(x, y);
          }
          bodyTop = 9; break;
        case 'tall': ellipse(11.5, 14.5, 5.8, 9, addBody); bodyTop = 6; break;
        case 'star': {
          // chunky 5-point star
          const S = [
            '.......xx.......',
            '......xxxx......',
            '......xxxx......',
            '.....xxxxxx.....',
            'xxxxxxxxxxxxxxxx',
            '.xxxxxxxxxxxxxx.',
            '..xxxxxxxxxxxx..',
            '...xxxxxxxxxx...',
            '...xxxxxxxxxx...',
            '..xxxxxxxxxxxx..',
            '..xxxxx..xxxxx..',
            '.xxxx......xxxx.',
            '.xxx........xxx.',
          ];
          S.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === 'x') addBody(x + 4, y + 7); });
          bodyTop = 7; break;
        }
        default: ellipse(11.5, 15, 7.6, 7.6, addBody);
      }
    }

    /* ---- 2. ears / bumps (part of silhouette) ---- */
    if (!isGhost) {
      if (p.face === 'doge') {
        for (let i = 0; i < 4; i++) for (let x = 0; x <= i; x++) { addBody(6 + x, bodyTop - 4 + i); addBody(17 - x, bodyTop - 4 + i); }
      } else if (p.face === 'catto') {
        for (let i = 0; i < 5; i++) for (let x = 0; x <= Math.min(i, 2); x++) { addBody(6 + x, bodyTop - 5 + i); addBody(17 - x, bodyTop - 5 + i); }
      } else if (p.face === 'frog') {
        ellipse(7.5, bodyTop - 1.5, 3, 3, addBody);
        ellipse(16.5, bodyTop - 1.5, 3, 3, addBody);
      }
    }

    /* ---- 3. feet ---- */
    const bodyBottom = isGhost ? 21 : 22;
    if (!isGhost) {
      for (let x = 7; x <= 9; x++) { addBody(x, bodyBottom + 1); }
      for (let x = 14; x <= 16; x++) { addBody(x, bodyBottom + 1); }
    }

    /* ---- 4. fill body with color ---- */
    const RAINBOW = ['#ff6ba9', '#ffd93d', '#5fd07f', '#4fc4e8', '#a86ae8'];
    let ys = H, ye = 0;
    for (const i of body) { const y = Math.floor(i / W); ys = Math.min(ys, y); ye = Math.max(ye, y); }
    for (const i of body) {
      const x = i % W, y = Math.floor(i / W);
      let c;
      if (p.hue === 'rainbow') {
        c = RAINBOW[Math.floor((y - ys) / Math.max(1, ye - ys + 1) * RAINBOW.length)];
      } else if (p.hue === 'deepfried') {
        c = rng() < 0.28 ? '#ff6a3d' : (rng() < 0.12 ? '#ffd93d' : '#b3372a');
      } else {
        const t = (y - ys) / Math.max(1, ye - ys);
        c = t < 0.34 ? hue.c1 : (t < 0.45 && (x + y) % 2 === 0 ? hue.c1 : hue.c2);
      }
      px[i] = c;
    }

    /* ---- 5. pattern overlay (only on body pixels) ---- */
    const onBody = (x, y, c) => { if (inB(x, y) && body.has(idx(x, y))) px[idx(x, y)] = c; };
    const dk = this.darken(hue.c2, 0.32);
    if (p.pattern === 'spots') {
      for (const [sx, sy] of [[7, 18], [15, 20], [16, 13], [6, 13]]) {
        onBody(sx, sy, dk); onBody(sx + 1, sy, dk); onBody(sx, sy + 1, dk); onBody(sx + 1, sy + 1, dk);
      }
    } else if (p.pattern === 'stripes') {
      for (let x = 4; x <= 19; x++) { onBody(x, 18, dk); onBody(x, 19, dk); onBody(x, 21, dk); }
    } else if (p.pattern === 'belly') {
      ellipse(11.5, 19, 4, 3.2, (x, y) => onBody(x, y, this.lighten(hue.c1, 0.55)));
    } else if (p.pattern === 'sparkle') {
      for (const [sx, sy] of [[7, 17], [15, 19], [16, 12]]) {
        onBody(sx, sy, '#ffffff'); onBody(sx - 1, sy, '#ffffff'); onBody(sx + 1, sy, '#ffffff');
        onBody(sx, sy - 1, '#ffffff'); onBody(sx, sy + 1, '#ffffff');
      }
    }

    /* ---- 6. catto inner-ear pink ---- */
    if (p.face === 'catto' && !isGhost) {
      set(7, bodyTop - 3, '#ff9ec4'); set(16, bodyTop - 3, '#ff9ec4');
      set(7, bodyTop - 2, '#ff9ec4'); set(16, bodyTop - 2, '#ff9ec4');
    }

    /* ---- 7. outline the silhouette ---- */
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (px[idx(x, y)]) continue;
      const near = (inB(x + 1, y) && body.has(idx(x + 1, y))) || (inB(x - 1, y) && body.has(idx(x - 1, y)))
        || (inB(x, y + 1) && body.has(idx(x, y + 1))) || (inB(x, y - 1) && body.has(idx(x, y - 1)));
      if (near) px[idx(x, y)] = this.INK;
    }

    /* ---- 8. face ---- */
    const I = this.INK;
    const eyeY = p.face === 'frog' ? bodyTop - 2 : (p.body === 'tall' ? 11 : 12);
    const lx = p.face === 'frog' ? 7 : 8, rx = p.face === 'frog' ? 16 : 15;
    const mouthY = p.face === 'doge' ? 17 : 16;

    // face base
    if (p.face === 'doge') {
      ellipse(11.5, 15.5, 3.6, 2.8, (x, y) => onBody(x, y, this.lighten(hue.c1, 0.5)));
      set(11, 14, I); set(12, 14, I);
    } else if (p.face === 'catto') {
      set(11, 14, '#ff9ec4'); set(12, 14, '#ff9ec4'); set(11, 15, I); set(12, 15, I);
      set(4, 14, I); set(5, 14, I); set(18, 14, I); set(19, 14, I); // whiskers
    } else if (p.face === 'stonks') {
      const line = [[6, 20], [7, 20], [8, 19], [9, 19], [10, 18], [11, 19], [12, 18], [13, 17], [14, 17], [15, 16]];
      for (const [x, y] of line) onBody(x, y, '#3ddc65');
      onBody(16, 15, '#3ddc65'); onBody(16, 16, '#3ddc65'); onBody(15, 15, '#3ddc65');
    } else if (p.face === 'chad') {
      for (const [x, y] of [[8, 19], [9, 20], [10, 20], [11, 20], [12, 20], [13, 20], [14, 19]]) onBody(x, y, dk);
      for (let x = 8; x <= 15; x++) onBody(x, bodyTop + 1, dk); // strong brow line
    }

    // eyes
    const eye = (cx) => {
      switch (p.eyes) {
        case 'normal':
          set(cx, eyeY, '#fff'); set(cx + 1, eyeY, '#fff'); set(cx, eyeY + 1, '#fff'); set(cx + 1, eyeY + 1, I);
          break;
        case 'derp': {
          const off = cx === lx ? -1 : 1;
          set(cx, eyeY + (off > 0 ? 1 : 0), '#fff'); set(cx + 1, eyeY + (off > 0 ? 1 : 0), '#fff');
          set(cx + (off > 0 ? 1 : 0), eyeY + (off > 0 ? 2 : 1), I);
          set(cx + (off > 0 ? 0 : 1), eyeY + (off > 0 ? 1 : 0), I);
          break;
        }
        case 'angry':
          set(cx, eyeY, '#fff'); set(cx + 1, eyeY + 1, I); set(cx, eyeY + 1, '#fff'); set(cx + 1, eyeY, '#fff');
          set(cx + (cx === lx ? -1 : 2), eyeY - 2, I); set(cx + (cx === lx ? 0 : 1), eyeY - 1, I);
          break;
        case 'tired':
          set(cx, eyeY, I); set(cx + 1, eyeY, I);
          set(cx, eyeY + 2, this.darken(hue.c2, 0.2)); set(cx + 1, eyeY + 2, this.darken(hue.c2, 0.2));
          break;
        case 'sparkly':
          for (let dy = 0; dy < 3; dy++) for (let dx = -1; dx < 2; dx++) set(cx + dx, eyeY - 1 + dy, I);
          set(cx - 1, eyeY - 1, '#fff'); set(cx + 1, eyeY + 1, '#fff');
          break;
        case 'laser':
          set(cx, eyeY, '#ff2d2d'); set(cx + 1, eyeY, '#ff2d2d'); set(cx, eyeY + 1, '#ff2d2d'); set(cx + 1, eyeY + 1, '#ff6a6a');
          set(cx - 1, eyeY, '#ff9d9d'); set(cx + 2, eyeY, '#ff9d9d');
          break;
      }
    };
    if (p.eyes === 'mlg') {
      for (let x = lx - 2; x <= rx + 3; x++) set(x, eyeY, I);
      for (let x = lx - 1; x <= lx + 2; x++) { set(x, eyeY + 1, I); }
      for (let x = rx - 1; x <= rx + 2; x++) { set(x, eyeY + 1, I); }
      set(lx, eyeY + 1, '#7ec8ff'); set(rx, eyeY + 1, '#7ec8ff');
    } else { eye(lx); eye(rx); }

    // mouth (troll grin overrides)
    if (p.face === 'troll') {
      for (let x = 7; x <= 16; x++) { set(x, 16, '#fff'); set(x, 17, '#fff'); }
      for (let x = 8; x <= 15; x++) set(x, 18, '#fff');
      for (const x of [9, 11, 13, 15]) { set(x, 16, I); set(x, 17, I); }
      for (let x = 7; x <= 16; x++) set(x, 15, I);
      set(7, 18, I); set(16, 18, I);
      for (let x = 9; x <= 14; x++) set(x, 19, I);
    } else if (stage === 'baby') {
      // pacifier
      set(11, mouthY, '#ff8a3d'); set(12, mouthY, '#ff8a3d');
      set(11, mouthY + 1, '#ff8a3d'); set(12, mouthY + 1, '#ff8a3d');
      set(10, mouthY, I); set(13, mouthY, I); set(11, mouthY - 1, I); set(12, mouthY - 1, I);
    } else {
      switch (p.mouth) {
        case 'smile':
          set(9, mouthY, I); set(10, mouthY + 1, I); set(11, mouthY + 1, I); set(12, mouthY + 1, I); set(13, mouthY + 1, I); set(14, mouthY, I);
          break;
        case 'open':
          set(11, mouthY, I); set(12, mouthY, I); set(11, mouthY + 1, I); set(12, mouthY + 1, I);
          set(11, mouthY + 2, '#ff8fa5'); set(12, mouthY + 2, '#ff8fa5');
          set(10, mouthY, I); set(13, mouthY, I); set(10, mouthY + 1, I); set(13, mouthY + 1, I);
          break;
        case 'tongue':
          set(9, mouthY, I); set(10, mouthY + 1, I); set(11, mouthY + 1, I); set(12, mouthY + 1, I); set(13, mouthY + 1, I); set(14, mouthY, I);
          set(12, mouthY + 2, '#ff8fa5'); set(13, mouthY + 2, '#ff8fa5'); set(12, mouthY + 3, '#ff8fa5');
          break;
        case 'smug':
          set(9, mouthY + 1, I); set(10, mouthY + 1, I); set(11, mouthY, I); set(12, mouthY, I); set(13, mouthY - 1, I); set(14, mouthY - 1, I);
          break;
        case 'flat':
          for (let x = 9; x <= 14; x++) set(x, mouthY, I);
          break;
        case 'fangs':
          set(9, mouthY, I); set(10, mouthY + 1, I); set(11, mouthY + 1, I); set(12, mouthY + 1, I); set(13, mouthY + 1, I); set(14, mouthY, I);
          set(10, mouthY + 2, '#fff'); set(13, mouthY + 2, '#fff');
          break;
      }
    }

    /* ---- 9. extras ---- */
    if (p.extra === 'blush') {
      set(6, 14, '#ff8fa5'); set(7, 14, '#ff8fa5'); set(16, 14, '#ff8fa5'); set(17, 14, '#ff8fa5');
    } else if (p.extra === 'eyebrows') {
      for (let x = lx - 1; x <= lx + 2; x++) set(x, eyeY - 3, I);
      for (let x = rx - 1; x <= rx + 2; x++) set(x, eyeY - 3, I);
    } else if (p.extra === 'tears') {
      set(lx - 1, eyeY + 2, '#7ec8ff'); set(lx - 1, eyeY + 3, '#7ec8ff');
      set(rx + 2, eyeY + 2, '#7ec8ff'); set(rx + 2, eyeY + 3, '#7ec8ff');
    } else if (p.extra === 'mustache') {
      for (let x = 8; x <= 15; x++) set(x, 15, I);
      set(7, 14, I); set(8, 14, I); set(15, 14, I); set(16, 14, I);
    } else if (p.extra === 'halo') {
      for (let x = 9; x <= 14; x++) { set(x, 2, '#ffd93d'); }
      set(8, 3, '#ffd93d'); set(15, 3, '#ffd93d');
      for (let x = 9; x <= 14; x++) set(x, 4, '#f0b541');
    } else if (p.extra === 'horns') {
      set(6, bodyTop - 3, '#ff4d6d'); set(6, bodyTop - 2, '#ff4d6d'); set(7, bodyTop - 1, '#ff4d6d');
      set(17, bodyTop - 3, '#ff4d6d'); set(17, bodyTop - 2, '#ff4d6d'); set(16, bodyTop - 1, '#ff4d6d');
    }

    /* ---- 10. stage / zombie ---- */
    if (stage === 'elder' && p.extra !== 'mustache' && p.face !== 'troll') {
      set(7, mouthY, '#e8e4f2'); set(6, mouthY + 1, '#e8e4f2');
      set(16, mouthY, '#e8e4f2'); set(17, mouthY + 1, '#e8e4f2');
    }
    if (zombie) {
      for (let i = 0; i < W * H; i++) {
        if (px[i] && px[i] !== I && body.has(i)) px[i] = this.mix(px[i].startsWith('#') ? px[i] : hue.c2, '#5fae5f', 0.4);
      }
      set(6, 10, I); set(7, 10, I); set(8, 10, I); set(7, 9, I); set(7, 11, I); // stitch
    }

    /* ---- 11. compose to canvas (+equipment) ---- */
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    if (isGhost) ctx.globalAlpha = 0.9;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = px[idx(x, y)];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;

    if (equip.hat && DATA.ITEMS[equip.hat]) {
      const art = ICONS[DATA.ITEMS[equip.hat].ico];
      if (art) Pixel.drawGridOn(ctx, art.g, art.p, 7, Math.max(0, bodyTop - 9));
    }
    if (equip.held && DATA.ITEMS[equip.held]) {
      const art = ICONS[DATA.ITEMS[equip.held].ico];
      if (art) {
        // draw the held item small at the bottom-right paw
        const tmp = document.createElement('canvas');
        tmp.width = 10; tmp.height = 10;
        Pixel.drawGridOn(tmp.getContext('2d'), art.g, art.p, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tmp, 16, 17, 8, 8);
      }
    }

    Pixel.outline(ctx, this.W, this.H);
    return cv.toDataURL();
  },

  // full-body brainrot sprites (nyan, tung, shark, capp, croco)
  _renderFull(p, stage, zombie, equip) {
    const art = MEME_FULL[p.face] || MEME_FULL.nyan;
    const cv = document.createElement('canvas');
    cv.width = this.W; cv.height = this.H;
    const ctx = cv.getContext('2d');
    let w = 0; for (const row of art.g) w = Math.max(w, row.length);
    const ox = Math.max(0, Math.floor((this.W - w) / 2));
    const oy = Math.max(0, Math.floor((this.H - art.g.length) / 2) + 1);
    Pixel.drawGridOn(ctx, art.g, art.p, ox, oy);

    Pixel.outline(ctx, this.W, this.H);
    if (zombie) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(95,174,95,.32)';
      ctx.fillRect(0, 0, this.W, this.H);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (equip.hat && DATA.ITEMS[equip.hat]) {
      const a = ICONS[DATA.ITEMS[equip.hat].ico];
      if (a) Pixel.drawGridOn(ctx, a.g, a.p, 7, Math.max(0, oy - 6));
    }
    if (equip.held && DATA.ITEMS[equip.held]) {
      const a = ICONS[DATA.ITEMS[equip.held].ico];
      if (a) {
        const tmp = document.createElement('canvas');
        tmp.width = 10; tmp.height = 10;
        Pixel.drawGridOn(tmp.getContext('2d'), a.g, a.p, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tmp, 15, 17, 8, 8);
      }
    }
    return cv.toDataURL();
  },

  /* ------------------------------------------------------------
     Viruses / tomb / egg
     ------------------------------------------------------------ */
  virusSrc(artKey) {
    const def = VIRUS_ART[artKey] || VIRUS_ART.popup;
    return Pixel.urlFromGrid(def.g, def.p);
  },

  virusHTML(virusDef, big = false) {
    const key = virusDef.art || 'popup';
    const size = big || virusDef.boss ? 68 : 52;
    return Pixel.img(this.virusSrc(key), size, 'virus-px');
  },

  TOMB: { p: { s: '#9a97b0', d: '#6f6c88', g: '#5fae5f' }, g: [
    '...oooooo...',
    '..osssssso..',
    '.osssssssso.',
    '.ossooossso.',
    '.osssssssdo.',
    '.ossooossdo.',
    '.ossssssddo.',
    '.osssssdddo.',
    '.ossssssddo.',
    'oooooooooooo',
    'gg.gggg.ggg.',
  ]},
  tombSVG(size = 64) {
    return Pixel.img(Pixel.urlFromGrid(this.TOMB.g, this.TOMB.p), size, 'tomb-px');
  },

  EGG: [
    { p: { c: '#f5efdf', d: '#d8cfba', s: '#c9e8f5' }, g: [
      '....oooo....',
      '...occcco...',
      '..occcccco..',
      '.occcccccdo.',
      '.owccsccado'.replace('a','d'),
      'owwccccccdo.',
      'owcccccccdo.',
      'occccccccddo',
      'occcsccccddo',
      'occcccccdddo',
      '.occcccdddo.',
      '.occccdddo..',
      '..ocddddo...',
      '...oooo.....',
    ]},
    { p: { c: '#f5efdf', d: '#d8cfba', k: '#26203a' }, g: [
      '....oooo....',
      '...occcco...',
      '..occkccco..',
      '.occckcccdo.',
      '.owcckkccdo.',
      'owwcckccccо.'.replace('о','o'),
      'owccckkcccdo',
      'occccckccddo',
      'occccckkcddo',
      'occcccckdddo',
      '.occcccdddo.',
      '.occccdddo..',
      '..ocddddo...',
      '...oooo.....',
    ]},
  ],
  eggHTML(stage = 0, size = 90) {
    const e = this.EGG[Math.min(stage, this.EGG.length - 1)];
    return Pixel.img(Pixel.urlFromGrid(e.g, e.p), size, 'egg-px');
  },

  // legacy helper used by a few call sites
  memeNode(meme, opts) {
    const d = document.createElement('div');
    d.innerHTML = this.memeSVG(meme, opts);
    return d.firstElementChild;
  },
};

/* attach art keys so combat/menus can render any virus def */
for (const k of Object.keys(DATA.VIRUSES)) DATA.VIRUSES[k].art = k;
