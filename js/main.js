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

  Desktop.init();

  if (!Game.state.seenIntro) {
    Desktop.showIntro();
  }

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
