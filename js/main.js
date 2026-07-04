/* ============================================================
   MEME-GENICS — main.js
   Boot sequence
   ============================================================ */

window.addEventListener('DOMContentLoaded', () => {
  Tooltip.init();
  Modal.init();
  Shake.init();
  FX.init();

  const hadSave = Game.load();
  if (!hadSave) Game.newGame();

  Game.applyTheme(Game.state.theme || 'green');
  Game.discoverAll();

  Desktop.init();

  if (!Game.state.seenIntro) {
    Desktop.showIntro();
  }

  // 1s tick: incubate eggs + refresh live countdowns in the breeder
  setInterval(() => {
    if (typeof Combat !== 'undefined' && Combat.state && !Combat.state.over) return;
    Game.tickEggs();
    if (Desktop.windows['breeder'] && Game.state.eggs.length) Desktop.refreshWindow('breeder');
  }, 1000);

  // Browsers require a user gesture before audio — start music on first click.
  const kickAudio = () => {
    SFX.ensure();
    if (SFX.musicEnabled) SFX.startMusic();
    document.removeEventListener('pointerdown', kickAudio);
  };
  document.addEventListener('pointerdown', kickAudio);

  // periodic autosave, why not
  setInterval(() => Game.save(), 30000);
});
