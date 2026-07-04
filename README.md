# MEME-GENICS

**Breed a bloodline of memes. Send them to delete viruses. Lose them. Breed better ones.**

A loving, goofy parody of *Mewgenics* — except instead of cats in a house, you manage **memes
living on a fake desktop OS**, and instead of monsters you fight **evil computer viruses** on a
hex grid. Hand-drawn pixel art, a restrained Balatro-inspired look, no build step, no dependencies,
no asset files — every sprite, icon, sound and particle is generated in the browser. Just open
`index.html`.

![Desktop — memes living on your fake OS](screenshots/desktop.png)

![Battle — hex tactics vs viruses](screenshots/battle.png)

## How to play

```bash
# option 1: just open it
open index.html

# option 2: serve it
python3 -m http.server 8000   # then visit http://localhost:8000
```

## The Mewgenics loop

1. **Pair** — in `Breeder2000.exe`, put two adult memes in the Love Nest.
2. **End Day** — a baby hatches overnight, memes age a day, and a stray might wander in.
   Kids inherit **one allele per gene from each parent** (7 genes: body, color, pattern, snout,
   eyes, mouth, extra), the dominant allele shows, stats blend with a lucky drift, traits pass
   down, and mutations sneak in rare genes (RAINBOW color! LASER eyes! halos! horns!). Breeding
   related memes makes a **Reposted** baby. Ew.
3. **Fight** — `virus_hunter.exe` sends up to 4 memes into hex-grid turn-based tactics against
   Pop-Up Ads, Trojan Ponies, Ransom-Where, Crypto Miners and bosses like the CAPTCHA Golem,
   B.S.O.D. and **THE SPAM KING**.
4. **Retire** — any meme that **survives a hunt is crowned and retires**: it can never fight
   again, only breed. So you *must* keep breeding fresh fighters. This is the heart of the game.
5. **Grieve** — memes age and eventually go stale forever. Memes that die in battle are
   **permanently dead** — unless you burn Copium mid-fight, or pay the Graveyard to **necropost**
   them back as a zombie (once per meme).
6. **Optimize the bloodline** — the memes die; the *genes* are forever. Stack Gigachad + Dank +
   Big Brain across generations and build the perfect super-meme.

## It reveals itself as you play

You start with just **breeding** and the **first hunt**. Win, and the game opens up:

- **MemeBay** — a daily shop of hats (+stats, visible on your meme!), held items and consumables
- **Loot Stash** — hold and equip your gear
- **Graveyard** — necropost fallen legends back as zombies
- **The Cloud** — an endless, ever-scaling virus gauntlet (after you beat the Spam King)

## Combat cheat sheet

| Stat | Does |
|---|---|
| HP | don't let it reach 0 |
| BONK | physical ability damage |
| BRAIN | fancy ability damage & healing |
| ZOOM | turn order + movement range |
| LUCK | crit chance, stun chances, Thoughts & Prayers |

Every meme knows **BONK** plus a signature ability from its snout gene (Doge -> YEET,
Frog -> Touch Grass, Catto -> Nyan Dash, Troll -> Rickroll, Stonks -> STONKS, Chad -> Ban Hammer,
Spooky -> UNO Reverse) plus up to two heritable "spice" abilities — Deep Fry, Copypasta,
Vibe Check, MLG Airhorn, Cheemsburbger, GG EZ and more.

Watch for hazard tiles, loot tiles, knockback yeets, and the CAPTCHA Golem's every-other-round
invulnerability.

## Under the hood

- **Pixel art** — `js/pixel.js` renders tiny character grids to cached canvas data-URLs
  (`image-rendering: pixelated`). Every UI icon, virus and item is a hand-authored grid;
  meme sprites are generated procedurally from each meme's genotype in `js/sprites.js`, so
  children visibly inherit their parents' looks.
- **Balatro-inspired UI** — one small palette used as *information* (blue = info, red = danger,
  gold = money), embossed rounded panels, a felt background, and physical juice.
- **No emoji, no external assets, no build step.** Everything is self-contained.

*A parody. No cats were harmed. Several viruses were.*
