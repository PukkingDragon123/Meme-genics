/* ============================================================
   MEME-GENICS — sprites.js
   Procedural SVG memes: every body part comes from a gene,
   so children visibly inherit their parents' looks.
   ============================================================ */

const Sprite = {
  INK: '#2b1b3d',
  _grad: 0,

  lighten(hex, amt = 0.35) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = c => Math.round(c + (255 - c) * amt);
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  },

  /* ------------------------------------------------------------
     Main entry: full meme SVG from genome phenotype
     opts: { equip: bool, elder: bool, baby: bool, zombie: bool }
     ------------------------------------------------------------ */
  memeSVG(meme, opts = {}) {
    const p = meme.pheno;
    const hue = DATA.GENES.hue.alleles[p.hue];
    const gid = 'g' + (this._grad++);
    const I = this.INK;
    const light = this.lighten(hue.c2, 0.5);
    const isGhost = p.face === 'ghost';
    const stage = opts.stage || (typeof Genetics !== 'undefined' ? Genetics.stage(meme) : 'adult');
    const zombie = meme.traits && meme.traits.includes('zombie');

    let defs = '';
    if (p.hue === 'rainbow') {
      defs = `<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ff71ce"/><stop offset=".25" stop-color="#fffb96"/>
        <stop offset=".5" stop-color="#05ffa1"/><stop offset=".75" stop-color="#01cdfe"/>
        <stop offset="1" stop-color="#b967ff"/></linearGradient>`;
    } else {
      defs = `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${hue.c1}"/><stop offset="1" stop-color="${hue.c2}"/></linearGradient>`;
    }

    const fill = `url(#${gid})`;
    const bodyOpacity = isGhost ? '0.88' : '1';

    let svg = `<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">` + `<defs>${defs}</defs>`;
    svg += `<g opacity="${bodyOpacity}">`;

    // shadow
    svg += `<ellipse cx="50" cy="103" rx="26" ry="5" fill="rgba(43,27,61,.25)"/>`;

    // feet (not for ghost)
    if (!isGhost) {
      svg += `<ellipse cx="38" cy="98" rx="8" ry="6" fill="${hue.c2}" stroke="${I}" stroke-width="3"/>
              <ellipse cx="62" cy="98" rx="8" ry="6" fill="${hue.c2}" stroke="${I}" stroke-width="3"/>`;
    }

    // ears / head decorations behind the body
    svg += this.ears(p.face, fill, hue, I);

    // body
    svg += this.body(p.body, fill, I, isGhost);

    // pattern overlay
    svg += this.pattern(p.pattern, hue, I);

    // face-specific base (snout, tie, jaw...)
    svg += this.faceBase(p.face, hue, light, I);

    // eyes / mouth / extra
    svg += this.eyes(p.eyes, p.face, I);
    svg += this.mouth(p.mouth, p.face, I);
    svg += this.extra(p.extra, I);

    if (zombie) svg += `<path d="M30 40 l8 -4 M34 36 l0 8" stroke="#3dab4a" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <rect x="0" y="0" width="100" height="110" fill="#3dab4a" opacity=".13"/>`;

    if (stage === 'elder' && p.extra !== 'mustache') {
      svg += `<path d="M38 66 Q42 74 50 68 Q58 74 62 66" fill="#eee" stroke="${I}" stroke-width="2.5"/>`;
    }
    if (stage === 'baby') {
      svg += `<circle cx="50" cy="66" r="6" fill="#ff9e3d" stroke="${I}" stroke-width="2.5"/>
              <circle cx="50" cy="66" r="2.4" fill="${I}"/>`;
    }

    // equipment (emoji, chunky & goofy)
    if (opts.equip !== false && meme.equip) {
      if (meme.equip.hat) {
        const hat = DATA.ITEMS[meme.equip.hat];
        if (hat) svg += `<text x="50" y="24" font-size="26" text-anchor="middle">${hat.ico}</text>`;
      }
      if (meme.equip.held) {
        const held = DATA.ITEMS[meme.equip.held];
        if (held) svg += `<text x="85" y="82" font-size="20" text-anchor="middle">${held.ico}</text>`;
      }
    }

    svg += `</g></svg>`;
    return svg;
  },

  /* ---------------- body shapes ---------------- */
  body(shape, fill, I, ghost) {
    const sw = `stroke="${I}" stroke-width="3.5"`;
    if (ghost) {
      return `<path d="M22 60 Q22 26 50 26 Q78 26 78 60 L78 88 L70 80 L62 90 L54 80 L46 90 L38 80 L30 90 L22 80 Z" fill="${fill}" ${sw}/>`;
    }
    switch (shape) {
      case 'round':
        return `<ellipse cx="50" cy="62" rx="30" ry="32" fill="${fill}" ${sw}/>`;
      case 'blob':
        return `<path d="M50 28 C72 28 82 44 80 62 C79 80 70 94 50 94 C30 94 21 80 20 62 C18 44 28 28 50 28 Z" fill="${fill}" ${sw}
                transform="rotate(-3 50 60)"/>`;
      case 'bean':
        return `<path d="M38 30 C60 22 78 38 76 60 C74 84 60 96 44 94 C26 92 20 76 26 58 C30 44 28 34 38 30 Z" fill="${fill}" ${sw}/>`;
      case 'square':
        return `<rect x="22" y="32" width="56" height="60" rx="14" fill="${fill}" ${sw}/>`;
      case 'tall':
        return `<ellipse cx="50" cy="58" rx="24" ry="38" fill="${fill}" ${sw}/>`;
      case 'star':
        return `<path d="M50 18 L61 44 L88 46 L67 63 L74 90 L50 76 L26 90 L33 63 L12 46 L39 44 Z" fill="${fill}" ${sw} stroke-linejoin="round"/>`;
      default:
        return `<ellipse cx="50" cy="62" rx="30" ry="32" fill="${fill}" ${sw}/>`;
    }
  },

  /* ---------------- patterns ---------------- */
  pattern(pat, hue, I) {
    const c = 'rgba(43,27,61,.18)';
    switch (pat) {
      case 'spots':
        return `<circle cx="35" cy="72" r="5" fill="${c}"/><circle cx="63" cy="80" r="4" fill="${c}"/>
                <circle cx="70" cy="58" r="3.5" fill="${c}"/><circle cx="30" cy="52" r="3" fill="${c}"/>`;
      case 'stripes':
        return `<path d="M28 76 Q50 84 72 76" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>
                <path d="M30 85 Q50 92 70 85" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      case 'belly':
        return `<ellipse cx="50" cy="78" rx="16" ry="13" fill="rgba(255,255,255,.55)"/>`;
      case 'sparkle':
        return `<text x="30" y="80" font-size="10" opacity=".85">✦</text><text x="62" y="86" font-size="8" opacity=".85">✦</text>
                <text x="68" y="55" font-size="9" opacity=".85">✦</text>`;
      default: return '';
    }
  },

  /* ---------------- ears (behind body) ---------------- */
  ears(face, fill, hue, I) {
    const sw = `stroke="${I}" stroke-width="3.5"`;
    switch (face) {
      case 'doge':
        return `<path d="M28 40 L22 18 L42 32 Z" fill="${fill}" ${sw} stroke-linejoin="round"/>
                <path d="M72 40 L78 18 L58 32 Z" fill="${fill}" ${sw} stroke-linejoin="round"/>`;
      case 'catto':
        return `<path d="M28 42 L24 16 L46 30 Z" fill="${fill}" ${sw} stroke-linejoin="round"/>
                <path d="M72 42 L76 16 L54 30 Z" fill="${fill}" ${sw} stroke-linejoin="round"/>
                <path d="M29 36 L27 24 L39 31 Z" fill="#ffb3d9"/>
                <path d="M71 36 L73 24 L61 31 Z" fill="#ffb3d9"/>`;
      case 'frog':
        return `<circle cx="34" cy="30" r="10" fill="${fill}" ${sw}/>
                <circle cx="66" cy="30" r="10" fill="${fill}" ${sw}/>`;
      default: return '';
    }
  },

  /* ---------------- face base decorations ---------------- */
  faceBase(face, hue, light, I) {
    switch (face) {
      case 'doge':
        return `<ellipse cx="50" cy="60" rx="13" ry="10" fill="${light}" stroke="${I}" stroke-width="2.5"/>
                <ellipse cx="50" cy="56" rx="4.5" ry="3.5" fill="${I}"/>`;
      case 'catto':
        return `<path d="M20 56 L34 58 M20 64 L34 62 M80 56 L66 58 M80 64 L66 62" stroke="${I}" stroke-width="2" stroke-linecap="round"/>
                <path d="M46 58 L50 62 L54 58 Z" fill="#ffb3d9" stroke="${I}" stroke-width="2" stroke-linejoin="round"/>`;
      case 'stonks':
        return `<path d="M44 74 L50 80 L56 74 L53 72 L50 76 L47 72 Z" fill="#3a5cd6" stroke="${I}" stroke-width="2" stroke-linejoin="round"/>
                <path d="M36 88 L48 82 L54 86 L64 78" stroke="#12c94b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                <path d="M64 78 l-6 1 l5 5 Z" fill="#12c94b"/>`;
      case 'chad':
        return `<path d="M34 68 Q38 80 50 80 Q62 80 66 68" fill="none" stroke="${I}" stroke-width="3"/>
                <path d="M30 34 Q50 26 70 34" fill="none" stroke="${I}" stroke-width="3"/>`;
      case 'troll':
        return '';
      default: return '';
    }
  },

  /* ---------------- eyes ---------------- */
  eyes(eyes, face, I) {
    // frogs have eyes up in the bumps
    const y = face === 'frog' ? 30 : 46;
    const lx = face === 'frog' ? 34 : 38, rx = face === 'frog' ? 66 : 62;
    const white = '#fff';
    switch (eyes) {
      case 'normal':
        return `<circle cx="${lx}" cy="${y}" r="6.5" fill="${white}" stroke="${I}" stroke-width="2.5"/>
                <circle cx="${rx}" cy="${y}" r="6.5" fill="${white}" stroke="${I}" stroke-width="2.5"/>
                <circle cx="${lx + 1.5}" cy="${y}" r="2.8" fill="${I}"/><circle cx="${rx + 1.5}" cy="${y}" r="2.8" fill="${I}"/>`;
      case 'derp':
        return `<circle cx="${lx}" cy="${y - 1}" r="7.5" fill="${white}" stroke="${I}" stroke-width="2.5"/>
                <circle cx="${rx}" cy="${y + 1}" r="5.5" fill="${white}" stroke="${I}" stroke-width="2.5"/>
                <circle cx="${lx - 2}" cy="${y - 3}" r="3" fill="${I}"/><circle cx="${rx + 2}" cy="${y + 2.5}" r="2.4" fill="${I}"/>`;
      case 'angry':
        return `<circle cx="${lx}" cy="${y}" r="6" fill="${white}" stroke="${I}" stroke-width="2.5"/>
                <circle cx="${rx}" cy="${y}" r="6" fill="${white}" stroke="${I}" stroke-width="2.5"/>
                <circle cx="${lx + 1.5}" cy="${y + 1}" r="2.6" fill="${I}"/><circle cx="${rx - 1.5}" cy="${y + 1}" r="2.6" fill="${I}"/>
                <path d="M${lx - 7} ${y - 9} L${lx + 6} ${y - 4} M${rx + 7} ${y - 9} L${rx - 6} ${y - 4}" stroke="${I}" stroke-width="3" stroke-linecap="round"/>`;
      case 'tired':
        return `<path d="M${lx - 6} ${y} Q${lx} ${y + 5} ${lx + 6} ${y}" fill="none" stroke="${I}" stroke-width="3" stroke-linecap="round"/>
                <path d="M${rx - 6} ${y} Q${rx} ${y + 5} ${rx + 6} ${y}" fill="none" stroke="${I}" stroke-width="3" stroke-linecap="round"/>
                <path d="M${lx - 5} ${y + 6} Q${lx} ${y + 9} ${lx + 5} ${y + 6}" fill="none" stroke="rgba(43,27,61,.4)" stroke-width="2"/>
                <path d="M${rx - 5} ${y + 6} Q${rx} ${y + 9} ${rx + 5} ${y + 6}" fill="none" stroke="rgba(43,27,61,.4)" stroke-width="2"/>`;
      case 'sparkly':
        return `<circle cx="${lx}" cy="${y}" r="7.5" fill="${I}"/><circle cx="${rx}" cy="${y}" r="7.5" fill="${I}"/>
                <circle cx="${lx - 2.5}" cy="${y - 2.5}" r="2.6" fill="#fff"/><circle cx="${rx - 2.5}" cy="${y - 2.5}" r="2.6" fill="#fff"/>
                <circle cx="${lx + 2.5}" cy="${y + 2.5}" r="1.3" fill="#fff"/><circle cx="${rx + 2.5}" cy="${y + 2.5}" r="1.3" fill="#fff"/>`;
      case 'mlg':
        return `<rect x="${lx - 9}" y="${y - 5}" width="18" height="9" rx="1.5" fill="${I}"/>
                <rect x="${rx - 9}" y="${y - 5}" width="18" height="9" rx="1.5" fill="${I}"/>
                <rect x="${lx + 9}" y="${y - 4}" width="${rx - lx - 18}" height="3" fill="${I}"/>
                <rect x="${lx - 6}" y="${y - 3}" width="5" height="2.5" fill="#7ec8ff"/>
                <rect x="${rx - 6}" y="${y - 3}" width="5" height="2.5" fill="#7ec8ff"/>`;
      case 'laser':
        return `<circle cx="${lx}" cy="${y}" r="6" fill="#ff2d2d"/><circle cx="${rx}" cy="${y}" r="6" fill="#ff2d2d"/>
                <circle cx="${lx}" cy="${y}" r="9" fill="#ff2d2d" opacity=".35"/><circle cx="${rx}" cy="${y}" r="9" fill="#ff2d2d" opacity=".35"/>
                <circle cx="${lx}" cy="${y}" r="2.5" fill="#fff"/><circle cx="${rx}" cy="${y}" r="2.5" fill="#fff"/>`;
      default: return '';
    }
  },

  /* ---------------- mouths ---------------- */
  mouth(mouth, face, I) {
    if (face === 'troll') {
      // the troll grin overrides everything, as is tradition
      return `<path d="M30 62 Q50 78 70 62 Q66 74 50 76 Q34 74 30 62 Z" fill="#fff" stroke="${I}" stroke-width="2.5"/>
              <path d="M36 66 L36 71 M43 69 L43 74 M50 70 L50 75 M57 69 L57 74 M64 66 L64 71" stroke="${I}" stroke-width="1.8"/>`;
    }
    const y = face === 'doge' ? 68 : 64;
    switch (mouth) {
      case 'smile':
        return `<path d="M40 ${y} Q50 ${y + 9} 60 ${y}" fill="none" stroke="${I}" stroke-width="3" stroke-linecap="round"/>`;
      case 'open':
        return `<ellipse cx="50" cy="${y + 4}" rx="7" ry="8" fill="${I}"/>
                <ellipse cx="50" cy="${y + 7}" rx="4" ry="3.5" fill="#ff8fa5"/>`;
      case 'tongue':
        return `<path d="M40 ${y} Q50 ${y + 8} 60 ${y}" fill="none" stroke="${I}" stroke-width="3" stroke-linecap="round"/>
                <path d="M48 ${y + 3} Q50 ${y + 12} 56 ${y + 8} L56 ${y + 3} Z" fill="#ff8fa5" stroke="${I}" stroke-width="2"/>`;
      case 'smug':
        return `<path d="M42 ${y + 3} Q52 ${y + 7} 62 ${y - 2}" fill="none" stroke="${I}" stroke-width="3" stroke-linecap="round"/>`;
      case 'flat':
        return `<path d="M42 ${y + 2} L58 ${y + 2}" stroke="${I}" stroke-width="3" stroke-linecap="round"/>`;
      case 'fangs':
        return `<path d="M40 ${y} Q50 ${y + 8} 60 ${y}" fill="none" stroke="${I}" stroke-width="3" stroke-linecap="round"/>
                <path d="M43 ${y + 1} L45.5 ${y + 7} L48 ${y + 2} Z" fill="#fff" stroke="${I}" stroke-width="1.5"/>
                <path d="M52 ${y + 2} L54.5 ${y + 7} L57 ${y + 1} Z" fill="#fff" stroke="${I}" stroke-width="1.5"/>`;
      default: return '';
    }
  },

  /* ---------------- extras ---------------- */
  extra(extra, I) {
    switch (extra) {
      case 'blush':
        return `<ellipse cx="30" cy="56" rx="5" ry="3" fill="#ff8fa5" opacity=".7"/>
                <ellipse cx="70" cy="56" rx="5" ry="3" fill="#ff8fa5" opacity=".7"/>`;
      case 'eyebrows':
        return `<path d="M31 36 Q38 32 45 36" fill="none" stroke="${I}" stroke-width="4" stroke-linecap="round"/>
                <path d="M55 36 Q62 32 69 36" fill="none" stroke="${I}" stroke-width="4" stroke-linecap="round"/>`;
      case 'tears':
        return `<path d="M32 52 q-3 6 0 8 q4 2 5 -3 q0 -3 -5 -5" fill="#7ec8ff" stroke="${I}" stroke-width="1.5"/>
                <path d="M68 52 q3 6 0 8 q-4 2 -5 -3 q0 -3 5 -5" fill="#7ec8ff" stroke="${I}" stroke-width="1.5"/>`;
      case 'mustache':
        return `<path d="M50 62 Q42 58 36 62 Q32 66 38 66 Q45 66 50 62 Q55 66 62 66 Q68 66 64 62 Q58 58 50 62 Z" fill="${I}"/>`;
      case 'halo':
        return `<ellipse cx="50" cy="12" rx="14" ry="4.5" fill="none" stroke="#ffd700" stroke-width="4"/>`;
      case 'horns':
        return `<path d="M32 26 Q28 16 34 12 Q36 20 40 24 Z" fill="#ff4d6d" stroke="${I}" stroke-width="2.5" stroke-linejoin="round"/>
                <path d="M68 26 Q72 16 66 12 Q64 20 60 24 Z" fill="#ff4d6d" stroke="${I}" stroke-width="2.5" stroke-linejoin="round"/>`;
      default: return '';
    }
  },

  /* ------------------------------------------------------------
     Tiny helpers
     ------------------------------------------------------------ */
  memeNode(meme, opts) {
    const d = document.createElement('div');
    d.innerHTML = this.memeSVG(meme, opts);
    return d.firstElementChild;
  },

  virusHTML(virusDef, big = false) {
    const size = big || virusDef.boss ? 64 : 46;
    return `<span class="u-emoji" style="font-size:${size}px">${virusDef.emoji}</span>`;
  },

  tombSVG() {
    return `<svg viewBox="0 0 100 110"><path d="M28 95 L28 45 Q28 22 50 22 Q72 22 72 45 L72 95 Z"
      fill="#b9b9c9" stroke="#2b1b3d" stroke-width="3.5"/>
      <text x="50" y="55" font-size="20" text-anchor="middle" font-weight="bold" fill="#2b1b3d">F</text>
      <rect x="20" y="93" width="60" height="8" rx="4" fill="#8a8a9d" stroke="#2b1b3d" stroke-width="3"/></svg>`;
  },
};
