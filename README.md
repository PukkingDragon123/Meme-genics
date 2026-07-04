# MEME-GENICS

**Breed a bloodline of memes. Send them to delete viruses. Lose them. Breed better ones.**

A goofy parody of *Mewgenics* — you raise **memes on a fake desktop OS**, breed them across
generations for stats, and fight **computer viruses** in a **cinematic auto-battler** where your
timing decides the fight. Hand-drawn pixel art, a calm cohesive look, no build step, no
dependencies, no asset files — every sprite, icon, sound and particle is generated in the browser.
Just open `index.html`.

![Desktop — memes (including brainrots) living on your fake OS](screenshots/desktop.png)

![Stage map — a Candy-Crush style roadmap with power ratings](screenshots/stagemap.png)

![Battle — cinematic auto-battler with timing-based QTEs](screenshots/battle.png)

## How to play

```bash
open index.html
# or: python3 -m http.server 8000   →  http://localhost:8000
```

## The loop

1. **Breed** — fuse two adults in `Breeder2000.exe`; tap the egg and a baby hatches on the spot.
   Kids inherit one allele per gene from each parent (the dominant one shows), stats blend with a
   lucky drift, traits pass down, and mutations sneak in rare genes. **Breeding for stronger stats
   is the whole strategy** — every generation should out-power the last.
2. **Grow** — babies grow into fighters after their first battle (or a little time / a few pets).
3. **Fight** — pick a stage on the **map**, deploy up to 4 memes.
4. **Retire** — any meme that survives a fight is crowned and **retires** (breed only), so you must
   keep breeding fresh fighters. Fallen memes are permanently dead (necropost or Copium excepted).

There's no calendar — you play at your own pace, breeding and fighting whenever you like.

## Combat — cinematic auto-battler + skill

Fights play out automatically by **ZOOM** (speed) order — memes **leap** across the arena to clash,
the camera zooms and pans to the action, and hits kick up dust, rings and screen shake. A live
**team tracker** shows your memes' health the whole time. You jump in with skill:

- **STRIKE** — a timing bar on every attack. Nail the sweet spot for bonus damage and crits.
- **PARRY** — tap in the window when a virus attacks to block (a *perfect* parry reflects damage).
- **SPECIAL** — each meme type has a signature move; some are a **MASH** for extra hits.

Higher stats + clean timing = wins. Do nothing and it still auto-resolves — but skill matters.
Each stage shows **your power vs enemy power** and its **rewards** before you commit.

## The memes

Classic types (Doge, Frog, Catto, Troll, Stonks, Chad, Spooky) plus **brainrots** with their own
pixel models and specials: **Nyan Cat**, **Tung Tung Tung Sahur**, **Tralalero Tralala** (the
shark), **Bombardiro Crocodilo**, and **Cappuccino Assassino**. Each type has a combat role and a
signature special (nuke, AoE, multi-hit, heal, buff, debuff or shield).

## Progression

You start with just breeding and the first stage. **MemeBay** (shop), your **Loot Stash**, the
**Graveyard** (necropost), and the endless **Cloud** unlock as you climb the stage map toward the
**Spam King** and beyond.

## Under the hood

- **Pixel art** — `js/pixel.js` renders tiny character grids to cached canvas data-URLs
  (`image-rendering: pixelated`). Meme sprites are generated from each meme's genotype, so children
  visibly inherit their parents' looks; brainrots use hand-drawn full-body sprites.
- **One muted palette, used as information.** Embossed panels, felt background, physical juice.
- **No emoji, no external assets, no build step.** Everything is self-contained.

*A parody. No cats were harmed. Several viruses were.*
